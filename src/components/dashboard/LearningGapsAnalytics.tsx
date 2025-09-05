// frontend/src/components/dashboard/LearningGapsAnalytics.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  Users,
  BookOpen,
  Lightbulb,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

interface AssessmentData {
  id: string;
  studentName: string;
  subject: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  topics: string[];
  strengths: string[];
  weaknesses: string[];
  date: string;
}

interface LearningGap {
  id: string;
  topic: string;
  subject: string;
  affectedStudents: string[];
  severity: 'high' | 'medium' | 'low';
  frequency: number;
  trend: 'improving' | 'declining' | 'stable';
  recommendations: string[];
}

interface GapAnalysis {
  totalGaps: number;
  highPriorityGaps: number;
  mediumPriorityGaps: number;
  lowPriorityGaps: number;
  mostAffectedSubject: string;
  gaps: LearningGap[];
}

export const LearningGapsAnalytics = () => {
  const [assessmentData, setAssessmentData] = useState<AssessmentData[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis>({
    totalGaps: 0,
    highPriorityGaps: 0,
    mediumPriorityGaps: 0,
    lowPriorityGaps: 0,
    mostAffectedSubject: '',
    gaps: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessmentData();
  }, []);

  const fetchAssessmentData = async () => {
    try {
      const response = await fetch('/api/teacher/coach/assessments/recent');
      const data = await response.json();
      
      if (data.assessments) {
        setAssessmentData(data.assessments);
        analyzeLearningGaps(data.assessments);
      }
    } catch (error) {
      console.error('Error fetching assessment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeLearningGaps = (assessments: AssessmentData[]) => {
    if (assessments.length === 0) {
      setGapAnalysis({
        totalGaps: 0,
        highPriorityGaps: 0,
        mediumPriorityGaps: 0,
        lowPriorityGaps: 0,
        mostAffectedSubject: '',
        gaps: []
      });
      return;
    }

    // Analyze weaknesses across all assessments
    const weaknessMap: { [key: string]: { students: Set<string>, subject: string, count: number } } = {};
    const subjectWeaknessCount: { [key: string]: number } = {};

    assessments.forEach(assessment => {
      const subject = assessment.subject;
      subjectWeaknessCount[subject] = (subjectWeaknessCount[subject] || 0) + 1;

      assessment.weaknesses.forEach(weakness => {
        if (!weaknessMap[weakness]) {
          weaknessMap[weakness] = {
            students: new Set(),
            subject: subject,
            count: 0
          };
        }
        weaknessMap[weakness].students.add(assessment.studentName);
        weaknessMap[weakness].count++;
      });
    });

    // Convert to learning gaps
    const gaps: LearningGap[] = Object.entries(weaknessMap).map(([topic, data]) => {
      const affectedCount = data.students.size;
      const totalStudents = new Set(assessments.map(a => a.studentName)).size;
      const frequency = data.count;
      
      // Determine severity based on affected students and frequency
      let severity: 'high' | 'medium' | 'low';
      if (affectedCount >= Math.ceil(totalStudents * 0.7) || frequency >= 5) {
        severity = 'high';
      } else if (affectedCount >= Math.ceil(totalStudents * 0.4) || frequency >= 3) {
        severity = 'medium';
      } else {
        severity = 'low';
      }

      // Determine trend (simplified - would need historical data for accurate trend)
      const trend: 'improving' | 'declining' | 'stable' = 'stable';

      // Generate recommendations based on topic and severity
      const recommendations = generateRecommendations(topic, severity, data.subject);

      return {
        id: `gap-${topic.replace(/\s+/g, '-').toLowerCase()}`,
        topic,
        subject: data.subject,
        affectedStudents: Array.from(data.students),
        severity,
        frequency,
        trend,
        recommendations
      };
    });

    // Sort gaps by severity and frequency
    gaps.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return b.frequency - a.frequency;
    });

    // Calculate summary statistics
    const highPriorityGaps = gaps.filter(g => g.severity === 'high').length;
    const mediumPriorityGaps = gaps.filter(g => g.severity === 'medium').length;
    const lowPriorityGaps = gaps.filter(g => g.severity === 'low').length;

    // Find most affected subject
    const mostAffectedSubject = Object.entries(subjectWeaknessCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    setGapAnalysis({
      totalGaps: gaps.length,
      highPriorityGaps,
      mediumPriorityGaps,
      lowPriorityGaps,
      mostAffectedSubject,
      gaps: gaps.slice(0, 10) // Show top 10 gaps
    });
  };

  const generateRecommendations = (topic: string, severity: string, subject: string): string[] => {
    const recommendations: string[] = [];
    
    if (severity === 'high') {
      recommendations.push(`Immediate intervention needed for ${topic}`);
      recommendations.push(`Create targeted practice exercises for ${topic}`);
      recommendations.push(`Consider one-on-one tutoring sessions`);
    } else if (severity === 'medium') {
      recommendations.push(`Additional practice materials for ${topic}`);
      recommendations.push(`Group study sessions focused on ${topic}`);
    } else {
      recommendations.push(`Monitor progress in ${topic}`);
      recommendations.push(`Provide supplementary resources`);
    }

    // Subject-specific recommendations
    if (subject.toLowerCase().includes('math')) {
      recommendations.push('Use visual aids and manipulatives');
      recommendations.push('Practice with real-world applications');
    } else if (subject.toLowerCase().includes('english')) {
      recommendations.push('Increase reading comprehension exercises');
      recommendations.push('Focus on vocabulary building');
    } else if (subject.toLowerCase().includes('science')) {
      recommendations.push('Hands-on experiments and demonstrations');
      recommendations.push('Connect concepts to everyday life');
    }

    return recommendations.slice(0, 3); // Limit to 3 recommendations
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Target className="h-4 w-4 text-gray-600" />;
      default: return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Learning Gaps Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <Target className="h-8 w-8 mx-auto mb-2 animate-pulse" />
              <p>Analyzing learning gaps...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assessmentData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Learning Gaps Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium">No assessment data yet</p>
              <p className="text-sm">Add student assessments to identify learning gaps</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gap Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Gaps</p>
                <p className="text-2xl font-bold text-brand-blue">{gapAnalysis.totalGaps}</p>
              </div>
              <Target className="h-8 w-8 text-brand-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{gapAnalysis.highPriorityGaps}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Medium Priority</p>
                <p className="text-2xl font-bold text-yellow-600">{gapAnalysis.mediumPriorityGaps}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Most Affected</p>
                <p className="text-lg font-bold text-purple-600 truncate">{gapAnalysis.mostAffectedSubject}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Gaps List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Identified Learning Gaps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gapAnalysis.gaps.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                <p className="text-lg font-medium">No learning gaps identified</p>
                <p className="text-sm">Great job! Students are performing well across all topics.</p>
              </div>
            ) : (
              gapAnalysis.gaps.map((gap) => (
                <div key={gap.id} className={`p-4 rounded-lg border ${getSeverityColor(gap.severity)}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getSeverityIcon(gap.severity)}
                      <h4 className="font-semibold">{gap.topic}</h4>
                      <Badge variant="outline" className="text-xs">
                        {gap.subject}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(gap.trend)}
                      <Badge className={getSeverityColor(gap.severity)}>
                        {gap.severity} priority
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Affected Students ({gap.affectedStudents.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {gap.affectedStudents.slice(0, 5).map((student, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {student}
                          </Badge>
                        ))}
                        {gap.affectedStudents.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{gap.affectedStudents.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Recommendations</p>
                      <ul className="text-xs space-y-1">
                        {gap.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start">
                            <Lightbulb className="h-3 w-3 mt-0.5 mr-1 text-yellow-600" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
