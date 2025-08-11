// frontend/src/app/dashboard/student/explore/[subjectId]/[strandId]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";

export default async function StrandSubStrandsPage({
  params,
}: {
  params: Promise<{ subjectId: string; strandId: string }>;
}) {
  const { subjectId, strandId } = await params;
  const supabase = await createClient();

  // Fetches from `curriculum_sub_strands`
  const { data: subStrands } = await supabase
    .from("curriculum_sub_strands")
    .select("*")
    .eq("strand_id", strandId);

  // Get strand details for display
  const { data: strand } = await supabase
    .from("curriculum_strands")
    .select(
      `
      *,
      curriculum_subjects(name, grade_level)
    `
    )
    .eq("id", strandId)
    .eq("subject_id", subjectId)
    .single();

  if (!strand) {
    notFound();
  }

  if (!subStrands || subStrands.length === 0) {
    return (
      <div>
        <h1 className="text-4xl font-bold text-brand-blue">{strand.name}</h1>
        <p className="text-slate-600 mb-2">
          {strand.curriculum_subjects.name} - Form{" "}
          {strand.curriculum_subjects.grade_level}
        </p>
        <div className="text-center py-20 border-2 border-dashed rounded-lg mt-8">
          <p className="text-slate-500">
            No sub-strands found for this strand yet.
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
      <h1 className="text-4xl font-bold text-brand-blue">{strand.name}</h1>
      <p className="text-slate-600 mb-2">
        {strand.curriculum_subjects.name} - Form{" "}
        {strand.curriculum_subjects.grade_level}
      </p>
      <p className="text-slate-600 mb-8">
        Choose a sub-strand to explore the learning indicators.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subStrands.map((subStrand) => (
          <Link
            key={subStrand.id}
            href={`/dashboard/student/explore/${subjectId}/${strandId}/${subStrand.id}`}
          >
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-brand-orange" />
                <CardTitle className="pt-4 text-brand-blue">
                  {subStrand.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-slate-500">Explore learning indicators</p>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
