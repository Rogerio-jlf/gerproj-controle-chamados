'use client';
import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Calculator,
  Target,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Filter,
  CreditCard,
  Wallet,
  Building,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Award,
  AlertCircle,
} from 'lucide-react';

// Interfaces para tipagem
interface RecursoFinanceiro {
  nome: string;
  custoHora: number;
  horasFaturadas: number;
  horasNaoFaturadas: number;
  custoTotal: number;
  receita: number;
  margemLucro: number;
  eficienciaFinanceira: number;
}

interface DadosFinanceiros {
  valor_total_geral_custos: number;
  valor_total_geral_despesas_rateadas: number;
  receita_total: number;
  margem_bruta: number;
  custos_fixos: number;
  custos_variaveis: number;
}

interface MetricasFinanceiras {
  custoMedio: number;
  receitaMedia: number;
  margemMedia: number;
  eficienciaMedia: number;
}

interface DashboardFinanceiroProps {
  metricas: MetricasFinanceiras;
  dados: DadosFinanceiros;
  recursos?: RecursoFinanceiro[];
}

// Card Financeiro Premium
const FinancialCard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
  trend?: { value: number; label: string; period?: string };
  badge?: string;
  status?: 'positive' | 'negative' | 'neutral';
  animation?: boolean;
}> = ({
  title,
  value,
  subtitle,
  icon,
  gradient,
  trend,
  badge,
  status,
  animation = true,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'positive':
        return 'text-emerald-100';
      case 'negative':
        return 'text-red-100';
      default:
        return 'text-white';
    }
  };

  return (
    <div
      className={`${gradient} hover:shadow-3xl group relative transform overflow-hidden rounded-2xl p-6 text-white shadow-2xl transition-all duration-300 hover:scale-105`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-6 -right-6 h-32 w-32 rotate-12 transform rounded-full bg-white"></div>
        <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white"></div>
        <div className="absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-white opacity-30"></div>
      </div>

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="bg-opacity-20 rounded-xl bg-white p-3 backdrop-blur-sm">
            <div className={`text-2xl ${animation ? 'animate-pulse' : ''}`}>
              {icon}
            </div>
          </div>
          {badge && (
            <span className="bg-opacity-20 rounded-full bg-white px-3 py-1 text-xs font-bold backdrop-blur-sm">
              {badge}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium opacity-90">{title}</h3>
          <div
            className={`text-3xl font-bold tracking-tight ${getStatusColor()}`}
          >
            {value}
          </div>
          {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
        </div>

        {trend && (
          <div className="border-opacity-20 mt-4 flex items-center justify-between border-t border-white pt-4">
            <div className="flex items-center space-x-2">
              {trend.value > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-200" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-200" />
              )}
              <span
                className={`text-sm font-semibold ${trend.value > 0 ? 'text-emerald-200' : 'text-red-200'}`}
              >
                {Math.abs(trend.value).toFixed(1)}%
              </span>
            </div>
            <span className="text-xs opacity-70">
              {trend.period || 'vs mês anterior'}
            </span>
          </div>
        )}
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
    </div>
  );
};

// Componente de Análise de Rentabilidade
const ProfitabilityAnalysis: React.FC<{
  recursos: RecursoFinanceiro[];
  showDetails: boolean;
}> = ({ recursos, showDetails }) => {
  const sortedByProfitability = [...recursos].sort(
    (a, b) => b.margemLucro - a.margemLucro
  );
  const topPerformers = sortedByProfitability.slice(0, 3);
  const needsAttention = sortedByProfitability.filter(r => r.margemLucro < 20);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center text-xl font-bold text-gray-800">
          <Target className="mr-3 h-6 w-6 text-blue-600" />
          Análise de Rentabilidade
        </h3>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
          {recursos.length} recursos
        </span>
      </div>

      {showDetails && (
        <div className="space-y-6">
          {/* Top Performers */}
          <div>
            <h4 className="mb-3 flex items-center font-semibold text-green-800">
              <Award className="mr-2 h-4 w-4" />
              Recursos Mais Rentáveis
            </h4>
            <div className="space-y-3">
              {topPerformers.map((recurso, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <span className="font-medium text-green-800">
                      {recurso.nome}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-700">
                      {recurso.margemLucro.toFixed(1)}%
                    </div>
                    <div className="text-xs text-green-600">
                      R$ {recurso.receita.toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Needs Attention */}
          {needsAttention.length > 0 && (
            <div>
              <h4 className="mb-3 flex items-center font-semibold text-red-800">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Requer Atenção (Margem &lt; 20%)
              </h4>
              <div className="space-y-3">
                {needsAttention.map((recurso, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-6 w-6 text-red-500" />
                      <span className="font-medium text-red-800">
                        {recurso.nome}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-700">
                        {recurso.margemLucro.toFixed(1)}%
                      </div>
                      <div className="text-xs text-red-600">
                        Custo: R$ {recurso.custoTotal.toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente de Gráfico de Distribuição de Custos
const CostDistributionChart: React.FC<{
  custoFixo: number;
  custoVariavel: number;
  despesasRateadas: number;
}> = ({ custoFixo, custoVariavel, despesasRateadas }) => {
  const total = custoFixo + custoVariavel + despesasRateadas;

  const segments = [
    {
      label: 'Custos Fixos',
      value: custoFixo,
      color: 'from-blue-500 to-blue-600',
      percentage: (custoFixo / total) * 100,
    },
    {
      label: 'Custos Variáveis',
      value: custoVariavel,
      color: 'from-green-500 to-green-600',
      percentage: (custoVariavel / total) * 100,
    },
    {
      label: 'Despesas Rateadas',
      value: despesasRateadas,
      color: 'from-purple-500 to-purple-600',
      percentage: (despesasRateadas / total) * 100,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
      <h3 className="mb-6 flex items-center text-xl font-bold text-gray-800">
        <PieChart className="mr-3 h-6 w-6 text-purple-600" />
        Distribuição de Custos
      </h3>

      <div className="space-y-4">
        {segments.map((segment, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">{segment.label}</span>
              <div className="text-right">
                <div className="font-bold text-gray-800">
                  R$ {segment.value.toLocaleString('pt-BR')}
                </div>
                <div className="text-sm text-gray-500">
                  {segment.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`bg-gradient-to-r ${segment.color} relative h-full rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${segment.percentage}%` }}
              >
                <div className="bg-opacity-20 absolute inset-0 animate-pulse bg-white"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-800">Total Geral</span>
          <span className="text-2xl font-bold text-gray-900">
            R$ {total.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>
    </div>
  );
};

// Dashboard Principal
export default function DashboardFinanceiro({
  metricas,
  dados,
  recursos = [],
}: DashboardFinanceiroProps) {
  const [showAnalysisDetails, setShowAnalysisDetails] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('mensal');

  // Dados simulados de recursos se não fornecidos
  const recursosFinanceiros: RecursoFinanceiro[] =
    recursos.length > 0
      ? recursos
      : [
          {
            nome: 'João Silva',
            custoHora: 85.5,
            horasFaturadas: 152,
            horasNaoFaturadas: 18,
            custoTotal: 14535,
            receita: 22800,
            margemLucro: 36.2,
            eficienciaFinanceira: 89.4,
          },
          {
            nome: 'Maria Santos',
            custoHora: 92.0,
            horasFaturadas: 148,
            horasNaoFaturadas: 12,
            custoTotal: 14720,
            receita: 26640,
            margemLucro: 44.8,
            eficienciaFinanceira: 92.5,
          },
          {
            nome: 'Pedro Costa',
            custoHora: 78.0,
            horasFaturadas: 135,
            horasNaoFaturadas: 25,
            custoTotal: 12480,
            receita: 18900,
            margemLucro: 34.0,
            eficienciaFinanceira: 84.4,
          },
          {
            nome: 'Ana Oliveira',
            custoHora: 95.5,
            horasFaturadas: 168,
            horasNaoFaturadas: 8,
            custoTotal: 16808,
            receita: 28560,
            margemLucro: 41.1,
            eficienciaFinanceira: 95.5,
          },
        ];

  // Cálculos financeiros avançados
  const financialStats = useMemo(() => {
    // Verificações de segurança para propriedades que podem estar undefined
    const totalReceita =
      dados?.receita_total ||
      recursosFinanceiros.reduce((acc, r) => acc + r.receita, 0);
    const totalCustos = dados?.valor_total_geral_custos || 0;
    const despesasRateadas = dados?.valor_total_geral_despesas_rateadas || 0;
    const custoFixo = dados?.custos_fixos || totalCustos * 0.4;
    const custoVariavel = dados?.custos_variaveis || totalCustos * 0.6;

    const margemBruta =
      totalReceita > 0
        ? ((totalReceita - totalCustos) / totalReceita) * 100
        : 0;
    const roiMedio =
      totalCustos > 0 ? ((totalReceita - totalCustos) / totalCustos) * 100 : 0;

    const custoMedioRecurso =
      recursosFinanceiros.length > 0
        ? totalCustos / recursosFinanceiros.length
        : 0;
    const receitaMediaRecurso =
      recursosFinanceiros.length > 0
        ? totalReceita / recursosFinanceiros.length
        : 0;
    const eficienciaFinanceiraMedia =
      recursosFinanceiros.length > 0
        ? recursosFinanceiros.reduce(
            (acc, r) => acc + r.eficienciaFinanceira,
            0
          ) / recursosFinanceiros.length
        : 0;

    const recursosLucrativos = recursosFinanceiros.filter(
      r => r.margemLucro > 30
    ).length;
    const recursosAtencao = recursosFinanceiros.filter(
      r => r.margemLucro < 20
    ).length;

    return {
      totalReceita,
      totalCustos,
      margemBruta,
      roiMedio,
      custoMedioRecurso,
      receitaMediaRecurso,
      eficienciaFinanceiraMedia,
      recursosLucrativos,
      recursosAtencao,
      lucroLiquido: totalReceita - totalCustos - despesasRateadas,
      despesasRateadas,
      custoFixo,
      custoVariavel,
    };
  }, [dados, recursosFinanceiros]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-6 text-center">
          <div className="bg-opacity-70 inline-flex items-center rounded-full bg-white px-8 py-4 shadow-lg backdrop-blur-sm">
            <DollarSign className="mr-4 h-8 w-8 text-emerald-600" />
            <h1 className="text-4xl font-black tracking-tight text-gray-800">
              Dashboard Financeiro
            </h1>
          </div>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">
            Análise completa de performance financeira, rentabilidade e custos
            operacionais
          </p>
        </div>

        {/* Controles */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-gray-600" />
                <span className="font-semibold text-gray-700">Período:</span>
              </div>
              <select
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="mensal">Mensal</option>
                <option value="trimestral">Trimestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>

            <button
              onClick={() => setShowAnalysisDetails(!showAnalysisDetails)}
              className="flex items-center space-x-2 rounded-xl bg-blue-100 px-4 py-2 transition-colors hover:bg-blue-200"
            >
              {showAnalysisDetails ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="font-medium">
                {showAnalysisDetails ? 'Ocultar' : 'Mostrar'} Detalhes
              </span>
            </button>
          </div>
        </div>

        {/* Cards Financeiros Principais */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FinancialCard
            title="Receita Total"
            value={`R$ ${financialStats.totalReceita.toLocaleString('pt-BR')}`}
            subtitle={`R$ ${financialStats.receitaMediaRecurso.toLocaleString('pt-BR')} por recurso`}
            icon={<DollarSign />}
            gradient="bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-700"
            trend={{ value: 15.3, label: 'crescimento' }}
            badge="REVENUE"
            status="positive"
          />

          <FinancialCard
            title="Custos Totais"
            value={`R$ ${financialStats.totalCustos.toLocaleString('pt-BR')}`}
            subtitle={`R$ ${financialStats.custoMedioRecurso.toLocaleString('pt-BR')} por recurso`}
            icon={<Calculator />}
            gradient="bg-gradient-to-br from-red-500 via-red-600 to-pink-700"
            trend={{ value: -8.7, label: 'redução' }}
            badge="COSTS"
            status="positive"
          />

          <FinancialCard
            title="Margem Bruta"
            value={`${financialStats.margemBruta.toFixed(1)}%`}
            subtitle={`R$ ${(financialStats.totalReceita - financialStats.totalCustos).toLocaleString('pt-BR')} lucro bruto`}
            icon={<TrendingUp />}
            gradient="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700"
            trend={{ value: 22.1, label: 'melhoria' }}
            badge="MARGIN"
            status="positive"
          />

          <FinancialCard
            title="ROI Médio"
            value={`${financialStats.roiMedio.toFixed(1)}%`}
            subtitle={`${financialStats.recursosLucrativos}/${recursosFinanceiros.length} recursos lucrativos`}
            icon={<Target />}
            gradient="bg-gradient-to-br from-purple-500 via-purple-600 to-violet-700"
            trend={{ value: 11.4, label: 'otimização' }}
            badge="ROI"
            status="positive"
          />
        </div>

        {/* Seção de Análises */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Distribuição de Custos */}
          <CostDistributionChart
            custoFixo={financialStats.custoFixo}
            custoVariavel={financialStats.custoVariavel}
            despesasRateadas={financialStats.despesasRateadas}
          />

          {/* Análise de Rentabilidade */}
          <ProfitabilityAnalysis
            recursos={recursosFinanceiros}
            showDetails={showAnalysisDetails}
          />
        </div>

        {/* Tabela Financeira de Recursos */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center text-xl font-bold text-white">
                <Users className="mr-3 h-6 w-6" />
                Performance Financeira por Recurso
              </h2>
              <span className="bg-opacity-10 rounded-full bg-white px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                {recursosFinanceiros.length} recursos
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-700">
                    Recurso
                  </th>
                  <th className="px-6 py-4 text-center font-bold text-gray-700">
                    Custo/Hora
                  </th>
                  <th className="px-6 py-4 text-center font-bold text-gray-700">
                    Horas Faturadas
                  </th>
                  <th className="px-6 py-4 text-center font-bold text-gray-700">
                    Receita
                  </th>
                  <th className="px-6 py-4 text-center font-bold text-gray-700">
                    Custo Total
                  </th>
                  <th className="px-6 py-4 text-center font-bold text-gray-700">
                    Margem
                  </th>
                  <th className="px-6 py-4 text-center font-bold text-gray-700">
                    Eficiência
                  </th>
                </tr>
              </thead>
              <tbody>
                {recursosFinanceiros.map((recurso, index) => {
                  const isHighMargin = recurso.margemLucro > 35;
                  const isLowMargin = recurso.margemLucro < 20;

                  return (
                    <tr
                      key={index}
                      className={`border-b border-gray-100 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 ${
                        isHighMargin
                          ? 'bg-opacity-50 bg-green-50'
                          : isLowMargin
                            ? 'bg-opacity-50 bg-red-50'
                            : ''
                      }`}
                    >
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white shadow-lg ${
                              isHighMargin
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                : isLowMargin
                                  ? 'bg-gradient-to-r from-red-500 to-pink-600'
                                  : 'bg-gradient-to-r from-blue-500 to-purple-600'
                            }`}
                          >
                            {recurso.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              {recurso.nome}
                            </div>
                            <div className="text-sm text-gray-500">
                              {recurso.horasFaturadas +
                                recurso.horasNaoFaturadas}
                              h total
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="font-bold text-gray-800">
                          R$ {recurso.custoHora.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="space-y-1">
                          <div className="font-bold text-blue-700">
                            {recurso.horasFaturadas}h
                          </div>
                          <div className="text-xs text-gray-500">
                            {recurso.horasNaoFaturadas}h não faturadas
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="text-lg font-bold text-green-700">
                          R$ {recurso.receita.toLocaleString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="font-bold text-red-700">
                          R$ {recurso.custoTotal.toLocaleString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="space-y-2">
                          <div
                            className={`text-lg font-bold ${
                              isHighMargin
                                ? 'text-green-700'
                                : isLowMargin
                                  ? 'text-red-700'
                                  : 'text-blue-700'
                            }`}
                          >
                            {recurso.margemLucro.toFixed(1)}%
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                              className={`h-2 rounded-full transition-all duration-700 ${
                                isHighMargin
                                  ? 'bg-gradient-to-r from-green-400 to-green-600'
                                  : isLowMargin
                                    ? 'bg-gradient-to-r from-red-400 to-red-600'
                                    : 'bg-gradient-to-r from-blue-400 to-blue-600'
                              }`}
                              style={{
                                width: `${Math.min(recurso.margemLucro, 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="text-lg font-bold text-purple-700">
                            {recurso.eficienciaFinanceira.toFixed(1)}%
                          </div>
                          <div
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              recurso.eficienciaFinanceira > 90
                                ? 'bg-green-100 text-green-800'
                                : recurso.eficienciaFinanceira > 80
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {recurso.eficienciaFinanceira > 90
                              ? 'Excelente'
                              : recurso.eficienciaFinanceira > 80
                                ? 'Bom'
                                : 'Regular'}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumo Executivo */}
        <div className="rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 p-8 text-white shadow-2xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h4 className="mb-3 flex items-center text-lg font-bold">
                <CheckCircle className="mr-2 h-5 w-5 text-green-400" />
                Pontos Fortes
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  • Margem bruta saudável:{' '}
                  {financialStats.margemBruta.toFixed(1)}%
                </li>
                <li>
                  • {financialStats.recursosLucrativos} recursos altamente
                  rentáveis
                </li>
                <li>• ROI médio de {financialStats.roiMedio.toFixed(1)}%</li>
                <li>
                  • Eficiência financeira média:{' '}
                  {financialStats.eficienciaFinanceiraMedia.toFixed(1)}%
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 flex items-center text-lg font-bold">
                <AlertTriangle className="mr-2 h-5 w-5 text-yellow-400" />
                Oportunidades
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  • {financialStats.recursosAtencao} recursos com margem &lt;
                  20%
                </li>
                <li>• Otimizar distribuição de custos fixos</li>
                <li>
                  • Reduzir despesas rateadas em{' '}
                  {financialStats.totalCustos > 0
                    ? (
                        (financialStats.despesasRateadas /
                          financialStats.totalCustos) *
                        100
                      ).toFixed(1)
                    : '0'}
                  %
                </li>
                <li>• Aumentar horas faturáveis por recurso</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 flex items-center text-lg font-bold">
                <Target className="mr-2 h-5 w-5 text-blue-400" />
                Próximas Ações
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li>• Revisar precificação de recursos de baixa margem</li>
                <li>• Implementar controles de custos variáveis</li>
                <li>• Estabelecer metas de margem por recurso</li>
                <li>• Melhorar eficiência operacional</li>
              </ul>
            </div>
          </div>

          {/* Indicadores Financeiros em Destaque */}
          <div className="mt-8 border-t border-gray-600 pt-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-1 text-3xl font-bold text-green-400">
                  R$ {financialStats.lucroLiquido.toLocaleString('pt-BR')}
                </div>
                <div className="text-sm text-gray-400">Lucro Líquido</div>
              </div>

              <div className="text-center">
                <div className="mb-1 text-3xl font-bold text-blue-400">
                  {(
                    financialStats.totalReceita / financialStats.totalCustos
                  ).toFixed(1)}
                  x
                </div>
                <div className="text-sm text-gray-400">Múltiplo de Receita</div>
              </div>

              <div className="text-center">
                <div className="mb-1 text-3xl font-bold text-purple-400">
                  {financialStats.eficienciaFinanceiraMedia.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">Eficiência Média</div>
              </div>

              <div className="text-center">
                <div className="mb-1 text-3xl font-bold text-yellow-400">
                  R${' '}
                  {recursosFinanceiros.reduce(
                    (acc, r) => acc + r.horasFaturadas,
                    0
                  ) > 0
                    ? (
                        financialStats.totalReceita /
                        recursosFinanceiros.reduce(
                          (acc, r) => acc + r.horasFaturadas,
                          0
                        )
                      ).toFixed(0)
                    : '0'}
                </div>
                <div className="text-sm text-gray-400">Receita/Hora</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Métricas Financeiras Detalhadas */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center font-bold text-gray-800">
                <Wallet className="mr-2 h-5 w-5 text-blue-600" />
                Fluxo de Caixa
              </h3>
              <div className="rounded-lg bg-blue-100 p-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                <span className="font-medium text-green-700">Entradas</span>
                <span className="font-bold text-green-800">
                  R$ {financialStats.totalReceita.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-red-50 p-3">
                <span className="font-medium text-red-700">Saídas</span>
                <span className="font-bold text-red-800">
                  R${' '}
                  {(
                    financialStats.totalCustos + financialStats.despesasRateadas
                  ).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border-2 border-blue-200 bg-blue-50 p-3">
                <span className="font-bold text-blue-700">Saldo</span>
                <span className="text-lg font-bold text-blue-800">
                  R$ {financialStats.lucroLiquido.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center font-bold text-gray-800">
                <BarChart3 className="mr-2 h-5 w-5 text-purple-600" />
                Performance por Categoria
              </h3>
              <div className="rounded-lg bg-purple-100 p-2">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Recursos Top (Margem &gt; 35%)</span>
                  <span className="font-semibold text-green-600">
                    {recursosFinanceiros.filter(r => r.margemLucro > 35).length}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{
                      width: `${(recursosFinanceiros.filter(r => r.margemLucro > 35).length / recursosFinanceiros.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Recursos Médios (20-35%)</span>
                  <span className="font-semibold text-yellow-600">
                    {
                      recursosFinanceiros.filter(
                        r => r.margemLucro >= 20 && r.margemLucro <= 35
                      ).length
                    }
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-yellow-500"
                    style={{
                      width: `${(recursosFinanceiros.filter(r => r.margemLucro >= 20 && r.margemLucro <= 35).length / recursosFinanceiros.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Recursos Atenção (&lt; 20%)</span>
                  <span className="font-semibold text-red-600">
                    {recursosFinanceiros.filter(r => r.margemLucro < 20).length}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-red-500"
                    style={{
                      width: `${(recursosFinanceiros.filter(r => r.margemLucro < 20).length / recursosFinanceiros.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center font-bold text-gray-800">
                <Zap className="mr-2 h-5 w-5 text-yellow-600" />
                Eficiência Operacional
              </h3>
              <div className="rounded-lg bg-yellow-100 p-2">
                <Activity className="h-4 w-4 text-yellow-600" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="mb-1 text-3xl font-bold text-yellow-600">
                  {financialStats.eficienciaFinanceiraMedia.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Eficiência Média</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-green-50 p-3">
                  <div className="text-lg font-bold text-green-700">
                    {
                      recursosFinanceiros.filter(
                        r => r.eficienciaFinanceira > 90
                      ).length
                    }
                  </div>
                  <div className="text-xs text-green-600">Excelente</div>
                </div>
                <div className="rounded-lg bg-red-50 p-3">
                  <div className="text-lg font-bold text-red-700">
                    {
                      recursosFinanceiros.filter(
                        r => r.eficienciaFinanceira < 80
                      ).length
                    }
                  </div>
                  <div className="text-xs text-red-600">Precisa Melhoria</div>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-3 text-center">
                <div className="text-sm font-medium text-blue-700">
                  Meta: &gt; 85% eficiência para todos os recursos
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer com Recomendações */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <h3 className="mb-2 text-2xl font-bold text-gray-800">
              Recomendações Estratégicas
            </h3>
            <p className="text-gray-600">
              Com base na análise financeira atual e tendências identificadas
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border-l-4 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 p-6">
              <h4 className="mb-3 flex items-center font-bold text-green-800">
                <CheckCircle className="mr-2 h-5 w-5" />
                Maximizar Rentabilidade
              </h4>
              <ul className="space-y-2 text-sm text-green-700">
                <li>• Priorizar recursos com margem &gt; 35%</li>
                <li>• Aumentar precificação em 10-15%</li>
                <li>• Otimizar mix de serviços oferecidos</li>
              </ul>
            </div>

            <div className="rounded-xl border-l-4 border-yellow-500 bg-gradient-to-br from-yellow-50 to-amber-50 p-6">
              <h4 className="mb-3 flex items-center font-bold text-yellow-800">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Controlar Custos
              </h4>
              <ul className="space-y-2 text-sm text-yellow-700">
                <li>• Rever custos fixos mensalmente</li>
                <li>• Implementar centro de custos</li>
                <li>• Automatizar processos operacionais</li>
              </ul>
            </div>

            <div className="rounded-xl border-l-4 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
              <h4 className="mb-3 flex items-center font-bold text-blue-800">
                <Target className="mr-2 h-5 w-5" />
                Melhorar Eficiência
              </h4>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• Treinar recursos de baixa performance</li>
                <li>• Padronizar processos de trabalho</li>
                <li>• Investir em ferramentas produtivas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
