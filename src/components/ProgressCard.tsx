import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ProgressCardProps {
  id?: string;
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  subtitle?: string;
  progressPercent?: number; // 0 to 100
  progressColor?: string;
  badge?: string;
  onClick?: () => void;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  id,
  title,
  value,
  unit,
  icon: Icon,
  iconBgColor = 'bg-sky-50',
  iconColor = 'text-sky-600',
  subtitle,
  progressPercent,
  progressColor = 'bg-sky-500',
  badge,
  onClick,
}) => {
  return (
    <div
      id={id || `progress-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      className={`p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBgColor} ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </span>
        </div>

        {badge && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-2xl font-black tracking-tight text-slate-900">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-semibold text-slate-500">
            {unit}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 font-medium">
          {subtitle}
        </p>
      )}

      {progressPercent !== undefined && (
        <div className="mt-3">
          <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 mb-1">
            <span>Progress</span>
            <span>{Math.min(100, Math.max(0, Math.round(progressPercent)))}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressCard;
