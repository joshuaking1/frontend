// frontend/src/app/api/teacher/coach/videos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { topic } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Check if YouTube API key is available
    if (!process.env.YOUTUBE_API_KEY) {
      return NextResponse.json({ 
        videos: [],
        message: 'YouTube API key not configured. Videos will be available when API key is set up.'
      });
    }

    // Search for YouTube videos
    const searchQuery = `${topic} education lesson teaching`;
    const youtubeResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=8&key=${process.env.YOUTUBE_API_KEY}&videoDuration=medium&relevanceLanguage=en`
    );

    if (!youtubeResponse.ok) {
      throw new Error(`YouTube API error: ${youtubeResponse.status}`);
    }

    const youtubeData = await youtubeResponse.json();
    
    if (!youtubeData.items || youtubeData.items.length === 0) {
      return NextResponse.json({ 
        videos: [],
        message: 'No videos found for this topic'
      });
    }

    // Format video data
    const videos = youtubeData.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    }));

    // Save search to history
    await supabase.from('teacher_search_history').insert({
      teacher_id: user.id,
      query: `Video search: ${topic}`,
      search_type: 'youtube',
      results: {
        videos: videos.slice(0, 5),
        total_found: videos.length
      }
    });

    return NextResponse.json({
      videos,
      totalFound: videos.length,
      topic
    });
    
  } catch (error) {
    console.error("Video search error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Video search failed",
      videos: []
    }, { status: 500 });
  }
}
