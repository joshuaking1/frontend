// src/components/landing/Gamification.tsx
import { Award, BarChart, Gem, Star, Trophy } from "lucide-react";

export const Gamification = () => {
  return (
    <section id="gamification" className="py-20 md:py-24 bg-slate-100">
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left Side: Visuals */}
        <div className="relative h-96">
          {/* Placeholder cards for badges and avatars */}
          <div className="absolute top-0 left-10 w-40 h-48 bg-white p-4 rounded-xl shadow-lg transform -rotate-12">
            <Trophy className="h-12 w-12 mx-auto text-yellow-400" />
            <p className="font-serif text-center mt-2 text-brand-blue">
              Quiz Champion
            </p>
            <p className="text-xs text-slate-500 text-center">
              Score 80%+ in 5 quizzes
            </p>
          </div>
          <div className="absolute bottom-0 left-0 w-52 h-32 bg-white p-4 rounded-xl shadow-lg transform rotate-6">
            <p className="font-serif text-brand-blue text-lg">
              Weekly Leaderboard
            </p>
            <p className="text-slate-600 text-sm flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-500" /> 1. Ama
            </p>
            <p className="text-slate-600 text-sm flex items-center">
              <Star className="h-4 w-4 mr-1 text-gray-400" /> 2. Kofi
            </p>
          </div>
          <div className="absolute top-10 right-0 w-36 h-40 bg-white p-4 rounded-xl shadow-lg transform rotate-12">
            <Gem className="h-12 w-12 mx-auto text-fuchsia-500" />
            <p className="font-serif text-center mt-2 text-brand-blue">
              Master Educator
            </p>
          </div>
          <div className="absolute bottom-8 right-10 w-48 h-48 bg-white p-4 rounded-full shadow-lg">
            <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center">
              <p className="font-serif text-slate-500">Your Avatar</p>
            </div>
          </div>
        </div>

        {/* Right Side: Description */}
        <div className="space-y-6">
          <h2 className="font-serif text-4xl font-bold text-brand-blue">
            Learning That Feels Like Playing.
          </h2>
          <p className="text-lg text-slate-600">
            We've infused LearnBridgeEdu with powerful gamification to make
            learning and teaching more engaging, rewarding, and fun.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-brand-orange/20 rounded-full">
                <Award className="h-6 w-6 text-brand-orange" />
              </div>
              <div>
                <h4 className="font-semibold text-lg text-brand-blue">
                  Earn Badges & Ranks
                </h4>
                <p className="text-slate-600">
                  Unlock achievements for everything from creating lesson plans
                  to mastering a new topic.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-brand-orange/20 rounded-full">
                <BarChart className="h-6 w-6 text-brand-orange" />
              </div>
              <div>
                <h4 className="font-semibold text-lg text-brand-blue">
                  Climb the Leaderboards
                </h4>
                <p className="text-slate-600">
                  Engage in friendly competition with weekly quests and see who
                  comes out on top.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-brand-orange/20 rounded-full">
                <Star className="h-6 w-6 text-brand-orange" />
              </div>
              <div>
                <h4 className="font-semibold text-lg text-brand-blue">
                  Maintain Streaks & Rewards
                </h4>
                <p className="text-slate-600">
                  Build consistent study habits and unlock exclusive content
                  with daily and weekly streaks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
