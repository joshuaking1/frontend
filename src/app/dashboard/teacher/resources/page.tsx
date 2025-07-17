// frontend/src/app/dashboard/teacher/resources/page.tsx
import { createClient } from "@/lib/supabase/server";
import { ContentTable } from "@/components/dashboard/ContentTable"; // To be created

export default async function MyContentPage() {
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-brand-blue mb-2">
          My Content Hub
        </h1>
        <p className="text-slate-600 mb-6">
          Please log in to view your content.
        </p>
      </div>
    );
  }
  
  const { data: contentItems } = await supabase
    .from("teacher_content")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-blue mb-2">
        My Content Hub
      </h1>
      <p className="text-slate-600 mb-6">
        A unified view of all lesson plans, assessments, and resources you've
        created or uploaded.
      </p>
      <ContentTable initialContent={contentItems || []} />
    </div>
  );
}
