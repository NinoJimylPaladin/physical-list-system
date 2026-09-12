import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Flame,
  FileText,
  Dumbbell,
  Sparkles,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  PhysicalActivity,
  ActivityCategory,
  DifficultyLevel,
} from '../types/Activity';
import { activityService } from '../services/activityService';
import { ALL_CATEGORIES, ALL_DIFFICULTIES, CATEGORY_CONFIG } from '../styles/theme';

interface AddActivityScreenProps {
  activityId?: string; // If editing an existing activity
  initialCategory?: ActivityCategory;
  onGoBack: () => void;
  onSaveSuccess: (activity: PhysicalActivity) => void;
}

// Calorie burn approximation per minute per category & difficulty
const CALORIE_RATES: Record<ActivityCategory, Record<DifficultyLevel, number>> = {
  Cardio: { Beginner: 7, Intermediate: 10, Advanced: 13 },
  'Strength Training': { Beginner: 5, Intermediate: 7.5, Advanced: 10 },
  Flexibility: { Beginner: 3.5, Intermediate: 4.5, Advanced: 6 },
  Sports: { Beginner: 6, Intermediate: 8.5, Advanced: 11 },
  'Outdoor Activities': { Beginner: 5.5, Intermediate: 7.5, Advanced: 9.5 },
  'Home Exercises': { Beginner: 4.5, Intermediate: 6.5, Advanced: 8.5 },
};

export const AddActivityScreen: React.FC<AddActivityScreenProps> = ({
  activityId,
  initialCategory,
  onGoBack,
  onSaveSuccess,
}) => {
  const isEditing = Boolean(activityId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ActivityCategory>(initialCategory || 'Cardio');
  const [duration, setDuration] = useState<number | ''>(30);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Beginner');
  const [caloriesBurned, setCaloriesBurned] = useState<number | ''>(210);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If editing, load activity details
  useEffect(() => {
    if (activityId) {
      const loadExisting = async () => {
        setIsLoading(true);
        const act = await activityService.getActivityById(activityId);
        if (act) {
          setName(act.name);
          setDescription(act.description || '');
          setCategory(act.category);
          setDuration(act.duration);
          setDifficulty(act.difficulty);
          setCaloriesBurned(act.caloriesBurned);
          setDate(act.date);
          setIsCompleted(act.isCompleted);
        }
        setIsLoading(false);
      };
      loadExisting();
    }
  }, [activityId]);

  // Auto-estimate calories helper
  const handleAutoEstimateCalories = () => {
    const durNum = Number(duration) || 0;
    if (durNum <= 0) return;
    const rate = CALORIE_RATES[category]?.[difficulty] || 7;
    const estimated = Math.round(durNum * rate);
    setCaloriesBurned(estimated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please provide an activity name.');
      return;
    }

    const durNum = Number(duration);
    if (!durNum || durNum <= 0) {
      setError('Duration must be greater than 0 minutes.');
      return;
    }

    const calNum = Number(caloriesBurned);
    if (calNum < 0) {
      setError('Calories burned cannot be negative.');
      return;
    }

    if (!date) {
      setError('Please select a valid date.');
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && activityId) {
        const updated = await activityService.updateActivity(activityId, {
          name: trimmedName,
          description: description.trim(),
          category,
          duration: durNum,
          difficulty,
          caloriesBurned: calNum || 0,
          date,
          isCompleted,
        });
        onSaveSuccess(updated);
      } else {
        const created = await activityService.addActivity({
          name: trimmedName,
          description: description.trim(),
          category,
          duration: durNum,
          difficulty,
          caloriesBurned: calNum || 0,
          date,
          isCompleted,
        });
        onSaveSuccess(created);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save activity.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-16 overflow-y-auto bg-slate-50">
      {/* Top Header */}
      <div className="p-4 bg-white border-b border-slate-200/80 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            id="back-from-add-activity"
            type="button"
            onClick={onGoBack}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              {isEditing ? 'Edit Activity' : 'Add Physical Activity'}
            </h1>
            <p className="text-xs text-slate-500">
              {isEditing ? 'Update workout session details' : 'Log your session and metrics'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-5 max-w-lg mx-auto w-full space-y-4">
        {error && (
          <div
            id="form-error-alert"
            className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Name */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Activity Name *
          </label>
          <div className="relative">
            <Dumbbell className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-activity-name"
              type="text"
              placeholder="e.g. 5K Morning Run, Leg Day, Vinyasa Flow"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-900"
            />
          </div>
        </div>

        {/* Category Picker */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Category *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ALL_CATEGORIES.map((cat) => {
              const meta = CATEGORY_CONFIG[cat];
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  id={`select-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: meta.solidColor }}
                  />
                  <span className="text-xs font-bold truncate">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration & Preset Buttons */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Duration (Minutes) *
            </label>
            <div className="flex gap-1">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDuration(mins)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${
                    duration === mins
                      ? 'bg-sky-100 text-sky-700 border-sky-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  +{mins}m
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-activity-duration"
              type="number"
              min="1"
              max="600"
              placeholder="30"
              value={duration}
              onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))}
              required
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-900"
            />
          </div>
        </div>

        {/* Difficulty Level */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ALL_DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                id={`select-diff-${diff.toLowerCase()}`}
                type="button"
                onClick={() => setDifficulty(diff)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                  difficulty === diff
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Calories Burned & Auto-Calculate Helper */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Estimated Calories (kcal)
            </label>
            <button
              id="auto-estimate-calories-button"
              type="button"
              onClick={handleAutoEstimateCalories}
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200"
              title="Estimate based on activity category and duration"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Auto-Estimate</span>
            </button>
          </div>
          <div className="relative">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-activity-calories"
              type="number"
              min="0"
              placeholder="250"
              value={caloriesBurned}
              onChange={(e) => setCaloriesBurned(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-900"
            />
          </div>
        </div>

        {/* Date */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Activity Date
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-activity-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-900"
            />
          </div>
        </div>

        {/* Description / Notes */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Description & Notes
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <textarea
              id="input-activity-description"
              rows={3}
              placeholder="Exercises performed, sets, reps, pacing, equipment, or how you felt..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-900 resize-none"
            />
          </div>
        </div>

        {/* Mark as Completed Toggle */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-sm font-bold text-slate-900">
              Mark as Completed
            </span>
            <span className="text-xs text-slate-500">
              Did you already finish this activity?
            </span>
          </div>
          <button
            id="toggle-initial-completed-state"
            type="button"
            onClick={() => setIsCompleted(!isCompleted)}
            className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out ${
              isCompleted ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                isCompleted ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex gap-3">
          <button
            id="cancel-add-activity-button"
            type="button"
            onClick={onGoBack}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 font-bold text-sm text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            id="submit-activity-button"
            type="submit"
            disabled={isLoading}
            className="flex-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Update Activity' : 'Save Activity'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddActivityScreen;
