// src/app/dashboard/student/learn/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server"; // Import Supabase server client
import Groq from 'groq-sdk';
import { revalidatePath } from 'next/cache';
import { subjectsData } from '@/lib/placeholder-data';

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

const systemPrompt = `
You are an expert, friendly, and engaging AI tutor for students in Ghana.
Your task is to take a specific topic and generate a clear, simple, and encouraging lesson about it, based **strictly on the provided context** from the official curriculum.

You MUST follow these rules:
1.  **Prioritize the CONTEXT.** Your entire lesson must be derived from the provided curriculum text. Use it to explain concepts, define terms, and give examples.
2.  **Strictly use Markdown for formatting.** Use headings (#, ##), bold text for key terms (**term**), and lists.
3.  **Start with a simple, relatable introduction** based on the context.
4.  **Break down the topic into small, easy-to-understand sections** using subheadings, as informed by the context.
5.  **Use real-world examples** that a Ghanaian student would understand, inspired by the context.
6.  **End with a "Key Takeaways" summary section** using a bulleted list of the most important points from the context.
7.  The tone must be encouraging, positive, and conversational. Address the student directly (e.g., "In this lesson, you'll discover...", "Think about it like this...").
`;

export async function generateStudentLesson(topicId: string) {
  // Find the topic name from our placeholder data using the ID
  let topicName: string | undefined;
  for (const subject of subjectsData) {
    const foundTopic = subject.topics.find(t => t.id === topicId);
    if (foundTopic) {
      topicName = foundTopic.name;
      break;
    }
  }
  if (!topicName) return { error: "Topic not found." };

  try {
    const supabase = await createClient();
    
    // --- RAG Step 1: Get Query Embedding using Cloudflare AI ---
    const queryEmbedding = await generateEmbedding(topicName);

    // --- RAG Step 2: Match Relevant Chunks ---
    let contextText = "No specific curriculum information was found for this topic. I will give a general explanation.";
    if (queryEmbedding) {
        const { data: chunks, error: matchError } = await supabase.rpc('match_sbc_chunks', {
          query_embedding: queryEmbedding,
          match_threshold: 0.7,
          match_count: 5 // Get a good amount of context for a full lesson
        });
        if (matchError) throw new Error(`Failed to match chunks: ${matchError.message}`);

        if (chunks && chunks.length > 0) {
            contextText = chunks.map((chunk: { content: string }) => chunk.content).join("\n\n---\n\n");
        }
    }

    // --- RAG Step 3: Generate Response with Context ---
    const userPrompt = `
      Please generate a lesson for me on the topic: "${topicName}".
      
      Use the following authoritative context from the SBC curriculum to construct the lesson:
      ---
      ${contextText}
      ---
    `;

    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
    });

    const lessonContent = response.choices[0].message.content;
    
    return { lesson: { title: topicName, content: lessonContent }, error: null };

  } catch (e) {
    console.error("RAG Student Lesson Error:", e);
    return { error: `Failed to generate your lesson: ${e.message}` };
  }
}

export async function markLessonAsComplete(topicId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "User not authenticated." };
    }

    // 1. Insert the completion record.
    // The ON CONFLICT DO NOTHING ensures that if the user clicks the button again, it won't create a duplicate entry or throw an error.
    const { error: insertError } = await supabase
        .from('lesson_completions')
        .insert({ student_id: user.id, topic_id: topicId }, { onConflict: 'student_id, topic_id' });

    if (insertError) {
        console.error("Lesson completion insert error:", insertError);
        return { error: "Could not save completion." };
    }
    
    // 2. Call the database function to check for achievements.
    const { error: rpcError } = await supabase.rpc('handle_lesson_completion', {
        student_id_param: user.id
    });

     if (rpcError) {
        console.error("RPC handle_lesson_completion error:", rpcError);
        // We don't return an error to the user here, as the completion was successful.
        // This is a background task failure that can be monitored.
    }

    // Revalidate the achievements page path so it shows the new badge if awarded.
    revalidatePath('/dashboard/student/achievements');
    return { success: true };
}
