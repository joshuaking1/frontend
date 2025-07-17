// frontend/src/components/editor/ActiveObserverPanel.tsx
"use client";

import { Lightbulb, Book, FolderClock, Loader2, Sparkles } from "lucide-react";

// Define a more specific type for our suggestions
type SuggestionData = {
    pedagogicalSuggestions?: string[];
    sbc_chunks?: { content: string; document_id: string }[];
    past_content?: { title: string; id: string; content_type: string }[];
}

type ObserverState = {
    isLoading: boolean;
    suggestions: SuggestionData | null;
}

// A sub-component for displaying pedagogical suggestions
const PedagogyCard = ({ suggestions }: { suggestions: string[] }) => (
    <div>
        <h4 className="font-semibold text-brand-blue flex items-center mb-2">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
            Pedagogical Suggestions
        </h4>
        <ul className="list-disc pl-5 text-sm space-y-2 text-slate-700">
            {suggestions.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
    </div>
);

// A sub-component for displaying relevant curriculum chunks
const SbcContextCard = ({ chunks }: { chunks: { content: string }[] }) => (
    <div>
        <h4 className="font-semibold text-brand-blue flex items-center mb-2">
            <Book className="h-5 w-5 mr-2 text-green-600" />
            Relevant Curriculum Context
        </h4>
        <div className="space-y-2">
            {chunks.map((chunk, i) => (
                <div key={i} className="p-3 bg-white border rounded-md text-xs text-slate-600 shadow-sm">
                    <p className="italic">"{chunk.content.substring(0, 200)}..."</p>
                </div>
            ))}
        </div>
    </div>
);

// A sub-component for displaying the teacher's own related past work
const PastContentCard = ({ content }: { content: { id: string, title: string, content_type: string }[] }) => (
     <div>
        <h4 className="font-semibold text-brand-blue flex items-center mb-2">
            <FolderClock className="h-5 w-5 mr-2 text-purple-600" />
            From Your Content Hub
        </h4>
        <div className="space-y-2">
            {content.map(item => (
                 <div key={item.id} className="p-3 bg-white border rounded-md text-sm text-slate-800 shadow-sm">
                    <p className="font-semibold truncate">{item.title}</p>
                    <p className="text-xs text-slate-500 capitalize">{item.content_type.replace('_', ' ')}</p>
                </div>
            ))}
        </div>
    </div>
);

export const ActiveObserverPanel = ({ observerState }: { observerState: ObserverState }) => {
    const { isLoading, suggestions } = observerState;

    return (
        <div className="bg-slate-50 h-full p-4 border-l overflow-y-auto">
            <h3 className="font-bold text-sm mb-4 text-slate-600 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-brand-orange"/>
                AI CO-TEACHER
            </h3>

            {isLoading && (
                <div className="flex items-center text-slate-500 animate-pulse">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                    Analyzing your draft...
                </div>
            )}
            
            {!isLoading && !suggestions && (
                <div className="text-center text-slate-500 pt-10">
                    <p>Start writing or edit your lesson plan, and your AI Co-Teacher will provide live suggestions here.</p>
                </div>
            )}
            
            {!isLoading && suggestions && (
                <div className="space-y-8">
                    {suggestions.pedagogicalSuggestions && suggestions.pedagogicalSuggestions.length > 0 && (
                        <PedagogyCard suggestions={suggestions.pedagogicalSuggestions} />
                    )}
                    {suggestions.sbc_chunks && suggestions.sbc_chunks.length > 0 && (
                        <SbcContextCard chunks={suggestions.sbc_chunks} />
                    )}
                    {suggestions.past_content && suggestions.past_content.length > 0 && (
                        <PastContentCard content={suggestions.past_content} />
                    )}
                </div>
            )}
        </div>
    );
};
