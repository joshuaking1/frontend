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
  PanelRightClose,
  PanelRightOpen,
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
      <div className="space-y-3 text-xs sm:text-sm">
        <div className="p-3 bg-blue-50 rounded-md">
          <p className="font-semibold text-brand-blue mb-1">Thesis Statement:</p>
          <p className="text-slate-700">
            {thesisStatement.text || "Not clearly identified."}
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-md">
          <p className="font-semibold text-brand-blue mb-1">Feedback:</p>
          <p className="text-slate-700">{thesisStatement.feedback}</p>
        </div>
        <div>
          <h4 className="font-bold text-sm mb-2">Paragraph Flow:</h4>
          <ul className="space-y-2">
            {paragraphSummaries.map((p: any) => (
              <li
                key={p.paragraph}
                className={`p-2 rounded text-xs ${
                  !p.isOnTopic ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                }`}
              >
                <strong>Para {p.paragraph}:</strong> {p.summary}
                <br />
                <em className="text-slate-600">{p.feedback}</em>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-3 bg-blue-50 rounded-md">
          <p className="font-semibold text-brand-blue mb-1">Overall Structure:</p>
          <p className="text-slate-700">{overallFeedback}</p>
        </div>
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
      <div className="space-y-3 text-xs sm:text-sm">
        <div className="p-3 bg-blue-50 rounded-md text-center">
          <p className="font-semibold text-brand-blue mb-1">Curriculum Alignment Score:</p>
          <span className="font-bold text-lg text-brand-blue">{alignmentScore}/100</span>
        </div>
        <div className="p-3 bg-green-50 rounded-md">
          <strong className="text-green-700 block mb-2">Strengths:</strong>
          <ul className="space-y-1">
            {strengths.map((s: string, i: number) => (
              <li key={i} className="text-green-700">• {s}</li>
            ))}
          </ul>
        </div>
        <div className="p-3 bg-yellow-50 rounded-md">
          <strong className="text-yellow-700 block mb-2">Areas for Improvement:</strong>
          <ul className="space-y-1">
            {areasForImprovement.map((s: string, i: number) => (
              <li key={i} className="text-yellow-700">• {s}</li>
            ))}
          </ul>
        </div>
        <div className="p-3 bg-purple-50 rounded-md">
          <strong className="text-purple-700 block mb-2">Suggested Evidence to Add:</strong>
          <ul className="space-y-1">
            {suggestedEvidence.map((s: string, i: number) => (
              <li key={i} className="text-purple-700">• {s}</li>
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialEssay.content || `<p>${initialEssay.topic}</p>`, // Use topic as placeholder content
    editorProps: {
      attributes: { 
        class: "prose prose-sm sm:prose-base lg:prose-lg max-w-none focus:outline-none min-h-[200px] p-4" 
      },
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
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] bg-white rounded-lg shadow-lg border">
      {/* Main Editor Pane */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'lg:w-1/2' : 'lg:w-2/3'} transition-all duration-300`}>
        <div className="flex items-center justify-between p-4 lg:p-6 border-b">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-brand-blue truncate">
              {initialEssay.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              Topic: {initialEssay.topic}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-4 lg:hidden"
          >
            {sidebarOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex-grow overflow-y-auto p-2 lg:p-4">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* AI Analysis Pane - Responsive Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden lg:block'} lg:w-1/3 bg-slate-50 border-l border-t lg:border-t-0`}>
        <div className="flex flex-col h-full">
          <div className="p-4 lg:p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base lg:text-lg text-brand-blue">
                  Nsɛm Tsirɛw Assistant
                </h3>
                <p className="text-xs lg:text-sm text-slate-500">
                  Your AI writing partner.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 lg:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 mb-4">
              <Button
                onClick={() => handleAnalysis("structure")}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Analyze Structure</span>
                <span className="sm:hidden">Structure</span>
              </Button>
              <Button
                onClick={() => handleAnalysis("sbc_alignment")}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <BookCheck className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Check Alignment</span>
                <span className="sm:hidden">Alignment</span>
              </Button>
            </div>

            <div className="flex-grow overflow-y-auto border p-3 lg:p-4 rounded-md bg-white min-h-[300px] lg:min-h-[400px]">
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
                </div>
              )}
              {!isLoading && !analysisResult && !error && (
                <div className="text-center text-slate-500 pt-10">
                  <p className="text-sm">
                    Click an analysis button above to get feedback on your essay.
                  </p>
                </div>
              )}
              {error && (
                <div className="text-red-600 flex gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
              {analysisResult && <AnalysisDisplay analysis={analysisResult} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
