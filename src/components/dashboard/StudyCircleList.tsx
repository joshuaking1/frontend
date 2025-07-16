// src/components/dashboard/StudyCircleList.tsx
import { studyCirclesData } from "@/lib/placeholder-data";
import { Users, Hash } from "lucide-react";
import Link from "next/link";

export const StudyCircleList = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm h-fit">
      <h3 className="font-bold text-lg text-brand-blue mb-4">
        Your Study Circles
      </h3>
      <ul className="space-y-2">
        {studyCirclesData.map((circle) => (
          <li key={circle.id}>
            <Link href={`/dashboard/student/social/${circle.id}`}>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-100 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-slate-500" />
                  <span className="font-medium text-slate-700">
                    {circle.name}
                  </span>
                </div>
                {circle.unreadCount > 0 && (
                  <span className="bg-brand-orange text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {circle.unreadCount}
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
