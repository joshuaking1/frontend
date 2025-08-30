"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from 'zod';
import Groq from 'groq-sdk';

// --- START: SELF-CONTAINED EMBEDDING ENGINE ---
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const MODEL = '@cf/baai/bge-small-en-v1.5';
const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${MODEL}`;

async function generateEmbedding(text: string): Promise<number[]> {
  if (!CF_API_TOKEN || !CF_ACCOUNT_ID) {
    throw new Error("Cloudflare credentials are not configured.");
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${CF_API_TOKEN}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ text: [text] }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Cloudflare AI Error: ${response.status} ${errorBody}`);
  }

  const result = await response.json();
  return result.result.data[0];
}
// --- END: SELF-CONTAINED EMBEDDING ENGINE ---

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ######################################################################
// RAG-POWERED AI RUBRIC GENERATOR
// ######################################################################

const rubricSchema = z.object({
  topic: z.string().min(3, "Topic is required."),
  taskDescription: z.string().min(10, "Task description is required."),
  grade: z.string().min(1, "Grade is required."),
  subject: z.string().min(1, "Subject is required."),
});

const rubricSystemPrompt = `You are an expert in educational assessment for the Ghanaian curriculum. Your task is to generate a detailed assessment rubric based on a user's request and relevant curriculum context.

You MUST follow these rules:
1.  **Prioritize CONTEXT:** The rubric criteria and descriptions must be directly inspired by the provided official curriculum context.
2.  **GENERATE CONTENT ONLY:** Output only the rubric's core JSON content. Do not include titles or metadata from the user's input.
3.  **JSON FORMAT:** The output MUST be a single, valid JSON object. No markdown, no extra text.
4.  **STRUCTURE:** Use the exact JSON structure from the example: { "criteria": [ { "name": "string", "weight": "number", "levels": { "excellent": "string", "proficient": "string", "developing": "string", "emerging": "string" } } ] }
5.  **CRITERIA & WEIGHTS:** Generate 3 to 5 relevant criteria. The weights for all criteria MUST sum to 100.
6.  **INSUFFICIENT CONTEXT:** If context is missing, state that you cannot generate a rubric without it. Do not invent content.`;

const rubricExampleFormat = {
  "criteria": [
    {
      "name": "Understanding of Topic",
      "weight": 40,
      "levels": {
        "excellent": "Demonstrates a thorough and nuanced understanding of the topic, with deep insights and connections to broader concepts.",
        "proficient": "Demonstrates a solid understanding of the topic and its key aspects.",
        "developing": "Demonstrates a basic understanding of the topic, but with some gaps or misconceptions.",
        "emerging": "Demonstrates a limited or incorrect understanding of the topic."
      }
    },
    {
      "name": "Clarity and Organization",
      "weight": 30,
      "levels": {
        "excellent": "Exceptionally clear, well-organized, and easy to follow. Logical structure enhances the presentation.",
        "proficient": "Generally clear and well-organized, with a logical flow.",
        "developing": "Somewhat unclear or disorganized, making it difficult to follow at times.",
        "emerging": "Unclear, disorganized, and difficult to follow."
      }
    },
    {
      "name": "Use of Evidence/Examples",
      "weight": 30,
      "levels": {
        "excellent": "Provides compelling, well-chosen evidence and examples that strongly support the main points.",
        "proficient": "Provides relevant evidence and examples to support the main points.",
        "developing": "Provides limited or weak evidence and examples.",
        "emerging": "Provides no relevant evidence or examples."
      }
    }
  ]
};

export async function generateRubric(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validation = rubricSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: { validation: validation.error.flatten().fieldErrors }, data: null };
  }

  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData?.user) {
    return { error: { api: ["Authentication error. Please sign in again."] }, data: null };
  }

  const user = userData.user;

  const inputs = validation.data;

  try {
    // --- RAG PIPELINE (RUNNING DIRECTLY IN THE SERVER ACTION) ---
    // Step 1: Generate embedding using the reliable Cloudflare API call.
    const combinedQuery = `${inputs.subject} ${inputs.grade}: ${inputs.topic} - ${inputs.taskDescription}`;
    const queryEmbedding = await generateEmbedding(combinedQuery);

    const { data: chunks, error: matchError } = await supabase.rpc('match_sbc_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.75,
      match_count: 5
    });
    if (matchError) throw new Error(`Chunk Matching Error: ${matchError.message}`);

    const contextText = chunks && chunks.length > 0 ? chunks.map((c: any) => c.content).join("\n\n---\n\n") : "No specific curriculum context was found.";
    const userPrompt = `Generate a rubric JSON for a '${inputs.grade}' class on the topic '${inputs.topic}'. The task is: '${inputs.taskDescription}'. Use this SBC context: ${contextText}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: rubricSystemPrompt },
        { role: "user", content: userPrompt },
        { role: "assistant", content: `\`\`\`json\n${JSON.stringify(rubricExampleFormat, null, 2)}` }
      ],
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content;
    if (!aiResponse) throw new Error("AI failed to generate a response.");

    const rubricData = JSON.parse(aiResponse);

    const fullContentForEmbedding = `Rubric for ${inputs.topic}: ${JSON.stringify(rubricData)}`;
    const contentEmbedding = await generateEmbedding(fullContentForEmbedding);

    await supabase.from('teacher_content').insert({
      owner_id: user.id,
      content_type: 'rubric',
      title: `Rubric: ${inputs.topic}`,
      subject: inputs.subject,
      structured_content: { inputs, aiContent: rubricData },
      embedding: contentEmbedding
    });

    return { data: { inputs, aiContent: rubricData }, error: null };

  } catch (e: any) {
    console.error("Rubric Generation Error:", e);
    return { error: { api: [`Failed to generate rubric: ${e.message}`] }, data: null };
  }
}


// ######################################################################
// DEFINITIVE RAG-POWERED TOS BUILDER
// ######################################################################

const tosSchema = z.object({
  subject: z.string().min(3, "Subject is required."),
  examTitle: z.string().min(5, "Exam title is required."),
  weeksCovered: z.string().min(1, "Please specify the weeks covered (e.g., 1-6)."),
  // We no longer need 'strandsCovered' or 'totalMarks' as the AI will determine this from the context.
});

const tosSystemPrompt = `You are an expert in Ghanaian curriculum design and assessment planning. Your task is to create the data for a Table of Specification (TOS) based on the user's subject and the weeks they have taught. You MUST use the provided curriculum context to determine the focal areas and create a balanced distribution of questions.

You MUST ONLY respond with a valid, raw JSON object and nothing else.

The JSON object must follow this exact schema:
{
  "weeks": [
    {
      "weekNumber": "number",
      "focalAreas": ["string", "string", "..."],
      "questionDistribution": {
        "multipleChoice": { "dok1": "number", "dok2": "number", "dok3": "number", "dok4": "number" },
        "essay": { "dok1": "number", "dok2": "number", "dok3": "number", "dok4": "number" },
        "practical": { "dok1": "number", "dok2": "number", "dok3": "number", "dok4": "number" }
      }
    }
  ]
}

For any question type or DoK level with zero questions, the value must be 0, not null.`;

export async function generateTos(prevState: any, formData: FormData) {
  const validation = tosSchema.safeParse(Object.fromEntries(formData.entries()));
  
  if (!validation.success) return { error: "Invalid input. Please check all fields." };

  const { subject, examTitle, weeksCovered } = validation.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Not authenticated." };

  try {
    // --- RAG Pipeline ---
    const { data: embeddingResponse } = await supabase.functions.invoke('text-to-embedding', { 
      body: { text: `Table of Specification for ${subject} covering weeks ${weeksCovered}` } 
    });

    const { data: chunks } = await supabase.rpc('match_sbc_chunks', {
      query_embedding: embeddingResponse.embedding,
      match_threshold: 0.7,
      match_count: 10, // Get a wide range of context for the entire exam period
      raw_query_text: `SBC curriculum for ${subject}`
    });

    const contextText = chunks && chunks.length > 0 
      ? chunks.map((c: any) => c.content).join('\n---\n') 
      : "No specific curriculum context was found. Please proceed with general knowledge.";
    // --- End RAG ---

    const userPrompt = `Generate a Table of Specification JSON for the following exam.
- Exam Title: "${examTitle}"
- Subject: "${subject}"
- Weeks Covered: "${weeksCovered}"

Use the following extensive curriculum context to identify the key focal areas for these weeks and create a balanced and relevant specification table:

--- CONTEXT ---
${contextText}
--- END CONTEXT ---`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: tosSystemPrompt }, 
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: "json_object" },
    });

    const rawJson = response.choices[0].message.content;
    if (!rawJson) throw new Error("AI returned an empty response.");

    const tosData = JSON.parse(rawJson);

    // Add the user's input back in for the renderer to use
    const finalTosPayload = { ...tosData, subject: subject, examTitle: examTitle };

    // Save the 100x result to the Content Hub
    // ... (insert into teacher_content logic as previously blueprinted) ...

    return { tos: finalTosPayload, error: null };

  } catch (e: any) {
    console.error("TOS Generation Error:", e);
    return { error: `Failed to generate TOS: ${e.message}`, tos: null };
  }
}

// ######################################################################
// RAG-POWERED AI REFINEMENT ACTION
// ######################################################################

const refinementSystemPrompt = `You are an expert curriculum editor. Your task is to take an existing piece of educational content (in JSON format) and refine it based on a teacher's specific request and relevant curriculum context. You MUST maintain the original JSON structure. You MUST ONLY respond with the complete, updated, valid, raw JSON object. Do not add any explanatory text or markdown.`;

export async function refineContentWithAI(contentId: number, originalContent: any, refinementPrompt: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated.");
    }
    if (!contentId || !originalContent || !refinementPrompt) {
        throw new Error("Missing required parameters for refinement.");
    }

    try {
        const combinedQuery = `Refine content on topic '${originalContent.inputs.topic}' with this instruction: '${refinementPrompt}'`;
        const queryEmbedding = await generateEmbedding(combinedQuery);

        const { data: chunks, error: matchError } = await supabase.rpc('match_sbc_chunks', {
            query_embedding: queryEmbedding,
            match_threshold: 0.78,
            match_count: 6
        });
        if (matchError) throw new Error(`Chunk Matching Error: ${matchError.message}`);

        const contextText = chunks && chunks.length > 0 ? chunks.map((c: any) => c.content).join("\n\n---\n\n") : "No specific curriculum context was found for this refinement task.";
        
        const userPrompt = `
            **Original Content (DO NOT CHANGE THE STRUCTURE):**
            \`\`\`json
            ${JSON.stringify(originalContent.aiContent, null, 2)}
            \`\`\`

            **Teacher's Refinement Request:**
            "${refinementPrompt}"

            **Relevant Curriculum Context:**
            \`\`\`
            ${contextText}
            \`\`\`

            **Your Task:**
            Rewrite the 'Original Content' JSON object to incorporate the teacher's request, using the provided context. Respond with ONLY the raw, updated JSON object.
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: refinementSystemPrompt },
                { role: "user", content: userPrompt },
            ],
            model: "meta-llama/llama-4-maverick-17b-128e-instruct",
            temperature: 0.2,
            response_format: { type: "json_object" },
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content;
        if (!aiResponse) throw new Error("AI failed to generate a refined response.");

        const refinedAiContent = JSON.parse(aiResponse);

        const fullContentForEmbedding = `Refined Content on ${originalContent.inputs.topic}: ${JSON.stringify(refinedAiContent)}`;
        const contentEmbedding = await generateEmbedding(fullContentForEmbedding);

        const { data, error } = await supabase
            .from('teacher_content')
            .update({
                structured_content: { ...originalContent, aiContent: refinedAiContent },
                embedding: contentEmbedding,
                updated_at: new Date().toISOString(),
            })
            .eq('id', contentId)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to save refined content: ${error.message}`);
        }

        return data;

    } catch (error: any) {
        console.error("AI Refinement Error:", error);
        // Re-throw the error so the calling component can handle it
        throw error;
    }
}