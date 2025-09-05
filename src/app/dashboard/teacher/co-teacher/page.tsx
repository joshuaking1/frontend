// src/app/dashboard/teacher/co-teacher/page.tsx
import { createClient } from "@/lib/supabase/server";
import { CoTeacherCreator } from "@/components/dashboard/CoTeacherCreator";
import { CoTeacherChatInterface } from "@/components/dashboard/CoTeacherChatInterface";
import { ProactiveAICoach } from "@/components/dashboard/ProactiveAICoach";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bot, Brain, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function CoTeacherPage() {
  const supabase = await createClient();
  const { data: coTeachers } = await supabase
    .from("ai_co_teachers")
    .select("*");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-brand-blue mb-2 flex items-center justify-center">
          <Brain className="mr-3 h-10 w-10" />
          AI Teaching Assistant Hub
        </h1>
        <p className="text-xl text-slate-600 mb-6">
          Your intelligent teaching companion with proactive insights and multi-modal capabilities
        </p>
      </div>

      <Tabs defaultValue="proactive" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="proactive" className="flex items-center">
            <Zap className="mr-2 h-4 w-4" />
            Proactive Coach
          </TabsTrigger>
          <TabsTrigger value="co-teachers" className="flex items-center">
            <Bot className="mr-2 h-4 w-4" />
            Co-Teachers
          </TabsTrigger>
          <TabsTrigger value="legacy" className="flex items-center">
            <Brain className="mr-2 h-4 w-4" />
            Legacy Chat
          </TabsTrigger>
        </TabsList>

        {/* Proactive AI Coach Tab */}
        <TabsContent value="proactive">
          <ProactiveAICoach />
        </TabsContent>

        {/* Co-Teachers Tab */}
        <TabsContent value="co-teachers">
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
        </TabsContent>

        {/* Legacy Chat Tab */}
        <TabsContent value="legacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Brain className="mr-2 h-5 w-5 text-brand-blue" />
                Legacy AI Chat
              </CardTitle>
              <CardDescription>
                Basic AI chat interface (deprecated - use Proactive Coach instead)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                <Brain className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>This feature has been replaced by the Proactive AI Coach</p>
                <p className="text-sm">Please use the "Proactive Coach" tab for enhanced AI assistance</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CoTeacherPage;
