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

export default function Overview({
  chunks,
  totalRecursos,
}: {
  chunks: any[];
  totalRecursos: number;
}) {
  if (totalRecursos === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full border border-gray-200" />
          <h3 className="mt-4 text-lg font-medium text-gray-600">
            Nenhum dado disponível
          </h3>
          <p className="mt-1 text-gray-500">
            Todos os recursos estão com valores zerados neste período
          </p>
        </div>
      </div>
    );
  }

  // Função para preencher chunk com recursos vazios até completar 8
  const padChunkToEight = (chunk: any[]) => {
    const paddedChunk = [...chunk];
    while (paddedChunk.length < 8) {
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
    <div className="space-y-8">
      {chunks.map((chunk: any, index: number) => {
        const filteredChunk = chunk.filter(
          (item: any) => item.horasFaturadas > 0
        );

        // Sempre renderiza o gráfico, mesmo se não houver dados válidos
        const paddedChunk = padChunkToEight(filteredChunk);

        return (
          <div
            key={index}
            className="rounded-2xl border border-slate-300 bg-white p-4 shadow-md shadow-black"
          >
            <ResponsiveContainer width="100%" height={500}>
              <ComposedChart
                data={paddedChunk}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                barCategoryGap={8}
                barGap={4}
              >
                <defs>
                  {/* Blue gradient */}
                  <linearGradient
                    id={`barGradientBlue-${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.5} />
                  </linearGradient>

                  {/* Orange gradient */}
                  <linearGradient
                    id={`barGradientOrange-${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.5} />
                  </linearGradient>

                  {/* Green gradient */}
                  <linearGradient
                    id={`barGradientGreen-${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.5} />
                  </linearGradient>

                  {/* Purple gradient */}
                  <linearGradient
                    id={`barGradientPurple-${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.5} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />

                <XAxis
                  dataKey={corrigirTextoCorrompido('nome')}
                  axisLine={false}
                  tickLine={false}
                  angle={-25}
                  textAnchor="end"
                  height={50}
                  style={{
                    fontWeight: 'bold',
                    letterSpacing: 1,
                    color: '#000',
                    fontSize: 14,
                    userSelect: 'none',
                  }}
                  // Customiza os ticks para não mostrar nomes vazios
                  tickFormatter={value => value || ''}
                />

                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  style={{
                    fontWeight: 'bold',
                    letterSpacing: 1,
                    color: '#000',
                    fontSize: 14,
                    userSelect: 'none',
                  }}
                />

                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  style={{
                    fontWeight: 'bold',
                    letterSpacing: 1,
                    color: '#000',
                    fontSize: 14,
                    userSelect: 'none',
                  }}
                />

                <Tooltip
                  content={<TooltipBarGrafico active={false} payload={[]} />}
                  cursor={{ fill: '#f3f4f6', opacity: 0.5 }}
                  // Não mostra tooltip para recursos vazios
                  isAnimationActive={false}
                  formatter={(value, name, props) => {
                    if (props.payload?.isEmpty) return [null, null];
                    return [value, name];
                  }}
                />

                <Legend
                  wrapperStyle={{ paddingTop: '90px' }}
                  formatter={value => (
                    <span className="text-base font-semibold tracking-wider text-slate-800 select-none">
                      {value}
                    </span>
                  )}
                />

                <Bar
                  yAxisId="left"
                  name="Disponíveis"
                  dataKey="horasDisponiveis"
                  fill={`url(#barGradientBlue-${index})`}
                  radius={[6, 6, 0, 0]}
                  animationDuration={1500}
                >
                  <LabelList
                    dataKey="horasDisponiveis"
                    position="top"
                    style={{
                      fontWeight: 'bold',
                      letterSpacing: 1,
                      color: '#000',
                      fontSize: 14,
                      userSelect: 'none',
                    }}
                    // Não mostra label para valores 0 (recursos vazios)
                    formatter={(value: number) => (value > 0 ? value : '')}
                  />
                </Bar>

                <Bar
                  yAxisId="left"
                  name="Executadas"
                  dataKey="horasExecutadas"
                  fill={`url(#barGradientOrange-${index})`}
                  radius={[6, 6, 0, 0]}
                  animationDuration={1500}
                >
                  <LabelList
                    dataKey="horasExecutadas"
                    position="top"
                    style={{
                      fontWeight: 'bold',
                      letterSpacing: 1,
                      color: '#000',
                      fontSize: 14,
                      userSelect: 'none',
                    }}
                    formatter={(value: number) => (value > 0 ? value : '')}
                  />
                </Bar>

                <Bar
                  yAxisId="left"
                  name="Faturadas"
                  dataKey="horasFaturadas"
                  fill={`url(#barGradientGreen-${index})`}
                  radius={[6, 6, 0, 0]}
                  animationDuration={1500}
                >
                  <LabelList
                    dataKey="horasFaturadas"
                    position="top"
                    style={{
                      fontWeight: 'bold',
                      letterSpacing: 1,
                      color: '#000',
                      fontSize: 14,
                      userSelect: 'none',
                    }}
                    formatter={(value: number) => (value > 0 ? value : '')}
                  />
                </Bar>

                <Bar
                  yAxisId="right"
                  name="% Meta"
                  dataKey="percentualAtingido"
                  fill={`url(#barGradientPurple-${index})`}
                  radius={[6, 6, 0, 0]}
                  animationDuration={1500}
                >
                  <LabelList
                    dataKey="percentualAtingido"
                    position="top"
                    style={{
                      fontWeight: 'bold',
                      letterSpacing: 1,
                      color: '#000',
                      fontSize: 14,
                      userSelect: 'none',
                    }}
                    formatter={(value: number) =>
                      value > 0 ? `${value}%` : ''
                    }
                  />
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}
