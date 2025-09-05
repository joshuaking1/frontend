// frontend/src/app/api/teacher/coach/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { message, lessonTopic, conversationHistory } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get curriculum context if lesson topic is provided
    let curriculumContext = "";
    if (lessonTopic) {
      try {
        const { data: embeddingResponse } = await supabase.functions.invoke('text-to-embedding', { 
          body: { text: lessonTopic } 
        });

        if (embeddingResponse?.embedding) {
          const { data: chunks } = await supabase.rpc('match_sbc_chunks', {
            query_embedding: embeddingResponse.embedding,
            match_threshold: 0.7,
            match_count: 3
          });

          if (chunks && chunks.length > 0) {
            curriculumContext = chunks.map((chunk: any) => chunk.content).join('\n\n');
          }
        }
      } catch (error) {
        console.error('Curriculum context error:', error);
      }
    }

    // Build conversation context
    const conversationContext = conversationHistory?.map((msg: any) => 
      `${msg.type === 'user' ? 'Teacher' : 'AI'}: ${msg.content}`
    ).join('\n') || '';

    const systemPrompt = `You are an expert AI co-teacher and educational consultant specializing in Ghanaian education (SBC curriculum). You help teachers with lesson planning, teaching strategies, and educational resources.

Current Lesson Topic: ${lessonTopic || 'General teaching assistance'}

Curriculum Context:
${curriculumContext}

Conversation History:
${conversationContext}

Provide helpful, practical advice for teachers. Be encouraging, specific, and actionable. Focus on:
- Effective teaching strategies
- Student engagement techniques
- Assessment methods
- Resource recommendations
- Classroom management tips
- Curriculum alignment

Respond in a conversational, supportive tone as if you're a knowledgeable colleague helping with lesson planning.`;

    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const aiResponse = response.choices[0].message.content;
    
    if (!aiResponse) {
      throw new Error("AI response failed");
    }

    // Generate suggestions based on the message
    const suggestions = generateSuggestions(message, aiResponse);

    // Generate relevant resources
    const resources = await generateResources(lessonTopic || message, supabase);

    // Save conversation to database
    await supabase.from('teacher_search_history').insert({
      teacher_id: user.id,
      query: message,
      search_type: 'curriculum',
      results: {
        response: aiResponse,
        suggestions,
        resources: resources.slice(0, 3)
      }
    });

    return NextResponse.json({
      response: aiResponse,
      suggestions,
      resources: resources.slice(0, 3)
    });
    
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Chat failed" 
    }, { status: 500 });
  }
}

function generateSuggestions(userMessage: string, aiResponse: string): string[] {
  const suggestions: string[] = [];
  
  // Generate contextual suggestions based on the conversation
  if (userMessage.toLowerCase().includes('engagement') || aiResponse.toLowerCase().includes('engagement')) {
    suggestions.push("What specific engagement strategies work best?");
    suggestions.push("How can I keep students focused?");
  }
  
  if (userMessage.toLowerCase().includes('assessment') || aiResponse.toLowerCase().includes('assessment')) {
    suggestions.push("What types of assessments should I use?");
    suggestions.push("How can I make assessments more effective?");
  }
  
  if (userMessage.toLowerCase().includes('activity') || aiResponse.toLowerCase().includes('activity')) {
    suggestions.push("What hands-on activities would work?");
    suggestions.push("How can I make activities more interactive?");
  }
  
  if (userMessage.toLowerCase().includes('resource') || aiResponse.toLowerCase().includes('resource')) {
    suggestions.push("Find educational videos for this topic");
    suggestions.push("What visual aids would be helpful?");
  }
  
  // Default suggestions if no specific context
  if (suggestions.length === 0) {
    suggestions.push("How can I make this lesson more engaging?");
    suggestions.push("What activities would work best?");
    suggestions.push("How can I assess student understanding?");
  }
  
  return suggestions.slice(0, 4);
}

async function generateResources(topic: string, supabase: any): Promise<any[]> {
  const resources: any[] = [];
  
  try {
    // Search for YouTube videos
    if (process.env.YOUTUBE_API_KEY) {
      const youtubeResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(topic + ' education')}&type=video&maxResults=3&key=${process.env.YOUTUBE_API_KEY}`);
      const youtubeData = await youtubeResponse.json();
      
      if (youtubeData.items) {
        youtubeData.items.forEach((item: any) => {
          resources.push({
            type: 'youtube',
            title: item.snippet.title,
            description: item.snippet.description,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            thumbnail: item.snippet.thumbnails.default.url
          });
        });
      }
    }
    
    // Add curriculum resources
    const { data: curriculumDocs } = await supabase
      .from('sbc_curriculum_documents')
      .select('title, content, subject')
      .ilike('title', `%${topic}%`)
      .limit(2);
    
    if (curriculumDocs) {
      curriculumDocs.forEach((doc: any) => {
        resources.push({
          type: 'curriculum',
          title: doc.title,
          description: doc.content.substring(0, 100) + '...',
          subject: doc.subject
        });
      });
    }
    
  } catch (error) {
    console.error('Resource generation error:', error);
  }
  
  return resources;
}
