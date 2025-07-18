// frontend/src/components/student/ExamClient.tsx
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { finishExam, submitAnswer } from "@/app/dashboard/student/exams/actions";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

export const ExamClient = ({ examDetails, initialQuestions }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState(() => {
        const initial = {};
        initialQuestions.forEach(q => {
            if (q.student_answer) initial[q.question_id] = q.student_answer;
        });
        return initial;
    });
    const [timeLeft, setTimeLeft] = useState(3600); // 1 hour

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Time's up! Auto-submit the exam
                    clearInterval(timer);
                    finishExam(examDetails.id);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Cleanup timer on component unmount
        return () => clearInterval(timer);
    }, [examDetails.id]);

    const handleSelectAnswer = async (questionId, answer) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
        // Debounce this in a real app, but for now, we submit on every click
        await submitAnswer(initialQuestions.find(q => q.question_id === questionId).id, answer);
    };
    
    // Add safety checks
    if (!initialQuestions || initialQuestions.length === 0) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">No Questions Available</h1>
                <p className="text-gray-600">This exam doesn't have any questions loaded.</p>
            </div>
        );
    }

    const currentQuestionData = initialQuestions[currentIndex];
    const currentQuestion = currentQuestionData?.question;

    if (!currentQuestion) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Question Loading Error</h1>
                <p className="text-gray-600">Question data is not available.</p>
                <pre className="mt-4 text-sm text-left bg-gray-100 p-4 rounded">
                    {JSON.stringify(currentQuestionData, null, 2)}
                </pre>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <header className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold">{examDetails.subject} - {examDetails.exam_type}</h1>
                    <p className="text-slate-500">Question {currentIndex + 1} of {initialQuestions.length}</p>
                </div>
                <div className={`font-bold text-xl p-2 rounded-lg ${
                    timeLeft <= 300 ? 'bg-red-100 text-red-700 animate-pulse' : // 5 minutes or less
                    timeLeft <= 600 ? 'bg-yellow-100 text-yellow-700' : // 10 minutes or less
                    'bg-blue-100 text-blue-700' // More than 10 minutes
                }`}>
                    {Math.floor(timeLeft / 60)}:{('0' + timeLeft % 60).slice(-2)}
                </div>
            </header>

            <Card className="flex-grow">
                <CardHeader><CardTitle>{currentQuestion.question_text}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {currentQuestion.options.map((option, index) => (
                        <Button key={index} 
                            variant={answers[currentQuestion.id] === option ? "default" : "outline"}
                            className="w-full justify-start text-left h-auto py-3"
                            onClick={() => handleSelectAnswer(currentQuestion.id, option)}
                        >
                            <span className="mr-4 font-bold">{String.fromCharCode(65 + index)}.</span>
                            <span>{option}</span>
                        </Button>
                    ))}
                </CardContent>
            </Card>

            <footer className="flex justify-between items-center mt-4">
                <Button onClick={() => setCurrentIndex(p => Math.max(0, p - 1))} disabled={currentIndex === 0}>
                    <ArrowLeft className="mr-2"/> Previous
                </Button>
                <div className="flex gap-2">
                    {initialQuestions.map((q, index) => (
                        <button key={q.id} onClick={() => setCurrentIndex(index)}
                            className={`h-8 w-8 rounded-full ${index === currentIndex ? 'bg-brand-blue text-white' : (answers[q.question_id] ? 'bg-green-500 text-white' : 'bg-slate-200')}`}
                        >{index + 1}</button>
                    ))}
                </div>
                {currentIndex === initialQuestions.length - 1 ? (
                    <form action={() => finishExam(examDetails.id)}>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="mr-2"/> Finish Exam
                        </Button>
                    </form>
                ) : (
                    <Button onClick={() => setCurrentIndex(p => p + 1)}>Next <ArrowRight className="ml-2"/></Button>
                )}
            </footer>
        </div>
    );
};
