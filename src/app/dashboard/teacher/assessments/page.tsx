// src/app/dashboard/teacher/assessments/page.tsx
import { AIAssessmentGenerator } from "@/components/dashboard/AIAssessmentGenerator";

export default function AssessmentsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-blue mb-2">
        AI Assessment Generator
      </h1>
      <p className="text-slate-600 mb-6">
        Create quizzes and formative assessments in a snap.
      </p>
      <AIAssessmentGenerator />
    </div>
  );
}
