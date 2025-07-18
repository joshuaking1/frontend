// frontend/src/components/student/EssayEditorShell.tsx
"use client";

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Wand2,
  BookCheck,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import {
  analyzeEssayStructure,
  analyzeSbcAlignment,
} from "@/app/dashboard/student/essay-helper/actions";

// Define the types for our data
type Analysis = {
  analysis_type: "structure" | "sbc_alignment";
  results: any;
};

type Essay = {
  id: string;
  title: string;
  topic: string;
  content: any; // Tiptap JSON content
};

// Sub-component to render the analysis results beautifully
const AnalysisDisplay = ({ analysis }: { analysis: Analysis }) => {
  if (!analysis) return null;

  if (analysis.analysis_type === "structure") {
    const { thesisStatement, paragraphSummaries, overallFeedback } =
      analysis.results;
    return (
      <div className="space-y-4 text-sm">
        <p>
          <strong className="text-brand-blue">Thesis Statement:</strong>{" "}
          {thesisStatement.text || "Not clearly identified."}
        </p>
        <p>
          <strong className="text-brand-blue">Feedback:</strong>{" "}
          {thesisStatement.feedback}
        </p>
        <h4 className="font-bold pt-2">Paragraph Flow:</h4>
        <ul className="list-decimal pl-5 space-y-2">
          {paragraphSummaries.map((p: any) => (
            <li
              key={p.paragraph}
              className={!p.isOnTopic ? "text-red-600" : ""}
            >
              <strong>Para {p.paragraph}:</strong> {p.summary} -{" "}
              <em className="text-slate-500">{p.feedback}</em>
            </li>
          ))}
        </ul>
        <p>
          <strong className="text-brand-blue">Overall Structure:</strong>{" "}
          {overallFeedback}
        </p>
      </div>
    );
  }

  if (analysis.analysis_type === "sbc_alignment") {
    const {
      alignmentScore,
      strengths,
      areasForImprovement,
      suggestedEvidence,
    } = analysis.results;
    return (
      <div className="space-y-4 text-sm">
        <p>
          <strong className="text-brand-blue">
            Curriculum Alignment Score:
          </strong>{" "}
          <span className="font-bold text-lg">{alignmentScore}/100</span>
        </p>
        <div>
          <strong className="text-green-600">Strengths:</strong>
          <ul className="list-disc pl-5">
            {strengths.map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong className="text-yellow-600">Areas for Improvement:</strong>
          <ul className="list-disc pl-5">
            {areasForImprovement.map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong className="text-purple-600">
            Suggested Evidence to Add:
          </strong>
          <ul className="list-disc pl-5">
            {suggestedEvidence.map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  return null;
};

export const EssayEditorShell = ({
  initialEssay,
  savedAnalyses,
}: {
  initialEssay: Essay;
  savedAnalyses: Analysis[];
}) => {
  const [analysisResult, setAnalysisResult] = useState<Analysis | null>(
    savedAnalyses[0] || null
  );
  const [isLoading, startAnalysisTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialEssay.content || `<p>${initialEssay.topic}</p>`, // Use topic as placeholder content
    editorProps: {
      attributes: { class: "prose prose-lg max-w-none focus:outline-none" },
    },
    immediatelyRender: false, // Fix for SSR hydration mismatch
  });

  const handleAnalysis = async (type: "structure" | "sbc_alignment") => {
    if (!editor) return;
    setError(null);
    startAnalysisTransition(async () => {
      const content = editor.getText();
      const result =
        type === "structure"
          ? await analyzeEssayStructure(initialEssay.id, content)
          : await analyzeSbcAlignment(
              initialEssay.id,
              content,
              initialEssay.topic
            );

      if (result.error) {
        setError(result.error);
        setAnalysisResult(null);
      } else {
        setAnalysisResult({ analysis_type: type, results: result.analysis });
      }
    });
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white rounded-lg shadow-lg border">
      {/* Main Editor Pane (Center) */}
      <div className="w-2/3 p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-brand-blue mb-1">
          {initialEssay.title}
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Topic: {initialEssay.topic}
        </p>
        <div className="flex-grow overflow-y-auto border rounded-md p-2">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* AI Analysis Pane (Right) */}
      <div className="w-1/3 p-6 bg-slate-50 border-l">
        <div className="flex flex-col h-full">
          <h3 className="font-bold text-lg text-brand-blue">
            Nsɛm Tsirɛw Assistant
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Your AI writing partner.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleAnalysis("structure")}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <Lightbulb className="mr-2 h-4 w-4" /> Analyze Structure
            </Button>
            <Button
              onClick={() => handleAnalysis("sbc_alignment")}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <BookCheck className="mr-2 h-4 w-4" /> Check Alignment
            </Button>
          </div>

          <div className="mt-4 flex-grow overflow-y-auto border p-4 rounded-md bg-white">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
              </div>
            )}
            {!isLoading && !analysisResult && !error && (
              <div className="text-center text-slate-500 pt-10">
                <p>
                  Click an analysis button above to get feedback on your essay.
                </p>
              </div>
            )}
            {error && (
              <div className="text-red-600 flex gap-2">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            )}
            {analysisResult && <AnalysisDisplay analysis={analysisResult} />}
          </div>
        </div>
      </div>
    </div>
  );
};
