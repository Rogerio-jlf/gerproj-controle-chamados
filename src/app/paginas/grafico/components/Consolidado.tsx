'use client';
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  LabelList,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  Clock,
  Target,
  Users,
  Activity,
  AlertCircle,
  CheckCircle,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Award,
} from 'lucide-react';

interface ConsolidadoProps {
  dadosNumericosAPI: any;
  dados: any;
  dadosProcessados: any[];
}

const ConsolidadoDashboard: React.FC<ConsolidadoProps> = ({
  dadosNumericosAPI,
  dados,
  dadosProcessados,
}) => {
  const [animatedValues, setAnimatedValues] = useState({
    totalReceitas: 0,
    metaProgress: 0,
    eficiencia: 0,
  });

  const [visibleCards, setVisibleCards] = useState(0);

  // Calcular dados consolidados
  const dadosConsolidados = React.useMemo(() => {
    const totais = dadosProcessados.reduce(
      (acc, r) => ({
        horasDisponiveis: acc.horasDisponiveis + r.horasDisponiveis,
        horasExecutadas: acc.horasExecutadas + r.horasExecutadas,
        horasFaturadas: acc.horasFaturadas + r.horasFaturadas,
        horasNaoFaturadas: acc.horasNaoFaturadas + r.horasNaoFaturadas,
        horasNecessarias: acc.horasNecessarias + r.horasNecessarias,
        valorTotal: acc.valorTotal + r.valorTotal,
      }),
      {
        horasDisponiveis: 0,
        horasExecutadas: 0,
        horasFaturadas: 0,
        horasNaoFaturadas: 0,
        horasNecessarias: 0,
        valorTotal: 0,
      }
    );

    return {
      ...totais,
      lucroOperacional:
        totais.totalReceitas - totais.totalCustos - totais.totalDespesas,
      margemLucro:
        totais.totalReceitas > 0
          ? ((totais.totalReceitas -
              totais.totalCustos -
              totais.totalDespesas) /
              totais.totalReceitas) *
            100
          : 0,
      horasRestantes: totais.horasNecessarias - totais.horasFaturadas,
      percentualMeta:
        totais.horasNecessarias > 0
          ? (totais.horasFaturadas / totais.horasNecessarias) * 100
          : 0,
    };
  }, [dadosProcessados]);

  // Animações de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues({
        totalReceitas: dadosConsolidados.totalReceitas,
        metaProgress: dadosConsolidados.percentualMeta,
        eficiencia: dadosNumericosAPI.eficienciaMedia,
      });
    }, 500);

    const cardTimer = setInterval(() => {
      setVisibleCards(prev => Math.min(prev + 1, 6));
    }, 200);

    setTimeout(() => clearInterval(cardTimer), 1200);

    return () => {
      clearTimeout(timer);
      clearInterval(cardTimer);
    };
  }, [dadosConsolidados, dadosNumericosAPI]);

  // Dados para gráficos com cores premium
  const dadosHoras = [
    {
      name: 'Disponíveis',
      value: dadosConsolidados.horasDisponiveis,
      fill: 'url(#gradientBlue)',
    },
    {
      name: 'Executadas',
      value: dadosConsolidados.horasExecutadas,
      fill: 'url(#gradientPurple)',
    },
    {
      name: 'Faturadas',
      value: dadosConsolidados.horasFaturadas,
      fill: 'url(#gradientGreen)',
    },
    {
      name: 'Não Faturadas',
      value: dadosConsolidados.horasNaoFaturadas,
      fill: 'url(#gradientRed)',
    },
  ];

  const dadosFinanceiros = [
    {
      name: 'Receitas',
      value: dadosNumericosAPI.totalReceitas,
      fill: 'url(#gradientGreen)',
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      name: 'Custos',
      value: dadosNumericosAPI.totalCustos,
      fill: 'url(#gradientOrange)',
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      name: 'Despesas',
      value: dadosNumericosAPI.totalDespesas,
      fill: 'url(#gradientRed)',
      icon: <TrendingDown className="h-4 w-4" />,
    },
  ];

  const dadosPerformanceTrend = [
    { name: 'Jan', value: 65, meta: 100 },
    { name: 'Fev', value: 72, meta: 100 },
    { name: 'Mar', value: 78, meta: 100 },
    { name: 'Abr', value: 85, meta: 100 },
    {
      name: 'Mai',
      value: Math.min(dadosConsolidados.percentualMeta, 100),
      meta: 100,
    },
  ];

  const dadosRadial = [
    {
      name: 'Meta Atingida',
      value: Math.min(dadosConsolidados.percentualMeta, 100),
      fill:
        dadosConsolidados.percentualMeta >= 100
          ? 'url(#gradientSuccess)'
          : dadosConsolidados.percentualMeta >= 80
            ? 'url(#gradientWarning)'
            : 'url(#gradientDanger)',
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatHours = (value: number) => {
    return `${value.toFixed(0)}h`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-200/50 bg-white/95 p-4 shadow-2xl backdrop-blur-sm">
          <p className="mb-2 font-semibold text-slate-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-600">
                {entry.name}:{' '}
                {typeof entry.value === 'number' && entry.value > 1000
                  ? formatCurrency(entry.value)
                  : formatHours(Number(entry.value))}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  // ========================================================================================================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Gradientes SVG */}
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
          <linearGradient id="gradientRed" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <linearGradient id="gradientOrange" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient
            id="gradientSuccess"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient
            id="gradientWarning"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient
            id="gradientDanger"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f87171" />
          </linearGradient>
        </defs>
      </svg>
      {/* ==================== */}

      {/* ========== CONTEÚDO ========== */}
      <div className="max-w-8xl mx-auto space-y-8">
        {/* ========== Header ========== */}
        <header className="mb-12 text-center">
          <h1 className="mb-2 bg-gradient-to-r from-slate-800 via-blue-700 to-purple-700 bg-clip-text text-4xl font-black text-transparent">
            Análise Consolidada de Performance
          </h1>
          <p className="text-lg text-slate-600">
            Visão 360° do desempenho organizacional em tempo real
          </p>
        </header>
        {/* ==================== */}
        {/* ==================== */}

        {/* ========== Seção - Cards ========== */}
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            {
              icon: <Users size={24} className="text-white" />,
              title: 'Total de Recursos',
              value: dados.quantidade_total_geral_recursos,
              color:
                'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700',
              delay: 0,
            },
            {
              icon: <Target size={24} className="text-white" />,
              title: 'Meta Geral',
              value: `${dadosNumericosAPI.metaAtingidaMedia}%`,
              subtitle:
                dadosNumericosAPI.metaAtingidaMedia >= 100
                  ? '🎯 Meta atingida!'
                  : '📈 Em progresso',
              trend: dadosNumericosAPI.metaAtingidaMedia >= 80 ? 'up' : 'down',
              color:
                'bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700',
              delay: 200,
            },
            {
              icon: <Zap size={24} className="text-white" />,
              title: 'Eficiência Média',
              value: `${dadosNumericosAPI.eficienciaMedia}%`,
              subtitle: `${dadosNumericosAPI.horasImprodutivas}h improdutivas`,
              color:
                'bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700',
              delay: 400,
            },
            {
              icon: <Activity size={24} className="text-white" />,
              title: 'Utilização',
              value: `${dadosNumericosAPI.utilizacaoMedia}%`,
              subtitle: `${dadosNumericosAPI.horasOciosas}h ociosas`,
              color:
                'bg-gradient-to-br from-orange-500 via-red-500 to-pink-600',
              delay: 600,
            },
            {
              icon: <Award size={24} className="text-white" />,
              title: 'Top Performers',
              value: dadosNumericosAPI.recursosExcelentes,
              subtitle: `${((dadosNumericosAPI.recursosExcelentes / dadosProcessados.length) * 100).toFixed(0)}% da equipe`,
              color: 'bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-700',
              delay: 800,
            },
            {
              icon: <AlertTriangle size={24} className="text-white" />,
              title: 'Recursos Críticos',
              value: dadosNumericosAPI.recursosCriticos,
              subtitle: `${((dadosNumericosAPI.recursosCriticos / dadosProcessados.length) * 100).toFixed(0)}% da equipe`,
              color: 'bg-gradient-to-br from-red-500 via-rose-600 to-red-700',
              delay: 1000,
            },
          ].map((card, index) => (
            <div
              key={index}
              className={`transform transition-all duration-700 ${
                visibleCards > index
                  ? 'translate-y-0 scale-100 opacity-100'
                  : 'translate-y-8 scale-95 opacity-0'
              }`}
              style={{ transitionDelay: `${card.delay}ms` }}
            >
              <div
                className={`${card.color} hover:shadow-3xl transform rounded-2xl border border-white/10 p-6 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                    {card.icon}
                  </div>
                  {card.trend && (
                    <div
                      className={`rounded-full p-2 ${card.trend === 'up' ? 'bg-green-400/20' : 'bg-red-400/20'}`}
                    >
                      {card.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-white" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-white" />
                      )}
                    </div>
                  )}
                </div>
                <h3 className="mb-2 text-sm font-medium text-white/90">
                  {card.title}
                </h3>
                <p className="mb-1 text-2xl font-black text-white">
                  {card.value}
                </p>
                {card.subtitle && (
                  <p className="text-xs font-medium text-white/80">
                    {card.subtitle}
                  </p>
                )}
              </div>
            </div>
          ))}
        </section>
        {/* ==================== */}
        {/* ==================== */}

        {/* ========== Seção - Distribuição de Horas / Análise Financeira ========== */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* ========== Distribuição de Horas ========== */}
          <section className="group hover:shadow-3xl rounded-3xl border border-white/50 bg-white/80 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:bg-white/90">
            <div className="mb-8 flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-4 shadow-lg">
                <Clock className="text-white" size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800">
                  Distribuição de Horas
                </h3>
                <p className="font-medium text-slate-600">
                  Análise temporal detalhada
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={dadosHoras}
                margin={{ top: 40, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 14, fill: '#475569', fontWeight: 600 }}
                  axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                />
                <YAxis
                  tick={{ fontSize: 14, fill: '#475569', fontWeight: 600 }}
                  axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                  tickFormatter={value => `${value}h`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                  className="drop-shadow-lg"
                >
                  {dadosHoras.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="top"
                    formatter={(value: number) => formatHours(Number(value))}
                    style={{
                      fill: '#1f2937',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </section>
          {/* ==================== */}

          {/* ========== Análise Financeira ========== */}
          <section className="group hover:shadow-3xl rounded-3xl border border-white/50 bg-white/80 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:bg-white/90">
            <div className="mb-8 flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 p-4 shadow-lg">
                <BarChart3 className="text-white" size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800">
                  Análise Financeira
                </h3>
                <p className="font-medium text-slate-600">
                  Visão geral dos números
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={dadosFinanceiros}
                margin={{ top: 40, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 14, fill: '#475569', fontWeight: 600 }}
                  axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                />
                <YAxis
                  tick={{ fontSize: 14, fill: '#475569', fontWeight: 600 }}
                  axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                  tickFormatter={value => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                  className="drop-shadow-lg"
                />
              </BarChart>
            </ResponsiveContainer>
          </section>
        </section>
        {/* ==================== */}
        {/* ==================== */}

        {/* ========== Seção - Progresso da Meta / Tendências / Resumo Operacional ========== */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Progresso da Meta com Gráfico Radial Premium */}
          <div className="hover:shadow-3xl rounded-3xl border border-white/50 bg-white/80 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500">
            <div className="mb-8 flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-violet-600 p-4 shadow-lg">
                <Target className="text-white" size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">
                  Progresso da Meta
                </h3>
                <p className="text-sm font-medium text-slate-600">
                  Status atual
                </p>
              </div>
            </div>
            <div className="relative">
              <ResponsiveContainer width="100%" height={250}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="90%"
                  data={dadosRadial}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={20}
                    fill={dadosRadial[0].fill}
                    background={{
                      fill: '#f1f5f9',
                      stroke: '#e2e8f0',
                      strokeWidth: 2,
                    }}
                    className="drop-shadow-lg"
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-2 text-4xl font-black text-slate-800">
                    {dadosConsolidados.percentualMeta.toFixed(0)}%
                  </div>
                  <div className="text-sm font-semibold text-slate-600">
                    da meta
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              {dadosConsolidados.percentualMeta >= 100 ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-100 to-emerald-100 p-4">
                  <CheckCircle size={20} className="text-green-600" />
                  <span className="font-bold text-green-700">
                    Meta Atingida!
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-100 to-amber-100 p-4">
                  <AlertCircle size={20} className="text-orange-600" />
                  <span className="font-bold text-orange-700">
                    Faltam {formatHours(dadosConsolidados.horasRestantes)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tendência de Performance */}
          <div className="hover:shadow-3xl rounded-3xl border border-white/50 bg-white/80 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500">
            <div className="mb-8 flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 p-4 shadow-lg">
                <TrendingUp className="text-white" size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">Tendência</h3>
                <p className="text-sm font-medium text-slate-600">
                  Performance mensal
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dadosPerformanceTrend}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorTrend)"
                  className="drop-shadow-sm"
                />
                <Area
                  type="monotone"
                  dataKey="meta"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Resumo Operacional Premium */}
          <div className="hover:shadow-3xl rounded-3xl border border-white/50 bg-white/80 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500">
            <div className="mb-8 flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 p-4 shadow-lg">
                <Users className="text-white" size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">
                  Resumo Operacional
                </h3>
                <p className="text-sm font-medium text-slate-600">
                  Métricas-chave
                </p>
              </div>
            </div>
            <div className="space-y-6">
              {[
                {
                  label: 'Total de Recursos',
                  value: dados.quantidade_total_recursos_mes,
                  color: 'text-blue-600',
                  bgColor: 'from-blue-50 to-indigo-50',
                  icon: <Users className="h-5 w-5" />,
                },
                {
                  label: 'Utilização Média',
                  value: `${dadosNumericosAPI.utilizacaoMedia}%`,
                  color: 'text-purple-600',
                  bgColor: 'from-purple-50 to-violet-50',
                  icon: <Activity className="h-5 w-5" />,
                },
                {
                  label: 'Top Performers',
                  value: dadosNumericosAPI.recursosExcelentes,
                  color: 'text-green-600',
                  bgColor: 'from-green-50 to-emerald-50',
                  icon: <Award className="h-5 w-5" />,
                },
                {
                  label: 'Recursos Críticos',
                  value: dadosNumericosAPI.recursosCriticos,
                  color: 'text-red-600',
                  bgColor: 'from-red-50 to-rose-50',
                  icon: <AlertTriangle className="h-5 w-5" />,
                },
                {
                  label: 'Custo Médio/Recurso',
                  value: formatCurrency(dadosNumericosAPI.custoMedio || 0),
                  color: 'text-orange-600',
                  bgColor: 'from-orange-50 to-amber-50',
                  icon: <DollarSign className="h-5 w-5" />,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between bg-gradient-to-r p-4 ${item.bgColor} rounded-2xl border border-white/50 transition-all duration-300 hover:shadow-lg`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${item.color} bg-white/50`}>
                      {item.icon}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {item.label}
                    </span>
                  </div>
                  <span className={`text-lg font-black ${item.color}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* ==================== */}
        {/* ==================== */}

        {/* ========== Análise de Lucratividade / Distribuição de Performance ========== */}
        <section className="grid grid-cols-2 gap-8">
          {/* ========== Análise de Lucratividade ========== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-md shadow-black">
            <div className="mb-8 flex items-center gap-4">
              <div className="rounded-xl bg-gradient-to-r from-green-500 to-green-600 p-4 shadow-md shadow-black">
                <DollarSign className="text-white" size={28} />
              </div>

              <div>
                <h3 className="text-2xl font-extrabold tracking-wider text-slate-800 select-none">
                  Análise de Lucratividade
                </h3>

                <p className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
                  Performance financeira
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Lucro Operacional */}
                <div
                  className={`rounded-2xl border border-green-200 p-6 text-center shadow-md shadow-black ${dadosNumericosAPI.lucroOperacional < 0 ? 'bg-red-100' : 'bg-green-100'}`}
                >
                  <div
                    className={`mb-2 text-3xl font-bold tracking-wider select-none ${dadosNumericosAPI.lucroOperacional < 0 ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {formatCurrency(dadosNumericosAPI.lucroOperacional)}
                  </div>
                  <div
                    className={`text-base font-semibold tracking-wider italic select-none ${dadosNumericosAPI.lucroOperacional < 0 ? 'text-red-600' : 'text-green-600'}`}
                  >
                    Lucro Operacional
                  </div>
                </div>

                {/* Margem de Lucro */}
                <div
                  className={`rounded-2xl border border-blue-200 p-6 text-center shadow-md shadow-black ${
                    dadosNumericosAPI.margemLucro < 0
                      ? 'bg-red-100'
                      : 'bg-blue-100'
                  }`}
                >
                  <div
                    className={`mb-2 text-3xl font-bold tracking-wider select-none ${
                      dadosNumericosAPI.margemLucro < 0
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {dadosNumericosAPI.margemLucro.toFixed(1)}%
                  </div>
                  <div
                    className={`text-base font-semibold tracking-wider italic select-none ${
                      dadosNumericosAPI.margemLucro < 0
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`}
                  >
                    Margem de Lucro
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-md shadow-black">
                <h4 className="mb-4 text-xl font-bold tracking-wider text-slate-800 select-none">
                  Breakdown Financeiro
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
                      Receitas Totais:
                    </span>
                    <span className="text-lg font-bold tracking-wider text-green-600 select-none">
                      {formatCurrency(dadosNumericosAPI.totalReceitas)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
                      Custos Diretos:
                    </span>
                    <span className="text-lg font-bold tracking-wider text-red-600 select-none">
                      {formatCurrency(dadosNumericosAPI.totalCustos)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
                      Despesas:
                    </span>
                    <span className="text-lg font-bold tracking-wider text-red-600 select-none">
                      {formatCurrency(dadosNumericosAPI.totalDespesas)}
                    </span>
                  </div>

                  <hr className="border-slate-500" />
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold tracking-wider text-slate-800 select-none">
                      Resultado:
                    </span>
                    <span
                      className={`text-xl font-extrabold tracking-wider select-none ${dadosNumericosAPI.lucroOperacional >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {formatCurrency(dadosNumericosAPI.lucroOperacional)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* ==================== */}

          {/* ========== Distribuição de Performance ========== */}
          <section className="hover:shadow-3xl rounded-3xl border border-white/50 bg-white/80 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500">
            <div className="mb-8 flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 p-4 shadow-lg">
                <Activity className="text-white" size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800">
                  Distribuição de Performance
                </h3>
                <p className="font-medium text-slate-600">Análise da equipe</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Status da Equipe */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4 text-center">
                  <div className="mb-1 text-2xl font-black text-green-600">
                    {dadosNumericosAPI.recursosExcelentes}
                  </div>
                  <div className="text-xs font-semibold text-green-700">
                    Excelentes
                  </div>
                </div>
                <div className="rounded-xl border border-yellow-100 bg-gradient-to-br from-yellow-50 to-amber-50 p-4 text-center">
                  <div className="mb-1 text-2xl font-black text-yellow-600">
                    {dadosProcessados.length -
                      dadosNumericosAPI.recursosExcelentes -
                      dadosNumericosAPI.recursosCriticos}
                  </div>
                  <div className="text-xs font-semibold text-yellow-700">
                    Normais
                  </div>
                </div>
                <div className="rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-rose-50 p-4 text-center">
                  <div className="mb-1 text-2xl font-black text-red-600">
                    {dadosNumericosAPI.recursosCriticos}
                  </div>
                  <div className="text-xs font-semibold text-red-700">
                    Críticos
                  </div>
                </div>
              </div>

              {/* Métricas de Eficiência */}
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50 p-6">
                <h4 className="mb-4 font-bold text-slate-800">
                  Métricas de Eficiência
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Eficiência Média
                      </span>
                      <span className="text-sm font-bold text-purple-600">
                        {dadosNumericosAPI.eficienciaMedia}%
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-200">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 transition-all duration-1000"
                        style={{
                          width: `${dadosNumericosAPI.eficienciaMedia}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Utilização Média
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        {dadosNumericosAPI.utilizacaoMedia}%
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-200">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000"
                        style={{
                          width: `${dadosNumericosAPI.utilizacaoMedia}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alertas e Recomendações */}
              <div className="space-y-3">
                {dadosNumericosAPI.recursosCriticos > 0 && (
                  <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
                    <div>
                      <div className="text-sm font-bold text-red-700">
                        Atenção Necessária
                      </div>
                      <div className="text-xs text-red-600">
                        {dadosNumericosAPI.recursosCriticos} recursos precisam
                        de suporte
                      </div>
                    </div>
                  </div>
                )}

                {dadosNumericosAPI.eficienciaMedia >= 80 && (
                  <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                    <div>
                      <div className="text-sm font-bold text-green-700">
                        Performance Excelente
                      </div>
                      <div className="text-xs text-green-600">
                        Equipe operando com alta eficiência
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </section>
        {/* ==================== */}
        {/* ==================== */}

        {/* ========== Footer ========== */}
        <footer className="rounded-3xl border border-white/50 bg-white/60 p-8 shadow-xl backdrop-blur-sm">
          <div className="text-center">
            <h3 className="mb-4 text-2xl font-black text-slate-800">
              Resumo Executivo - Período Atual
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="mb-2 text-3xl font-black text-blue-600">
                  {formatHours(dadosConsolidados.horasFaturadas)}
                </div>
                <div className="text-sm font-semibold text-slate-600">
                  Horas Faturadas
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-black text-green-600">
                  {formatCurrency(dadosConsolidados.totalReceitas)}
                </div>
                <div className="text-sm font-semibold text-slate-600">
                  Receita Total
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-black text-purple-600">
                  {dadosNumericosAPI.eficienciaMedia}%
                </div>
                <div className="text-sm font-semibold text-slate-600">
                  Eficiência Geral
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-black text-orange-600">
                  {dados.quantidade_total_geral_recursos}
                </div>
                <div className="text-sm font-semibold text-slate-600">
                  Recursos Ativos
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-100 to-gray-100 p-6">
              <p className="text-sm leading-relaxed font-medium text-slate-700">
                Dashboard atualizado em tempo real • Dados consolidados de{' '}
                {dadosProcessados.length} recursos • Performance geral:{' '}
                <span className="font-bold text-blue-600">
                  {dadosNumericosAPI.eficienciaMedia >= 80
                    ? 'Excelente'
                    : dadosNumericosAPI.eficienciaMedia >= 60
                      ? 'Boa'
                      : 'Necessita Melhoria'}
                </span>
              </p>
            </div>
          </div>
        </footer>
        {/* ==================== */}
        {/* ==================== */}
      </div>
    </div>
  );
};

export default ConsolidadoDashboard;
