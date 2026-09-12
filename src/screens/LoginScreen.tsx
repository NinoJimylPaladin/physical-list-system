import React, { useState } from 'react';
import { Activity, Mail, Lock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { activityService } from '../services/activityService';
import { User } from '../types/Activity';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    // Basic form validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await activityService.loginUser(trimmedEmail, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setEmail('alex.fitness@example.com');
    setPassword('fitness123');
    setIsLoading(true);
    try {
      const user = await activityService.loginUser('alex.fitness@example.com', 'fitness123');
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 justify-between p-6 max-w-md mx-auto w-full min-h-[560px]">
      {/* Top Branding */}
      <div className="pt-4 pb-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-sky-500 to-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-md text-white">
          <Activity className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Physical Activity List
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track workouts, achieve goals, and stay active daily.
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Welcome Back</h2>

        {error && (
          <div
            id="login-error-alert"
            className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-email-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            id="login-submit-button"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100" />
          </div>
          <span className="relative px-3 bg-white text-xs font-semibold text-slate-400">
            Or quick demo
          </span>
        </div>

        {/* Quick Demo Login */}
        <button
          id="quick-demo-login-button"
          type="button"
          onClick={handleQuickDemoLogin}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl border border-sky-200 bg-sky-50/60 hover:bg-sky-50 text-sky-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
        >
          <CheckCircle className="w-4 h-4 text-sky-600" />
          <span>Quick Demo Login (Alex Rivera)</span>
        </button>
      </div>

      {/* Switch to Register */}
      <div className="py-4 text-center">
        <p className="text-xs text-slate-500">
          Don't have an account?{' '}
          <button
            id="switch-to-register-button"
            type="button"
            onClick={onNavigateToRegister}
            className="font-bold text-sky-600 hover:underline inline-flex items-center gap-0.5"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
