'use client';
import React from 'react';
import {
  BarChart3,
  Target,
  DollarSign,
  Activity,
  TrendingUp,
  Calendar,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  mes: number;
  ano: number;
  setMes: (m: number) => void;
  setAno: (a: number) => void;
  tipoVisualizacao: string;
  setTipoVisualizacao: (t: any) => void;
}

export default function Header({
  mes,
  setMes,
  ano,
  setAno,
  tipoVisualizacao,
  setTipoVisualizacao,
}: HeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-r from-slate-50/95 via-white/90 to-blue-50/95 shadow-xl shadow-blue-900/10 backdrop-blur-xl">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/3 via-purple-600/3 to-indigo-600/3"></div>
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-2xl"></div>
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-tr from-indigo-400/10 to-cyan-400/10 blur-2xl"></div>

      {/* Content - Single Line Layout */}
      <div className="relative z-10 flex items-center justify-between gap-8 px-6 py-4">
        {/* Left Section - Title + Period */}
        <div className="flex items-center gap-8">
          {/* Compact Title */}
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/30">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                Performance
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(ano, mes - 1)
                    .toLocaleDateString('pt-BR', {
                      month: 'long',
                      year: 'numeric',
                    })
                    .replace(/^\w/, c => c.toUpperCase())}
                </span>
              </div>
            </div>
          </div>

          {/* Period Selectors */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold tracking-wider text-slate-600/70 uppercase">
              Filtro
            </span>

            {/* Month Selector */}
            <div className="group relative">
              <select
                value={mes}
                onChange={e => setMes(Number(e.target.value))}
                className="cursor-pointer appearance-none rounded-lg border border-slate-200/60 bg-white/80 py-2 pr-8 pl-4 text-sm font-medium text-slate-700 shadow-md shadow-slate-900/5 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:shadow-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const mesNome = new Date(2026, i)
                    .toLocaleDateString('pt-BR', { month: 'long' })
                    .replace(/^\w/, c => c.toUpperCase());
                  return (
                    <option key={i + 1} value={i + 1}>
                      {mesNome}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-3 w-3 -translate-y-1/2 text-slate-500 transition-colors group-hover:text-blue-600" />
            </div>

            {/* Year Selector */}
            <div className="group relative">
              <select
                value={ano}
                onChange={e => setAno(Number(e.target.value))}
                className="cursor-pointer appearance-none rounded-lg border border-slate-200/60 bg-white/80 py-2 pr-8 pl-4 text-sm font-medium text-slate-700 shadow-md shadow-slate-900/5 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:shadow-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option key={2026 - i} value={2026 - i}>
                    {2026 - i}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-3 w-3 -translate-y-1/2 text-slate-500 transition-colors group-hover:text-blue-600" />
            </div>
          </div>
        </div>

        {/* Right Section - Navigation Tabs */}
        <nav className="flex items-center gap-1 rounded-xl border border-white/40 bg-white/60 p-1 shadow-lg shadow-slate-900/5 backdrop-blur-sm">
          {[
            {
              key: 'overview',
              label: 'Visão Geral',
              shortLabel: 'Visão Geral',
              icon: <BarChart3 className="h-4 w-4" />,
            },
            {
              key: 'dashboard',
              label: 'Dashboard',
              shortLabel: 'Dashboard',
              icon: <TrendingUp className="h-4 w-4" />,
            },
            {
              key: 'clientes',
              label: 'Clientes',
              shortLabel: 'Clientes',
              icon: <Target className="h-4 w-4" />,
            },
            {
              key: 'recursos',
              label: 'Recursos',
              shortLabel: 'Recursos',
              icon: <Activity className="h-4 w-4" />,
            },
            {
              key: 'financeiro',
              label: 'Financeiro',
              shortLabel: 'Fin',
              icon: <DollarSign className="h-4 w-4" />,
            },
          ].map(({ key, label, shortLabel, icon }) => (
            <button
              key={key}
              onClick={() => setTipoVisualizacao(key)}
              className={`group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-300 ${
                tipoVisualizacao === key
                  ? 'scale-105 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-600 hover:scale-105 hover:bg-white/80 hover:text-slate-800 hover:shadow-md'
              }`}
              title={label}
            >
              <div
                className={`transition-transform duration-200 ${
                  tipoVisualizacao === key
                    ? 'scale-110'
                    : 'group-hover:scale-110'
                }`}
              >
                {icon}
              </div>

              {/* Show full label on larger screens, short on smaller */}
              <span className="hidden font-medium xl:block">{label}</span>
              <span className="font-medium xl:hidden">{shortLabel}</span>

              {/* Active indicator */}
              {tipoVisualizacao === key && (
                <div className="absolute -bottom-0.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-white/80"></div>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Subtle bottom border */}
      <div className="absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent"></div>
    </header>
  );
}
