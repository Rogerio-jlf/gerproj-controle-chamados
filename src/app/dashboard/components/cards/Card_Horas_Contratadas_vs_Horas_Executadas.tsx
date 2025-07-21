'use client';

import { useAuth } from '@/contexts/AuthContext';
import { formatHorasDecimalParaHHMM } from '@/functions/formatarHoras';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CircleX, Minus, TrendingDown, TrendingUp } from 'lucide-react';

interface FiltersProps {
  filters: {
    ano: number;
    mes: number;
    cliente: string;
    recurso: string;
    status: string;
  };
}

interface ApiResponse {
  totalHorasContratadas: number;
  totalHorasExecutadas: number;
}

export default function CardHorasContratadasHorasExecutadas({
  filters,
}: FiltersProps) {
  const { isAdmin, codCliente } = useAuth();

  const fetchData = async (): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    params.append('mes', filters.mes.toString());
    params.append('ano', filters.ano.toString());
    params.append('isAdmin', isAdmin.toString());

    if (!isAdmin && codCliente) {
      params.append('codCliente', codCliente);
    }

    if (filters.cliente) params.append('cliente', filters.cliente);
    if (filters.recurso) params.append('recurso', filters.recurso);
    if (filters.status) params.append('status', filters.status);

    const res = await axios.get<ApiResponse>(
      `/api/metrica/hora_contratada_hora_executada?${params.toString()}`
    );
    return res.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['horasContratadasExecutadas', filters, isAdmin, codCliente],
    queryFn: fetchData,
    enabled: !!filters && (isAdmin || codCliente !== null),
  });

  if (isLoading) {
    return (
      <div className="relative h-48 overflow-hidden rounded-xl border-2 border-dashed border-gray-400 bg-gray-200">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="relative mx-auto mb-4 h-12 w-12">
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-purple-600 border-r-purple-600" />
              <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-blue-600 border-l-blue-600 [animation-direction:reverse] [animation-duration:1.5s]" />
              <div className="absolute inset-4 animate-spin rounded-full border-2 border-transparent border-t-purple-600 border-r-purple-600" />
            </div>
            <p className="text-md font-semibold text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
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
    );
  }

  // ✅ Extração e cálculo seguro
  const totalHorasContratadas = data.totalHorasContratadas;
  const totalHorasExecutadas = data.totalHorasExecutadas;
  const percentual =
    totalHorasContratadas > 0
      ? (totalHorasExecutadas / totalHorasContratadas) * 100
      : 0;
  const diferenca = totalHorasExecutadas - totalHorasContratadas;

  const getStatusIcon = () => {
    if (diferenca > 0.5) return <TrendingUp className="h-4 w-4" />;
    if (diferenca < -0.5) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getThemeColors = () => {
    if (diferenca > 0.5)
      return {
        primary: 'from-red-200 to-rose-200',
        secondary: 'from-red-500 to-rose-500',
        accent: 'text-red-600',
        border: 'border-red-200',
        bg: 'bg-red-500',
        label: 'Excedeu',
      };
    if (diferenca < -0.5)
      return {
        primary: 'from-emerald-200 to-green-200',
        secondary: 'from-emerald-50 to-green-50',
        accent: 'text-emerald-600',
        border: 'border-emerald-200',
        bg: 'bg-emerald-500',
        label: 'Restante',
      };
    return {
      primary: 'from-blue-200 to-indigo-200',
      secondary: 'from-blue-50 to-indigo-50',
      accent: 'text-blue-600',
      border: 'border-blue-200',
      bg: 'bg-blue-500',
      label: 'Equilibrado',
    };
  };

  const theme = getThemeColors();

  return (
    <div className="group relative h-56 overflow-hidden rounded-xl border border-gray-300 px-6 py-3 shadow-md shadow-black">
      <div className="relative z-10 h-full">
        {/* Header */}
        <div className="mb-4 text-center">
          <h3 className="text-lg font-bold text-gray-900">
            Horas Contratadas x Executadas
          </h3>
        </div>

        {/* Main metrics */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Contratadas
            </div>
            <div className="text-lg font-black text-gray-800">
              {formatHorasDecimalParaHHMM(totalHorasContratadas)}
            </div>
          </div>
          <div className="text-center">
            <div className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Executadas
            </div>
            <div className="text-lg font-black text-gray-800">
              {formatHorasDecimalParaHHMM(totalHorasExecutadas)}
            </div>
          </div>
          <div className="text-center">
            <div
              className={`mb-1 text-xs font-semibold tracking-wider uppercase ${theme.accent}`}
            >
              Diferença
            </div>
            <div className={`text-lg font-black ${theme.accent}`}>
              {diferenca > 0 ? '+' : ''}
              {formatHorasDecimalParaHHMM(Math.abs(diferenca))}
            </div>
          </div>
        </div>

        {/* Progress visualization */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-gray-600">
            <span>Progresso</span>
            <span>{percentual.toFixed(0)}%</span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full bg-gradient-to-r ${theme.secondary} transition-all duration-1000 ease-out`}
              style={{ width: `${Math.min(percentual, 100)}%` }}
            />
            {percentual > 100 && (
              <div className="absolute top-0 right-0 h-full w-0.5 animate-pulse bg-red-400" />
            )}
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex justify-center">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${theme.border} ${theme.accent} bg-white/60 backdrop-blur-sm`}
          >
            {getStatusIcon()}
            <span>
              {Math.abs(diferenca) < 0.5
                ? 'Equilibrado'
                : `${theme.label}: ${formatHorasDecimalParaHHMM(Math.abs(diferenca))}`}
            </span>
          </div>
        </div>
      </div>

      {/* Subtle border glow */}
      <div className={`absolute inset-0 bg-gradient-to-r ${theme.primary}`} />
    </div>
  );
}
