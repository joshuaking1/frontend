// src/app/dashboard/student/achievements/page.tsx
import { createClient } from "@/lib/supabase/server";
import { AchievementCard } from "@/components/dashboard/AchievementCard";
import { BookOpen, Award, Target, BrainCircuit, MessageSquare, Star } from "lucide-react";
import { redirect } from "next/navigation";

// Define all possible achievements in one place
const allAchievements = [
    { id: 'active_learner', icon: BookOpen, title: "Active Learner", description: "Complete 10 lessons." },
    { id: 'quiz_champion', icon: Award, title: "Quiz Champion", description: "Score 80%+ in 5 quizzes." },
    { id: 'improvement_star', icon: Target, title: "Improvement Star", description: "Improve a quiz score by 20% or more." },
    { id: 'challenge_master', icon: BrainCircuit, title: "Challenge Master", description: "Complete an AI-generated critical thinking challenge." },
    { id: 'community_starter', icon: MessageSquare, title: "Community Starter", description: "Start your first discussion in a Study Circle." },
    { id: 'subject_master', icon: Star, title: "Subject Master", description: "Achieve 90%+ mastery in one subject." }
];

export default async function AchievementsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { redirect('/auth/sign-in'); }

    // Fetch the achievements this specific student has earned
    const { data: earned } = await supabase
        .from('student_achievements')
        .select('achievement_id')
        .eq('student_id', user.id);

    const earnedIds = new Set(earned?.map(a => a.achievement_id));

    const achievementsData = allAchievements.map(ach => ({
        ...ach,
        unlocked: earnedIds.has(ach.id),
    }));

    const unlockedCount = earnedIds.size;
    const totalCount = allAchievements.length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-blue mb-2">
        My Achievements
      </h1>
      <p className="text-slate-600 mb-8">
        Track your progress and celebrate your learning milestones!
      </p>

      {/* Progress Summary */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-brand-blue">
            Badge Progress
          </h3>
          <p className="font-bold text-brand-orange">
            {unlockedCount} / {totalCount} Unlocked
          </p>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-4">
          <div
            className="bg-brand-orange h-4 rounded-full transition-all duration-500"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievementsData.map((achievement) => (
          <AchievementCard
            key={achievement.title}
            icon={achievement.icon}
            title={achievement.title}
            description={achievement.description}
            unlocked={achievement.unlocked}
          />
        ))}
      </div>
    </div>
  );
}
