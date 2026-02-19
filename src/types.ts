import { BookOpen, Briefcase, Coffee, Dumbbell, GraduationCap, Tv, Utensils } from 'lucide-react';

export type Category = 'Work' | 'Read' | 'Study' | 'Exercise' | 'Rest' | 'Eat' | 'Entertainment';

export interface LogEntry {
  id: string;
  category: Category;
  description: string;
  startTime: number;
  endTime?: number;
  duration: number; // in seconds
  images: string[];
  isLive?: boolean;
  phaseDurations?: {
    work: number;
    rest: number;
  };
}

export type TimerPhase = 'work' | 'rest';
export type PhasePromptKind = 'phase-end' | 'reminder' | 'cycle-complete';
export type StatsView = 'day' | 'week' | 'month' | 'year';
export type ViewMode = 'charts' | 'grid';
export type NotificationStatus = NotificationPermission | 'unsupported';

export interface GitLabConfig {
  token: string;
  projectId: string;
  branch: string;
  filename: string;
  url: string;
}

export interface Task {
  category: Category;
  description: string;
  images: string[];
  liveId: string | null;
}

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

export interface Inspiration {
  id: string;
  title: string;
  content: string;
  url?: string;
  date: number;
}

export const DEFAULT_CATEGORY_DATA: Record<Category, { icon: any; color: string }> = {
  Work: { icon: Briefcase, color: '#3b82f6' }, // Blue
  Study: { icon: GraduationCap, color: '#10b981' }, // Green
  Exercise: { icon: Dumbbell, color: '#facc15' }, // Yellow
  Rest: { icon: Coffee, color: '#f472b6' }, // Pink
  Read: { icon: BookOpen, color: '#8b5cf6' }, // Purple
  Eat: { icon: Utensils, color: '#f97316' }, // Orange
  Entertainment: { icon: Tv, color: '#22d3ee' }, // Cyan
};

export const CATEGORIES = Object.keys(DEFAULT_CATEGORY_DATA) as Category[];

export const APP_LOGO = 'logo.png';
