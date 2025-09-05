// frontend/src/components/student/LearningQuiz.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Trophy,
  Brain,
  Target,
  Clock,
  RefreshCw
} from "lucide-react";
// Removed server action import - will use API route instead

interface QuizQuestion {
  type: 'mcq' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  dokLevel: string;
}

interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

interface LearningQuizProps {
  topic: string;
  onBack: () => void;
  onComplete: (score: number, total: number) => void;
}

export const LearningQuiz = ({ topic, onBack, onComplete }: LearningQuizProps) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateQuiz();
  }, [topic]);

  const generateQuiz = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/student/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });
      
      const result = await response.json();
      
      if (result.quiz) {
        setQuiz(result.quiz);
      } else {
        setError(result.error || "Failed to generate quiz");
      }
    } catch (err) {
      setError("Failed to generate quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
  };

  const nextQuestion = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      showQuizResults();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const showQuizResults = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    if (!quiz) return { correct: 0, total: 0 };
    
    let correct = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    
    return { correct, total: quiz.questions.length };
  };

  const getDOKColor = (level: string) => {
    switch (level) {
      case '1': return 'bg-green-100 text-green-800';
      case '2': return 'bg-blue-100 text-blue-800';
      case '3': return 'bg-yellow-100 text-yellow-800';
      case '4': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreMessage = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return "Excellent! You've mastered this topic! 🎉";
    if (percentage >= 70) return "Great job! You have a good understanding! 👍";
    if (percentage >= 50) return "Good effort! Keep studying to improve! 📚";
    return "Don't worry! Review the content and try again! 💪";
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
        <p className="text-lg text-slate-600">Generating your personalized quiz...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-lg text-slate-600 mb-4">{error || "Failed to load quiz"}</p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Learning
        </Button>
      </div>
    );
  }

  if (showResults) {
    const { correct, total } = calculateScore();
    const percentage = Math.round((correct / total) * 100);

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="text-center">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <CardTitle className="text-3xl flex items-center justify-center">
              <Trophy className="mr-3 h-8 w-8" />
              Quiz Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-6xl font-bold text-brand-blue mb-4">
              {percentage}%
            </div>
            <p className="text-xl text-slate-600 mb-6">
              {correct} out of {total} questions correct
            </p>
            <p className="text-lg text-slate-700 mb-8">
              {getScoreMessage(correct, total)}
            </p>
            
            <div className="flex justify-center space-x-4">
              <Button onClick={onBack} variant="outline" size="lg">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Learning
              </Button>
              <Button 
                onClick={() => {
                  setShowResults(false);
                  setCurrentQuestion(0);
                  setAnswers({});
                }} 
                className="bg-brand-orange hover:bg-brand-orange/90"
                size="lg"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Retake Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Learning
        </Button>
        
        <div className="flex items-center space-x-4">
          <Badge className={getDOKColor(question.dokLevel)}>
            DOK Level {question.dokLevel}
          </Badge>
          <span className="text-sm text-slate-600">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div 
          className="bg-brand-blue h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Brain className="mr-2 h-6 w-6 text-brand-blue" />
            {question.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {question.type === 'mcq' ? (
            <RadioGroup
              value={answers[currentQuestion] || ''}
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <Input
              value={answers[currentQuestion] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              className="text-lg py-3"
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        <Button 
          onClick={nextQuestion}
          className="bg-brand-orange hover:bg-brand-orange/90"
        >
          {currentQuestion === quiz.questions.length - 1 ? (
            <>
              <Trophy className="mr-2 h-4 w-4" />
              Finish Quiz
            </>
          ) : (
            <>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
