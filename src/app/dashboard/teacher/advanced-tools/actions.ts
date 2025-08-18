"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from 'zod';
import Groq from 'groq-sdk';

const supabase = createClient();
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: { api: ["Not authenticated."] }, data: null };
  }

  const inputs = validation.data;

  try {
    const combinedQuery = `${inputs.subject} ${inputs.grade}: ${inputs.topic} - ${inputs.taskDescription}`;
    const { data: embeddingResponse, error: embeddingError } = await supabase.functions.invoke('text-to-embedding', { body: { text: combinedQuery } });
    if (embeddingError) throw new Error(`Embedding Error: ${embeddingError.message}`);

    const { data: chunks, error: matchError } = await supabase.rpc('match_sbc_chunks', {
      query_embedding: embeddingResponse.embedding,
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
    const { data: contentEmbedding } = await supabase.functions.invoke('text-to-embedding', { body: { text: fullContentForEmbedding } });

    await supabase.from('teacher_content').insert({
      owner_id: user.id,
      content_type: 'rubric',
      title: `Rubric: ${inputs.topic}`,
      subject: inputs.subject,
      structured_content: { inputs, aiContent: rubricData },
      embedding: contentEmbedding.embedding
    });

    return { data: { inputs, aiContent: rubricData }, error: null };

  } catch (e: any) {
    console.error("Rubric Generation Error:", e);
    return { error: { api: [`Failed to generate rubric: ${e.message}`] }, data: null };
  }
}


// ######################################################################
// RAG-POWERED AI TABLE OF SPECIFICATIONS (TOS) GENERATOR
// ######################################################################

const tosSchema = z.object({
    subject: z.string().min(1, "Subject is required"),
    grade: z.string().min(1, "Grade is required"),
    topic: z.string().min(3, "Main topic is required."),
    examTitle: z.string().min(5, "Exam title is required"),
    totalMarks: z.coerce.number().int().positive("Total marks must be a positive number."),
    totalQuestions: z.coerce.number().int().positive("Total questions must be a positive number."),
});

const tosSystemPrompt = `You are an expert in educational assessment for the Ghanaian curriculum. Your task is to generate a Table of Specifications (TOS) for an exam based on user inputs and curriculum context.

You MUST follow these rules:
1.  **Prioritize CONTEXT:** The TOS breakdown must align with the provided official curriculum context.
2.  **GENERATE CONTENT ONLY:** Output only the TOS's core JSON content.
3.  **JSON FORMAT:** The output MUST be a single, valid JSON object. No markdown, no extra text.
4.  **STRUCTURE:** Use the exact JSON structure from the example: { "examTitle": "string", "subject": "string", "grade": "string", "totalQuestions": "number", "totalMarks": "number", "breakdown": [ { "subTopic": "string", "cognitiveLevel": "Remembering/Understanding/Applying/Analyzing/Evaluating/Creating", "questionType": "Multiple Choice/Objective/Essay", "numberOfQuestions": "number", "marksPerQuestion": "number", "totalMarks": "number" } ] }
5.  **VALIDATION:** The sum of 'numberOfQuestions' in the breakdown MUST equal 'totalQuestions'. The sum of 'totalMarks' in the breakdown MUST equal 'totalMarks'.
6.  **INSUFFICIENT CONTEXT:** If context is missing, state that you cannot generate a TOS without it.`;

const tosExampleFormat = {
  "examTitle": "End of Term Science Exam",
  "subject": "Science",
  "grade": "JHS 1",
  "totalQuestions": 20,
  "totalMarks": 50,
  "breakdown": [
    {
      "subTopic": "Cells",
      "cognitiveLevel": "Remembering",
      "questionType": "Multiple Choice",
      "numberOfQuestions": 5,
      "marksPerQuestion": 1,
      "totalMarks": 5
    },
    {
      "subTopic": "Ecosystems",
      "cognitiveLevel": "Understanding",
      "questionType": "Objective",
      "numberOfQuestions": 5,
      "marksPerQuestion": 2,
      "totalMarks": 10
    },
    {
      "subTopic": "Photosynthesis",
      "cognitiveLevel": "Applying",
      "questionType": "Essay",
      "numberOfQuestions": 2,
      "marksPerQuestion": 10,
      "totalMarks": 20
    },
    {
      "subTopic": "Matter",
      "cognitiveLevel": "Analyzing",
      "questionType": "Objective",
      "numberOfQuestions": 8,
      "marksPerQuestion": 1.875,
      "totalMarks": 15
    }
  ]
};


export async function generateTos(prevState: any, formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());
    const validation = tosSchema.safeParse(rawData);

    if (!validation.success) {
        return { error: { validation: validation.error.flatten().fieldErrors }, data: null };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: { api: ["Not authenticated."] }, data: null };
    }

    const inputs = validation.data;

    try {
        const combinedQuery = `${inputs.subject} ${inputs.grade} ${inputs.topic} ${inputs.examTitle}`;
        const { data: embeddingResponse, error: embeddingError } = await supabase.functions.invoke('text-to-embedding', { body: { text: combinedQuery } });
        if (embeddingError) throw new Error(`Embedding Error: ${embeddingError.message}`);

        const { data: chunks, error: matchError } = await supabase.rpc('match_sbc_chunks', {
            query_embedding: embeddingResponse.embedding,
            match_threshold: 0.75,
            match_count: 8 
        });
        if (matchError) throw new Error(`Chunk Matching Error: ${matchError.message}`);

        const contextText = chunks && chunks.length > 0 ? chunks.map((c: any) => c.content).join("\n\n---\n\n") : "No specific curriculum context was found.";
        const userPrompt = `Generate a Table of Specifications JSON for a '${inputs.grade}' exam titled '${inputs.examTitle}' on the main topic '${inputs.topic}'. Total questions: ${inputs.totalQuestions}, Total marks: ${inputs.totalMarks}. Use this SBC context: ${contextText}`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: tosSystemPrompt },
                { role: "user", content: userPrompt },
                { role: "assistant", content: `\`\`\`json\n${JSON.stringify(tosExampleFormat, null, 2)}` }
            ],
            model: "meta-llama/llama-4-maverick-17b-128e-instruct",
            temperature: 0.4,
            response_format: { type: "json_object" },
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content;
        if (!aiResponse) throw new Error("AI failed to generate a response.");

        const tosData = JSON.parse(aiResponse);

        const fullContentForEmbedding = `TOS for ${inputs.examTitle}: ${JSON.stringify(tosData)}`;
        const { data: contentEmbedding } = await supabase.functions.invoke('text-to-embedding', { body: { text: fullContentForEmbedding } });

        await supabase.from('teacher_content').insert({
            owner_id: user.id,
            content_type: 'tos',
            title: `TOS: ${inputs.examTitle}`,
            subject: inputs.subject,
            structured_content: { inputs, aiContent: tosData },
            embedding: contentEmbedding.embedding
        });

        return { data: { inputs, aiContent: tosData }, error: null };

    } catch (e: any) {
        console.error("TOS Generation Error:", e);
        return { error: { api: [`Failed to generate TOS: ${e.message}`] }, data: null };
    }
}

// ######################################################################
// RAG-POWERED AI REFINEMENT ACTION
// ######################################################################

const refinementSystemPrompt = `You are an expert curriculum editor. Your task is to take an existing piece of educational content (in JSON format) and refine it based on a teacher's specific request and relevant curriculum context. You MUST maintain the original JSON structure. You MUST ONLY respond with the complete, updated, valid, raw JSON object. Do not add any explanatory text or markdown.`;

export async function refineContentWithAI(contentId: number, originalContent: any, refinementPrompt: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated.");
    }
    if (!contentId || !originalContent || !refinementPrompt) {
        throw new Error("Missing required parameters for refinement.");
    }

    try {
        const combinedQuery = `Refine content on topic '${originalContent.inputs.topic}' with this instruction: '${refinementPrompt}'`;
        const { data: embeddingResponse, error: embeddingError } = await supabase.functions.invoke('text-to-embedding', { body: { text: combinedQuery } });
        if (embeddingError) throw new Error(`Embedding Error: ${embeddingError.message}`);

        const { data: chunks, error: matchError } = await supabase.rpc('match_sbc_chunks', {
            query_embedding: embeddingResponse.embedding,
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
        const { data: contentEmbedding } = await supabase.functions.invoke('text-to-embedding', { body: { text: fullContentForEmbedding } });

        const { data, error } = await supabase
            .from('teacher_content')
            .update({
                structured_content: { ...originalContent, aiContent: refinedAiContent },
                embedding: contentEmbedding.embedding,
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