// frontend/src/app/api/teacher/coach/insights/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface ProactiveInsight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'critical';
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  category: 'performance' | 'curriculum' | 'engagement' | 'resources' | 'trends';
  confidence: number;
  affectedStudents?: string[];
  suggestedResources?: string[];
  timeline?: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // First, get existing insights from database
    const { data: existingInsights, error: insightsError } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (insightsError) {
      console.error('Error fetching existing insights:', insightsError);
    }

    // If we have existing insights, return them
    if (existingInsights && existingInsights.length > 0) {
      const formattedInsights = existingInsights.map(insight => ({
        id: insight.id,
        type: insight.insight_type,
        title: insight.title,
        description: insight.description,
        action: insight.action,
        priority: insight.priority,
        category: insight.category,
        confidence: insight.confidence,
        affectedStudents: insight.affected_students || [],
        suggestedResources: insight.suggested_resources || [],
        timeline: insight.timeline
      }));

      return NextResponse.json({ insights: formattedInsights });
    }

    // If no existing insights, try to generate new ones from assessment data
    const { data: recentAssessments, error: assessmentsError } = await supabase
      .from('assessment_analyses')
      .select('*')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: curriculumUpdates, error: curriculumError } = await supabase
      .from('sbc_curriculum_documents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (assessmentsError) {
      console.error('Error fetching assessments:', assessmentsError);
    }
    if (curriculumError) {
      console.error('Error fetching curriculum updates:', curriculumError);
    }

    // Generate proactive insights from real data
    let insights = await generateProactiveInsights(recentAssessments || [], curriculumUpdates || [], supabase);

    // If no insights generated and no assessments, create some helpful default insights
    if (insights.length === 0 && (!recentAssessments || recentAssessments.length === 0)) {
      insights = [
        {
          id: 'welcome-1',
          type: 'info' as const,
          title: 'Welcome to AI Co-Teacher!',
          description: 'Start by adding student assessment data to get personalized AI insights and recommendations.',
          action: 'Go to the Assessments tab and input your first student assessment',
          priority: 'medium' as const,
          category: 'engagement' as const,
          confidence: 1.0,
          suggestedResources: ['Assessment templates', 'Student progress tracking'],
          timeline: 'Get started today'
        },
        {
          id: 'welcome-2',
          type: 'success' as const,
          title: 'AI-Powered Teaching Assistant',
          description: 'Your AI co-teacher can analyze student performance, identify learning gaps, and suggest targeted interventions.',
          action: 'Explore the multi-modal search feature to find educational resources',
          priority: 'low' as const,
          category: 'resources' as const,
          confidence: 1.0,
          suggestedResources: ['YouTube educational videos', 'Interactive worksheets', 'Curriculum-aligned content'],
          timeline: 'Available now'
        },
        {
          id: 'welcome-3',
          type: 'info' as const,
          title: 'Real-time Analytics',
          description: 'Track student progress, identify trends, and get proactive recommendations for improving learning outcomes.',
          action: 'Add assessment data to see real-time performance analytics',
          priority: 'medium' as const,
          category: 'performance' as const,
          confidence: 1.0,
          suggestedResources: ['Performance dashboards', 'Trend analysis', 'Predictive insights'],
          timeline: 'After first assessment'
        }
      ];
    }

    // Save insights to database
    if (insights.length > 0) {
      const insightsToSave = insights.map(insight => ({
        teacher_id: user.id,
        insight_type: insight.type,
        title: insight.title,
        description: insight.description,
        action: insight.action,
        priority: insight.priority,
        category: insight.category,
        confidence: insight.confidence,
        affected_students: insight.affectedStudents || [],
        suggested_resources: insight.suggestedResources || [],
        timeline: insight.timeline
      }));

      await supabase.from('ai_insights').insert(insightsToSave);
    }

    return NextResponse.json({ insights });
    
  } catch (error) {
    console.error("Proactive insights error:", error);
    return NextResponse.json({ 
      insights: [],
      error: error instanceof Error ? error.message : "Failed to generate insights" 
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
    const { assessmentData, curriculumData } = body;

    // Generate proactive insights from manually inputted data
    const insights = await generateProactiveInsights(assessmentData || [], curriculumData || [], supabase);

    return NextResponse.json({ insights });
    
  } catch (error) {
    console.error("Proactive insights error:", error);
    return NextResponse.json({ 
      insights: [],
      error: error instanceof Error ? error.message : "Failed to generate insights" 
    }, { status: 500 });
  }
}

async function generateProactiveInsights(assessments: any[], curriculumUpdates: any[], supabase: any): Promise<ProactiveInsight[]> {
  const insights: ProactiveInsight[] = [];

  // 1. Performance-based insights
  if (assessments.length > 0) {
    const performanceInsights = await analyzePerformance(assessments, supabase);
    insights.push(...performanceInsights);
  }

  // 2. Curriculum-based insights
  if (curriculumUpdates.length > 0) {
    const curriculumInsights = await analyzeCurriculum(curriculumUpdates, supabase);
    insights.push(...curriculumInsights);
  }

  // 3. Engagement insights
  const engagementInsights = await analyzeEngagement(assessments, supabase);
  insights.push(...engagementInsights);

  // 4. Resource recommendations
  const resourceInsights = await analyzeResources(assessments, supabase);
  insights.push(...resourceInsights);

  // Sort by priority and confidence
  return insights.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.confidence - a.confidence;
  });
}

async function analyzePerformance(assessments: any[], supabase: any): Promise<ProactiveInsight[]> {
  const insights: ProactiveInsight[] = [];
  
  if (assessments.length === 0) {
    return insights;
  }
  
  // Calculate average performance
  const avgScore = assessments.reduce((sum, a) => sum + (a.score / a.total_questions * 100), 0) / assessments.length;
  
  // Low performance alert
  if (avgScore < 60) {
    insights.push({
      id: 'perf-low-' + Date.now(),
      type: 'critical',
      title: 'Low Class Performance Alert',
      description: `Average class performance is ${avgScore.toFixed(1)}%, indicating significant learning gaps.`,
      action: 'Review lesson plans and implement immediate intervention strategies',
      priority: 'high',
      category: 'performance',
      confidence: 0.9,
      affectedStudents: assessments.map(a => a.student_name),
      suggestedResources: ['Remedial worksheets', 'Video tutorials', 'One-on-one sessions'],
      timeline: 'Immediate action required'
    });
  }

  // Performance improvement
  if (assessments.length >= 2) {
    const recent = assessments.slice(0, Math.ceil(assessments.length / 2));
    const older = assessments.slice(Math.ceil(assessments.length / 2));
    
    const recentAvg = recent.reduce((sum, a) => sum + (a.score / a.total_questions * 100), 0) / recent.length;
    const olderAvg = older.reduce((sum, a) => sum + (a.score / a.total_questions * 100), 0) / older.length;
    
    if (recentAvg > olderAvg + 10) {
      insights.push({
        id: 'perf-improve-' + Date.now(),
        type: 'success',
        title: 'Performance Improvement Detected',
        description: `Class performance has improved by ${(recentAvg - olderAvg).toFixed(1)}% in recent assessments.`,
        action: 'Continue current teaching strategies and share best practices',
        priority: 'low',
        category: 'performance',
        confidence: 0.8,
        timeline: 'Continue monitoring'
      });
    }
  }

  return insights;
}

async function analyzeCurriculum(curriculumUpdates: any[], supabase: any): Promise<ProactiveInsight[]> {
  const insights: ProactiveInsight[] = [];

  if (curriculumUpdates && curriculumUpdates.length > 0) {
    insights.push({
      id: 'curriculum-update-' + Date.now(),
      type: 'info',
      title: 'Curriculum Updates Available',
      description: `${curriculumUpdates.length} new curriculum documents have been updated.`,
      action: 'Review updated curriculum materials and adjust lesson plans accordingly',
      priority: 'medium',
      category: 'curriculum',
      confidence: 1.0,
      suggestedResources: curriculumUpdates.map(c => c.title || 'Curriculum Document'),
      timeline: 'Within 1 week'
    });
  }

  return insights;
}

async function analyzeEngagement(assessments: any[], supabase: any): Promise<ProactiveInsight[]> {
  const insights: ProactiveInsight[] = [];

  if (assessments.length === 0) {
    return insights;
  }

  // Analyze completion rates
  const completionRate = assessments.filter(a => a.score > 0).length / assessments.length;
  
  if (completionRate < 0.8) {
    insights.push({
      id: 'engagement-low-' + Date.now(),
      type: 'warning',
      title: 'Low Assessment Completion Rate',
      description: `Only ${(completionRate * 100).toFixed(1)}% of students are completing assessments.`,
      action: 'Investigate barriers to completion and implement engagement strategies',
      priority: 'high',
      category: 'engagement',
      confidence: 0.85,
      suggestedResources: ['Gamification tools', 'Shorter assessments', 'Interactive content'],
      timeline: 'Within 3 days'
    });
  }

  return insights;
}

async function analyzeResources(assessments: any[], supabase: any): Promise<ProactiveInsight[]> {
  const insights: ProactiveInsight[] = [];

  if (assessments.length === 0) {
    return insights;
  }

  // Get common weak areas
  const weakAreas = assessments.flatMap(a => 
    a.analysis_data?.weaknesses || []
  );

  if (weakAreas.length > 0) {
    const commonWeakAreas = [...new Set(weakAreas)];
    
    insights.push({
      id: 'resources-needed-' + Date.now(),
      type: 'info',
      title: 'Additional Resources Recommended',
      description: `Students are struggling with: ${commonWeakAreas.slice(0, 3).join(', ')}`,
      action: 'Find and provide additional learning resources for these topics',
      priority: 'medium',
      category: 'resources',
      confidence: 0.7,
      suggestedResources: ['Video tutorials', 'Practice worksheets', 'Interactive simulations'],
      timeline: 'Within 1 week'
    });
  }

  return insights;
}
