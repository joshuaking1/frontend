// src/components/dashboard/SubjectCard.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

type SubjectCardProps = {
  id: string;
  name: string;
  icon: string;
  description: string;
  topicCount: number;
  completedCount: number;
};

export const SubjectCard = ({
  id,
  name,
  icon,
  description,
  topicCount,
  completedCount,
}: SubjectCardProps) => {
  const progress = topicCount > 0 ? (completedCount / topicCount) * 100 : 0;

  return (
    <Link href={`/dashboard/student/explore/${id}`}>
      <Card className="h-full flex flex-col bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="text-4xl">{icon}</div>
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <span>
                {completedCount} / {topicCount} Topics
              </span>
            </div>
          </div>
          <CardTitle className="pt-4 text-brand-blue">{name}</CardTitle>
          <CardDescription>{description}</CardDescription>
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
      </Card>
    </Link>
  );
};
