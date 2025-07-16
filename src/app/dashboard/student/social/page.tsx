// src/app/dashboard/student/social/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StudyCircleList } from "@/components/social/StudyCircleList"; // New location
import { PostCard } from "@/components/social/PostCard"; // New location
import { CreatePostForm } from "@/components/social/CreatePostForm"; // New location
import { CirclesToJoin } from "@/components/social/CirclesToJoin"; // New component
import { CreateCircleForm } from "@/components/social/CreateCircleForm"; // Import the new component

export default async function SocialPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { redirect('/auth/sign-in'); }

    const { data: memberCircles } = await supabase
        .from('circle_members')
        .select(` study_circles (id, name) `)
        .eq('member_id', user.id);

    const memberCircleIds = memberCircles?.map(mc => mc.study_circles?.id).filter(id => id) || [];
    
    // **THE FIX:** Only fetch posts if the user is a member of at least one circle.
    let posts = [];
    if (memberCircleIds.length > 0) {
        const { data: fetchedPosts } = await supabase
            .from('posts')
            .select(`
                *,
                author: profiles (full_name, avatar_url),
                circle: study_circles (name),
                likes ( count ),
                comments ( *, author_id, author: profiles (full_name, avatar_url) )
            `)
            .in('circle_id', memberCircleIds)
            .order('created_at', { ascending: false });
        
        posts = fetchedPosts || [];
    }

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-blue mb-8">
        My Study Circles
      </h1>
      <div className="grid lg:grid-cols-4 gap-8 items-start">
{/* Left Column: My Circles & Circles to Join */}
        <div className="lg:col-span-1 space-y-6">
          <CreateCircleForm /> {/* Add the create button here */}
          <StudyCircleList myCircles={memberCircles || []} />
          <CirclesToJoin userId={user.id} />
        </div>

        {/* Center Column: Feed */}
        <div className="lg:col-span-3 space-y-6">
          {/* The selected circle will be dynamic later, for now post to the first one */}
          <CreatePostForm circleId={memberCircleIds[0]} />

          {posts && posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="text-center p-8 bg-white rounded-lg shadow-sm">
              <p className="text-slate-500">
                Your feed is empty. Join a circle and start a conversation!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
