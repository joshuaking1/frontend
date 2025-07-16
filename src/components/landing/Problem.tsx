// src/components/landing/Problem.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Layers, ShieldAlert } from "lucide-react";

const problems = [
  {
    icon: <Clock className="h-10 w-10 text-brand-orange" />,
    title: "Hours Lost on Planning",
    description:
      "Teachers spend countless hours creating lesson plans and assessments from scratch to meet SBC standards.",
  },
  {
    icon: <Layers className="h-10 w-10 text-brand-orange" />,
    title: "SBC Complexity",
    description:
      "The shift to a standards-based model is confusing, leaving educators unsure if they are teaching and assessing correctly.",
  },
  {
    icon: <ShieldAlert className="h-10 w-10 text-brand-orange" />,
    title: "Student Disengagement",
    description:
      "Standard teaching methods struggle to capture student interest, leading to poor outcomes and participation.",
  },
];

export const Problem = () => {
  return (
    <section id="problem" className="py-20 md:py-24 bg-slate-100">
      <div className="container mx-auto text-center">
        <h2 className="font-serif text-4xl font-bold text-brand-blue">
          The Gap Between Policy and Classroom Reality
        </h2>
        <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
          The Standards-Based Curriculum is a great vision, but its
          implementation has created new challenges for dedicated educators
          across Ghana.
        </p>
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {problems.map((problem) => (
            <Card key={problem.title} className="text-left bg-white shadow-lg">
              <CardHeader>
                {problem.icon}
                <CardTitle className="pt-4 text-brand-blue">
                  {problem.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{problem.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
