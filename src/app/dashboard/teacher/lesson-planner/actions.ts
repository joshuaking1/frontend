"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from 'zod';
import Groq from 'groq-sdk';
import { revalidatePath } from "next/cache";

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

const lessonPlanSchema = z.object({
  subject: z.string().min(1),
  grade: z.string().min(1),
  week: z.string().min(1),
  duration: z.string().min(1),
  strand: z.string().min(1),
  subStrand: z.string().min(1),
  topic: z.string().min(3, "The main topic / content standard is required."),
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const systemPrompt = `You are an expert instructional designer for the Ghanaian SBC. Your task is to generate the CONTENT for a lesson plan based on user inputs and **highly relevant, authoritative context** provided from the official curriculum documents.

You MUST follow these rules:
1.  **You MUST prioritize the provided CONTEXT.** Your output should be directly inspired by and aligned with the text from the curriculum chunks. Synthesize, do not invent.
2.  **You MUST ONLY respond with a valid, raw JSON object.** Do not include any explanatory text, markdown, or anything before or after the JSON object.
3.  The JSON object must strictly follow this exact schema:
    {
      "contentStandard": "string", "learningOutcome": "string", "learningIndicator": "string",
      "essentialQuestions": ["string"], "pedagogicalStrategies": ["string"],
      "teachingAndLearningResources": ["string"], "differentiationNotes": ["string"],
      "starterActivity": { "teacher": "string", "learner": "string" },
      "introductoryActivity": { "teacher": "string", "learner": "string" },
      "mainActivity1": { "teacher": "string", "learner": "string" },
      "mainActivity2": { "teacher": "string", "learner": "string" },
      "lessonConclusion": { "teacher": "string", "learner": "string" },
      "assessmentTasks": { "type": "Formative/Summative", "description": "string", "tasks": ["string"] }
    }
4.  If the CONTEXT is insufficient or missing, state that you cannot generate a plan without curriculum context and advise the user to upload the relevant documents. Do not invent content.`;

const exampleFormat = {
    "contentStandard": "B5.1.1.1: Demonstrate understanding of the properties of materials",
    "learningOutcome": "Learners will be able to classify materials based on their physical properties.",
    "learningIndicator": "Learners can group materials into solids, liquids, and gases.",
    "essentialQuestions": [
        "What are the different states of matter?",
        "How can we identify the properties of different materials?"
    ],
    "pedagogicalStrategies": [
        "Inquiry-Based Learning",
        "Collaborative Learning",
        "Demonstration"
    ],
    "teachingAndLearningResources": [
        "Variety of materials (water, stone, wood, oil, air in a balloon)",
        "Charts showing properties of matter",
        "Worksheets"
    ],
    "differentiationNotes": [
        "For struggling learners, provide a pre-sorted list of items to categorize.",
        "For advanced learners, ask them to research and present on a material with unusual properties."
    ],
    "starterActivity": {
        "teacher": "Presents a tray of different items (e.g., a rock, a sponge, a glass of water) and asks learners to describe what they see.",
        "learner": "Observes the items and uses descriptive words to share their observations with a partner."
    },
    "introductoryActivity": {
        "teacher": "Introduces the terms 'solid', 'liquid', and 'gas'. Explains the key properties of each state.",
        "learner": "Listens to the explanation and writes down the definitions in their notebooks."
    },
    "mainActivity1": {
        "teacher": "Guides learners to work in small groups to sort the items from the starter activity into the three states of matter.",
        "learner": "Works in a group to discuss, categorize the materials, and justify their choices."
    },
    "mainActivity2": {
        "teacher": "Conducts a simple demonstration, such as boiling water to show the change from liquid to gas (steam).",
        "learner": "Observes the demonstration, asks questions, and records their observations."
    },
    "lessonConclusion": {
        "teacher": "Leads a class discussion to summarize the key learnings. Asks learners to give examples of solids, liquids, and gases from their daily life.",
        "learner": "Participates in the discussion and provides examples."
    },
    "assessmentTasks": {
        "type": "Formative",
        "description": "Assess learners' ability to classify materials and understand their properties through observation and a simple worksheet.",
        "tasks": [
            "Worksheet: Match the material to its state.",
            "Oral questioning: Ask a learner to describe the properties of a liquid."
        ]
    }
};

export async function generateLessonPlan(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const rawData = Object.fromEntries(formData.entries());
  const validation = lessonPlanSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: { validation: validation.error.flatten().fieldErrors }, planData: null };
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: { api: ["Not authenticated."] }, planData: null };
  }

  const inputs = validation.data;

  try {
    // --- RAG PIPELINE ---
    const combinedQuery = `${inputs.subject} ${inputs.topic}`;

    // Step 1: Generate embedding using Supabase function
    const { data: embeddingResponse } = await supabase.functions.invoke('text-to-embedding', { 
      body: { text: combinedQuery } 
    });

    if (!embeddingResponse || !embeddingResponse.embedding) {
      throw new Error("Embedding failed.");
    }

    // Step 2: Match Relevant Chunks from the database
    const { data: chunks, error: matchError } = await supabase.rpc('match_sbc_chunks', {
      query_embedding: embeddingResponse.embedding,
      match_threshold: 0.1, // Lower threshold for text search
      match_count: 5,
      raw_query_text: combinedQuery // PASS THE RAW TEXT
    });

    if (matchError) {
      throw new Error(`Chunk Matching Error: ${matchError.message}`);
    }
    
    const contextText = chunks && chunks.length > 0 
      ? chunks.map((chunk: any) => chunk.content).join("\n---\n") 
      : "No specific curriculum context found.";
    // --- End RAG ---

    // --- AI Generation Step ---
    const userPrompt = `
      User Inputs:
      - Subject: ${inputs.subject}, Grade: ${inputs.grade}, Week: ${inputs.week}, Duration: ${inputs.duration}
      - Strand: ${inputs.strand}, Sub-Strand: ${inputs.subStrand}
      - Topic/Content Standard: ${inputs.topic}

      Official Curriculum Context:
      \`\`\`
      ${contextText}
      \`\`\`

      Instruction: Generate the lesson plan content as a single, clean JSON object based *only* on the provided context.
    `;

    const chatCompletion = await groq.chat.completions.create({
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
            { role: "assistant", content: `\`\`\`json\n${JSON.stringify(exampleFormat, null, 2)}` }
        ],
        model: "meta-llama/llama-4-maverick-17b-128e-instruct",
        temperature: 0.25,
        response_format: { type: "json_object" },
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("AI failed to generate a response.");
    }

    const planData = JSON.parse(aiResponse);
    
    // --- Save to DB Step ---
    const fullContentForEmbedding = `Title: ${inputs.topic}. Content: ${JSON.stringify(planData)}`;
    const contentEmbedding = await generateEmbedding(fullContentForEmbedding);
    
    await supabase.from('teacher_content').insert({
        owner_id: user.id,
        content_type: 'lesson_plan',
        title: `${inputs.subject}: ${inputs.topic}`,
        subject: inputs.subject,
        structured_content: { inputs, aiContent: planData },
        embedding: contentEmbedding
    });

    revalidatePath('/dashboard/teacher/resources'); // Revalidate the content hub to show the new item
    return { planData: { inputs, aiContent: planData }, error: null };

  } catch (e: unknown) {
    console.error("RAG Lesson Plan Error:", e);
    return { error: { api: [`An error occurred: ${e.message}`] }, planData: null };
  }
}