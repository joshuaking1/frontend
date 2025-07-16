// src/app/onboarding/student/page.tsx
import { StudentOnboardingForm } from "@/components/onboarding/StudentOnboardingForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function StudentOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <StudentOnboardingForm userEmail={user.email || ""} />
    </div>
  );
}
