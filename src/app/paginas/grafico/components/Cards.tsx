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
  color = '',
  size = 'normal',
}: CardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-black backdrop-blur-xl transition-all duration-500 hover:scale-105">
      {/* Subtle border animation */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header com ícone e trend */}
        <div className="mb-6 flex items-start justify-between">
          {/* Ícone container */}
          <div
            className={`relative rounded-2xl p-4 shadow-md shadow-black backdrop-blur-sm transition-all duration-300 group-hover:scale-110 ${color}`}
          >
            <div className="text-white">{icon}</div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-3">
          <h3 className="text-sm font-semibold tracking-wider text-slate-600 uppercase italic transition-colors duration-300 select-none group-hover:text-slate-600">
            {title}
          </h3>
        </div>

        {/* Value */}
        <div className="mb-4">
          <p
            className={`${
              size === 'large' ? 'text-5xl' : 'text-4xl'
            } bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text font-bold tracking-wider text-transparent transition-all duration-300 select-none group-hover:from-blue-700 group-hover:via-indigo-700 group-hover:to-purple-700`}
          >
            {value}
          </p>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 rounded-full bg-gradient-to-r from-blue-500/60 to-transparent transition-all duration-300 group-hover:w-8 group-hover:from-blue-500"></div>
            <p className="text-sm font-semibold text-slate-600 italic transition-colors duration-300 select-none group-hover:text-slate-600">
              {subtitle}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
