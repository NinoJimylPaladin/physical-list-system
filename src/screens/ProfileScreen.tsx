import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Heart,
  LogOut,
  RotateCcw,
  ShieldCheck,
  Award,
  Bell,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { User, ActivityCategory } from '../types/Activity';
import { activityService } from '../services/activityService';
import { ALL_CATEGORIES, CATEGORY_CONFIG } from '../styles/theme';

interface ProfileScreenProps {
  user: User | null;
  onLogout: () => void;
  onProfileUpdated: (updatedUser: User) => void;
  onResetData: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onLogout,
  onProfileUpdated,
  onResetData,
}) => {
  const [preferredCategory, setPreferredCategory] = useState<ActivityCategory>(
    user?.preferredCategory || 'Cardio'
  );
  const [isSavingPref, setIsSavingPref] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [reminderNotifications, setReminderNotifications] = useState(true);

  const handleCategoryChange = async (cat: ActivityCategory) => {
    setPreferredCategory(cat);
    setIsSavingPref(true);
    try {
      const updated = await activityService.updateUserProfile({
        preferredCategory: cat,
      });
      onProfileUpdated(updated);
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 2000);
    } catch (err) {
      console.error('Failed to update preferred category:', err);
    } finally {
      setIsSavingPref(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      onLogout();
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Reset sample activities to original default state? This will refresh all demo logs.'
      )
    ) {
      onResetData();
    }
  };

  // User initials
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'PA';

  return (
    <div className="flex flex-col flex-1 pb-24 overflow-y-auto">
      {/* Top Header */}
      <div className="p-5 pb-3 bg-white border-b border-slate-100 sticky top-0 z-20">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          User Profile
        </h1>
        <p className="text-xs text-slate-500">
          Account details and workout preferences
        </p>
      </div>

      <div className="p-5 space-y-4 max-w-lg mx-auto w-full">
        {/* Profile Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-slate-900 truncate">
              {user?.name || 'Athlete'}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 truncate">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{user?.email || 'user@example.com'}</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Verified Account</span>
            </div>
          </div>
        </div>

        {/* Preferred Activity Category */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>Preferred Activity Category</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Your favorite training modality for smart recommendations
              </p>
            </div>
            {showSavedToast && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                <Check className="w-3 h-3" /> Saved
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {ALL_CATEGORIES.map((cat) => {
              const meta = CATEGORY_CONFIG[cat];
              const isSelected = preferredCategory === cat;
              return (
                <button
                  key={cat}
                  id={`pref-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  disabled={isSavingPref}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
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

        {/* Preferences / Toggles */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Application Settings
          </h3>

          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Daily Workout Reminders
                </span>
                <span className="text-[11px] text-slate-500">
                  Notify me to log daily exercise
                </span>
              </div>
            </div>

            <button
              id="toggle-reminders-button"
              type="button"
              onClick={() => setReminderNotifications(!reminderNotifications)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                reminderNotifications ? 'bg-sky-500' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                  reminderNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Reset Sample Activities
                </span>
                <span className="text-[11px] text-slate-500">
                  Restore default initial fitness demo data
                </span>
              </div>
            </div>

            <button
              id="reset-demo-data-button"
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Fitness Membership & App Info */}
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200/60 text-xs text-slate-600 space-y-1">
          <div className="flex justify-between">
            <span className="font-medium">App Name</span>
            <span className="font-bold text-slate-800">Physical Activity List</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Member Since</span>
            <span className="font-bold text-slate-800">{user?.joinedDate || '2025-01-15'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Storage Engine</span>
            <span className="font-bold text-slate-800">AsyncStorage Local Layer</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          id="profile-logout-button"
          type="button"
          onClick={handleLogout}
          className="w-full py-3 px-4 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 active:scale-[0.99] text-rose-700 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;
