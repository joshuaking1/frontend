// frontend/src/app/api/student/learn/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { topicId } = body;

    if (!topicId) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 });
    }

    // Check if already completed
    const { data: existingCompletion } = await supabase
      .from('lesson_completions')
      .select('id')
      .eq('student_id', user.id)
      .eq('topic_id', topicId)
      .maybeSingle();

    if (existingCompletion) {
      return NextResponse.json({ success: true, message: 'Already completed' });
    }

    // Mark as complete
    const { error } = await supabase
      .from('lesson_completions')
      .insert({
        student_id: user.id,
        topic_id: topicId,
        completed_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error marking lesson as complete:', error);
      return NextResponse.json({ error: 'Failed to mark lesson as complete' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Mark complete error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to mark lesson as complete" 
    }, { status: 500 });
  }
}
