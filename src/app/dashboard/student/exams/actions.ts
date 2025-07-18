// frontend/src/app/dashboard/student/exams/actions.ts
"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Action 1: Start a new personalized mock exam
export async function startPersonalizedExam(examType: string, subject: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('User not authenticated');
        return { error: "Not authenticated" };
    }

    console.log('Starting exam for user:', user.id, 'Type:', examType, 'Subject:', subject);

    // First, let's try to get questions directly from question_bank instead of using the RPC
    const { data: questions, error: questionError } = await supabase
        .from('question_bank')
        .select('*')
        .eq('exam_type', examType)
        .eq('subject', subject)
        .limit(20);

    console.log('Questions found:', questions?.length || 0);
    console.log('Question error:', questionError);

    if (questionError) {
        console.error('Question fetch error:', questionError);
        return { error: `Database error: ${questionError.message}` };
    }

    if (!questions || questions.length === 0) {
        console.log('No questions found for', examType, subject);
        return { error: `No questions found for ${examType} ${subject}. Please try a different subject.` };
    }
    
    // Create the Exam Session in the database
    const { data: newExam, error: examError } = await supabase
        .from('mock_exams')
        .insert({ student_id: user.id, exam_type: examType, subject: subject })
        .select('id')
        .single();

    console.log('New exam created:', newExam);
    console.log('Exam error:', examError);

    if (examError) {
        console.error('Exam creation error:', examError);
        return { error: `Failed to create exam session: ${examError.message}` };
    }

    // Link the selected questions to this exam session
    const answersToInsert = questions.map((q: any) => ({ 
        exam_id: newExam.id, 
        question_id: q.id 
    }));
    
    const { error: answersError } = await supabase
        .from('mock_exam_answers')
        .insert(answersToInsert);

    if (answersError) {
        console.error('Answers insertion error:', answersError);
        return { error: `Failed to create exam answers: ${answersError.message}` };
    }

    console.log('Redirecting to exam:', newExam.id);
    
    // Redirect the user to the exam-taking page
    // Note: redirect() throws a NEXT_REDIRECT error which is expected behavior
    redirect(`/dashboard/student/exams/${newExam.id}`);
}

// Action 2: Submit an answer for a single question
export async function submitAnswer(answerId: string, studentAnswer: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };
    
    // Check if the answer is correct
    const { data: correctAnswerData } = await supabase
        .from('mock_exam_answers')
        .select(`question:question_bank (correct_answer)`)
        .eq('id', answerId)
        .single();
    
    const isCorrect = correctAnswerData?.question?.correct_answer === studentAnswer;

    const { error } = await supabase.from('mock_exam_answers')
        .update({ student_answer: studentAnswer, is_correct: isCorrect })
        .eq('id', answerId);

    if (error) return { error: "Failed to save answer." };
    return { success: true, isCorrect };
}

// Action 3: Finalize and grade the exam
export async function finishExam(examId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase.from('mock_exams')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', examId);
    
    if (error) return { error: "Failed to finalize exam." };

    // When the exam is finished, revalidate the path for the report page to ensure it can be accessed.
    revalidatePath(`/dashboard/student/exams/${examId}/report`);
    redirect(`/dashboard/student/exams/${examId}/report`);
}
