// src/components/auth/SignInForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password cannot be empty." }),
});

export const SignInForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleSignIn = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
    } else {
      // Successful sign-in will trigger the middleware to redirect the user
      // to the correct page (onboarding or dashboard).
      // We just need to refresh the page to trigger the middleware check.
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="font-serif text-3xl font-bold text-center text-brand-blue">
        Welcome Back
      </h1>
      <p className="text-center text-slate-600 mt-2 mb-8">
        Sign in to continue your journey.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-brand-blue">Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-brand-blue">Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white text-lg py-6"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </Form>
      <p className="text-center mt-4 text-sm text-slate-600">
        Don't have an account?{" "}
        <a
          href="/auth/sign-up"
          className="font-semibold text-brand-orange hover:underline"
        >
          Sign Up
        </a>
      </p>
    </div>
  );
};
