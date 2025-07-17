// frontend/src/app/dashboard/teacher/advanced-tools/actions.ts
"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- RUBRIC GENERATOR ACTION ---
const rubricSchema = z.object({
  taskDescription: z.string().min(10, "Please provide a detailed task description."),
  topic: z.string().min(3, "Please provide a topic for context."),
});

const rubricSystemPrompt = `
You are an expert in educational assessment design for the Ghanaian SBC. Your task is to generate a detailed, structured grading rubric as a raw JSON object based on a teacher's description of a task and relevant curriculum context.

You MUST ONLY respond with a valid, raw JSON object and nothing else.
The JSON object must follow this exact schema:
{
  "title": "string (e.g., Rubric for Photosynthesis Project)",
  "criteria": [
    {
      "name": "string (e.g., 'Scientific Accuracy', 'Creativity', 'Clarity of Explanation')",
      "weight": "number (e.g., 40)",
      "levels": {
        "excellent": "string (Description of what excellent work looks like for this criterion)",
        "proficient": "string (Description of proficient work)",
        "developing": "string (Description of developing work)",
        "emerging": "string (Description of emerging/novice work)"
      }
    }
  ]
}
You must generate 3 to 5 relevant criteria for the described task. The weights for all criteria should sum to 100.
`;

export async function generateRubric(prevState: any, formData: FormData) {
  const validation = rubricSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validation.success) return { error: "Invalid input." };

  const { taskDescription, topic } = validation.data;

  // Initialize Supabase client
  const supabase = await createClient();

  // --- RAG Pipeline ---
  const { data: embeddingResponse } = await supabase.functions.invoke('text-to-embedding', { body: { text: topic } });
  const { data: chunks } = await supabase.rpc('match_sbc_chunks', { query_embedding: embeddingResponse.embedding, match_threshold: 0.7, match_count: 4 });
  const contextText = chunks && chunks.length > 0 ? chunks.map((c: any) => c.content).join('\n---\n') : "No specific curriculum context was found.";
  // --- End RAG ---

  const userPrompt = `
    Generate a rubric JSON for the following assessment task.
    Task Description: "${taskDescription}"
    Topic: "${topic}"
    
    Use the following curriculum context to ensure the rubric's criteria are aligned with the SBC's expectations:
    --- CONTEXT ---
    ${contextText}
    --- END CONTEXT ---
  `;

  try {
    const response = await groq.chat.completions.create({
      model: 'mistral-saba-24b',
      messages: [{ role: 'system', content: rubricSystemPrompt }, { role: 'user', content: userPrompt }],
      response_format: { type: "json_object" },
    });
    const rubricData = JSON.parse(response.choices[0].message.content);
    
    // Save to teacher_content table
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        // Generate embedding for the rubric content
        const fullContentForEmbedding = `Title: ${rubricData.title || `Rubric for ${topic}`}. Content: ${JSON.stringify(rubricData)}`;
        const { data: embeddingResponse } = await supabase.functions.invoke('text-to-embedding', { body: { text: fullContentForEmbedding } });
        
        // Now include the embedding in the insert
        await supabase.from('teacher_content').insert({
            owner_id: user.id,
            content_type: 'rubric',
            title: rubricData.title || `Rubric for ${topic}`,
            subject: topic,
            structured_content: rubricData,
            embedding: embeddingResponse.embedding // SAVE THE EMBEDDING
        });
    }
    
    return { rubric: rubricData };
  } catch (e) {
    console.error("Rubric Generation Error:", e);
    return { error: "Failed to generate rubric from AI." };
  }
}
// --- TOS BUILDER ACTION ---
const tosSchema = z.object({
  subject: z.string().min(3, "Subject is required."),
  examTitle: z.string().min(5, "Exam title is required."),
  strandsCovered: z.string().min(10, "Please list the strands and sub-strands covered."),
  totalMarks: z.coerce.number().min(10, "Total marks must be at least 10."),
});

const tosSystemPrompt = `
You are an expert in curriculum design and assessment planning for the Ghanaian education system. Your task is to create a detailed Table of Specification (TOS) as a raw JSON object based on the topics a teacher has covered. You MUST use the provided curriculum context to ensure the breakdown is relevant.

You MUST ONLY respond with a valid, raw JSON object and nothing else.
The JSON object must follow this exact schema:
{
  "title": "string (The title of the exam)",
  "totalMarks": "number",
  "subject": "string",
  "cognitiveLevels": ["Remembering", "Understanding", "Applying", "Analyzing", "Evaluating", "Creating"],
  "specifications": [
    {
      "topic": "string (e.g., A specific Sub-Strand)",
      "totalQuestions": "number",
      "totalMarks": "number",
      "breakdown": {
        "remembering": "number (Number of questions at this level)",
        "understanding": "number",
        "applying": "number",
        "analyzing": "number",
        "evaluating": "number",
        "creating": "number"
      }
    }
  ]
}

Ensure the number of questions in the 'breakdown' for each topic sums to the 'totalQuestions' for that topic.
Ensure the 'totalMarks' for all topics sum up to the overall 'totalMarks' provided by the user.
Distribute the questions across the cognitive levels logically based on the provided curriculum context.
`;

export async function generateTos(prevState: any, formData: FormData) {
  const validation = tosSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validation.success) return { error: "Invalid input." };

  const { subject, examTitle, strandsCovered, totalMarks } = validation.data;

  // Initialize Supabase client
  const supabase = await createClient();

  // --- RAG Pipeline ---
  const { data: embeddingResponse } = await supabase.functions.invoke('text-to-embedding', { body: { text: `Table of Specification for ${subject}: ${strandsCovered}` } });
  const { data: chunks } = await supabase.rpc('match_sbc_chunks', { query_embedding: embeddingResponse.embedding, match_threshold: 0.7, match_count: 8 }); // Get more context for a TOS
  const contextText = chunks && chunks.length > 0 ? chunks.map((c: any) => c.content).join('\n---\n') : "No specific curriculum context was found.";
  // --- End RAG ---

  const userPrompt = `
    Generate a Table of Specification JSON for the following exam.
    - Exam Title: "${examTitle}"
    - Subject: "${subject}"
    - Total Marks: ${totalMarks}
    - Strands/Sub-Strands Covered: "${strandsCovered}"

    Use the following curriculum context to create a balanced and relevant specification table:
    --- CONTEXT ---
    ${contextText}
    --- END CONTEXT ---
  `;

  try {
    const response = await groq.chat.completions.create({
      model: 'mistral-saba-24b',
      messages: [{ role: 'system', content: tosSystemPrompt }, { role: 'user', content: userPrompt }],
      response_format: { type: "json_object" },
    });
    const tosData = JSON.parse(response.choices[0].message.content);
    
    // Save to teacher_content table
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        // Generate embedding for the TOS content
        const fullContentForEmbedding = `Title: ${tosData.title || examTitle}. Content: ${JSON.stringify(tosData)}`;
        const { data: embeddingResponse } = await supabase.functions.invoke('text-to-embedding', { body: { text: fullContentForEmbedding } });
        
        // Now include the embedding in the insert
        await supabase.from('teacher_content').insert({
            owner_id: user.id,
            content_type: 'tos',
            title: tosData.title || examTitle,
            subject: subject,
            structured_content: tosData,
            embedding: embeddingResponse.embedding // SAVE THE EMBEDDING
        });
    }
    
    return { tos: tosData };
  } catch (e) {
    console.error("TOS Generation Error:", e);
    return { error: "Failed to generate Table of Specification from AI." };
  }
}

// --- AI REFINEMENT ACTION ---
const refineSchema = z.object({
  contentId: z.string().uuid(),
  refinementPrompt: z.string().min(5, "Please provide instructions for the AI."),
});

// A generic refinement system prompt
const refinementSystemPrompt = `
You are an expert curriculum editor. Your task is to take an existing piece of educational content (in JSON format) and refine it based on a teacher's specific request.
You MUST maintain the original JSON structure perfectly. Only modify the content within the JSON based on the user's prompt.
You MUST ONLY respond with the complete, updated, valid, raw JSON object and nothing else.
`;

export async function refineContentWithAI(content: any, refinementPrompt: string) {
    if (!content || !content.content_type) return { error: "Invalid content provided." };
    if (!refinementPrompt) return { error: "Refinement prompt is required." };
    
    // Initialize Supabase client
    const supabase = await createClient();
    
    // The user prompt will include the original content and the new instructions
    const userPrompt = `
        Here is the original JSON content:
        \`\`\`json
        ${JSON.stringify(content.structured_content, null, 2)}
        \`\`\`

        Now, please apply the following refinement to it: "${refinementPrompt}"

        Return the complete, new JSON object.
    `;

    try {
        const response = await groq.chat.completions.create({
            model: 'mistral-saba-24b',
            messages: [{ role: 'system', content: refinementSystemPrompt }, { role: 'user', content: userPrompt }],
            response_format: { type: "json_object" },
        });

        const refinedJson = JSON.parse(response.choices[0].message.content);

        // Update the record in the database with the new, refined content
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from('teacher_content')
                .update({ structured_content: refinedJson, updated_at: new Date().toISOString() })
                .eq('id', content.id);
        }

        revalidatePath('/dashboard/teacher/resources');
        return { refinedContent: refinedJson };

    } catch (e) {
        console.error("AI Refinement Error:", e);
        return { error: "Failed to refine content with AI." };
    }
}
