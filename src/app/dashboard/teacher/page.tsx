// src/app/dashboard/teacher/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function TeacherDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-blue mb-2">
        Welcome back, {profile?.full_name || "Teacher"}!
      </h1>
      <p className="text-slate-600 mb-6">
        Here's your overview for today. More widgets coming soon!
      </p>
      {/* Placeholder for dashboard widgets */}
    </div>
  );
}
