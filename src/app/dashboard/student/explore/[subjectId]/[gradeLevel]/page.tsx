// frontend/src/app/dashboard/student/explore/[subjectId]/[gradeLevel]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, Circle } from "lucide-react";

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ subjectId: string; gradeLevel: string }>;
}) {
  const { subjectId, gradeLevel } = await params;
  const subjectName = decodeURIComponent(subjectId);
  const gradeLevelName = decodeURIComponent(gradeLevel);
  const supabase = await createClient();

  // Fetch all indicators for this specific subject AND grade level through the new hierarchy
  const { data: indicators } = await supabase
    .from("curriculum_indicators")
    .select(
      `
      *,
      lesson_completions(student_id),
      curriculum_sub_strands!inner(
        name,
        curriculum_strands!inner(
          name,
          curriculum_subjects!inner(name, grade_level)
        )
      )
    `
    )
    .eq(
      "curriculum_sub_strands.curriculum_strands.curriculum_subjects.name",
      subjectName
    )
    .eq(
      "curriculum_sub_strands.curriculum_strands.curriculum_subjects.grade_level",
      gradeLevelName
    )
    .order("content_standard");

  if (!indicators || indicators.length === 0) {
    return (
      <p>No learning indicators found for this subject and grade level yet.</p>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-brand-blue">{subjectName}</h1>
      <p className="text-slate-600 mb-2">Form {gradeLevelName}</p>
      <p className="text-slate-600 mb-8">
        All official topics based on the SBC curriculum.
      </p>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <ul className="space-y-3">
          {indicators.map((indicator) => (
            <li key={indicator.id}>
              <Link href={`/dashboard/student/learn/${indicator.id}`}>
                <div className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors border">
                  <div className="flex items-center space-x-3">
                    {indicator.lesson_completions.length > 0 ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-slate-400" />
                    )}
                    <div>
                      <span className="font-medium text-brand-blue">
                        {indicator.content_standard}
                      </span>
                      <p className="text-xs text-slate-500">
                        {indicator.indicator_text}
                      </p>
                      <p className="text-xs text-slate-400">
                        {
                          indicator.curriculum_sub_strands.curriculum_strands
                            .name
                        }{" "}
                        → {indicator.curriculum_sub_strands.name}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    {indicator.lesson_completions.length > 0
                      ? "Review"
                      : "Start Learning"}
                  </Button>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
