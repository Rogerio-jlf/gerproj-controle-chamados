'use client';
import React from 'react';
import {
  BarChart3,
  Target,
  DollarSign,
  Activity,
  TrendingUp,
  Filter,
} from 'lucide-react';
// ==================================================

interface HeaderProps {
  mes: number;
  setMes: (m: number) => void;
  ano: number;
  setAno: (a: number) => void;
  tipoVisualizacao: string;
  setTipoVisualizacao: (t: any) => void;
}
// ==================================================

export default function Header({
  mes,
  setMes,
  ano,
  setAno,
  tipoVisualizacao,
  setTipoVisualizacao,
}: HeaderProps) {
  // ====================================================================================================
  return (
    <header className="rounded-2xl border-t border-slate-200 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 shadow-md shadow-black">
      <div className="flex items-center justify-between gap-8 p-4">
        <div className="flex items-center justify-center gap-4">
          {/* ===== items da esquerda ===== */}
          <div className="flex items-center gap-6">
            {/* ícone */}
            <Filter className="text-white" size={40} />
            {/* <div className="flex flex-col">
              <h1 className="bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-3xl font-extrabold tracking-wider text-transparent select-none">
                Performance
              </h1>
            </div> */}
          </div>

          {/* ===== filtros ===== */}
          <div className="flex items-center justify-center gap-4">
            {/* select mês */}
            <div className="group relative">
              <select
                value={mes}
                onChange={e => setMes(Number(e.target.value))}
                className="cursor-pointer rounded-md border-t border-slate-200 bg-white px-6 py-2 text-base font-semibold text-slate-800 shadow-xs shadow-black transition-all hover:scale-105 hover:shadow-md hover:shadow-black focus:outline-none"
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
            </div>

            {/* select ano */}
            <div className="group relative">
              <select
                value={ano}
                onChange={e => setAno(Number(e.target.value))}
                className="cursor-pointer rounded-md border-t border-slate-200 bg-white px-6 py-2 text-base font-semibold text-slate-800 shadow-xs shadow-black transition-all hover:scale-105 hover:shadow-md hover:shadow-black focus:outline-none"
              >
                {Array.from({ length: 3 }, (_, i) => (
                  <option key={2026 - i} value={2026 - i}>
                    {2026 - i}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ===== itens da direita ===== */}
        <nav className="flex items-center justify-center gap-4">
          {/* <nav className="flex items-center justify-center gap-1 rounded-md bg-white px-4 py-2 shadow-xs shadow-black"> */}
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
              className={`group relative flex items-center justify-center gap-4 rounded-md border-t border-slate-200 px-4 py-2 text-base font-semibold shadow-xs shadow-black transition-all ${
                tipoVisualizacao === key
                  ? 'bg-black text-white hover:scale-105 hover:shadow-md hover:shadow-black'
                  : 'bg-white/60 text-slate-800 hover:scale-105 hover:bg-slate-600 hover:text-white hover:shadow-md hover:shadow-black'
              }`}
              title={label}
            >
              <div>{icon}</div>

              {/* telas maiores e telas menores */}
              <span className="hidden font-medium xl:block">{label}</span>
              <span className="font-medium xl:hidden">{shortLabel}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
