'use client';
import React from 'react';
import { BarChart3, Target, DollarSign, Activity } from 'lucide-react';

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
    <header className="flex flex-col gap-4 rounded-2xl border border-slate-300 bg-white p-4 shadow-md shadow-black backdrop-blur-sm">
      {/* div - título e subtítulo */}
      <div className="mb-2 flex flex-col">
        {/* título */}
        <h1 className="text-5xl leading-tight font-extrabold tracking-wider text-blue-600 select-none">
          Dashboard de Performance
        </h1>
        {/* ---------- */}

        {/* subtítulo */}
        <p className="text-lg font-semibold tracking-wider text-slate-600 italic select-none">
          Dashboard Executivo de Recursos •{' '}
          {new Date(ano, mes - 1)
            .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
            .replace(/^\w/, c => c.toUpperCase())}
        </p>
        {/* ---------- */}
      </div>

      {/* div - selects filtros e botões navegação */}
      <div className="flex items-center justify-between">
        {/* div mês e ano */}
        <div className="flex items-center justify-between gap-4">
          {/* label */}
          <label
            htmlFor="mes-select"
            className="text-sm font-semibold tracking-wider text-slate-600 select-none"
          >
            Período:
          </label>
          {/* ---------- */}

          {/* mês */}
          <select
            id="mes-select"
            value={mes}
            onChange={e => setMes(Number(e.target.value))}
            className="cursor-pointer rounded-md bg-white px-6 py-1 text-lg font-semibold tracking-wider text-slate-600 italic shadow-md shadow-black hover:shadow-lg hover:shadow-black focus:outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2026, i).toLocaleDateString('pt-BR', {
                  month: 'long',
                })}
              </option>
            ))}
          </select>
          {/* ---------- */}

          {/* ano */}
          <select
            id="ano-select"
            value={ano}
            onChange={e => setAno(Number(e.target.value))}
            className="cursor-pointer rounded-md bg-white px-6 py-1 text-lg font-semibold tracking-wider text-slate-600 italic shadow-md shadow-black hover:shadow-lg hover:shadow-black focus:outline-none"
          >
            {Array.from({ length: 3 }, (_, i) => (
              <option key={2026 - i} value={2026 - i}>
                {2026 - i}
              </option>
            ))}
          </select>
          {/* ---------- */}
        </div>

        {/* nav - botões de navegação */}
        <nav className="flex items-center justify-between gap-3">
          {[
            {
              key: 'overview',
              label: 'Visão Geral',
              icon: <BarChart3 className="h-5 w-5" />,
            },
            {
              key: 'performance',
              label: 'Performance',
              icon: <Target className="h-5 w-5" />,
            },
            {
              key: 'financeiro',
              label: 'Financeiro',
              icon: <DollarSign className="h-5 w-5" />,
            },
            {
              key: 'tabela performance',
              label: 'Tabela Performance',
              icon: <Activity className="h-5 w-5" />,
            },
          ].map(({ key, label, icon }) => (
            // botão
            <button
              key={key}
              onClick={() => setTipoVisualizacao(key)}
              className={`flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 px-6 py-2 text-base font-semibold transition-all ${
                tipoVisualizacao === key
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-800 text-white'
                  : 'text-slate-600 hover:scale-105 hover:bg-slate-100 hover:font-bold hover:text-slate-800 hover:shadow-md hover:shadow-black'
              }`}
              role="tab"
              type="button"
              title={label}
            >
              {icon}
              <span>{label}</span>
            </button>
            // ----------
          ))}
        </nav>
        {/* ---------- */}
      </div>
      {/* ---------- */}
    </header>
  );
}
