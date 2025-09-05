// frontend/src/app/api/teacher/coach/assessments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface AssessmentData {
  studentName: string;
  subject: string;
  score: number;
  totalQuestions: number;
  topics: string[];
  date: string;
  timeSpent?: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface AnalysisResult {
  overallPerformance: {
    score: number;
    grade: string;
    percentile: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  interventionStrategies: {
    type: 'remediation' | 'enrichment' | 'acceleration';
    description: string;
    resources: string[];
    timeline: string;
  }[];
  curriculumAlignment: {
    coveredTopics: string[];
    missedTopics: string[];
    nextSteps: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assessmentData, action } = body;
    
    if (!assessmentData) {
      return NextResponse.json({ error: 'Assessment data is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Get user authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Handle different actions
    if (action === 'generate_recommendations') {
      const recommendations = await generateRecommendations(assessmentData, supabase);
      
      // Save recommendations to database
      await supabase.from('assessment_recommendations').insert({
        assessment_id: assessmentData.id,
        teacher_id: user.id,
        recommendations: recommendations.recommendations || [],
        next_steps: recommendations.nextSteps || []
      });
      
      return NextResponse.json({ recommendations });
    }

    if (action === 'save_assessment') {
      // Save assessment to database without AI analysis
      const { data: savedAssessment, error: saveError } = await supabase
        .from('assessment_analyses')
        .insert({
          teacher_id: user.id,
          student_name: assessmentData.studentName,
          subject: assessmentData.subject,
          score: assessmentData.score,
          total_questions: assessmentData.totalQuestions,
          topics: assessmentData.topics || [],
          strengths: assessmentData.strengths || [],
          weaknesses: assessmentData.weaknesses || [],
          analysis_data: {},
          recommendations: {}
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving assessment:', saveError);
        return NextResponse.json({ 
          error: 'Failed to save assessment to database' 
        }, { status: 500 });
      }

      return NextResponse.json({ 
        assessment: savedAssessment,
        message: 'Assessment saved successfully'
      });
    }

    // Default: Generate full AI analysis and save to database
    const analysis = await generateAssessmentAnalysis(assessmentData, supabase);

    // Save assessment to database
    const { data: savedAssessment, error: saveError } = await supabase
      .from('assessment_analyses')
      .insert({
        teacher_id: user.id,
        student_name: assessmentData.studentName,
        subject: assessmentData.subject,
        score: assessmentData.score,
        total_questions: assessmentData.totalQuestions,
        topics: assessmentData.topics || [],
        strengths: assessmentData.strengths || [],
        weaknesses: assessmentData.weaknesses || [],
        analysis_data: analysis,
        recommendations: analysis.recommendations || {}
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving assessment:', saveError);
      return NextResponse.json({ 
        analysis,
        error: 'Failed to save assessment to database' 
      });
    }

    return NextResponse.json({ 
      analysis,
      assessment: savedAssessment
    });
    
  } catch (error) {
    console.error("Assessment analysis error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Analysis failed" 
    }, { status: 500 });
  }
}

async function generateAssessmentAnalysis(assessment: AssessmentData, supabase: any): Promise<AnalysisResult> {
  const percentage = Math.round((assessment.score / assessment.totalQuestions) * 100);
  
  // Get curriculum context for the subject
  let curriculumContext = "";
  try {
    const { data: embeddingResponse } = await supabase.functions.invoke('text-to-embedding', { 
      body: { text: `${assessment.subject} ${assessment.topics.join(' ')}` } 
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

  const systemPrompt = `You are an expert educational assessment analyst specializing in Ghanaian education (SBC curriculum). 
  
  Analyze the following student assessment data and provide comprehensive insights:

  Student: ${assessment.studentName}
  Subject: ${assessment.subject}
  Score: ${assessment.score}/${assessment.totalQuestions} (${percentage}%)
  Topics: ${assessment.topics.join(', ')}
  Difficulty: ${assessment.difficulty}
  Date: ${assessment.date}

  Curriculum Context:
  ${curriculumContext}

  Provide a detailed analysis including:
  1. Overall performance assessment
  2. Identified strengths and weaknesses
  3. Specific recommendations (immediate, short-term, long-term)
  4. Intervention strategies
  5. Curriculum alignment analysis

  Be specific, actionable, and aligned with Ghanaian educational standards.`;

  const response = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this assessment and provide recommendations for improving student performance.` }
    ],
    temperature: 0.3,
    response_format: { type: "json_object" }
  });

  const aiResponse = response.choices[0].message.content;
  
  if (!aiResponse) {
    throw new Error("AI analysis failed");
  }

  // Parse AI response and structure it
  const parsedAnalysis = JSON.parse(aiResponse);
  
  // Calculate percentile based on score
  const percentile = calculatePercentile(percentage);
  
  return {
    overallPerformance: {
      score: percentage,
      grade: getGrade(percentage),
      percentile: percentile
    },
    strengths: parsedAnalysis.strengths || [],
    weaknesses: parsedAnalysis.weaknesses || [],
    recommendations: {
      immediate: parsedAnalysis.immediateRecommendations || [],
      shortTerm: parsedAnalysis.shortTermRecommendations || [],
      longTerm: parsedAnalysis.longTermRecommendations || []
    },
    interventionStrategies: parsedAnalysis.interventionStrategies || [],
    curriculumAlignment: parsedAnalysis.curriculumAlignment || {
      coveredTopics: assessment.topics,
      missedTopics: [],
      nextSteps: []
    }
  };
}

function calculatePercentile(score: number): number {
  // Mock percentile calculation - in production, this would be based on historical data
  if (score >= 90) return 95;
  if (score >= 80) return 85;
  if (score >= 70) return 70;
  if (score >= 60) return 50;
  if (score >= 50) return 30;
  return 15;
}

function getGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C+';
  if (score >= 40) return 'C';
  if (score >= 30) return 'D';
  return 'F';
}

async function generateRecommendations(assessment: any, supabase: any) {
  const percentage = Math.round((assessment.score / assessment.totalQuestions) * 100);
  
  // Get curriculum context for the subject
  let curriculumContext = "";
  try {
    const { data: embeddingResponse } = await supabase.functions.invoke('text-to-embedding', { 
      body: { text: `${assessment.subject} ${assessment.topics?.join(' ') || ''}` } 
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

  const systemPrompt = `You are an expert educational consultant specializing in Ghanaian education (SBC curriculum). 

  Analyze this student assessment and provide specific, actionable recommendations:

  Student: ${assessment.studentName}
  Subject: ${assessment.subject}
  Score: ${assessment.score}/${assessment.totalQuestions} (${percentage}%)
  Topics: ${assessment.topics?.join(', ') || 'Not specified'}
  Strengths: ${assessment.strengths?.join(', ') || 'Not specified'}
  Weaknesses: ${assessment.weaknesses?.join(', ') || 'Not specified'}

  Curriculum Context:
  ${curriculumContext}

  Provide specific recommendations in this JSON format:
  {
    "recommendations": [
      {
        "category": "Teaching Strategy",
        "suggestion": "Specific actionable recommendation"
      },
      {
        "category": "Student Support", 
        "suggestion": "Specific actionable recommendation"
      },
      {
        "category": "Resources",
        "suggestion": "Specific actionable recommendation"
      }
    ],
    "nextSteps": [
      "Immediate action item 1",
      "Immediate action item 2",
      "Immediate action item 3"
    ]
  }

  Focus on practical, implementable suggestions that align with Ghanaian educational standards.`;

  const response = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate specific recommendations for this student's performance.` }
    ],
    temperature: 0.3,
    response_format: { type: "json_object" }
  });

  const aiResponse = response.choices[0].message.content;
  
  if (!aiResponse) {
    throw new Error("AI recommendations failed");
  }

  try {
    return JSON.parse(aiResponse);
  } catch (error) {
    // Fallback if JSON parsing fails
    return {
      recommendations: [
        {
          category: "General",
          suggestion: "Review the assessment results and consider additional practice in areas where the student struggled."
        }
      ],
      nextSteps: [
        "Review assessment with student",
        "Plan targeted intervention",
        "Monitor progress"
      ]
    };
  }
}

