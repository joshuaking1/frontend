// frontend/src/components/dashboard/RubricGenerator.tsx
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { generateRubric } from "@/app/dashboard/teacher/advanced-tools/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Ruler } from "lucide-react";

// This is the complete, non-abbreviated SubmitButton component.
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto bg-brand-orange hover:bg-brand-orange/90"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
        </>
      ) : (
        <>
          <Ruler className="mr-2 h-4 w-4" />
          Generate Rubric
        </>
      )}
    </Button>
  );
}

// This is the complete, non-abbreviated RubricDisplay component.
function RubricDisplay({ rubric }: { rubric: any }) {
  if (!rubric || !rubric.criteria) {
    return null; // Don't render if the rubric data is malformed
  }

  return (
    <Card className="mt-6 border-slate-200">
      <CardHeader>
        <CardTitle className="text-xl text-brand-blue">
          {rubric.title}
        </CardTitle>
        <CardDescription>
          Review the generated rubric below. You can copy this or request
          revisions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {rubric.criteria.map((crit: any) => (
            <Card key={crit.name} className="border border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-brand-blue">
                  {crit.name} ({crit.weight}%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">4 - Excellent</h4>
                      <p className="text-sm text-green-700">{crit.levels.excellent}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">3 - Proficient</h4>
                      <p className="text-sm text-blue-700">{crit.levels.proficient}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-semibold text-yellow-800 mb-2">2 - Developing</h4>
                      <p className="text-sm text-yellow-700">{crit.levels.developing}</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-2">1 - Emerging</h4>
                      <p className="text-sm text-red-700">{crit.levels.emerging}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// This is the complete, final RubricGenerator component.
export function RubricGenerator() {
  const [state, formAction] = useActionState(generateRubric, {
    rubric: null,
    error: null,
  });

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-brand-blue">
          AI-Powered Rubric Generator
        </CardTitle>
        <CardDescription>
          Describe an assessment task and its topic. The AI will generate a
          detailed, curriculum-aligned grading rubric.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="topic" className="font-semibold">
              Topic for Context
            </Label>
            <Input
              id="topic"
              name="topic"
              placeholder="e.g., The Trans-Atlantic Slave Trade"
            />
          </div>
          <div>
            <Label htmlFor="taskDescription" className="font-semibold">
              Assessment Task Description
            </Label>
            <Textarea
              id="taskDescription"
              name="taskDescription"
              placeholder="e.g., 'Students will create a 3-minute video presentation explaining the causes and effects of the slave trade on West Africa.'"
              rows={4}
            />
          </div>
          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>

        {/* Loading state can be handled by the disabled button, but we can add a global one too */}

        {state.rubric && <RubricDisplay rubric={state.rubric} />}

        {state.error && (
          <p className="text-red-600 font-semibold mt-4 bg-red-50 p-3 rounded-md">
            {state.error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
