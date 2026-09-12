import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  Calendar,
  Target,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { ProgressSummary } from '../types/Activity';
import { activityService } from '../services/activityService';
import { CATEGORY_CONFIG } from '../styles/theme';
import ProgressCard from '../components/ProgressCard';

interface ProgressScreenProps {
  onNavigateToActivities: () => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  onNavigateToActivities,
}) => {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(6); // Default to today (last item)

  const loadProgress = async () => {
    try {
      setIsLoading(true);
      const data = await activityService.getProgressSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load progress summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  if (isLoading || !summary) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-12 text-slate-400">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs">Computing workout analytics...</p>
      </div>
    );
  }

  // Weekly recommendation: 150 minutes of moderate activity per week (WHO guideline)
  const WEEKLY_TARGET_MINUTES = 150;
  const currentWeekMinutes = summary.weeklyBreakdown.reduce((sum, d) => sum + d.minutes, 0);
  const weeklyGoalPercent = Math.min(100, Math.round((currentWeekMinutes / WEEKLY_TARGET_MINUTES) * 100));

  // Max minutes in the week for relative bar heights
  const maxDayMinutes = Math.max(...summary.weeklyBreakdown.map((d) => d.minutes), 60);

  const selectedDay = selectedDayIndex !== null ? summary.weeklyBreakdown[selectedDayIndex] : null;

  return (
    <div className="flex flex-col flex-1 pb-24 overflow-y-auto">
      {/* Header */}
      <div className="p-5 pb-3 bg-white border-b border-slate-100 sticky top-0 z-20">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          Progress & Analytics
        </h1>
        <p className="text-xs text-slate-500">
          Your fitness consistency and performance overview
        </p>
      </div>

      <div className="p-5 space-y-4">
        {/* Core KPI Grid */}
        <div className="grid grid-cols-2 gap-3">
          <ProgressCard
            id="metric-completed-activities"
            title="Completed"
            value={summary.totalCompleted}
            unit={`of ${summary.totalActivities}`}
            icon={CheckCircle2}
            iconBgColor="bg-emerald-50"
            iconColor="text-emerald-600"
            subtitle={`${summary.completionRate}% completion rate`}
            progressPercent={summary.completionRate}
            progressColor="bg-emerald-500"
          />

          <ProgressCard
            id="metric-total-minutes"
            title="Exercise Time"
            value={summary.totalMinutes}
            unit="mins"
            icon={Clock}
            iconBgColor="bg-sky-50"
            iconColor="text-sky-600"
            subtitle="Total workout duration"
          />

          <ProgressCard
            id="metric-total-calories"
            title="Calories Burned"
            value={summary.totalCalories}
            unit="kcal"
            icon={Flame}
            iconBgColor="bg-amber-50"
            iconColor="text-amber-600"
            subtitle="Estimated energy output"
          />

          <ProgressCard
            id="metric-streak-card"
            title="Consistency"
            value="Active"
            icon={Award}
            iconBgColor="bg-purple-50"
            iconColor="text-purple-600"
            subtitle="7-day routine tracking"
            badge="On Track"
          />
        </div>

        {/* Weekly Goal Progress Indicator */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900">
                  Weekly 150-Min Target
                </span>
                <p className="text-[11px] text-slate-500">
                  WHO recommended aerobic baseline
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-sky-600">
              {currentWeekMinutes}/{WEEKLY_TARGET_MINUTES} min
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden mb-1.5">
            <div
              className="h-full rounded-full bg-linear-to-r from-sky-500 to-emerald-500 transition-all duration-700"
              style={{ width: `${weeklyGoalPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{weeklyGoalPercent}% accomplished</span>
            {weeklyGoalPercent >= 100 ? (
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <Sparkles className="w-3 h-3" /> Target reached!
              </span>
            ) : (
              <span>{WEEKLY_TARGET_MINUTES - currentWeekMinutes} mins left</span>
            )}
          </div>
        </div>

        {/* Weekly Activity Summary (Interactive 7-Day Bar Chart) */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Weekly Activity Summary
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Last 7 Days</span>
          </div>

          {/* Bar Chart Columns */}
          <div className="grid grid-cols-7 gap-2 items-end h-36 pt-4 pb-2 border-b border-slate-100">
            {summary.weeklyBreakdown.map((item, idx) => {
              const heightPercent =
                maxDayMinutes > 0 ? Math.max(8, (item.minutes / maxDayMinutes) * 100) : 8;
              const isSelected = selectedDayIndex === idx;

              return (
                <button
                  key={item.fullDate}
                  id={`weekly-bar-${item.day.toLowerCase()}`}
                  type="button"
                  onClick={() => setSelectedDayIndex(idx)}
                  className="flex flex-col items-center h-full justify-end group focus:outline-none"
                >
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-800 mb-1 transition-colors">
                    {item.minutes > 0 ? `${item.minutes}m` : '-'}
                  </span>
                  <div className="w-full max-w-[28px] h-full flex items-end">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        isSelected
                          ? 'bg-slate-900 shadow-xs'
                          : item.minutes > 0
                          ? 'bg-sky-400 group-hover:bg-sky-500'
                          : 'bg-slate-100'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span
                    className={`mt-2 text-[11px] font-semibold transition-colors ${
                      isSelected ? 'text-slate-900 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {item.day}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Day Details Inspector */}
          {selectedDay && (
            <div className="mt-3 p-3 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800">
                  {selectedDay.day}, {selectedDay.fullDate}
                </span>
                <p className="text-[11px] text-slate-500">
                  {selectedDay.completedCount} completed workouts
                </p>
              </div>
              <div className="text-right">
                <span className="font-black text-slate-900 text-sm">
                  {selectedDay.minutes} mins
                </span>
                <span className="block text-[11px] text-amber-600 font-semibold">
                  {selectedDay.calories} kcal
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Activity Category Breakdown */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Category Distribution
            </h2>
            <button
              id="view-activities-from-progress"
              type="button"
              onClick={onNavigateToActivities}
              className="text-xs font-semibold text-sky-600 hover:underline"
            >
              Explore all
            </button>
          </div>

          <div className="space-y-3">
            {summary.categoryBreakdown.map((cat) => {
              const meta = CATEGORY_CONFIG[cat.category];
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: meta.solidColor }}
                      />
                      <span className="font-semibold text-slate-800">
                        {cat.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="font-medium">{cat.count} logged</span>
                      <span className="font-bold text-slate-700">
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: meta.solidColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressScreen;
