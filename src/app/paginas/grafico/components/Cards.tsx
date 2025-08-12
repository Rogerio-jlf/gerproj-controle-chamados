'use client';
import React from 'react';

interface CardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
  size?: 'normal' | 'large';
}

export default function Cards({
  icon,
  title,
  value,
  subtitle,
  trend,
  color = '',
  size = 'normal',
}: CardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 17l9.2-9.2M17 17V7H7"
            />
          </svg>
        );
      case 'down':
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 7l-9.2 9.2M7 7v10h10"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        );
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-emerald-600 bg-emerald-50/80 border-emerald-200/50';
      case 'down':
        return 'text-red-600 bg-red-50/80 border-red-200/50';
      default:
        return 'text-slate-600 bg-slate-50/80 border-slate-200/50';
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-white/95 via-white/90 to-slate-50/95 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:border-white/50 hover:shadow-2xl hover:shadow-slate-900/10">
      {/* Background decorative elements */}
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-100/30 to-purple-100/30 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"></div>
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-tr from-indigo-100/30 to-cyan-100/30 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"></div>

      {/* Subtle border animation */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header com ícone e trend */}
        <div className="mb-6 flex items-start justify-between">
          {/* Ícone container */}
          <div
            className={`relative rounded-2xl border border-white/40 p-4 shadow-lg shadow-slate-900/10 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl ${color || 'bg-gradient-to-br from-blue-500/90 to-indigo-600/90'}`}
          >
            <div className="text-white">{icon}</div>
            {/* Shine effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          </div>

          {/* Trend indicator */}
          {trend && (
            <div
              className={`flex items-center gap-1 rounded-xl border px-3 py-2 backdrop-blur-sm transition-all duration-300 ${getTrendColor()}`}
            >
              <div className="transition-transform duration-300 group-hover:scale-110">
                {getTrendIcon()}
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="mb-3">
          <h3 className="text-sm font-semibold tracking-wider text-slate-500/80 uppercase transition-colors duration-300 select-none group-hover:text-slate-600">
            {title}
          </h3>
        </div>

        {/* Value */}
        <div className="mb-4">
          <p
            className={`${
              size === 'large' ? 'text-5xl' : 'text-4xl'
            } bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text font-black tracking-tight text-transparent transition-all duration-300 select-none group-hover:from-blue-700 group-hover:via-indigo-700 group-hover:to-purple-700`}
          >
            {value}
          </p>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 rounded-full bg-gradient-to-r from-blue-500/60 to-transparent transition-all duration-300 group-hover:w-8 group-hover:from-blue-500"></div>
            <p className="text-sm font-medium text-slate-600/80 transition-colors duration-300 select-none group-hover:text-slate-700">
              {subtitle}
            </p>
          </div>
        )}

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 h-1 w-0 rounded-t-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 transition-all duration-500 group-hover:w-full"></div>
      </div>
    </div>
  );
}
