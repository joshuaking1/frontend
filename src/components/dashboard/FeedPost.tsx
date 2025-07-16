// src/components/dashboard/FeedPost.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageCircle, Share2 } from "lucide-react";

type FeedPostProps = {
  author: { name: string; avatarUrl: string };
  group: string;
  timestamp: string;
  content: string;
  stats: { likes: number; comments: number };
};

export const FeedPost = ({ post }: { post: FeedPostProps }) => {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-brand-blue">{post.author.name}</p>
            <p className="text-xs text-slate-500">
              {post.group} • {post.timestamp}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-slate-700 whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <div className="flex space-x-4 text-slate-500">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1"
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{post.stats.likes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{post.stats.comments} Comments</span>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-1 text-slate-500"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </CardFooter>
    </Card>
  );
};
