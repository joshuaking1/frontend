// frontend/src/app/dashboard/student/essay-helper/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import Groq from 'groq-sdk';
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ######################################################################
// ACTION 1: MESO-ANALYSIS (STRUCTURE & FLOW)
// Analyzes the essay's internal logic, paragraph structure, and thesis.
// ######################################################################

const structureSystemPrompt = `You are an expert writing analyst and editor, trained to help students improve their essay structure. Analyze the provided essay for its structural soundness and logical flow.
You MUST ONLY respond with a valid, raw JSON object. Do not include any explanatory text or markdown.
The JSON object must follow this exact schema:
{
  "thesisStatement": {
    "text": "string (The identified thesis statement, or an empty string if none is found)",
    "feedback": "string (Constructive feedback on the thesis's clarity and strength)"
  },
  "paragraphSummaries": [
    {
      "paragraph": "number (The paragraph number, starting from 1)",
      "summary": "string (A one-sentence summary of the paragraph's main point)",
      "isOnTopic": "boolean (Does this paragraph directly support the thesis statement?)",
      "feedback": "string (A short piece of feedback on the paragraph's focus or transition)"
    }
  ],
  "overallFeedback": "string (A concise, actionable critique of the essay's overall structure, flow, and coherence)"
}`;

export async function analyzeEssayStructure(essayId: string, essayContent: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: structureSystemPrompt },
                { role: 'user', content: `Analyze the following essay:\n\n${essayContent}` }
            ],
            response_format: { type: "json_object" },
        });

        const rawJson = response.choices[0].message.content;
        if (!rawJson) throw new Error("AI returned an empty response for structure analysis.");
        
        const analysisResult = JSON.parse(rawJson);

        // Save this powerful analysis to our database for the user to review later
        const { error: saveError } = await supabase.from('essay_analysis').insert({
            essay_id: essayId,
            analysis_type: 'structure',
            results: analysisResult
        });

        if (saveError) throw new Error(`Failed to save analysis: ${saveError.message}`);

        revalidatePath(`/dashboard/student/essay-helper/${essayId}`);
        return { analysis: analysisResult };

    } catch (e: any) {
        console.error("Essay Structure Analysis Error:", e);
        return { error: `Failed to analyze essay structure: ${e.message}` };
    }
}


// ######################################################################
// ACTION 2: MACRO-ANALYSIS (SBC & RAG ALIGNMENT)
// Analyzes how well the essay addresses the specific demands of the curriculum.
// ######################################################################

const ragSystemPrompt = `You are an expert curriculum analyst for the Ghanaian SBC. Your task is to rigorously compare a student's essay against the provided official SBC curriculum context.
You MUST ONLY respond with a valid, raw JSON object. Do not include any explanatory text or markdown.
The JSON object must follow this exact schema:
{
  "alignmentScore": "number (A score from 0 to 100 on how well the essay addresses the curriculum context)",
  "strengths": ["string (Specific examples of how the essay aligns well with the context)"],
  "areasForImprovement": ["string (Specific, constructive advice on how to better align with the context)"],
  "suggestedEvidence": ["string (Quote or suggest a piece of evidence from the context that the student could add to strengthen their argument)"]
}`;

export async function analyzeSbcAlignment(essayId: string, essayContent: string, essayTopic: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    try {
        // --- RAG Pipeline ---
        const { data: embeddingResponse, error: embeddingError } = await supabase.functions.invoke('text-to-embedding', { body: { text: essayTopic } });
        if (embeddingError) throw new Error(`Embedding Error: ${embeddingError.message}`);
        
        const { data: chunks, error: matchError } = await supabase.rpc('match_sbc_chunks', {
            query_embedding: embeddingResponse.embedding,
            match_threshold: 0.7,
            match_count: 5
        });
        if (matchError) throw new Error(`Chunk Matching Error: ${matchError.message}`);

        const contextText = chunks && chunks.length > 0 ? chunks.map((c: any) => c.content).join('\n---\n') : "No relevant curriculum context was found.";
        // --- End RAG ---

        const userPrompt = `Student's Essay Topic: "${essayTopic}"\n\nStudent's Essay:\n${essayContent}\n\nOfficial SBC Curriculum Context:\n${contextText}\n\nNow, analyze the essay's alignment with the provided context and return the JSON.`;

        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'system', content: ragSystemPrompt }, { role: 'user', content: userPrompt }],
            response_format: { type: "json_object" },
        });

        const rawJson = response.choices[0].message.content;
        if (!rawJson) throw new Error("AI returned an empty response for SBC alignment.");
        
        const analysisResult = JSON.parse(rawJson);
        
        // Save the analysis to the database
        const { error: saveError } = await supabase.from('essay_analysis').insert({
            essay_id: essayId,
            analysis_type: 'sbc_alignment',
            results: analysisResult
        });
        if (saveError) throw new Error(`Failed to save analysis: ${saveError.message}`);

        revalidatePath(`/dashboard/student/essay-helper/${essayId}`);
        return { analysis: analysisResult };

    } catch (e: any) {
        console.error("SBC Alignment Analysis Error:", e);
        return { error: `Failed to analyze SBC alignment: ${e.message}` };
    }
}


// ######################################################################
// ACTION 3: CREATE A NEW ESSAY
// Creates a new essay with initial content structure for the Tiptap editor.
// ######################################################################

const createEssaySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  topic: z.string().min(5, "Topic is required to provide curriculum context."),
});

export async function createNewEssay(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const validation = createEssaySchema.safeParse({
        title: formData.get('title'),
        topic: formData.get('topic'),
    });

    if (!validation.success) {
        return { error: "Invalid data. Please check your inputs." };
    }

    const { title, topic } = validation.data;

    // Create the initial placeholder content for the Tiptap editor
    const initialContent = {
        type: "doc",
        content: [
            {
                type: "heading",
                attrs: { level: 1 },
                content: [{ type: "text", text: title }]
            },
            {
                type: "paragraph",
                content: [{ type: "text", text: "Start writing your essay here..." }]
            }
        ]
    };

    const { data: newEssay, error } = await supabase.from('essays')
        .insert({
            student_id: user.id,
            title: title,
            topic: topic,
            content: initialContent
        })
        .select('id')
        .single();
    
    if (error || !newEssay) {
        console.error("Create Essay Error:", error);
        return { error: "Failed to create a new essay in the database." };
    }
    
    // Do not revalidate here, just redirect straight to the new editor page.
    redirect(`/dashboard/student/essay-helper/${newEssay.id}`);
}
