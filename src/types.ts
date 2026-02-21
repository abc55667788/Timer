import { 
  BookOpen, Briefcase, Coffee, Dumbbell, GraduationCap, Tv, Utensils, 
  Code, Music, Gamepad2, Camera, Heart, ShoppingBag, Plane, Car, 
  Pencil, MessageSquare, Zap, Target, Star, Smile, Flame, Moon, Sun, 
  Map, Mail, Phone, Lock, Unlock, Key, Trash2, CheckCircle2, AlertCircle, 
  Clock, Calendar, Home, Search, Filter, Layout, Settings, LogOut, 
  User, Bell, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, 
  MoreHorizontal, MoreVertical, Plus, Minus, X, Trash
} from 'lucide-react';

export type Category = string;

export const CATEGORY_ICONS = {
  Briefcase,
  GraduationCap,
  Dumbbell,
  Coffee,
  BookOpen,
  Utensils,
  Tv,
  Code,
  Music,
  Gamepad2,
  Camera,
  Heart,
  ShoppingBag,
  Plane,
  Car,
  Pencil,
  MessageSquare,
  Zap,
  Target,
  Star,
  Smile,
  Flame,
  Moon,
  Sun,
  Map,
  Mail,
  Phone,
  Lock,
  Unlock,
  Key,
  Home,
  Layout,
  User,
  Bell,
  Search,
};

export type IconKey = keyof typeof CATEGORY_ICONS;

export interface CategoryData {
  name: string;
  icon: IconKey;
  color: string;
}

export interface LogEntry {
  id: string;
  category: Category;
  description: string;
  startTime: number;
  endTime?: number;
  duration: number; // in seconds
  images: string[];
  link?: string;
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

export interface WebDAVConfig {
  url: string;
  username: string;
  password?: string;
  filename: string;
}

export interface Task {
  category: Category;
  description: string;
  images: string[];
  link?: string;
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
  images?: string[];
}

export const DEFAULT_CATEGORIES: CategoryData[] = [
  { name: 'Work', icon: 'Briefcase', color: '#3b82f6' },
  { name: 'Study', icon: 'GraduationCap', color: '#10b981' },
  { name: 'Exercise', icon: 'Dumbbell', color: '#facc15' },
  { name: 'Rest', icon: 'Coffee', color: '#f472b6' },
  { name: 'Read', icon: 'BookOpen', color: '#8b5cf6' },
  { name: 'Eat', icon: 'Utensils', color: '#f97316' },
  { name: 'Entertainment', icon: 'Tv', color: '#22d3ee' },
];

export const APP_LOGO = 'logo.png';
