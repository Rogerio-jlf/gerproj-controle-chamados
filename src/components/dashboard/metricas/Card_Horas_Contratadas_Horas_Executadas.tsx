'use client';

import { useAuth } from '@/context/AuthContext';
import { formatHorasDecimalParaHHMM } from '@/functions/formatarHoras';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';

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
      `/api/metrica/hora_contratada_hora_executada?${params.toString()}`,
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
      <div className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border border-gray-300 bg-white shadow-md shadow-black transition-all duration-300 hover:bg-gray-50 hover:shadow-lg">
        <div className="flex h-full flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <span className="mt-3 text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-red-300 bg-white shadow shadow-black">
        <span className="text-red-600">Erro ao carregar dados</span>
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
    if (diferenca > 0.5) return <TrendingUp className="h-3 w-3 text-red-500" />;
    if (diferenca < -0.5)
      return <TrendingDown className="h-3 w-3 text-blue-500" />;
    return <Minus className="h-3 w-3 text-green-500" />;
  };

  const getStatusColor = () => {
    if (diferenca > 0.5) return 'text-red-600 bg-red-50 border-red-200';
    if (diferenca < -0.5) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getBarColor = () => {
    if (diferenca > 0.5) return 'bg-red-500';
    if (diferenca < -0.5) return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <div className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border border-gray-300 bg-white px-6 shadow-md shadow-black transition-all duration-300 hover:bg-gray-50 hover:shadow-lg">
      <span className="mb-4 text-center text-lg font-semibold text-gray-600">
        Horas contratadas x Horas executadas
      </span>
      <div className="w-full space-y-3">
        {/* Contratadas */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">
              Contratadas
            </span>
            <span className="text-xs font-bold text-gray-800">
              {formatHorasDecimalParaHHMM(totalHorasContratadas)}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-400">
            <div
              className="h-2 rounded-full bg-yellow-500"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Executadas */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">
              Executadas
            </span>
            <span className="text-xs font-bold text-gray-800">
              {formatHorasDecimalParaHHMM(totalHorasExecutadas)}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-400">
            <div
              className={`h-2 rounded-full ${getBarColor()} ${
                percentual > 100 ? 'border-2 border-red-300' : ''
              }`}
              style={{ width: `${Math.min(percentual, 100)}%` }}
            />
          </div>
        </div>

        {/* Status */}
        <div
          className={`flex items-center justify-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-all duration-300 ${getStatusColor()}`}
        >
          {getStatusIcon()}
          <span>
            {Math.abs(diferenca) < 0.5
              ? 'No prazo'
              : diferenca > 0
                ? `+${diferenca.toFixed(1)}h`
                : `${diferenca.toFixed(1)}h`}
            <span className="ml-1 opacity-75">({percentual.toFixed(0)}%)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
