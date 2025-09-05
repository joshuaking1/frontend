// frontend/src/components/student/InteractiveLearningHub.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Brain, 
  Sparkles, 
  Search, 
  ArrowRight,
  Lightbulb,
  Target,
  Clock,
  Users
} from "lucide-react";
// Removed server action import - will use API route instead

interface LearningContent {
  title: string;
  content: string;
  keyTakeaways: string[];
  estimatedTime: string;
  difficulty: string;
  subject: string;
}

interface InteractiveLearningHubProps {
  onContentGenerated: (content: LearningContent) => void;
}

export const InteractiveLearningHub = ({ onContentGenerated }: InteractiveLearningHubProps) => {
  const [subject, setSubject] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions] = useState([
    "Mathematics - Algebra",
    "Science - Photosynthesis", 
    "English - Creative Writing",
    "History - Ghana Independence",
    "Geography - Climate Change",
    "Physics - Newton's Laws",
    "Chemistry - Chemical Reactions",
    "Biology - Human Body Systems"
  ]);

  const handleGenerate = async () => {
    if (!subject.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/student/learn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: subject }),
      });
      
      const result = await response.json();
      
      if (result.content) {
        onContentGenerated(result.content);
      } else {
        console.error("Error generating content:", result.error);
      }
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSubject(suggestion);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-to-r from-brand-blue to-brand-orange rounded-full">
            <BookOpen className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-brand-blue">
          What would you like to learn today?
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Tell me any subject or topic, and I'll create a personalized learning experience just for you!
        </p>
      </div>

      {/* Input Section */}
      <Card className="border-2 border-dashed border-brand-blue/20 hover:border-brand-blue/40 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Search className="mr-2 h-6 w-6 text-brand-blue" />
            Start Your Learning Journey
          </CardTitle>
          <CardDescription>
            Type any subject, topic, or concept you want to explore
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Photosynthesis, Algebra, World War II, Creative Writing..."
              className="text-lg py-6 px-4"
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <Button 
              onClick={handleGenerate}
              disabled={!subject.trim() || isGenerating}
              size="lg"
              className="px-8 py-6 bg-brand-orange hover:bg-brand-orange/90"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Learn Now
                </>
              )}
            </Button>
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-600 flex items-center">
              <Lightbulb className="mr-2 h-4 w-4" />
              Popular topics to get you started:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-brand-blue hover:text-white transition-colors px-3 py-1"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="text-center p-6">
          <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">AI-Powered Content</h3>
          <p className="text-slate-600 text-sm">
            Content generated using official curriculum and educational best practices
          </p>
        </Card>
        
        <Card className="text-center p-6">
          <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-4">
            <Target className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Personalized Learning</h3>
          <p className="text-slate-600 text-sm">
            Tailored explanations and examples based on your chosen topic
          </p>
        </Card>
        
        <Card className="text-center p-6">
          <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
            <Clock className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Interactive Quizzes</h3>
          <p className="text-slate-600 text-sm">
            Test your understanding with quizzes at the end of each lesson
          </p>
        </Card>
      </div>
    </div>
  );
};
