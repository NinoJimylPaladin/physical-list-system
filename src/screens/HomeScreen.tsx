import React, { useState, useEffect } from 'react';
import {
  Plus,
  ArrowRight,
  Flame,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Dumbbell,
  RefreshCw,
} from 'lucide-react';
import { PhysicalActivity, ActivityCategory, User } from '../types/Activity';
import { activityService } from '../services/activityService';
import { ALL_CATEGORIES } from '../styles/theme';
import CategoryCard from '../components/CategoryCard';
import ActivityCard from '../components/ActivityCard';
import ConfirmModal from '../components/ConfirmModal';

interface HomeScreenProps {
  user: User | null;
  onNavigateToActivities: (categoryFilter?: ActivityCategory) => void;
  onNavigateToAddActivity: () => void;
  onNavigateToDetails: (activityId: string) => void;
  onNavigateToProgress: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  onNavigateToActivities,
  onNavigateToAddActivity,
  onNavigateToDetails,
  onNavigateToProgress,
}) => {
  const [activities, setActivities] = useState<PhysicalActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activityToDelete, setActivityToDelete] = useState<PhysicalActivity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await activityService.getActivities();
      setActivities(data);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleComplete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await activityService.toggleCompleteActivity(id);
      setActivities((prev) =>
        prev.map((act) => (act.id === id ? updated : act))
      );
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  const handleDeleteActivity = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = activities.find((act) => act.id === id);
    if (target) {
      setActivityToDelete(target);
    }
  };

  const handleConfirmDelete = async () => {
    if (!activityToDelete) return;
    try {
      setIsDeleting(true);
      await activityService.deleteActivity(activityToDelete.id);
      setActivities((prev) => prev.filter((act) => act.id !== activityToDelete.id));
      const deletedName = activityToDelete.name;
      setActivityToDelete(null);
      setFeedbackToast(`"${deletedName}" deleted successfully`);
      setTimeout(() => setFeedbackToast(null), 2500);
    } catch (err) {
      console.error('Failed to delete activity:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Date and greeting
  const now = new Date();
  const hours = now.getHours();
  let greeting = 'Good Morning';
  if (hours >= 12 && hours < 17) greeting = 'Good Afternoon';
  else if (hours >= 17) greeting = 'Good Evening';

  const todayStr = now.toISOString().split('T')[0];
  const formattedToday = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Calculate today's summary metrics
  const todayActivities = activities.filter((a) => a.date === todayStr);
  const todayCompleted = todayActivities.filter((a) => a.isCompleted);
  const todayMinutes = todayCompleted.reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
  const todayCalories = todayCompleted.reduce((sum, a) => sum + (Number(a.caloriesBurned) || 0), 0);

  // Overall metrics
  const totalCompletedCount = activities.filter((a) => a.isCompleted).length;

  // Category counts
  const categoryCounts = ALL_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = activities.filter((a) => a.category === cat).length;
    return acc;
  }, {} as Record<ActivityCategory, number>);

  return (
    <div className="flex flex-col flex-1 pb-24 overflow-y-auto">
      {/* Top Welcome Header */}
      <div className="p-5 pb-4 bg-linear-to-b from-sky-500/10 via-sky-500/5 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>{formattedToday}</span>
            </span>
          </div>

          <button
            id="refresh-home-data-button"
            type="button"
            onClick={loadData}
            title="Refresh data"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {greeting}, {user?.name?.split(' ')[0] || 'Athlete'} 👋
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Keep moving forward. Ready for today's routine?
        </p>

        {/* Today's Activities Summary Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Today's Summary
                </span>
              </div>
              <button
                id="view-progress-from-home"
                type="button"
                onClick={onNavigateToProgress}
                className="text-xs font-semibold text-sky-300 hover:text-sky-200 flex items-center gap-1"
              >
                <span>Stats</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
                <span className="block text-xl font-black text-white">
                  {todayCompleted.length}/{todayActivities.length}
                </span>
                <span className="text-[11px] text-slate-300 font-medium">
                  Completed
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
                <div className="flex items-center justify-center gap-1 text-xl font-black text-white">
                  <Clock className="w-3.5 h-3.5 text-sky-300" />
                  <span>{todayMinutes}</span>
                </div>
                <span className="text-[11px] text-slate-300 font-medium">
                  Minutes
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
                <div className="flex items-center justify-center gap-1 text-xl font-black text-white">
                  <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>{todayCalories}</span>
                </div>
                <span className="text-[11px] text-slate-300 font-medium">
                  Calories
                </span>
              </div>
            </div>

            {/* Total Completed Activities Metric */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Total all-time completed</span>
              </div>
              <span className="font-bold text-emerald-400 text-sm">
                {totalCompletedCount} workouts
              </span>
            </div>
          </div>
        </div>

        {/* Quick Add Button */}
        <div className="mt-4">
          <button
            id="quick-add-activity-button"
            type="button"
            onClick={onNavigateToAddActivity}
            className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm shadow-sky-500/20"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Add Physical Activity</span>
          </button>
        </div>
      </div>

      {/* Activity Categories Section */}
      <div className="px-5 mt-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Activity Categories
            </h2>
            <p className="text-xs text-slate-500">Explore by workout discipline</p>
          </div>
          <button
            id="see-all-categories-button"
            type="button"
            onClick={() => onNavigateToActivities()}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-0.5"
          >
            <span>All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {ALL_CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat}
              category={cat}
              count={categoryCounts[cat] || 0}
              onPress={(selectedCategory) => onNavigateToActivities(selectedCategory)}
            />
          ))}
        </div>
      </div>

      {/* Recent & Today's Activities Section */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Recent Activities
            </h2>
            <p className="text-xs text-slate-500">Your latest logged sessions</p>
          </div>
          <button
            id="view-all-activities-link"
            type="button"
            onClick={() => onNavigateToActivities()}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-0.5"
          >
            <span>View list ({activities.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <Dumbbell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No activities logged yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Start your fitness routine by adding your first workout session.
            </p>
            <button
              id="empty-home-add-button"
              type="button"
              onClick={onNavigateToAddActivity}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600"
            >
              <Plus className="w-4 h-4" />
              <span>Log Activity</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activities.slice(0, 4).map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onPress={(act) => onNavigateToDetails(act.id)}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteActivity}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action Toast Feedback */}
      {feedbackToast && (
        <div
          id="home-feedback-toast"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-lg flex items-center gap-2 animate-fade-in"
        >
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!activityToDelete}
        title="Delete Physical Activity?"
        description={
          activityToDelete
            ? `Are you sure you want to delete "${activityToDelete.name}" (${activityToDelete.duration} mins)? This activity log will be permanently removed.`
            : ''
        }
        confirmText="Delete Activity"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (!isDeleting) setActivityToDelete(null);
        }}
      />
    </div>
  );
};

export default HomeScreen;
