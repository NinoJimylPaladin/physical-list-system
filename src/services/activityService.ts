import {
  ActivityCategory,
  DifficultyLevel,
  PhysicalActivity,
  ProgressSummary,
  User,
} from '../types/Activity';
import { AsyncStorage } from '../storage/storage';

const STORAGE_KEYS = {
  ACTIVITIES: '@physical_activities_v1',
  CURRENT_USER: '@current_user_v1',
  USERS_LIST: '@users_list_v1',
};

// Seed sample activities with realistic fitness data
const INITIAL_ACTIVITIES: PhysicalActivity[] = [
  {
    id: 'act-1',
    name: 'Morning Jog & Intervals',
    description: 'Outdoor neighborhood run with 5 high-intensity sprint intervals.',
    category: 'Cardio',
    duration: 35,
    difficulty: 'Intermediate',
    caloriesBurned: 320,
    date: new Date().toISOString().split('T')[0],
    isCompleted: true,
    completedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'act-2',
    name: 'Full Body Dumbbell Circuit',
    description: 'Squats, overhead presses, Romanian deadlifts, and bent-over rows (4 sets each).',
    category: 'Strength Training',
    duration: 45,
    difficulty: 'Intermediate',
    caloriesBurned: 380,
    date: new Date().toISOString().split('T')[0],
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'act-3',
    name: 'Vinyasa Flow Yoga',
    description: 'Sun salutations, warrior poses, hip openers, and deep spinal twists for recovery.',
    category: 'Flexibility',
    duration: 30,
    difficulty: 'Beginner',
    caloriesBurned: 140,
    date: new Date().toISOString().split('T')[0],
    isCompleted: true,
    completedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'act-4',
    name: 'Singles Tennis Match',
    description: 'Competitive 3-set tennis session working on backhands and lateral court agility.',
    category: 'Sports',
    duration: 60,
    difficulty: 'Advanced',
    caloriesBurned: 520,
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    isCompleted: true,
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'act-5',
    name: 'Trail Hike & Ridge Walk',
    description: 'Moderate elevation gain trail hike with rocky terrain and steady pacing.',
    category: 'Outdoor Activities',
    duration: 75,
    difficulty: 'Intermediate',
    caloriesBurned: 460,
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    isCompleted: true,
    completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'act-6',
    name: 'Core Blaster & Calisthenics',
    description: 'Planks, hollow body holds, bicycle crunches, pushups, and bodyweight dips.',
    category: 'Home Exercises',
    duration: 25,
    difficulty: 'Beginner',
    caloriesBurned: 180,
    date: new Date().toISOString().split('T')[0],
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'act-7',
    name: 'HIIT Tabata Protocol',
    description: '8 rounds of 20s work / 10s rest: Burpees, mountain climbers, high knees, jump squats.',
    category: 'Cardio',
    duration: 20,
    difficulty: 'Advanced',
    caloriesBurned: 260,
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    isCompleted: true,
    completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'act-8',
    name: 'Kettlebell Complex',
    description: 'Turkish get-ups, kettlebell swings, cleans, and goblet squats.',
    category: 'Strength Training',
    duration: 40,
    difficulty: 'Advanced',
    caloriesBurned: 350,
    date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
    isCompleted: true,
    completedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

const DEFAULT_USER: User = {
  id: 'usr-default',
  name: 'Alex Rivera',
  email: 'alex.fitness@example.com',
  preferredCategory: 'Strength Training',
  joinedDate: '2025-01-15',
};

class ActivityService {
  /**
   * Initializes storage with sample activities and user if empty.
   */
  async initialize(): Promise<void> {
    const rawActivities = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!rawActivities) {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
    }

    const rawUser = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!rawUser) {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USER));
    }
  }

  // --- Activities CRUD ---

  async getActivities(): Promise<PhysicalActivity[]> {
    await this.initialize();
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!data) return [];
    try {
      const activities: PhysicalActivity[] = JSON.parse(data);
      // Sort newest first
      return activities.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch {
      return [];
    }
  }

  async getActivityById(id: string): Promise<PhysicalActivity | null> {
    const activities = await this.getActivities();
    return activities.find((act) => act.id === id) ?? null;
  }

  async addActivity(
    activityData: Omit<PhysicalActivity, 'id' | 'createdAt'>
  ): Promise<PhysicalActivity> {
    const activities = await this.getActivities();
    const newActivity: PhysicalActivity = {
      ...activityData,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newActivity, ...activities];
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
    return newActivity;
  }

  async updateActivity(
    id: string,
    updates: Partial<PhysicalActivity>
  ): Promise<PhysicalActivity> {
    const activities = await this.getActivities();
    const index = activities.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Activity with id "${id}" not found.`);
    }

    const updatedActivity = {
      ...activities[index],
      ...updates,
    };

    activities[index] = updatedActivity;
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    return updatedActivity;
  }

  async deleteActivity(id: string): Promise<boolean> {
    const activities = await this.getActivities();
    const filtered = activities.filter((a) => a.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(filtered));
    return true;
  }

  async toggleCompleteActivity(id: string): Promise<PhysicalActivity> {
    const activities = await this.getActivities();
    const index = activities.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Activity with id "${id}" not found.`);
    }

    const current = activities[index];
    const newStatus = !current.isCompleted;
    const updated: PhysicalActivity = {
      ...current,
      isCompleted: newStatus,
      completedAt: newStatus ? new Date().toISOString() : undefined,
    };

    activities[index] = updated;
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    return updated;
  }

  // --- Progress & Analytics ---

  async getProgressSummary(): Promise<ProgressSummary> {
    const activities = await this.getActivities();
    const totalActivities = activities.length;
    const completedActivities = activities.filter((a) => a.isCompleted);
    const totalCompleted = completedActivities.length;
    const totalMinutes = completedActivities.reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
    const totalCalories = completedActivities.reduce((sum, a) => sum + (Number(a.caloriesBurned) || 0), 0);
    const completionRate = totalActivities > 0 ? Math.round((totalCompleted / totalActivities) * 100) : 0;

    // Build last 7 days breakdown
    const daysName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weeklyBreakdown = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = daysName[d.getDay()];

      const dayActivities = activities.filter(
        (a) => a.date === dateStr && a.isCompleted
      );

      const minutes = dayActivities.reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
      const calories = dayActivities.reduce((sum, a) => sum + (Number(a.caloriesBurned) || 0), 0);

      weeklyBreakdown.push({
        day: dayName,
        fullDate: dateStr,
        minutes,
        calories,
        completedCount: dayActivities.length,
      });
    }

    // Category breakdown
    const categories: ActivityCategory[] = [
      'Cardio',
      'Strength Training',
      'Flexibility',
      'Sports',
      'Outdoor Activities',
      'Home Exercises',
    ];

    const categoryBreakdown = categories.map((cat) => {
      const catActs = activities.filter((a) => a.category === cat);
      const count = catActs.length;
      const minutes = catActs.reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
      const calories = catActs.reduce((sum, a) => sum + (Number(a.caloriesBurned) || 0), 0);
      const percentage = totalActivities > 0 ? Math.round((count / totalActivities) * 100) : 0;

      return {
        category: cat,
        count,
        minutes,
        calories,
        percentage,
      };
    });

    return {
      totalActivities,
      totalCompleted,
      totalMinutes,
      totalCalories,
      completionRate,
      weeklyBreakdown,
      categoryBreakdown,
    };
  }

  // --- Auth & Profile ---

  async getCurrentUser(): Promise<User | null> {
    await this.initialize();
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async loginUser(email: string, _password?: string): Promise<User> {
    await this.initialize();
    const trimmedEmail = email.trim().toLowerCase();

    // Check saved users list or default user
    const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS_LIST);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];

    let matchedUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (!matchedUser) {
      // If default demo user
      if (trimmedEmail === DEFAULT_USER.email.toLowerCase()) {
        matchedUser = DEFAULT_USER;
      } else {
        // Create user on login if valid credentials
        const namePart = trimmedEmail.split('@')[0];
        const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        matchedUser = {
          id: `usr-${Date.now()}`,
          name: displayName,
          email: trimmedEmail,
          preferredCategory: 'Cardio',
          joinedDate: new Date().toISOString().split('T')[0],
        };
        users.push(matchedUser);
        await AsyncStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(users));
      }
    }

    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(matchedUser));
    return matchedUser;
  }

  async registerUser(name: string, email: string, _password?: string): Promise<User> {
    await this.initialize();
    const trimmedEmail = email.trim().toLowerCase();
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: trimmedEmail,
      preferredCategory: 'Cardio',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS_LIST);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    users.push(newUser);

    await AsyncStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(users));
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    return newUser;
  }

  async logoutUser(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  async updateUserProfile(updates: Partial<User>): Promise<User> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No user currently logged in');
    }

    const updatedUser: User = {
      ...currentUser,
      ...updates,
    };

    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    return updatedUser;
  }

  async resetSampleData(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USER));
  }
}

export const activityService = new ActivityService();
export default activityService;
