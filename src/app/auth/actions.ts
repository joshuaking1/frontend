// src/app/auth/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    // In a production app, you might want to log this error
    console.error("Sign out error:", error);
    // Even if there's an error, we should try to redirect
  }
  
  // Redirect the user to the sign-in page after signing out.
  redirect('/auth/sign-in');
}