import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  X,
  SlidersHorizontal,
  Dumbbell,
  CheckCircle2,
  Clock,
  Flame,
  RotateCcw,
} from 'lucide-react';
import {
  PhysicalActivity,
  ActivityCategory,
  DifficultyLevel,
} from '../types/Activity';
import { activityService } from '../services/activityService';
import { ALL_CATEGORIES, ALL_DIFFICULTIES } from '../styles/theme';
import ActivityCard from '../components/ActivityCard';
import CategoryCard from '../components/CategoryCard';

interface ActivitiesScreenProps {
  initialCategoryFilter?: ActivityCategory;
  onNavigateToAddActivity: () => void;
  onNavigateToDetails: (activityId: string) => void;
}

export const ActivitiesScreen: React.FC<ActivitiesScreenProps> = ({
  initialCategoryFilter,
  onNavigateToAddActivity,
  onNavigateToDetails,
}) => {
  const [activities, setActivities] = useState<PhysicalActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'All'>(
    initialCategoryFilter || 'All'
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Completed' | 'Pending'>('All');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Sync if prop changed
  useEffect(() => {
    if (initialCategoryFilter) {
      setSelectedCategory(initialCategoryFilter);
    }
  }, [initialCategoryFilter]);

  const loadActivities = async () => {
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
    loadActivities();
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

  const handleDeleteActivity = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await activityService.deleteActivity(id);
        setActivities((prev) => prev.filter((act) => act.id !== id));
      } catch (err) {
        console.error('Failed to delete activity:', err);
      }
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSelectedStatus('All');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedDifficulty !== 'All' ||
    selectedStatus !== 'All';

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // Search by name (and description)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = act.name.toLowerCase().includes(query);
        const matchDesc = act.description?.toLowerCase().includes(query);
        if (!matchName && !matchDesc) return false;
      }

      // Filter by category
      if (selectedCategory !== 'All' && act.category !== selectedCategory) {
        return false;
      }

      // Filter by difficulty
      if (selectedDifficulty !== 'All' && act.difficulty !== selectedDifficulty) {
        return false;
      }

      // Filter by completion status
      if (selectedStatus === 'Completed' && !act.isCompleted) {
        return false;
      }
      if (selectedStatus === 'Pending' && act.isCompleted) {
        return false;
      }

      return true;
    });
  }, [activities, searchQuery, selectedCategory, selectedDifficulty, selectedStatus]);

  // Aggregate metrics for filtered view
  const completedCount = filteredActivities.filter((a) => a.isCompleted).length;
  const totalDuration = filteredActivities.reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
  const totalCalories = filteredActivities.reduce((sum, a) => sum + (Number(a.caloriesBurned) || 0), 0);

  return (
    <div className="flex flex-col flex-1 pb-24 overflow-y-auto">
      {/* Header */}
      <div className="p-5 pb-3 bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Physical Activities
            </h1>
            <p className="text-xs text-slate-500">
              {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'} listed
            </p>
          </div>

          <button
            id="header-add-activity-button"
            type="button"
            onClick={onNavigateToAddActivity}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Activity</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-2.5">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="activities-search-input"
            type="text"
            placeholder="Search activities by name or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs text-slate-900 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              id="clear-search-button"
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categories Horizontal Scroll Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            id="category-chip-all"
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Categories ({activities.length})
          </button>

          {ALL_CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat}
              category={cat}
              compact
              isSelected={selectedCategory === cat}
              onPress={(catName) => setSelectedCategory(catName)}
              count={activities.filter((a) => a.category === cat).length}
            />
          ))}
        </div>

        {/* Secondary Filter Toggle Row */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
          <button
            id="toggle-filter-panel-button"
            type="button"
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`flex items-center gap-1.5 font-medium px-2.5 py-1 rounded-lg transition-colors ${
              isFilterPanelOpen || (selectedDifficulty !== 'All' || selectedStatus !== 'All')
                ? 'bg-sky-50 text-sky-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {(selectedDifficulty !== 'All' || selectedStatus !== 'All') && (
              <span className="w-2 h-2 rounded-full bg-sky-500" />
            )}
          </button>

          {hasActiveFilters && (
            <button
              id="clear-all-filters-button"
              type="button"
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors font-medium text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>

        {/* Expandable Advanced Filter Panel */}
        {isFilterPanelOpen && (
          <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            {/* Status Filter */}
            <div>
              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Completion Status
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['All', 'Completed', 'Pending'] as const).map((status) => (
                  <button
                    key={status}
                    id={`filter-status-${status.toLowerCase()}`}
                    type="button"
                    onClick={() => setSelectedStatus(status)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all ${
                      selectedStatus === status
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Difficulty Level
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {(['All', ...ALL_DIFFICULTIES] as const).map((diff) => (
                  <button
                    key={diff}
                    id={`filter-diff-${diff.toLowerCase()}`}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff as any)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all ${
                      selectedDifficulty === diff
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filtered Summary Pill Bar */}
      <div className="px-5 py-2.5 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{completedCount} completed</span>
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{totalDuration} min</span>
          </span>
          <span className="flex items-center gap-1 font-medium text-amber-600">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{totalCalories} kcal</span>
          </span>
        </div>
      </div>

      {/* Main List Content */}
      <div className="px-5 mt-1">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading activities...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-8 mt-4 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No activities found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {hasActiveFilters
                ? 'Try adjusting your search criteria or resetting filters.'
                : 'No physical activities have been logged yet.'}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {hasActiveFilters && (
                <button
                  id="empty-clear-filters-btn"
                  type="button"
                  onClick={clearAllFilters}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              )}
              <button
                id="empty-add-activity-btn"
                type="button"
                onClick={onNavigateToAddActivity}
                className="px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Activity</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredActivities.map((activity) => (
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
    </div>
  );
};

export default ActivitiesScreen;
