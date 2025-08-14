// src/app/dashboard/teacher/lesson-planner/page.tsx
import { AILessonPlanner } from "@/components/dashboard/AILessonPlanner";

export default function LessonPlannerPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-blue mb-2">
          AI Lesson Planner
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Generate a complete, SBC-aligned lesson plan in seconds.
        </p>
      </div>
      <AILessonPlanner />
    </div>
  );
}
