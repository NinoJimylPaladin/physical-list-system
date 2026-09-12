import React from 'react';
import {
  Clock,
  Flame,
  CheckCircle2,
  Circle,
  Trash2,
  ChevronRight,
  HeartPulse,
  Dumbbell,
  Flower2,
  Trophy,
  Mountain,
  Home,
  LucideIcon,
} from 'lucide-react';
import { PhysicalActivity, ActivityCategory } from '../types/Activity';
import { CATEGORY_CONFIG, DIFFICULTY_CONFIG } from '../styles/theme';

interface ActivityCardProps {
  activity: PhysicalActivity;
  onPress: (activity: PhysicalActivity) => void;
  onToggleComplete: (id: string, e: React.MouseEvent) => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
  showDeleteButton?: boolean;
}

const CATEGORY_ICON: Record<ActivityCategory, LucideIcon> = {
  Cardio: HeartPulse,
  'Strength Training': Dumbbell,
  Flexibility: Flower2,
  Sports: Trophy,
  'Outdoor Activities': Mountain,
  'Home Exercises': Home,
};

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onPress,
  onToggleComplete,
  onDelete,
  showDeleteButton = true,
}) => {
  const categoryMeta = CATEGORY_CONFIG[activity.category] || CATEGORY_CONFIG.Cardio;
  const difficultyMeta = DIFFICULTY_CONFIG[activity.difficulty] || DIFFICULTY_CONFIG.Beginner;
  const CategoryIcon = CATEGORY_ICON[activity.category] || HeartPulse;

  return (
    <div
      id={`activity-card-${activity.id}`}
      onClick={() => onPress(activity)}
      className={`group relative flex flex-col p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs hover:shadow-md ${
        activity.isCompleted
          ? 'border-emerald-200/80 bg-linear-to-b from-white to-emerald-50/20'
          : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      {/* Top Header Row: Category Badge & Status / Delete */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${categoryMeta.badgeBg}`}
          >
            <CategoryIcon className="w-3.5 h-3.5" />
            <span>{activity.category}</span>
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${difficultyMeta.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${difficultyMeta.dot}`} />
            <span>{activity.difficulty}</span>
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {showDeleteButton && onDelete && (
            <button
              id={`delete-activity-${activity.id}`}
              type="button"
              aria-label="Delete activity"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(activity.id, e);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete activity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            id={`toggle-activity-${activity.id}`}
            type="button"
            aria-label={activity.isCompleted ? 'Mark as pending' : 'Mark as completed'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(activity.id, e);
            }}
            className={`p-1.5 rounded-xl transition-all ${
              activity.isCompleted
                ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 ring-1 ring-emerald-200'
                : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-50'
            }`}
            title={activity.isCompleted ? 'Completed' : 'Mark complete'}
          >
            {activity.isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Activity Name & Description */}
      <div className="mb-3">
        <h3
          className={`text-base font-bold tracking-tight transition-colors line-clamp-1 ${
            activity.isCompleted ? 'text-slate-700 line-through decoration-emerald-500/60' : 'text-slate-900'
          }`}
        >
          {activity.name}
        </h3>
        {activity.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {activity.description}
          </p>
        )}
      </div>

      {/* Metrics Row: Duration, Calories, Date */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{activity.duration} min</span>
          </span>
          <span className="flex items-center gap-1 font-medium text-amber-600">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{activity.caloriesBurned} kcal</span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-700 transition-colors">
          <span className="text-[11px]">Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
