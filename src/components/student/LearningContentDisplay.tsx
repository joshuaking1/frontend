// frontend/src/components/student/LearningContentDisplay.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Clock, 
  Target, 
  CheckCircle, 
  ArrowLeft,
  ArrowRight,
  Brain,
  Trophy,
  RefreshCw
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { VideoSection } from "./VideoSection";

interface LearningContent {
  title: string;
  content: string;
  keyTakeaways: string[];
  estimatedTime: string;
  difficulty: string;
  subject: string;
}

interface LearningContentDisplayProps {
  content: LearningContent;
  onBack: () => void;
  onStartQuiz: () => void;
}

export const LearningContentDisplay = ({ 
  content, 
  onBack, 
  onStartQuiz 
}: LearningContentDisplayProps) => {
  const [readingProgress, setReadingProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    setReadingProgress(Math.min(progress, 100));
    
    // Mark as completed when user scrolls to 90%
    if (progress >= 90 && !isCompleted) {
      setIsCompleted(true);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Learning Hub
        </Button>
        
        <div className="flex items-center space-x-2">
          <Badge className={getDifficultyColor(content.difficulty)}>
            {content.difficulty}
          </Badge>
          <Badge variant="outline" className="flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            {content.estimatedTime}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Reading Progress</span>
          <span>{Math.round(readingProgress)}%</span>
        </div>
        <Progress value={readingProgress} className="h-2" />
      </div>

      {/* Main Content Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-brand-blue to-brand-orange text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center">
                <BookOpen className="mr-3 h-8 w-8" />
                {content.title}
              </CardTitle>
              <p className="text-white/90 mt-2">{content.subject}</p>
            </div>
            {isCompleted && (
              <div className="flex items-center text-green-200">
                <CheckCircle className="mr-2 h-6 w-6" />
                <span className="font-semibold">Completed!</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent 
          className="prose prose-lg max-w-none p-8"
          onScroll={handleScroll}
          style={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
          <ReactMarkdown>{content.content}</ReactMarkdown>
        </CardContent>
      </Card>

      {/* Key Takeaways */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Brain className="mr-2 h-5 w-5 text-brand-blue" />
            Key Takeaways
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {content.keyTakeaways.map((takeaway, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">{takeaway}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Video Section */}
      <VideoSection topic={content.title} />

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Review Content
        </Button>
        
        <Button 
          onClick={onStartQuiz}
          disabled={!isCompleted}
          className="bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-3 text-lg"
        >
          <Trophy className="mr-2 h-5 w-5" />
          {isCompleted ? 'Take Quiz' : 'Complete Reading First'}
        </Button>
      </div>
    </div>
  );
};
