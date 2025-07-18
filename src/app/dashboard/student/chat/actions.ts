// frontend/src/app/dashboard/student/chat/actions.ts
"use server";
import { createClient } from "@/lib/supabase/server";
import Groq from 'groq-sdk';
import { revalidatePath } from "next/cache";
import { processTextForKnowledgeGraph } from '../notes/actions'; // Import the new action

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const chatSystemPrompt = `
You are LearnBridedu-Chat, a world-class, friendly, and engaging AI tutor for students. Your personality is encouraging and you make learning fun.
You have deep knowledge of the Ghanaian curriculum.
You MUST use the provided AUTHORITATIVE CONTEXT from the SBC curriculum to answer the user's question. This context is your primary source of truth.
If the context is irrelevant, you can use your general knowledge but mention that the curriculum doesn't specifically cover it.
but always provide key academic terms in English. Format your answers clearly using Markdown.
`;

export async function getOdenehoChatResponse(sessionId: string, userMessage: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // --- RAG Pipeline ---
    const { data: embeddingResponse } = await supabase.functions.invoke('text-to-embedding', { body: { text: userMessage } });
    const { data: chunks } = await supabase.rpc('match_sbc_chunks', { query_embedding: embeddingResponse.embedding, match_threshold: 0.7, match_count: 5 });
    const contextText = chunks && chunks.length > 0 ? "Context from the Ghanaian SBC Curriculum:\n" + chunks.map((c: any) => c.content).join('\n---\n') : "No specific curriculum context was found.";
    // --- End RAG ---

    // Fetch previous messages for context memory
    const { data: history } = await supabase.from('chat_messages').select('sender, content').eq('session_id', sessionId).order('created_at', { ascending: true });
    const formattedHistory = history?.map(h => ({ role: h.sender === 'ai' ? 'assistant' : h.sender, content: h.content })) || [];

    const messagesForAI = [
        { role: 'system', content: chatSystemPrompt },
        ...formattedHistory, // Add past messages for session memory
        { role: 'user', content: userMessage } // Add the new user message
    ];

    try {
        // Save the user's new message to the DB
        await supabase.from('chat_messages').insert({ session_id: sessionId, sender: 'user', content: userMessage });

        // Call the AI
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: messagesForAI,
        });
        const aiResponseContent = response.choices[0].message.content;

        // Save the AI's response to the DB
        await supabase.from('chat_messages').insert({ session_id: sessionId, sender: 'assistant', content: aiResponseContent });
        
        // --- 100x AUTOMATION HOOK ---
        // After 5 back-and-forth messages, automatically summarize the conversation.
        if (formattedHistory.length >= 8) { // 4 pairs + the new user message
            // Take only the most recent messages to avoid token limits
            const recentMessages = [...formattedHistory.slice(-6), { role: 'user', content: userMessage }, { role: 'assistant', content: aiResponseContent }];
            const conversationSummary = recentMessages
                .map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
                .join('\n\n');
            
            // Fire-and-forget this action. We don't need to wait for it.
            processTextForKnowledgeGraph(conversationSummary, 'chat_session', sessionId)
                .catch(console.error);
            
            // Reset the conversation by creating a new session (optional, but good for context)
            // or just clear the history on the client.
        }
        // --- END HOOK ---
        
        revalidatePath(`/dashboard/student/chat/${sessionId}`);
        return { response: aiResponseContent };
    } catch (e) {
        console.error("Odeneho-Chat Error:", e);
        return { error: "I'm having trouble thinking right now. Please try again." };
    }
}

export async function createNewChatSession() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };
    
    const { data: newSession, error } = await supabase.from('chat_sessions')
        .insert({ student_id: user.id, title: "New Conversation" })
        .select('id')
        .single();

    if (error || !newSession) return { error: "Could not start a new chat." };
    
    return { sessionId: newSession.id };
}