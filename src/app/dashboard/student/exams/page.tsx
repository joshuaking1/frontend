// frontend/src/app/dashboard/student/exams/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { startPersonalizedExam } from "./actions";

export default async function ExamsPage() {
    const supabase = await createClient();
    // Fetch distinct subjects available for WASSCE to dynamically create buttons
    const { data: allSubjects } = await supabase
        .from('question_bank')
        .select('subject')
        .eq('exam_type', 'WASSCE');
    
    // Get unique subjects
    const wassceSubjects = [...new Set(allSubjects?.map(s => s.subject))]
        .filter(Boolean)
        .map(subject => ({ subject }));

    return (
        <div>
            <h1 className="text-3xl font-bold text-brand-blue">WASSCE & BECE Oracle</h1>
            <p className="text-slate-600 mb-6">Take a mock exam intelligently generated to target your personal weaknesses.</p>
            <Card className="bg-white">
                <CardHeader>
                    <CardTitle>Start a New WASSCE Mock Exam</CardTitle>
                    <CardDescription>Select a subject to begin your personalized session.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    {wassceSubjects?.map(s => s.subject && (
                        <form key={s.subject} action={startPersonalizedExam.bind(null, "WASSCE", s.subject)}>
                            <Button type="submit">{s.subject}</Button>
                        </form>
                    ))}
                </CardContent>
            </Card>
            {/* Add another card for BECE exams here */}
        </div>
    );
}
