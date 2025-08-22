'use client';
import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Target,
  Zap,
  BarChart3,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Activity,
  Eye,
  EyeOff,
} from 'lucide-react';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
import { TbClockPlus } from 'react-icons/tb';
import { IoSearch } from 'react-icons/io5';
import { FaChartBar } from 'react-icons/fa6';
import { IoMdClock } from 'react-icons/io';
import { BiSolidZap } from 'react-icons/bi';
import { FaSortAlphaUpAlt } from 'react-icons/fa';
import { FaSortAlphaDown } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';
import { FaDollarSign } from 'react-icons/fa';
import { FaCalendarAlt } from 'react-icons/fa';
import { FaClock } from 'react-icons/fa6';
import { FaTriangleExclamation } from 'react-icons/fa6';
import { FaCheckCircle } from 'react-icons/fa';
import { SiTarget } from 'react-icons/si';
// ====================================================================================================

interface RecursoProps {
  nome: string;
  percentualAtingido: number;
  percentualEficiencia: number;
  percentualUtilizacao: number;
  nivelPerformance: number;
  horasFaturadas: number;
  horasNaoFaturadas: number;
}

interface TabelaProps {
  dadosProcessados: RecursoProps[];
}

interface CardProps {
  gradient: string;
  gradientIcon: string;
  icon: React.ReactNode;
  badge: string;
  gradientBadge: string;
  title: string;
  value: string;
  subtitle: string;
  trend: { value: number; label: string };
}
// ====================================================================================================

// Cartões de estatísticas
const StatCards: React.FC<CardProps> = ({
  gradient,
  gradientIcon,
  icon,
  badge,
  gradientBadge,
  title,
  value,
  subtitle,
  trend,
}) => (
  <div
    className={`${gradient} group space-y-6 rounded-xl p-6 text-white shadow-md shadow-black`}
  >
    <div className="flex items-center justify-between">
      <div className={`rounded-md p-3 ${gradientIcon}`}>
        <div className="text-2xl">{icon}</div>
      </div>
      {/* ===== */}
      {badge && (
        <span
          className={`bg-opacity-20 rounded-full ${gradientBadge} px-6 py-1 text-sm font-bold tracking-wider text-white select-none`}
        >
          {badge}
        </span>
      )}
    </div>
    {/* ===== */}

    <div className="flex flex-col items-start justify-center space-y-1">
      <h3 className="text-sm font-semibold tracking-wider select-none">
        {title}
      </h3>
      {/* ===== */}
      <p className="text-2xl font-bold tracking-wider select-none">{value}</p>
      {/* ===== */}
      {subtitle && (
        <p className="text-sm font-semibold tracking-wider select-none">
          {subtitle}
        </p>
      )}
    </div>
    {/* ===== */}

    {trend && (
      <div className="flex flex-col items-start justify-center space-y-6">
        <div className="w-full rounded-full bg-white/50 p-0.5"></div>
        {/* ===== */}
        <div className="flex items-center space-x-2">
          {trend.value > 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {/* ===== */}
          <span className="text-sm font-semibold tracking-wider select-none">
            {Math.abs(trend.value).toFixed(1)}% {trend.label}
          </span>
        </div>
      </div>
    )}
  </div>
);
// ====================================================================================================

// Filtros
const Filters: React.FC<{
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  performanceFilter: string;
  setPerformanceFilter: (filter: string) => void;
  hoursFilter: string;
  setHoursFilter: (filter: string) => void;
  efficiencyFilter: string;
  setEfficiencyFilter: (filter: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}> = ({
  searchTerm,
  setSearchTerm,
  performanceFilter,
  setPerformanceFilter,
  hoursFilter,
  setHoursFilter,
  efficiencyFilter,
  setEfficiencyFilter,
  showFilters,
  setShowFilters,
}) => (
  <div className="flex flex-col justify-between space-y-6 bg-slate-900 p-6">
    {/* Título e botão de ocultar */}
    <div className="flex items-center justify-between">
      <h3 className="text-2xl font-extrabold tracking-wider text-white select-none">
        Filtros
      </h3>
      {/* ===== */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex cursor-pointer items-center justify-center gap-3 rounded-md border border-white/60 bg-slate-950 px-6 py-2 text-sm font-semibold tracking-wider text-white/60 transition-all hover:scale-105 hover:bg-white hover:text-gray-900 hover:shadow-lg hover:shadow-black"
      >
        {showFilters ? <EyeOff size={20} /> : <Eye size={20} />}
        {/* ===== */}
        <span className="text-sm font-semibold tracking-wider select-none">
          {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
        </span>
      </button>
    </div>
    {/* ===== */}

    {/* Filtros */}
    {showFilters && (
      <div className="space-y-6">
        {/* Busca */}
        <div className="relative">
          <IoSearch
            className="absolute top-1/2 left-3 -translate-y-1/2 transform text-white/60"
            size={24}
          />
          {/* ===== */}
          <input
            type="text"
            placeholder="Buscar por nome do recurso..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-white/60 px-6 py-2 pl-12 text-base text-white placeholder:text-base placeholder:text-white/60 placeholder:italic"
          />
        </div>
        {/* ===== */}

        <div className="grid grid-cols-3 gap-6">
          {/* Filtro performance */}
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <FaChartBar className="text-white/60" size={24} />
              {/* ===== */}
              <span className="text-base font-bold tracking-wider text-white/60 select-none">
                Performance
              </span>
            </label>
            {/* ===== */}
            <select
              value={performanceFilter}
              onChange={e => setPerformanceFilter(e.target.value)}
              className="w-full rounded-md border border-white/60 bg-slate-900 px-6 py-2 text-base tracking-wider text-white/60"
            >
              <option value="all">Todas as Performances</option>
              <option value="excellent">Excelente (≥90%)</option>
              <option value="good">Bom (75-89%)</option>
              <option value="regular">Regular (60-74%)</option>
              <option value="low">Baixo (&lt;60%)</option>
            </select>
          </div>
          {/* ===== */}

          {/* Filtro horas */}
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <IoMdClock className="text-white/60" size={24} />
              {/* ===== */}
              <span className="text-base font-bold tracking-wider text-white/60 select-none">
                Carga Horária
              </span>
            </label>
            {/* ===== */}
            <select
              value={hoursFilter}
              onChange={e => setHoursFilter(e.target.value)}
              className="w-full rounded-md border border-white/60 bg-slate-900 px-6 py-2 text-base tracking-wider text-white/60"
            >
              <option value="all">Todas as Cargas</option>
              <option value="high">Alta (&gt;40h)</option>
              <option value="medium">Média (20-40h)</option>
              <option value="low">Baixa (&lt;20h)</option>
            </select>
          </div>

          {/* Filtro eficiência */}
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <BiSolidZap className="text-white/60" size={24} />
              {/* ===== */}
              <span className="text-base font-bold tracking-wider text-white/60 select-none">
                Eficiência
              </span>
            </label>
            {/* ===== */}
            <select
              value={efficiencyFilter}
              onChange={e => setEfficiencyFilter(e.target.value)}
              className="w-full rounded-md border border-white/60 bg-slate-900 px-6 py-2 text-base tracking-wider text-white/60"
            >
              <option value="all">Todas as Eficiências</option>
              <option value="high">Alta (&gt;80%)</option>
              <option value="medium">Média (60-80%)</option>
              <option value="low">Baixa (&lt;60%)</option>
            </select>
          </div>
        </div>
      </div>
    )}
    {/* ===== */}
  </div>
);
// ====================================================================================================

// Componente de Métrica Avançada
const AdvancedMetricBar: React.FC<{
  value: number;
  color: string;
  icon: React.ReactNode;
  label: string;
  showDetails?: boolean;
}> = ({ value, color, icon, label, showDetails = true }) => {
  const getPerformanceData = (val: number) => {
    if (val >= 90)
      return {
        level: 'Excelente',
        textColor: 'text-emerald-700',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
      };
    if (val >= 75)
      return {
        level: 'Bom',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      };
    if (val >= 60)
      return {
        level: 'Regular',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
      };
    return {
      level: 'Baixo',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    };
  };

  const perfData = getPerformanceData(value);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="rounded-lg bg-gray-100 p-1">{icon}</div>
          <span className="text-xs font-medium text-gray-600">{label}</span>
        </div>
        <span className={`text-sm font-bold ${perfData.textColor}`}>
          {value.toFixed(1)}%
        </span>
      </div>

      <div className="relative">
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner">
          <div
            className={`h-full ${color} relative rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${Math.min(value, 100)}%` }}
          >
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
          </div>
        </div>
      </div>

      {showDetails && (
        <div
          className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold ${perfData.bgColor} ${perfData.textColor} ${perfData.borderColor} border`}
        >
          {value >= 90 ? (
            <CheckCircle className="mr-1 h-3 w-3" />
          ) : value >= 75 ? (
            <Award className="mr-1 h-3 w-3" />
          ) : value >= 60 ? (
            <AlertTriangle className="mr-1 h-3 w-3" />
          ) : (
            <XCircle className="mr-1 h-3 w-3" />
          )}
          {perfData.level}
        </div>
      )}
    </div>
  );
};
// ====================================================================================================

export default function TabelaRecursos({ dadosProcessados }: TabelaProps) {
  const [sortBy, setSortBy] = useState<keyof RecursoProps>('nome');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState('all');
  const [hoursFilter, setHoursFilter] = useState('all');
  const [efficiencyFilter, setEfficiencyFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(true);

  // Cálculos de estatísticas avançadas
  const stats = useMemo(() => {
    const totalHorasFaturadas = dadosProcessados.reduce(
      (acc, rec) => acc + rec.horasFaturadas,
      0
    );
    const totalHorasNaoFaturadas = dadosProcessados.reduce(
      (acc, rec) => acc + rec.horasNaoFaturadas,
      0
    );
    const totalHoras = totalHorasFaturadas + totalHorasNaoFaturadas;
    const mediaEficiencia =
      dadosProcessados.reduce((acc, rec) => acc + rec.percentualEficiencia, 0) /
      dadosProcessados.length;
    const mediaPerformance =
      dadosProcessados.reduce(
        (acc, rec) => acc + rec.nivelPerformance * 20,
        0
      ) / dadosProcessados.length;
    const mediaUtilizacao =
      dadosProcessados.reduce((acc, rec) => acc + rec.percentualUtilizacao, 0) /
      dadosProcessados.length;

    const recursosAltoDesempenho = dadosProcessados.filter(
      rec => rec.nivelPerformance * 20 >= 80
    ).length;
    const recursosBaixoDesempenho = dadosProcessados.filter(
      rec => rec.nivelPerformance * 20 < 60
    ).length;

    return {
      totalHorasFaturadas,
      totalHorasNaoFaturadas,
      totalHoras,
      mediaEficiencia,
      mediaPerformance,
      mediaUtilizacao,
      percentualFaturamento:
        totalHoras > 0 ? (totalHorasFaturadas / totalHoras) * 100 : 0,
      recursosAltoDesempenho,
      recursosBaixoDesempenho,
      totalRecursos: dadosProcessados.length,
    };
  }, [dadosProcessados]);

  // Dados filtrados e ordenados
  const dadosFiltrados = useMemo(() => {
    let filtered = [...dadosProcessados];

    // Aplicar busca por nome
    if (searchTerm) {
      filtered = filtered.filter(rec =>
        corrigirTextoCorrompido(rec.nome)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtro de performance
    if (performanceFilter !== 'all') {
      filtered = filtered.filter(rec => {
        const performance = rec.nivelPerformance * 20;
        switch (performanceFilter) {
          case 'excellent':
            return performance >= 90;
          case 'good':
            return performance >= 75 && performance < 90;
          case 'regular':
            return performance >= 60 && performance < 75;
          case 'low':
            return performance < 60;
          default:
            return true;
        }
      });
    }

    // Aplicar filtro de horas
    if (hoursFilter !== 'all') {
      filtered = filtered.filter(rec => {
        const totalHours = rec.horasFaturadas + rec.horasNaoFaturadas;
        switch (hoursFilter) {
          case 'high':
            return totalHours > 40;
          case 'medium':
            return totalHours >= 20 && totalHours <= 40;
          case 'low':
            return totalHours < 20;
          default:
            return true;
        }
      });
    }

    // Aplicar filtro de eficiência
    if (efficiencyFilter !== 'all') {
      filtered = filtered.filter(rec => {
        switch (efficiencyFilter) {
          case 'high':
            return rec.percentualEficiencia > 80;
          case 'medium':
            return (
              rec.percentualEficiencia >= 60 && rec.percentualEficiencia <= 80
            );
          case 'low':
            return rec.percentualEficiencia < 60;
          default:
            return true;
        }
      });
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortOrder === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return filtered;
  }, [
    dadosProcessados,
    sortBy,
    sortOrder,
    searchTerm,
    performanceFilter,
    hoursFilter,
    efficiencyFilter,
  ]);

  const handleSort = (column: keyof RecursoProps) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column: keyof RecursoProps) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? (
      <FaSortAlphaUpAlt size={20} />
    ) : (
      <FaSortAlphaDown size={20} />
    );
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-8">
        {/* Cards de Estatísticas Premium */}
        <div className="grid grid-cols-4 gap-6">
          <StatCards
            gradient="bg-gradient-to-br from-blue-500 via-blue-900 to-blue-500"
            gradientIcon="bg-gradient-to-br from-blue-300 via-blue-700 to-blue-300 shadow-md shadow-black"
            icon={<TbClockPlus className="text-white" size={24} />}
            badge="HORAS"
            gradientBadge="bg-gradient-to-br from-blue-300 via-blue-700 to-blue-300 shadow-md shadow-black"
            title="Horas Totais"
            value={`${stats.totalHoras.toFixed(0)}h`}
            subtitle={`${stats.totalRecursos} recursos ativos`}
            trend={{ value: 12.5, label: 'vs mês anterior' }}
          />
          {/* ===== */}
          <StatCards
            gradient="bg-gradient-to-br from-green-500 via-green-900 to-green-500"
            gradientIcon="bg-gradient-to-br from-green-300 via-green-700 to-green-300 shadow-md shadow-black"
            icon={<DollarSign className="text-white" size={24} />}
            badge="FATURAMENTO"
            gradientBadge="bg-gradient-to-br from-green-300 via-green-700 to-green-300 shadow-md shadow-black"
            title="Taxa de Faturamento"
            value={`${stats.percentualFaturamento.toFixed(1)}%`}
            subtitle={`${stats.totalHorasFaturadas.toFixed(0)}h faturáveis`}
            trend={{ value: 8.3, label: 'de melhoria' }}
          />
          {/* ===== */}
          <StatCards
            gradient="bg-gradient-to-br from-purple-500 via-purple-900 to-purple-500"
            gradientIcon="bg-gradient-to-br from-purple-300 via-purple-700 to-purple-300 shadow-md shadow-black"
            icon={<Zap className="text-white" size={24} />}
            badge="EFICIÊNCIA"
            gradientBadge="bg-gradient-to-br from-purple-300 via-purple-700 to-purple-300 shadow-md shadow-black"
            title="Eficiência Média"
            value={`${stats.mediaEficiencia.toFixed(1)}%`}
            subtitle={`${stats.recursosAltoDesempenho}/${stats.totalRecursos} alto desempenho`}
            trend={{ value: -2.1, label: 'ajuste necessário' }}
          />
          {/* ===== */}
          <StatCards
            gradient="bg-gradient-to-br from-amber-500 via-amber-900 to-amber-500"
            gradientIcon="bg-gradient-to-br from-amber-300 via-amber-700 to-amber-300 shadow-md shadow-black"
            icon={<BarChart3 className="text-white" size={24} />}
            badge="PERFORMANCE"
            gradientBadge="bg-gradient-to-br from-amber-300 via-amber-700 to-amber-300 shadow-md shadow-black"
            title="Performance Global"
            value={`${stats.mediaPerformance.toFixed(1)}%`}
            subtitle={`${stats.recursosBaixoDesempenho} recursos em atenção`}
            trend={{ value: 15.7, label: 'crescimento' }}
          />
        </div>

        {/* Tabela e filtros */}
        <div className="overflow-hidden rounded-2xl shadow-md shadow-black">
          {/* Filtros Avançados */}
          <Filters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            performanceFilter={performanceFilter}
            setPerformanceFilter={setPerformanceFilter}
            hoursFilter={hoursFilter}
            setHoursFilter={setHoursFilter}
            efficiencyFilter={efficiencyFilter}
            setEfficiencyFilter={setEfficiencyFilter}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />
          {/* ===== */}

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Cabeçalho da tabela */}
              <thead>
                <tr className="bg-teal-700">
                  <th
                    className="cursor-pointer p-6 text-center text-lg font-extrabold tracking-wider text-white transition-all select-none hover:bg-teal-900"
                    onClick={() => handleSort('nome')}
                  >
                    <div className="flex items-center gap-4">
                      <FaUser size={20} />
                      Recurso
                      {getSortIcon('nome')}
                    </div>
                  </th>
                  {/* ===== */}

                  <th className="p-6 text-center text-lg font-extrabold tracking-wider text-white select-none">
                    <div className="flex items-center justify-center gap-4">
                      <FaDollarSign size={20} />
                      Horas Faturadas
                    </div>
                  </th>
                  {/* ===== */}

                  <th className="p-6 text-center text-lg font-extrabold tracking-wider text-white select-none">
                    <div className="flex items-center justify-center gap-4">
                      <FaCalendarAlt size={20} />
                      Horas N/F
                    </div>
                  </th>
                  {/* ===== */}

                  <th
                    className="cursor-pointer p-6 text-center text-lg font-extrabold tracking-wider text-white transition-all select-none hover:bg-teal-900"
                    onClick={() => handleSort('percentualAtingido')}
                  >
                    <div className="flex items-center gap-4">
                      <Target size={20} />
                      Meta Atingida
                      {getSortIcon('percentualAtingido')}
                    </div>
                  </th>
                  {/* ===== */}

                  <th
                    className="cursor-pointer p-6 text-center text-lg font-extrabold tracking-wider text-white transition-all select-none hover:bg-teal-900"
                    onClick={() => handleSort('percentualEficiencia')}
                  >
                    <div className="flex items-center gap-4">
                      <Zap size={20} />
                      Eficiência
                      {getSortIcon('percentualEficiencia')}
                    </div>
                  </th>
                  {/* ===== */}

                  <th
                    className="cursor-pointer p-6 text-center text-lg font-extrabold tracking-wider text-white transition-all select-none hover:bg-teal-900"
                    onClick={() => handleSort('percentualUtilizacao')}
                  >
                    <div className="flex items-center gap-4">
                      <Clock size={20} />
                      Utilização
                      {getSortIcon('percentualUtilizacao')}
                    </div>
                  </th>
                  {/* ===== */}

                  <th
                    className="cursor-pointer p-6 text-center text-lg font-extrabold tracking-wider text-white transition-all select-none hover:bg-teal-900"
                    onClick={() => handleSort('nivelPerformance')}
                  >
                    <div className="flex items-center gap-4">
                      <BarChart3 size={20} />
                      Performance
                      {getSortIcon('nivelPerformance')}
                    </div>
                  </th>
                  {/* ===== */}
                </tr>
              </thead>
              {/* ===== */}

              {/* Corpo da tabela */}
              <tbody>
                {dadosFiltrados.map((recurso, index) => {
                  const totalHorasRecurso =
                    recurso.horasFaturadas + recurso.horasNaoFaturadas;
                  const performancePercent = recurso.nivelPerformance * 20;
                  const isHighPerformer = performancePercent >= 80;
                  const isLowPerformer = performancePercent < 60;

                  return (
                    <tr
                      key={index}
                      className={`border-b border-gray-300 transition-all hover:bg-orange-300/70 ${
                        isHighPerformer
                          ? 'bg-green-50'
                          : isLowPerformer
                            ? 'bg-red-50'
                            : ''
                      }`}
                    >
                      {/* Recurso */}
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-6">
                          {/* Ícone */}
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-md text-lg font-bold text-white shadow-md shadow-black select-none ${
                              isHighPerformer
                                ? 'bg-gradient-to-br from-green-300 via-green-700 to-green-300'
                                : isLowPerformer
                                  ? 'bg-gradient-to-br from-red-300 via-red-700 to-red-300'
                                  : 'bg-gradient-to-br from-blue-300 via-blue-700 to-blue-300'
                            }`}
                          >
                            {corrigirTextoCorrompido(recurso.nome)
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          {/* ===== */}
                          <div className="fle flex-col items-start justify-center">
                            {/* Nome */}
                            <div className="text-lg font-bold tracking-wider text-gray-900 select-none">
                              {corrigirTextoCorrompido(recurso.nome)}
                            </div>
                            {/* ===== */}
                            <div className="flex items-center justify-center gap-4">
                              {/* Ícone */}
                              <FaClock className="text-gray-800" size={20} />
                              {/* Valor */}
                              <span className="text-base font-semibold tracking-wider text-gray-800 select-none">
                                {totalHorasRecurso.toFixed(1)}h total
                              </span>
                              {/* Status positivo */}
                              {isHighPerformer && (
                                <FaCheckCircle
                                  className="text-green-600"
                                  size={20}
                                />
                              )}
                              {/* Status negativo */}
                              {isLowPerformer && (
                                <FaTriangleExclamation
                                  className="text-red-600"
                                  size={20}
                                />
                              )}
                            </div>
                          </div>
                          {/* ===== */}
                        </div>
                      </td>
                      {/* ===== */}

                      {/* Horas faturadas */}
                      <td className="px-6 py-6">
                        <div className="flex flex-col items-center gap-2">
                          {/* Valor */}
                          <div className="text-2xl font-bold tracking-wider text-green-700 select-none">
                            {recurso.horasFaturadas.toFixed(1)}h
                          </div>
                          {/* ===== */}
                          <div className="h-2 w-full rounded-full bg-gray-300">
                            {/* Barra de progresso */}
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-700"
                              style={{
                                width: `${totalHorasRecurso > 0 ? (recurso.horasFaturadas / totalHorasRecurso) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      {/* ===== */}

                      {/* Horas não faturadas */}
                      <td className="px-6 py-6 text-center">
                        <div className="flex flex-col items-center gap-2">
                          {/* Valor */}
                          <div className="text-2xl font-bold tracking-wider text-red-700 select-none">
                            {recurso.horasNaoFaturadas.toFixed(1)}h
                          </div>
                          {/* ===== */}
                          <div className="h-2 w-full rounded-full bg-gray-300">
                            {/* Barra de progresso */}
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-700"
                              style={{
                                width: `${totalHorasRecurso > 0 ? (recurso.horasNaoFaturadas / totalHorasRecurso) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      {/* ===== */}

                      {/* Meta atingida */}
                      <td className="px-6 py-6">
                        <AdvancedMetricBar
                          label="Meta"
                          value={recurso.percentualAtingido}
                          color="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"
                          icon={<SiTarget className="h-4 w-4 text-blue-600" />}
                        />
                      </td>
                      {/* ===== */}

                      {/* Eficiência */}
                      <td className="px-6 py-6">
                        <AdvancedMetricBar
                          value={recurso.percentualEficiencia}
                          color="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600"
                          icon={
                            <BiSolidZap className="h-4 w-4 text-emerald-600" />
                          }
                          label="Eficiência"
                        />
                      </td>
                      {/* ===== */}

                      {/* Utilização */}
                      <td className="px-6 py-6">
                        <AdvancedMetricBar
                          value={recurso.percentualUtilizacao}
                          color="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"
                          icon={<FaClock className="h-4 w-4 text-amber-600" />}
                          label="Utilização"
                        />
                      </td>
                      {/* ===== */}

                      {/* Performance */}
                      <td className="px-6 py-6">
                        <AdvancedMetricBar
                          value={performancePercent}
                          color="bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600"
                          icon={
                            <FaChartBar className="h-4 w-4 text-purple-600" />
                          }
                          label="Performance"
                        />
                      </td>
                      {/* ===== */}
                    </tr>
                  );
                })}
              </tbody>
              {/* ===== */}
            </table>
          </div>

          {/* Footer da Tabela */}
          <div className="border-t bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  {stats.recursosAltoDesempenho} alto desempenho
                </span>
                <span className="flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4 text-red-600" />
                  {stats.recursosBaixoDesempenho} necessita atenção
                </span>
              </div>
              <span className="font-semibold">
                Exibindo {dadosFiltrados.length} de {stats.totalRecursos}{' '}
                recursos
              </span>
            </div>
          </div>
        </div>

        {/* Resumo Analítico Avançado */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Card de Insights */}
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center space-x-3">
              <div className="rounded-xl bg-blue-100 p-3">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Insights Principais
              </h3>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                <h4 className="mb-2 font-bold text-blue-800">
                  Taxa de Faturamento
                </h4>
                <p className="text-blue-700">
                  <span className="text-2xl font-bold">
                    {stats.percentualFaturamento.toFixed(1)}%
                  </span>{' '}
                  das horas são faturáveis, representando{' '}
                  <strong>{stats.totalHorasFaturadas.toFixed(0)}h</strong> de
                  trabalho produtivo.
                </p>
              </div>

              <div className="rounded-xl border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50 p-4">
                <h4 className="mb-2 font-bold text-emerald-800">
                  Performance da Equipe
                </h4>
                <p className="text-emerald-700">
                  <span className="text-2xl font-bold">
                    {stats.recursosAltoDesempenho}
                  </span>{' '}
                  recursos com alto desempenho vs{' '}
                  <strong>{stats.recursosBaixoDesempenho}</strong> que precisam
                  de atenção.
                </p>
              </div>

              <div className="rounded-xl border-l-4 border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 p-4">
                <h4 className="mb-2 font-bold text-amber-800">
                  Eficiência Média
                </h4>
                <p className="text-amber-700">
                  A equipe mantém{' '}
                  <span className="text-2xl font-bold">
                    {stats.mediaEficiencia.toFixed(1)}%
                  </span>{' '}
                  de eficiência com utilização média de{' '}
                  <strong>{stats.mediaUtilizacao.toFixed(1)}%</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Card de Métricas Detalhadas */}
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center space-x-3">
              <div className="rounded-xl bg-purple-100 p-3">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Métricas Detalhadas
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 text-center">
                <div className="mb-2 text-3xl font-bold text-blue-600">
                  {stats.totalHoras.toFixed(0)}h
                </div>
                <div className="text-sm font-semibold text-blue-800">
                  Total de Horas
                </div>
                <div className="mt-1 text-xs text-blue-600">
                  {stats.totalRecursos} recursos ativos
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 text-center">
                <div className="mb-2 text-3xl font-bold text-emerald-600">
                  {stats.mediaPerformance.toFixed(1)}%
                </div>
                <div className="text-sm font-semibold text-emerald-800">
                  Performance Global
                </div>
                <div className="mt-1 text-xs text-emerald-600">
                  Média da equipe
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-4 text-center">
                <div className="mb-2 text-3xl font-bold text-amber-600">
                  {(
                    (stats.totalHorasFaturadas /
                      (stats.totalHorasFaturadas +
                        stats.totalHorasNaoFaturadas)) *
                    100
                  ).toFixed(1)}
                  %
                </div>
                <div className="text-sm font-semibold text-amber-800">
                  Taxa Produtiva
                </div>
                <div className="mt-1 text-xs text-amber-600">
                  Horas faturáveis
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-4 text-center">
                <div className="mb-2 text-3xl font-bold text-purple-600">
                  {stats.mediaUtilizacao.toFixed(1)}%
                </div>
                <div className="text-sm font-semibold text-purple-800">
                  Utilização Média
                </div>
                <div className="mt-1 text-xs text-purple-600">
                  Capacidade usada
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer com Informações Adicionais */}
        <div className="rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 p-8 text-white shadow-2xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h4 className="mb-3 flex items-center text-lg font-bold">
                <Target className="mr-2 h-5 w-5" />
                Objetivos Alcançados
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  • {stats.recursosAltoDesempenho}/{stats.totalRecursos}{' '}
                  recursos com performance ≥80%
                </li>
                <li>
                  • Taxa de faturamento:{' '}
                  {stats.percentualFaturamento.toFixed(1)}%
                </li>
                <li>
                  • Eficiência geral da equipe:{' '}
                  {stats.mediaEficiencia.toFixed(1)}%
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 flex items-center text-lg font-bold">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Pontos de Atenção
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  • {stats.recursosBaixoDesempenho} recursos com performance
                  &lt;60%
                </li>
                <li>
                  • {stats.totalHorasNaoFaturadas.toFixed(0)}h não faturáveis
                  identificadas
                </li>
                <li>• Oportunidades de otimização detectadas</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 flex items-center text-lg font-bold">
                <TrendingUp className="mr-2 h-5 w-5" />
                Próximos Passos
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li>• Revisar recursos de baixa performance</li>
                <li>• Otimizar distribuição de carga horária</li>
                <li>• Implementar melhorias de processo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
