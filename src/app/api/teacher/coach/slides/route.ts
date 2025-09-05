// frontend/src/app/api/teacher/coach/slides/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Groq } from 'groq-sdk';
import PptxGenJS from 'pptxgenjs';

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
    const { lessonTitle, subject, gradeLevel, duration, objectives, keyPoints, activities, assessment } = body;

    if (!lessonTitle || !subject) {
      return NextResponse.json({ error: 'Lesson title and subject are required' }, { status: 400 });
    }

    // Get curriculum context if available
    let curriculumContext = "";
    try {
      const { data: embeddingResponse } = await supabase.functions.invoke('text-to-embedding', { 
        body: { text: `${lessonTitle} ${subject}` } 
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

    const systemPrompt = `You are an expert educational content creator specializing in creating engaging PowerPoint slides for Ghanaian education (SBC curriculum).

Lesson Details:
- Title: ${lessonTitle}
- Subject: ${subject}
- Grade Level: ${gradeLevel || 'Not specified'}
- Duration: ${duration || 'Not specified'}

Additional Information:
- Learning Objectives: ${objectives || 'Not specified'}
- Key Points: ${keyPoints || 'Not specified'}
- Activities: ${activities || 'Not specified'}
- Assessment: ${assessment || 'Not specified'}

Curriculum Context:
${curriculumContext}

Create a comprehensive PowerPoint presentation in JSON format with the following structure:
{
  "slides": [
    {
      "id": "unique_id",
      "title": "Slide Title",
      "content": "Main content text",
      "bulletPoints": ["Point 1", "Point 2", "Point 3"],
      "slideType": "title|content|activity|assessment|summary|image|video",
      "order": 1,
      "backgroundColor": "#ffffff",
      "textColor": "#000000",
      "imageUrl": "optional_image_url",
      "videoUrl": "optional_video_url",
      "layout": "title|content|twoColumn|imageText|videoText"
    }
  ]
}

Slide Types:
- "title": Opening slide with lesson title and objectives
- "content": Educational content with explanations and examples
- "activity": Interactive activities or exercises
- "assessment": Assessment questions or evaluation methods
- "summary": Conclusion and key takeaways
- "image": Slide with educational images
- "video": Slide with embedded videos

Layout Types:
- "title": Title slide layout
- "content": Standard content layout
- "twoColumn": Two-column layout for comparisons
- "imageText": Image on one side, text on the other
- "videoText": Video with accompanying text

Requirements:
1. Create 8-12 slides total
2. Start with a title slide
3. Include content slides with clear explanations
4. Add interactive activity slides
5. Include assessment slides
6. End with a summary slide
7. Use age-appropriate language for Ghanaian students
8. Include practical examples relevant to Ghana
9. Make content engaging and interactive
10. Ensure slides flow logically
11. Suggest relevant images/videos where appropriate
12. Use appropriate colors and layouts for each slide type

For images and videos, suggest relevant educational content that would enhance learning.`;

    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create teaching slides for: ${lessonTitle}` }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const aiResponse = response.choices[0].message.content;
    
    if (!aiResponse) {
      throw new Error("AI response failed");
    }

    const slideData = JSON.parse(aiResponse);

    // Add unique IDs and order to slides if not provided
    const processedSlides = slideData.slides.map((slide: any, index: number) => ({
      id: slide.id || `slide_${Date.now()}_${index}`,
      title: slide.title,
      content: slide.content,
      bulletPoints: slide.bulletPoints || [],
      slideType: slide.slideType || 'content',
      order: slide.order || index + 1,
      backgroundColor: slide.backgroundColor || '#ffffff',
      textColor: slide.textColor || '#000000',
      imageUrl: slide.imageUrl || '',
      videoUrl: slide.videoUrl || '',
      layout: slide.layout || 'content'
    }));

    // Generate PowerPoint file
    const pptx = new PptxGenJS();
    
    // Set presentation properties
    pptx.defineLayout({ name: 'LAYOUT_16x9', width: 10, height: 5.625 });
    pptx.layout = 'LAYOUT_16x9';
    
    // Add slides to PowerPoint
    processedSlides.forEach((slide: any, index: number) => {
      const slideObj = pptx.addSlide();
      
      // Set slide background
      slideObj.background = { color: slide.backgroundColor };
      
      // Add content based on slide type and layout
      switch (slide.slideType) {
        case 'title':
          slideObj.addText(slide.title, {
            x: 1, y: 1.5, w: 8, h: 1,
            fontSize: 36,
            bold: true,
            color: slide.textColor,
            align: 'center'
          });
          if (slide.content) {
            slideObj.addText(slide.content, {
              x: 1, y: 3, w: 8, h: 1,
              fontSize: 18,
              color: slide.textColor,
              align: 'center'
            });
          }
          break;
          
        case 'content':
          slideObj.addText(slide.title, {
            x: 0.5, y: 0.5, w: 9, h: 0.8,
            fontSize: 24,
            bold: true,
            color: slide.textColor
          });
          
          if (slide.bulletPoints && slide.bulletPoints.length > 0) {
            slideObj.addText(slide.bulletPoints.map((point, idx) => ({
              text: point,
              options: { bullet: true }
            })), {
              x: 0.5, y: 1.5, w: 9, h: 3.5,
              fontSize: 16,
              color: slide.textColor
            });
          } else if (slide.content) {
            slideObj.addText(slide.content, {
              x: 0.5, y: 1.5, w: 9, h: 3.5,
              fontSize: 16,
              color: slide.textColor
            });
          }
          break;
          
        case 'image':
          slideObj.addText(slide.title, {
            x: 0.5, y: 0.5, w: 9, h: 0.8,
            fontSize: 24,
            bold: true,
            color: slide.textColor
          });
          
          if (slide.imageUrl) {
            slideObj.addImage({
              path: slide.imageUrl,
              x: 2, y: 1.5, w: 6, h: 3
            });
          }
          
          if (slide.content) {
            slideObj.addText(slide.content, {
              x: 0.5, y: 4.5, w: 9, h: 0.8,
              fontSize: 14,
              color: slide.textColor,
              align: 'center'
            });
          }
          break;
          
        case 'video':
          slideObj.addText(slide.title, {
            x: 0.5, y: 0.5, w: 9, h: 0.8,
            fontSize: 24,
            bold: true,
            color: slide.textColor
          });
          
          if (slide.videoUrl) {
            slideObj.addText(`Video: ${slide.videoUrl}`, {
              x: 1, y: 2, w: 8, h: 2,
              fontSize: 16,
              color: slide.textColor,
              align: 'center',
              backgroundColor: '#f0f0f0',
              border: { type: 'solid', color: '#cccccc', pt: 1 }
            });
          }
          
          if (slide.content) {
            slideObj.addText(slide.content, {
              x: 0.5, y: 4.5, w: 9, h: 0.8,
              fontSize: 14,
              color: slide.textColor,
              align: 'center'
            });
          }
          break;
          
        case 'activity':
          slideObj.addText(slide.title, {
            x: 0.5, y: 0.5, w: 9, h: 0.8,
            fontSize: 24,
            bold: true,
            color: slide.textColor
          });
          
          slideObj.addText('Activity Instructions:', {
            x: 0.5, y: 1.5, w: 9, h: 0.5,
            fontSize: 18,
            bold: true,
            color: slide.textColor
          });
          
          if (slide.bulletPoints && slide.bulletPoints.length > 0) {
            slideObj.addText(slide.bulletPoints.map((point, idx) => ({
              text: point,
              options: { bullet: true }
            })), {
              x: 0.5, y: 2.2, w: 9, h: 2.5,
              fontSize: 16,
              color: slide.textColor
            });
          } else if (slide.content) {
            slideObj.addText(slide.content, {
              x: 0.5, y: 2.2, w: 9, h: 2.5,
              fontSize: 16,
              color: slide.textColor
            });
          }
          break;
          
        case 'assessment':
          slideObj.addText(slide.title, {
            x: 0.5, y: 0.5, w: 9, h: 0.8,
            fontSize: 24,
            bold: true,
            color: slide.textColor
          });
          
          slideObj.addText('Assessment Questions:', {
            x: 0.5, y: 1.5, w: 9, h: 0.5,
            fontSize: 18,
            bold: true,
            color: slide.textColor
          });
          
          if (slide.bulletPoints && slide.bulletPoints.length > 0) {
            slideObj.addText(slide.bulletPoints.map((point, idx) => ({
              text: point,
              options: { bullet: true }
            })), {
              x: 0.5, y: 2.2, w: 9, h: 2.5,
              fontSize: 16,
              color: slide.textColor
            });
          } else if (slide.content) {
            slideObj.addText(slide.content, {
              x: 0.5, y: 2.2, w: 9, h: 2.5,
              fontSize: 16,
              color: slide.textColor
            });
          }
          break;
          
        case 'summary':
          slideObj.addText(slide.title, {
            x: 0.5, y: 0.5, w: 9, h: 0.8,
            fontSize: 24,
            bold: true,
            color: slide.textColor
          });
          
          slideObj.addText('Key Takeaways:', {
            x: 0.5, y: 1.5, w: 9, h: 0.5,
            fontSize: 18,
            bold: true,
            color: slide.textColor
          });
          
          if (slide.bulletPoints && slide.bulletPoints.length > 0) {
            slideObj.addText(slide.bulletPoints.map((point, idx) => ({
              text: point,
              options: { bullet: true }
            })), {
              x: 0.5, y: 2.2, w: 9, h: 2.5,
              fontSize: 16,
              color: slide.textColor
            });
          } else if (slide.content) {
            slideObj.addText(slide.content, {
              x: 0.5, y: 2.2, w: 9, h: 2.5,
              fontSize: 16,
              color: slide.textColor
            });
          }
          break;
          
        default:
          slideObj.addText(slide.title, {
            x: 0.5, y: 0.5, w: 9, h: 0.8,
            fontSize: 24,
            bold: true,
            color: slide.textColor
          });
          
          if (slide.content) {
            slideObj.addText(slide.content, {
              x: 0.5, y: 1.5, w: 9, h: 3.5,
              fontSize: 16,
              color: slide.textColor
            });
          }
      }
    });

    // Generate PowerPoint buffer
    const pptxBuffer = await pptx.writeFile({ outputType: 'nodebuffer' });

    // Save slide generation to search history
    await supabase.from('teacher_search_history').insert({
      teacher_id: user.id,
      query: `PowerPoint generation: ${lessonTitle}`,
      search_type: 'curriculum',
      results: {
        slides: processedSlides,
        lessonTitle,
        subject,
        gradeLevel,
        totalSlides: processedSlides.length
      }
    });

    // Return PowerPoint file as base64
    const base64Pptx = pptxBuffer.toString('base64');

    return NextResponse.json({
      slides: processedSlides,
      lessonTitle,
      subject,
      gradeLevel,
      totalSlides: processedSlides.length,
      powerpointFile: base64Pptx,
      fileName: `${lessonTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.pptx`
    });
    
  } catch (error) {
    console.error("Slide generation error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Slide generation failed" 
    }, { status: 500 });
  }
}
