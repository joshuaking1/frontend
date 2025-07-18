// frontend/src/app/dashboard/student/essay-helper/page.tsx
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
// Import our new, 100x component
import { CreateEssayDialog } from "@/components/student/CreateEssayDialog";

export default async function EssayListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: essays } = await supabase
    .from("essays")
    .select("*")
    .eq("student_id", user.id) // Only fetch the logged-in user's essays
    .order("updated_at", { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-blue">My Essays</h1>
          <p className="text-slate-600">
            Your personal workspace for drafting and refining your writing.
          </p>
        </div>
        {/* The shameful placeholder is GONE, replaced by the complete component */}
        <CreateEssayDialog />
      </div>

      {essays && essays.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {essays.map((essay) => (
            <Link
              key={essay.id}
              href={`/dashboard/student/essay-helper/${essay.id}`}
            >
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-4">
                  <h3 className="font-bold text-brand-blue truncate">
                    {essay.title}
                  </h3>
                  <p className="text-sm text-slate-500">Topic: {essay.topic}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    Last updated:{" "}
                    {new Date(essay.updated_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <p className="text-slate-500">You haven't created any essays yet.</p>
          <p className="text-slate-500 mt-1">
            Click "Create New Essay" to get started.
          </p>
        </div>
      )}
    </div>
  );
}
