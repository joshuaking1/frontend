// src/app/dashboard/student/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LearningFeed } from '@/components/dashboard/LearningFeed';
import { InteractiveLearningHub } from '@/components/student/InteractiveLearningHub';
import { Button } from '@/components/ui/button';
import { revalidatePath } from "next/cache";
import Link from 'next/link';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';

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
    <div className="space-y-8">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-brand-blue mb-4">Hello, {profile?.full_name || 'Student'}!</h1>
            <p className="text-xl text-slate-600 mb-8">Ready to explore and learn something new today?</p>
        </div>

        {/* Interactive Learning Hub */}
        <div className="bg-gradient-to-r from-brand-blue/5 to-brand-orange/5 rounded-2xl p-8 border-2 border-dashed border-brand-blue/20">
            <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-gradient-to-r from-brand-blue to-brand-orange rounded-full">
                        <BookOpen className="h-12 w-12 text-white" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-brand-blue mb-2">AI-Powered Learning Hub</h2>
                <p className="text-lg text-slate-600 mb-6">
                    Tell me what you want to learn, and I'll create a personalized learning experience just for you!
                </p>
                <Link href="/dashboard/student/learn">
                    <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-4 text-lg">
                        <Sparkles className="mr-2 h-6 w-6" />
                        Start Learning Now
                        <ArrowRight className="ml-2 h-6 w-6" />
                    </Button>
                </Link>
            </div>
        </div>
        
        {/* --- DEV-ONLY SIMULATION BUTTON --- */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 my-4" role="alert">
            <p className="font-bold">Developer Tool</p>
            <p>Simulate passing a quiz to test the &rsquo;Quiz Champion&rsquo; achievement.</p>
            <form action={submitFakeQuiz} className="mt-2">
                <Button type="submit" variant="outline" size="sm">Submit Fake Quiz (Score &gt;80%)</Button>
            </form>
        </div>
        {/* --- END DEV-ONLY --- */}

        <LearningFeed />
    </div>
  );
}
