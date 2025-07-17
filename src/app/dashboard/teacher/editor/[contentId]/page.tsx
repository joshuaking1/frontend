// frontend/src/app/dashboard/teacher/editor/[contentId]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EditorShell } from "@/components/editor/EditorShell"; // To be created

export default async function ContentEditorPage({
  params,
}: {
  params: { contentId: string };
}) {
  const supabase = await createClient();

  // Fetch the specific piece of content to be edited
  const { data: contentItem } = await supabase
    .from("teacher_content")
    .select("*")
    .eq("id", params.contentId)
    .single();

  if (!contentItem) {
    notFound();
  }

  // Fetch all of the teacher's content for the file explorer sidebar
  const { data: allContent } = await supabase
    .from("teacher_content")
    .select("id, title, content_type")
    .order("updated_at", { ascending: false });

  return (
    // The EditorShell will be a client component that houses the entire 3-column layout
    <EditorShell initialContent={contentItem} contentList={allContent || []} />
  );
}
