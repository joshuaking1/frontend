import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen } from "lucide-react";

function getPredictedGrade(score: number): { grade: string; remark: string; color: string } {
    if (score >= 80) return { grade: "A1 (Excellent)", remark: "Outstanding performance! You have mastered this subject.", color: "text-green-600" };
    if (score >= 75) return { grade: "B2 (Very Good)", remark: "Very strong performance. Keep up the great work!", color: "text-green-500" };
    if (score >= 70) return { grade: "B3 (Good)", remark: "A solid performance. You have a good grasp of the material.", color: "text-blue-600" };
    if (score >= 65) return { grade: "C4 (Credit)", remark: "Good job! A credit pass is a strong achievement.", color: "text-blue-500" };
    if (score >= 60) return { grade: "C5 (Credit)", remark: "You've secured a credit pass. Well done.", color: "text-yellow-600" };
    if (score >= 55) return { grade: "C6 (Credit)", remark: "A good effort resulting in a credit pass.", color: "text-yellow-500" };
    if (score >= 50) return { grade: "D7 (Pass)", remark: "You've passed. Let's work on the weak areas to improve this.", color: "text-orange-600" };
    if (score >= 45) return { grade: "E8 (Pass)", remark: "A pass is a good starting point. Let's review your remedial plan.", color: "text-orange-500" };
    return { grade: "F9 (Fail)", remark: "This is a learning opportunity. The remedial plan will guide you on exactly what to study next.", color: "text-red-600" };
}

export default async function ExamReportPage({ params }: { params: { examId: string } }) {
    const supabase = await createClient();
    const { data: answers } = await supabase.from('mock_exam_answers').select(`is_correct, question:question_bank(topic)`).eq('exam_id', params.examId);

    if (!answers || answers.length === 0) {
        return <p>Could not load report for this exam.</p>;
    }

    const correctCount = answers.filter(a => a.is_correct).length;
    const totalCount = answers.length;
    const score = (correctCount / totalCount) * 100;
    
    const prediction = getPredictedGrade(score);

    const topicPerformance: { [key: string]: { correct: number, total: number } } = answers.reduce((acc, curr) => {
        const topic = curr.question.topic || "General";
        if (!acc[topic]) acc[topic] = { correct: 0, total: 0 };
        acc[topic].total++;
        if (curr.is_correct) acc[topic].correct++;
        return acc;
    }, {});

    const { data: remedialPlan } = await supabase.rpc('generate_remedial_plan', { exam_id_param: params.examId });

    return (
        <div className="space-y-6">
            <Card className="text-center bg-white shadow-lg">
                <CardHeader>
                    <CardTitle className="text-4xl font-bold">Exam Report</CardTitle>
                    <CardDescription>Your final score and personalized analysis.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className={`text-7xl font-bold ${prediction.color}`}>{score.toFixed(0)}<span className="text-3xl text-slate-400">%</span></p>
                    <p className="font-semibold mt-2">{correctCount} out of {totalCount} correct</p>
                    <div className="mt-4 bg-slate-50 p-4 rounded-lg">
                        <p className="font-bold text-lg">Predicted WASSCE Grade: <span className={prediction.color}>{prediction.grade}</span></p>
                        <p className="text-slate-600 mt-1">{prediction.remark}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white">
                <CardHeader><CardTitle>Performance by Topic</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {Object.entries(topicPerformance).map(([topic, data]) => {
                        const topicScore = (data.correct / data.total) * 100;
                        const progressBarColor = topicScore >= 70 ? 'bg-green-500' : topicScore >= 50 ? 'bg-yellow-500' : 'bg-red-500';
                        return (
                            <div key={topic}>
                                <div className="flex justify-between font-semibold mb-1">
                                    <p>{topic}</p>
                                    <p>{data.correct}/{data.total}</p>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2.5">
                                    <div className={`${progressBarColor} h-2.5 rounded-full`} style={{width: `${topicScore}%`}}></div>
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            <Card className="bg-white">
                <CardHeader>
                    <CardTitle>Your Personalized Remedial Study Plan</CardTitle>
                    <CardDescription>Focus on these topics to improve your score. The AI has identified these as your weakest areas from this exam.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {remedialPlan && remedialPlan.length > 0 ? remedialPlan.map(item => (
                        <Link key={item.topic} href={`/dashboard/student/learn/${item.resource_id}`}>
                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border">
                                <div>
                                    <p className="font-semibold">{item.remedial_action}</p>
                                    <p className="text-slate-600">{item.topic}</p>
                                </div>
                                <Button variant="outline"><BookOpen className="mr-2 h-4 w-4"/>Start Review</Button>
                            </div>
                        </Link>
                    )) : (
                        <p className="text-slate-500">Your performance was excellent! No specific remedial actions are recommended from this exam.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
