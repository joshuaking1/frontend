// src/app/onboarding/teacher/page.tsx
import { TeacherOnboardingForm } from "@/components/onboarding/TeacherOnboardingForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function TeacherOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <TeacherOnboardingForm userEmail={user.email || ""} />
    </div>
  );
}
