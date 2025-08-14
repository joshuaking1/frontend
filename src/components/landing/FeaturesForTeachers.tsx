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
    <section
      id="for-teachers"
      className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white px-4"
    >
      <div className="container mx-auto">
        <div className="text-center">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-brand-blue">
            Your Ultimate Teaching Toolkit
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto px-4">
            Everything you need to reduce prep time, boost creativity, and
            deliver outstanding lessons.
          </p>
        </div>
        <Tabs defaultValue="co-teacher" className="mt-8 sm:mt-12">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-1 sm:gap-2">
            {teacherFeatures.map((feature) => (
              <TabsTrigger
                key={feature.value}
                value={feature.value}
                className="py-2 sm:py-3 px-1 sm:px-2 flex-col h-auto text-xs sm:text-sm"
              >
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <div className="flex-shrink-0">{feature.icon}</div>
                  <span className="font-semibold text-center sm:text-left leading-tight">
                    {feature.title}
                  </span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          {teacherFeatures.map((feature) => (
            <TabsContent
              key={feature.value}
              value={feature.value}
              className="mt-6 sm:mt-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div className="space-y-3 sm:space-y-4 text-center md:text-left">
                  <h3 className="font-serif text-2xl sm:text-3xl text-brand-orange">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <div className="order-first md:order-last">
                  {feature.visual}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};
