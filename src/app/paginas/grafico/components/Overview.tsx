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
} from 'recharts';
import { LabelList } from 'recharts';
import TooltipBarGrafico from './CustomTooltip';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
import HorasContratadasDashboard from './Clientes';
import MetricsCards from './MetricCards';

interface ConsolidadoProps {
  dadosNumericosAPI?: any;
  dados?: any;
  dadosProcessados?: any[];
  chunks: any[];
  totalRecursos: number;
}

export default function Overview({
  chunks,
  totalRecursos,
  dadosNumericosAPI = {},
  dados = {},
  dadosProcessados = [],
}: ConsolidadoProps) {
  const ano = new Date().getFullYear();
  const mes = new Date().getMonth() + 1;

  if (totalRecursos === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full border-2 border-dashed border-gray-300 bg-gray-100 p-2" />
          <h3 className="mt-4 text-lg font-semibold text-gray-700">
            Nenhum dado disponível
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Todos os recursos estão com valores zerados neste período
          </p>
        </div>
      </div>
    );
  }

  // Função para preencher chunk com recursos vazios até completar 8
  const padChunkToNine = (chunk: any[]) => {
    const paddedChunk = [...chunk];
    while (paddedChunk.length < 9) {
      paddedChunk.push({
        nome: '', // Nome vazio para não aparecer no eixo X
        horasDisponiveis: 0,
        horasExecutadas: 0,
        horasFaturadas: 0,
        percentualAtingido: 0,
        isEmpty: true, // Flag para identificar recursos vazios
      });
    }
    return paddedChunk;
  };

  return (
    <div className="space-y-6">
      {/* Definindo os gradientes globais */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="gradientBlue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="gradientPurple" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="gradientGreen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="gradientOrange" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
      </svg>

      <section>
        <MetricsCards
          dadosNumericosAPI={dadosNumericosAPI}
          dados={dados}
          dadosProcessados={dadosProcessados}
        />
      </section>

      {/* gráfico */}
      {chunks.map((chunk: any, index: number) => {
        const filteredChunk = chunk.filter(
          (item: any) => item.horasFaturadas > 0
        );

        // Sempre renderiza o gráfico, mesmo se não houver dados válidos
        const paddedChunk = padChunkToNine(filteredChunk);

        return (
          <div
            key={index}
            className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg shadow-gray-200/50"
          >
            <ResponsiveContainer width="100%" height={500}>
              <ComposedChart
                data={paddedChunk}
                margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
                barCategoryGap={12}
                barGap={6}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                  strokeOpacity={0.5}
                />

                <XAxis
                  dataKey={corrigirTextoCorrompido('nome')}
                  axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                  tickLine={false}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                  tickMargin={10}
                  tick={{
                    fontSize: 13,
                    fill: '#475569',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                  }}
                  tickFormatter={value => value || ''}
                />

                <YAxis
                  yAxisId="left"
                  axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                  tickLine={false}
                  tickMargin={10}
                  tick={{
                    fontSize: 13,
                    fill: '#475569',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                  }}
                />

                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                  tickLine={false}
                  tickMargin={10}
                  tick={{
                    fontSize: 13,
                    fill: '#475569',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                  }}
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
                    paddingTop: '30px',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px',
                  }}
                  formatter={value => (
                    <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold tracking-wide text-gray-600 select-none">
                      {value}
                    </span>
                  )}
                />

                <Bar
                  yAxisId="left"
                  name="Disponíveis"
                  dataKey="horasDisponiveis"
                  fill="url(#gradientBlue)"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  <LabelList
                    dataKey="horasDisponiveis"
                    position="top"
                    style={{
                      fontWeight: '600',
                      letterSpacing: '0.5px',
                      color: '#1e40af',
                      fontSize: '12px',
                      userSelect: 'none',
                    }}
                    formatter={(value: number) => (value > 0 ? value : '')}
                  />
                </Bar>

                <Bar
                  yAxisId="left"
                  name="Executadas"
                  dataKey="horasExecutadas"
                  fill="url(#gradientOrange)"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  <LabelList
                    dataKey="horasExecutadas"
                    position="top"
                    style={{
                      fontWeight: '600',
                      letterSpacing: '0.5px',
                      color: '#92400e',
                      fontSize: '12px',
                      userSelect: 'none',
                    }}
                    formatter={(value: number) => (value > 0 ? value : '')}
                  />
                </Bar>

                <Bar
                  yAxisId="left"
                  name="Faturadas"
                  dataKey="horasFaturadas"
                  fill="url(#gradientGreen)"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  <LabelList
                    dataKey="horasFaturadas"
                    position="top"
                    style={{
                      fontWeight: '600',
                      letterSpacing: '0.5px',
                      color: '#065f46',
                      fontSize: '12px',
                      userSelect: 'none',
                    }}
                    formatter={(value: number) => (value > 0 ? value : '')}
                  />
                </Bar>

                <Bar
                  yAxisId="right"
                  name="% Meta"
                  dataKey="percentualAtingido"
                  fill="url(#gradientPurple)"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  <LabelList
                    dataKey="percentualAtingido"
                    position="top"
                    style={{
                      fontWeight: '600',
                      letterSpacing: '0.5px',
                      color: '#5b21b6',
                      fontSize: '12px',
                      userSelect: 'none',
                    }}
                    formatter={(value: number) =>
                      value > 0 ? `${Math.round(value)}%` : ''
                    }
                  />
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        );
      })}

      <HorasContratadasDashboard ano={ano} mes={mes} />
    </div>
  );
}
