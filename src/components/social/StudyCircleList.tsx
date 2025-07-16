// src/components/social/StudyCircleList.tsx
import { Hash } from "lucide-react";
import Link from "next/link";

type MyCircle = {
  study_circles: { id: string; name: string } | null;
};

export const StudyCircleList = ({ myCircles }: { myCircles: MyCircle[] }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm h-fit">
      <h3 className="font-bold text-lg text-brand-blue mb-4">
        Your Study Circles
      </h3>
      {myCircles.length > 0 ? (
        <ul className="space-y-2">
          {myCircles.map(
            (circle) =>
              circle.study_circles && (
                <li key={circle.study_circles.id}>
                  <Link
                    href={`/dashboard/student/social/${circle.study_circles.id}`}
                  >
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-100 cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4 text-slate-500" />
                        <span className="font-medium text-slate-700">
                          {circle.study_circles.name}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              )
          )}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">
          You haven't joined any circles yet.
        </p>
      )}
    </div>
  );
};
