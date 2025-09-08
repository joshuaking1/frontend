// frontend/src/app/api/student/quiz/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Groq } from 'groq-sdk';
import { trackServerEvent } from '@/lib/posthog-server';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Removed direct embedding generation - will use Supabase function instead

const quizSystemPrompt = `
You are an expert in educational assessment design for students in Ghana.
Your task is to generate a quiz as a raw JSON object based on the topic and the **provided authoritative context** from the official curriculum.

You MUST follow these rules:
1. **Prioritize the CONTEXT when available.** Base questions directly on the provided curriculum content.
2. **You MUST ONLY respond with a valid, raw JSON object.** Do not include any explanatory text or markdown.
3. The JSON object must have this exact schema: 
   {
     "title": "string",
     "questions": [
       {
         "type": "mcq" or "short_answer",
         "question": "string",
         "options": ["string"] (only for mcq, exactly 4 options),
         "correctAnswer": "string",
         "dokLevel": "1", "2", "3", or "4"
       }
     ]
   }
4. For 'mcq' type, the 'options' array MUST contain exactly 4 distinct strings.
5. For 'mcq' type, the 'correctAnswer' MUST exactly match one of the strings in the 'options' array.
6. For 'short_answer' type, the 'options' field MUST be an empty array: [].
7. For 'short_answer' type, the 'correctAnswer' MUST be a concise, factual answer.
8. Generate 5-8 questions total with a good mix of DOK levels (1-4).
9. Make questions engaging and relevant to Ghanaian students.
10. Questions should test understanding, not just memorization.
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
    
    // Track quiz request
    trackServerEvent(user?.id, 'student_quiz_requested', {
      topic,
      user_agent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    });
    
    // --- RAG Step 1: Get Query Embedding using Supabase function ---
    const { data: embeddingResponse } = await supabase.functions.invoke('text-to-embedding', { 
      body: { text: topic } 
    });

    if (!embeddingResponse || !embeddingResponse.embedding) {
      trackServerEvent(user?.id, 'student_quiz_failed', {
        topic,
        error: 'embedding_generation_failed',
        timestamp: new Date().toISOString()
      });
      throw new Error("Embedding generation failed");
    }

    // --- RAG Step 2: Match Relevant Chunks ---
    let contextText = "No specific curriculum information was found for this topic. Generate questions based on general knowledge.";
    
    const { data: chunks, error: matchError } = await supabase.rpc('match_sbc_chunks', {
      query_embedding: embeddingResponse.embedding,
      match_threshold: 0.6,
      match_count: 5
    });
    
    if (matchError) throw new Error(`Failed to match chunks: ${matchError.message}`);

    if (chunks && chunks.length > 0) {
      contextText = chunks.map((chunk: { content: string }) => chunk.content).join("\n\n---\n\n");
    }

    // --- RAG Step 3: Generate Quiz with Context ---
    const userPrompt = `
      Please generate a quiz for me on the topic: "${topic}".
      
      Use the following authoritative context from the SBC curriculum to create relevant questions:
      ---
      ${contextText}
      ---
      
      Create 5-8 engaging questions that test understanding of this topic.
    `;

    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      messages: [
        { role: 'system', content: quizSystemPrompt }, 
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const quizContent = response.choices[0].message.content;
    
    if (!quizContent) {
      trackServerEvent(user?.id, 'student_quiz_failed', {
        topic,
        error: 'quiz_generation_failed',
        timestamp: new Date().toISOString()
      });
      throw new Error("Failed to generate quiz");
    }

    const parsedQuiz = JSON.parse(quizContent);
    
    // Track successful quiz generation
    trackServerEvent(user?.id, 'student_quiz_generated', {
      topic,
      questions_count: parsedQuiz.questions?.length || 0,
      content_length: quizContent.length,
      chunks_found: chunks?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      quiz: parsedQuiz, 
      error: null 
    });
    
  } catch (error) {
    console.error("Error generating student quiz:", error);
    
    // Track quiz error
    trackServerEvent(null, 'student_quiz_error', {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      quiz: null, 
      error: error instanceof Error ? error.message : "Failed to generate quiz" 
    }, { status: 500 });
  }
}
