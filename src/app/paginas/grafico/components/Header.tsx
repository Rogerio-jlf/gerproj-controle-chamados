'use client';
import React from 'react';
import {
  BarChart3,
  Target,
  DollarSign,
  Activity,
  TrendingUp,
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
    <header className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-slate-50/95 via-white/90 to-blue-50/95 p-6 shadow-2xl shadow-blue-900/10 backdrop-blur-xl">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-indigo-400/20 to-cyan-400/20 blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Título e subtítulo */}
        <div className="mb-8 flex flex-col space-y-2">
          <h1 className="bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-800 bg-clip-text text-6xl font-black tracking-tight text-transparent select-none">
            Dashboard de Performance
          </h1>

          <div className="flex items-center gap-3">
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <p className="text-lg font-medium text-slate-600/80 select-none">
              Dashboard Executivo de Recursos •{' '}
              <span className="font-semibold text-slate-700">
                {new Date(ano, mes - 1)
                  .toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric',
                  })
                  .replace(/^\w/, c => c.toUpperCase())}
              </span>
            </p>
          </div>
        </div>

        {/* Controles e navegação */}
        <div className="flex items-center justify-between">
          {/* Seletores de período */}
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold tracking-wider text-slate-600/70 uppercase select-none">
              Período
            </span>

            <div className="flex items-center gap-3">
              {/* Selector de mês */}
              <div className="group relative">
                <select
                  id="mes-select"
                  value={mes}
                  onChange={e => setMes(Number(e.target.value))}
                  className="cursor-pointer appearance-none rounded-xl border border-slate-200/50 bg-white/80 px-5 py-3 pr-10 text-base font-semibold text-slate-700 shadow-lg shadow-slate-900/5 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-blue-900/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2026, i).toLocaleDateString('pt-BR', {
                        month: 'long',
                      })}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 transition-colors group-hover:text-blue-600">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Selector de ano */}
              <div className="group relative">
                <select
                  id="ano-select"
                  value={ano}
                  onChange={e => setAno(Number(e.target.value))}
                  className="cursor-pointer appearance-none rounded-xl border border-slate-200/50 bg-white/80 px-5 py-3 pr-10 text-base font-semibold text-slate-700 shadow-lg shadow-slate-900/5 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-blue-900/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                >
                  {Array.from({ length: 3 }, (_, i) => (
                    <option key={2026 - i} value={2026 - i}>
                      {2026 - i}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 transition-colors group-hover:text-blue-600">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Navegação por tabs */}
          <nav className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/60 p-1 shadow-lg shadow-slate-900/5 backdrop-blur-sm">
            {[
              {
                key: 'consolidado',
                label: 'Consolidado',
                icon: <TrendingUp className="h-4 w-4" />,
              },
              {
                key: 'overview',
                label: 'Visão Geral',
                icon: <BarChart3 className="h-4 w-4" />,
              },
              {
                key: 'performance',
                label: 'Performance',
                icon: <Target className="h-4 w-4" />,
              },
              {
                key: 'financeiro',
                label: 'Financeiro',
                icon: <DollarSign className="h-4 w-4" />,
              },
              {
                key: 'tabela performance',
                label: 'Tabela Performance',
                icon: <Activity className="h-4 w-4" />,
              },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setTipoVisualizacao(key)}
                className={`relative flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  tipoVisualizacao === key
                    ? 'scale-105 transform bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-600 hover:scale-105 hover:bg-white/80 hover:text-slate-800 hover:shadow-md hover:shadow-slate-900/10'
                }`}
                role="tab"
                type="button"
                title={label}
              >
                <div
                  className={`transition-transform duration-300 ${
                    tipoVisualizacao === key
                      ? 'scale-110'
                      : 'group-hover:scale-110'
                  }`}
                >
                  {icon}
                </div>
                <span className="font-medium tracking-wide">{label}</span>

                {/* Indicator para tab ativa */}
                {tipoVisualizacao === key && (
                  <div className="absolute -bottom-1 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-white/80"></div>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
