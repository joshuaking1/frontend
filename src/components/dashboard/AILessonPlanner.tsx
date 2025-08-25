// src/components/dashboard/AILessonPlanner.tsx
"use client";

import { useFormStatus } from "react-dom";
import { useActionState } from "react";
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
  const [state, formAction] = useActionState(generateLessonPlan, initialState);

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Form Section */}
      <Card className="lg:col-span-1 h-fit">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Bot className="mr-2 text-brand-blue h-5 w-5 sm:h-6 sm:w-6" />
            AI Lesson Planner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4 sm:space-y-5">
            {/* Mobile-first responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="e.g., Art and Design"
                  className="mt-1"
                  required
                />
                {state.error?.validation?.subject && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {state.error.validation.subject[0]}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="grade" className="text-sm font-medium">
                  Form / Class
                </Label>
                <Input
                  id="grade"
                  name="grade"
                  placeholder="e.g., 1"
                  className="mt-1"
                  required
                />
                {state.error?.validation?.grade && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {state.error.validation.grade[0]}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="week" className="text-sm font-medium">
                  Week
                </Label>
                <Input
                  id="week"
                  name="week"
                  type="number"
                  placeholder="e.g., 1"
                  className="mt-1"
                  required
                />
                {state.error?.validation?.week && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {state.error.validation.week[0]}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="duration" className="text-sm font-medium">
                  Duration (mins)
                </Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  placeholder="e.g., 180"
                  className="mt-1"
                  required
                />
                {state.error?.validation?.duration && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {state.error.validation.duration[0]}
                  </p>
                )}
              </div>
            </div>

            {/* Full-width fields */}
            <div>
              <Label htmlFor="strand" className="text-sm font-medium">
                Strand
              </Label>
              <Input
                id="strand"
                name="strand"
                placeholder="e.g., The Creative Journey"
                className="mt-1"
                required
              />
              {state.error?.validation?.strand && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">
                  {state.error.validation.strand[0]}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="subStrand" className="text-sm font-medium">
                Sub-Strand
              </Label>
              <Input
                id="subStrand"
                name="subStrand"
                placeholder="e.g., Art Across Time"
                className="mt-1"
                required
              />
              {state.error?.validation?.subStrand && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">
                  {state.error.validation.subStrand[0]}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="topic" className="text-sm font-medium">
                Main Lesson Topic / Content Standard
              </Label>
              <Input
                id="topic"
                name="topic"
                placeholder="e.g., Demonstrate understanding of the history of African art..."
                className="mt-1"
                required
              />
              {state.error?.validation?.topic && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">
                  {state.error.validation.topic[0]}
                </p>
              )}
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      {/* Display Section */}
      <div className="lg:col-span-2 min-h-0">
        {!state.planData && (
          <div className="flex flex-col items-center justify-center h-64 sm:h-80 lg:h-full bg-white rounded-lg p-6 sm:p-8 border-2 border-dashed">
            <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 text-slate-300" />
            <h3 className="font-serif text-lg sm:text-xl lg:text-2xl mt-4 text-slate-600 text-center">
              Your lesson plan will appear here
            </h3>
            <p className="text-slate-500 mt-2 text-sm sm:text-base text-center">
              Fill out the form to generate a structured plan.
            </p>
          </div>
        )}
        {state.planData && <LessonPlanDisplay planData={state.planData} />}
        {state.error?.api && (
          <p className="text-red-500 text-center p-4 text-sm sm:text-base">
            {state.error.api[0]}
          </p>
        )}
      </div>
    </div>
  );
};
