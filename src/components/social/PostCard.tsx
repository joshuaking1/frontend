// src/components/social/PostCard.tsx
"use client"; // This component now needs client-side interactivity

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatedCard } from "@/components/ui/animated-card";
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ThumbsUp, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toggleLike } from "@/app/dashboard/student/social/actions";
import { CommentSection } from "./CommentSection";
import { createClient } from "@/lib/supabase/client"; // Use the client-side Supabase

// Redefine the PostType to include the full comment objects
type CommentType = {
  id: string;
  content: string;
  created_at: string;
  author: { full_name: string | null; avatar_url: string | null } | null;
};

type PostType = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author: { full_name: string | null; avatar_url: string | null } | null;
  circle: { name: string | null } | null;
  likes: { count: number | null }[];
  comments: CommentType[]; // Change this from a count to the full object array
};

export const PostCard = ({ post }: { post: PostType }) => {
  const authorName = post.author?.full_name || "Anonymous";
  const fallbackInitial = authorName ? authorName.charAt(0).toUpperCase() : "A";
  const likeCount = post.likes[0]?.count ?? 0;
  const commentCount = post.comments.length;

  const handleLikeClick = async () => {
    // For a better UX, we could implement optimistic updates here.
    // For now, we'll just call the action. Revalidation will update the count.
    await toggleLike(post.id);
  };

  return (
    <AnimatedCard className="bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Link href={`/dashboard/profile/${post.author_id}`}>
            <Avatar>
              <AvatarImage src={post.author?.avatar_url || undefined} alt={authorName} />
              <AvatarFallback>{fallbackInitial}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link href={`/dashboard/profile/${post.author_id}`}>
              <p className="font-bold text-brand-blue hover:underline">{authorName}</p>
            </Link>
            <p className="text-xs text-slate-500">
              in <span className="font-semibold">{post.circle?.name || 'a circle'}</span> • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-slate-700 whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex justify-start items-center border-t pt-2 pb-2">
        <div className="flex space-x-2 text-slate-500">
          <Button
            onClick={handleLikeClick}
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1"
          >
            <ThumbsUp className="h-4 w-4" />{" "}
            <span>
              {likeCount} {likeCount === 1 ? "Like" : "Likes"}
            </span>
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1"
              >
                <MessageCircle className="h-4 w-4" />{" "}
                <span>
                  {commentCount} {commentCount === 1 ? "Comment" : "Comments"}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Discussion</DialogTitle>
              </DialogHeader>
              <CommentSection
                postId={post.id}
                initialComments={post.comments}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </AnimatedCard>
  );
};
