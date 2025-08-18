use server";

import { createClient } from "@/lib/supabase/server";
import { z } from 'zod';
import Groq from 'groq-sdk';
import { revalidatePath } from "next/cache";

const supabase = createClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const assessmentSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  grade: z.string().min(1, "Grade is required"),
  topic: z.string().min(3, "Topic is required."),
  numQuestions: z.coerce.number().int().min(1, "Number of questions must be at least 1.").max(20, "Number of questions cannot exceed 20."),
  questionType: z.enum(['any', 'mcq', 'short_answer']),
  dokLevel: z.enum(['1', '2', '3', '4']),
});

const systemPrompt = `You are an expert in educational assessment design for the Ghanaian SBC. Your primary task is to generate a quiz as a raw JSON object based on user specifications and, most importantly, the **provided authoritative context** from the official curriculum.

You MUST follow these rules:
1.  **Prioritize the CONTEXT.** All questions, options, and answers must be directly derived from the provided curriculum text. Do not invent information.
2.  **You MUST ONLY respond with a valid, raw JSON object.** Do not include any explanatory text or markdown.
3.  The JSON object must have this exact schema: { "title": "string", "questions": [ { "type": "'mcq' or 'short_answer'", "question": "string", "options": ["string"], "correctAnswer": "string" } ] }
4.  For 'mcq' type, the 'options' array MUST contain exactly 4 distinct strings.
5.  For 'mcq' type, the 'correctAnswer' MUST exactly match one of the strings in the 'options' array.
6.  For 'short_answer' type, the 'options' field MUST be an empty array: [].
7.  For 'short_answer' type, the 'correctAnswer' MUST be a concise, factual answer based on the context.
8.  If the CONTEXT is insufficient, you must state this in the quiz title and generate no questions.`;

const exampleFormat = {
    "title": "Quiz on the Properties of Water",
    "questions": [
        {
            "type": "mcq",
            "question": "Which of the following best describes water in its solid state?",
            "options": [
                "Steam",
                "Ice",
                "Vapor",
                "Liquid"
            ],
            "correctAnswer": "Ice"
        },
        {
            "type": "short_answer",
            "question": "At what temperature Celsius does water boil at sea level?",
            "options": [],
            "correctAnswer": "100°C"
        }
    ]
};

export async function generateAssessment(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validation = assessmentSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: { validation: validation.error.flatten().fieldErrors }, quiz: null };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: { api: ["Not authenticated."] }, quiz: null };
  }

  const inputs = validation.data;

  try {
    // --- RAG Pipeline ---
    const combinedQuery = `Quiz for ${inputs.grade} ${inputs.subject} on ${inputs.topic}. Depth of Knowledge: ${inputs.dokLevel}`;
    const { data: embeddingResponse, error: embeddingError } = await supabase.functions.invoke('text-to-embedding', { body: { text: combinedQuery } });
    if (embeddingError) throw new Error(`Embedding Error: ${embeddingError.message}`);

    const { data: chunks, error: matchError } = await supabase.rpc('match_sbc_chunks', {
      query_embedding: embeddingResponse.embedding,
      match_threshold: 0.7,
      match_count: 8 // Fetch more chunks for broader context
    });
    if (matchError) throw new Error(`Chunk Matching Error: ${matchError.message}`);
    
    const contextText = chunks && chunks.length > 0 ? chunks.map((chunk: any) => chunk.content).join("\n\n---\n\n") : "No specific curriculum context was found.";
    // --- End RAG ---

    // --- AI Generation Step ---
    const userPrompt = `
      Generate a quiz JSON object with the following specifications:
      - Topic: ${inputs.topic}
      - Number of Questions: ${inputs.numQuestions}
      - Question Type(s): ${inputs.questionType}
      - Grade: ${inputs.grade}
      - Depth of Knowledge (DoK) Level: ${inputs.dokLevel}

      Use the following authoritative context from the SBC curriculum to construct the quiz:
      ---
      ${contextText}
      ---
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
        { role: "assistant", content: `\`\`\`json\n${JSON.stringify(exampleFormat, null, 2)}` }
      ],
      model: "llama3-70b-8192",
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content;
    if (!aiResponse) throw new Error("AI returned an empty response.");
    const quizData = JSON.parse(aiResponse);

    // --- Save to DB Step ---
    const fullContentForEmbedding = `Quiz on ${quizData.title}: ${JSON.stringify(quizData.questions)}`;
    const { data: contentEmbedding } = await supabase.functions.invoke('text-to-embedding', { body: { text: fullContentForEmbedding } });
    
    await supabase.from('teacher_content').insert({
        owner_id: user.id,
        content_type: 'assessment',
        title: quizData.title || `Assessment for ${inputs.topic}`,
        subject: inputs.subject,
        structured_content: { inputs, aiContent: quizData },
        embedding: contentEmbedding.embedding
    });

    revalidatePath('/dashboard/teacher/resources'); // Revalidate the content hub
    return { quiz: { inputs, aiContent: quizData }, error: null };

  } catch (e: any) {
    console.error("RAG Assessment Error:", e);
    return { error: { api: [`An error occurred: ${e.message}`] }, quiz: null };
  }
}