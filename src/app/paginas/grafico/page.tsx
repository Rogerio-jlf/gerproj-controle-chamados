'use client';

import React, { useState, useEffect } from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  DollarSign,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Maximize2,
} from 'lucide-react';
import './style.css';
import { useQuery } from '@tanstack/react-query';

// Interfaces
interface ApiResponse {
  data_recursos: Recurso[];
  valor_total_custos_mes: number;
  quantidade_total_recursos_mes: number;
  media_custos_recurso_mes: number;
  quantidade_total_horas_executadas_recursos_mes: number;
  quantidade_total_horas_faturadas_recursos_mes: number;
  quantidade_total_horas_nao_faturadas_recursos_mes: number;
  valor_total_despesas_mes: number;
  valor_total_despesas_rateadas_recursos_mes: number;
}

interface Recurso {
  cod_recurso: number;
  nome_recurso: string;
  tipo_custo_recurso: number;
  valor_custo_recurso: number;
  quantidade_horas_disponiveis_recurso: number;
  quantidade_horas_executadas_recurso: number;
  quantidade_horas_faturadas_recurso: number;
  quantidade_horas_nao_faturadas_recurso: number;
  percentual_peso_recurso_total_horas_executadas: number;
  valor_rateio_despesas_recurso: number;
  valor_total_recurso_produzir_pagar: number;
  quantidade_horas_necessarias_produzir: number;
}

interface DadosGrafico {
  nome: string;
  nomeCompleto: string;
  codRecurso: number;
  horasDisponiveis: number;
  horasFaturadas: number;
  horasNaoFaturadas: number;
  horasExecutadas: number;
  horasNecessarias: number;
  percentualAtingido: number;
  percentualUtilizacao: number;
  percentualEficiencia: number;
  custo: number;
  custoPorHora: number;
  valorRateio: number;
  valorTotal: number;
  statusCor: string;
  statusTexto: string;
  nivelPerformance: number;
}

const DashboardRecursosAPI: React.FC = () => {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [tipoVisualizacao, setTipoVisualizacao] = useState<
    'overview' | 'performance' | 'financeiro' | 'radar'
  >('overview');
  const [recursoSelecionado, setRecursoSelecionado] = useState<number | null>(
    null
  );
  const [modoFullscreen, setModoFullscreen] = useState(false);

  // Função para buscar dados da API
  const {
    data: dados,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery<ApiResponse>({
    queryKey: ['chamadosDashboard', mes, ano],
    queryFn: async () => {
      const response = await fetch(
        `/api/firebird-SQL/chamados-abertos/dashboard?mes=${mes}&ano=${ano}`
      );

      if (!response.ok) {
        throw new Error(
          `Erro na API: ${response.status} ${response.statusText}`
        );
      }

      return response.json();
    },
    enabled: !!mes && !!ano,
  });

  // Função para refazer a busca dos dados
  const buscarDados = () => {
    refetch();
  };

  // Processar dados para visualizações avançadas
  const dadosProcessados: DadosGrafico[] = React.useMemo(() => {
    if (!dados) return [];
    return dados.data_recursos.map(recurso => {
      const percentualAtingido =
        recurso.quantidade_horas_necessarias_produzir > 0
          ? Math.min(
              (recurso.quantidade_horas_faturadas_recurso /
                recurso.quantidade_horas_necessarias_produzir) *
                100,
              100
            )
          : 0;

      const percentualUtilizacao =
        recurso.quantidade_horas_disponiveis_recurso > 0
          ? (recurso.quantidade_horas_executadas_recurso /
              recurso.quantidade_horas_disponiveis_recurso) *
            100
          : 0;

      const percentualEficiencia =
        recurso.quantidade_horas_executadas_recurso > 0
          ? (recurso.quantidade_horas_faturadas_recurso /
              recurso.quantidade_horas_executadas_recurso) *
            100
          : 0;

      const custoPorHora =
        recurso.quantidade_horas_faturadas_recurso > 0
          ? recurso.valor_custo_recurso /
            recurso.quantidade_horas_faturadas_recurso
          : 0;

      // Sistema de classificação de performance
      let nivelPerformance = 0;
      let statusCor = '#ef4444';
      let statusTexto = 'Crítico';

      if (percentualAtingido >= 100 && percentualEficiencia >= 80) {
        nivelPerformance = 5;
        statusCor = '#10b981';
        statusTexto = 'Excelente';
      } else if (percentualAtingido >= 90 && percentualEficiencia >= 70) {
        nivelPerformance = 4;
        statusCor = '#059669';
        statusTexto = 'Muito Bom';
      } else if (percentualAtingido >= 80 && percentualEficiencia >= 60) {
        nivelPerformance = 3;
        statusCor = '#f59e0b';
        statusTexto = 'Bom';
      } else if (percentualAtingido >= 60) {
        nivelPerformance = 2;
        statusCor = '#f97316';
        statusTexto = 'Regular';
      } else {
        nivelPerformance = 1;
        statusCor = '#ef4444';
        statusTexto = 'Precisa Atenção';
      }

      return {
        nome: recurso.nome_recurso.split(' ').slice(0, 2).join(' '),
        nomeCompleto: recurso.nome_recurso,
        codRecurso: recurso.cod_recurso,
        horasDisponiveis: Number(
          recurso.quantidade_horas_disponiveis_recurso.toFixed(1)
        ),
        horasFaturadas: Number(
          recurso.quantidade_horas_faturadas_recurso.toFixed(1)
        ),
        horasNaoFaturadas: Number(
          recurso.quantidade_horas_nao_faturadas_recurso.toFixed(1)
        ),
        horasExecutadas: Number(
          recurso.quantidade_horas_executadas_recurso.toFixed(1)
        ),
        horasNecessarias: Number(
          recurso.quantidade_horas_necessarias_produzir.toFixed(1)
        ),
        percentualAtingido: Number(percentualAtingido.toFixed(1)),
        percentualUtilizacao: Number(percentualUtilizacao.toFixed(1)),
        percentualEficiencia: Number(percentualEficiencia.toFixed(1)),
        custo: recurso.valor_custo_recurso,
        custoPorHora: Number(custoPorHora.toFixed(2)),
        valorRateio: recurso.valor_rateio_despesas_recurso,
        valorTotal: recurso.valor_total_recurso_produzir_pagar,
        statusCor,
        statusTexto,
        nivelPerformance,
      };
    });
  }, [dados]);

  // Métricas consolidadas
  const metricas = React.useMemo(() => {
    if (!dados || dadosProcessados.length === 0) return null;

    const totalHorasDisponiveis = dadosProcessados.reduce(
      (sum, r) => sum + r.horasDisponiveis,
      0
    );
    const totalHorasExecutadas = dadosProcessados.reduce(
      (sum, r) => sum + r.horasExecutadas,
      0
    );
    const totalHorasFaturadas = dadosProcessados.reduce(
      (sum, r) => sum + r.horasFaturadas,
      0
    );
    const totalHorasNecessarias = dadosProcessados.reduce(
      (sum, r) => sum + r.horasNecessarias,
      0
    );

    const utilizacaoMedia =
      totalHorasDisponiveis > 0
        ? (totalHorasExecutadas / totalHorasDisponiveis) * 100
        : 0;
    const eficienciaMedia =
      totalHorasExecutadas > 0
        ? (totalHorasFaturadas / totalHorasExecutadas) * 100
        : 0;
    const metaAtingidaMedia =
      totalHorasNecessarias > 0
        ? (totalHorasFaturadas / totalHorasNecessarias) * 100
        : 0;

    const recursosExcelentes = dadosProcessados.filter(
      r => r.nivelPerformance >= 4
    ).length;
    const recursosCriticos = dadosProcessados.filter(
      r => r.nivelPerformance <= 2
    ).length;

    return {
      utilizacaoMedia: Number(utilizacaoMedia.toFixed(1)),
      eficienciaMedia: Number(eficienciaMedia.toFixed(1)),
      metaAtingidaMedia: Number(metaAtingidaMedia.toFixed(1)),
      recursosExcelentes,
      recursosCriticos,
      custoMedio: dados.media_custos_recurso_mes,
      horasOciosas: Number(
        (totalHorasDisponiveis - totalHorasExecutadas).toFixed(1)
      ),
      horasImprodutivas: Number(
        (totalHorasExecutadas - totalHorasFaturadas).toFixed(1)
      ),
    };
  }, [dados, dadosProcessados]);

  // Tooltip personalizado avançado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="max-w-sm rounded-xl border border-gray-200 bg-white/95 p-4 shadow-2xl backdrop-blur-sm">
          <h4 className="mb-3 text-lg font-bold text-gray-800">
            {data.nomeCompleto}
          </h4>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">Disponíveis:</span>
                <span className="font-semibold">{data.horasDisponiveis}h</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Faturadas:</span>
                <span className="font-semibold">{data.horasFaturadas}h</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                <span className="text-gray-600">Não Faturadas:</span>
                <span className="font-semibold">{data.horasNaoFaturadas}h</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: data.statusCor }}
                >
                  {data.percentualAtingido}%
                </div>
                <div className="text-xs text-gray-500">Meta Atingida</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">
                  {data.percentualEficiencia}%
                </div>
                <div className="text-xs text-gray-500">Eficiência</div>
              </div>
            </div>
          </div>

          <div className="mt-3 border-t border-gray-200 pt-3">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Custo/Hora:</span>
              <span className="font-medium">
                R$ {data.custoPorHora.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Status:</span>
              <span className="font-medium" style={{ color: data.statusCor }}>
                {data.statusTexto}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Componente de KPI Card melhorado
  const KPICard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'stable';
    color: string;
    size?: 'normal' | 'large';
  }> = ({ icon, title, value, subtitle, trend, color, size = 'normal' }) => (
    <div
      className={`rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${size === 'large' ? 'col-span-2' : ''}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className={`rounded-xl p-3 ${color}`}>{icon}</div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}
          >
            {trend === 'up' && <TrendingUp className="h-4 w-4" />}
            {trend === 'down' && <TrendingDown className="h-4 w-4" />}
          </div>
        )}
      </div>
      <h3 className="mb-1 text-sm font-medium text-gray-600">{title}</h3>
      <p
        className={`${size === 'large' ? 'text-4xl' : 'text-3xl'} mb-1 font-bold text-gray-800`}
      >
        {value}
      </p>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );

  // Componente de Performance Individual
  const PerformanceGrid = () => (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {dadosProcessados
        .sort((a, b) => b.percentualAtingido - a.percentualAtingido)
        .map(recurso => (
          <div
            key={recurso.codRecurso}
            className={`cursor-pointer rounded-xl border-2 bg-white/90 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${
              recursoSelecionado === recurso.codRecurso
                ? 'scale-105 border-blue-400'
                : 'border-white/30 hover:border-gray-300'
            }`}
            onClick={() =>
              setRecursoSelecionado(
                recursoSelecionado === recurso.codRecurso
                  ? null
                  : recurso.codRecurso
              )
            }
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="flex-1 truncate text-sm font-semibold text-gray-800">
                {recurso.nome}
              </h4>
              <div
                className="ml-2 h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: recurso.statusCor }}
              />
            </div>

            {/* Gauge circular para meta */}
            <div className="relative mb-4">
              <svg className="mx-auto h-20 w-20" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={recurso.statusCor}
                  strokeWidth="2"
                  strokeDasharray={`${recurso.percentualAtingido}, 100`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div
                    className="text-lg font-bold"
                    style={{ color: recurso.statusCor }}
                  >
                    {recurso.percentualAtingido}%
                  </div>
                  <div className="text-xs text-gray-500">Meta</div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Faturadas:</span>
                <span className="font-medium">{recurso.horasFaturadas}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Eficiência:</span>
                <span className="font-medium">
                  {recurso.percentualEficiencia}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Utilização:</span>
                <span className="font-medium">
                  {recurso.percentualUtilizacao}%
                </span>
              </div>
            </div>

            {/* Badge de status */}
            <div className="mt-3">
              <span
                className="inline-block rounded-full px-2 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: recurso.statusCor }}
              >
                {recurso.statusTexto}
              </span>
            </div>
          </div>
        ))}
    </div>
  );

  // Gráfico Radar para análise multidimensional
  const RadarAnalysis = () => {
    const radarData = dadosProcessados.slice(0, 6).map(recurso => ({
      nome: recurso.nome,
      Meta: recurso.percentualAtingido,
      Eficiência: recurso.percentualEficiencia,
      Utilização: recurso.percentualUtilizacao,
      Performance: recurso.nivelPerformance * 20,
    }));

    return (
      <ResponsiveContainer width="100%" height={500}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="nome" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tickCount={6}
            tick={{ fontSize: 10 }}
          />
          <Radar
            name="Meta Atingida"
            dataKey="Meta"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.1}
            strokeWidth={2}
          />
          <Radar
            name="Eficiência"
            dataKey="Eficiência"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.1}
            strokeWidth={2}
          />
          <Radar
            name="Utilização"
            dataKey="Utilização"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.1}
            strokeWidth={2}
          />
          <Legend />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="mx-auto mb-4 h-20 w-20 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute top-4 left-1/2 h-12 w-12 -translate-x-1/2 transform animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
          </div>
          <p className="text-lg font-medium text-gray-600">
            Carregando insights...
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Preparando dados de performance
          </p>
        </div>
      </div>
    );
  }

  if (error || !dados || !metricas) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white/90 p-8 shadow-2xl backdrop-blur-sm">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h2 className="mb-2 text-2xl font-bold text-gray-800">
              Ops! Algo deu errado
            </h2>
            <p className="mb-6 text-gray-600">
              {(error instanceof Error ? error.message : error) ||
                'Não foi possível carregar os dados'}
            </p>
            <button
              onClick={buscarDados}
              className="w-full transform rounded-xl bg-gradient-to-r from-red-500 to-pink-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:from-red-600 hover:to-pink-700"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${modoFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} overflow-auto bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/30`}
    >
      {/* Background decorativo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 blur-3xl"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-[2000px] p-6">
        {/* Header Premium */}
        <div className="mb-8 rounded-3xl border border-white/30 bg-white/80 p-8 shadow-2xl backdrop-blur-lg">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-5xl font-bold text-transparent">
                Performance Analytics
              </h1>
              <p className="text-xl text-gray-600">
                Dashboard Executivo de Recursos •{' '}
                {new Date(ano, mes - 1)
                  .toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric',
                  })
                  .replace(/^\w/, c => c.toUpperCase())}
              </p>
            </div>

            <button
              onClick={() => setModoFullscreen(!modoFullscreen)}
              className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-3 text-white transition-all duration-300 hover:from-blue-600 hover:to-indigo-700"
            >
              <Maximize2 className="h-6 w-6" />
            </button>
          </div>

          {/* Controles */}
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-xl bg-white/60 px-4 py-2">
                <label className="text-sm font-medium text-gray-700">
                  Período:
                </label>
                <select
                  value={mes}
                  onChange={e => setMes(Number(e.target.value))}
                  className="border-none bg-transparent text-sm font-medium focus:outline-none"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2026, i).toLocaleDateString('pt-BR', {
                        month: 'long',
                      })}
                    </option>
                  ))}
                </select>
                <select
                  value={ano}
                  onChange={e => setAno(Number(e.target.value))}
                  className="border-none bg-transparent text-sm font-medium focus:outline-none"
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <option key={2026 - i} value={2026 - i}>
                      {2026 - i}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              {[
                {
                  key: 'overview',
                  label: 'Visão Geral',
                  icon: <BarChart3 className="h-4 w-4" />,
                },
                {
                  key: 'performance',
                  label: 'Performance',
                  icon: <Target className="h-4 w-4" />,
                },
                {
                  key: 'financeiro',
                  label: 'Financeiro',
                  icon: <DollarSign className="h-4 w-4" />,
                },
                {
                  key: 'radar',
                  label: 'Análise Radar',
                  icon: <Activity className="h-4 w-4" />,
                },
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setTipoVisualizacao(key as any)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    tipoVisualizacao === key
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'bg-white/60 text-gray-700 hover:bg-white/80'
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KPIs Principais */}
        <div className="mb-8 grid grid-cols-6 gap-6">
          <KPICard
            icon={<Users className="h-6 w-6 text-white" />}
            title="Total de Recursos"
            value={dados.quantidade_total_recursos_mes}
            color="bg-gradient-to-r from-blue-500 to-indigo-600"
          />

          <KPICard
            icon={<Target className="h-6 w-6 text-white" />}
            title="Meta Geral"
            value={`${metricas.metaAtingidaMedia}%`}
            subtitle={
              metricas.metaAtingidaMedia >= 100
                ? '🎯 Meta atingida!'
                : '📈 Em progresso'
            }
            trend={metricas.metaAtingidaMedia >= 80 ? 'up' : 'down'}
            color="bg-gradient-to-r from-green-500 to-emerald-600"
          />

          <KPICard
            icon={<Activity className="h-6 w-6 text-white" />}
            title="Eficiência Média"
            value={`${metricas.eficienciaMedia}%`}
            subtitle={`${metricas.horasImprodutivas}h improdutivas`}
            color="bg-gradient-to-r from-purple-500 to-violet-600"
          />

          <KPICard
            icon={<Clock className="h-6 w-6 text-white" />}
            title="Utilização"
            value={`${metricas.utilizacaoMedia}%`}
            subtitle={`${metricas.horasOciosas}h ociosas`}
            color="bg-gradient-to-r from-orange-500 to-red-600"
          />

          <KPICard
            icon={<CheckCircle className="h-6 w-6 text-white" />}
            title="Top Performers"
            value={metricas.recursosExcelentes}
            subtitle={`${((metricas.recursosExcelentes / dadosProcessados.length) * 100).toFixed(0)}% da equipe`}
            color="bg-gradient-to-r from-teal-500 to-lime-600"
          />

          <KPICard
            icon={<AlertTriangle className="h-6 w-6 text-white" />}
            title="Recursos Críticos"
            value={metricas.recursosCriticos}
            subtitle={`${((metricas.recursosCriticos / dadosProcessados.length) * 100).toFixed(0)}% da equipe`}
            color="bg-gradient-to-r from-red-500 to-rose-600"
          />
        </div>

        {/* Conteúdo dinâmico */}
        {tipoVisualizacao === 'overview' && (
          <div className="rounded-3xl border border-white/30 bg-white/80 p-6 shadow-xl backdrop-blur-lg">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Desempenho Operacional
                </h2>
                <p className="text-gray-600">
                  Comparativo de capacidade, produção e eficácia
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Ordenar por:</span>
                <select
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm"
                  onChange={e => {
                    // Adicione lógica de ordenação se necessário
                  }}
                >
                  <option value="nome">Nome do Recurso</option>
                  <option value="atingimento">% Atingimento</option>
                  <option value="horas">Horas Faturadas</option>
                </select>
              </div>
            </div>

            {/* Dividir os dados em chunks de 10 itens cada */}
            {(() => {
              const chunkSize = 10;
              const chunks = [];
              const sortedData = [...dadosProcessados].sort(
                (a, b) => b.horasFaturadas - a.horasFaturadas
              );

              for (let i = 0; i < sortedData.length; i += chunkSize) {
                chunks.push(sortedData.slice(i, i + chunkSize));
              }

              return (
                <div className="space-y-8">
                  {chunks.map((chunk, index) => (
                    <div
                      key={index}
                      className={`rounded-xl bg-gradient-to-br from-white to-gray-50 p-5 shadow-lg ${index > 0 ? 'mt-8 border-t border-gray-200 pt-8' : ''}`}
                    >
                      {index > 0 && (
                        <div className="mb-4 text-center text-sm font-medium text-gray-500">
                          Continuação ({index * chunkSize + 1}-
                          {Math.min((index + 1) * chunkSize, sortedData.length)}{' '}
                          de {sortedData.length} recursos)
                        </div>
                      )}

                      <ResponsiveContainer width="100%" height={500}>
                        <ComposedChart
                          data={chunk}
                          margin={{ top: 20, right: 30, bottom: 80, left: 50 }}
                          barCategoryGap={25}
                          barGap={8}
                        >
                          <defs>
                            <linearGradient
                              id={`barGradientBlue-${index}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#3b82f6"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="100%"
                                stopColor="#3b82f6"
                                stopOpacity={0.2}
                              />
                            </linearGradient>
                            <linearGradient
                              id={`barGradientOrange-${index}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#f59e0b"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="100%"
                                stopColor="#f59e0b"
                                stopOpacity={0.2}
                              />
                            </linearGradient>
                            <linearGradient
                              id={`barGradientGreen-${index}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#10b981"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="100%"
                                stopColor="#10b981"
                                stopOpacity={0.2}
                              />
                            </linearGradient>
                            <linearGradient
                              id={`barGradientPurple-${index}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#8b5cf6"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="100%"
                                stopColor="#8b5cf6"
                                stopOpacity={0.2}
                              />
                            </linearGradient>
                          </defs>

                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#e5e7eb"
                          />

                          <XAxis
                            dataKey="nome"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fontWeight: 500 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />

                          <YAxis
                            yAxisId="left"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11 }}
                            label={{
                              value: 'Horas',
                              angle: -90,
                              position: 'insideLeft',
                              fontSize: 12,
                              fontWeight: 600,
                              fill: '#4b5563',
                            }}
                          />

                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            domain={[0, 100]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11 }}
                            label={{
                              value: '% Atingimento',
                              angle: 90,
                              position: 'insideRight',
                              fontSize: 12,
                              fontWeight: 600,
                              fill: '#4b5563',
                            }}
                          />

                          <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: '#f3f4f6', opacity: 0.5 }}
                          />

                          <Legend
                            wrapperStyle={{ paddingTop: '30px' }}
                            formatter={value => (
                              <span className="text-xs font-medium text-gray-600">
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
                            label={{
                              position: 'top',
                              formatter: (value: number) => `${value}h`,
                              fill: '#1e40af',
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          />

                          <Bar
                            yAxisId="left"
                            name="Executadas"
                            dataKey="horasExecutadas"
                            fill={`url(#barGradientOrange-${index})`}
                            radius={[6, 6, 0, 0]}
                            animationDuration={1500}
                            label={{
                              position: 'top',
                              formatter: (value: number) => `${value}h`,
                              fill: '#92400e',
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          />

                          <Bar
                            yAxisId="left"
                            name="Faturadas"
                            dataKey="horasFaturadas"
                            fill={`url(#barGradientGreen-${index})`}
                            radius={[6, 6, 0, 0]}
                            animationDuration={1500}
                            label={{
                              position: 'top',
                              formatter: (value: number) => `${value}h`,
                              fill: '#065f46',
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          />

                          <Bar
                            yAxisId="right"
                            name="% Meta"
                            dataKey="percentualAtingido"
                            fill={`url(#barGradientPurple-${index})`}
                            radius={[6, 6, 0, 0]}
                            animationDuration={1500}
                            label={{
                              position: 'top',
                              formatter: (value: number) => `${value}%`,
                              fill: '#5b21b6',
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>

                      {/* Mostrar legenda apenas no último gráfico */}
                      {index === chunks.length - 1 && (
                        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
                          <div className="flex items-center">
                            <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
                            <span>
                              Horas Disponíveis = Capacidade total do recurso
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="mr-2 h-3 w-3 rounded-full bg-amber-500"></div>
                            <span>
                              Horas Executadas = Tempo efetivamente trabalhado
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="mr-2 h-3 w-3 rounded-full bg-emerald-500"></div>
                            <span>
                              Horas Faturadas = Tempo que gerou receita
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="mr-2 h-3 w-3 rounded-full bg-violet-500"></div>
                            <span>% Meta = Faturado vs Necessário</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {tipoVisualizacao === 'performance' && (
          <div className="rounded-3xl border border-white/30 bg-white/80 p-6 shadow-xl backdrop-blur-lg">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              Performance Individual
            </h2>
            <PerformanceGrid />
          </div>
        )}

        {tipoVisualizacao === 'radar' && (
          <div className="rounded-3xl border border-white/30 bg-white/80 p-6 shadow-xl backdrop-blur-lg">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              Análise Radar
            </h2>
            <RadarAnalysis />
          </div>
        )}

        {tipoVisualizacao === 'financeiro' && (
          <div className="rounded-3xl border border-white/30 bg-white/80 p-6 shadow-xl backdrop-blur-lg">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              Resumo Financeiro
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <KPICard
                icon={<DollarSign className="h-6 w-6 text-white" />}
                title="Custo Médio por Recurso"
                value={`R$ ${metricas.custoMedio.toFixed(2)}`}
                color="bg-gradient-to-r from-yellow-500 to-amber-600"
              />
              <KPICard
                icon={<DollarSign className="h-6 w-6 text-white" />}
                title="Total de Custos"
                value={`R$ ${dados.valor_total_custos_mes.toLocaleString(
                  'pt-BR',
                  {
                    minimumFractionDigits: 2,
                  }
                )}`}
                color="bg-gradient-to-r from-emerald-500 to-teal-600"
              />
              <KPICard
                icon={<DollarSign className="h-6 w-6 text-white" />}
                title="Despesas Rateadas"
                value={`R$ ${dados.valor_total_despesas_rateadas_recursos_mes.toLocaleString(
                  'pt-BR',
                  {
                    minimumFractionDigits: 2,
                  }
                )}`}
                color="bg-gradient-to-r from-pink-500 to-fuchsia-600"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardRecursosAPI;
