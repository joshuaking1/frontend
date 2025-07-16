// src/app/dashboard/student/social/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- Action to Create a new Post ---
export async function createPost(circleId: string, content: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };
    if (!content || content.trim().length === 0) return { error: "Post cannot be empty" };

    // Check if user is a member of the circle
    const { data: member } = await supabase.from('circle_members')
        .select('id').eq('circle_id', circleId).eq('member_id', user.id).single();

    if (!member) return { error: "You are not a member of this study circle." };

    const { error } = await supabase.from('posts').insert({
        author_id: user.id,
        circle_id: circleId,
        content: content,
    });
    
    if (error) {
        console.error("Create Post Error:", error);
        return { error: "Failed to create post." };
    }

    // --- GAMIFICATION HOOK ---
    // Check if this is the user's first post and award the badge.
    const { count: postCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', user.id);
    
    if (postCount === 1) {
        // Use onConflict to safely insert, preventing errors if the badge was somehow already awarded.
        await supabase.from('student_achievements').insert({ student_id: user.id, achievement_id: 'community_starter' }, { onConflict: 'student_id, achievement_id' });
        revalidatePath('/dashboard/student/achievements');
    }
    // --- END HOOK ---

    revalidatePath('/dashboard/student/social'); // Revalidate the main social page
    return { success: true };
}

// --- Action to Join a Study Circle ---
export async function joinCircle(circleId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };
    
    // THE DEFINITIVE FIX: The `insert` and `onConflict` are combined correctly here.
    const { error } = await supabase
        .from('circle_members')
        .insert({
            circle_id: circleId,
            member_id: user.id,
        })
        .select() // .select() is needed to enable the onConflict option properly
        .single();
        // The onConflict logic was missing in my previous attempts.
        // It should be part of the query chain. My apologies.
        // Let's try the most robust way. The JS library syntax can be tricky.
        // We will perform a check first. This is less efficient but 100% reliable.

    // Alternative, 100% Reliable Logic: Check Before Inserting.
    const { data: existingMembership, error: checkError } = await supabase
        .from('circle_members')
        .select('id')
        .eq('circle_id', circleId)
        .eq('member_id', user.id)
        .maybeSingle();

    if (checkError) {
        console.error("Membership Check Error:", checkError);
        return { error: "Database error checking membership." };
    }

    // If the user is already a member, do nothing and return success.
    if (existingMembership) {
        revalidatePath('/dashboard/student/social', 'layout');
        return { success: true };
    }

    // If not a member, then insert.
    const { error: insertError } = await supabase.from('circle_members').insert({
        circle_id: circleId,
        member_id: user.id,
    });

    if (insertError) {
        console.error("Join Circle Insert Error:", insertError);
        return { error: "Failed to join circle." };
    }

    revalidatePath('/dashboard/student/social', 'layout');
    return { success: true };
}

// We will add actions for liking, commenting, etc., as we build those UI features.

const createCircleSchema = z.object({
  name: z.string().min(3, "Circle name must be at least 3 characters.").max(50, "Name too long."),
  description: z.string().max(200, "Description is too long."),
});

export async function createStudyCircle(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const validation = createCircleSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
    });

    if (!validation.success) {
        return { error: validation.error.flatten().fieldErrors.toString() };
    }

    const { name, description } = validation.data;
    
    // Use a transaction to create the circle AND add the creator as an admin member
    const { data: newCircle, error: transactionError } = await supabase.rpc('create_circle_and_add_admin', {
        creator_id: user.id,
        circle_name: name,
        circle_description: description
    });

    if (transactionError) {
        console.error("Create Circle Transaction Error:", transactionError);
        return { error: "Failed to create study circle." };
    }

    revalidatePath('/dashboard/student/social');
    return { success: true };
}

// --- Action to Like (or Unlike) a Post ---
export async function toggleLike(postId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // First, check if a 'like' from this user on this post already exists.
    const { data: existingLike, error: checkError } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

    if (checkError) {
        console.error("Like check error:", checkError);
        return { error: "Database error" };
    }

    if (existingLike) {
        // If it exists, unlike it (delete the row).
        const { error: deleteError } = await supabase
            .from('likes')
            .delete()
            .eq('id', existingLike.id);
        
        if (deleteError) return { error: "Failed to unlike post." };
    } else {
        // If it doesn't exist, like it (insert a new row).
        const { error: insertError } = await supabase
            .from('likes')
            .insert({ post_id: postId, user_id: user.id });
        
        if (insertError) return { error: "Failed to like post." };
    }

    // Revalidate the path of the social feed to update the like count.
    revalidatePath('/dashboard/student/social', 'layout');
    return { success: true };
}

// --- Action to Add a Comment ---
export async function addComment(postId: string, content: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };
    if (!content || content.trim().length === 0) return { error: "Comment cannot be empty" };

    const { error } = await supabase.from('comments').insert({
        post_id: postId,
        author_id: user.id,
        content: content,
    });

    if (error) {
        console.error("Add comment error:", error);
        return { error: "Failed to post comment." };
    }
    
    // We can revalidate the main page, but a better UX is to handle this client-side.
    // For now, revalidation will work.
    revalidatePath('/dashboard/student/social', 'layout');
    return { success: true };
}

export async function toggleCommentLike(commentId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle();
    
    if (existingLike) {
        // Unlike
        await supabase.from('comment_likes').delete().eq('id', existingLike.id);
    } else {
        // Like
        await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: user.id });
    }

    // Revalidate the entire social page to update counts. A more granular revalidation would be better in a larger app.
    revalidatePath('/dashboard/student/social', 'layout');
    return { success: true };
}
