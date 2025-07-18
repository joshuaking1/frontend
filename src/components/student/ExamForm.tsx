"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { startPersonalizedExam } from "@/app/dashboard/student/exams/actions";

interface ExamFormProps {
    examType: string;
    subject: string;
    children: React.ReactNode;
}

export function ExamForm({ examType, subject, children }: ExamFormProps) {
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        setError("");
        
        try {
            const result = await startPersonalizedExam(examType, subject);
            if (result?.error) {
                setError(result.error);
            }
        } catch (error) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form action={handleSubmit}>
            <Button type="submit" disabled={isLoading}>
                {isLoading ? "Starting..." : children}
            </Button>
            {error && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                </div>
            )}
        </form>
    );
}
