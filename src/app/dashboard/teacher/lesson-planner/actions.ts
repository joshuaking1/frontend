// src/app/dashboard/teacher/lesson-planner/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from 'zod';
import Groq from 'groq-sdk';

const lessonPlanSchema = z.object({
  subject: z.string().min(1), grade: z.string().min(1),
  week: z.string().min(1), duration: z.string().min(1),
  strand: z.string().min(1), subStrand: z.string().min(1),
  topic: z.string().min(3),
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const systemPrompt = `
You are an expert instructional designer for the Ghanaian Standards-Based Curriculum (SBC). Your task is to generate the CONTENT for a lesson plan based on user inputs and **highly relevant, authoritative context** provided from the official curriculum documents.

You MUST follow these rules:
1.  **You MUST prioritize the provided CONTEXT.** Your output should be directly inspired by and aligned with the text from the curriculum chunks. Synthesize, do not invent.
2.  You MUST ONLY respond with a valid, raw JSON object. Do not include any explanatory text, markdown formatting, or anything before or after the JSON object.
3.  The JSON object must strictly follow this schema:
    {
      "contentStandard": "string", "learningOutcome": "string", "learningIndicator": "string",
      "essentialQuestions": ["string"], "pedagogicalStrategies": ["string"],
      "teachingAndLearningResources": ["string"], "differentiationNotes": ["string"],
      "starterActivity": { "teacher": "string", "learner": "string" },
      "introductoryActivity": { "teacher": "string", "learner": "string" },
      "mainActivity1": { "teacher": "string", "learner": "string" },
      "mainActivity2": { "teacher": "string", "learner": "string" },
      "lessonClosure": { "teacher": "string", "learner": "string" }
    }
`;

export async function generateLessonPlan(prevState: any, formData: FormData) {
  const validation = lessonPlanSchema.safeParse(Object.fromEntries(formData.entries()));
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
      match_threshold: 0.75, // Adjust this threshold as needed
      match_count: 5
    });
    if (matchError) throw new Error(`Failed to match chunks: ${matchError.message}`);
    
    const contextText = chunks.map(chunk => chunk.content).join("\n\n---\n\n");

    // --- RAG Step 3: Generate Response with Context ---
    const userPrompt = `
      User Inputs:
      - Subject: ${inputs.subject}, Form: ${inputs.grade}, Week: ${inputs.week}, Duration: ${inputs.duration} mins
      - Strand: ${inputs.strand}, Sub-Strand: ${inputs.subStrand}
      - Main Topic: ${inputs.topic}

      Authoritative Context from SBC Documents:
      ---
      ${contextText}
      ---

      Based on the user inputs AND the provided context, generate the JSON content for the lesson plan.
    `;

    const response = await groq.chat.completions.create({
      model: 'mistral-saba-24b',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      response_format: { type: "json_object" },
    });

    const jsonContent = response.choices[0].message.content;
    const planData = JSON.parse(jsonContent);
    
    // Save to teacher_content table
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        await supabase.from('teacher_content').insert({
            owner_id: user.id,
            content_type: 'lesson_plan',
            title: `${inputs.subject}: ${inputs.topic}`,
            subject: inputs.subject,
            structured_content: { inputs, aiContent: planData } // Save the entire payload
        });
    }
    
    return { planData: { inputs, aiContent: planData }, error: null };

  } catch (e) {
    console.error("RAG Lesson Plan Error:", e);
    return { error: { api: ["Failed to generate lesson plan with RAG. " + e.message] }, planData: null };
  }
}