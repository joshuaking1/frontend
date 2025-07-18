// frontend/src/app/dashboard/student/chat/[[...sessionId]]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChatClient } from "@/components/student/ChatClient";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ sessionId?: string[] }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/sign-in");
  }

  const resolvedParams = await params;
  const sessionId = resolvedParams.sessionId?.[0];

  // Fetch all chat sessions for the sidebar
  const { data: sessions } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch messages for the currently active session, if one exists
  let initialMessages = [];
  if (sessionId) {
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    initialMessages = messages || [];
  }

  return (
    <ChatClient
      sessions={sessions || []}
      activeSessionId={sessionId}
      initialMessages={initialMessages}
    />
  );
}
