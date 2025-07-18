// frontend/src/components/student/FlashcardReviewClient.tsx
"use client";
import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { updateSrsReview } from "@/app/dashboard/student/notes/actions";

export const FlashcardReviewClient = ({ initialReviews }) => {
    const [reviews, setReviews] = useState(initialReviews);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isPending, startTransition] = useTransition();
    
    const currentReview = reviews[currentIndex];

    const handleFlip = () => setIsFlipped(prev => !prev);
    
    const handleAssessment = (quality: number) => {
        startTransition(async () => {
            await updateSrsReview(
                currentReview.id, 
                currentReview.interval, 
                currentReview.ease_factor, 
                quality
            );
            
            // Move to the next card
            setIsFlipped(false);
            if (currentIndex < reviews.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                // End of session
                setReviews([]); // Clear the array to show completion message
            }
        });
    }
    
    if (reviews.length === 0) {
         return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold text-green-600">Session Complete!</h1>
                <p className="text-slate-600 mt-2">You've finished your review for now. Come back tomorrow for more!</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center">
            <AnimatePresence mode="wait">
                <motion.div 
                    key={currentReview.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-2xl h-80 perspective-1000"
                    onClick={handleFlip}
                >
                    <motion.div 
                        className="w-full h-full relative preserve-3d"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Front of the Card */}
                        <div className="absolute w-full h-full backface-hidden">
                            <Card className="w-full h-full flex items-center justify-center p-6 text-center">
                                <p className="text-2xl font-semibold">{currentReview.flashcard.front_content}</p>
                            </Card>
                        </div>
                        {/* Back of the Card */}
                        <div className="absolute w-full h-full backface-hidden transform-rotate-y-180">
                            <Card className="w-full h-full flex items-center justify-center p-6 text-center bg-slate-50">
                                 <p className="text-xl">{currentReview.flashcard.back_content}</p>
                            </Card>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
            
            {isFlipped && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 text-center space-x-2"
                >
                    <p className="mb-2 font-semibold">How well did you remember?</p>
                    <Button variant="destructive" onClick={() => handleAssessment(1)} disabled={isPending}>Again</Button>
                    <Button variant="outline" onClick={() => handleAssessment(3)} disabled={isPending}>Hard</Button>
                    <Button variant="secondary" onClick={() => handleAssessment(4)} disabled={isPending}>Good</Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleAssessment(5)} disabled={isPending}>Easy</Button>
                </motion.div>
            )}
        </div>
    )
}