// frontend/src/components/dashboard/AIAssessmentGenerator.tsx
"use client";

import { useFormStatus } from "react-dom";
import { useActionState, useEffect, useState } from "react";
import { useRef } from "react";
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
  const [state, formAction] = useActionState(generateAssessment, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [dokCounts, setDokCounts] = useState({
    dok1: 0,
    dok2: 3,
    dok3: 0,
    dok4: 0,
  });
  
  // Initialize the input fields based on initial state
  useEffect(() => {
    // Enable the dok2 input since it has a default value of 3
    const dok2Input = document.getElementById('dok2Questions') as HTMLInputElement;
    if (dok2Input) {
      dok2Input.disabled = false;
    }
  }, []);
  const [totalQuestions, setTotalQuestions] = useState(3);

  useEffect(() => {
    const total = Object.values(dokCounts).reduce((sum, count) => sum + count, 0);
    setTotalQuestions(total);
  }, [dokCounts]);

  const handleDokCountChange = (level: keyof typeof dokCounts, value: string) => {
    const count = parseInt(value, 10);
    if (!isNaN(count) && count >= 0) {
      setDokCounts(prev => ({ ...prev, [level]: count }));
    }
  };

  const handleCheckboxChange = (level: keyof typeof dokCounts, checked: boolean) => {
    if (!checked) {
      setDokCounts(prev => ({ ...prev, [level]: 0 }));
      const input = document.getElementById(`${level}Questions`) as HTMLInputElement;
      if (input) {
        input.disabled = true;
        input.value = "0";
      }
    } else {
      setDokCounts(prev => ({ ...prev, [level]: 1 }));
      const input = document.getElementById(`${level}Questions`) as HTMLInputElement;
      if (input) {
        input.disabled = false;
        input.value = "1";
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (formRef.current) {
      const topicInput = formRef.current.querySelector(
        'input[name="topic"]'
      ) as HTMLInputElement;
      if (topicInput) {
        topicInput.value = suggestion;
        topicInput.focus();
      }
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8 items-start">
      {/* Form Section */}
      <Card className="lg:col-span-1 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 text-brand-blue" />
            Assessment Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="e.g., Science"
                  required
                />
                {state.error?.subject && (
                  <p className="text-red-500 text-sm mt-1">
                    {state.error.subject[0]}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="grade">Grade Level</Label>
                <Input
                  id="grade"
                  name="grade"
                  placeholder="e.g., Primary 1"
                  required
                />
                {state.error?.grade && (
                  <p className="text-red-500 text-sm mt-1">
                    {state.error.grade[0]}
                  </p>
                )}
              </div>
            </div>
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
              <Label htmlFor="numQuestions">Total Questions</Label>
              <Input
                id="numQuestions"
                name="numQuestions"
                type="number"
                value={totalQuestions}
                required
                readOnly
                className="bg-slate-100"
              />
              <p className="text-xs text-slate-500 mt-1">
                This will be calculated automatically from your DOK level
                distribution
              </p>
              {state.error?.numQuestions && (
                <p className="text-red-500 text-sm mt-1">
                  {state.error.numQuestions[0]}
                </p>
              )}
            </div>
            <div>
              <Label>
                DoK Levels & Question Distribution{" "}
                <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-slate-600 mb-3">
                Select DoK levels and specify how many questions to generate from each level
              </p>
              <div className="space-y-3 p-3 border rounded-md bg-slate-50">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="checkbox"
                      id="dok1"
                      name="dokLevels"
                      value="1"
                      className="rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                      onChange={(e) => handleCheckboxChange('dok1', e.target.checked)}
                    />
                    <Label
                      htmlFor="dok1"
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      <span className="font-semibold">Level 1:</span> Recall &
                      Recognition
                      <span className="block text-xs text-slate-500">
                        Basic facts, definitions, simple procedures
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Input
                      id="dok1Questions"
                      name="dok1Questions"
                      type="number"
                      min="0"
                      max="20"
                      defaultValue="0"
                      disabled
                      className="w-16 h-8 text-center bg-white border-brand-orange focus:border-brand-orange disabled:bg-slate-100"
                      placeholder="0"
                      onChange={(e) => handleDokCountChange('dok1', e.target.value)}
                    />
                    <span className="text-xs text-slate-500">questions</span>
                  </div>
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="checkbox"
                      id="dok2"
                      name="dokLevels"
                      value="2"
                      defaultChecked
                      className="rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                      onChange={(e) => handleCheckboxChange('dok2', e.target.checked)}
                    />
                    <Label
                      htmlFor="dok2"
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      <span className="font-semibold">Level 2:</span> Skills &
                      Concepts
                      <span className="block text-xs text-slate-500">
                        Apply knowledge, make connections
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Input
                      id="dok2Questions"
                      name="dok2Questions"
                      type="number"
                      min="0"
                      max="20"
                      defaultValue="3"
                      className="w-16 h-8 text-center bg-white border-brand-orange focus:border-brand-orange disabled:bg-slate-100"
                      placeholder="0"
                      onChange={(e) => handleDokCountChange('dok2', e.target.value)}
                    />
                    <span className="text-xs text-slate-500">questions</span>
                  </div>
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="checkbox"
                      id="dok3"
                      name="dokLevels"
                      value="3"
                      className="rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                      onChange={(e) => handleCheckboxChange('dok3', e.target.checked)}
                    />
                    <Label
                      htmlFor="dok3"
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      <span className="font-semibold">Level 3:</span> Strategic
                      Thinking
                      <span className="block text-xs text-slate-500">
                        Analyze, evaluate, create solutions
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Input
                      id="dok3Questions"
                      name="dok3Questions"
                      type="number"
                      min="0"
                      max="20"
                      defaultValue="0"
                      disabled
                      className="w-16 h-8 text-center bg-white border-gray-300 focus:border-brand-orange focus:ring-brand-orange disabled:opacity-50 disabled:bg-slate-100 transition-colors"
                      placeholder="0"
                      onChange={(e) => handleDokCountChange('dok3', e.target.value)}
                    />
                    <span className="text-xs text-slate-500">questions</span>
                  </div>
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="checkbox"
                      id="dok4"
                      name="dokLevels"
                      value="4"
                      className="rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                      onChange={(e) => handleCheckboxChange('dok4', e.target.checked)}
                    />
                    <Label
                      htmlFor="dok4"
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      <span className="font-semibold">Level 4:</span> Extended
                      Thinking
                      <span className="block text-xs text-slate-500">
                        Complex projects, research, investigations
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Input
                      id="dok4Questions"
                      name="dok4Questions"
                      type="number"
                      min="0"
                      max="20"
                      defaultValue="0"
                      disabled
                      className="w-16 h-8 text-center bg-white border-gray-300 focus:border-brand-orange focus:ring-brand-orange disabled:opacity-50 disabled:bg-slate-100 transition-colors"
                      placeholder="0"
                      onChange={(e) => handleDokCountChange('dok4', e.target.value)}
                    />
                    <span className="text-xs text-slate-500">questions</span>
                  </div>
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
        {/* Handle "no context found" error with suggestions */}
        {state.error?.code === "NO_CONTEXT_FOUND" ? (
          <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg p-8 border-2 border-dashed">
            <FileText className="h-16 w-16 text-slate-300" />
            <h3 className="font-serif text-2xl mt-4 text-slate-600">
              Could not generate assessment.
            </h3>
            <p className="text-slate-500 mt-2 text-center">
              {state.error.message}
              <br />
              Please try a broader topic or check for typos.
            </p>
            {state.error.suggestions && state.error.suggestions.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-slate-600 mb-2">
                  Try one of these topics:
                </p>
                <div className="flex flex-wrap gap-2">
                  {state.error.suggestions.map(
                    (suggestion: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1 text-xs bg-brand-orange/10 text-brand-orange rounded-full hover:bg-brand-orange/20 transition-colors"
                      >
                        {suggestion}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        ) : state.quiz && state.quiz.aiContent ? (
          <QuizDisplay quiz={state.quiz.aiContent} />
        ) : (
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

        {/* Display API errors */}
        {state.error?.api && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{state.error.api[0]}</p>
          </div>
        )}

        {/* Display validation errors */}
        {state.error && !state.error.code && !state.error.api && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">
              Please check your form inputs and try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
