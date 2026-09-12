export type ActivityCategory =
  | 'Cardio'
  | 'Strength Training'
  | 'Flexibility'
  | 'Sports'
  | 'Outdoor Activities'
  | 'Home Exercises';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface PhysicalActivity {
  id: string;
  name: string;
  description: string;
  category: ActivityCategory;
  duration: number; // in minutes
  difficulty: DifficultyLevel;
  caloriesBurned: number;
  date: string; // YYYY-MM-DD
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  preferredCategory?: ActivityCategory;
  joinedDate: string;
}

export interface ActivityFilter {
  searchQuery: string;
  category: ActivityCategory | 'All';
  difficulty: DifficultyLevel | 'All';
  completionStatus: 'All' | 'Completed' | 'Pending';
}

export interface DayActivitySummary {
  day: string; // 'Mon', 'Tue', etc.
  fullDate: string; // 'YYYY-MM-DD'
  minutes: number;
  calories: number;
  completedCount: number;
}

export interface ProgressSummary {
  totalActivities: number;
  totalCompleted: number;
  totalMinutes: number;
  totalCalories: number;
  completionRate: number; // percentage 0-100
  weeklyBreakdown: DayActivitySummary[];
  categoryBreakdown: {
    category: ActivityCategory;
    count: number;
    minutes: number;
    calories: number;
    percentage: number;
  }[];
}

export type ScreenName =
  | 'Login'
  | 'Register'
  | 'Home'
  | 'Activities'
  | 'AddActivity'
  | 'ActivityDetails'
  | 'Progress'
  | 'Profile';

export interface NavigationRoute {
  name: ScreenName;
  params?: {
    activityId?: string;
    categoryFilter?: ActivityCategory;
    editMode?: boolean;
  };
}

export interface NavigationContextType {
  currentRoute: NavigationRoute;
  navigate: (name: ScreenName, params?: NavigationRoute['params']) => void;
  goBack: () => void;
  canGoBack: boolean;
  activeTab: 'Home' | 'Activities' | 'Progress' | 'Profile';
  setActiveTab: (tab: 'Home' | 'Activities' | 'Progress' | 'Profile') => void;
}
