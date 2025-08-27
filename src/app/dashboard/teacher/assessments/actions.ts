// frontend/src/app/dashboard/teacher/assessments/actions.ts
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

// QuizQuestion type
export type QuizQuestion = {
  type: 'mcq' | 'short_answer';
  question: string;
  options: string[];
  correctAnswer: string;
  dokLevel?: string;
};

const assessmentSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  grade: z.string().min(1, "Grade is required"),
  topic: z.string().min(3, "Topic is required."),
  numQuestions: z.coerce.number().int().min(1, "Number of questions must be at least 1.").max(20, "Number of questions cannot exceed 20."),
  questionType: z.enum(['any', 'mcq', 'short_answer']),
  dokLevels: z.array(z.enum(['1', '2', '3', '4'])).min(1, "At least one DoK level is required."),
  dok1Questions: z.coerce.number().int().min(0).max(20).optional(),
  dok2Questions: z.coerce.number().int().min(0).max(20).optional(),
  dok3Questions: z.coerce.number().int().min(0).max(20).optional(),
  dok4Questions: z.coerce.number().int().min(0).max(20).optional(),
}).refine((data) => {
  // Ensure that if a DOK level is selected, the corresponding question count is greater than 0
  const dokLevels = data.dokLevels || [];
  if (dokLevels.includes('1') && (!data.dok1Questions || data.dok1Questions <= 0)) return false;
  if (dokLevels.includes('2') && (!data.dok2Questions || data.dok2Questions <= 0)) return false;
  if (dokLevels.includes('3') && (!data.dok3Questions || data.dok3Questions <= 0)) return false;
  if (dokLevels.includes('4') && (!data.dok4Questions || data.dok4Questions <= 0)) return false;
  return true;
}, {
  message: "Each selected DOK level must have at least 1 question.",
  path: ["dokLevels"],
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const systemPrompt = `You are an expert in educational assessment design for the Ghanaian SBC. Your primary task is to generate a quiz as a raw JSON object based on user specifications and the **provided authoritative context** from the official curriculum.

You MUST follow these rules:
1.  **Prioritize the CONTEXT when available.** If sufficient curriculum context is provided, base questions directly on it. If context is limited but the topic is educationally valid, use your pedagogical knowledge to create appropriate questions aligned with the grade level and subject.
2.  **You MUST ONLY respond with a valid, raw JSON object.** Do not include any explanatory text or markdown.
3.  The JSON object must have this exact schema: { "title": "string", "questions": [ { "type": "'mcq' or 'short_answer'", "question": "string", "options": ["string"], "correctAnswer": "string", "dokLevel": "string" } ] }
4.  For 'mcq' type, the 'options' array MUST contain exactly 4 distinct strings.
5.  For 'mcq' type, the 'correctAnswer' MUST exactly match one of the strings in the 'options' array.
6.  For 'short_answer' type, the 'options' field MUST be an empty array: [].
7.  For 'short_answer' type, the 'correctAnswer' MUST be a concise, factual answer.
8.  **DOK Level Requirements:** Each question MUST include a "dokLevel" field with the appropriate level ("1", "2", "3", or "4") based on the cognitive demand:
   - DOK 1: Recall facts, definitions, terms, simple procedures
   - DOK 2: Apply skills/concepts, make connections, classify, organize
   - DOK 3: Strategic thinking, reasoning, planning, using evidence
   - DOK 4: Extended thinking, synthesis, analysis, create original work
9.  **Follow the specified DOK distribution exactly.** Generate the exact number of questions requested for each DOK level.
10. Only refuse to generate questions if the topic is completely inappropriate or nonsensical for the given grade level and subject.`;

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
  const supabase = await createClient();
  
  // Manually construct rawData to handle array fields correctly
  const rawData = {
    subject: formData.get('subject'),
    grade: formData.get('grade'),
    topic: formData.get('topic'),
    numQuestions: formData.get('numQuestions'),
    questionType: formData.get('questionType'),
    dokLevels: formData.getAll('dokLevels'), // Use getAll to capture all selected checkbox values
    dok1Questions: formData.get('dok1Questions') || '0',
    dok2Questions: formData.get('dok2Questions') || '0',
    dok3Questions: formData.get('dok3Questions') || '0',
    dok4Questions: formData.get('dok4Questions') || '0',
  };

  const validation = assessmentSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors, quiz: null };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: { api: ["Not authenticated."] }, quiz: null };
  }

  const inputs = validation.data;
  inputs.topic = inputs.topic.trim();

  // Calculate total questions from DOK level distribution
  const dokQuestionCounts = {
    '1': inputs.dok1Questions || 0,
    '2': inputs.dok2Questions || 0,
    '3': inputs.dok3Questions || 0,
    '4': inputs.dok4Questions || 0,
  };
  
  const totalDokQuestions = Object.values(dokQuestionCounts).reduce((sum, count) => sum + count, 0);
  
  

  try {
    // --- RAG PIPELINE (RUNNING DIRECTLY IN THE SERVER ACTION) ---
    // Step 1: Generate embedding using the reliable Cloudflare API call.
    const queryEmbedding = await generateEmbedding(inputs.topic);

    // Step 2: Match chunks.
    const { data: chunks, error: matchError } = await supabase.rpc('match_sbc_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 5
    });

    if (matchError) throw new Error(`Chunk Matching Error: ${matchError.message}`);

    if (!chunks || chunks.length === 0) {
      const { data: suggestedTopics } = await supabase.rpc('fuzzy_find_topics', { search_term: inputs.topic });
      return { 
        error: { 
          code: 'NO_CONTEXT_FOUND',
          message: `The system could not find enough information for "${inputs.topic}".`,
          suggestions: suggestedTopics || [] 
        }, 
        quiz: null 
      };
    }

    const contextText = chunks.map((chunk: any) => chunk.content).join("\n\n---\n\n");

    // Build DOK distribution details for the prompt
    const dokDistribution = Object.entries(dokQuestionCounts)
      .filter(([level, count]) => count > 0)
      .map(([level, count]) => `DOK Level ${level}: ${count} questions`)
      .join(', ');
      
    // Validate that the total questions from DOK levels matches the numQuestions parameter
    if (totalDokQuestions !== inputs.numQuestions) {
      inputs.numQuestions = totalDokQuestions;
    }

    const userPrompt = `
      Generate a quiz JSON object with the following specifications:
      - Topic: ${inputs.topic}
      - Total Questions: ${inputs.numQuestions}
      - Question Type(s): ${inputs.questionType}
      - Grade: ${inputs.grade}
      - DOK Level Distribution: ${dokDistribution}

      IMPORTANT: You must generate exactly the specified number of questions for each DOK level:
      ${Object.entries(dokQuestionCounts)
        .filter(([level, count]) => count > 0)
        .map(([level, count]) => `- ${count} questions at DOK Level ${level}`)
        .join('\n      ')}

      Use the following authoritative context from the SBC curriculum to construct the quiz:
      ---
      ${contextText}
      ---
    `;

    // Step 3: Call Groq AI.
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
        { role: "assistant", content: `\`\`\`json\n${JSON.stringify(exampleFormat, null, 2)}` }
      ],
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content;
    if (!aiResponse) throw new Error("AI returned an empty response.");
    const quizData = JSON.parse(aiResponse);

    // Step 4: Save to Content Hub (also generates an embedding).
    const fullContentForEmbedding = `Title: ${quizData.title}. Content: ${JSON.stringify(quizData)}`;
    const contentEmbedding = await generateEmbedding(fullContentForEmbedding);
    
    await supabase.from('teacher_content').insert({
      owner_id: user.id,
      content_type: 'assessment',
      title: quizData.title || `Assessment for ${inputs.topic}`,
      subject: inputs.subject,
      structured_content: { inputs, aiContent: quizData },
      embedding: contentEmbedding
    });

    revalidatePath('/dashboard/teacher/resources'); // Revalidate the content hub
    return { quiz: { inputs, aiContent: quizData }, error: null };

  } catch (e: any) {
    console.error("Monolithic Assessment Error:", e);
    return { error: { api: [e.message] }, quiz: null };
  }
}