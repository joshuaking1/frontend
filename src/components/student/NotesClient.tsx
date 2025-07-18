// frontend/src/components/student/NotesClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Layers } from "lucide-react";
import { generateFlashcardsForNote } from "@/app/dashboard/student/notes/actions";

export const NotesClient = ({ notes }: { notes: any[] }) => {
    const router = useRouter();
    const [generatingId, setGeneratingId] = useState<string | null>(null);

    const handleGenerateClick = async (noteId: string, noteContent: string) => {
        setGeneratingId(noteId);
        const result = await generateFlashcardsForNote(noteId, noteContent);
        if (result.error) {
            alert(`Error: ${result.error}`);
        } else {
            // Refresh the page to show the newly created deck
            router.refresh();
        }
        setGeneratingId(null);
    }

    if (notes.length === 0) {
        return (
            <div className="text-center py-20 border-2 border-dashed rounded-lg">
                <p className="text-slate-500">Your AI-Scribed notes will appear here after you use the AI Tutor.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map(note => (
                <Card key={note.id} className="bg-white flex flex-col">
                    <CardHeader>
                        <CardTitle>{note.title}</CardTitle>
                        <CardDescription>Created from {note.source_type?.replace('_', ' ')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-sm text-slate-600 line-clamp-4">{note.content}</p>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-4 bg-slate-50 p-4">
                        <h4 className="font-semibold text-sm">Flashcard Decks:</h4>
                        {note.flashcard_decks && note.flashcard_decks.length > 0 ? (
                            note.flashcard_decks.map((deck: any) => (
                                <div key={deck.id} className="text-sm flex items-center text-blue-600 font-medium">
                                    <Layers className="mr-2 h-4 w-4"/> {deck.title}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500">No decks generated yet.</p>
                        )}
                        <Button 
                            onClick={() => handleGenerateClick(note.id, note.content)} 
                            disabled={generatingId === note.id}
                            className="w-full"
                        >
                            {generatingId === note.id ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Generating...</>
                            ) : (
                                <><Sparkles className="mr-2 h-4 w-4"/> Auto-Generate Flashcards</>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
