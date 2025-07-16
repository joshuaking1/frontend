// src/components/social/JoinCircleButton.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { joinCircle } from "@/app/dashboard/student/social/actions";

export const JoinCircleButton = ({ circleId }: { circleId: string }) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleJoin = () => {
    startTransition(async () => {
      const result = await joinCircle(circleId);
      if (result?.error) {
        // In a real app, you'd show a toast notification
        alert(`Error: ${result.error}`);
      } else {
        // Instead of relying on revalidatePath, we manually refresh the page.
        // This is the most reliable way to see the updated state.
        router.refresh();
      }
    });
  };

  return (
    <Button
      onClick={handleJoin}
      disabled={isPending}
      size="sm"
      variant="outline"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <PlusCircle className="h-4 w-4 mr-1" /> Join
        </>
      )}
    </Button>
  );
};
