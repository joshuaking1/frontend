// frontend/src/app/dashboard/student/notes/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import Groq from 'groq-sdk';
import { revalidatePath } from "next/cache";
import { z } from "zod";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ######################################################################
// ACTION 1: AI SCRIBE & KNOWLEDGE GRAPHER (THE CORE ENGINE)
// ######################################################################

const scribeSystemPrompt = `
You are a hyper-intelligent AI that analyzes educational text to build a knowledge graph.
Your task is to read the provided text and perform two actions:
1.  Generate a concise, well-structured summary of the text in Markdown format.
2.  Extract the key concepts and the relationships between them.
You MUST ONLY respond with a valid, raw JSON object. The JSON object must follow this exact schema:
{
  "title": "string (A short, descriptive title for the note, max 10 words)",
  "summary": "string (The concise summary in Markdown format)",
  "concepts": ["string"],
  "relationships": [ { "source": "string", "target": "string", "description": "string" } ]
}
The 'source' and 'target' in relationships must be from the 'concepts' list.`;

export async function processTextForKnowledgeGraph(sourceText: string, sourceType: string, sourceId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !sourceText) return { error: "Invalid request: Missing user or source text." };

    // Truncate source text if it's too long (approximately 4000 characters = ~1000 tokens)
    const maxChars = 4000;
    const truncatedText = sourceText.length > maxChars 
        ? sourceText.substring(0, maxChars) + "\n\n[Content truncated for processing...]"
        : sourceText;

    const userPrompt = `Analyze the following text and generate the structured JSON output:\n\n${truncatedText}`;

    try {
        const response = await groq.chat.completions.create({
            model: 'llama3-8b-8192', // Smaller, faster model with higher token limit
            messages: [{ role: 'system', content: scribeSystemPrompt }, { role: 'user', content: userPrompt }],
            temperature: 0.3,
            response_format: { type: "json_object" },
        });

        const rawJson = response.choices[0].message.content;
        if (!rawJson) throw new Error("Received empty response from AI");

        const { title, summary, concepts, relationships } = JSON.parse(rawJson);

        // --- Save to Database via our robust transaction function ---
        const { error: rpcError } = await supabase.rpc('create_note_and_graph', {
            p_student_id: user.id,
            p_title: title,
            p_summary: summary,
            p_source_type: sourceType,
            p_source_id: sourceId,
            p_concepts: concepts,
            p_relationships: relationships
        });
        
        if (rpcError) {
            console.error("Database RPC Error (create_note_and_graph):", rpcError);
            throw new Error("Failed to save note and knowledge graph.");
        }
        
        revalidatePath('/dashboard/student/notes', 'layout');
        revalidatePath('/dashboard/student/graph', 'layout');
        return { success: true };

    } catch(e) {
        console.error("Knowledge Graph Processing Error:", e);
        return { error: "Failed to process text for knowledge graph." };
    }
}


// ######################################################################
// ACTION 2: GENERATE FLASHCARDS FROM A NOTE
// ######################################################################

const flashcardSystemPrompt = `
You are an AI that creates high-quality flashcards from a piece of text. You MUST generate a variety of card types (definition, conceptual, cloze).
You MUST ONLY respond with a valid, raw JSON object. The JSON object must have a single key "cards" which is an array of objects, where each object has "type", "front", and "back" keys.
Example: { "cards": [ { "type": "definition", "front": "Term", "back": "Definition." } ] }`;

export async function generateFlashcardsForNote(noteId: string, noteContent: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const userPrompt = `Generate a deck of 5-7 varied flashcards based on the following notes:\n\n${noteContent}`;
    
    try {
        const response = await groq.chat.completions.create({
            model: 'mistral-saba-24b',
            messages: [{ role: 'system', content: flashcardSystemPrompt }, { role: 'user', content: userPrompt }],
            temperature: 0.5,
            response_format: { type: "json_object" },
        });

        const rawJson = response.choices[0].message.content;
        if (!rawJson) throw new Error("Received empty response from AI");
        const { cards } = JSON.parse(rawJson);

        if (!cards || !Array.isArray(cards) || cards.length === 0) {
            throw new Error("AI returned invalid or empty card data.");
        }

        const { data: deck, error: deckError } = await supabase.from('flashcard_decks').insert({ note_id: noteId, title: `Flashcards for Note` }).select('id').single();
        if (deckError || !deck) throw new Error(`Failed to create deck: ${deckError?.message}`);

        const cardsToInsert = cards.map((c: any) => ({ deck_id: deck.id, card_type: c.type, front_content: c.front, back_content: c.back }));
        const { data: newCards, error: cardsError } = await supabase.from('flashcards').insert(cardsToInsert).select('id');
        if (cardsError || !newCards) throw new Error(`Failed to create cards: ${cardsError?.message}`);

        const srsDataToInsert = newCards.map((c: any) => ({ student_id: user.id, card_id: c.id }));
        const { error: srsError } = await supabase.from('srs_reviews').insert(srsDataToInsert);
        if (srsError) throw new Error(`Failed to create SRS reviews: ${srsError?.message}`);

        revalidatePath('/dashboard/student/notes', 'layout');
        return { success: true, deckId: deck.id };
    } catch(e) {
        console.error("Flashcard Generation Error:", e);
        return { error: `Failed to generate flashcards: ${e.message}` };
    }
}


// ######################################################################
// ACTION 3: SPACED REPETITION REVIEW UPDATE (SM-2 ALGORITHM)
// ######################################################################

const srsReviewSchema = z.object({
    reviewId: z.string().uuid(),
    easeFactor: z.number(),
    interval: z.number().int(),
    repetitions: z.number().int(),
    quality: z.number().min(0).max(5), // User's self-assessment (0-5)
});

export async function updateSrsReview(data: z.infer<typeof srsReviewSchema>) {
    const supabase = await createClient();
    const validation = srsReviewSchema.safeParse(data);
    if (!validation.success) return { error: "Invalid input." };

    const { reviewId, easeFactor, interval, repetitions, quality } = validation.data;
    
    let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEaseFactor < 1.3) newEaseFactor = 1.3;

    let newRepetitions;
    let newInterval;

    if (quality >= 3) { // Correct response
        if (repetitions === 0) {
            newInterval = 1;
        } else if (repetitions === 1) {
            newInterval = 6;
        } else {
            newInterval = Math.round(interval * newEaseFactor);
        }
        newRepetitions = repetitions + 1;
    } else { // Incorrect response
        newRepetitions = 0;
        newInterval = 1;
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
    
    const { error } = await supabase.from('srs_reviews')
        .update({
            ease_factor: newEaseFactor,
            interval: newInterval,
            repetitions: newRepetitions,
            next_review_at: nextReviewDate.toISOString()
        })
        .eq('id', reviewId);

    if (error) {
        console.error("SRS Update Error:", error);
        return { error: "Failed to update review schedule." };
    }

    revalidatePath('/dashboard/student/review');
    return { success: true };
}