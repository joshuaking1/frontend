// src/app/dashboard/teacher/co-teacher/page.tsx
import { createClient } from "@/lib/supabase/server";
import { CoTeacherCreator } from "@/components/dashboard/CoTeacherCreator";
import { CoTeacherChatInterface } from "@/components/dashboard/CoTeacherChatInterface";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bot } from "lucide-react";

async function CoTeacherPage() {
  const supabase = await createClient();
  const { data: coTeachers } = await supabase
    .from("ai_co_teachers")
    .select("*");

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-blue mb-2">
        AI Co-Teacher Workshop
      </h1>
      <p className="text-slate-600 mb-6">
        Create, customize, and collaborate with your own AI teaching assistants.
      </p>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Left Column: List and Creator */}
        <div className="lg:col-span-1 space-y-4">
          <CoTeacherCreator />
          <h3 className="font-semibold text-lg text-brand-blue pt-4">
            Your Co-Teachers
          </h3>
          <div className="space-y-3">
            {coTeachers && coTeachers.length > 0 ? (
              coTeachers.map((teacher) => (
                <Card key={teacher.id} className="bg-white">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <Bot className="mr-2 h-5 w-5" /> {teacher.name}
                    </CardTitle>
                    <CardDescription className="text-xs truncate">
                      {teacher.persona_description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                You haven't created any co-teachers yet.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Chat Interface */}
        <div className="lg:col-span-3">
          {coTeachers && coTeachers.length > 0 ? (
            // Pass the first co-teacher by default to the chat interface
            <CoTeacherChatInterface coTeacher={coTeachers[0]} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg p-8 border-2 border-dashed">
              <Bot className="h-16 w-16 text-slate-300" />
              <h3 className="font-serif text-2xl mt-4 text-slate-600">
                Create a Co-Teacher to Start Chatting
              </h3>
              <p className="text-slate-500 mt-2 text-center">
                Your new AI colleague will help you brainstorm ideas, <br />{" "}
                refine lessons, and overcome creative blocks.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CoTeacherPage;
