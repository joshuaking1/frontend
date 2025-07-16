// src/app/dashboard/student/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LearningFeed } from '@/components/dashboard/LearningFeed';
import { Button } from '@/components/ui/button';
import { revalidatePath } from "next/cache";

// Dev-only action to simulate submitting a quiz
async function submitFakeQuiz() {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Insert a new passed quiz attempt
    await supabase.from('quiz_attempts').insert({
        student_id: user.id,
        quiz_title: `Fake Quiz #${Math.floor(Math.random() * 1000)}`,
        score_percentage: Math.floor(Math.random() * 21) + 80, // Score between 80 and 100
    });

    // Call the handler function
    await supabase.rpc('handle_quiz_attempt', { student_id_param: user.id });

    revalidatePath('/dashboard/student/achievements');
}

export default async function StudentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { redirect('/auth/sign-in'); }
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();

  return (
    <div>
        <h1 className="text-3xl font-bold text-brand-blue mb-2">Hello, {profile?.full_name || &apos;Student&apos;}!</h1>
        <p className="text-slate-600 mb-8">Here&apos;s what&apos;s on your learning agenda today. Let&apos;s get started!</p>
        
        {/* --- DEV-ONLY SIMULATION BUTTON --- */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 my-4" role="alert">
            <p className="font-bold">Developer Tool</p>
            <p>Simulate passing a quiz to test the &apos;Quiz Champion&apos; achievement.</p>
            <form action={submitFakeQuiz} className="mt-2">
                <Button type="submit" variant="outline" size="sm">Submit Fake Quiz (Score &gt;80%)</Button>
            </form>
        </div>
        {/* --- END DEV-ONLY --- */}

        <LearningFeed />
    </div>
  );
}
