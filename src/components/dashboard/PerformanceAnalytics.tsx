// frontend/src/components/dashboard/PerformanceAnalytics.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

interface AssessmentData {
  id: string;
  student_name: string;
  subject: string;
  score: number;
  total_questions: number;
  percentage: number;
  created_at: string;
}

interface PerformanceStats {
  totalAssessments: number;
  averageScore: number;
  totalStudents: number;
  subjects: { [key: string]: number };
  recentTrend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export const PerformanceAnalytics = () => {
  const [assessmentData, setAssessmentData] = useState<AssessmentData[]>([]);
  const [stats, setStats] = useState<PerformanceStats>({
    totalAssessments: 0,
    averageScore: 0,
    totalStudents: 0,
    subjects: {},
    recentTrend: 'stable',
    trendPercentage: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('/api/teacher/coach/assessments/recent');
      const data = await response.json();
      
      if (data.assessments) {
        setAssessmentData(data.assessments);
        calculateStats(data.assessments);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (assessments: any[]) => {
    if (assessments.length === 0) {
      setStats({
        totalAssessments: 0,
        averageScore: 0,
        totalStudents: 0,
        subjects: {},
        recentTrend: 'stable',
        trendPercentage: 0
      });
      return;
    }

    const totalAssessments = assessments.length;
    const averageScore = Math.round(
      assessments.reduce((sum, a) => sum + (a.score / a.totalQuestions * 100), 0) / totalAssessments
    );
    
    const uniqueStudents = new Set(assessments.map(a => a.studentName)).size;
    
    // Count assessments by subject
    const subjects: { [key: string]: number } = {};
    assessments.forEach(a => {
      subjects[a.subject] = (subjects[a.subject] || 0) + 1;
    });

    // Calculate trend (compare recent vs older assessments)
    let recentTrend: 'up' | 'down' | 'stable' = 'stable';
    let trendPercentage = 0;
    
    if (assessments.length >= 2) {
      const recent = assessments.slice(0, Math.ceil(assessments.length / 2));
      const older = assessments.slice(Math.ceil(assessments.length / 2));
      
      const recentAvg = recent.reduce((sum, a) => sum + (a.score / a.totalQuestions * 100), 0) / recent.length;
      const olderAvg = older.reduce((sum, a) => sum + (a.score / a.totalQuestions * 100), 0) / older.length;
      
      trendPercentage = Math.round(recentAvg - olderAvg);
      
      if (trendPercentage > 5) recentTrend = 'up';
      else if (trendPercentage < -5) recentTrend = 'down';
      else recentTrend = 'stable';
    }

    setStats({
      totalAssessments,
      averageScore,
      totalStudents: uniqueStudents,
      subjects,
      recentTrend,
      trendPercentage
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 animate-pulse" />
              <p>Loading performance data...</p>
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
            <BarChart3 className="mr-2 h-5 w-5" />
            Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium">No assessment data yet</p>
              <p className="text-sm">Add student assessments to see performance analytics</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Assessments</p>
                <p className="text-2xl font-bold text-brand-blue">{stats.totalAssessments}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-brand-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Average Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
                  {stats.averageScore}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Students</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Performance Trend</p>
                <div className="flex items-center">
                  {stats.recentTrend === 'up' && <TrendingUp className="h-5 w-5 text-green-600 mr-1" />}
                  {stats.recentTrend === 'down' && <TrendingDown className="h-5 w-5 text-red-600 mr-1" />}
                  {stats.recentTrend === 'stable' && <Activity className="h-5 w-5 text-gray-600 mr-1" />}
                  <span className={`text-lg font-bold ${
                    stats.recentTrend === 'up' ? 'text-green-600' :
                    stats.recentTrend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stats.trendPercentage > 0 ? '+' : ''}{stats.trendPercentage}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="mr-2 h-5 w-5" />
            Assessments by Subject
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.subjects).map(([subject, count]) => {
              const percentage = Math.round((count / stats.totalAssessments) * 100);
              return (
                <div key={subject} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-brand-blue rounded-full"></div>
                    <span className="font-medium">{subject}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-brand-blue h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-slate-600 w-12 text-right">
                      {count} ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Assessments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Recent Assessment Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assessmentData.slice(0, 5).map((assessment) => {
              const percentage = Math.round((assessment.score / assessment.totalQuestions) * 100);
              return (
                <div key={assessment.id} className={`p-3 rounded-lg border ${getScoreBgColor(percentage)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{assessment.studentName}</h4>
                      <p className="text-sm text-slate-600">{assessment.subject} • {assessment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${getScoreColor(percentage)}`}>
                        {percentage}%
                      </p>
                      <p className="text-sm text-slate-600">
                        {assessment.score}/{assessment.totalQuestions}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
