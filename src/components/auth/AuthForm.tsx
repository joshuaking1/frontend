// src/components/auth/AuthForm.tsx
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(['teacher', 'student'], { required_error: "You must select a role." }),
});

export const AuthForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "teacher",
    },
  });

  const handleSignUp = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          role: values.role, // This sends the role to our DB trigger
          full_name: "New User" // Placeholder name
        },
      },
    });

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
    } else {
      // Supabase sends a confirmation email.
      // We will later build a page to notify the user to check their email.
      // For local dev, Supabase logs a confirmation link in the Docker logs.
      // For now, we redirect to a placeholder page.
      alert("Sign up successful! Check your email (or Docker logs for the link) to confirm.");
      router.push('/auth/sign-in');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
        <h1 className="font-serif text-3xl font-bold text-center text-brand-blue">Create Your Account</h1>
        <p className="text-center text-slate-600 mt-2 mb-8">Join the revolution in Ghanaian education.</p>
        
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className="text-lg font-semibold text-brand-blue">I am a...</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <div className="w-full">
                                                <RadioGroupItem value="teacher" id="teacher" className="sr-only peer" />
                                                <Label htmlFor="teacher" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-brand-orange [&:has([data-state=checked])]:border-brand-orange cursor-pointer">
                                                    👩‍🏫 Teacher
                                                </Label>
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                     <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                             <div className="w-full">
                                                <RadioGroupItem value="student" id="student" className="sr-only peer" />
                                                <Label htmlFor="student" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-brand-orange [&:has([data-state=checked])]:border-brand-orange cursor-pointer">
                                                    🎓 Student
                                                </Label>
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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

                <Button type="submit" disabled={isSubmitting} className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white text-lg py-6">
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
            </form>
        </Form>
        <p className="text-center mt-4 text-sm text-slate-600">
            Already have an account?{' '}
            <a href="/auth/sign-in" className="font-semibold text-brand-orange hover:underline">
                Sign In
            </a>
        </p>
    </div>
  );
};