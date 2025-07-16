// src/app/dashboard/student/explore/page.tsx
import { SubjectCard } from "@/components/dashboard/SubjectCard";
import { subjectsData } from "@/lib/placeholder-data";

export default function ExploreSubjectsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-blue mb-2">
        Explore Your Subjects
      </h1>
      <p className="text-slate-600 mb-8">
        Choose a subject to start learning, practice quizzes, and view your
        progress.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjectsData.map((subject) => (
          <SubjectCard
            key={subject.id}
            id={subject.id}
            name={subject.name}
            icon={subject.icon}
            description={subject.description}
            topicCount={subject.topics.length}
            completedCount={subject.topics.filter((t) => t.completed).length}
          />
        ))}
      </div>
    </div>
  );
}
