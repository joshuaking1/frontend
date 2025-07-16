// src/components/landing/FeaturesForStudents.tsx
import { Target, MessageCircle, Gamepad2, TrendingUp } from "lucide-react";

const studentFeatures = [
  {
    icon: <Target className="h-10 w-10 text-brand-orange" />,
    title: "Personalized Study Paths",
    description:
      "Your AI tutor analyzes your progress and builds a custom learning journey just for you, focusing on areas where you need the most help.",
  },
  {
    icon: <MessageCircle className="h-10 w-10 text-brand-orange" />,
    title: "Snap Homework & Get Help",
    description:
      "Stuck on a problem? Get instant, step-by-step explanations from our AI chatbot. No more waiting for help.",
  },
  {
    icon: <Gamepad2 className="h-10 w-10 text-brand-orange" />,
    title: "Gamified Missions & Challenges",
    description:
      "Learning is a quest. Earn badges, level up, and compete with friends on leaderboards as you master the curriculum.",
  },
  {
    icon: <TrendingUp className="h-10 w-10 text-brand-orange" />,
    title: "SBC Mock Exams",
    description:
      "Prepare for exams with mock tests aligned with the SBC. Get real-time feedback and performance predictions.",
  },
];

export const FeaturesForStudents = () => {
  return (
    <section id="for-students" className="py-20 md:py-24 bg-white">
      <div className="container mx-auto">
        <div className="text-center">
          <h2 className="font-serif text-4xl font-bold text-brand-blue">
            Your Smartest Study Buddy
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
            Ace your exams, understand complex topics, and make learning fun
            with tools built just for you.
          </p>
        </div>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {studentFeatures.map((feature) => (
            <div
              key={feature.title}
              className="bg-slate-50 p-6 rounded-lg border border-slate-200"
            >
              {feature.icon}
              <h3 className="font-semibold text-xl text-brand-blue mt-4">
                {feature.title}
              </h3>
              <p className="mt-2 text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
