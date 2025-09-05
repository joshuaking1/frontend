// frontend/src/app/api/teacher/coach/lesson-plan/route.ts
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
    const { topic } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Get curriculum context for the topic
    let curriculumContext = "";
    try {
      const { data: embeddingResponse } = await supabase.functions.invoke('text-to-embedding', { 
        body: { text: topic } 
      });

      if (embeddingResponse?.embedding) {
        const { data: chunks } = await supabase.rpc('match_sbc_chunks', {
          query_embedding: embeddingResponse.embedding,
          match_threshold: 0.7,
          match_count: 5
        });

        if (chunks && chunks.length > 0) {
          curriculumContext = chunks.map((chunk: any) => chunk.content).join('\n\n');
        }
      }
    } catch (error) {
      console.error('Curriculum context error:', error);
    }

    const systemPrompt = `You are an expert lesson planner specializing in Ghanaian education (SBC curriculum). Create a comprehensive lesson plan for the topic: "${topic}"

Curriculum Context:
${curriculumContext}

Generate a detailed lesson plan in this JSON format:
{
  "objectives": [
    "Specific learning objective 1",
    "Specific learning objective 2",
    "Specific learning objective 3"
  ],
  "activities": [
    "Engaging activity 1",
    "Interactive activity 2",
    "Assessment activity 3"
  ],
  "resources": [
    "Resource 1",
    "Resource 2",
    "Resource 3"
  ],
  "assessment": [
    "Assessment method 1",
    "Assessment method 2"
  ]
}

Focus on:
- Age-appropriate content for Ghanaian students
- Active learning strategies
- Curriculum alignment with SBC
- Practical, implementable activities
- Multiple assessment methods
- Engaging and interactive approaches`;

    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create a lesson plan for: ${topic}` }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const aiResponse = response.choices[0].message.content;
    
    if (!aiResponse) {
      throw new Error("AI response failed");
    }

    const lessonPlan = JSON.parse(aiResponse);

    // Generate relevant resources
    const resources = await generateResources(topic, supabase);

    return NextResponse.json({
      lessonPlan,
      resources: resources.slice(0, 5)
    });
    
  } catch (error) {
    console.error("Lesson plan error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Lesson plan generation failed" 
    }, { status: 500 });
  }
}

async function generateResources(topic: string, supabase: any): Promise<any[]> {
  const resources: any[] = [];
  
  try {
    // Search for YouTube videos
    if (process.env.YOUTUBE_API_KEY) {
      const youtubeResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(topic + ' education lesson')}&type=video&maxResults=5&key=${process.env.YOUTUBE_API_KEY}`);
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
      .limit(3);
    
    if (curriculumDocs) {
      curriculumDocs.forEach((doc: any) => {
        resources.push({
          type: 'curriculum',
          title: doc.title,
          description: doc.content.substring(0, 150) + '...',
          subject: doc.subject
        });
      });
    }
    
    // Add general educational resources
    resources.push({
      type: 'article',
      title: `${topic} Teaching Guide`,
      description: `Comprehensive teaching guide for ${topic} with strategies and activities`,
      url: '#'
    });
    
  } catch (error) {
    console.error('Resource generation error:', error);
  }
  
  return resources;
}
