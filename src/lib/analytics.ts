// Comprehensive PostHog event tracking utilities
import { trackEvent, identifyUser, setUserProperties } from '@/lib/posthog'

// Student-specific events
export const trackStudentEvents = {
  // Learning events
  learningStarted: (topic: string, subject?: string) => {
    trackEvent('student_learning_started', {
      topic,
      subject,
      timestamp: new Date().toISOString()
    })
  },

  learningCompleted: (topic: string, timeSpent: number, score?: number) => {
    trackEvent('student_learning_completed', {
      topic,
      time_spent_seconds: timeSpent,
      score,
      timestamp: new Date().toISOString()
    })
  },

  // Quiz events
  quizStarted: (topic: string, questionCount: number) => {
    trackEvent('student_quiz_started', {
      topic,
      question_count: questionCount,
      timestamp: new Date().toISOString()
    })
  },

  quizCompleted: (topic: string, score: number, timeSpent: number) => {
    trackEvent('student_quiz_completed', {
      topic,
      score,
      time_spent_seconds: timeSpent,
      timestamp: new Date().toISOString()
    })
  },

  questionAnswered: (topic: string, questionIndex: number, isCorrect: boolean, timeSpent: number) => {
    trackEvent('student_question_answered', {
      topic,
      question_index: questionIndex,
      is_correct: isCorrect,
      time_spent_seconds: timeSpent,
      timestamp: new Date().toISOString()
    })
  },

  // AI Tutor events
  aiTutorMessageSent: (message: string, conversationLength: number) => {
    trackEvent('student_ai_tutor_message_sent', {
      message_length: message.length,
      conversation_length: conversationLength,
      timestamp: new Date().toISOString()
    })
  },

  aiTutorResponseReceived: (responseLength: number, responseTime: number) => {
    trackEvent('student_ai_tutor_response_received', {
      response_length: responseLength,
      response_time_ms: responseTime,
      timestamp: new Date().toISOString()
    })
  },

  // Snap & Solve events
  imageUploaded: (fileSize: number, fileType: string) => {
    trackEvent('student_image_uploaded', {
      file_size_bytes: fileSize,
      file_type: fileType,
      timestamp: new Date().toISOString()
    })
  },

  problemSolved: (problemType: string, solutionMethod: string, timeSpent: number) => {
    trackEvent('student_problem_solved', {
      problem_type: problemType,
      solution_method: solutionMethod,
      time_spent_seconds: timeSpent,
      timestamp: new Date().toISOString()
    })
  },

  // Essay Helper events
  essayStarted: (topic: string, essayType: string) => {
    trackEvent('student_essay_started', {
      topic,
      essay_type: essayType,
      timestamp: new Date().toISOString()
    })
  },

  essayCompleted: (topic: string, wordCount: number, timeSpent: number) => {
    trackEvent('student_essay_completed', {
      topic,
      word_count: wordCount,
      time_spent_seconds: timeSpent,
      timestamp: new Date().toISOString()
    })
  },

  // Notes & Study events
  noteCreated: (subject: string, noteLength: number) => {
    trackEvent('student_note_created', {
      subject,
      note_length: noteLength,
      timestamp: new Date().toISOString()
    })
  },

  flashcardReviewed: (subject: string, isCorrect: boolean, difficulty: string) => {
    trackEvent('student_flashcard_reviewed', {
      subject,
      is_correct: isCorrect,
      difficulty,
      timestamp: new Date().toISOString()
    })
  },

  // Progress events
  achievementUnlocked: (achievementType: string, achievementName: string) => {
    trackEvent('student_achievement_unlocked', {
      achievement_type: achievementType,
      achievement_name: achievementName,
      timestamp: new Date().toISOString()
    })
  },

  streakUpdated: (streakDays: number, streakType: string) => {
    trackEvent('student_streak_updated', {
      streak_days: streakDays,
      streak_type: streakType,
      timestamp: new Date().toISOString()
    })
  }
}

// Teacher-specific events
export const trackTeacherEvents = {
  // Lesson Planning events
  lessonPlanStarted: (subject: string, grade: string, topic: string) => {
    trackEvent('teacher_lesson_plan_started', {
      subject,
      grade,
      topic,
      timestamp: new Date().toISOString()
    })
  },

  lessonPlanCompleted: (subject: string, grade: string, topic: string, timeSpent: number) => {
    trackEvent('teacher_lesson_plan_completed', {
      subject,
      grade,
      topic,
      time_spent_seconds: timeSpent,
      timestamp: new Date().toISOString()
    })
  },

  // Assessment events
  assessmentCreated: (subject: string, questionCount: number, assessmentType: string) => {
    trackEvent('teacher_assessment_created', {
      subject,
      question_count: questionCount,
      assessment_type: assessmentType,
      timestamp: new Date().toISOString()
    })
  },

  assessmentAssigned: (assessmentId: string, studentCount: number, dueDate: string) => {
    trackEvent('teacher_assessment_assigned', {
      assessment_id: assessmentId,
      student_count: studentCount,
      due_date: dueDate,
      timestamp: new Date().toISOString()
    })
  },

  // AI Co-Teacher events
  aiCoTeacherQuery: (query: string, contextType: string) => {
    trackEvent('teacher_ai_co_teacher_query', {
      query_length: query.length,
      context_type: contextType,
      timestamp: new Date().toISOString()
    })
  },

  aiCoTeacherResponseUsed: (responseType: string, satisfaction: number) => {
    trackEvent('teacher_ai_co_teacher_response_used', {
      response_type: responseType,
      satisfaction_rating: satisfaction,
      timestamp: new Date().toISOString()
    })
  },

  // Analytics events
  analyticsViewed: (analyticsType: string, timeRange: string) => {
    trackEvent('teacher_analytics_viewed', {
      analytics_type: analyticsType,
      time_range: timeRange,
      timestamp: new Date().toISOString()
    })
  },

  studentProgressReviewed: (studentId: string, subject: string, performance: string) => {
    trackEvent('teacher_student_progress_reviewed', {
      student_id: studentId,
      subject,
      performance_level: performance,
      timestamp: new Date().toISOString()
    })
  },

  // Content Creation events
  contentCreated: (contentType: string, subject: string, contentLength: number) => {
    trackEvent('teacher_content_created', {
      content_type: contentType,
      subject,
      content_length: contentLength,
      timestamp: new Date().toISOString()
    })
  },

  resourceShared: (resourceType: string, recipientCount: number) => {
    trackEvent('teacher_resource_shared', {
      resource_type: resourceType,
      recipient_count: recipientCount,
      timestamp: new Date().toISOString()
    })
  }
}

// Social/Community events
export const trackSocialEvents = {
  postCreated: (postLength: number, circleId: string, hasMedia: boolean) => {
    trackEvent('social_post_created', {
      post_length: postLength,
      circle_id: circleId,
      has_media: hasMedia,
      timestamp: new Date().toISOString()
    })
  },

  postLiked: (postId: string, authorId: string) => {
    trackEvent('social_post_liked', {
      post_id: postId,
      author_id: authorId,
      timestamp: new Date().toISOString()
    })
  },

  commentAdded: (postId: string, commentLength: number) => {
    trackEvent('social_comment_added', {
      post_id: postId,
      comment_length: commentLength,
      timestamp: new Date().toISOString()
    })
  },

  circleJoined: (circleId: string, circleName: string) => {
    trackEvent('social_circle_joined', {
      circle_id: circleId,
      circle_name: circleName,
      timestamp: new Date().toISOString()
    })
  }
}

// System/Performance events
export const trackSystemEvents = {
  pageLoadTime: (pageName: string, loadTime: number, userAgent: string) => {
    trackEvent('system_page_load_time', {
      page_name: pageName,
      load_time_ms: loadTime,
      user_agent: userAgent,
      timestamp: new Date().toISOString()
    })
  },

  apiResponseTime: (endpoint: string, responseTime: number, statusCode: number) => {
    trackEvent('system_api_response_time', {
      endpoint,
      response_time_ms: responseTime,
      status_code: statusCode,
      timestamp: new Date().toISOString()
    })
  },

  errorOccurred: (errorType: string, errorMessage: string, pageName: string) => {
    trackEvent('system_error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      page_name: pageName,
      timestamp: new Date().toISOString()
    })
  },

  featureUsed: (featureName: string, userRole: string, context?: string) => {
    trackEvent('system_feature_used', {
      feature_name: featureName,
      user_role: userRole,
      context,
      timestamp: new Date().toISOString()
    })
  }
}

// User identification and properties
export const trackUserProperties = {
  identifyStudent: (userId: string, properties: {
    grade?: string,
    subjects?: string[],
    school?: string,
    joinDate?: string
  }) => {
    identifyUser(userId, {
      role: 'student',
      ...properties,
      last_updated: new Date().toISOString()
    })
  },

  identifyTeacher: (userId: string, properties: {
    subjects?: string[],
    grades?: string[],
    school?: string,
    experience?: string,
    joinDate?: string
  }) => {
    identifyUser(userId, {
      role: 'teacher',
      ...properties,
      last_updated: new Date().toISOString()
    })
  },

  updateUserActivity: (userId: string, activity: string, metadata?: Record<string, any>) => {
    setUserProperties({
      last_activity: activity,
      last_activity_timestamp: new Date().toISOString(),
      ...metadata
    })
  }
}
