'use client';

import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CircleX, Database, DatabaseBackup } from 'lucide-react';
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

interface DetalhesRecursoProps {
  codrec_os: string;
  nome_recurso: string | null;
  horasExecutadas: number;
  percentual: number;
  numeroClientesUnicos: number;
}

interface FiltersProps {
  filters: {
    mes: string;
    ano: string;
    cliente?: string;
    recurso?: string;
    status?: string;
  };
}

interface ApiResponseProps {
  detalhesRecursos: DetalhesRecursoProps[];
  totalHorasExecutadas: number;
  numeroDeClientes: number;
  mediaHorasPorCliente: number;
}

type CustomBottomLabelsProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value: number;
  percentual: number;
};

const cores = [
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
  '#059669', // Green
  '#DC2626', // Red-600
  '#7C3AED', // Violet-600
  '#0891B2', // Cyan-600
  '#CA8A04', // Yellow-600
];

function CustomBottomLabels({
  x,
  y,
  width,
  height,
  value,
  percentual,
}: CustomBottomLabelsProps) {
  const labelX = (x ?? 0) + (width ?? 0) + 12;
  const labelY = (y ?? 0) + (height ?? 0) / 2;

  const horasFormatada = Math.floor(value);
  const minutosFormatados = Math.round((value - horasFormatada) * 60);
  const hhmm = `${String(horasFormatada).padStart(2, '0')}h:${String(minutosFormatados).padStart(2, '0')}`;

  return (
    <g>
      {/* Background para o label */}
      <rect
        x={labelX - 4}
        y={labelY - 8}
        width={100}
        height={16}
        rx={8}
        fill="rgba(255, 255, 255)"
        // stroke="rgba(148, 163, 184)"
        strokeWidth={1}
      />
      <text
        x={labelX + 46}
        y={labelY + 3}
        textAnchor="middle"
        fontSize={12}
        fill="#000"
        fontWeight="600"
        className="kodchasan italic"
      >
        {hhmm} = {percentual.toFixed(1)}%
      </text>
    </g>
  );
}

export default function GraficoHorasRecursoComponent({
  filters,
}: FiltersProps) {
  const { isAdmin, codCliente, isLoggedIn } = useAuth();

  const query = useQuery({
    queryKey: [
      'grafico-horas-recurso',
      filters,
      isAdmin,
      codCliente,
      isLoggedIn,
    ],
    queryFn: async (): Promise<ApiResponseProps> => {
      if (!isLoggedIn) throw new Error('Usuário não autenticado');

      const params = {
        ...filters,
        isAdmin: isAdmin.toString(),
        ...(!isAdmin && codCliente ? { codCliente } : {}),
      };

      const res = await axios.get('/api/metrica-grafico/hora_recurso', {
        params,
      });
      return res.data as ApiResponseProps;
    },
    enabled: isLoggedIn,
    refetchOnWindowFocus: false,
  });

  const dadosFormatados = (query.data?.detalhesRecursos || []).map((dado) => {
    let nomeExibido = dado.nome_recurso || dado.codrec_os;

    if (nomeExibido && nomeExibido.length > 20) {
      const palavras = nomeExibido.trim().split(/\s+/);
      nomeExibido = palavras.slice(0, 2).join(' ');
      if (palavras.length > 2) nomeExibido += '...';
    }

    return { ...dado, nomeExibido };
  });

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
      {/* Conteúdo do gráfico */}
      <div className="relative z-10" style={{ height: `${alturaGrafico}px` }}>
        {query.isLoading ? (
          <div className="h-48 overflow-hidden rounded-xl border-2 border-dashed border-gray-400 bg-gray-200">
            <div className="flex h-full flex-col items-center justify-center">
              <div className="space-y-4 text-center">
                <div className="relative mx-auto flex items-center justify-center">
                  {/* Círculos animados de fundo */}
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 animate-spin rounded-full border-3 border-transparent border-t-purple-600 border-r-purple-600 [animation-duration:2s]" />
                    <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-blue-500 border-l-blue-500 [animation-direction:reverse] [animation-duration:1.5s]" />
                    <div className="absolute inset-4 animate-spin rounded-full border-2 border-transparent border-t-purple-600 border-r-purple-600 [animation-duration:1s]" />

                    {/* Ícone do banco de dados no centro */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Database
                        size={20}
                        className="animate-pulse text-gray-600"
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-md font-semibold text-gray-700">
                    Carregando dados...
                  </p>
                  <p className="text-sm text-gray-500">
                    Conectando ao banco de dados
                  </p>
                </div>

                {/* Barra de progresso animada */}
                <div className="flex justify-center space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-purple-600 [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-purple-600"></div>
                </div>
              </div>
            </div>
          </div>
        ) : query.isError ? (
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
          <div className="relative h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dadosFormatados}
                layout="vertical"
                margin={{ top: 20, right: 120, left: 10, bottom: 20 }}
                barCategoryGap="8%"
                maxBarSize={40}
              >
                <CartesianGrid
                  strokeDasharray="3 6"
                  stroke="url(#gridGradient)"
                  horizontal
                  vertical={false}
                  opacity={0.4}
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={false}
                  tickFormatter={(value) => value}
                  domain={[0, 'dataMax']}
                />
                <YAxis
                  dataKey="nomeExibido"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  width={160}
                  interval={0}
                  tick={({ x, y, payload }) => (
                    <g>
                      <rect
                        x={x - 150}
                        y={y - 12}
                        width={140}
                        height={24}
                        rx={12}
                        fill="rgba(255, 255, 255)"
                        stroke="rgba(148, 163, 184)"
                        strokeWidth={1}
                      />
                      <text
                        x={x - 144}
                        y={y + 3}
                        textAnchor="start"
                        fill="#000"
                        fontWeight={600}
                        fontSize={10}
                        className="kodchasan italic"
                      >
                        {payload.value}
                      </text>
                    </g>
                  )}
                />
                <Bar
                  dataKey="horasExecutadas"
                  radius={[0, 8, 8, 0]}
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeWidth={1}
                  minPointSize={5}
                >
                  {dadosFormatados.map((_, index) => {
                    const corIndex = index % cores.length;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={cores[corIndex]}
                        className="cursor-pointer transition-all duration-300 hover:opacity-80"
                        style={{
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                        }}
                      />
                    );
                  })}
                  <LabelList
                    position="right"
                    content={({ x, y, width, height, index }) => {
                      if (typeof index !== 'number') return null;
                      const dado = dadosFormatados[index];
                      return (
                        <CustomBottomLabels
                          x={typeof x === 'string' ? parseFloat(x) : x}
                          y={typeof y === 'string' ? parseFloat(y) : y}
                          width={
                            typeof width === 'string'
                              ? parseFloat(width)
                              : width
                          }
                          height={
                            typeof height === 'string'
                              ? parseFloat(height)
                              : height
                          }
                          value={dado.horasExecutadas}
                          percentual={dado.percentual}
                        />
                      );
                    }}
                  />
                </Bar>
                <defs>
                  {/* Gradiente para o grid */}
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

      {/* Footer com informações adicionais */}
      <div className="relative z-10 border-t border-gray-900 pt-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <DatabaseBackup className="h-8 w-8 animate-pulse text-gray-600" />
            <span className="font-semibold">
              Dados atualizados em tempo real
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
