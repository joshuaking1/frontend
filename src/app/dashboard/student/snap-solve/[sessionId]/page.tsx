// frontend/src/app/dashboard/student/snap-solve/[sessionId]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { ChatInterface } from "@/components/student/ChatInterface";
import { notFound } from "next/navigation";

export default async function SnapSolveSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
    const { sessionId } = await params;
    const supabase = await createClient();
    
    const { data: session } = await supabase
        .from('vision_tutor_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

    if (!session) {
        notFound();
    }

    const { data: messages } = await supabase
        .from('vision_tutor_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
    
    return (
        <div className="w-full h-full flex items-center justify-center">
            <ChatInterface session={session} initialMessages={messages || []} />
        </div>
    );
}