// src/components/social/CommentSection.tsx
"use client";

import { useState, useRef, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addComment, toggleCommentLike } from "@/app/dashboard/student/social/actions";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp } from "lucide-react";
import Link from "next/link";

type CommentType = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author: { full_name: string | null; avatar_url: string | null } | null;
};

type CommentSectionProps = {
  postId: string;
  initialComments: CommentType[];
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="sm">
      {pending ? "Posting..." : "Post Comment"}
    </Button>
  );
}

export const CommentSection = ({
  postId,
  initialComments,
}: CommentSectionProps) => {
  const formRef = useRef<HTMLFormElement>(null);

  // This is an example of an optimistic update, though we are still using revalidation for simplicity.
  const handleFormAction = async (formData: FormData) => {
    await addComment(postId, formData.get("content") as string);
    formRef.current?.reset();
  };

  return (
    <div className="pt-4">
      {/* Form to add a new comment */}
      <form
        ref={formRef}
        action={handleFormAction}
        className="flex flex-col items-end space-y-2 mb-6"
      >
        <Textarea
          name="content"
          placeholder="Write a comment..."
          required
          className="bg-slate-50"
        />
        <SubmitButton />
      </form>

      {/* List of existing comments */}
      <div className="space-y-4">
        <h4 className="font-semibold text-slate-700">
          {initialComments.length} Comments
        </h4>
        {initialComments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.author?.avatar_url || undefined} />
              <AvatarFallback>
                {comment.author?.full_name?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-slate-100 p-3 rounded-lg">
                <Link href={`/dashboard/profile/${comment.author_id}`}>
                  <p className="font-semibold text-sm text-brand-blue hover:underline">{comment.author?.full_name}</p>
                </Link>
                <p className="text-sm text-slate-700">{comment.content}</p>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-xs text-slate-500">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</p>
                <button onClick={() => toggleCommentLike(comment.id)} className="flex items-center text-xs text-slate-500 hover:text-brand-orange">
                  <ThumbsUp className="h-3 w-3 mr-1"/> Like
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
