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
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-blue">My Essays</h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Your personal workspace for drafting and refining your writing.
          </p>
        </div>
        <div className="flex-shrink-0">
          <CreateEssayDialog />
        </div>
      </div>

      {essays && essays.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {essays.map((essay) => (
            <Link
              key={essay.id}
              href={`/dashboard/student/essay-helper/${essay.id}`}
              className="block"
            >
              <Card className="hover:shadow-lg transition-shadow h-full cursor-pointer group">
                <CardContent className="p-4 h-full flex flex-col">
                  <h3 className="font-bold text-brand-blue text-sm sm:text-base line-clamp-2 group-hover:text-brand-blue/80 transition-colors">
                    {essay.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-1">
                    Topic: {essay.topic}
                  </p>
                  <p className="text-xs text-slate-400 mt-auto pt-2">
                    Last updated:{" "}
                    {new Date(essay.updated_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-20 border-2 border-dashed rounded-lg">
          <p className="text-slate-500 text-sm sm:text-base">You haven't created any essays yet.</p>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Click "Create New Essay" to get started.
          </p>
        </div>
      )}
    </div>
  );
}
