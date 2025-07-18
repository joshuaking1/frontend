// frontend/src/app/dashboard/student/snap-solve/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import Groq from 'groq-sdk';
import { revalidatePath } from "next/cache";
// Import the 100x Nyansapo-Deck action to create a powerful cross-feature integration
import { processTextForKnowledgeGraph } from "../notes/actions";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ######################################################################
// ACTION 1: THE MULTI-MODAL ANALYSIS ENGINE
// This action takes a file path from Supabase Storage and gets a live analysis from a vision model.
// ######################################################################

const visionSystemPrompt = `You are a multi-modal AI expert specializing in analyzing educational materials from Ghana. Analyze the user-provided image. Your task is to:
1.  Generate a short, descriptive title for the problem (max 5 words).
2.  Transcribe all text visible in the image using OCR.
3.  Semantically understand the content (e.g., 'algebra_equation', 'photosynthesis_diagram', 'comprehension_question').
4.  Formulate an engaging, Socratic opening question to begin a tutoring session. NEVER give the answer. Your question must prompt the student to take the first step.
You MUST ONLY respond with a valid, raw JSON object. The schema is:
{ "title": "string", "extractedText": "string", "problemType": "string", "openingQuestion": "string" }`;

export async function analyzeHomeworkImage(filePath: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data: urlData, error: urlError } = await supabase.storage.from('homework_snaps').createSignedUrl(filePath, 60);
    if (urlError || !urlData) {
        console.error("Signed URL Error:", urlError);
        return { error: "Could not create secure link for image analysis." };
    }

    try {
        const response = await groq.chat.completions.create({
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            messages: [
                { role: 'system', content: visionSystemPrompt },
                { role: 'user', content: [{ type: 'image_url', image_url: { url: urlData.signedUrl } }] }
            ],
            response_format: { type: "json_object" },
        });

        const rawJson = response.choices[0].message.content;
        if (!rawJson) throw new Error("Received empty response from Vision AI.");
        
        const analysis = JSON.parse(rawJson);

        const { data: session, error: sessionError } = await supabase.from('vision_tutor_sessions')
            .insert({
                student_id: user.id,
                original_image_path: filePath,
                extracted_text: analysis.extractedText,
                problem_type: analysis.problemType,
                title: analysis.title
            }).select().single();
        if (sessionError) throw sessionError;

        await supabase.from('vision_tutor_messages').insert({ session_id: session.id, sender: 'ai', content: analysis.openingQuestion });

        return { sessionId: session.id };

    } catch (e) {
        console.error("Snap & Solve AI Error:", e);
        return { error: `Failed to analyze image with AI: ${e.message}` };
    }
}


// ######################################################################
// ACTION 2: THE SOCRATIC TUTORING RESPONDER
// This action takes the conversation history and generates the next guiding question.
// ######################################################################

const socraticTutorPrompt = `You are a Socratic AI Tutor. A student is trying to solve a problem. The original problem was: "{originalProblem}".
Your conversation history is provided. The student's latest message is the last one.
Your task is to respond. NEVER give the direct answer. Instead, guide the student with a question that helps them think and discover the next step themselves.
If the student is correct, affirm them and ask a follow-up question to deepen their understanding.
If the student is incorrect, gently guide them back to the core concept without telling them they are wrong. Ask a question that helps them reconsider.
Keep your response concise, encouraging, and in the form of a question.`;

export async function getSocraticResponse(sessionId: string, history: { role: 'user' | 'assistant', content: string }[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data: session } = await supabase.from('vision_tutor_sessions').select('extracted_text').eq('id', sessionId).single();
    if (!session) return { error: "Session not found" };
    
    // NOTE: We now pass the history from the client to avoid another DB call here, making it faster.
    const formattedHistory = history.map(h => ({ role: h.role, content: h.content }));

    try {
        const response = await groq.chat.completions.create({
            model: 'llama3-8b-8192',
            messages: [
                { role: 'system', content: socraticTutorPrompt.replace('{originalProblem}', session.extracted_text) },
                ...formattedHistory
            ],
        });
        const aiResponseContent = response.choices[0].message.content;
        if (!aiResponseContent) throw new Error("AI returned an empty response.");

        // Save the AI's response to the DB, but don't wait for revalidation.
        // Return the new message immediately for a snappy UI.
        const { data: newAiMessage, error } = await supabase.from('vision_tutor_messages')
            .insert({ session_id: sessionId, sender: 'ai', content: aiResponseContent })
            .select()
            .single();

        if (error) throw error;
        
        return { newAiMessage }; // THE CRITICAL CHANGE: Return the new message object.

    } catch (e) {
        console.error("Socratic Response Error:", e);
        return { error: `AI Tutor failed to respond: ${e.message}` };
    }
}


// ######################################################################
// ACTION 3: THE SESSION FINALIZER AND KNOWLEDGE SCRIBE
// This action concludes the session and triggers the automated note-taking process.
// ######################################################################

export async function completeAndSummarizeSession(sessionId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error: updateError } = await supabase.from('vision_tutor_sessions').update({ status: 'completed' }).eq('id', sessionId);
    if (updateError) return { error: "Failed to update session status." };

    // --- 100x NYANSAPO-DECK INTEGRATION ---
    const { data: messages, error: messagesError } = await supabase.from('vision_tutor_messages').select('sender, content').eq('session_id', sessionId).order('created_at');
    if (messagesError || !messages) return { error: "Could not retrieve transcript for summary." };

    // We create a clean transcript of the conversation to be scribed.
    const transcript = messages.map(m => `${m.sender === 'user' ? 'Student' : 'Tutor'}: ${m.content}`).join('\n\n');

    // Fire-and-forget the knowledge graph generation. We don't need to wait for it.
    // The user gets an immediate response, while the powerful AI scribing happens in the background.
    processTextForKnowledgeGraph(transcript, 'vision_tutor_session', sessionId)
        .catch(err => console.error("Background Scribing Failed:", err));

    revalidatePath(`/dashboard/student/snap-solve/${sessionId}`);
    return { success: true };
}