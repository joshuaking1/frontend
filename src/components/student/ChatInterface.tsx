// frontend/src/components/student/ChatInterface.tsx
"use client";

import { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2, CheckCircle } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { getSocraticResponse, completeAndSummarizeSession } from '@/app/dashboard/student/snap-solve/actions';
import { createClient } from '@/lib/supabase/client';

type Message = { id: string; sender: 'user' | 'ai'; content: string; };
type Session = { id: string; title: string; status: string; extracted_text: string; };

export const ChatInterface = ({ session, initialMessages }: { session: Session, initialMessages: Message[] }) => {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState('');
    const [isAiResponding, startAiResponseTransition] = useTransition();
    const [isCompleting, startCompleteTransition] = useTransition();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isAiResponding || session.status === 'completed') return;

        const userInput = input;
        setInput('');

        // 1. Optimistically add the user's message to the UI
        const optimisticUserMessage: Message = {
            id: crypto.randomUUID(),
            sender: 'user',
            content: userInput,
        };
        const newHistory = [...messages, optimisticUserMessage];
        setMessages(newHistory);
        
        // 2. Save user message to DB
        const supabase = createClient();
        await supabase.from('vision_tutor_messages').insert({ session_id: session.id, sender: 'user', content: userInput });

        // 3. Call the server action and get the AI response back
        startAiResponseTransition(async () => {
            const historyForAI = newHistory.map(m => ({ role: m.sender === 'ai' ? 'assistant' : 'user', content: m.content }));
            const result = await getSocraticResponse(session.id, historyForAI);

            if (result.newAiMessage) {
                // 4. Add the REAL AI message to the UI state
                setMessages(prev => [...prev, result.newAiMessage]);
            } else {
                // Handle error case - show an error message in the chat
                const errorMessage: Message = {
                    id: crypto.randomUUID(),
                    sender: 'ai',
                    content: `Error: ${result.error || 'Something went wrong.'}`
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        });
    };
    
    const handleCompleteSession = async () => {
        startCompleteTransition(async () => {
            await completeAndSummarizeSession(session.id);
            router.refresh();
        });
    };
    
    return (
        <Card className="w-full max-w-3xl mx-auto h-[85vh] flex flex-col shadow-2xl">
            <CardHeader className="border-b">
                <CardTitle>{session.title}</CardTitle>
                <CardDescription className="italic truncate">
                    Original Problem: "{session.extracted_text}"
                </CardDescription>
            </CardHeader>

            <CardContent ref={scrollRef} className="flex-grow p-4 space-y-6 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div
                        key={msg.id || index}
                        className={`flex items-start gap-3 ${
                            msg.sender === "user" ? "justify-end" : "justify-start"
                        }`}
                    >
                        {msg.sender === "ai" && (
                            <Avatar className="bg-brand-blue text-white">
                                <AvatarFallback>
                                    <Bot />
                                </AvatarFallback>
                            </Avatar>
                        )}
                        <div
                            className={`max-w-md p-3 rounded-2xl prose prose-sm ${
                                msg.sender === "user"
                                    ? "bg-brand-orange text-white rounded-br-none"
                                    : "bg-slate-100 text-slate-800 rounded-bl-none"
                            }`}
                        >
                            <ReactMarkdown>
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                        {msg.sender === "user" && (
                            <Avatar className="bg-slate-300">
                                <AvatarFallback>
                                    <User />
                                </AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}
                {isAiResponding && (
                    <div className="flex items-start gap-3 justify-start">
                        <Avatar className="bg-brand-blue text-white">
                            <AvatarFallback>
                                <Bot />
                            </AvatarFallback>
                        </Avatar>
                        <div className="max-w-md p-3 rounded-2xl bg-slate-100 text-slate-800 rounded-bl-none">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="border-t pt-4">
                {session.status === 'completed' ? (
                    <div className="w-full text-center text-green-600 font-semibold flex items-center justify-center">
                        <CheckCircle className="mr-2 h-5 w-5" /> Session Completed & Note Saved!
                    </div>
                ) : (
                    <div className="w-full space-y-2">
                        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
                            <Input 
                                value={input} 
                                onChange={(e) => setInput(e.target.value)} 
                                placeholder="What's your next step...?" 
                                disabled={isAiResponding}
                            />
                            <Button type="submit" disabled={isAiResponding || !input.trim()}>
                                <Send className="h-4 w-4"/>
                            </Button>
                        </form>
                        <Button 
                            onClick={handleCompleteSession} 
                            disabled={isCompleting} 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                        >
                            {isCompleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/> 
                                    Finalizing...
                                </>
                            ) : (
                                "I understand now, Finish & Save Note"
                            )}
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
};
