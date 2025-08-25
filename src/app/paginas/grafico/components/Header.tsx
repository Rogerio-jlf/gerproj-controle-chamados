'use client';
import React from 'react';
import { FaFilter } from 'react-icons/fa';
import { FaChartBar } from 'react-icons/fa6';
import { RiDashboardHorizontalFill } from 'react-icons/ri';
import { FaUsers } from 'react-icons/fa';
import { ImUsers } from 'react-icons/im';
import { FaMoneyBillTransfer } from 'react-icons/fa6';
// ====================================================================================================

interface Props {
  title: string;
  mes: number;
  setMes: (m: number) => void;
  ano: number;
  setAno: (a: number) => void;
  tipoVisualizacao: string;
  setTipoVisualizacao: (t: any) => void;
}
// ====================================================================================================

export default function Header({
  title,
  mes,
  setMes,
  ano,
  setAno,
  tipoVisualizacao,
  setTipoVisualizacao,
}: Props) {
  // ====================================================================================================
  return (
    <header className="flex flex-col">
      <h1 className="mb-6 text-5xl font-extrabold tracking-widest text-gray-900 italic select-none">
        {title}
      </h1>
      {/* ===== */}
      <main className="flex items-center justify-between gap-8 rounded-md bg-gray-800 p-4 shadow-md shadow-black">
        {/* ===== items da esquerda ===== */}
        <section className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-6">
            {/* ícone */}
            <FaFilter className="text-white" size={40} />
          </div>

          {/* ===== filtros ===== */}
          <div className="flex items-center justify-center gap-4">
            {/* select mês */}
            <div className="group relative flex flex-col items-start justify-center space-y-1">
              <label className="text-base font-semibold tracking-wider text-white select-none">
                Mês
              </label>
              <select
                value={mes}
                onChange={e => setMes(Number(e.target.value))}
                className="cursor-pointer rounded-md bg-white px-6 py-2 text-base font-semibold text-gray-900 transition-all hover:scale-105 hover:shadow-lg hover:shadow-black focus:outline-none"
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
            <div className="group relative flex flex-col items-start justify-center space-y-1">
              <label className="text-base font-semibold tracking-wider text-white select-none">
                Ano
              </label>
              <select
                value={ano}
                onChange={e => setAno(Number(e.target.value))}
                className="cursor-pointer rounded-md bg-white px-6 py-2 text-base font-semibold text-gray-900 transition-all hover:scale-105 hover:shadow-lg hover:shadow-black focus:outline-none"
              >
                {Array.from({ length: 3 }, (_, i) => (
                  <option key={2026 - i} value={2026 - i}>
                    {2026 - i}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ===== itens da direita ===== */}
        <nav className="flex items-center justify-center gap-4">
          {[
            {
              key: 'overview',
              label: 'Visão Geral',
              icon: <FaChartBar size={20} />,
            },
            {
              key: 'dashboard',
              label: 'Dashboard',
              icon: <RiDashboardHorizontalFill size={20} />,
            },
            {
              key: 'clientes',
              label: 'Clientes',
              icon: <FaUsers size={20} />,
            },
            {
              key: 'recursos',
              label: 'Recursos',
              icon: <ImUsers size={20} />,
            },
            {
              key: 'financeiro',
              label: 'Financeiro',
              icon: <FaMoneyBillTransfer size={20} />,
            },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTipoVisualizacao(key)}
              className={`group relative flex items-center justify-center gap-4 rounded-md px-4 py-2 transition-all ${
                tipoVisualizacao === key
                  ? 'bg-white text-gray-900 hover:scale-105 hover:shadow-lg hover:shadow-black'
                  : 'bg-white/50 text-slate-800 hover:scale-105 hover:bg-slate-600 hover:text-white hover:shadow-lg hover:shadow-black'
              }`}
              title={label}
            >
              <div>{icon}</div>

              <span className="text-base font-bold tracking-wider select-none">
                {label}
              </span>
            </button>
          ))}
        </nav>
      </main>
    </header>
  );
}
