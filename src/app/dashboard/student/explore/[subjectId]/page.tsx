// src/app/dashboard/student/explore/[subjectId]/page.tsx
import { subjectsData } from "@/lib/placeholder-data";
import { notFound } from "next/navigation";
import { CheckCircle, Circle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const subject = subjectsData.find((s) => s.id === subjectId);

  if (!subject) {
    notFound();
  }

  const completedCount = subject.topics.filter((t) => t.completed).length;
  const totalCount = subject.topics.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div>
      <div className="flex items-center space-x-4 mb-4">
        <div className="text-5xl">{subject.icon}</div>
        <div>
          <h1 className="text-4xl font-bold text-brand-blue">{subject.name}</h1>
          <p className="text-slate-600">{subject.description}</p>
        </div>
      </div>

      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-brand-blue mb-2">
          Your Progress
        </h3>
        <div className="w-full bg-slate-200 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-slate-500 mt-2 text-right">
          {completedCount} of {totalCount} topics completed
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-brand-blue mb-4">Topics</h3>
        <ul className="space-y-3">
          {subject.topics.map((topic) => (
            <li key={topic.id}>
              <Link href={`/dashboard/student/learn/${topic.id}`}>
                <div className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors border">
                  <div className="flex items-center space-x-3">
                    {topic.completed ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-slate-400" />
                    )}
                    <span
                      className={`font-medium ${
                        topic.completed
                          ? "text-slate-500 line-through"
                          : "text-brand-blue"
                      }`}
                    >
                      {topic.name}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    {topic.completed ? "Review" : "Start Learning"}
                  </Button>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
