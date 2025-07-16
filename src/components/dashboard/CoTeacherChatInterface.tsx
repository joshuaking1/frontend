// src/components/dashboard/CoTeacherChatInterface.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { getChatResponse } from "@/app/dashboard/teacher/co-teacher/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Message = {
  role: "user" | "assistant";
  content: string;
};

// Define the type for the co-teacher prop
type CoTeacher = {
  id: string;
  name: string;
  persona_description: string;
};

export function CoTeacherChatInterface({
  coTeacher,
}: {
  coTeacher: CoTeacher;
}) {
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom whenever history changes
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const newHistory = [...history, userMessage];
    setHistory(newHistory);
    setInput("");
    setIsLoading(true);

    const result = await getChatResponse(
      coTeacher.persona_description,
      newHistory
    );

    if (result.response) {
      setHistory([
        ...newHistory,
        { role: "assistant", content: result.response },
      ]);
    } else {
      setHistory([
        ...newHistory,
        {
          role: "assistant",
          content: result.error || "An unknown error occurred.",
        },
      ]);
    }
    setIsLoading(false);
  };

  return (
    <Card className="h-[75vh] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle>Chat with {coTeacher.name}</CardTitle>
      </CardHeader>
      <CardContent
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-4 space-y-4"
      >
        {history.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "justify-end" : ""
            }`}
          >
            {msg.role === "assistant" && (
              <Avatar className="bg-brand-blue text-white">
                <AvatarFallback>
                  <Bot />
                </AvatarFallback>
              </Avatar>
            )}
            <p
              className={`max-w-xs lg:max-w-md p-3 rounded-2xl ${
                msg.role === "user"
                  ? "bg-brand-orange text-white rounded-br-none"
                  : "bg-slate-100 text-slate-800 rounded-bl-none"
              }`}
            >
              {msg.content}
            </p>
            {msg.role === "user" && (
              <Avatar className="bg-slate-300">
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <Avatar className="bg-brand-blue text-white">
              <AvatarFallback>
                <Bot />
              </AvatarFallback>
            </Avatar>
            <p className="max-w-xs lg:max-w-md p-3 rounded-2xl bg-slate-100 text-slate-800 rounded-bl-none">
              <Loader2 className="h-5 w-5 animate-spin" />
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center space-x-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for brainstorming help..."
          />
          <Button type="submit" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
