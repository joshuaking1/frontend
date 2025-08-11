// frontend/src/app/dashboard/student/explore/[subjectId]/[strandId]/[subStrandId]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, Circle } from "lucide-react";

export default async function SubStrandIndicatorsPage({
  params,
}: {
  params: Promise<{ subjectId: string; strandId: string; subStrandId: string }>;
}) {
  const { subjectId, strandId, subStrandId } = await params;
  const supabase = await createClient();

  // Fetches from `curriculum_indicators`
  const { data: indicators } = await supabase
    .from("curriculum_indicators")
    .select("*")
    .eq("sub_strand_id", subStrandId);
  // This is the final page that lists the actual learning indicators, ready to be clicked.

  // Get sub-strand details for display
  const { data: subStrand } = await supabase
    .from("curriculum_sub_strands")
    .select(
      `
      *,
      curriculum_strands!inner(
        name,
        curriculum_subjects!inner(name, grade_level)
      )
    `
    )
    .eq("id", subStrandId)
    .eq("strand_id", strandId)
    .eq("curriculum_strands.subject_id", subjectId)
    .single();

  if (!subStrand) {
    notFound();
  }

  if (!indicators || indicators.length === 0) {
    return (
      <div>
        <h1 className="text-4xl font-bold text-brand-blue">{subStrand.name}</h1>
        <p className="text-slate-600 mb-2">
          {subStrand.curriculum_strands.curriculum_subjects.name} - Form{" "}
          {subStrand.curriculum_strands.curriculum_subjects.grade_level}
        </p>
        <p className="text-slate-600 mb-2">
          {subStrand.curriculum_strands.name} → {subStrand.name}
        </p>
        <div className="text-center py-20 border-2 border-dashed rounded-lg mt-8">
          <p className="text-slate-500">
            No learning indicators found for this sub-strand yet.
          </p>
          <p className="text-slate-500 mt-1">
            The curriculum document may still be processing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-brand-blue">{subStrand.name}</h1>
      <p className="text-slate-600 mb-2">
        {subStrand.curriculum_strands.curriculum_subjects.name} - Form{" "}
        {subStrand.curriculum_strands.curriculum_subjects.grade_level}
      </p>
      <p className="text-slate-600 mb-8">
        {subStrand.curriculum_strands.name} → {subStrand.name}
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
