// frontend/src/app/api/teacher/coach/stats/route.ts
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

    // Get today's date for filtering
    const today = new Date().toISOString().split('T')[0];

    // Fetch real statistics from database
    const [
      { data: assessments, error: assessmentsError },
      { data: students, error: studentsError },
      { data: insights, error: insightsError },
      { data: todayStats, error: todayStatsError }
    ] = await Promise.all([
      // Get assessments for this teacher
      supabase
        .from('assessment_analyses')
        .select('score, total_questions, student_name, created_at')
        .eq('teacher_id', user.id),
      
      // Get active students (unique student names from last 30 days)
      supabase
        .from('assessment_analyses')
        .select('student_name')
        .eq('teacher_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      
      // Get insights count
      supabase
        .from('ai_insights')
        .select('id')
        .eq('teacher_id', user.id),
      
      // Get today's stats
      supabase
        .from('teacher_stats')
        .select('*')
        .eq('teacher_id', user.id)
        .eq('date', today)
        .single()
    ]);

    if (assessmentsError) {
      console.error('Error fetching assessments:', assessmentsError);
    }
    if (studentsError) {
      console.error('Error fetching students:', studentsError);
    }
    if (insightsError) {
      console.error('Error fetching insights:', insightsError);
    }
    if (todayStatsError && todayStatsError.code !== 'PGRST116') {
      console.error('Error fetching today stats:', todayStatsError);
    }

    // Calculate statistics
    const activeStudents = new Set(students?.map(s => s.student_name) || []).size;
    
    const avgPerformance = assessments && assessments.length > 0 
      ? Math.round(assessments.reduce((sum, a) => sum + (a.score / a.total_questions * 100), 0) / assessments.length)
      : 0;
    
    const assessmentsToday = assessments?.filter(a => 
      a.created_at && a.created_at.startsWith(today)
    ).length || 0;
    
    const aiSuggestions = insights?.length || 0;

    const stats = {
      activeStudents,
      avgPerformance,
      assessmentsToday,
      aiSuggestions
    };

    // Update or insert today's stats
    if (todayStats) {
      await supabase
        .from('teacher_stats')
        .update({
          active_students: activeStudents,
          avg_performance: avgPerformance,
          assessments_today: assessmentsToday,
          ai_suggestions: aiSuggestions,
          total_assessments: assessments?.length || 0
        })
        .eq('id', todayStats.id);
    } else {
      await supabase
        .from('teacher_stats')
        .insert({
          teacher_id: user.id,
          active_students: activeStudents,
          avg_performance: avgPerformance,
          assessments_today: assessmentsToday,
          ai_suggestions: aiSuggestions,
          total_assessments: assessments?.length || 0
        });
    }

    return NextResponse.json({ stats });
    
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ 
      stats: {
        activeStudents: 0,
        avgPerformance: 0,
        assessmentsToday: 0,
        aiSuggestions: 0
      },
      error: error instanceof Error ? error.message : "Failed to fetch stats" 
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

    // Calculate statistics from manually inputted data
    const activeStudents = new Set(assessmentData?.map((a: any) => a.student_name) || []).size;
    
    const avgPerformance = assessmentData && assessmentData.length > 0 
      ? Math.round(assessmentData.reduce((sum: number, a: any) => sum + (a.score / a.total_questions * 100), 0) / assessmentData.length)
      : 0;
    
    const assessmentsToday = assessmentData?.filter((a: any) => {
      const today = new Date().toISOString().split('T')[0];
      return a.created_at && a.created_at.startsWith(today);
    }).length || 0;
    
    const aiSuggestions = assessmentData?.length || 0;

    const stats = {
      activeStudents,
      avgPerformance,
      assessmentsToday,
      aiSuggestions
    };

    return NextResponse.json({ stats });
    
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ 
      stats: {
        activeStudents: 0,
        avgPerformance: 0,
        assessmentsToday: 0,
        aiSuggestions: 0
      },
      error: error instanceof Error ? error.message : "Failed to calculate stats" 
    }, { status: 500 });
  }
}

