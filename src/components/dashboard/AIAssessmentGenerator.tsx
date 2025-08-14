// src/components/dashboard/AIAssessmentGenerator.tsx
"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  generateAssessment,
  type QuizQuestion,
} from "@/app/dashboard/teacher/assessments/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Loader2,
  Sparkles,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select

const initialState = {
  quiz: null,
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
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating
          Assessment...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-5 w-5" />
          Generate Assessment
        </>
      )}
    </Button>
  );
}

function QuizDisplay({
  quiz,
}: {
  quiz: { title: string; questions: QuizQuestion[] };
}) {
  // This component remains largely the same as it was already designed to handle structured data!
  return (
    <Card>
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
        <CardDescription>
          Review the generated questions below. You can copy or export them.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {quiz.questions.map((q, index) => {
          const dokLevelInfo = {
            "1": { label: "DoK 1: Recall", color: "bg-blue-100 text-blue-800" },
            "2": {
              label: "DoK 2: Skills",
              color: "bg-green-100 text-green-800",
            },
            "3": {
              label: "DoK 3: Strategic",
              color: "bg-orange-100 text-orange-800",
            },
            "4": {
              label: "DoK 4: Extended",
              color: "bg-purple-100 text-purple-800",
            },
          };

          const dokInfo = dokLevelInfo[q.dokLevel] || {
            label: "DoK Level",
            color: "bg-gray-100 text-gray-800",
          };

          return (
            <div key={index} className="p-4 border rounded-lg bg-slate-50">
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold flex-1">
                  {index + 1}. {q.question}
                </p>
                {q.dokLevel && (
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${dokInfo.color} flex-shrink-0`}
                  >
                    {dokInfo.label}
                  </span>
                )}
              </div>
              {q.type === "mcq" && q.options && (
                <ul className="space-y-2">
                  {q.options.map((option, i) => (
                    <li
                      key={i}
                      className={`flex items-center space-x-2 text-sm p-2 rounded-md ${
                        option === q.correctAnswer
                          ? "bg-green-100 text-green-800 font-medium"
                          : "text-slate-700"
                      }`}
                    >
                      {option === q.correctAnswer ? (
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                      <span>{option}</span>
                    </li>
                  ))}
                </ul>
              )}
              {q.type === "short_answer" && (
                <div className="mt-2 p-2 bg-blue-100 rounded-md text-sm text-blue-800 italic">
                  <p>
                    <strong className="font-semibold">Example Answer:</strong>{" "}
                    {q.correctAnswer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export const AIAssessmentGenerator = () => {
  const [state, formAction] = useFormState(generateAssessment, initialState);

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <Card className="lg:col-span-1 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 text-brand-blue" />
            Assessment Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="topic">Lesson Topic</Label>
              <Input
                id="topic"
                name="topic"
                placeholder="e.g., Photosynthesis"
                required
              />
              {state.error?.topic && (
                <p className="text-red-500 text-sm mt-1">
                  {state.error.topic[0]}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="numQuestions">No. of Questions</Label>
              <Input
                id="numQuestions"
                name="numQuestions"
                type="number"
                defaultValue="5"
                required
              />
              {state.error?.numQuestions && (
                <p className="text-red-500 text-sm mt-1">
                  {state.error.numQuestions[0]}
                </p>
              )}
            </div>
            <div>
              <Label>
                DoK Levels <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-slate-600 mb-3">
                Select one or more Depth of Knowledge levels for your assessment
              </p>
              <div className="space-y-3 p-3 border rounded-md bg-slate-50">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="dok1"
                    name="dokLevels"
                    value="1"
                    className="rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                  />
                  <Label
                    htmlFor="dok1"
                    className="text-sm font-normal cursor-pointer"
                  >
                    <span className="font-semibold">Level 1:</span> Recall &
                    Recognition
                    <span className="block text-xs text-slate-500">
                      Basic facts, definitions, simple procedures
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="dok2"
                    name="dokLevels"
                    value="2"
                    defaultChecked
                    className="rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                  />
                  <Label
                    htmlFor="dok2"
                    className="text-sm font-normal cursor-pointer"
                  >
                    <span className="font-semibold">Level 2:</span> Skills &
                    Concepts
                    <span className="block text-xs text-slate-500">
                      Apply knowledge, make connections
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="dok3"
                    name="dokLevels"
                    value="3"
                    className="rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                  />
                  <Label
                    htmlFor="dok3"
                    className="text-sm font-normal cursor-pointer"
                  >
                    <span className="font-semibold">Level 3:</span> Strategic
                    Thinking
                    <span className="block text-xs text-slate-500">
                      Analyze, evaluate, create solutions
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="dok4"
                    name="dokLevels"
                    value="4"
                    className="rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                  />
                  <Label
                    htmlFor="dok4"
                    className="text-sm font-normal cursor-pointer"
                  >
                    <span className="font-semibold">Level 4:</span> Extended
                    Thinking
                    <span className="block text-xs text-slate-500">
                      Complex projects, research, investigations
                    </span>
                  </Label>
                </div>
              </div>
              {state.error?.dokLevels && (
                <p className="text-red-500 text-sm mt-1">
                  {state.error.dokLevels[0]}
                </p>
              )}
            </div>
            <div>
              <Label>Question Type</Label>
              <RadioGroup
                name="questionType"
                defaultValue="mcq"
                className="mt-2 grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="mcq"
                    id="mcq"
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="mcq"
                    className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-brand-orange [&:has([data-state=checked])]:border-brand-orange cursor-pointer"
                  >
                    Multiple Choice
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="short_answer"
                    id="short_answer"
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="short_answer"
                    className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-brand-orange [&:has([data-state=checked])]:border-brand-orange cursor-pointer"
                  >
                    Short Answer
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      {/* Display Section */}
      <div className="lg:col-span-2">
        {!state.quiz && (
          <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg p-8 border-2 border-dashed">
            <FileText className="h-16 w-16 text-slate-300" />
            <h3 className="font-serif text-2xl mt-4 text-slate-600">
              Your generated quiz will appear here
            </h3>
            <p className="text-slate-500 mt-2">
              Fill out the form to create an assessment.
            </p>
          </div>
        )}
        {state.quiz && <QuizDisplay quiz={state.quiz} />}
        {state.error?.api && (
          <p className="text-red-500 text-center p-4">{state.error.api[0]}</p>
        )}
      </div>
    </div>
  );
};
