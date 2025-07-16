// src/app/dashboard/teacher/lesson-planner/page.tsx
import { AILessonPlanner } from "@/components/dashboard/AILessonPlanner";

export default function LessonPlannerPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-blue mb-2">
        AI Lesson Planner
      </h1>
      <p className="text-slate-600 mb-6">
        Generate a complete, SBC-aligned lesson plan in seconds.
      </p>
      <AILessonPlanner />
    </div>
  );
}
