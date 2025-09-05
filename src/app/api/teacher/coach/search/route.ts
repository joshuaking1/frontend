// frontend/src/app/api/teacher/coach/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface SearchResult {
  type: 'youtube' | 'google' | 'image' | 'curriculum';
  title: string;
  description: string;
  url?: string;
  thumbnail?: string;
  source: string;
  relevanceScore: number;
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Get user authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Multi-modal search using different sources
    const searchResults: SearchResult[] = [];

    // 1. YouTube Search
    try {
      const youtubeResults = await searchYouTube(query);
      searchResults.push(...youtubeResults);
    } catch (error) {
      console.error('YouTube search error:', error);
    }

    // 2. Google Search (using SerpAPI or similar)
    try {
      const googleResults = await searchGoogle(query);
      searchResults.push(...googleResults);
    } catch (error) {
      console.error('Google search error:', error);
    }

    // 3. Image Search
    try {
      const imageResults = await searchImages(query);
      searchResults.push(...imageResults);
    } catch (error) {
      console.error('Image search error:', error);
    }

    // 4. Curriculum Search (RAG)
    try {
      const curriculumResults = await searchCurriculum(query, supabase);
      searchResults.push(...curriculumResults);
    } catch (error) {
      console.error('Curriculum search error:', error);
    }

    // Sort by relevance score
    searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return NextResponse.json({ results: searchResults.slice(0, 12) });
    
  } catch (error) {
    console.error("Multi-modal search error:", error);
    return NextResponse.json({ 
      results: [],
      error: error instanceof Error ? error.message : "Search failed" 
    }, { status: 500 });
  }
}

async function searchYouTube(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=medium&videoDefinition=high&relevanceLanguage=en&maxResults=3&q=${encodeURIComponent(query + ' educational tutorial')}&key=${apiKey}`;

  const response = await fetch(searchUrl);
  if (!response.ok) return [];

  const data = await response.json();
  
  return data.items?.map((item: any) => ({
    type: 'youtube' as const,
    title: item.snippet.title,
    description: item.snippet.description,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    thumbnail: item.snippet.thumbnails.medium?.url,
    source: item.snippet.channelTitle,
    relevanceScore: 0.9
  })) || [];
}

async function searchGoogle(query: string): Promise<SearchResult[]> {
  // Using a mock implementation - in production, use SerpAPI or Google Custom Search
  return [
    {
      type: 'google' as const,
      title: `Educational resources for ${query}`,
      description: `Comprehensive educational materials and resources about ${query}`,
      url: `https://www.google.com/search?q=${encodeURIComponent(query + ' education')}`,
      source: 'Google Search',
      relevanceScore: 0.8
    }
  ];
}

async function searchImages(query: string): Promise<SearchResult[]> {
  // Using a mock implementation - in production, use Unsplash API or similar
  return [
    {
      type: 'image' as const,
      title: `Visual representation of ${query}`,
      description: `High-quality images and diagrams related to ${query}`,
      url: `https://unsplash.com/s/photos/${encodeURIComponent(query)}`,
      thumbnail: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=center`,
      source: 'Unsplash',
      relevanceScore: 0.7
    }
  ];
}

async function searchCurriculum(query: string, supabase: any): Promise<SearchResult[]> {
  try {
    // Generate embedding for the query
    const { data: embeddingResponse } = await supabase.functions.invoke('text-to-embedding', { 
      body: { text: query } 
    });

    if (!embeddingResponse?.embedding) return [];

    // Search curriculum chunks
    const { data: chunks } = await supabase.rpc('match_sbc_chunks', {
      query_embedding: embeddingResponse.embedding,
      match_threshold: 0.6,
      match_count: 3
    });

    return chunks?.map((chunk: any) => ({
      type: 'curriculum' as const,
      title: `SBC Curriculum: ${query}`,
      description: chunk.content.substring(0, 150) + '...',
      source: 'Ghana SBC Curriculum',
      relevanceScore: 0.95
    })) || [];

  } catch (error) {
    console.error('Curriculum search error:', error);
    return [];
  }
}

