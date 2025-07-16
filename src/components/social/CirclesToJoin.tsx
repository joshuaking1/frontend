// src/components/social/CirclesToJoin.tsx
import { createClient } from "@/lib/supabase/server";
import { JoinCircleButton } from "./JoinCircleButton";

export const CirclesToJoin = async ({ userId }: { userId: string }) => {
    const supabase = await createClient();
    
    // Fetch IDs of circles the user is already in
    const { data: memberCircles } = await supabase.from('circle_members').select('circle_id').eq('member_id', userId);
    const memberCircleIds = memberCircles?.map(c => c.circle_id) || [];

    // Start building the query
    let query = supabase.from('study_circles').select('*');

    // **THE CRUCIAL FIX:** Only apply the .not() filter if the user is actually a member of some circles.
    if (memberCircleIds.length > 0) {
        query = query.not('id', 'in', `(${memberCircleIds.join(',')})`);
    }

    // Now execute the query
    const { data: circlesToJoin } = await query;
    
    if (!circlesToJoin || circlesToJoin.length === 0) {
        return (
             <div className="bg-white p-4 rounded-lg shadow-sm h-fit">
                <h3 className="font-bold text-lg text-brand-blue mb-2">Discover Circles</h3>
                <p className="text-sm text-slate-500">No new circles to join right now.</p>
            </div>
        )
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm h-fit">
            <h3 className="font-bold text-lg text-brand-blue mb-4">Discover Circles</h3>
            <div className="space-y-3">
                {circlesToJoin.map(circle => (
                    <div key={circle.id} className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-slate-700">{circle.name}</p>
                            <p className="text-xs text-slate-500">{circle.description}</p>
                        </div>
                        <JoinCircleButton circleId={circle.id} />
                    </div>
                ))}
            </div>
        </div>
    );
}
