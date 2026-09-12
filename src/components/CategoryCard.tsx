import React from 'react';
import {
  HeartPulse,
  Dumbbell,
  Flower2,
  Trophy,
  Mountain,
  Home,
  LucideIcon,
} from 'lucide-react';
import { ActivityCategory } from '../types/Activity';
import { CATEGORY_CONFIG } from '../styles/theme';

interface CategoryCardProps {
  category: ActivityCategory;
  count?: number;
  isSelected?: boolean;
  onPress: (category: ActivityCategory) => void;
  compact?: boolean;
}

const ICON_MAP: Record<ActivityCategory, LucideIcon> = {
  Cardio: HeartPulse,
  'Strength Training': Dumbbell,
  Flexibility: Flower2,
  Sports: Trophy,
  'Outdoor Activities': Mountain,
  'Home Exercises': Home,
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  count,
  isSelected = false,
  onPress,
  compact = false,
}) => {
  const meta = CATEGORY_CONFIG[category];
  const IconComponent = ICON_MAP[category] || HeartPulse;

  if (compact) {
    return (
      <button
        id={`category-chip-${category.toLowerCase().replace(/\s+/g, '-')}`}
        type="button"
        onClick={() => onPress(category)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
          isSelected
            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isSelected ? 'bg-emerald-400' : ''
          }`}
          style={{ backgroundColor: isSelected ? undefined : meta.solidColor }}
        />
        <span>{category}</span>
        {count !== undefined && (
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {count}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      id={`category-card-${category.toLowerCase().replace(/\s+/g, '-')}`}
      type="button"
      onClick={() => onPress(category)}
      className={`relative flex flex-col items-start p-4 rounded-2xl transition-all text-left w-full border ${
        isSelected
          ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
          : 'bg-white text-slate-900 border-slate-100 hover:border-slate-200 hover:shadow-sm'
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform ${
          isSelected ? 'bg-white/10 text-white' : `${meta.badgeBg}`
        }`}
      >
        <IconComponent className="w-5 h-5" />
      </div>

      <span
        className={`text-sm font-bold tracking-tight mb-1 ${
          isSelected ? 'text-white' : 'text-slate-900'
        }`}
      >
        {category}
      </span>

      <p
        className={`text-xs line-clamp-1 mb-2 ${
          isSelected ? 'text-slate-300' : 'text-slate-500'
        }`}
      >
        {meta.description}
      </p>

      {count !== undefined && (
        <div className="mt-auto pt-1 flex items-center">
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              isSelected
                ? 'bg-white/15 text-slate-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {count} {count === 1 ? 'activity' : 'activities'}
          </span>
        </div>
      )}
    </button>
  );
};

export default CategoryCard;
