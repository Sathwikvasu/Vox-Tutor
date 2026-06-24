import { Domain } from '@/types';

export const DOMAINS: Domain[] = [
  {
    id: 'software',
    label: 'Software Engineering',
    icon: '💻',
    description: 'System design, algorithms, architecture',
    color: '#6366f1',
    topics: ['System Design', 'Data Structures', 'Algorithms', 'Architecture', 'Code Quality'],
  },
  {
    id: 'finance',
    label: 'Finance & Banking',
    icon: '📈',
    description: 'Valuation, financial modeling, risk',
    color: '#10b981',
    topics: ['DCF Valuation', 'Financial Modeling', 'Risk Analysis', 'M&A', 'Capital Markets'],
  },
  {
    id: 'marketing',
    label: 'Marketing & Brand',
    icon: '🎯',
    description: 'Brand strategy, growth, analytics',
    color: '#f59e0b',
    topics: ['Brand Strategy', 'Digital Marketing', 'Growth', 'Analytics', 'Campaigns'],
  },
  {
    id: 'product',
    label: 'Product Management',
    icon: '🚀',
    description: 'Roadmaps, user research, metrics',
    color: '#ec4899',
    topics: ['Product Strategy', 'User Research', 'Roadmapping', 'Metrics', 'Prioritization'],
  },
  {
    id: 'data_science',
    label: 'Data Science & AI',
    icon: '🤖',
    description: 'ML models, statistics, AI products',
    color: '#8b5cf6',
    topics: ['Machine Learning', 'Statistics', 'Model Evaluation', 'Feature Engineering', 'Deep Learning'],
  },
  {
    id: 'consulting',
    label: 'Management Consulting',
    icon: '🏢',
    description: 'Case interviews, strategy, problem solving',
    color: '#f97316',
    topics: ['Case Analysis', 'Market Sizing', 'Strategy Frameworks', 'Operations', 'Problem Solving'],
  },
];

export const DIFFICULTIES = [
  { value: 'entry', label: 'Entry Level', description: '0–2 years experience' },
  { value: 'mid',   label: 'Mid Level',   description: '2–5 years experience' },
  { value: 'senior',label: 'Senior',      description: '5+ years experience'  },
] as const;

export const DURATIONS = [
  { value: 10, label: '10 min', questions: 3 },
  { value: 20, label: '20 min', questions: 5 },
  { value: 30, label: '30 min', questions: 7 },
];
