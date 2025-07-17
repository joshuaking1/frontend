// frontend/src/app/dashboard/teacher/editor/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const observerSystemPrompt = `
You are an expert, AI pedagogical coach for Ghanaian teachers. Your task is to analyze a teacher's lesson plan draft and provide concise, actionable suggestions based on curriculum context and the teacher's past work.

You MUST ONLY respond with a valid, raw JSON object and nothing else.
The JSON object must follow this exact schema:
{
  "pedagogicalSuggestions": [
    "string (A suggestion to improve engagement, e.g., 'Consider a gallery walk for the main activity.')",
    "string (A suggestion for differentiation, e.g., 'For advanced learners, add a challenge question.')",
    "string (A suggestion for assessment, e.g., 'An exit ticket would be a great way to gauge understanding.')"
  ]
}

Base your suggestions on the provided context. Be creative, encouraging, and specific. Generate exactly 3 suggestions.
`;

export async function getActiveObserverSuggestions(editorContent: string) {
    if (!editorContent || editorContent.length < 100) {
        // Don't run on very short text to save resources
        return { suggestions: null };
    }

    try {
        // Initialize Supabase client
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Not authenticated" };

        // --- RAG Step 1: Get Query Embedding for the entire lesson plan draft ---
        const { data: embeddingResponse, error: embeddingError } = await supabase.functions.invoke('text-to-embedding', {
            body: { text: editorContent },
        });
        if (embeddingError) throw embeddingError;
        const queryEmbedding = embeddingResponse.embedding;

        // --- RAG Step 2: Find Relevant Chunks & Teacher's Own Past Content ---
        const [sbcChunksResult, teacherContentResult] = await Promise.all([
            // Find relevant SBC curriculum chunks
            supabase.rpc('match_sbc_chunks', {
                query_embedding: queryEmbedding,
                match_threshold: 0.75,
                match_count: 3
            }),
            // Find the teacher's own related content (we need a new function for this)
            supabase.rpc('match_teacher_content', {
                owner_id: user.id,
                query_embedding: queryEmbedding,
                match_threshold: 0.7,
                match_count: 2
            })
        ]);

        const { data: sbcChunks } = sbcChunksResult;
        const { data: teacherContent } = teacherContentResult;

        const sbcContext = sbcChunks && sbcChunks.length > 0
            ? "Relevant SBC Excerpts:\n" + sbcChunks.map((c: any) => `- ${c.content.substring(0, 150)}...`).join('\n')
            : "No specific SBC excerpts found.";
        
        const teacherContext = teacherContent && teacherContent.length > 0
            ? "Teacher's Own Related Past Content:\n" + teacherContent.map((c: any) => `- Title: ${c.title} (Type: ${c.content_type})`).join('\n')
            : "No related past content found in the teacher's hub.";

        // --- RAG Step 3: Generate Suggestions with All Context ---
        const userPrompt = `
            A teacher is writing a lesson plan with the following content:
            --- LESSON DRAFT ---
            ${editorContent.substring(0, 2000)}
            --- END DRAFT ---

            Here is some context for you to use:
            --- CONTEXT 1: SBC CURRICULUM ---
            ${sbcContext}
            --- END CONTEXT 1 ---

            --- CONTEXT 2: TEACHER'S PAST WORK ---
            ${teacherContext}
            --- END CONTEXT 2 ---

            Based on all of this, generate your pedagogical suggestions in the required JSON format.
        `;
        
        const response = await groq.chat.completions.create({
            model: 'mistral-saba-24b',
            messages: [{ role: 'system', content: observerSystemPrompt }, { role: 'user', content: userPrompt }],
            response_format: { type: "json_object" },
        });

        const suggestions = JSON.parse(response.choices[0].message.content);
        
        return { suggestions: { ...suggestions, sbc_chunks: sbcChunks, past_content: teacherContent } };

    } catch (e) {
        console.error("Active Observer Error:", e);
        return { error: e.message };
    }
}