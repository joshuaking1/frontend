// frontend/src/app/api/teacher/coach/assessments/recent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get recent assessments from database
    const { data: assessments, error } = await supabase
      .from('assessment_analyses')
      .select('*')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching recent assessments:', error);
      return NextResponse.json({ assessments: [] });
    }

    // Transform the data to match the expected format
    const transformedAssessments = assessments?.map(assessment => ({
      id: assessment.id,
      studentName: assessment.student_name,
      subject: assessment.subject,
      score: assessment.score,
      totalQuestions: assessment.total_questions,
      date: assessment.created_at.split('T')[0], // Extract date part
      topics: assessment.topics || [],
      strengths: assessment.strengths || [],
      weaknesses: assessment.weaknesses || []
    })) || [];

    return NextResponse.json({ assessments: transformedAssessments });
    
  } catch (error) {
    console.error("Recent assessments error:", error);
    return NextResponse.json({ 
      assessments: [],
      error: error instanceof Error ? error.message : "Failed to fetch assessments" 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { assessmentData } = body;

    // Transform the manually inputted data to match the expected format
    const transformedAssessments = assessmentData?.map((assessment: any) => ({
      id: assessment.id || Date.now() + Math.random(),
      studentName: assessment.student_name || assessment.studentName,
      subject: assessment.subject,
      score: assessment.score,
      totalQuestions: assessment.total_questions || assessment.totalQuestions,
      date: assessment.created_at ? assessment.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      topics: assessment.analysis_data?.curriculumAlignment?.coveredTopics || assessment.topics || [],
      strengths: assessment.analysis_data?.strengths || assessment.strengths || [],
      weaknesses: assessment.analysis_data?.weaknesses || assessment.weaknesses || []
    })) || [];

    return NextResponse.json({ assessments: transformedAssessments });
    
  } catch (error) {
    console.error("Recent assessments error:", error);
    return NextResponse.json({ 
      assessments: [],
      error: error instanceof Error ? error.message : "Failed to process assessments" 
    }, { status: 500 });
  }
}
