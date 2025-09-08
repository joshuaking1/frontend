// frontend/src/components/dashboard/ProactiveAICoach.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceAnalytics } from "./PerformanceAnalytics";
import { LearningGapsAnalytics } from "./LearningGapsAnalytics";
import { AICoTeacherInterface } from "./AICoTeacherInterface";
import { 
  Brain, 
  Search, 
  Youtube, 
  Image, 
  BarChart3, 
  AlertTriangle, 
  Lightbulb,
  Target,
  TrendingUp,
  Users,
  BookOpen,
  Zap,
  Eye,
  MessageSquare,
  FileText,
  Calendar,
  Clock
} from "lucide-react";
import { trackEvent } from '@/lib/posthog';

interface StudentAssessment {
  id: string;
  studentName: string;
  subject: string;
  score: number;
  totalQuestions: number;
  date: string;
  topics: string[];
  strengths: string[];
  weaknesses: string[];
}

interface ProactiveInsight {
  type: 'warning' | 'success' | 'info' | 'critical';
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  category?: 'performance' | 'curriculum' | 'engagement' | 'resources' | 'trends';
  confidence?: number;
  affectedStudents?: string[];
  suggestedResources?: string[];
  timeline?: string;
}

interface SearchResult {
  type: 'youtube' | 'google' | 'image' | 'curriculum';
  title: string;
  description: string;
  url?: string;
  thumbnail?: string;
  source: string;
}

export const ProactiveAICoach = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [insights, setInsights] = useState<ProactiveInsight[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<StudentAssessment[]>([]);
  const [stats, setStats] = useState({
    activeStudents: 0,
    avgPerformance: 0,
    assessmentsToday: 0,
    aiSuggestions: 0
  });
  const [assessmentRecommendations, setAssessmentRecommendations] = useState<{[key: string]: any}>({});
  const [loadingRecommendations, setLoadingRecommendations] = useState<{[key: string]: boolean}>({});

  // Fetch real data from APIs
  useEffect(() => {
    fetchInsights();
    fetchRecentAssessments();
    fetchStats();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/teacher/coach/insights');
      const data = await response.json();
      if (data.insights) {
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  const fetchRecentAssessments = async () => {
    try {
      const response = await fetch('/api/teacher/coach/assessments/recent');
      const data = await response.json();
      if (data.assessments) {
        setRecentAssessments(data.assessments);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/teacher/coach/stats');
      const data = await response.json();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    // Track search attempt
    trackEvent('teacher_search_attempted', {
      query: searchQuery,
      timestamp: new Date().toISOString()
    });
    
    setIsSearching(true);
    try {
      // This would call the multi-modal search API
      const response = await fetch('/api/teacher/coach/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      
      const results = await response.json();
      setSearchResults(results);
      
      // Track successful search
      trackEvent('teacher_search_successful', {
        query: searchQuery,
        results_count: results?.length || 0,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Search error:', error);
      
      // Track search error
      trackEvent('teacher_search_failed', {
        query: searchQuery,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'success': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'info': return <Lightbulb className="h-5 w-5 text-blue-500" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Brain className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateStatsWithNewAssessment = (assessment: StudentAssessment) => {
    setStats(prev => ({
      ...prev,
      activeStudents: Math.max(prev.activeStudents, 1),
      avgPerformance: Math.round(((prev.avgPerformance * prev.assessmentsToday) + (assessment.score / assessment.totalQuestions * 100)) / (prev.assessmentsToday + 1)),
      assessmentsToday: prev.assessmentsToday + 1,
      aiSuggestions: prev.aiSuggestions + 1
    }));
  };

  const generateInsightsFromAssessment = async (assessment: StudentAssessment) => {
    try {
      const response = await fetch('/api/teacher/coach/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assessmentData: [assessment],
          curriculumData: []
        })
      });
      
      const data = await response.json();
      if (data.insights && data.insights.length > 0) {
        setInsights(prev => [...data.insights, ...prev]);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  const generateRecommendationsForAssessment = async (assessment: StudentAssessment) => {
    const assessmentId = assessment.id;
    
    // Set loading state
    setLoadingRecommendations(prev => ({ ...prev, [assessmentId]: true }));
    
    try {
      const response = await fetch('/api/teacher/coach/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assessmentData: assessment,
          action: 'generate_recommendations'
        })
      });
      
      const data = await response.json();
      if (data.recommendations) {
        setAssessmentRecommendations(prev => ({ 
          ...prev, 
          [assessmentId]: data.recommendations 
        }));
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Set error state
      setAssessmentRecommendations(prev => ({ 
        ...prev, 
        [assessmentId]: { error: 'Failed to generate recommendations' }
      }));
    } finally {
      // Clear loading state
      setLoadingRecommendations(prev => ({ ...prev, [assessmentId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-blue flex items-center">
            <Brain className="mr-3 h-8 w-8" />
            Proactive AI Coach
          </h1>
          <p className="text-slate-600 mt-2">
            Your intelligent teaching assistant with real-time insights and multi-modal search
          </p>
        </div>
        <Badge className="bg-green-100 text-green-800 px-3 py-1">
          <Zap className="h-4 w-4 mr-1" />
          Active
        </Badge>
      </div>

      {/* Multi-Modal Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5" />
            Multi-Modal Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search YouTube, Google, Images, or Curriculum..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((result, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {result.type === 'youtube' && <Youtube className="h-5 w-5 text-red-500 mt-1" />}
                      {result.type === 'google' && <Search className="h-5 w-5 text-blue-500 mt-1" />}
                      {result.type === 'image' && <Image className="h-5 w-5 text-green-500 mt-1" />}
                      {result.type === 'curriculum' && <BookOpen className="h-5 w-5 text-purple-500 mt-1" />}
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm line-clamp-2">{result.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{result.description}</p>
                        <p className="text-xs text-slate-500 mt-1">{result.source}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="tools">AI Tools</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Proactive Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="mr-2 h-5 w-5" />
                Proactive Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <Badge className={getPriorityColor(insight.priority)}>
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{insight.description}</p>
                      <p className="text-sm text-brand-blue mt-2 font-medium">{insight.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Active Students</p>
                    <p className="text-2xl font-bold text-brand-blue">{stats.activeStudents}</p>
                  </div>
                  <Users className="h-8 w-8 text-brand-blue" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Avg. Performance</p>
                    <p className="text-2xl font-bold text-green-600">{stats.avgPerformance}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Assessments Today</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.assessmentsToday}</p>
                  </div>
                  <FileText className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">AI Suggestions</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.aiSuggestions}</p>
                  </div>
                  <Lightbulb className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-6">
          {/* Manual Assessment Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Input Student Assessment Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AssessmentInputForm 
                onAssessmentAdded={(assessment) => {
                  setRecentAssessments(prev => [assessment, ...prev]);
                  // Update stats
                  updateStatsWithNewAssessment(assessment);
                  // Generate insights
                  generateInsightsFromAssessment(assessment);
                }}
              />
            </CardContent>
          </Card>

          {/* Assessment Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Student Assessment Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAssessments.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">No assessments yet</p>
                    <p className="text-sm">Add student assessment data above to get AI insights</p>
                  </div>
                ) : (
                  recentAssessments.map((assessment) => (
                    <div key={assessment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{assessment.studentName}</h4>
                          <p className="text-sm text-slate-600">{assessment.subject} • {assessment.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-brand-blue">
                            {Math.round((assessment.score / assessment.totalQuestions) * 100)}%
                          </p>
                          <p className="text-sm text-slate-600">
                            {assessment.score}/{assessment.totalQuestions}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-green-700 mb-2">Strengths</h5>
                          <div className="flex flex-wrap gap-1">
                            {assessment.strengths.map((strength, idx) => (
                              <Badge key={idx} variant="outline" className="text-green-700 border-green-200">
                                {strength}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-red-700 mb-2">Areas for Improvement</h5>
                          <div className="flex flex-wrap gap-1">
                            {assessment.weaknesses.map((weakness, idx) => (
                              <Badge key={idx} variant="outline" className="text-red-700 border-red-200">
                                {weakness}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => generateRecommendationsForAssessment(assessment)}
                          disabled={loadingRecommendations[assessment.id]}
                        >
                          <Lightbulb className="h-4 w-4 mr-2" />
                          {loadingRecommendations[assessment.id] ? 'Generating...' : 'Get AI Recommendations'}
                        </Button>
                        
                        {/* Show recommendations if available */}
                        {assessmentRecommendations[assessment.id] && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h6 className="font-semibold text-blue-800 mb-2 flex items-center">
                              <Lightbulb className="h-4 w-4 mr-2" />
                              AI Recommendations
                            </h6>
                            {assessmentRecommendations[assessment.id].error ? (
                              <p className="text-red-600 text-sm">{assessmentRecommendations[assessment.id].error}</p>
                            ) : (
                              <div className="space-y-2">
                                {assessmentRecommendations[assessment.id].recommendations?.map((rec: any, idx: number) => (
                                  <div key={idx} className="text-sm text-blue-700">
                                    <span className="font-medium">{rec.category}:</span> {rec.suggestion}
                                  </div>
                                ))}
                                {assessmentRecommendations[assessment.id].nextSteps && (
                                  <div className="mt-3 pt-2 border-t border-blue-200">
                                    <p className="text-sm font-medium text-blue-800 mb-1">Next Steps:</p>
                                    <ul className="text-sm text-blue-700 list-disc list-inside">
                                      {assessmentRecommendations[assessment.id].nextSteps.map((step: string, idx: number) => (
                                        <li key={idx}>{step}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          {/* All Insights Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="mr-2 h-5 w-5" />
                AI-Generated Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Eye className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">No insights yet</p>
                    <p className="text-sm">Submit assessments to get AI insights</p>
                  </div>
                ) : (
                  insights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <Badge className={getPriorityColor(insight.priority)}>
                            {insight.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{insight.description}</p>
                        <p className="text-sm text-brand-blue mt-2 font-medium">{insight.action}</p>
                        {insight.timeline && (
                          <p className="text-xs text-slate-500 mt-1">Timeline: {insight.timeline}</p>
                        )}
                        {insight.suggestedResources && insight.suggestedResources.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-slate-600 mb-1">Suggested Resources:</p>
                            <div className="flex flex-wrap gap-1">
                              {insight.suggestedResources.map((resource, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {resource}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <PerformanceAnalytics />
            </div>
            
            <LearningGapsAnalytics />
          </div>
        </TabsContent>

        {/* AI Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          <AICoTeacherInterface />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Assessment Input Form Component
const AssessmentInputForm = ({ onAssessmentAdded }: { onAssessmentAdded: (assessment: StudentAssessment) => void }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    subject: '',
    score: '',
    totalQuestions: '',
    strengths: '',
    weaknesses: '',
    topics: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName || !formData.subject || !formData.score || !formData.totalQuestions) {
      return;
    }

    setIsSubmitting(true);
    
    const assessment: StudentAssessment = {
      id: Date.now().toString(),
      studentName: formData.studentName,
      subject: formData.subject,
      score: parseInt(formData.score),
      totalQuestions: parseInt(formData.totalQuestions),
      date: new Date().toISOString().split('T')[0],
      topics: formData.topics.split(',').map(t => t.trim()).filter(t => t),
      strengths: formData.strengths.split(',').map(s => s.trim()).filter(s => s),
      weaknesses: formData.weaknesses.split(',').map(w => w.trim()).filter(w => w)
    };

    try {
      // Save assessment to database via API
      const response = await fetch('/api/teacher/coach/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assessmentData: assessment,
          action: 'save_assessment'
        })
      });

      if (response.ok) {
        onAssessmentAdded(assessment);
        
        // Reset form
        setFormData({
          studentName: '',
          subject: '',
          score: '',
          totalQuestions: '',
          strengths: '',
          weaknesses: '',
          topics: ''
        });
      } else {
        console.error('Failed to save assessment');
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Student Name</label>
          <Input
            value={formData.studentName}
            onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
            placeholder="Enter student name"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
          <Input
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="e.g., Mathematics, Science"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Score</label>
          <Input
            type="number"
            value={formData.score}
            onChange={(e) => setFormData(prev => ({ ...prev, score: e.target.value }))}
            placeholder="Correct answers"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Total Questions</label>
          <Input
            type="number"
            value={formData.totalQuestions}
            onChange={(e) => setFormData(prev => ({ ...prev, totalQuestions: e.target.value }))}
            placeholder="Total questions"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Topics Covered</label>
        <Input
          value={formData.topics}
          onChange={(e) => setFormData(prev => ({ ...prev, topics: e.target.value }))}
          placeholder="Comma-separated topics (e.g., Algebra, Geometry)"
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Strengths</label>
          <Input
            value={formData.strengths}
            onChange={(e) => setFormData(prev => ({ ...prev, strengths: e.target.value }))}
            placeholder="Comma-separated strengths"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Areas for Improvement</label>
          <Input
            value={formData.weaknesses}
            onChange={(e) => setFormData(prev => ({ ...prev, weaknesses: e.target.value }))}
            placeholder="Comma-separated weaknesses"
          />
        </div>
      </div>
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Adding Assessment...' : 'Add Assessment & Generate Insights'}
      </Button>
    </form>
  );
};
