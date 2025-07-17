// src/components/dashboard/AchievementCard.tsx
import { AnimatedCard } from "@/components/ui/animated-card";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type LucideIcon, Lock, Unlock } from "lucide-react";

type AchievementCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  unlocked: boolean;
  delay?: number;
};

export const AchievementCard = ({
  icon: Icon,
  title,
  description,
  unlocked,
  delay = 0,
}: AchievementCardProps) => {
  return (
    <AnimatedCard
      delay={delay}
      className={`transition-all duration-300 ${
        unlocked ? "bg-white shadow-md" : "bg-slate-100"
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <div
          className={`p-4 rounded-lg ${
            unlocked ? "bg-yellow-400" : "bg-slate-200"
          }`}
        >
          <Icon
            className={`h-8 w-8 ${unlocked ? "text-white" : "text-slate-400"}`}
          />
        </div>
        {unlocked ? (
          <div className="flex items-center space-x-1 text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
            <Unlock className="h-3 w-3" />
            <span>Unlocked</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
            <Lock className="h-3 w-3" />
            <span>Locked</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <CardTitle
          className={`text-lg ${
            unlocked ? "text-brand-blue" : "text-slate-500"
          }`}
        >
          {title}
        </CardTitle>
        <CardDescription
          className={`mt-1 ${unlocked ? "text-slate-600" : "text-slate-400"}`}
        >
          {description}
        </CardDescription>
      </CardContent>
    </AnimatedCard>
  );
};
