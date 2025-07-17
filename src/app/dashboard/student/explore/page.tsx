// src/app/dashboard/student/explore/page.tsx
import { AnimatedCard } from "@/components/ui/animated-card"; // Import our new component
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { subjectsData } from "@/lib/placeholder-data";
import Link from "next/link";

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
        {subjectsData.map((subject, index) => {
          const progress = subject.topics.length > 0 ? (subject.topics.filter((t) => t.completed).length / subject.topics.length) * 100 : 0;
          const completedCount = subject.topics.filter((t) => t.completed).length;
          
          return (
            <AnimatedCard key={subject.id} delay={index * 0.1}>
              <Link href={`/dashboard/student/explore/${subject.id}`}>
                <div className="h-full flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="text-4xl">{subject.icon}</div>
                      <div className="flex items-center space-x-2 text-sm text-slate-500">
                        <span>
                          {completedCount} / {subject.topics.length} Topics
                        </span>
                      </div>
                    </div>
                    <CardTitle className="pt-4 text-brand-blue">{subject.name}</CardTitle>
                    <CardDescription>{subject.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Progress</p>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                          className="bg-green-500 h-2.5 rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Link>
            </AnimatedCard>
          );
        })}
      </div>
    </div>
  );
}
