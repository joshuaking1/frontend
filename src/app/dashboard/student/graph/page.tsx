// frontend/src/app/dashboard/student/graph/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { KnowledgeGraphClient } from "@/components/student/KnowledgeGraphClient";

export default async function KnowledgeGraphPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { redirect('/auth/sign-in'); }

    // Fetch all nodes and edges for this student
    const [nodesResult, edgesResult] = await Promise.all([
        supabase.from('knowledge_graph_nodes').select('*').eq('student_id', user.id),
        supabase.from('knowledge_graph_edges').select('*').eq('student_id', user.id)
    ]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-brand-blue">Your Knowledge Graph</h1>
            <p className="text-slate-600 mb-6">A visual map of how concepts in your notes are interconnected. Drag and zoom to explore.</p>
            <div className="h-[75vh] w-full bg-white rounded-lg shadow-lg border">
                 <KnowledgeGraphClient nodes={nodesResult.data || []} edges={edgesResult.data || []} />
            </div>
        </div>
    );
}
