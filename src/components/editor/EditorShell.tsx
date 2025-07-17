// frontend/src/components/editor/EditorShell.tsx
"use client";
import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { FileExplorer } from "./FileExplorer";
import { ActiveObserverPanel } from "./ActiveObserverPanel";
import { useDebounce } from "@/hooks/useDebounce";
import { getActiveObserverSuggestions } from '@/app/dashboard/teacher/editor/actions';

// Function to convert lesson plan JSON to readable format
const formatLessonPlanContent = (content: any) => {
  if (!content || !content.structured_content) return '';
  
  const { inputs, aiContent } = content.structured_content;
  
  return `
# Lesson Plan: ${inputs.subject}

## Basic Information
- **Topic**: ${aiContent.contentStandard || inputs.topic}
- **Form/Class**: ${inputs.grade}
- **Week**: ${inputs.week}
- **Duration**: ${inputs.duration} minutes
- **Strand**: ${inputs.strand}
- **Sub-Strand**: ${inputs.subStrand}

## Learning Objectives
${aiContent.learningIndicator}

## Learning Outcome
${aiContent.learningOutcome}

## Essential Questions
${aiContent.essentialQuestions ? aiContent.essentialQuestions.map((q: string) => `- ${q}`).join('\n') : 'None specified'}

## Pedagogical Strategies
${aiContent.pedagogicalStrategies ? aiContent.pedagogicalStrategies.map((s: string) => `- ${s}`).join('\n') : 'None specified'}

## Teaching & Learning Resources
${aiContent.teachingAndLearningResources ? aiContent.teachingAndLearningResources.map((r: string) => `- ${r}`).join('\n') : 'None specified'}

## Differentiation Notes
${aiContent.differentiationNotes ? aiContent.differentiationNotes.map((n: string) => `- ${n}`).join('\n') : 'None specified'}

## Lesson Activities

### Starter Activity
**Teacher**: ${aiContent.starterActivity?.teacher || 'Not specified'}
**Learner**: ${aiContent.starterActivity?.learner || 'Not specified'}

### Introductory Activity
**Teacher**: ${aiContent.introductoryActivity?.teacher || 'Not specified'}
**Learner**: ${aiContent.introductoryActivity?.learner || 'Not specified'}

### Main Activity 1
**Teacher**: ${aiContent.mainActivity1?.teacher || 'Not specified'}
**Learner**: ${aiContent.mainActivity1?.learner || 'Not specified'}

### Main Activity 2
**Teacher**: ${aiContent.mainActivity2?.teacher || 'Not specified'}
**Learner**: ${aiContent.mainActivity2?.learner || 'Not specified'}

### Lesson Closure
**Teacher**: ${aiContent.lessonClosure?.teacher || 'Not specified'}
**Learner**: ${aiContent.lessonClosure?.learner || 'Not specified'}
  `.trim();
};

// The main shell component
export const EditorShell = ({
  initialContent,
  contentList,
}: {
  initialContent: any;
  contentList: any[];
}) => {
  const [observerState, setObserverState] = useState<{ isLoading: boolean, suggestions: any | null }>({
    isLoading: false,
    suggestions: null
  });
  const [editorText, setEditorText] = useState(''); // Use a dedicated state for text analysis
  const debouncedText = useDebounce(editorText, 1500);

  const editor = useEditor({
    extensions: [StarterKit],
    content: formatLessonPlanContent(initialContent),
    immediatelyRender: false, // Prevent SSR hydration mismatches
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4 h-full",
      },
    },
    onUpdate: ({ editor }) => {
      // Update the state for debouncing whenever the user types
      setEditorText(editor.getText());
    },
  });

  useEffect(() => {
    const fetchSuggestions = async () => {
      // Only run the analysis if the text is substantial
      if (debouncedText && debouncedText.length > 100) {
        setObserverState({ isLoading: true, suggestions: null });
        const result = await getActiveObserverSuggestions(debouncedText);
        if (result.suggestions) {
          setObserverState({ isLoading: false, suggestions: result.suggestions });
        } else {
          // Handle cases where the AI might return an error or no suggestions
          setObserverState({ isLoading: false, suggestions: null });
          console.error("Observer Error:", result.error);
        }
      }
    }
    fetchSuggestions();
  }, [debouncedText]);

  return (
    <div className="flex h-screen bg-white">
      {/* Left Column: File Explorer */}
      <div className="w-1/5 min-w-[250px]">
        <FileExplorer contentList={contentList} activeId={initialContent.id} />
      </div>

      {/* Center Column: Tiptap Editor */}
      <div className="w-3/5 flex-grow">
        <EditorContent editor={editor} className="h-full overflow-y-auto" />
      </div>

      {/* Right Column: AI Active Observer */}
      <div className="w-1/5 min-w-[300px]">
        <ActiveObserverPanel observerState={observerState} />
      </div>
    </div>
  );
};
