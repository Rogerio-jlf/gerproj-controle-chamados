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
  return (
    // div - principal
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-300 bg-white p-4 shadow-md shadow-black backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg hover:shadow-black">
      {/* div - icon e trend */}
      <div className="mb-4 flex items-center justify-between">
        {/* icon */}
        <div className={`rounded-lg p-3 shadow-md shadow-black ${color}`}>
          {icon}
        </div>
        {/* ---------- */}

        {/* trend */}
        {trend && (
          <div
            className={`flex items-center text-xl ${
              trend === 'up'
                ? 'text-green-600'
                : trend === 'down'
                  ? 'text-red-600'
                  : 'text-slate-600'
            }`}
          >
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '•'}
          </div>
        )}
        {/* ---------- */}
      </div>
      {/* ---------- */}

      {/* title */}
      <h3 className="text-sm font-semibold tracking-wider text-slate-600 select-none">
        {title}
      </h3>
      {/* ---------- */}

      {/* value */}
      <p
        className={`${
          size === 'large' ? 'text-4xl' : 'text-3xl'
        } font-bold tracking-wider text-slate-800 italic select-none`}
      >
        {value}
      </p>
      {/* ---------- */}

      {/* subtitle */}
      {subtitle && (
        <p className="text-sm font-semibold tracking-wider text-slate-600 select-none">
          {subtitle}
        </p>
      )}
      {/* ---------- */}
    </div>
  );
}
