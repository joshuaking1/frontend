// src/app/dashboard/teacher/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bot,
  FileText,
  BookOpen,
  Users,
  BarChart3,
  Wrench,
} from "lucide-react";

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

  const quickActions = [
    {
      title: "AI Lesson Planner",
      description: "Generate lesson plans with AI assistance",
      icon: Bot,
      href: "/dashboard/teacher/lesson-planner",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Create Assessment",
      description: "Build quizzes and tests quickly",
      icon: FileText,
      href: "/dashboard/teacher/assessments",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Content Editor",
      description: "Create and edit learning materials",
      icon: BookOpen,
      href: "/dashboard/teacher/editor",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "AI Co-Teachers",
      description: "Get help from AI teaching assistants",
      icon: Users,
      href: "/dashboard/teacher/co-teacher",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      title: "View Analytics",
      description: "Track student progress and performance",
      icon: BarChart3,
      href: "/dashboard/teacher/analytics",
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      title: "Advanced Tools",
      description: "Access specialized teaching tools",
      icon: Wrench,
      href: "/dashboard/teacher/advanced-tools",
      color: "bg-red-500 hover:bg-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-blue mb-2">
          Welcome back, {profile?.full_name || "Teacher"}!
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mb-6">
          Quick Actions Widget
        </p>
      </div>

      {/* Quick Actions Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-brand-blue">
            Quick Actions
          </CardTitle>
          <CardDescription>
            Jump into your most-used teaching tools and features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 w-full hover:shadow-md transition-all duration-200 border-2 hover:border-brand-orange"
                >
                  <div
                    className={`p-3 rounded-full ${action.color} text-white`}
                  >
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-sm">{action.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {action.description}
                    </p>
                  </div>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
