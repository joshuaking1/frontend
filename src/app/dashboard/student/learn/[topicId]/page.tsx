// src/app/dashboard/student/learn/[topicId]/page.tsx
import { generateStudentLesson } from "../actions";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MarkCompleteButton } from "@/components/dashboard/MarkCompleteButton";

export default async function LearningModulePage({
  params,
}: {
  params: { topicId: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch lesson and check if it's already completed in parallel
  const [lessonResult, completionResult] = await Promise.all([
    generateStudentLesson(params.topicId),
    user ? supabase.from('lesson_completions').select('id').eq('student_id', user.id).eq('topic_id', params.topicId).maybeSingle() : Promise.resolve({ data: null })
  ]);
  
  const { lesson, error } = lessonResult;
  const isCompleted = !!completionResult?.data;

  if (error || !lesson) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">
          Oops! Something went wrong.
        </h1>
        <p className="text-slate-600">
          {error || "Could not load the lesson."}
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/student/explore">Go Back to Subjects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button asChild variant="outline">
          <Link href="/dashboard/student/explore">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Topics
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-brand-blue">{lesson.title}</h1>
        <MarkCompleteButton topicId={params.topicId} isCompleted={isCompleted} />
      </div>

      {/* Lesson Content Card */}
      <Card className="bg-white">
        <CardContent className="p-8">
          <article className="prose lg:prose-xl max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {lesson.content}
            </ReactMarkdown>
          </article>
        </CardContent>
      </Card>
    </div>
  );
}
