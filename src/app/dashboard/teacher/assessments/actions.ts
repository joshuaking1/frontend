// src/app/dashboard/teacher/assessments/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server"; // Import the Supabase client
import { z } from 'zod';
import Groq from 'groq-sdk';

const assessmentSchema = z.object({
  topic: z.string().min(3, 'Topic is required'),
  numQuestions: z.coerce.number().min(1).max(10),
  dokLevels: z.array(z.enum(['1', '2', '3', '4'])).min(1, 'Please select at least one DoK level'),
  questionType: z.enum(['mcq', 'short_answer']),
});

export type QuizQuestion = {
    question: string;
    options?: string[];
    correctAnswer: string;
    type: 'mcq' | 'short_answer';
    dokLevel?: string;
};

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const systemPrompt = `
You are an expert in educational assessment design, specializing in the Ghanaian curriculum.
Your primary task is to generate a quiz as a raw JSON object based on user specifications and, most importantly, the **provided authoritative context** from the official curriculum.

You MUST follow these rules:
1.  **Prioritize the CONTEXT.** All questions, options, and answers must be directly inspired by and aligned with the provided curriculum text. Do not invent information.
2.  **You MUST ONLY respond with a valid, raw JSON object.** Do not include any explanatory text, markdown, or anything before or after the single JSON object.
3.  The JSON object must have this exact schema: { "title": "string", "questions": [{ "type": "'mcq' or 'short_answer'", "question": "string", "options": ["string"], "correctAnswer": "string", "dokLevel": "string" }] }
4.  For 'mcq' type, the 'options' array MUST contain 4 distinct strings.
5.  For 'mcq' type, the 'correctAnswer' MUST exactly match one of the strings in the 'options' array.
6.  For 'short_answer' type, the 'options' field MUST be an empty array: [].
7.  For 'short_answer' type, the 'correctAnswer' MUST be a concise, ideal example answer based on the context.
8.  Each question MUST include a 'dokLevel' field with the specific DoK level number (1, 2, 3, or 4) that the question targets.
9.  The questions must align with the requested Depth of Knowledge (DoK) levels and be distributed across them appropriately.
`;

export async function generateAssessment(prevState: any, formData: FormData) {
  // Handle multiple DoK levels from form data
  const formEntries = Object.fromEntries(formData.entries());
  const dokLevels = formData.getAll('dokLevels');
  
  const formDataWithArrays = {
    ...formEntries,
    dokLevels: dokLevels
  };
  
  const validation = assessmentSchema.safeParse(formDataWithArrays);
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

    const contextText = chunks.map((chunk: unknown) => chunk.content).join("\n\n---\n\n");

    // --- RAG Step 3: Generate Response with Context ---
    const dokLevelsText = inputs.dokLevels.map(level => {
      const descriptions = {
        '1': 'Level 1 (Recall & Recognition)',
        '2': 'Level 2 (Skills & Concepts)', 
        '3': 'Level 3 (Strategic Thinking)',
        '4': 'Level 4 (Extended Thinking)'
      };
      return descriptions[level];
    }).join(', ');

    const userPrompt = `
      User Inputs:
      - Topic: ${inputs.topic}
      - Number of Questions: ${inputs.numQuestions}
      - Question Type: ${inputs.questionType}
      - Depth of Knowledge (DoK) Levels: ${dokLevelsText}

      IMPORTANT: Distribute the ${inputs.numQuestions} questions across the selected DoK levels (${inputs.dokLevels.join(', ')}). 
      Each question should clearly align with one of the specified DoK levels. If multiple levels are selected, 
      create a mix of questions that represent different cognitive demands.

      Authoritative Context from SBC Documents:
      ---
      ${contextText}
      ---

      Based on the user inputs AND the provided context, generate the quiz JSON object.
    `;

    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
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