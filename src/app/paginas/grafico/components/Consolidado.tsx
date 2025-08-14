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
// ====================================================================================================

interface ConsolidadoProps {
  dadosNumericosAPI: any;
  dados: any;
  dadosProcessados: any[];
}
// ====================================================================================================

export default function ConsolidadoDashboard({
  dadosNumericosAPI,
  dados,
  dadosProcessados,
}: ConsolidadoProps) {
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
  // ====================================================================================================

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
  // ====================================================================================================

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
  // ====================================================================================================

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
  // ====================================================================================================

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
  // ====================================================================================================

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
  // ====================================================================================================

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  // ====================================================================================================

  const formatHours = (value: number) => {
    return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}h`;
  };
  // ====================================================================================================

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
  // ====================================================================================================

  return (
    <>
      <div className="min-h-screen">
        {/* ===== Gradientes Barra Gráficos */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="gradientBlue" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient
              id="gradientPurple"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient
              id="gradientGreen"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="gradientRed" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient
              id="gradientOrange"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
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
        {/* ================================================== */}

        {/* ===== MAIN ===== */}
        <main className="max-w-8xl mx-auto space-y-8">
          {/* ========== Header ========== */}
          <header className="mb-12 text-center">
            <h1 className="mb-2 bg-gradient-to-r from-slate-700 via-blue-700 to-purple-700 bg-clip-text text-5xl font-extrabold tracking-wider text-transparent select-none">
              Análise Consolidada de Performance
            </h1>
            <p className="text-xl font-semibold tracking-wider text-slate-800 italic select-none">
              Visão 360° do desempenho organizacional em tempo real
            </p>
          </header>
          {/* ================================================== */}

          {/* ===== Cards ===== */}
          <section className="grid grid-cols-6 gap-6">
            {[
              {
                icon: <Users size={24} className="text-white" />,
                title: 'Total de Recursos',
                value: dados.quantidade_total_geral_recursos,
                subtitle: `${dados.quantidade_total_geral_recursos} recursos ativos`,
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
                trend:
                  dadosNumericosAPI.metaAtingidaMedia >= 80 ? 'up' : 'down',
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
                color:
                  'bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-700',
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
                  className={`${card.color} space-y-1 rounded-2xl p-6 shadow-md shadow-black transition-all hover:scale-105 hover:shadow-lg hover:shadow-black`}
                >
                  <div className="flex items-center justify-between">
                    <div className="mb-3 rounded-lg bg-white/20 p-3 shadow-md shadow-black">
                      {card.icon}
                    </div>
                  </div>
                  <h2 className="text-base font-semibold tracking-wider text-white select-none">
                    {card.title}
                  </h2>
                  <p className="text-2xl font-extrabold tracking-wider text-white italic select-none">
                    {card.value}
                  </p>
                  {card.subtitle && (
                    <p className="text-sm font-semibold tracking-wider text-white select-none">
                      {card.subtitle}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </section>
          {/* ================================================== */}

          {/* ===== Seções - Distribuição de Horas / Análise Financeira ===== */}
          <section className="grid grid-cols-2 gap-8">
            {/* ====== seção - Distribuição de Horas ====== */}
            <section className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-md shadow-black transition-all">
              <div className="mb-8 flex items-center gap-4">
                {/* icon */}
                <div className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-700 p-4 shadow-md shadow-black">
                  <Clock className="text-white" size={28} />
                </div>
                <div>
                  {/* título */}
                  <h3 className="text-2xl font-extrabold tracking-wider text-slate-800 select-none">
                    Distribuição de Horas
                  </h3>
                  {/* subtítulo */}
                  <p className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
                    Análise temporal detalhada
                  </p>
                </div>
              </div>
              {/* gráfico */}
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

            {/* ===== Seção - Análise Financeira ===== */}
            <section className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-md shadow-black transition-all">
              <div className="mb-8 flex items-center gap-4">
                {/* icon */}
                <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-green-700 p-4 shadow-md shadow-black">
                  <BarChart3 className="text-white" size={28} />
                </div>
                <div>
                  {/* título */}
                  <h3 className="text-2xl font-extrabold tracking-wider text-slate-800 select-none">
                    Análise Financeira
                  </h3>
                  {/* subtítulo */}
                  <p className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
                    Visão geral dos números
                  </p>
                </div>
              </div>
              {/* gráfico */}
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
          {/* ================================================== */}

          {/* ===== Seções - Progresso da Meta / Tendências / Resumo Operacional ===== */}
          <section className="grid grid-cols-3 gap-8">
            {/* Progresso da Meta */}
            <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-md shadow-black transition-all">
              <div className="mb-8 flex items-center gap-4">
                {/* icon */}
                <div className="rounded-lg bg-gradient-to-r from-purple-500 to-violet-700 p-4 shadow-md shadow-black">
                  <Target className="text-white" size={28} />
                </div>
                <div>
                  {/* título */}
                  <h4 className="text-2xl font-extrabold tracking-wider text-slate-800 select-none">
                    Progresso da Meta
                  </h4>
                  {/* subtítulo */}
                  <p className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
                    Status atual
                  </p>
                </div>
              </div>
              {/* gráfico */}
              <div className="relative">
                <ResponsiveContainer width="100%" height={300}>
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
                    <div className="mb-2 text-4xl font-extrabold tracking-wider text-slate-800 select-none">
                      {dadosConsolidados.percentualMeta.toFixed(0)}%
                    </div>
                    <div className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
                      da meta
                    </div>
                  </div>
                </div>
              </div>
              {/* status da meta */}
              <div className="mt-6 text-center">
                {dadosConsolidados.percentualMeta >= 100 ? (
                  <div className="flex items-center justify-center gap-2 rounded-2xl border border-green-300 bg-green-200 p-4">
                    <CheckCircle size={24} className="text-green-600" />
                    <span className="font-base font-semibold tracking-wider text-green-700 italic select-none">
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
            </section>
            {/* ==================== */}

            {/* Tendência */}
            <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-md shadow-black transition-all">
              {/* header */}
              <div className="mb-8 flex items-center gap-4">
                {/* icon */}
                <div className="rounded-lg bg-gradient-to-r from-indigo-500 to-blue-700 p-4 shadow-md shadow-black">
                  <TrendingUp className="text-white" size={28} />
                </div>
                <div>
                  {/* título */}
                  <h4 className="text-2xl font-extrabold tracking-wider text-slate-800 select-none">
                    Tendência
                  </h4>
                  {/* subtítulo */}
                  <p className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
                    Performance mensal
                  </p>
                </div>
              </div>
              {/* gráfico */}
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
            </section>
            {/* ==================== */}

            {/* Resumo Operacional */}
            <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-md shadow-black transition-all">
              {/* header */}
              <div className="mb-8 flex items-center gap-4">
                {/* icon */}
                <div className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-700 p-4 shadow-md shadow-black">
                  <Users className="text-white" size={28} />
                </div>
                <div>
                  {/* título */}
                  <h4 className="text-2xl font-extrabold tracking-wider text-slate-800 select-none">
                    Resumo Operacional
                  </h4>
                  {/* subtítulo */}
                  <p className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
                    Métricas-chave
                  </p>
                </div>
              </div>
              {/* cards informativos */}
              <div className="space-y-6">
                {[
                  {
                    label: 'Total de Recursos',
                    value: dados.quantidade_total_geral_recursos,
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
                    className={`flex items-center justify-between bg-gradient-to-r p-4 ${item.bgColor} rounded-2xl border border-slate-200 shadow-md shadow-black transition-all`}
                  >
                    <div className="flex items-center gap-3">
                      {/* icon */}
                      <div
                        className={`rounded-lg p-2 ${item.color} bg-white/80 shadow-md shadow-black`}
                      >
                        {item.icon}
                      </div>
                      {/* título */}
                      <span className="text-base font-semibold tracking-wider text-slate-800 italic select-none">
                        {item.label}
                      </span>
                    </div>
                    {/* valor */}
                    <span
                      className={`text-xl font-extrabold tracking-wider italic select-none ${item.color}`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </section>
          {/* ================================================== */}

          {/* ====== Seções - Análise de Lucratividade / Distribuição de Performance ====== */}
          <section className="grid grid-cols-2 gap-8">
            {/* Análise de Lucratividade */}
            <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-md shadow-black">
              {/* header */}
              <div className="mb-8 flex items-center gap-4">
                {/* icon */}
                <div className="rounded-lg bg-gradient-to-r from-green-500 to-green-700 p-4 shadow-md shadow-black">
                  <DollarSign className="text-white" size={28} />
                </div>
                <div>
                  {/* título */}
                  <h5 className="text-2xl font-extrabold tracking-wider text-slate-800 select-none">
                    Análise de Lucratividade
                  </h5>
                  {/* subtítulo */}
                  <p className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
                    Performance financeira
                  </p>
                </div>
              </div>
              {/* ========== */}

              <div className="space-y-6">
                {/* badges */}
                <div className="grid grid-cols-2 gap-6">
                  {/* badge lucro operacional */}
                  <div
                    className={`flex flex-col items-center justify-center rounded-2xl border p-6 text-center shadow-md shadow-black ${dadosNumericosAPI.lucroOperacional < 0 ? 'border-red-300 bg-red-200' : 'border-green-300 bg-green-200'}`}
                  >
                    {/* valor */}
                    <span
                      className={`mb-1 text-3xl font-semibold tracking-wider select-none ${dadosNumericosAPI.lucroOperacional < 0 ? 'text-red-800' : 'text-green-800'}`}
                    >
                      {formatCurrency(dadosNumericosAPI.lucroOperacional)}
                    </span>
                    {/* descrição */}
                    <span
                      className={`text-base font-semibold tracking-wider italic select-none ${dadosNumericosAPI.lucroOperacional < 0 ? 'text-red-700' : 'text-green-700'}`}
                    >
                      {dadosNumericosAPI.lucroOperacional < 0
                        ? 'Prejuízo Operacional'
                        : 'Lucro Operacional'}
                    </span>
                  </div>
                  {/* ========== */}

                  {/* badge margem de lucro */}
                  <div
                    className={`flex flex-col items-center justify-center rounded-2xl border p-6 text-center shadow-md shadow-black ${
                      dadosNumericosAPI.margemLucro < 0
                        ? 'border-red-300 bg-red-200'
                        : 'border-blue-300 bg-blue-200'
                    }`}
                  >
                    {/* valor */}
                    <span
                      className={`mb-1 text-3xl font-semibold tracking-wider select-none ${
                        dadosNumericosAPI.margemLucro < 0
                          ? 'text-red-800'
                          : 'text-blue-800'
                      }`}
                    >
                      {dadosNumericosAPI.margemLucro.toFixed(1)}%
                    </span>
                    {/* descrição */}
                    <span
                      className={`text-base font-semibold tracking-wider italic select-none ${
                        dadosNumericosAPI.margemLucro < 0
                          ? 'text-red-700'
                          : 'text-blue-700'
                      }`}
                    >
                      {dadosNumericosAPI.margemLucro < 0
                        ? 'Margem de Lucro Negativa'
                        : 'Margem de Lucro Positiva'}
                    </span>
                  </div>
                  {/* ========== */}
                </div>
                {/* ==================== */}

                {/* breakdown financeiro */}
                <div className="rounded-2xl border border-slate-200 bg-slate-100 p-6 shadow-md shadow-black">
                  {/* título */}
                  <h5 className="mb-4 text-xl font-bold tracking-wider text-slate-800 select-none">
                    Breakdown Financeiro
                  </h5>
                  {/* ========== */}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
                        Receitas Totais:
                      </p>
                      <span className="text-xl font-bold tracking-wider text-green-700 italic select-none">
                        {formatCurrency(dadosNumericosAPI.totalReceitas)}
                      </span>
                    </div>
                    {/* ========== */}

                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
                        Custos Diretos:
                      </p>
                      <span className="text-xl font-bold tracking-wider text-red-700 italic select-none">
                        {formatCurrency(dadosNumericosAPI.totalCustos)}
                      </span>
                    </div>
                    {/* ========== */}

                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
                        Despesas:
                      </p>
                      <span className="text-xl font-bold tracking-wider text-red-700 italic select-none">
                        {formatCurrency(dadosNumericosAPI.totalDespesas)}
                      </span>
                    </div>
                    {/* ========== */}

                    <hr className="border-slate-500" />
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-extrabold tracking-wider text-slate-800 select-none">
                        Resultado:
                      </span>
                      <span
                        className={`text-xl font-extrabold tracking-wider select-none ${dadosNumericosAPI.lucroOperacional >= 0 ? 'text-green-700' : 'text-red-700'}`}
                      >
                        {formatCurrency(dadosNumericosAPI.lucroOperacional)}
                      </span>
                    </div>
                    {/* ========== */}
                  </div>
                </div>
                {/* ==================== */}
              </div>
              {/* ============================== */}
            </section>
            {/* ======================================== */}

            {/* Distribuição de Performance */}
            <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-md shadow-black">
              {/* header */}
              <div className="mb-8 flex items-center gap-4">
                {/* icon */}
                <div className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-700 p-4 shadow-md shadow-black">
                  <Activity className="text-white" size={28} />
                </div>
                <div>
                  {/* título */}
                  <h5 className="text-2xl font-extrabold tracking-wider text-slate-800 select-none">
                    Distribuição de Performance
                  </h5>
                  {/* subtítulo */}
                  <p className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
                    Análise da equipe
                  </p>
                </div>
              </div>
              {/* ==================== */}

              <div className="space-y-6">
                {/* Status da Equipe */}
                <div className="grid grid-cols-3 gap-4">
                  {/* badge 1 */}
                  <div className="rounded-2xl border border-green-300 bg-green-200 p-4 text-center shadow-md shadow-black">
                    <div className="mb-1 text-2xl font-extrabold tracking-wider text-green-700 select-none">
                      {dadosNumericosAPI.recursosExcelentes}
                    </div>
                    <div className="text-base font-semibold tracking-wider text-green-700 italic select-none">
                      Excelentes
                    </div>
                  </div>
                  {/* badge 2 */}
                  <div className="rounded-2xl border border-amber-300 bg-amber-200 p-4 text-center shadow-md shadow-black">
                    <div className="mb-1 text-2xl font-extrabold tracking-wider text-amber-700 select-none">
                      {dadosProcessados.length -
                        dadosNumericosAPI.recursosExcelentes -
                        dadosNumericosAPI.recursosCriticos}
                    </div>
                    <div className="text-base font-semibold tracking-wider text-amber-700 italic select-none">
                      Normais
                    </div>
                  </div>
                  {/* badge 3 */}
                  <div className="rounded-2xl border border-red-300 bg-red-200 p-4 text-center shadow-md shadow-black">
                    <div className="mb-1 text-2xl font-extrabold tracking-wider text-red-700 select-none">
                      {dadosNumericosAPI.recursosCriticos}
                    </div>
                    <div className="text-base font-semibold tracking-wider text-red-700 italic select-none">
                      Críticos
                    </div>
                  </div>
                </div>
                {/* ==================== */}

                {/* Métricas de Eficiência */}
                <div className="rounded-2xl border border-slate-200 bg-slate-100 p-6 shadow-md shadow-black">
                  {/* título */}
                  <h5 className="mb-4 text-xl font-extrabold tracking-wider text-slate-800 select-none">
                    Métricas de Eficiência
                  </h5>
                  <div className="space-y-4">
                    {/* eficiência média */}
                    <div>
                      <div className="mb-2 flex justify-between">
                        {/* descrição */}
                        <span className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
                          Eficiência Média
                        </span>
                        {/* valor */}
                        <span className="text-xl font-semibold tracking-wider text-purple-700 italic select-none">
                          {dadosNumericosAPI.eficienciaMedia}%
                        </span>
                      </div>
                      {/* barra de progresso */}
                      <div className="h-3 w-full rounded-full bg-slate-300">
                        <div
                          className="h-3 rounded-full bg-purple-700 transition-all duration-1000"
                          style={{
                            width: `${dadosNumericosAPI.eficienciaMedia}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    {/* ==================== */}
                    {/* utilização média */}
                    <div>
                      <div className="mb-2 flex justify-between">
                        {/* descrição */}
                        <span className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
                          Utilização Média
                        </span>
                        {/* valor */}
                        <span className="text-xl font-semibold tracking-wider text-blue-700 italic select-none">
                          {dadosNumericosAPI.utilizacaoMedia}%
                        </span>
                      </div>
                      {/* barra de progresso */}
                      <div className="h-3 w-full rounded-full bg-slate-300">
                        <div
                          className="h-3 rounded-full bg-blue-700 transition-all duration-1000"
                          style={{
                            width: `${dadosNumericosAPI.utilizacaoMedia}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    {/* ==================== */}
                  </div>
                </div>
                {/* ==================== */}

                {/* Alertas e Recomendações */}
                <div className="space-y-3">
                  {/* recursos críticos */}
                  {dadosNumericosAPI.recursosCriticos > 0 && (
                    <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-100 p-4 shadow-md shadow-black">
                      {/* icon */}
                      <AlertTriangle
                        className="flex-shrink-0 text-red-800"
                        size={28}
                      />
                      <div className="flex flex-col justify-center">
                        {/* descrição */}
                        <span className="text-base font-semibold tracking-wider text-red-800 select-none">
                          Atenção Necessária
                        </span>
                        {/* valor */}
                        <span className="text-sm font-semibold tracking-wider text-red-700 italic select-none">
                          {dadosNumericosAPI.recursosCriticos} recursos precisam
                          de suporte
                        </span>
                      </div>
                    </div>
                  )}
                  {/* ========== */}

                  {/* recursos excelentes */}
                  {dadosNumericosAPI.eficienciaMedia >= 80 && (
                    <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-100 p-4 shadow-md shadow-black">
                      {/* icon */}
                      <CheckCircle
                        className="flex-shrink-0 text-green-800"
                        size={28}
                      />
                      <div>
                        {/* descrição */}
                        <span className="text-base font-semibold tracking-wider text-green-800 select-none">
                          Performance Excelente
                        </span>
                        {/* valor */}
                        <span className="text-sm font-semibold tracking-wider text-green-700 italic select-none">
                          Equipe operando com alta eficiência
                        </span>
                      </div>
                    </div>
                  )}
                  {/* ========== */}
                </div>
              </div>
            </section>
          </section>
          {/* ================================================== */}

          {/* ====== Footer ====== */}
          <footer className="rounded-2xl border border-slate-100 bg-white p-8 shadow-md shadow-black">
            <div className="text-center">
              {/* badges */}
              <div className="mb-16">
                {/* título */}
                <h6 className="mb-16 text-4xl font-extrabold tracking-wider text-slate-800 select-none">
                  Resumo Executivo - Período Atual
                </h6>
                {/* ========== */}
                <div className="grid grid-cols-4 gap-6">
                  {/* badge 1 */}
                  <div className="flex flex-col items-center justify-center">
                    {/* valor */}
                    <p className="mb-1 text-3xl font-extrabold tracking-wider text-blue-700 select-none">
                      {formatHours(dadosConsolidados.horasFaturadas)}
                    </p>
                    {/* descrição */}
                    <span className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
                      Horas Faturadas
                    </span>
                  </div>
                  {/* ========== */}
                  {/* badge 2 */}
                  <div className="flex flex-col items-center justify-center">
                    {/* valor */}
                    <p className="mb-1 text-3xl font-extrabold tracking-wider text-green-700 select-none">
                      {formatCurrency(dadosNumericosAPI.totalReceitas)}
                    </p>
                    {/* descrição */}
                    <span className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
                      Receita Total
                    </span>
                  </div>
                  {/* ========== */}
                  {/* badge 3 */}
                  <div className="flex flex-col items-center justify-center">
                    {/* valor */}
                    <p className="mb-1 text-3xl font-extrabold tracking-wider text-purple-700 select-none">
                      {dadosNumericosAPI.eficienciaMedia}%
                    </p>
                    {/* descrição */}
                    <span className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
                      Eficiência Geral
                    </span>
                  </div>
                  {/* ========== */}
                  {/* badge 4 */}
                  <div className="flex flex-col items-center justify-center">
                    {/* valor */}
                    <p className="mb-1 text-3xl font-extrabold tracking-wider text-orange-700 select-none">
                      {dados.quantidade_total_geral_recursos}
                    </p>
                    {/* descrição */}
                    <span className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
                      Recursos Ativos
                    </span>
                  </div>
                  {/* ========== */}
                </div>
                {/* ==================== */}
              </div>
              {/* ============================== */}

              {/* badge final */}
              <div className="rounded-2xl border border-slate-200 bg-slate-100 p-6 shadow-md shadow-black">
                {/* descrição final */}
                <p className="text-base font-extrabold tracking-wider text-slate-800 italic select-none">
                  Dashboard atualizado em tempo real • Dados consolidados de{' '}
                  {dadosProcessados.length} recursos • Performance geral:{' '}
                  {/* situação final */}
                  {(() => {
                    let status = '';
                    let color = '';
                    if (dadosNumericosAPI.eficienciaMedia >= 80) {
                      status = 'Muito Boa';
                      color = 'text-green-700';
                    } else if (dadosNumericosAPI.eficienciaMedia >= 60) {
                      status = 'Boa';
                      color = 'text-blue-700';
                    } else {
                      status = 'Ruim';
                      color = 'text-red-700';
                    }
                    return (
                      <span
                        className={`text-xl font-extrabold tracking-wider italic select-none ${color}`}
                      >
                        {status}
                      </span>
                    );
                  })()}
                </p>
                {/* ========== */}
              </div>
              {/* ==================== */}
            </div>
            {/* ============================== */}
          </footer>
          {/* ======================================== */}
        </main>
      </div>
    </>
  );
}
