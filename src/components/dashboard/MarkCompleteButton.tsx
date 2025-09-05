// src/components/dashboard/MarkCompleteButton.tsx
"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

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
      try {
        const response = await fetch('/api/student/learn/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topicId })
        });
        
        const result = await response.json();
        if (result.success) {
          setCompleted(true);
        }
      } catch (error) {
        console.error('Error marking lesson as complete:', error);
      }
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
