// src/app/dashboard/teacher/co-teacher/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- CreateCoTeacher Action (no changes needed) ---
const createCoTeacherSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  persona: z.string().min(10, "Persona description is too short."),
});

export async function createCoTeacher(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const validation = createCoTeacherSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validation.success) return { error: "Invalid data." };

  const { name, persona } = validation.data;

  const { error } = await supabase.from('ai_co_teachers').insert({
    creator_id: user.id, name: name, persona_description: persona,
  });

  if (error) return { error: "Failed to save co-teacher." };

  revalidatePath('/dashboard/teacher/co-teacher');
  return { success: true };
}


// --- getChatResponse Action (UPGRADED WITH RAG) ---
type Message = { role: "user" | "assistant", content: string };

export async function getChatResponse(persona: string, history: Message[]) {
    const supabase = await createClient();
    
    // The user's most recent message is the primary query for our RAG search.
    const userQuery = history[history.length - 1].content;

    // --- RAG Step 1: Get Query Embedding ---
    const { data: embeddingResponse, error: embeddingError } = await supabase.functions.invoke('text-to-embedding', {
      body: { text: userQuery },
    });
    if (embeddingError) console.error("RAG Embedding Error:", embeddingError.message);
    const queryEmbedding = embeddingResponse?.embedding;

    // --- RAG Step 2: Match Relevant Chunks ---
    let contextText = "No specific curriculum context was found for this query.";
    if (queryEmbedding) {
        const { data: chunks, error: matchError } = await supabase.rpc('match_sbc_chunks', {
          query_embedding: queryEmbedding,
          match_threshold: 0.7,
          match_count: 3 // Retrieve the top 3 chunks for a focused context
        });

        if (matchError) console.error("RAG Match Error:", matchError.message);

        if (chunks && chunks.length > 0) {
            contextText = chunks.map((chunk: any) => chunk.content).join("\n\n---\n\n");
        }
    }

    // --- RAG Step 3: Generate Response with Context ---
    const systemPrompt = `You are an AI Co-Teacher. Your defined persona is: "${persona}".
    You must always stay in this character.
    You are assisting a Ghanaian teacher. Below is some highly relevant context from the official SBC curriculum that relates to the user's latest message.
    You MUST use this context to inform your response, making you a curriculum expert. If the context is relevant, refer to it. If it says 'No specific context was found', you can answer more generally but still within your persona.

    --- CURRICULUM CONTEXT ---
    ${contextText}
    --- END CONTEXT ---
    `;

    // We send the system prompt (with context) and the full chat history to the AI.
    const messages = [
        { role: 'system', content: systemPrompt },
        ...history
    ];

    try {
        const response = await groq.chat.completions.create({
            model: 'mistral-saba-24b',
            messages: messages,
        });
        return { response: response.choices[0].message.content };
    } catch (e) {
        console.error("Co-Teacher Chat Error:", e);
        return { error: "I'm having trouble connecting right now. Please try again." };
    }
}
