// frontend/src/app/api/student/learn/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Groq } from 'groq-sdk';
import { trackServerEvent } from '@/lib/posthog-server';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Removed direct embedding generation - will use Supabase function instead

const systemPrompt = `
You are an expert, friendly, and engaging AI tutor for students in Ghana.
Your task is to take a specific topic and generate a comprehensive, well-structured learning experience based **strictly on the provided context** from the official curriculum.

You MUST follow these rules:
1. **Prioritize the CONTEXT.** Your entire lesson must be derived from the provided curriculum text. Use it to explain concepts, define terms, and give examples.
2. **Strictly use Markdown for formatting.** Use headings (#, ##, ###), bold text for key terms (**term**), lists, and code blocks where appropriate.
3. **Create a comprehensive learning experience** with the following structure:
   - Introduction with learning objectives
   - Main content broken into logical sections
   - Real-world examples and applications
   - Key takeaways summary
   - Practice questions for self-assessment
4. **Use real-world examples** that a Ghanaian student would understand, inspired by the context.
5. **The tone must be encouraging, positive, and conversational.** Address the student directly (e.g., "In this lesson, you'll discover...", "Think about it like this...").
6. **Include practical applications** and why this topic matters in real life.
7. **Make it engaging** with analogies, stories, and interactive elements.

Return a JSON object with this exact structure:
{
  "title": "string",
  "content": "string (markdown formatted)",
  "keyTakeaways": ["string", "string", "string"],
  "estimatedTime": "string (e.g., '15-20 minutes')",
  "difficulty": "string (e.g., 'Beginner', 'Intermediate', 'Advanced')",
  "subject": "string"
}
`;

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();
    
    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Get user for tracking
    const { data: { user } } = await supabase.auth.getUser();
    
    // Track learning request
    trackServerEvent(user?.id, 'student_learning_requested', {
      topic,
      user_agent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    });
    
    // --- RAG Step 1: Get Query Embedding using Supabase function ---
    const { data: embeddingResponse } = await supabase.functions.invoke('text-to-embedding', { 
      body: { text: topic } 
    });

    if (!embeddingResponse || !embeddingResponse.embedding) {
      trackServerEvent(user?.id, 'student_learning_failed', {
        topic,
        error: 'embedding_generation_failed',
        timestamp: new Date().toISOString()
      });
      throw new Error("Embedding generation failed");
    }

    // --- RAG Step 2: Match Relevant Chunks ---
    let contextText = "No specific curriculum information was found for this topic. I will provide a general educational explanation.";
    
    const { data: chunks, error: matchError } = await supabase.rpc('match_sbc_chunks', {
      query_embedding: embeddingResponse.embedding,
      match_threshold: 0.7,
      match_count: 8 // Get more context for comprehensive learning
    });
    
    if (matchError) throw new Error(`Failed to match chunks: ${matchError.message}`);

    if (chunks && chunks.length > 0) {
      contextText = chunks.map((chunk: { content: string }) => chunk.content).join("\n\n---\n\n");
    }

    // --- RAG Step 3: Generate Response with Context ---
    const userPrompt = `
      Please generate a comprehensive learning experience for me on the topic: "${topic}".
      
      Use the following authoritative context from the SBC curriculum to construct the lesson:
      ---
      ${contextText}
      ---
      
      Make sure to create an engaging, well-structured learning experience that covers the topic thoroughly.
    `;

    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      messages: [
        { role: 'system', content: systemPrompt }, 
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const lessonContent = response.choices[0].message.content;
    
    if (!lessonContent) {
      trackServerEvent(user?.id, 'student_learning_failed', {
        topic,
        error: 'content_generation_failed',
        timestamp: new Date().toISOString()
      });
      throw new Error("Failed to generate learning content");
    }

    const parsedContent = JSON.parse(lessonContent);
    
    // Track successful learning generation
    trackServerEvent(user?.id, 'student_learning_generated', {
      topic,
      content_length: lessonContent.length,
      chunks_found: chunks?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      content: parsedContent, 
      error: null 
    });
    
  } catch (error) {
    console.error("Error generating student learning content:", error);
    
    // Track error
    trackServerEvent(null, 'student_learning_error', {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      content: null, 
      error: error instanceof Error ? error.message : "Failed to generate content" 
    }, { status: 500 });
  }
}
