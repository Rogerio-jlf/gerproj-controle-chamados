'use client';
import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  LabelList,
} from 'recharts';
import TooltipBarGrafico from './Tooltip_Bar_Grafico';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
import Clientes from './Clientes';
import MetricsCards from './Cards_Dashboard';

interface ConsolidadoProps {
  dadosNumericosAPI?: any;
  dados?: any;
  dadosProcessados?: any[];
  chunks: any[];
  totalRecursos: number;
  mes: number;
  ano: number;
}

const GRADIENTS = {
  blue: { from: '#3b82f6', to: '#1d4ed8', color: '#1e40af' },
  purple: { from: '#8b5cf6', to: '#7c3aed', color: '#5b21b6' },
  green: { from: '#10b981', to: '#059669', color: '#065f46' },
  orange: { from: '#f59e0b', to: '#d97706', color: '#92400e' },
  red: { from: '#ef4444', to: '#dc2626', color: '#92400e' },
};

const BAR_CONFIG = [
  { name: 'Disponíveis', dataKey: 'horasDisponiveis', gradient: 'blue' },
  { name: 'Executadas', dataKey: 'horasExecutadas', gradient: 'orange' },
  { name: 'Faturadas', dataKey: 'horasFaturadas', gradient: 'green' },
  { name: 'Não Faturadas', dataKey: 'horasNaoFaturadas', gradient: 'red' },
  {
    name: '% Meta',
    dataKey: 'percentualAtingido',
    gradient: 'purple',
    yAxis: 'right',
    isPercentage: true,
  },
];

// Componente para os cards de totais
const TotalsCards = ({ data }: { data: any[] }) => {
  const totals = data.reduce(
    (acc, item) => {
      // Considerar todos os recursos que têm algum valor (não apenas isEmpty)
      if (
        !item.isEmpty &&
        (item.horasExecutadas > 0 ||
          item.horasFaturadas > 0 ||
          item.horasNaoFaturadas > 0)
      ) {
        acc.executadas += item.horasExecutadas || 0;
        acc.faturadas += item.horasFaturadas || 0;
        acc.naoFaturadas += item.horasNaoFaturadas || 0;
      }
      return acc;
    },
    { executadas: 0, faturadas: 0, naoFaturadas: 0 }
  );

  const cards = [
    {
      title: 'Horas Executadas',
      value: totals.executadas,
      icon: '⏱️',
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-200',
    },
    {
      title: 'Horas Faturadas',
      value: totals.faturadas,
      icon: '💰',
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
    },
    {
      title: 'Horas Não Faturadas',
      value: totals.naoFaturadas,
      icon: '⚠️',
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
    },
  ];

  return (
    <div className="mb-4 grid grid-cols-3 gap-3">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`rounded-lg border ${card.borderColor} ${card.bgColor} p-3 transition-all duration-200 hover:shadow-md`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-medium ${card.textColor} opacity-80`}>
                {card.title}
              </p>
              <p className={`text-lg font-bold ${card.textColor}`}>
                {card.value.toLocaleString('pt-BR')}h
              </p>
            </div>
            <div className="text-xl opacity-70">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Overview({
  chunks,
  totalRecursos,
  mes,
  ano,
}: ConsolidadoProps) {
  const padChunkToNine = (chunk: any[]) => {
    const paddedChunk = [...chunk];
    while (paddedChunk.length < 9) {
      paddedChunk.push({
        nome: '',
        horasDisponiveis: 0,
        horasExecutadas: 0,
        horasFaturadas: 0,
        horasNaoFaturadas: 0,
        percentualAtingido: 0,
        isEmpty: true,
      });
    }
    return paddedChunk;
  };

  const renderGradientDefs = () => (
    <svg width="0" height="0" className="absolute">
      <defs>
        {Object.entries(GRADIENTS).map(([key, { from, to }]) => (
          <linearGradient
            key={key}
            id={`gradient${key.charAt(0).toUpperCase() + key.slice(1)}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        ))}
      </defs>
    </svg>
  );

  const renderBars = () =>
    BAR_CONFIG.map(
      ({ name, dataKey, gradient, yAxis = 'left', isPercentage }) => (
        <Bar
          key={dataKey}
          yAxisId={yAxis}
          name={name}
          dataKey={dataKey}
          fill={`url(#gradient${gradient.charAt(0).toUpperCase() + gradient.slice(1)})`}
          radius={[4, 4, 0, 0]}
          animationDuration={1200}
          animationEasing="ease-out"
        >
          <LabelList
            dataKey={dataKey}
            position="top"
            style={{
              fontWeight: '600',
              letterSpacing: '0.5px',
              color: GRADIENTS[gradient as keyof typeof GRADIENTS].color,
              fontSize: '12px',
              userSelect: 'none',
            }}
            formatter={(value: number) => {
              if (value <= 0) return '';
              return isPercentage ? `${Math.round(value)}%` : value;
            }}
          />
        </Bar>
      )
    );

  if (totalRecursos === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-white">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-700">
            Nenhum dado disponível
          </h3>
          <p className="mt-2 text-gray-500">
            Todos os recursos estão com valores zerados neste período
          </p>
        </div>
      </div>
    );
  }

  // Calcular totais gerais de todos os chunks
  const totaisGerais = chunks.reduce(
    (acc, chunk) => {
      chunk.forEach((item: any) => {
        // Considerar todos os recursos que têm algum valor (não apenas faturadas > 0)
        if (
          !item.isEmpty &&
          (item.horasExecutadas > 0 ||
            item.horasFaturadas > 0 ||
            item.horasNaoFaturadas > 0)
        ) {
          acc.executadas += item.horasExecutadas || 0;
          acc.faturadas += item.horasFaturadas || 0;
          acc.naoFaturadas += item.horasNaoFaturadas || 0;
        }
      });
      return acc;
    },
    { executadas: 0, faturadas: 0, naoFaturadas: 0 }
  );

  return (
    <div className="space-y-6 p-4">
      {renderGradientDefs()}

      {/* Header com cards de totais gerais */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-6">
          {/* Título e descrição */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">
              Dashboard de Recursos
            </h1>
            <p className="text-gray-600">
              Visão geral das horas trabalhadas e desempenho da equipe
            </p>
          </div>

          {/* Cards de totais gerais */}
          <div className="grid grid-cols-3 gap-3">
            <div className="min-w-[120px] rounded-lg border border-orange-200 bg-orange-50 p-3">
              <div className="text-center">
                <p className="text-xs font-medium text-orange-800 opacity-80">
                  Total Executadas
                </p>
                <p className="text-lg font-bold text-orange-800">
                  {totaisGerais.executadas.toLocaleString('pt-BR')}h
                </p>
                <div className="mt-1 text-lg opacity-70">⏱️</div>
              </div>
            </div>

            <div className="min-w-[120px] rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="text-center">
                <p className="text-xs font-medium text-green-800 opacity-80">
                  Total Faturadas
                </p>
                <p className="text-lg font-bold text-green-800">
                  {totaisGerais.faturadas.toLocaleString('pt-BR')}h
                </p>
                <div className="mt-1 text-lg opacity-70">💰</div>
              </div>
            </div>

            <div className="min-w-[120px] rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="text-center">
                <p className="text-xs font-medium text-red-800 opacity-80">
                  Total Não Faturadas
                </p>
                <p className="text-lg font-bold text-red-800">
                  {totaisGerais.naoFaturadas.toLocaleString('pt-BR')}h
                </p>
                <div className="mt-1 text-lg opacity-70">⚠️</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      {chunks.map((chunk: any, index: number) => {
        const filteredChunk = chunk.filter(
          (item: any) => item.horasFaturadas > 0
        );
        const paddedChunk = padChunkToNine(filteredChunk);

        return (
          <div key={index} className="rounded-xl border bg-white p-4 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Desempenho dos Recursos
                {chunks.length > 1 ? ` - Grupo ${index + 1}` : ''}
              </h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                {filteredChunk.length} recursos ativos
              </span>
            </div>

            <ResponsiveContainer width="100%" height={450}>
              <ComposedChart
                data={paddedChunk}
                margin={{ top: 20, right: 20, bottom: 50, left: 20 }}
                barCategoryGap={10}
                barGap={4}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                  strokeOpacity={0.5}
                />

                <XAxis
                  dataKey={corrigirTextoCorrompido('nome')}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  angle={-25}
                  textAnchor="end"
                  height={50}
                  tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                  tickFormatter={value => value || ''}
                />

                <YAxis
                  yAxisId="left"
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                />

                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                />

                <Tooltip
                  content={<TooltipBarGrafico active={false} payload={[]} />}
                  cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
                  isAnimationActive={false}
                  formatter={(value, name, props) => {
                    if (props.payload?.isEmpty) return [null, null];
                    return [value, name];
                  }}
                />

                <Legend
                  wrapperStyle={{
                    paddingTop: '20px',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '12px',
                  }}
                  formatter={value => (
                    <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                      {value}
                    </span>
                  )}
                />

                {renderBars()}
              </ComposedChart>
            </ResponsiveContainer>

            <p className="mt-4 border-t border-gray-100 pt-3 text-center text-xs text-gray-500">
              Dados atualizados em {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        );
      })}

      {/* Dashboard de horas contratadas */}
      <Clientes mes={mes} ano={ano} />
    </div>
  );
}
