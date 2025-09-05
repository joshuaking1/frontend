// frontend/src/components/student/VideoSection.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Clock, 
  Eye, 
  ExternalLink, 
  Loader2,
  AlertCircle,
  Youtube
} from "lucide-react";

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
}

interface VideoSectionProps {
  topic: string;
}

export const VideoSection = ({ topic }: VideoSectionProps) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  useEffect(() => {
    fetchVideos();
  }, [topic]);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/student/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });
      
      const result = await response.json();
      
      if (result.videos) {
        setVideos(result.videos);
      } else {
        setError(result.error || "Failed to fetch videos");
      }
    } catch (err) {
      setError("Failed to fetch videos");
    } finally {
      setIsLoading(false);
    }
  };

  const openVideo = (video: YouTubeVideo) => {
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Youtube className="mr-2 h-5 w-5 text-red-500" />
            Related Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Finding educational videos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Youtube className="mr-2 h-5 w-5 text-red-500" />
            Related Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-slate-500">
            <AlertCircle className="h-6 w-6 mr-2" />
            <span>Unable to load videos at this time</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (videos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Youtube className="mr-2 h-5 w-5 text-red-500" />
            Related Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Youtube className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p>No videos found for this topic</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Youtube className="mr-2 h-5 w-5 text-red-500" />
            Related Videos
          </CardTitle>
          <p className="text-sm text-slate-600">
            Watch these educational videos to enhance your understanding of {topic}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <div
                key={video.id}
                className="group cursor-pointer rounded-lg overflow-hidden border hover:shadow-lg transition-all duration-200"
                onClick={() => openVideo(video)}
              >
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <Badge className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white">
                    {video.duration}
                  </Badge>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-brand-blue transition-colors">
                    {video.title}
                  </h3>
                  
                  <div className="flex items-center text-xs text-slate-500 space-x-3 mb-2">
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {video.viewCount}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(video.publishedAt)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {video.channelTitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg line-clamp-1">
                {selectedVideo.title}
              </h3>
              <Button variant="ghost" size="sm" onClick={closeVideo}>
                ✕
              </Button>
            </div>
            
            <div className="p-4">
              <div className="aspect-video mb-4">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                  title={selectedVideo.title}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>{selectedVideo.channelTitle}</span>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {selectedVideo.viewCount}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {selectedVideo.duration}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-slate-700 line-clamp-3">
                  {selectedVideo.description}
                </p>
                
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${selectedVideo.id}`, '_blank')}
                    className="flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Watch on YouTube
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
