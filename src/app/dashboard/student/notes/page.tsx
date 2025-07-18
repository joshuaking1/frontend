// frontend/src/app/dashboard/student/notes/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Book, Layers, Sparkles } from "lucide-react";
import { NotesClient } from "@/components/student/NotesClient"; // This will be our main client component

export default async function NotesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { redirect('/auth/sign-in'); }

    // Fetch all notes and their associated decks in a single, efficient query
    const { data: notes } = await supabase
        .from('notes')
        .select(`
            *,
            flashcard_decks ( id, title )
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-brand-blue">Nyansapo-Deck</h1>
                    <p className="text-slate-600">Your automated notes and smart flashcard ecosystem.</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/student/review">
                        Start Review Session
                    </Link>
                </Button>
            </div>
            
            <NotesClient notes={notes || []} />
        </div>
    );
}
