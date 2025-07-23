'use client';

import { useAuth } from '@/contexts/Auth_Context';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CircleX, Database } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

const arrayMeses = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

const arrayCoresBarras = [
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5A2B', // Brown
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#84CC16', // Lime
  '#F97316', // Orange
  '#14B8A6', // Teal
  '#A855F7', // Violet
];

//
interface FiltersProps {
  ano: string;
  mes?: string;
  cliente?: string;
  recurso?: string;
  status?: string;
}

interface DadosGraficoProps {
  mes: number;
  ano: number;
  periodo: string;
  total_horas: number;
  total_apontamentos: number;
  label_mes: string;
}

interface GraficoProps {
  filters: FiltersProps;
  altura?: string;
}

export default function ChartHorasApontadas({ filters }: GraficoProps) {
  const { isAdmin, codCliente, isLoggedIn } = useAuth();

  const {
    data: dados,
    isLoading,
    isError,
  } = useQuery<DadosGraficoProps[]>({
    queryKey: ['grafico-horas-apontadas', filters, isAdmin, codCliente],
    queryFn: async () => {
      const ano = parseInt(filters.ano);

      const promises = Array.from({ length: 12 }, async (_, index) => {
        const mes = index + 1;
        const params = {
          ...filters,
          mes: mes.toString(),
          isAdmin: isAdmin.toString(),
          ...(!isAdmin && codCliente && { codCliente }),
        };

        const res = await axios.get('/api/metrica-grafico/hora_apontamento', {
          params,
        });
        return (res.data as { dados_grafico: DadosGraficoProps }).dados_grafico;
      });

      return Promise.all(promises);
    },
    enabled: isLoggedIn && !!filters.ano,
  });

  // Formata os dados para o gráfico
  const dadosFormatados =
    dados?.map((item, idx) => ({
      mes: arrayMeses[item.mes - 1] ?? `M${item.mes}`,
      horas: item.total_horas ?? 0,
      apontamentos: item.total_apontamentos ?? 0,
      label_mes: item.label_mes ?? arrayMeses[item.mes - 1] ?? `M${item.mes}`,
      periodo: item.periodo,
      ano: item.ano,
    })) ?? [];

  // Função para calcular altura mínima baseada na quantidade de dados
  const calcularAlturaGrafico = () => {
    const qtdItens = dadosFormatados.length;
    if (qtdItens === 0) return 300;

    // Altura mínima de 50px por item + padding
    const alturaMinima = Math.max(300, qtdItens * 30 + 100);
    return Math.min(alturaMinima, 700); // Limita altura máxima
  };

  // Altura dinâmica do gráfico
  const alturaGrafico = calcularAlturaGrafico();

  return (
    <div className="relative overflow-hidden">
      <div className="relative z-10" style={{ height: `${alturaGrafico}px` }}>
        {/* LOADING */}
        {isLoading ? (
          <div className="h-48 overflow-hidden rounded-xl border-2 border-dashed border-gray-400 bg-gray-200">
            <div className="flex h-full flex-col items-center justify-center">
              <div className="space-y-4 text-center">
                <div className="relative mx-auto flex items-center justify-center">
                  {/* Círculos animados de fundo */}
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 animate-spin rounded-full border-3 border-transparent border-t-purple-600 border-r-purple-600 [animation-duration:2s]" />
                    <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-blue-500 border-l-blue-500 [animation-direction:reverse] [animation-duration:1.5s]" />
                    <div className="absolute inset-4 animate-spin rounded-full border-2 border-transparent border-t-purple-600 border-r-purple-600 [animation-duration:1s]" />

                    {/* ÍCONE */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Database
                        size={20}
                        className="animate-pulse text-black"
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                </div>

                {/* TEXTO DE CARREGAMENTO */}
                <div className="space-y-1">
                  <p className="text-md font-semibold text-black">
                    Carregando dados...
                  </p>
                  <p className="text-sm text-black">
                    Conectando ao banco de dados
                  </p>
                </div>

                {/* BOLINHAS DE CARREGAMENTO */}
                <div className="flex justify-center space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-purple-600 [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-purple-600"></div>
                </div>
              </div>
            </div>
          </div>
        ) : // ERRO
        isError || dadosFormatados.length === 0 ? (
          <div className="relative h-48 overflow-hidden rounded-xl border-2 border-dashed border-red-300 bg-red-100">
            <div className="flex h-full items-center justify-center">
              <div className="space-y-3 text-center">
                <div className="mx-auto flex items-center justify-center">
                  <CircleX className="h-12 w-12 text-red-500" />
                </div>

                <p className="text-md font-semibold text-red-500">
                  Erro ao tentar carregar os dados
                </p>

                <p className="text-sm font-semibold text-red-500">
                  Verifique sua conexão e tente novamente mais tarde
                </p>
              </div>
            </div>
          </div>
        ) : (
          // GRÁFICO
          <div className="relative h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dadosFormatados}
                margin={{ top: 40, right: 60, left: 10, bottom: 0 }}
                barCategoryGap="10%"
              >
                <CartesianGrid
                  strokeDasharray="3 6"
                  stroke="url(#gridGradient)"
                  horizontal
                  vertical={false}
                  opacity={0.4}
                />
                <XAxis
                  dataKey="mes"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fill: '#000',
                    fontWeight: 600,
                    letterSpacing: '1.5px',
                  }}
                  height={50}
                  interval={0}
                  textAnchor="middle"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={false}
                  tickFormatter={(value: number) => `${value}h`}
                  domain={[0, 'dataMax + 10']}
                />
                <Bar
                  dataKey="horas"
                  barSize={30}
                  radius={[8, 8, 0, 0]}
                  stroke="rgba(255, 255, 255)"
                  strokeWidth={1}
                >
                  {dadosFormatados.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.horas > 0
                          ? arrayCoresBarras[index % arrayCoresBarras.length]
                          : '#e5e7eb'
                      }
                      className="cursor-pointer transition-all duration-300 hover:opacity-80"
                      style={{
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                      }}
                    />
                  ))}
                  <LabelList
                    dataKey="horas"
                    position="top"
                    offset={10}
                    angle={-45}
                    formatter={(value: number) => {
                      if (value === 0) return '';
                      const horas = Math.floor(value);
                      const minutos = Math.round((value - horas) * 60);
                      return minutos > 0 ? `${horas}h:${minutos}` : `${horas}h`;
                    }}
                    style={{
                      fill: '#000',
                      fontSize: 12,
                      fontWeight: 600,
                      textAnchor: 'start',
                      letterSpacing: '1.5px',
                    }}
                  />
                </Bar>

                <defs>
                  <linearGradient id="gridGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#e2e8f0" stopOpacity={0.1} />
                    <stop offset="50%" stopColor="#cbd5e1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#e2e8f0" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
