// src/components/dashboard/AILessonPlanner.tsx
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { generateLessonPlan } from "@/app/dashboard/teacher/lesson-planner/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Loader2, Sparkles } from "lucide-react";
// Import the new display component
import { LessonPlanDisplay } from "./LessonPlanDisplay";

const initialState = {
  planData: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full text-lg py-6 bg-brand-orange hover:bg-brand-orange/90"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-5 w-5" />
          Generate Lesson Plan
        </>
      )}
    </Button>
  );
}

export const AILessonPlanner = () => {
  const [state, formAction] = useFormState(generateLessonPlan, initialState);

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <Card className="lg:col-span-1 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="mr-2 text-brand-blue" />
            AI Lesson Planner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="e.g., Art and Design"
                  required
                />
                {state.error?.subject && (
                  <p className="text-red-500 text-sm mt-1">
                    {state.error.subject[0]}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="grade">Form / Class</Label>
                <Input id="grade" name="grade" placeholder="e.g., 1" required />
                {state.error?.grade && (
                  <p className="text-red-500 text-sm mt-1">
                    {state.error.grade[0]}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="week">Week</Label>
                <Input
                  id="week"
                  name="week"
                  type="number"
                  placeholder="e.g., 1"
                  required
                />
                {state.error?.week && (
                  <p className="text-red-500 text-sm mt-1">
                    {state.error.week[0]}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="duration">Duration (mins)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  placeholder="e.g., 180"
                  required
                />
                {state.error?.duration && (
                  <p className="text-red-500 text-sm mt-1">
                    {state.error.duration[0]}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="strand">Strand</Label>
              <Input
                id="strand"
                name="strand"
                placeholder="e.g., The Creative Journey"
                required
              />
              {state.error?.strand && (
                <p className="text-red-500 text-sm mt-1">
                  {state.error.strand[0]}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="subStrand">Sub-Strand</Label>
              <Input
                id="subStrand"
                name="subStrand"
                placeholder="e.g., Art Across Time"
                required
              />
              {state.error?.subStrand && (
                <p className="text-red-500 text-sm mt-1">
                  {state.error.subStrand[0]}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="topic">
                Main Lesson Topic / Content Standard
              </Label>
              <Input
                id="topic"
                name="topic"
                placeholder="e.g., Demonstrate understanding of the history of African art..."
                required
              />
              {state.error?.topic && (
                <p className="text-red-500 text-sm mt-1">
                  {state.error.topic[0]}
                </p>
              )}
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      {/* Display Section */}
      <div className="lg:col-span-2">
        {!state.planData && (
          <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg p-8 border-2 border-dashed">
            <Sparkles className="h-16 w-16 text-slate-300" />
            <h3 className="font-serif text-2xl mt-4 text-slate-600">
              Your lesson plan will appear here
            </h3>
            <p className="text-slate-500 mt-2">
              Fill out the form to the left to generate a structured plan.
            </p>
          </div>
        )}
        {state.planData && <LessonPlanDisplay planData={state.planData} />}
        {state.error?.api && (
          <p className="text-red-500 text-center p-4">{state.error.api[0]}</p>
        )}
      </div>
    </div>
  );
};
