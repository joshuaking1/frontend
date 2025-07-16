// src/components/landing/Solution.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Zap, BrainCircuit, Users } from "lucide-react";

const solutions = [
  {
    icon: <Zap className="h-8 w-8 text-white" />,
    title: "AI-Powered Automation",
    description:
      "Generate SBC-aligned lesson plans, assessments, and rubrics in seconds. Reclaim your time and focus on teaching.",
  },
  {
    icon: <BrainCircuit className="h-8 w-8 text-white" />,
    title: "Personalized Learning Paths",
    description:
      "Our AI analyzes student performance to create custom study plans, gamified challenges, and targeted interventions.",
  },
  {
    icon: <Users className="h-8 w-8 text-white" />,
    title: "Social & Collaborative",
    description:
      "Connect in a safe, moderated social network. Share resources, form study groups, and learn together.",
  },
];

export const Solution = () => {
  return (
    <section id="features" className="py-20 md:py-24 bg-brand-blue text-white">
      <div className="container mx-auto text-center">
        <h2 className="font-serif text-4xl font-bold">
          The All-in-One Educational Super-App
        </h2>
        <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
          LearnBridgeEdu is more than a tool—it's a complete ecosystem designed
          for Ghana's curriculum. We bridge the gap with three powerful core
          pillars.
        </p>
        <div className="mt-12 grid md:grid-cols-3 gap-8 text-left">
          {solutions.map((solution) => (
            <div key={solution.title} className="bg-white/10 p-6 rounded-lg">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-orange">
                {solution.icon}
              </div>
              <h3 className="font-serif text-2xl mt-6">{solution.title}</h3>
              <p className="mt-2 text-slate-300">{solution.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
