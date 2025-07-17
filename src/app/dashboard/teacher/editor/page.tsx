// frontend/src/app/dashboard/teacher/editor/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

export default async function EditorLoaderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // This should theoretically be caught by middleware, but it's good practice
    redirect("/auth/sign-in");
  }

  // Fetch only the ID of the most recently updated piece of content for this user.
  const { data: latestContent, error } = await supabase
    .from("teacher_content")
    .select("id")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !latestContent) {
    // If the user has no content yet, we can't redirect.
    // We should show a welcome message and a prompt to create their first piece of content.
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-brand-blue">
          Welcome to the Content Hub!
        </h1>
        <p className="text-slate-600 mt-2">
          You haven't created any content yet.
        </p>
        <p className="text-slate-600">
          Please go to a generator tool to create your first lesson plan or
          rubric.
        </p>
        {/* In a future step, a "Create New" button here would be ideal. */}
      </div>
    );
  }

  // If we found content, redirect to the editor page for that specific content ID.
  redirect(`/dashboard/teacher/editor/${latestContent.id}`);

  // This part is unreachable due to the redirect, but it's good practice
  // to have a fallback return statement or a loading indicator.
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      <p className="ml-4">Loading your content...</p>
    </div>
  );
}
