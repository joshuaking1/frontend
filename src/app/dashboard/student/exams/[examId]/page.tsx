import { createClient } from "@/lib/supabase/server";
import { ExamClient } from "@/components/student/ExamClient";

export default async function ExamTakingPage({
  params,
}: {
  params: { examId: string };
}) {
  const supabase = await createClient();
  const { data: examDetails } = await supabase
    .from("mock_exams")
    .select("*")
    .eq("id", params.examId)
    .single();
  const { data: questions, error: questionsError } = await supabase
    .from("mock_exam_answers")
    .select(`*, question:question_bank(*)`)
    .eq("exam_id", params.examId)
    .order("created_at", { ascending: true });

  console.log('Exam details:', examDetails);
  console.log('Questions data:', questions);
  console.log('Questions error:', questionsError);

  // If no questions found, show error
  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">No Questions Found</h1>
        <p className="text-gray-600">This exam doesn't have any questions. Please go back and try again.</p>
      </div>
    );
  }

  return (
    <ExamClient examDetails={examDetails} initialQuestions={questions || []} />
  );
}
