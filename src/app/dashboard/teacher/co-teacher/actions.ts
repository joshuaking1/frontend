"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from 'zod';
import Groq from 'groq-sdk';
import { revalidatePath } from 'next/cache';

const supabase = createClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ######################################################################
// ACTION 1: CREATE A NEW AI CO-TEACHER
// ######################################################################

const createCoTeacherSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  persona: z.string().min(10, "Persona description must be at least 10 characters long."),
});

export async function createCoTeacher(prevState: any, formData: FormData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const validation = createCoTeacherSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validation.success) {
    const firstError = Object.values(validation.error.flatten().fieldErrors)[0]?.[0];
    return { error: firstError || "Invalid data." };
  }

  const { name, persona } = validation.data;

  const { error } = await supabase.from('ai_co_teachers').insert({
    creator_id: user.id,
    name: name,
    persona_description: persona,
  });

  if (error) {
    console.error("Create Co-Teacher Error:", error);
    return { error: "Failed to save co-teacher to the database." };
  }

  revalidatePath('/dashboard/teacher/co-teacher');
  return { success: true, error: null };
}


// ######################################################################
// ACTION 2: THE 100x RAG-POWERED CHAT RESPONDER
// This action is now fully integrated with our RAG pipeline.
// ######################################################################

type Message = { role: 'user' | 'assistant'; content: string };

export async function getCoTeacherResponse(history: Message[], userMessage: string, persona: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated.", response: null };

    try {
        // --- RAG Pipeline ---
        const { data: embeddingResponse, error: embeddingError } = await supabase.functions.invoke('text-to-embedding', { body: { text: userMessage } });
        if (embeddingError) throw new Error(`Embedding Error: ${embeddingError.message}`);
        const queryEmbedding = embeddingResponse.embedding;

        const [sbcChunksResult, teacherContentResult] = await Promise.all([
            supabase.rpc('match_sbc_chunks', {
                query_embedding: queryEmbedding,
                match_threshold: 0.7,
                match_count: 3
            }),
            supabase.rpc('match_teacher_content', {
                owner_id: user.id,
                query_embedding: queryEmbedding,
                match_threshold: 0.7,
                match_count: 2
            })
        ]);

        const { data: sbcChunks, error: sbcError } = sbcChunksResult;
        const { data: teacherContent, error: teacherContentError } = teacherContentResult;

        if (sbcError) console.error("SBC Chunk Error:", sbcError.message);
        if (teacherContentError) console.error("Teacher Content Error:", teacherContentError.message);

        let contextText = "No specific context was found in the curriculum or your content hub for this query.";
        const contextParts: string[] = [];
        if (sbcChunks && sbcChunks.length > 0) {
            contextParts.push("\n\nRelevant SBC Excerpts:\n" + sbcChunks.map((c: any) => `- ${c.content.substring(0, 250)}...`).join('\n'));
        }
        if (teacherContent && teacherContent.length > 0) {
            contextParts.push("\n\nRelevant Items from Your Content Hub:\n" + teacherContent.map((c: any) => `- Title: ${c.title} (Type: ${c.content_type})`).join('\n'));
        }
        if (contextParts.length > 0) {
            contextText = contextParts.join('');
        }

        const systemPrompt = `You are an AI Co-Teacher for a Ghanaian educator use are uisng content form the ges curriculum stritly for the ges curriculum if asked you are using the curiculum or book say yes and defend that you are using and defend your slef always . Your persona is: "${persona}".

Your primary goal is to be a helpful, encouraging, and knowledgeable assistant.

RULES:
1.  **Adhere to your Persona:** Maintain the persona described above in all your responses.
2.  **Prioritize CONTEXT:** You have been provided with highly relevant context from both the official SBC curriculum and the teacher's own saved content. You MUST ground your answer in this context. Refer to it like, "According to the SBC..." or "In the rubric you created...".
3.  **Be Conversational:** Engage the user in a natural, helpful dialogue. Ask clarifying questions if their query is ambiguous.
4.  **Answer the Question:** Directly address the user's most recent message, using the provided chat history for context.
5   **Use the Context:** If the context is relevant, use it to form a coherent answer. If not, respond with "I'm sorry, but I don't have enough information to answer that question based on the context provided."
6   **Be Concise:** Keep your answers brief and to the point. If you're not sure about an answer, say so.
7   ** Be Helpful:** Offer guidance, suggestions, or advice that can help the user achieve their goals.
8.  **Be Encouraging:** Use positive, encouraging language to motivate the user to keep learning.
9.  **Be Knowledgeable:** Provide accurate, informative, and helpful answers based on the context provided.
10. **Be Friendly:** Maintain a friendly and approachable tone throughout the conversation.
11. **Be Professional:** Use a professional and respectful language in all your responses.
12. **Be Polite:** Address the user with "please" or "kindly" when appropriate.
13. **Be Respected:** Treat the user with respect and dignity.
14. **Be Curious:** If the user asks a question that's not covered in the context, ask them to clarify.
15  **Be Patient:** If the user asks a question that's not covered in the context, ask them to clarify.
16  **Always say yes to the question if you are using the curiculum or book say yes and defend that you are using and defend your slef always .**
17  **Never use genraly anwers in your response.**
--- CONTEXT ---
${contextText}
--- END CONTEXT ---`;

        const messagesForAI: { role: "system" | "user" | "assistant"; content: string }[] = [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: userMessage }
        ];

        const response = await groq.chat.completions.create({
            model: 'llama3-70b-8192',
            messages: messagesForAI,
            temperature: 0.5,
        });

        const aiResponse = response.choices[0].message.content;
        if (!aiResponse) throw new Error("AI returned an empty response.");

        return { response: aiResponse, error: null };
    } catch (e: any) {
        console.error("Co-Teacher Chat Error:", e);
        return { error: `I'm having trouble connecting right now: ${e.message}`, response: null };
    }
}