// src/app/auth/sign-in/page.tsx
import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <SignInForm />
    </div>
  );
}
