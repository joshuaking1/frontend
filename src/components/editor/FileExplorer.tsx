// frontend/src/components/editor/FileExplorer.tsx
"use client";
import Link from "next/link";
import { FileText, FileUp, ListChecks, Ruler } from "lucide-react";

const getIcon = (type: string) => {
  switch (type) {
    case "lesson_plan":
      return <FileText className="h-4 w-4" />;
    case "rubric":
      return <Ruler className="h-4 w-4" />;
    case "tos":
      return <ListChecks className="h-4 w-4" />;
    default:
      return <FileUp className="h-4 w-4" />;
  }
};

export const FileExplorer = ({
  contentList,
  activeId,
}: {
  contentList: any[];
  activeId: string;
}) => {
  return (
    <div className="bg-slate-100 h-full p-2 border-r">
      <h3 className="font-bold text-sm px-2 mb-2 text-slate-600">
        MY CONTENT HUB
      </h3>
      <nav className="space-y-1">
        {contentList.map((item) => (
          <Link key={item.id} href={`/dashboard/teacher/editor/${item.id}`}>
            <div
              className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer text-sm ${
                item.id === activeId
                  ? "bg-brand-orange/20 text-brand-orange font-semibold"
                  : "hover:bg-slate-200"
              }`}
            >
              {getIcon(item.content_type)}
              <span className="truncate">{item.title}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
};
