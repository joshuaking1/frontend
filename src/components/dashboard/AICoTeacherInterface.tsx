// frontend/src/components/dashboard/AICoTeacherInterface.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Bot, 
  User, 
  Search, 
  Youtube, 
  Image, 
  BookOpen,
  Lightbulb,
  Sparkles,
  MessageSquare,
  FileText,
  Target,
  Clock,
  Users,
  Brain,
  Presentation,
  Download,
  Plus,
  Trash2,
  Edit3
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  resources?: Resource[];
}

interface Resource {
  type: 'youtube' | 'image' | 'curriculum' | 'article';
  title: string;
  description: string;
  url?: string;
  thumbnail?: string;
}

interface LessonPlan {
  topic: string;
  objectives: string[];
  activities: string[];
  resources: string[];
  assessment: string[];
}

interface Slide {
  id: string;
  title: string;
  content: string;
  bulletPoints?: string[];
  slideType: 'title' | 'content' | 'activity' | 'assessment' | 'summary' | 'image' | 'video';
  order: number;
  backgroundColor?: string;
  textColor?: string;
  imageUrl?: string;
  videoUrl?: string;
  layout?: string;
}

interface SlidePresentation {
  id: string;
  title: string;
  slides: Slide[];
  createdAt: Date;
  powerpointFile?: string;
  fileName?: string;
}

export const AICoTeacherInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLesson, setCurrentLesson] = useState('');
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [searchResults, setSearchResults] = useState<Resource[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Slide generation state
  const [slideFormData, setSlideFormData] = useState({
    lessonTitle: '',
    subject: '',
    gradeLevel: '',
    duration: '',
    objectives: '',
    keyPoints: '',
    activities: '',
    assessment: ''
  });
  const [generatedSlides, setGeneratedSlides] = useState<SlidePresentation | null>(null);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'slides'>('chat');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send message to AI co-teacher API
      const response = await fetch('/api/teacher/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: inputMessage,
          lessonTopic: currentLesson,
          conversationHistory: messages.slice(-5) // Last 5 messages for context
        })
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date(),
        suggestions: data.suggestions || [],
        resources: data.resources || []
      };

      setMessages(prev => [...prev, aiMessage]);

      // If this is a lesson topic, generate a lesson plan
      if (data.lessonPlan) {
        setLessonPlan(data.lessonPlan);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLessonInput = async (topic: string) => {
    if (!topic.trim()) return;

    setCurrentLesson(topic);
    setIsLoading(true);

    try {
      // Generate initial lesson plan and suggestions
      const response = await fetch('/api/teacher/coach/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      const data = await response.json();
      
      if (data.lessonPlan) {
        setLessonPlan(data.lessonPlan);
      }

      // Add welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: `Great! I'm excited to help you plan your lesson on "${topic}". I've prepared some initial suggestions and resources. What specific aspects would you like to focus on?`,
        timestamp: new Date(),
        suggestions: [
          "How can I make this lesson more engaging?",
          "What activities would work best for this topic?",
          "How can I assess student understanding?",
          "What resources do you recommend?"
        ],
        resources: data.resources || []
      };

      setMessages([welcomeMessage]);

    } catch (error) {
      console.error('Error generating lesson plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleResourceSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch('/api/teacher/coach/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error searching resources:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerateSlides = async () => {
    if (!slideFormData.lessonTitle || !slideFormData.subject) {
      alert('Please fill in at least the lesson title and subject');
      return;
    }

    setIsGeneratingSlides(true);
    try {
      const response = await fetch('/api/teacher/coach/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slideFormData)
      });

      const data = await response.json();
      
      if (data.slides) {
        setGeneratedSlides({
          id: Date.now().toString(),
          title: slideFormData.lessonTitle,
          slides: data.slides,
          createdAt: new Date(),
          powerpointFile: data.powerpointFile,
          fileName: data.fileName
        });
      }
    } catch (error) {
      console.error('Error generating slides:', error);
      alert('Failed to generate slides. Please try again.');
    } finally {
      setIsGeneratingSlides(false);
    }
  };

  const handleExportSlides = () => {
    if (!generatedSlides) return;

    // Download PowerPoint file if available
    if (generatedSlides.powerpointFile) {
      const byteCharacters = atob(generatedSlides.powerpointFile);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generatedSlides.fileName || `${generatedSlides.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Fallback to JSON export
      const exportData = {
        presentation: generatedSlides,
        exportDate: new Date().toISOString(),
        format: 'json'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedSlides.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_slides.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleVideoSearch = async (topic: string) => {
    setIsSearching(true);
    try {
      const response = await fetch('/api/teacher/coach/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      const data = await response.json();
      
      if (data.videos && data.videos.length > 0) {
        // Add video results to search results
        const videoResources = data.videos.map((video: any) => ({
          type: 'youtube',
          title: video.title,
          description: video.description,
          url: video.url,
          thumbnail: video.thumbnail
        }));
        
        setSearchResults(videoResources);
        
        // Also add a message to the chat showing the videos found
        const videoMessage: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: `I found ${data.videos.length} educational videos for "${topic}":`,
          timestamp: new Date(),
          resources: videoResources
        };
        
        setMessages(prev => [...prev, videoMessage]);
      } else {
        // Add message if no videos found
        const noVideosMessage: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: `I couldn't find specific videos for "${topic}" at the moment. Try searching for a more general topic or check the resource search panel.`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, noVideosMessage]);
      }
    } catch (error) {
      console.error('Error searching videos:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error while searching for videos. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSearching(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'youtube': return <Youtube className="h-4 w-4 text-red-500" />;
      case 'image': return <Image className="h-4 w-4 text-green-500" />;
      case 'curriculum': return <BookOpen className="h-4 w-4 text-purple-500" />;
      case 'article': return <FileText className="h-4 w-4 text-blue-500" />;
      default: return <Search className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Interface Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'chat'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="h-4 w-4 mr-2 inline" />
          AI Chat Assistant
        </button>
        <button
          onClick={() => setActiveTab('slides')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'slides'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Presentation className="h-4 w-4 mr-2 inline" />
          Generate Slides
        </button>
      </div>

      {/* Chat Tab Content */}
      {activeTab === 'chat' && (
        <>
          {/* Lesson Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                AI Co-Teacher Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    What lesson are you planning to teach?
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={currentLesson}
                      onChange={(e) => setCurrentLesson(e.target.value)}
                      placeholder="e.g., Introduction to Fractions, Photosynthesis, World War II..."
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleLessonInput(currentLesson)}
                    />
                    <Button 
                      onClick={() => handleLessonInput(currentLesson)}
                      disabled={isLoading || !currentLesson.trim()}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Start Planning
                    </Button>
                  </div>
                </div>
                
                {lessonPlan && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Generated Lesson Plan</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium text-blue-700 mb-1">Learning Objectives:</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {lessonPlan.objectives.map((obj, idx) => (
                            <li key={idx}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-blue-700 mb-1">Activities:</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {lessonPlan.activities.map((activity, idx) => (
                            <li key={idx}>{activity}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Slides Tab Content */}
      {activeTab === 'slides' && (
        <div className="space-y-6">
          {/* Slide Generation Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Presentation className="mr-2 h-5 w-5" />
                Generate Teaching Slides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Lesson Title *
                  </label>
                  <Input
                    value={slideFormData.lessonTitle}
                    onChange={(e) => setSlideFormData(prev => ({ ...prev, lessonTitle: e.target.value }))}
                    placeholder="e.g., Introduction to Fractions"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Subject *
                  </label>
                  <Input
                    value={slideFormData.subject}
                    onChange={(e) => setSlideFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g., Mathematics"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Grade Level
                  </label>
                  <Input
                    value={slideFormData.gradeLevel}
                    onChange={(e) => setSlideFormData(prev => ({ ...prev, gradeLevel: e.target.value }))}
                    placeholder="e.g., Grade 5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Duration
                  </label>
                  <Input
                    value={slideFormData.duration}
                    onChange={(e) => setSlideFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 45 minutes"
                  />
                </div>
              </div>
              
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Learning Objectives
                  </label>
                  <textarea
                    value={slideFormData.objectives}
                    onChange={(e) => setSlideFormData(prev => ({ ...prev, objectives: e.target.value }))}
                    placeholder="List the main learning objectives for this lesson..."
                    className="w-full p-3 border border-slate-300 rounded-md resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Key Points to Cover
                  </label>
                  <textarea
                    value={slideFormData.keyPoints}
                    onChange={(e) => setSlideFormData(prev => ({ ...prev, keyPoints: e.target.value }))}
                    placeholder="What are the main concepts students need to understand?"
                    className="w-full p-3 border border-slate-300 rounded-md resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Activities & Exercises
                  </label>
                  <textarea
                    value={slideFormData.activities}
                    onChange={(e) => setSlideFormData(prev => ({ ...prev, activities: e.target.value }))}
                    placeholder="What activities will students do during the lesson?"
                    className="w-full p-3 border border-slate-300 rounded-md resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Assessment Methods
                  </label>
                  <textarea
                    value={slideFormData.assessment}
                    onChange={(e) => setSlideFormData(prev => ({ ...prev, assessment: e.target.value }))}
                    placeholder="How will you assess student understanding?"
                    className="w-full p-3 border border-slate-300 rounded-md resize-none"
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <Button 
                  onClick={handleGenerateSlides}
                  disabled={isGeneratingSlides || !slideFormData.lessonTitle || !slideFormData.subject}
                  className="w-full"
                >
                  {isGeneratingSlides ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Slides...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Slides
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Slides Display */}
          {generatedSlides && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Presentation className="mr-2 h-5 w-5" />
                    Generated Slides: {generatedSlides.title}
                  </CardTitle>
                  <Button onClick={handleExportSlides} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Slides
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generatedSlides.slides.map((slide, index) => (
                    <div key={slide.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-800">
                          Slide {index + 1}: {slide.title}
                        </h4>
                        <Badge variant="secondary">
                          {slide.slideType}
                        </Badge>
                      </div>
                      
                      {/* Slide Content */}
                      <div className="text-slate-700">
                        {slide.content && (
                          <div className="mb-3 whitespace-pre-wrap">
                            {slide.content}
                          </div>
                        )}
                        
                        {/* Bullet Points */}
                        {slide.bulletPoints && slide.bulletPoints.length > 0 && (
                          <ul className="list-disc list-inside space-y-1 mb-3">
                            {slide.bulletPoints.map((point, idx) => (
                              <li key={idx}>{point}</li>
                            ))}
                          </ul>
                        )}
                        
                        {/* Image */}
                        {slide.imageUrl && (
                          <div className="mb-3">
                            <img 
                              src={slide.imageUrl} 
                              alt={slide.title}
                              className="max-w-full h-auto rounded-lg border border-slate-300"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        {/* Video */}
                        {slide.videoUrl && (
                          <div className="mb-3">
                            <div className="bg-slate-100 border border-slate-300 rounded-lg p-4 text-center">
                              <p className="text-slate-600 mb-2">Video Content:</p>
                              <a 
                                href={slide.videoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                {slide.videoUrl}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Chat Interface */}
      {activeTab === 'chat' && (
        <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat Messages */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Conversation with AI Co-Teacher
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Bot className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-lg font-medium">Start a conversation</p>
                      <p className="text-sm">Ask me about lesson planning, teaching strategies, or educational resources!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                          <div className={`flex items-start space-x-2 ${
                            message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                          }`}>
                            <div className={`p-2 rounded-full ${
                              message.type === 'user' 
                                ? 'bg-brand-blue text-white' 
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {message.type === 'user' ? (
                                <User className="h-4 w-4" />
                              ) : (
                                <Bot className="h-4 w-4" />
                              )}
                            </div>
                            <div className={`p-3 rounded-lg ${
                              message.type === 'user'
                                ? 'bg-brand-blue text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          
                          {/* Suggestions */}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-2 ml-8">
                              <p className="text-xs text-slate-600 mb-1">Quick suggestions:</p>
                              <div className="flex flex-wrap gap-1">
                                {message.suggestions.map((suggestion, idx) => (
                                  <Button
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-6"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                  >
                                    {suggestion}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Resources */}
                          {message.resources && message.resources.length > 0 && (
                            <div className="mt-2 ml-8">
                              <p className="text-xs text-slate-600 mb-1">Related resources:</p>
                              <div className="space-y-2">
                                {message.resources.slice(0, 3).map((resource, idx) => (
                                  <div key={idx} className="flex items-start space-x-2 text-xs p-2 bg-slate-50 rounded">
                                    {resource.type === 'youtube' && resource.thumbnail ? (
                                      <img 
                                        src={resource.thumbnail} 
                                        alt={resource.title}
                                        className="w-12 h-8 object-cover rounded"
                                      />
                                    ) : (
                                      getResourceIcon(resource.type)
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate">{resource.title}</p>
                                      {resource.url && (
                                        <a 
                                          href={resource.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800"
                                        >
                                          {resource.type === 'youtube' ? 'Watch Video' : 'View Resource'}
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-2">
                        <div className="p-2 rounded-full bg-slate-100">
                          <Bot className="h-4 w-4 text-slate-700" />
                        </div>
                        <div className="p-3 rounded-lg bg-slate-100">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {/* Message Input */}
              <div className="mt-4 flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask your AI co-teacher anything..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resource Search Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-5 w-5" />
                Resource Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for resources..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleResourceSearch((e.target as HTMLInputElement).value);
                      }
                    }}
                  />
                  <Button 
                    size="sm"
                    onClick={() => handleResourceSearch('educational videos')}
                    disabled={isSearching}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Search Results:</p>
                    {searchResults.slice(0, 5).map((resource, idx) => (
                      <div key={idx} className="p-2 border rounded-lg hover:bg-slate-50 cursor-pointer">
                        <div className="flex items-start space-x-2">
                          {resource.type === 'youtube' && resource.thumbnail ? (
                            <img 
                              src={resource.thumbnail} 
                              alt={resource.title}
                              className="w-16 h-12 object-cover rounded"
                            />
                          ) : (
                            getResourceIcon(resource.type)
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{resource.title}</p>
                            <p className="text-xs text-slate-600 line-clamp-2">{resource.description}</p>
                            {resource.url && (
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {resource.type === 'youtube' ? 'Watch Video' : 'View Resource'}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="mr-2 h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => handleSuggestionClick("How can I make this lesson more engaging?")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Engagement Ideas
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => handleSuggestionClick("What assessment strategies work best?")}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Assessment Ideas
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => handleVideoSearch(currentLesson || "educational content")}
                  disabled={isSearching}
                >
                  <Youtube className="h-4 w-4 mr-2" />
                  Find Videos
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => handleSuggestionClick("What activities would work best?")}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Activity Ideas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      )}
    </div>
  );
};
