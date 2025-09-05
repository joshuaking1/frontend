// frontend/src/components/student/LearningPageClient.tsx
"use client";

import { useState } from "react";
import { InteractiveLearningHub } from "@/components/student/InteractiveLearningHub";
import { LearningContentDisplay } from "@/components/student/LearningContentDisplay";
import { LearningQuiz } from "@/components/student/LearningQuiz";

interface LearningContent {
  title: string;
  content: string;
  keyTakeaways: string[];
  estimatedTime: string;
  difficulty: string;
  subject: string;
}

type LearningState = 'hub' | 'content' | 'quiz';

export const LearningPageClient = () => {
  const [currentState, setCurrentState] = useState<LearningState>('hub');
  const [learningContent, setLearningContent] = useState<LearningContent | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string>('');

  const handleContentGenerated = (content: LearningContent) => {
    setLearningContent(content);
    setCurrentTopic(content.title);
    setCurrentState('content');
  };

  const handleBackToHub = () => {
    setCurrentState('hub');
    setLearningContent(null);
    setCurrentTopic('');
  };

  const handleStartQuiz = () => {
    setCurrentState('quiz');
  };

  const handleQuizComplete = (score: number, total: number) => {
    // You could save the quiz results to the database here
    console.log(`Quiz completed: ${score}/${total}`);
    // For now, just go back to content
    setCurrentState('content');
  };

  const handleBackToContent = () => {
    setCurrentState('content');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {currentState === 'hub' && (
        <div className="py-8 px-4">
          <InteractiveLearningHub onContentGenerated={handleContentGenerated} />
        </div>
      )}

      {currentState === 'content' && learningContent && (
        <div className="py-8 px-4">
          <LearningContentDisplay
            content={learningContent}
            onBack={handleBackToHub}
            onStartQuiz={handleStartQuiz}
          />
        </div>
      )}

      {currentState === 'quiz' && (
        <div className="py-8 px-4">
          <LearningQuiz
            topic={currentTopic}
            onBack={handleBackToContent}
            onComplete={handleQuizComplete}
          />
        </div>
      )}
    </div>
  );
};
