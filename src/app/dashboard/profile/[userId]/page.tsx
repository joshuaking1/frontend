// src/app/dashboard/profile/[userId]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, MessageSquare } from "lucide-react";

export default async function UserProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  const supabase = await createClient();

  // Fetch profile data and stats in parallel
  const [profileResult, statsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", params.userId).single(),
    supabase.rpc("get_user_stats", { user_id_param: params.userId }).single(),
  ]);

  const { data: profile, error: profileError } = profileResult;
  const { data: stats, error: statsError } = statsResult;

  if (profileError || !profile) {
    notFound();
  }

  const fallbackInitial = profile.full_name
    ? profile.full_name.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="p-8">
      <div className="flex flex-col items-center">
        <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
          <AvatarImage
            src={profile.avatar_url || undefined}
            alt={profile.full_name || "User"}
          />
          <AvatarFallback className="text-5xl">
            {fallbackInitial}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-3xl font-bold mt-4 text-brand-blue">
          {profile.full_name}
        </h1>
        <p className="text-slate-500">
          Joined on {new Date(profile.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Stats Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Lessons Completed
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.lessons_completed ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Achievements Unlocked
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.achievements_unlocked ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Posts Created</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.posts_created ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* More sections like "Circles they are in" or "Recent Activity" could be added here later */}
    </div>
  );
}
