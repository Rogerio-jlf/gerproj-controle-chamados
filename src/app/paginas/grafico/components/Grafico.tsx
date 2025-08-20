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
import { Calendar, User } from 'lucide-react';
import { IoMdClock } from 'react-icons/io';
import { TbClockPlus } from 'react-icons/tb';
import { TbClockMinus } from 'react-icons/tb';
import { TbClockDollar } from 'react-icons/tb';
// ==================================================

interface OverviewProps {
  dadosNumericosAPI?: any;
  dados?: any;
  dadosProcessados?: any[];
  chunks: any[];
  totalRecursos: number;
  mes: number;
  ano: number;
}
// ==================================================

const GRADIENTS = {
  blue: { from: '#0000FF', to: '#0000FF', color: '#0000FF' },
  purple: { from: '#A020F0', to: '#A020F0', color: '#A020F0' },
  green: { from: '#008000', to: '#008000', color: '#008000' },
  orange: { from: '#FFA500', to: '#FFA500', color: '#FFA500' },
  red: { from: '#FF0000', to: '#FF0000', color: '#FF0000' },
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
// ==================================================

export default function Grafico({
  chunks,
  totalRecursos,
  mes,
  ano,
}: OverviewProps) {
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
          style={{
            cursor: 'pointer',
          }}
        >
          <LabelList
            dataKey={dataKey}
            position="top"
            fill="#000"
            style={{
              fontWeight: '800',
              letterSpacing: '0.5px',
              fontSize: '12px',
              userSelect: 'none',
            }}
            formatter={(value: number, props: any) => {
              const isEmpty = props?.payload?.isEmpty;
              if (isEmpty || value <= 0) return '';

              // Se for percentual, mantém %
              if (isPercentage) return `${Math.round(value)}%`;

              // Para horas (todas as outras barras), arredonda sem decimais
              return Math.round(value);
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
          (item.horasDisponiveis > 0 ||
            item.horasExecutadas > 0 ||
            item.horasFaturadas > 0 ||
            item.horasNaoFaturadas > 0)
        ) {
          acc.disponiveis += item.horasDisponiveis || 0;
          acc.executadas += item.horasExecutadas || 0;
          acc.faturadas += item.horasFaturadas || 0;
          acc.naoFaturadas += item.horasNaoFaturadas || 0;
        }
      });
      return acc;
    },
    { disponiveis: 0, executadas: 0, faturadas: 0, naoFaturadas: 0 }
  );
  // ====================================================================================================

  return (
    <div className="space-y-6">
      {renderGradientDefs()}
      {/* ===== GRÁFICO ===== */}
      {chunks.map((chunk: any, index: number) => {
        const filteredChunk = chunk.filter(
          (item: any) => item.horasFaturadas > 0
        );
        const paddedChunk = padChunkToNine(filteredChunk);

        return (
          // ===== CONTAINER =====
          <div
            key={index}
            className="rounded-md border-t border-slate-200 bg-white shadow-md shadow-black"
          >
            {/* ===== HEADER ===== */}
            <header className="mb-12 flex items-center justify-between rounded-t-md bg-slate-900 p-6">
              {/* ===== seção da esquerda ===== */}
              <section className="flex flex-col items-start justify-center">
                {/* título */}
                <h1 className="text-3xl font-extrabold tracking-widest text-white select-none">
                  Horas Recurso
                </h1>

                <div className="flex items-center gap-2">
                  {/* ícone */}
                  <Calendar className="text-white" size={20} />
                  {/* descrição data */}
                  <span className="text-sm font-semibold tracking-wider text-white italic select-none">
                    {new Date(ano, mes - 1)
                      .toLocaleDateString('pt-BR', {
                        month: 'long',
                        year: 'numeric',
                      })
                      .replace(/^\w/, c => c.toUpperCase())}
                  </span>
                  {/* barra separadora */}
                  <div className="mx-2 h-4 w-0.5 bg-white select-none"></div>
                  {/* ícone */}
                  <User className="text-white" size={20} />
                  {/* quantidade de recursos */}
                  <span className="text-sm font-semibold tracking-wider text-white italic select-none">
                    {filteredChunk.length} recurso
                    {filteredChunk.length === 1 ? '' : 's'}
                  </span>
                </div>
              </section>
              {/* ==================== */}

              {/* ===== seção da direita ===== */}
              <section className="grid grid-cols-4 gap-4">
                <div className="min-w-[180px] rounded-md border-t border-blue-200 bg-blue-600 px-4 py-2 shadow-md shadow-black">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-blue-300 via-blue-700 to-blue-300 shadow-md shadow-black">
                      <IoMdClock className="text-white" size={24} />
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-lg font-semibold tracking-wider text-white select-none">
                        Horas Disponíveis
                      </p>
                      <p className="text-xl font-bold tracking-wider text-white select-none">
                        {totaisGerais.disponiveis.toLocaleString('pt-BR')}h
                      </p>
                    </div>
                  </div>
                </div>

                <div className="min-w-[180px] rounded-md border-t border-orange-200 bg-orange-600 px-4 py-2 shadow-md shadow-black">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-orange-300 via-orange-700 to-orange-300 shadow-md shadow-black">
                      <TbClockPlus className="text-white" size={24} />
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-lg font-semibold tracking-wider text-white select-none">
                        Horas Executadas
                      </p>
                      <p className="text-xl font-bold tracking-wider text-white select-none">
                        {totaisGerais.executadas.toLocaleString('pt-BR')}h
                      </p>
                    </div>
                  </div>
                </div>

                <div className="min-w-[180px] rounded-md border-t border-green-200 bg-green-600 px-4 py-2 shadow-md shadow-black">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-green-300 via-green-700 to-green-300 shadow-md shadow-black">
                      <TbClockDollar className="text-white" size={24} />
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-lg font-semibold tracking-wider text-white select-none">
                        Horas Faturadas
                      </p>
                      <p className="text-xl font-bold tracking-wider text-white select-none">
                        {totaisGerais.faturadas.toLocaleString('pt-BR')}h
                      </p>
                    </div>
                  </div>
                </div>

                <div className="min-w-[180px] rounded-md border-t border-red-200 bg-red-600 px-4 py-2 shadow-md shadow-black">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-red-300 via-red-700 to-red-300 shadow-md shadow-black">
                      <TbClockMinus className="text-white" size={24} />
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-lg font-semibold tracking-wider text-white select-none">
                        Horas Não Faturadas
                      </p>
                      <p className="text-xl font-bold tracking-wider text-white select-none">
                        {totaisGerais.naoFaturadas.toLocaleString('pt-BR')}h
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </header>
            {/* ==================== */}

            {/* ===== seção gráfico ===== */}
            <section>
              <ResponsiveContainer width="100%" height={450}>
                <ComposedChart
                  data={paddedChunk}
                  margin={{ top: 20, right: 0, bottom: 40, left: 0 }}
                  barCategoryGap={20}
                  barGap={5}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                    // strokeOpacity={0.5}
                  />

                  <XAxis
                    dataKey={corrigirTextoCorrompido('nome')}
                    axisLine={{ stroke: '#000' }}
                    tickLine={false}
                    angle={-15}
                    textAnchor="end"
                    height={50}
                    tick={{
                      fontSize: 12,
                      fill: '#000',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                    }}
                    tickFormatter={value => value || ''}
                  />

                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    axisLine={{ stroke: '#000' }}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: '#000',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                    }}
                    tickFormatter={value => `${value}h`}
                  />

                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    axisLine={{ stroke: '#000' }}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: '#000',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                    }}
                    tickFormatter={value => `${value}%`}
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
                      paddingTop: '80px',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '20px',
                    }}
                    formatter={value => (
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-bold tracking-wider text-slate-700 italic select-none">
                        {value}
                      </span>
                    )}
                  />

                  {renderBars()}
                </ComposedChart>
              </ResponsiveContainer>
            </section>
          </div>
        );
      })}
      {/* ==================== */}
    </div>
  );
}
