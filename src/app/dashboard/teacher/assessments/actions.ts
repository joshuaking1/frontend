// src/app/dashboard/teacher/assessments/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server"; // Import the Supabase client
import { z } from 'zod';
import Groq from 'groq-sdk';

const assessmentSchema = z.object({
  topic: z.string().min(3, 'Topic is required'),
  numQuestions: z.coerce.number().min(1).max(10),
  dokLevel: z.enum(['1', '2', '3', '4']),
  questionType: z.enum(['mcq', 'short_answer']),
});

export type QuizQuestion = {
    question: string;
    options?: string[];
    correctAnswer: string;
    type: 'mcq' | 'short_answer';
};

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const systemPrompt = `
You are an expert in educational assessment design, specializing in the Ghanaian curriculum.
Your primary task is to generate a quiz as a raw JSON object based on user specifications and, most importantly, the **provided authoritative context** from the official curriculum.

You MUST follow these rules:
1.  **Prioritize the CONTEXT.** All questions, options, and answers must be directly inspired by and aligned with the provided curriculum text. Do not invent information.
2.  **You MUST ONLY respond with a valid, raw JSON object.** Do not include any explanatory text, markdown, or anything before or after the single JSON object.
3.  The JSON object must have this exact schema: { "title": "string", "questions": [{ "type": "'mcq' or 'short_answer'", "question": "string", "options": ["string"], "correctAnswer": "string" }] }
4.  For 'mcq' type, the 'options' array MUST contain 4 distinct strings.
5.  For 'mcq' type, the 'correctAnswer' MUST exactly match one of the strings in the 'options' array.
6.  For 'short_answer' type, the 'options' field MUST be an empty array: [].
7.  For 'short_answer' type, the 'correctAnswer' MUST be a concise, ideal example answer based on the context.
8.  The questions must align with the requested Depth of Knowledge (DoK) level.
`;

export async function generateAssessment(prevState: any, formData: FormData) {
  const validation = assessmentSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validation.success) return { error: validation.error.flatten().fieldErrors };
  
  const inputs = validation.data;

  // Initialize Supabase client inside the function to ensure proper request scope
  const supabase = await createClient();

  try {
    // --- RAG Step 1: Get Query Embedding ---
    const { data: embeddingResponse, error: embeddingError } = await supabase.functions.invoke('text-to-embedding', {
      body: { text: inputs.topic },
    });
    if (embeddingError || !embeddingResponse.embedding) throw new Error(`Failed to get query embedding: ${embeddingError?.message}`);
    const queryEmbedding = embeddingResponse.embedding;

    // --- RAG Step 2: Match Relevant Chunks ---
    const { data: chunks, error: matchError } = await supabase.rpc('match_sbc_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7, // Using a slightly lower threshold for broader context
      match_count: 5
    });
    if (matchError) throw new Error(`Failed to match chunks: ${matchError.message}`);
    if (!chunks || chunks.length === 0) throw new Error("No relevant content found in the curriculum documents for this topic. Please ensure related documents have been ingested.");

    const contextText = chunks.map((chunk: any) => chunk.content).join("\n\n---\n\n");

    // --- RAG Step 3: Generate Response with Context ---
    const userPrompt = `
      User Inputs:
      - Topic: ${inputs.topic}
      - Number of Questions: ${inputs.numQuestions}
      - Question Type: ${inputs.questionType}
      - Depth of Knowledge (DoK) Level: ${inputs.dokLevel}

      Authoritative Context from SBC Documents:
      ---
      ${contextText}
      ---

      Based on the user inputs AND the provided context, generate the quiz JSON object.
    `;

    const response = await groq.chat.completions.create({
      model: 'mistral-saba-24b',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      response_format: { type: "json_object" },
    });

    const jsonContent = response.choices[0].message.content;
    const quizData = JSON.parse(jsonContent);
    
    return { quiz: quizData, error: null };

  } catch (e) {
    console.error("RAG Assessment Error:", e);
    return { error: { api: [e.message] }, quiz: null };
  }
}