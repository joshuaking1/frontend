// frontend/src/app/dashboard/student/essay-helper/[essayId]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { EssayEditorShell } from "@/components/student/EssayEditorShell";

export default async function EssayHelperPage({
  params,
}: {
  params: Promise<{ essayId: string }>;
}) {
  const { essayId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/sign-in");
  }

  // Fetch the essay and its saved analyses in parallel for maximum performance
  const [essayResult, analysesResult] = await Promise.all([
    supabase
      .from("essays")
      .select("*")
      .eq("id", essayId)
      .eq("student_id", user.id)
      .single(),
    supabase
      .from("essay_analysis")
      .select("*")
      .eq("essay_id", essayId)
      .order("created_at", { ascending: false }),
  ]);

  const { data: essay, error: essayError } = essayResult;
  const { data: analyses, error: analysesError } = analysesResult;

  if (essayError || !essay) {
    notFound();
  }

  // Pass the fetched data as props to the client component
  return (
    <EssayEditorShell initialEssay={essay} savedAnalyses={analyses || []} />
  );
}
