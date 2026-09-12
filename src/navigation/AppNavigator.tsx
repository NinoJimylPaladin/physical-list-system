import React, { useState, useEffect } from 'react';
import {
  Home as HomeIcon,
  ListFilter,
  TrendingUp,
  User as UserIcon,
  Smartphone,
  Maximize2,
  Minimize2,
  Wifi,
  Battery,
} from 'lucide-react';
import {
  ScreenName,
  NavigationRoute,
  User,
  ActivityCategory,
} from '../types/Activity';
import { activityService } from '../services/activityService';

// Import Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ActivitiesScreen from '../screens/ActivitiesScreen';
import AddActivityScreen from '../screens/AddActivityScreen';
import ActivityDetailsScreen from '../screens/ActivityDetailsScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';

export const AppNavigator: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Navigation state & stack history
  const [route, setRoute] = useState<NavigationRoute>({ name: 'Home' });
  const [routeStack, setRouteStack] = useState<NavigationRoute[]>([{ name: 'Home' }]);
  const [activeTab, setActiveTab] = useState<'Home' | 'Activities' | 'Progress' | 'Profile'>('Home');

  // Device framing toggle for desktop preview
  const [isMobileFramed, setIsMobileFramed] = useState<boolean>(true);

  // Load active user session on boot
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await activityService.getCurrentUser();
        setCurrentUser(user);
        if (!user) {
          setRoute({ name: 'Login' });
          setRouteStack([{ name: 'Login' }]);
        }
      } catch (err) {
        console.error('Error initializing user session:', err);
      } finally {
        setIsAuthChecking(false);
      }
    };
    initAuth();
  }, []);

  const navigate = (name: ScreenName, params?: NavigationRoute['params']) => {
    const newRoute: NavigationRoute = { name, params };
    setRoute(newRoute);
    setRouteStack((prev) => [...prev, newRoute]);

    // If navigating to one of the main bottom tabs, update activeTab
    if (['Home', 'Activities', 'Progress', 'Profile'].includes(name)) {
      setActiveTab(name as any);
    }
  };

  const goBack = () => {
    if (routeStack.length > 1) {
      const newStack = [...routeStack];
      newStack.pop(); // remove current
      const previousRoute = newStack[newStack.length - 1];
      setRouteStack(newStack);
      setRoute(previousRoute);

      if (['Home', 'Activities', 'Progress', 'Profile'].includes(previousRoute.name)) {
        setActiveTab(previousRoute.name as any);
      }
    } else {
      // Default to Home
      navigate('Home');
    }
  };

  const handleTabPress = (tabName: 'Home' | 'Activities' | 'Progress' | 'Profile') => {
    setActiveTab(tabName);
    navigate(tabName);
  };

  const handleLogout = async () => {
    await activityService.logoutUser();
    setCurrentUser(null);
    setRoute({ name: 'Login' });
    setRouteStack([{ name: 'Login' }]);
  };

  const handleResetData = async () => {
    await activityService.resetSampleData();
    // Refresh to home
    navigate('Home');
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">
            Starting Physical Activity List...
          </span>
        </div>
      </div>
    );
  }

  // Determine whether to show bottom tab bar
  const showBottomTabs =
    currentUser !== null &&
    ['Home', 'Activities', 'Progress', 'Profile'].includes(route.name);

  // Status bar real-time clock
  const currentTimeStr = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="min-h-screen bg-slate-100/80 flex flex-col items-center justify-center md:p-4 text-slate-900 font-sans antialiased selection:bg-sky-500 selection:text-white">
      {/* Top Device Viewport Controls for Desktop Testing */}
      <div className="hidden md:flex items-center justify-between w-full max-w-md mb-2 px-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <Smartphone className="w-4 h-4 text-sky-600" />
          <span>Physical Activity List (Expo / Mobile Preview)</span>
        </div>
        <button
          id="toggle-device-frame-button"
          type="button"
          onClick={() => setIsMobileFramed(!isMobileFramed)}
          className="flex items-center gap-1 hover:text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs transition-colors"
        >
          {isMobileFramed ? (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full View</span>
            </>
          ) : (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Phone Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Main Mobile App Container */}
      <div
        className={`w-full bg-white flex flex-col relative transition-all duration-200 overflow-hidden ${
          isMobileFramed
            ? 'md:max-w-[420px] md:h-[860px] md:max-h-[92vh] md:rounded-[44px] md:shadow-2xl md:border-[8px] md:border-slate-800 ring-1 ring-slate-900/10'
            : 'max-w-xl min-h-screen md:rounded-2xl md:shadow-lg md:border border-slate-200'
        }`}
      >
        {/* Mobile Device Status Bar (when framed or on desktop) */}
        <div className="bg-white px-6 pt-3 pb-1 flex items-center justify-between text-xs text-slate-800 font-semibold select-none z-30 shrink-0">
          <span>{currentTimeStr}</span>
          {/* Dynamic Island / Speaker Pill */}
          <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto -mt-1 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800" />
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Screen Router Views */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50">
          {!currentUser ? (
            route.name === 'Register' ? (
              <RegisterScreen
                onRegisterSuccess={(user) => {
                  setCurrentUser(user);
                  navigate('Home');
                }}
                onNavigateToLogin={() => navigate('Login')}
              />
            ) : (
              <LoginScreen
                onLoginSuccess={(user) => {
                  setCurrentUser(user);
                  navigate('Home');
                }}
                onNavigateToRegister={() => navigate('Register')}
              />
            )
          ) : (
            <>
              {route.name === 'Home' && (
                <HomeScreen
                  user={currentUser}
                  onNavigateToActivities={(cat) =>
                    navigate('Activities', { categoryFilter: cat })
                  }
                  onNavigateToAddActivity={() => navigate('AddActivity')}
                  onNavigateToDetails={(actId) =>
                    navigate('ActivityDetails', { activityId: actId })
                  }
                  onNavigateToProgress={() => handleTabPress('Progress')}
                />
              )}

              {route.name === 'Activities' && (
                <ActivitiesScreen
                  initialCategoryFilter={route.params?.categoryFilter}
                  onNavigateToAddActivity={() => navigate('AddActivity')}
                  onNavigateToDetails={(actId) =>
                    navigate('ActivityDetails', { activityId: actId })
                  }
                />
              )}

              {route.name === 'AddActivity' && (
                <AddActivityScreen
                  activityId={route.params?.activityId}
                  initialCategory={route.params?.categoryFilter}
                  onGoBack={goBack}
                  onSaveSuccess={() => {
                    if (route.params?.activityId) {
                      navigate('ActivityDetails', {
                        activityId: route.params.activityId,
                      });
                    } else {
                      navigate('Activities');
                    }
                  }}
                />
              )}

              {route.name === 'ActivityDetails' && (
                <ActivityDetailsScreen
                  activityId={route.params?.activityId || ''}
                  onGoBack={goBack}
                  onNavigateToEdit={(actId) =>
                    navigate('AddActivity', { activityId: actId, editMode: true })
                  }
                  onActivityDeleted={() => navigate('Activities')}
                />
              )}

              {route.name === 'Progress' && (
                <ProgressScreen
                  onNavigateToActivities={() => handleTabPress('Activities')}
                />
              )}

              {route.name === 'Profile' && (
                <ProfileScreen
                  user={currentUser}
                  onLogout={handleLogout}
                  onProfileUpdated={(updated) => setCurrentUser(updated)}
                  onResetData={handleResetData}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation Tab Bar */}
        {showBottomTabs && (
          <nav
            id="bottom-tab-navigation"
            aria-label="Bottom Navigation"
            className="bg-white border-t border-slate-200/80 px-4 py-2 flex items-center justify-around z-30 shrink-0 shadow-lg"
          >
            {/* Home Tab */}
            <button
              id="tab-button-home"
              type="button"
              onClick={() => handleTabPress('Home')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                activeTab === 'Home'
                  ? 'text-sky-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  activeTab === 'Home' ? 'bg-sky-50 text-sky-600' : ''
                }`}
              >
                <HomeIcon className="w-5 h-5" />
              </div>
              <span className="text-[11px]">Home</span>
            </button>

            {/* Activities Tab */}
            <button
              id="tab-button-activities"
              type="button"
              onClick={() => handleTabPress('Activities')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                activeTab === 'Activities'
                  ? 'text-sky-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  activeTab === 'Activities' ? 'bg-sky-50 text-sky-600' : ''
                }`}
              >
                <ListFilter className="w-5 h-5" />
              </div>
              <span className="text-[11px]">Activities</span>
            </button>

            {/* Progress Tab */}
            <button
              id="tab-button-progress"
              type="button"
              onClick={() => handleTabPress('Progress')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                activeTab === 'Progress'
                  ? 'text-sky-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  activeTab === 'Progress' ? 'bg-sky-50 text-sky-600' : ''
                }`}
              >
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[11px]">Progress</span>
            </button>

            {/* Profile Tab */}
            <button
              id="tab-button-profile"
              type="button"
              onClick={() => handleTabPress('Profile')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                activeTab === 'Profile'
                  ? 'text-sky-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  activeTab === 'Profile' ? 'bg-sky-50 text-sky-600' : ''
                }`}
              >
                <UserIcon className="w-5 h-5" />
              </div>
              <span className="text-[11px]">Profile</span>
            </button>
          </nav>
        )}

        {/* Bottom Home Indicator Bar (iOS style bar at bottom) */}
        {isMobileFramed && (
          <div className="bg-white py-1 flex justify-center z-30">
            <div className="w-32 h-1 bg-slate-300 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AppNavigator;
