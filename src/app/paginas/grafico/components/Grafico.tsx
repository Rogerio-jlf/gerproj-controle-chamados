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
import { FaCalendarAlt } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';
import { Card } from '../../../../components/ui/card';
import { FaCalendarTimes } from 'react-icons/fa';

interface OverviewProps {
  dadosNumericosAPI?: any;
  dados?: any;
  dadosProcessados?: any[];
  parts: any[];
  totalRecursos: number;
  mes: number;
  ano: number;
}

// ===== CONFIGURAÇÃO DE GRADIENTES MELHORADA =====
const GRADIENTS = {
  blue: {
    from: '#3B82F6',
    to: '#1E40AF',
    color: '#2563EB',
    shadow: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  orange: {
    from: '#F97316',
    to: '#EA580C',
    color: '#F97316',
    shadow: '#F97316',
    glow: 'rgba(249, 115, 22, 0.4)',
  },
  green: {
    from: '#10B981',
    to: '#047857',
    color: '#059669',
    shadow: '#10B981',
    glow: 'rgba(16, 185, 129, 0.4)',
  },
  red: {
    from: '#EF4444',
    to: '#DC2626',
    color: '#EF4444',
    shadow: '#EF4444',
    glow: 'rgba(239, 68, 68, 0.4)',
  },
  purple: {
    from: '#A855F7',
    to: '#7C3AED',
    color: '#8B5CF6',
    shadow: '#A855F7',
    glow: 'rgba(168, 85, 247, 0.4)',
  },
};

// ===== CONFIGURAÇÃO DAS BARRAS MELHORADA =====
const BAR_CONFIG = [
  {
    name: 'Disponíveis',
    dataKey: 'horasDisponiveis',
    gradient: 'blue',
    strokeWidth: 2,
    radius: [6, 6, 0, 0],
  },
  {
    name: 'Executadas',
    dataKey: 'horasExecutadas',
    gradient: 'orange',
    strokeWidth: 2,
    radius: [6, 6, 0, 0],
  },
  {
    name: 'Faturadas',
    dataKey: 'horasFaturadas',
    gradient: 'green',
    strokeWidth: 2,
    radius: [6, 6, 0, 0],
  },
  {
    name: 'Não Faturadas',
    dataKey: 'horasNaoFaturadas',
    gradient: 'red',
    strokeWidth: 2,
    radius: [6, 6, 0, 0],
  },
  {
    name: '% Meta',
    dataKey: 'percentualAtingido',
    gradient: 'purple',
    yAxis: 'right',
    isPercentage: true,
    strokeWidth: 2,
    radius: [6, 6, 0, 0],
  },
];

export default function Grafico({
  parts,
  totalRecursos,
  mes,
  ano,
}: OverviewProps) {
  // Função para garantir que cada chunk tenha 9 itens, preenchendo com vazios se necessário
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

  // Verificar se há dados válidos para exibir
  const hasValidData = () => {
    if (totalRecursos === 0 || !parts || parts.length === 0) {
      return false;
    }

    return parts.some(chunk =>
      chunk.some(
        (item: any) =>
          !item.isEmpty &&
          ((item.horasDisponiveis && item.horasDisponiveis > 0) ||
            (item.horasExecutadas && item.horasExecutadas > 0) ||
            (item.horasFaturadas && item.horasFaturadas > 0) ||
            (item.horasNaoFaturadas && item.horasNaoFaturadas > 0) ||
            (item.percentualAtingido && item.percentualAtingido > 0))
      )
    );
  };

  // ===== RENDERIZAÇÃO DOS GRADIENTES MELHORADA =====
  const renderGradientDefs = () => (
    <svg width="0" height="0" className="absolute">
      <defs>
        {Object.entries(GRADIENTS).map(([key, { from, to, glow }]) => (
          <React.Fragment key={key}>
            {/* Gradiente principal */}
            <linearGradient
              id={`gradient${key.charAt(0).toUpperCase() + key.slice(1)}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={from} stopOpacity="1" />
              <stop offset="50%" stopColor={from} stopOpacity="0.9" />
              <stop offset="100%" stopColor={to} stopOpacity="0.8" />
            </linearGradient>

            {/* Gradiente para hover */}
            <linearGradient
              id={`gradientHover${key.charAt(0).toUpperCase() + key.slice(1)}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={from} stopOpacity="1" />
              <stop offset="100%" stopColor={to} stopOpacity="1" />
            </linearGradient>

            {/* Filtro de brilho/glow */}
            <filter id={`glow${key.charAt(0).toUpperCase() + key.slice(1)}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Pattern para textura sutil */}
            <pattern
              id={`pattern${key.charAt(0).toUpperCase() + key.slice(1)}`}
              patternUnits="userSpaceOnUse"
              width="4"
              height="4"
            >
              <rect width="4" height="4" fill={from} opacity="0.1" />
              <path
                d="M 0,4 l 4,-4 M -1,1 l 2,-2 M 3,5 l 2,-2"
                stroke={to}
                strokeWidth="0.5"
                opacity="0.2"
              />
            </pattern>
          </React.Fragment>
        ))}
      </defs>
    </svg>
  );

  // ===== RENDERIZAÇÃO DAS BARRAS MELHORADA =====
  const renderBars = () =>
    BAR_CONFIG.map(
      ({
        name,
        dataKey,
        gradient,
        yAxis = 'left',
        isPercentage,
        strokeWidth,
        radius,
      }) => (
        <Bar
          key={dataKey}
          yAxisId={yAxis}
          name={name}
          dataKey={dataKey}
          fill={`url(#gradient${gradient.charAt(0).toUpperCase() + gradient.slice(1)})`}
          stroke={GRADIENTS[gradient as keyof typeof GRADIENTS].color}
          strokeWidth={strokeWidth}
          radius={radius}
          animationDuration={1500}
          animationEasing="ease-out"
          style={{
            cursor: 'pointer',
            filter: `drop-shadow(0 4px 8px ${GRADIENTS[gradient as keyof typeof GRADIENTS].glow})`,
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(data, index) => {
            // Efeito hover - pode ser implementado via CSS
          }}
        >
          <LabelList
            dataKey={dataKey}
            position="top"
            fill="#1F2937"
            style={{
              fontWeight: '700',
              letterSpacing: '0.5px',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
              textShadow: '0 1px 2px rgba(255,255,255,0.8)',
              userSelect: 'none',
            }}
            formatter={(value: number, props: any) => {
              const isEmpty = props?.payload?.isEmpty;
              if (isEmpty || value <= 0) return '';

              if (isPercentage) return `${Math.round(value)}%`;
              return Math.round(value);
            }}
          />
        </Bar>
      )
    );

  // Verifica se não há dados válidos para exibir
  if (!hasValidData()) {
    return (
      <Card className="flex h-96 items-center justify-center rounded-xl border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-8 shadow-md shadow-black">
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-3 border-dashed border-gray-300 bg-white shadow-xl">
            <div className="flex flex-col items-center gap-4">
              <FaCalendarAlt className="text-gray-400" size={28} />
              <FaUser className="text-gray-400" size={28} />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-2xl font-extrabold tracking-wider text-gray-900 select-none">
              Nenhum dado disponível
            </h3>
            <p className="text-base font-bold tracking-wider text-gray-700 italic select-none">
              Não há dados de recursos para o período selecionado
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <FaCalendarTimes className="text-blue-600" size={20} />
            <p className="text-base font-semibold tracking-wider text-blue-600 select-none">
              {new Date(ano, mes - 1)
                .toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric',
                })
                .replace(/^\w/, c => c.toUpperCase())}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Calcular totais gerais de todos os parts
  const totaisGerais = parts.reduce(
    (acc, chunk) => {
      chunk.forEach((item: any) => {
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

  return (
    <div className="space-y-6">
      {renderGradientDefs()}
      {/* ===== GRÁFICO ===== */}
      {parts.map((chunk: any, index: number) => {
        const filteredChunk = chunk.filter(
          (item: any) => item.horasFaturadas > 0
        );
        const paddedChunk = padChunkToNine(filteredChunk);

        return (
          <div
            key={index}
            className="rounded-xl border border-gray-100 bg-white shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            }}
          >
            {/* ===== HEADER ===== */}
            <header className="mb-12 flex items-center justify-between rounded-t-xl bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 p-6 shadow-lg">
              {/* ===== seção da esquerda ===== */}
              <section className="flex flex-col items-start justify-center">
                <h1 className="text-3xl font-extrabold tracking-widest text-white select-none">
                  Horas Recurso
                </h1>
                <div className="flex items-center gap-2">
                  <Calendar className="text-white" size={20} />
                  <span className="text-sm font-semibold tracking-wider text-white italic select-none">
                    {new Date(ano, mes - 1)
                      .toLocaleDateString('pt-BR', {
                        month: 'long',
                        year: 'numeric',
                      })
                      .replace(/^\w/, c => c.toUpperCase())}
                  </span>
                  <div className="mx-2 h-4 w-0.5 bg-white select-none"></div>
                  <User className="text-white" size={20} />
                  <span className="text-sm font-semibold tracking-wider text-white italic select-none">
                    {filteredChunk.length} recurso
                    {filteredChunk.length === 1 ? '' : 's'}
                  </span>
                </div>
              </section>

              {/* ===== seção da direita ===== */}
              <section className="grid grid-cols-4 gap-4">
                {/* horas disponíveis */}
                <div className="min-w-[180px] rounded-lg border-t-2 border-blue-300 bg-gradient-to-br from-blue-500 to-blue-600 px-4 py-2 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 shadow-inner backdrop-blur-sm">
                      <IoMdClock className="text-white" size={24} />
                    </div>
                    <div className="flex flex-col items-start justify-center">
                      <p className="text-lg font-semibold tracking-widest text-white select-none">
                        Horas Disponíveis
                      </p>
                      <p className="text-2xl font-bold tracking-wider text-white select-none">
                        {totaisGerais.disponiveis.toLocaleString('pt-BR')}h
                      </p>
                    </div>
                  </div>
                </div>

                {/* horas executadas */}
                <div className="min-w-[180px] rounded-lg border-t-2 border-orange-300 bg-gradient-to-br from-orange-500 to-orange-600 px-4 py-2 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 shadow-inner backdrop-blur-sm">
                      <TbClockPlus className="text-white" size={24} />
                    </div>
                    <div className="flex flex-col items-start justify-center">
                      <p className="text-lg font-semibold tracking-wider text-white select-none">
                        Horas Executadas
                      </p>
                      <p className="text-2xl font-bold tracking-wider text-white select-none">
                        {totaisGerais.executadas.toLocaleString('pt-BR')}h
                      </p>
                    </div>
                  </div>
                </div>

                {/* horas faturadas */}
                <div className="min-w-[180px] rounded-lg border-t-2 border-green-300 bg-gradient-to-br from-green-500 to-green-600 px-4 py-2 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 shadow-inner backdrop-blur-sm">
                      <TbClockDollar className="text-white" size={24} />
                    </div>
                    <div className="flex flex-col items-start justify-center">
                      <p className="text-lg font-semibold tracking-wider text-white select-none">
                        Horas Faturadas
                      </p>
                      <p className="text-2xl font-bold tracking-wider text-white select-none">
                        {totaisGerais.faturadas.toLocaleString('pt-BR')}h
                      </p>
                    </div>
                  </div>
                </div>

                {/* horas não faturadas */}
                <div className="min-w-[180px] rounded-lg border-t-2 border-red-300 bg-gradient-to-br from-red-500 to-red-600 px-4 py-2 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 shadow-inner backdrop-blur-sm">
                      <TbClockMinus className="text-white" size={24} />
                    </div>
                    <div className="flex flex-col items-start justify-center">
                      <p className="text-lg font-semibold tracking-wider text-white select-none">
                        Horas Não Faturadas
                      </p>
                      <p className="text-2xl font-bold tracking-wider text-white select-none">
                        {totaisGerais.naoFaturadas.toLocaleString('pt-BR')}h
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </header>

            {/* ===== seção gráfico ===== */}
            <section className="p-6">
              <ResponsiveContainer width="100%" height={450}>
                <ComposedChart
                  data={paddedChunk}
                  margin={{ top: 30, right: 20, bottom: 40, left: 10 }}
                  barCategoryGap={15}
                  barGap={3}
                >
                  <CartesianGrid
                    strokeDasharray="2 4"
                    vertical={false}
                    stroke="#e2e8f0"
                    strokeOpacity={0.6}
                  />

                  <XAxis
                    dataKey={corrigirTextoCorrompido('nome')}
                    axisLine={{ stroke: '#374151', strokeWidth: 2 }}
                    tickLine={false}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                    tick={{
                      fontSize: 12,
                      fill: '#374151',
                      fontWeight: 600,
                      fontFamily: 'Inter, sans-serif',
                    }}
                    tickFormatter={value => value || ''}
                  />

                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    axisLine={{ stroke: '#374151', strokeWidth: 2 }}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: '#374151',
                      fontWeight: 600,
                      fontFamily: 'Inter, sans-serif',
                    }}
                    tickFormatter={value => `${value}h`}
                  />

                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    axisLine={{ stroke: '#374151', strokeWidth: 2 }}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: '#374151',
                      fontWeight: 600,
                      fontFamily: 'Inter, sans-serif',
                    }}
                    tickFormatter={value => `${value}%`}
                  />

                  <Tooltip
                    content={<TooltipBarGrafico active={false} payload={[]} />}
                    cursor={{
                      fill: 'rgba(59, 130, 246, 0.08)',
                      stroke: 'rgba(59, 130, 246, 0.2)',
                      strokeWidth: 2,
                      radius: 4,
                    }}
                    isAnimationActive={true}
                    animationDuration={200}
                    formatter={(value, name, props) => {
                      if (props.payload?.isEmpty) return [null, null];
                      return [value, name];
                    }}
                  />

                  <Legend
                    wrapperStyle={{
                      paddingTop: '40px',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '16px',
                    }}
                    formatter={value => (
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-slate-100 to-slate-200 px-4 py-2 text-sm font-bold tracking-wide text-slate-700 shadow-sm ring-1 ring-slate-300/50 select-none">
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
    </div>
  );
}
