import { ActivityCategory, DifficultyLevel } from '../types/Activity';

export const THEME_COLORS = {
  primary: '#0ea5e9', // Ocean blue / sky
  primaryDark: '#0284c7',
  primaryLight: '#e0f2fe',
  accent: '#10b981', // Emerald
  background: '#f8fafc', // Slate 50
  card: '#ffffff',
  text: '#0f172a', // Slate 900
  textMuted: '#64748b', // Slate 500
  border: '#e2e8f0', // Slate 200
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

export interface CategoryMeta {
  name: ActivityCategory;
  iconName: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  borderHover: string;
  gradient: string;
  solidColor: string;
}

export const CATEGORY_CONFIG: Record<ActivityCategory, CategoryMeta> = {
  Cardio: {
    name: 'Cardio',
    iconName: 'HeartPulse',
    description: 'Running, cycling, HIIT, jump rope',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeText: 'text-rose-600',
    borderHover: 'hover:border-rose-300',
    gradient: 'from-rose-500 to-pink-500',
    solidColor: '#f43f5e',
  },
  'Strength Training': {
    name: 'Strength Training',
    iconName: 'Dumbbell',
    description: 'Weightlifting, bodyweight, resistance',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    badgeText: 'text-purple-600',
    borderHover: 'hover:border-purple-300',
    gradient: 'from-purple-500 to-indigo-500',
    solidColor: '#a855f7',
  },
  Flexibility: {
    name: 'Flexibility',
    iconName: 'Flower2',
    description: 'Yoga, Pilates, dynamic stretching',
    badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
    badgeText: 'text-teal-600',
    borderHover: 'hover:border-teal-300',
    gradient: 'from-teal-500 to-emerald-500',
    solidColor: '#14b8a6',
  },
  Sports: {
    name: 'Sports',
    iconName: 'Trophy',
    description: 'Basketball, tennis, swimming, soccer',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeText: 'text-amber-600',
    borderHover: 'hover:border-amber-300',
    gradient: 'from-amber-500 to-orange-500',
    solidColor: '#f59e0b',
  },
  'Outdoor Activities': {
    name: 'Outdoor Activities',
    iconName: 'Mountain',
    description: 'Hiking, trail running, kayaking',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeText: 'text-emerald-600',
    borderHover: 'hover:border-emerald-300',
    gradient: 'from-emerald-500 to-teal-500',
    solidColor: '#10b981',
  },
  'Home Exercises': {
    name: 'Home Exercises',
    iconName: 'Home',
    description: 'Core workouts, calisthenics, mat routines',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    badgeText: 'text-sky-600',
    borderHover: 'hover:border-sky-300',
    gradient: 'from-sky-500 to-blue-500',
    solidColor: '#0ea5e9',
  },
};

export const DIFFICULTY_CONFIG: Record<
  DifficultyLevel,
  { label: string; bg: string; text: string; dot: string }
> = {
  Beginner: {
    label: 'Beginner',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  Intermediate: {
    label: 'Intermediate',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  Advanced: {
    label: 'Advanced',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
  },
};

export const ALL_CATEGORIES: ActivityCategory[] = [
  'Cardio',
  'Strength Training',
  'Flexibility',
  'Sports',
  'Outdoor Activities',
  'Home Exercises',
];

export const ALL_DIFFICULTIES: DifficultyLevel[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
];
