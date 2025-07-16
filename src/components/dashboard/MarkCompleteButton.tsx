// src/components/dashboard/MarkCompleteButton.tsx
"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { markLessonAsComplete } from "@/app/dashboard/student/learn/actions";

export const MarkCompleteButton = ({
  topicId,
  isCompleted,
}: {
  topicId: string;
  isCompleted: boolean;
}) => {
  const [isPending, startTransition] = useTransition();
  const [completed, setCompleted] = useState(isCompleted);

  const handleClick = () => {
    startTransition(async () => {
      const result = await markLessonAsComplete(topicId);
      if (result.success) {
        setCompleted(true);
      }
      // Optionally handle result.error with a toast notification
    });
  };

  if (completed) {
    return (
      <Button disabled className="bg-green-500 text-white cursor-default">
        <CheckCircle className="mr-2 h-4 w-4" />
        Completed
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      className="bg-brand-orange hover:bg-brand-orange/90 text-white"
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Marking...
        </>
      ) : (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Mark as Complete
        </>
      )}
    </Button>
  );
};
