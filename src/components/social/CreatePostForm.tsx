// src/components/social/CreatePostForm.tsx
"use client";
import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createPost } from "@/app/dashboard/student/social/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} className="bg-brand-blue hover:bg-brand-blue/90">
      {pending ? "Posting..." : "Post"}
    </Button>
  );
}

export const CreatePostForm = ({
  circleId,
}: {
  circleId: string | undefined;
}) => {
  const formRef = useRef<HTMLFormElement>(null);

  if (!circleId) return null; // Don't render if the user isn't in any circles

  return (
    <Card className="bg-white">
      <CardContent className="p-4">
        <form
          ref={formRef}
          action={async (formData) => {
            await createPost(circleId, formData.get("content") as string);
            formRef.current?.reset();
          }}
        >
          <Textarea
            name="content"
            placeholder="Share your thoughts or ask a question..."
            className="mb-2"
            required
          />
          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
