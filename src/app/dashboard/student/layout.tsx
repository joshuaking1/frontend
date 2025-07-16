// src/app/dashboard/student/layout.tsx
import { StudentSidebar } from "@/components/dashboard/StudentSidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex bg-slate-50">
      <StudentSidebar
        userName={profile?.full_name || "Student"}
        avatarUrl={profile?.avatar_url || undefined}
      />
      <main className="flex-1 ml-72 p-8 min-h-screen">{children}</main>
    </div>
  );
}
