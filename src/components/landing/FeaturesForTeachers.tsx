// src/components/landing/FeaturesForTeachers.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Bot, FileText, Goal, Sparkles } from "lucide-react";

const teacherFeatures = [
  {
    value: "co-teacher",
    icon: <Bot className="h-6 w-6 mr-2" />,
    title: "AI Co-Teacher",
    description:
      "Your personal AI assistant that helps brainstorm ideas, differentiate instruction, and suggest engaging activities aligned with the SBC.",
    visual: (
      <div className="bg-slate-200 rounded-lg aspect-video flex items-center justify-center p-4">
        <p className="text-slate-500 font-serif">Visual of AI Chat Interface</p>
      </div>
    ),
  },
  {
    value: "lesson-planner",
    icon: <FileText className="h-6 w-6 mr-2" />,
    title: "Instant Lesson Plans",
    description:
      "Go from a topic to a complete, structured, and editable SBC lesson plan in under a minute. Includes starters, activities, and plenaries.",
    visual: (
      <div className="bg-slate-200 rounded-lg aspect-video flex items-center justify-center p-4">
        <p className="text-slate-500 font-serif">
          Visual of a Generated Lesson Plan
        </p>
      </div>
    ),
  },
  {
    value: "assessment-gen",
    icon: <Goal className="h-6 w-6 mr-2" />,
    title: "Assessment Generator",
    description:
      "Create formative and summative assessments with ease. Specify the DoK level and get quizzes, project ideas, and grading rubrics instantly.",
    visual: (
      <div className="bg-slate-200 rounded-lg aspect-video flex items-center justify-center p-4">
        <p className="text-slate-500 font-serif">
          Visual of Assessment Options
        </p>
      </div>
    ),
  },
  {
    value: "pd-engine",
    icon: <Sparkles className="h-6 w-6 mr-2" />,
    title: "AI-Powered PD",
    description:
      "Receive personalized recommendations for professional development. Bite-sized modules on pedagogy, tech use, and SBC mastery.",
    visual: (
      <div className="bg-slate-200 rounded-lg aspect-video flex items-center justify-center p-4">
        <p className="text-slate-500 font-serif">Visual of PD Module Cards</p>
      </div>
    ),
  },
];

export const FeaturesForTeachers = () => {
  return (
    <section id="for-teachers" className="py-20 md:py-24 bg-white">
      <div className="container mx-auto">
        <div className="text-center">
          <h2 className="font-serif text-4xl font-bold text-brand-blue">
            Your Ultimate Teaching Toolkit
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
            Everything you need to reduce prep time, boost creativity, and
            deliver outstanding lessons.
          </p>
        </div>
        <Tabs defaultValue="co-teacher" className="mt-12">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
            {teacherFeatures.map((feature) => (
              <TabsTrigger
                key={feature.value}
                value={feature.value}
                className="py-3 px-2 flex-col h-auto"
              >
                <div className="flex items-center">
                  {" "}
                  {feature.icon}{" "}
                  <span className="font-semibold">{feature.title}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          {teacherFeatures.map((feature) => (
            <TabsContent
              key={feature.value}
              value={feature.value}
              className="mt-8"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h3 className="font-serif text-3xl text-brand-orange">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-lg">
                    {feature.description}
                  </p>
                </div>
                {feature.visual}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};
