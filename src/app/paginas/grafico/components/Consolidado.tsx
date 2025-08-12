'use client';
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  Legend,
  LabelList,
  Cell,
} from 'recharts';
import {
  DollarSign,
  Clock,
  Target,
  TrendingUp,
  Users,
  Activity,
  AlertCircle,
  CheckCircle,
  BarChart3,
} from 'lucide-react';

interface ConsolidadoProps {
  metricas: any;
  dados: any;
  dadosProcessados: any[];
}

const ConsolidadoDashboard: React.FC<ConsolidadoProps> = ({
  metricas,
  dados,
  dadosProcessados,
}) => {
  // Calcular dados consolidados
  const dadosConsolidados = React.useMemo(() => {
    const totais = dadosProcessados.reduce(
      (acc, r) => ({
        totalReceitas: acc.totalReceitas + r.horasFaturadas * r.custoPorHora,
        totalCustos: acc.totalCustos + r.custo,
        totalDespesas: acc.totalDespesas + r.valorRateio,
        horasDisponiveis: acc.horasDisponiveis + r.horasDisponiveis,
        horasExecutadas: acc.horasExecutadas + r.horasExecutadas,
        horasFaturadas: acc.horasFaturadas + r.horasFaturadas,
        horasNaoFaturadas: acc.horasNaoFaturadas + r.horasNaoFaturadas,
        horasNecessarias: acc.horasNecessarias + r.horasNecessarias,
        valorTotal: acc.valorTotal + r.valorTotal,
      }),
      {
        totalReceitas: 0,
        totalCustos: 0,
        totalDespesas: 0,
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

  // Dados para gráficos
  const dadosHoras = [
    {
      name: 'Disponíveis',
      value: dadosConsolidados.horasDisponiveis,
      fill: '#3b82f6',
    },
    {
      name: 'Executadas',
      value: dadosConsolidados.horasExecutadas,
      fill: '#8b5cf6',
    },
    {
      name: 'Faturadas',
      value: dadosConsolidados.horasFaturadas,
      fill: '#10b981',
    },
    {
      name: 'Não Faturadas',
      value: dadosConsolidados.horasNaoFaturadas,
      fill: '#ef4444',
    },
  ];

  const dadosFinanceiros = [
    {
      name: 'Receitas',
      value: dadosConsolidados.totalReceitas,
      fill: '#10b981',
    },
    { name: 'Custos', value: dadosConsolidados.totalCustos, fill: '#f59e0b' },
    {
      name: 'Despesas',
      value: dadosConsolidados.totalDespesas,
      fill: '#ef4444',
    },
  ];

  const dadosPerformance = [
    {
      name: 'Jan',
      meta: 100,
      realizado: Math.min(dadosConsolidados.percentualMeta, 100),
      eficiencia: metricas.eficienciaMedia,
    },
  ];

  const dadosRadial = [
    {
      name: 'Meta Atingida',
      value: Math.min(dadosConsolidados.percentualMeta, 100),
      fill:
        dadosConsolidados.percentualMeta >= 100
          ? '#10b981'
          : dadosConsolidados.percentualMeta >= 80
            ? '#f59e0b'
            : '#ef4444',
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatHours = (value: number) => {
    return `${value.toFixed(0)}h`;
  };

  return (
    <div className="space-y-8">
      {/* Cards de Resumo Executivo */}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">
                Receitas Totais
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(dadosConsolidados.totalReceitas)}
              </p>
              <p className="mt-1 text-xs text-green-100">
                {dadosConsolidados.horasFaturadas}h faturadas
              </p>
            </div>
            <DollarSign size={32} className="text-green-200" />
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">
                Lucro Operacional
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(dadosConsolidados.lucroOperacional)}
              </p>
              <p className="mt-1 text-xs text-blue-100">
                Margem: {dadosConsolidados.margemLucro.toFixed(1)}%
              </p>
            </div>
            <TrendingUp size={32} className="text-blue-200" />
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100">Meta Global</p>
              <p className="text-2xl font-bold">
                {dadosConsolidados.percentualMeta.toFixed(1)}%
              </p>
              <p className="mt-1 text-xs text-purple-100">
                {formatHours(dadosConsolidados.horasRestantes)} restantes
              </p>
            </div>
            <Target size={32} className="text-purple-200" />
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-100">
                Eficiência Global
              </p>
              <p className="text-2xl font-bold">{metricas.eficienciaMedia}%</p>
              <p className="mt-1 text-xs text-orange-100">
                {formatHours(dadosConsolidados.horasNaoFaturadas)} improdutivas
              </p>
            </div>
            <Activity size={32} className="text-orange-200" />
          </div>
        </div>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Distribuição de Horas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <Clock className="text-blue-600" size={24} />
            <h3 className="text-xl font-bold text-slate-800">
              Distribuição de Horas
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={dadosHoras}
              margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={value => `${value}h`}
              />
              <Tooltip
                formatter={value => [formatHours(Number(value)), 'Horas']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {dadosHoras.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(value: number) => formatHours(Number(value))}
                  style={{
                    fill: '#374151',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Análise Financeira */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <BarChart3 className="text-green-600" size={24} />
            <h3 className="text-xl font-bold text-slate-800">
              Análise Financeira
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosFinanceiros}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={value => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip formatter={value => formatCurrency(Number(value))} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Indicadores de Performance */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Progresso da Meta */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <Target className="text-purple-600" size={24} />
            <h3 className="text-xl font-bold text-slate-800">
              Progresso da Meta
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              data={dadosRadial}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={10}
                fill={dadosRadial[0].fill}
                background={{ fill: '#e5e7eb' }}
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-800 text-3xl font-bold"
              >
                {dadosConsolidados.percentualMeta.toFixed(0)}%
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-slate-600">
              {dadosConsolidados.percentualMeta >= 100 ? (
                <span className="flex items-center justify-center gap-2 font-semibold text-green-600">
                  <CheckCircle size={16} /> Meta Atingida!
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 font-semibold text-orange-600">
                  <AlertCircle size={16} /> Faltam{' '}
                  {formatHours(dadosConsolidados.horasRestantes)}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Resumo Operacional */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <Users className="text-indigo-600" size={24} />
            <h3 className="text-xl font-bold text-slate-800">
              Resumo Operacional
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 py-3">
              <span className="font-medium text-slate-600">
                Total de Recursos
              </span>
              <span className="text-xl font-bold text-slate-800">
                {dados.quantidade_total_recursos_mes}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 py-3">
              <span className="font-medium text-slate-600">
                Utilização Média
              </span>
              <span className="text-xl font-bold text-blue-600">
                {metricas.utilizacaoMedia}%
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 py-3">
              <span className="font-medium text-slate-600">Top Performers</span>
              <span className="text-xl font-bold text-green-600">
                {metricas.recursosExcelentes}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 py-3">
              <span className="font-medium text-slate-600">
                Recursos Críticos
              </span>
              <span className="text-xl font-bold text-red-600">
                {metricas.recursosCriticos}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="font-medium text-slate-600">
                Custo Médio/Recurso
              </span>
              <span className="text-xl font-bold text-orange-600">
                {formatCurrency(metricas.custoMedio || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsolidadoDashboard;
