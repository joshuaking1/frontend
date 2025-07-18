// frontend/src/components/student/ChatClient.tsx
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PlusCircle, MessageSquare, Mic, Send, User, Bot, Loader2 } from 'lucide-react';
import { createNewChatSession, getOdenehoChatResponse } from '@/app/dashboard/student/chat/actions';
import ReactMarkdown from 'react-markdown';

// Types for Session and Message
interface Session {
    id: string;
    title: string;
    created_at: string;
}

interface Message {
    sender: 'user' | 'ai';
    content: string;
    created_at: string;
}

interface ChatClientProps {
    sessions: Session[];
    activeSessionId?: string;
    initialMessages: Message[];
}

export const ChatClient = ({ sessions, activeSessionId, initialMessages }: ChatClientProps) => {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleNewChat = async () => {
        const result = await createNewChatSession();
        if (result.sessionId) {
            router.push(`/dashboard/student/chat/${result.sessionId}`);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !activeSessionId) return;

        const userMessage: Message = { 
            sender: 'user', 
            content: input, 
            created_at: new Date().toISOString() 
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await getOdenehoChatResponse(activeSessionId, input);
            
            if (result.response) {
                const aiMessage: Message = { 
                    sender: 'ai', 
                    content: result.response, 
                    created_at: new Date().toISOString() 
                };
                setMessages(prev => [...prev, aiMessage]);
            }
        } catch (error) {
            console.error('Error getting chat response:', error);
            // Handle error case - you might want to show a toast or error message
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full max-w-full overflow-hidden">
            {/* Sidebar with Chat History */}
            <div className="w-80 flex-shrink-0 bg-white border-r flex flex-col">
                <div className="p-4 border-b">
                    <Button onClick={handleNewChat} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4"/> New Chat
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                        {sessions.map(session => (
                            <Link key={session.id} href={`/dashboard/student/chat/${session.id}`}>
                                <div className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer text-sm transition-colors ${
                                    session.id === activeSessionId 
                                        ? 'bg-slate-100 font-semibold' 
                                        : 'hover:bg-slate-100'
                                }`}>
                                    <MessageSquare className="h-4 w-4 flex-shrink-0"/>
                                    <span className="truncate">{session.title}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Chat Window */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 border-b bg-white flex-shrink-0">
                    <h2 className="text-lg font-semibold text-brand-blue">
                        {activeSessionId ? 'Chat with Odeneho AI' : 'Select a chat or start a new one'}
                    </h2>
                </div>
                
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="h-full">
                        {messages.length === 0 && !isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-gray-500">
                                    <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                    <p className="text-lg font-medium">Start a conversation</p>
                                    <p className="text-sm">Ask me anything about your studies!</p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 space-y-6">
                                {messages.map((message, index) => (
                                    <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex items-start space-x-3 max-w-[75%] min-w-0 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                            <Avatar className="h-8 w-8 flex-shrink-0">
                                                <AvatarFallback className={message.sender === 'user' ? 'bg-brand-orange text-white' : 'bg-brand-blue text-white'}>
                                                    {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className={`rounded-lg p-4 shadow-sm break-words overflow-hidden min-w-0 max-w-full ${
                                                message.sender === 'user' 
                                                    ? 'bg-brand-orange text-white' 
                                                    : 'bg-white text-gray-900 border'
                                            }`}>
                                                {message.sender === 'ai' ? (
                                                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-code:break-all prose-pre:break-all prose-pre:whitespace-pre-wrap">
                                                        <ReactMarkdown
                                                            components={{
                                                                p: ({ children }) => <p className="break-words overflow-wrap-anywhere">{children}</p>,
                                                                code: ({ children }) => <code className="break-all whitespace-pre-wrap">{children}</code>,
                                                                pre: ({ children }) => <pre className="break-all whitespace-pre-wrap overflow-x-auto">{children}</pre>
                                                            }}
                                                        >
                                                            {message.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">{message.content}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="flex items-start space-x-3">
                                            <Avatar className="h-8 w-8 flex-shrink-0">
                                                <AvatarFallback className="bg-brand-blue text-white">
                                                    <Bot className="h-4 w-4" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="bg-white text-gray-900 rounded-lg p-4 shadow-sm border">
                                                <div className="flex items-center space-x-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span className="text-sm text-gray-600">Thinking...</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Input Area */}
                <div className="p-4 bg-white border-t flex-shrink-0">
                    <div className="max-w-4xl mx-auto">
                        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                            <Button variant="ghost" type="button" className="flex-shrink-0 p-2">
                                <Mic className="h-5 w-5 text-gray-500"/>
                            </Button>
                            <div className="flex-1">
                                <Input 
                                    value={input} 
                                    onChange={e => setInput(e.target.value)} 
                                    placeholder="Ask anything about your studies..."
                                    disabled={isLoading || !activeSessionId}
                                    className="w-full border-gray-300 focus:border-brand-blue focus:ring-brand-blue"
                                />
                            </div>
                            <Button 
                                type="submit" 
                                disabled={isLoading || !input.trim() || !activeSessionId}
                                className="flex-shrink-0 bg-brand-blue hover:bg-brand-blue/90"
                            >
                                <Send className="h-5 w-5"/>
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
