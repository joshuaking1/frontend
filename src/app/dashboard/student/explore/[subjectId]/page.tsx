// src/app/dashboard/student/explore/[subjectId]/page.tsx
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

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const supabase = await createClient();

  // Fetch strands for this subject
  const { data: strands } = await supabase
    .from("curriculum_strands")
    .select(
      `
      *,
      curriculum_subjects!inner(name, grade_level)
    `
    )
    .eq("subject_id", subjectId);

  // Get subject details for display
  const { data: subject } = await supabase
    .from("curriculum_subjects")
    .select("*")
    .eq("id", subjectId)
    .single();

  if (!subject) {
    notFound();
  }

  if (!strands || strands.length === 0) {
    return (
      <div>
        <h1 className="text-4xl font-bold text-brand-blue">{subject.name}</h1>
        <p className="text-slate-600 mb-2">Form {subject.grade_level}</p>
        <div className="text-center py-20 border-2 border-dashed rounded-lg mt-8">
          <p className="text-slate-500">
            No strands found for this subject yet.
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
      <h1 className="text-4xl font-bold text-brand-blue">{subject.name}</h1>
      <p className="text-slate-600 mb-2">Form {subject.grade_level}</p>
      <p className="text-slate-600 mb-8">
        Choose a strand to explore the learning topics and indicators.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strands.map((strand) => (
          <Link
            key={strand.id}
            href={`/dashboard/student/explore/${subjectId}/${strand.id}`}
          >
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-brand-orange" />
                <CardTitle className="pt-4 text-brand-blue">
                  {strand.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-slate-500">Explore sub-strands</p>
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
