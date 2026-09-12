import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Flame,
  CheckCircle2,
  Circle,
  Edit3,
  Trash2,
  HeartPulse,
  Dumbbell,
  Flower2,
  Trophy,
  Mountain,
  Home,
  Lightbulb,
  Share2,
  Check,
  LucideIcon,
} from 'lucide-react';
import { PhysicalActivity, ActivityCategory } from '../types/Activity';
import { activityService } from '../services/activityService';
import { CATEGORY_CONFIG, DIFFICULTY_CONFIG } from '../styles/theme';
import ConfirmModal from '../components/ConfirmModal';

interface ActivityDetailsScreenProps {
  activityId: string;
  onGoBack: () => void;
  onNavigateToEdit: (activityId: string) => void;
  onActivityDeleted: () => void;
}

const CATEGORY_ICON: Record<ActivityCategory, LucideIcon> = {
  Cardio: HeartPulse,
  'Strength Training': Dumbbell,
  Flexibility: Flower2,
  Sports: Trophy,
  'Outdoor Activities': Mountain,
  'Home Exercises': Home,
};

const CATEGORY_TIPS: Record<ActivityCategory, string[]> = {
  Cardio: [
    'Maintain a steady aerobic heart rate in Zone 2–3 for optimal endurance.',
    'Hydrate 15–20 minutes before starting and rehydrate with electrolytes post-run.',
    'Finish with 5 minutes of gentle walking to taper down heart rate safely.',
  ],
  'Strength Training': [
    'Prioritize full range of motion over lifting heavier weights.',
    'Take 60–90 seconds of rest between working sets for maximum hypertrophy.',
    'Engage core and practice diaphragmatic breathing on concentric phases.',
  ],
  Flexibility: [
    'Never force a stretch into sharp joint pain; breathe into mild tension.',
    'Hold static postures for 30–45 seconds to encourage myofascial release.',
    'Best performed when body temperature is elevated or post-workout.',
  ],
  Sports: [
    'Perform dynamic warmups (lunges, leg swings) before explosive play.',
    'Protect agility with supportive multi-directional court or turf footwear.',
    'Keep quick-absorbing hydration nearby between games or sets.',
  ],
  'Outdoor Activities': [
    'Check local weather conditions and carry sufficient sun protection.',
    'Inform someone of your intended trail route and expected finish time.',
    'Wear moisture-wicking apparel and pack high-density energy snacks.',
  ],
  'Home Exercises': [
    'Ensure clear 2x2 meter space free of slip hazards and sharp furniture.',
    'Use an exercise mat to buffer spinal and knee contact during floor reps.',
    'Focus on time under tension and explosive tempo on positive pushes.',
  ],
};

export const ActivityDetailsScreen: React.FC<ActivityDetailsScreenProps> = ({
  activityId,
  onGoBack,
  onNavigateToEdit,
  onActivityDeleted,
}) => {
  const [activity, setActivity] = useState<PhysicalActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const loadActivity = async () => {
    try {
      setIsLoading(true);
      const data = await activityService.getActivityById(activityId);
      setActivity(data);
    } catch (err) {
      console.error('Failed to load activity details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, [activityId]);

  const handleToggleComplete = async () => {
    if (!activity) return;
    try {
      const updated = await activityService.toggleCompleteActivity(activity.id);
      setActivity(updated);
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!activity) return;
    setIsDeleting(true);
    try {
      await activityService.deleteActivity(activity.id);
      setShowDeleteModal(false);
      onActivityDeleted();
    } catch (err) {
      console.error('Failed to delete activity:', err);
      setIsDeleting(false);
    }
  };

  const handleShareSummary = () => {
    if (!activity) return;
    const text = `Completed workout: ${activity.name} (${activity.category}) for ${activity.duration} mins, burned ${activity.caloriesBurned} kcal!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8 text-slate-400">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs">Loading activity details...</p>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8 text-center">
        <h3 className="text-base font-bold text-slate-800">Activity Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          This activity might have been deleted or moved.
        </p>
        <button
          id="not-found-back-button"
          type="button"
          onClick={onGoBack}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
        >
          Return to Activities
        </button>
      </div>
    );
  }

  const categoryMeta = CATEGORY_CONFIG[activity.category] || CATEGORY_CONFIG.Cardio;
  const difficultyMeta = DIFFICULTY_CONFIG[activity.difficulty] || DIFFICULTY_CONFIG.Beginner;
  const CategoryIcon = CATEGORY_ICON[activity.category] || HeartPulse;
  const tips = CATEGORY_TIPS[activity.category] || CATEGORY_TIPS.Cardio;

  const formattedDate = new Date(activity.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col flex-1 pb-16 overflow-y-auto bg-slate-50">
      {/* Top App Bar */}
      <div className="p-4 bg-white border-b border-slate-200/80 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            id="details-back-button"
            type="button"
            onClick={onGoBack}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-slate-900">Activity Details</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            id="share-activity-button"
            type="button"
            onClick={handleShareSummary}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Copy workout summary"
          >
            {copiedNotification ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>

          <button
            id="edit-activity-button"
            type="button"
            onClick={() => onNavigateToEdit(activity.id)}
            className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
            title="Edit activity"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            id="delete-activity-detail-button"
            type="button"
            disabled={isDeleting}
            onClick={handleOpenDeleteModal}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition-colors cursor-pointer"
            title="Delete activity"
            aria-label="Delete activity"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {copiedNotification && (
        <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center">
          Workout summary copied to clipboard!
        </div>
      )}

      {/* Main Container */}
      <div className="p-5 max-w-lg mx-auto w-full space-y-4">
        {/* Hero Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${categoryMeta.badgeBg}`}
            >
              <CategoryIcon className="w-4 h-4" />
              <span>{activity.category}</span>
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${difficultyMeta.bg}`}
            >
              <span className={`w-2 h-2 rounded-full ${difficultyMeta.dot}`} />
              <span>{activity.difficulty}</span>
            </span>
          </div>

          <h1
            className={`text-2xl font-black tracking-tight mb-2 ${
              activity.isCompleted ? 'text-slate-800' : 'text-slate-900'
            }`}
          >
            {activity.name}
          </h1>

          <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </div>

          {/* Completion Status Box */}
          <button
            id="toggle-completion-detail-button"
            type="button"
            onClick={handleToggleComplete}
            className={`w-full p-3.5 rounded-2xl flex items-center justify-between transition-all border ${
              activity.isCompleted
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 hover:bg-emerald-100/80'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5 text-left">
              {activity.isCompleted ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
              ) : (
                <Circle className="w-6 h-6 text-slate-400" />
              )}
              <div>
                <span className="block text-xs font-bold">
                  {activity.isCompleted ? 'Completed Session' : 'Mark as Completed'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {activity.isCompleted
                    ? 'Great job completing this workout!'
                    : 'Tap to mark this activity as done'}
                </span>
              </div>
            </div>

            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                activity.isCompleted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {activity.isCompleted ? 'Done' : 'Pending'}
            </span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Clock className="w-4 h-4 text-sky-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Duration
              </span>
            </div>
            <span className="text-2xl font-black text-slate-900">
              {activity.duration}
            </span>
            <span className="text-xs font-semibold text-slate-500 ml-1">minutes</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Calories
              </span>
            </div>
            <span className="text-2xl font-black text-slate-900">
              {activity.caloriesBurned}
            </span>
            <span className="text-xs font-semibold text-slate-500 ml-1">kcal</span>
          </div>
        </div>

        {/* Description Section */}
        {activity.description && (
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Description & Workout Notes
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {activity.description}
            </p>
          </div>
        )}

        {/* Category Pro Tips */}
        <div className="p-5 rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 text-white shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {activity.category} Performance Tips
            </h2>
          </div>
          <ul className="space-y-2">
            {tips.map((tip, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex gap-3">
          <button
            id="details-edit-bottom-button"
            type="button"
            onClick={() => onNavigateToEdit(activity.id)}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 font-bold text-sm text-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Workout</span>
          </button>

          <button
            id="details-delete-bottom-button"
            type="button"
            disabled={isDeleting}
            onClick={handleOpenDeleteModal}
            className="py-3 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Physical Activity?"
        description={
          activity
            ? `Are you sure you want to delete "${activity.name}" (${activity.duration} mins)? This activity will be permanently removed from your workout history.`
            : ''
        }
        confirmText="Delete Activity"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (!isDeleting) setShowDeleteModal(false);
        }}
      />
    </div>
  );
};

export default ActivityDetailsScreen;
