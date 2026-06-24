export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: string;
}

export interface Interview {
  id: string;
  userId: string;
  domain: string;
  domainLabel: string;
  domainIcon: string;
  difficulty: 'entry' | 'mid' | 'senior';
  duration: number;
  status: 'pending' | 'active' | 'completed';
  questions: string[];
  transcript: TranscriptEntry[];
  createdAt: string;
  completedAt?: string;
}

export interface TranscriptEntry {
  role: 'interviewer' | 'user';
  content: string;
  timestamp: string;
}

export interface Feedback {
  id: string;
  interviewId: string;
  userId: string;
  overallScore: number;
  verdict: 'Strong Hire' | 'Hire' | 'Maybe' | 'No Hire';
  summary: string;
  categories: FeedbackCategory[];
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  createdAt: string;
}

export interface FeedbackCategory {
  name: string;
  score: number;
  feedback: string;
  rating: 'excellent' | 'good' | 'average' | 'poor';
}

export interface Domain {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;
  topics: string[];
}
