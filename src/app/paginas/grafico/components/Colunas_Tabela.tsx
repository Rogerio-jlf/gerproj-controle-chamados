'use client';
import React from 'react';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';

interface RecursoProps {
  nome: string;
  percentualAtingido: number; // 0-100
  percentualEficiencia: number; // 0-100
  percentualUtilizacao: number; // 0-100
  nivelPerformance: number; // 0-5 (escala 0-100%)
  horasFaturadas: number;
  horasNaoFaturadas: number;
}

interface ColunasTabelaProps {
  dadosProcessados: RecursoProps[];
}

const barColors = {
  percentualAtingido: 'bg-blue-500',
  percentualEficiencia: 'bg-green-500',
  percentualUtilizacao: 'bg-yellow-500',
  nivelPerformance: 'bg-purple-500',
};

const HorasFaturadasCol: React.FC<{ horas: number }> = ({ horas }) => (
  <td className="border-b border-slate-300 p-3 text-center text-lg font-semibold tracking-wider text-green-600 select-none">
    {horas.toFixed(2)}h
  </td>
);

const HorasNaoFaturadasCol: React.FC<{ horas: number }> = ({ horas }) => (
  <td className="border-b border-slate-300 p-3 text-center text-lg font-semibold tracking-wider text-red-600 select-none">
    {horas.toFixed(2)}h
  </td>
);

const PerformanceMetricCol: React.FC<{ value: number; colorClass: string }> = ({
  value,
  colorClass,
}) => (
  <td className="border-b border-slate-300 p-3 text-center">
    <div className="relative h-7 w-full rounded-full bg-slate-200">
      <div
        className={`${colorClass} absolute h-7 rounded-full`}
        style={{ width: `${value}%` }}
        title={`${value.toFixed(1)}%`}
      />

      <div className="relative z-10 text-lg font-semibold tracking-wider text-slate-800 select-none">
        {value.toFixed(1)}%
      </div>
    </div>
  </td>
);

export default function ColunasTabelaRecursos({
  dadosProcessados,
}: ColunasTabelaProps) {
  return (
    <>
      {/* Cabeçalho da Tabela */}
      <thead>
        <tr>
          <th className="border-b border-red-500 p-4">Recurso</th>
          <th className="border-b border-red-500 p-4">Horas Faturadas</th>
          <th className="border-b border-red-500 p-4">Horas Não Faturadas</th>
          <th className="border-b border-red-500 p-4">Meta Atingida (%)</th>
          <th className="border-b border-red-500 p-4">Eficiência (%)</th>
          <th className="border-b border-red-500 p-4">Utilização (%)</th>
          <th className="border-b border-red-500 p-4">Performance (%)</th>
        </tr>
      </thead>

      {/* Corpo da Tabela */}
      <tbody>
        {dadosProcessados.map((rec, idx) => {
          const performancePercent = rec.nivelPerformance * 20; // escala 0-5 para 0-100%
          return (
            <tr key={idx} className="hover:bg-slate-100">
              <td className="border-b border-slate-300 p-3 font-semibold tracking-wider text-slate-800 select-none">
                {corrigirTextoCorrompido(rec.nome)}
              </td>

              <HorasFaturadasCol horas={rec.horasFaturadas} />
              <HorasNaoFaturadasCol horas={rec.horasNaoFaturadas} />

              <PerformanceMetricCol
                value={rec.percentualAtingido}
                colorClass={barColors.percentualAtingido}
              />
              <PerformanceMetricCol
                value={rec.percentualEficiencia}
                colorClass={barColors.percentualEficiencia}
              />
              <PerformanceMetricCol
                value={rec.percentualUtilizacao}
                colorClass={barColors.percentualUtilizacao}
              />
              <PerformanceMetricCol
                value={performancePercent}
                colorClass={barColors.nivelPerformance}
              />
            </tr>
          );
        })}
      </tbody>
    </>
  );
}
