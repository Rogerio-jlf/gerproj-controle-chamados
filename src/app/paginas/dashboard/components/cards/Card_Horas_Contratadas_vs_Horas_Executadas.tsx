'use client';

import { useAuth } from '@/contexts/Auth_Context';
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

interface ApiResponseProps {
  totalHorasContratadas: number;
  totalHorasExecutadas: number;
}

export default function CardHorasContratadasHorasExecutadas({
  filters,
}: FiltersProps) {
  const { isAdmin, codCliente } = useAuth();

  const fetchData = async (): Promise<ApiResponseProps> => {
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

    const res = await axios.get<ApiResponseProps>(
      `/api/postgre-SQL/apontamentos-view/metricas/horas_contratadas_horas_executadas?${params.toString()}`
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
            <p className="text-md font-semibold text-black">Carregando...</p>
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

  function formatHorasDecimalParaHHMM(decimal: number): string {
    const horas = Math.floor(decimal);
    const minutos = Math.round((decimal - horas) * 60);

    const horasFormatadas = String(horas).padStart(2, '0');
    const minutosFormatados = String(minutos).padStart(2, '0');

    return `${horasFormatadas}h:${minutosFormatados}`;
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
    if (diferenca > 0.5)
      return <TrendingUp className="h-7 w-7 animate-pulse" />;
    if (diferenca < -0.5)
      return <TrendingDown className="h-7 w-7 animate-pulse" />;
    return <Minus className="h-7 w-7 animate-pulse" />;
  };

  const getThemeColors = () => {
    if (diferenca > 0.5)
      return {
        secondary: 'bg-red-500',
        accent: 'text-red-800',
        border: 'border-red-200',
        label: 'Excedeu',
        bgColor: 'bg-red-200',
      };
    if (diferenca < -0.5)
      return {
        secondary: 'bg-green-500',
        accent: 'text-green-800',
        border: 'border-green-200',
        label: 'Restante',
        bgColor: 'bg-green-200',
      };
    return {
      secondary: 'bg-blue-500',
      accent: 'text-blue-500',
      border: 'border-blue-200',
      label: 'Equilibrado',
      bgColor: 'bg-blue-200',
    };
  };

  const theme = getThemeColors();

  return (
    <div className="group relative h-60 overflow-hidden rounded-lg border border-gray-300 p-6 shadow-md shadow-black">
      <div className="relative z-10 h-full">
        {/* HEADER */}
        <div className="mb-4 text-center">
          <h3 className="text-xl font-extrabold tracking-wider text-black italic">
            Horas Contratadas x Executadas
          </h3>
        </div>

        {/* MÉTRICAS */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          {/* HORAS CONTRATADAS */}
          <div className="rounded-lg bg-yellow-200 p-1 text-center">
            <div className="text-base font-semibold tracking-wider text-yellow-800 italic">
              Contratadas
            </div>
            <div className="text-xl font-extrabold tracking-wider text-yellow-800">
              {formatHorasDecimalParaHHMM(totalHorasContratadas)}
            </div>
          </div>

          {/* HORAS EXECUTADAS */}
          <div className="rounded-lg bg-blue-200 p-1 text-center">
            <div className="text-base font-semibold tracking-wider text-blue-800 italic">
              Executadas
            </div>
            <div className="text-xl font-extrabold tracking-wider text-blue-800">
              {formatHorasDecimalParaHHMM(totalHorasExecutadas)}
            </div>
          </div>

          {/* DIFERENÇA */}
          <div className={`rounded-lg p-1 text-center ${theme.bgColor}`}>
            <div
              className={`text-base font-extrabold tracking-wider italic ${theme.accent}`}
            >
              Diferença
            </div>
            <div
              className={`text-xl font-extrabold tracking-wider ${theme.accent}`}
            >
              {diferenca > 0 ? '+' : ''}
              {formatHorasDecimalParaHHMM(Math.abs(diferenca))}
            </div>
          </div>
        </div>

        {/* BARRA PROGRESSO */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm font-semibold tracking-wider text-black italic">
            <span>Progresso</span>
            <span>{percentual.toFixed(0)}%</span>
          </div>

          <div className="relative h-2 overflow-hidden rounded-full bg-black">
            <div
              className={`h-full ${theme.secondary}`}
              style={{ width: `${Math.min(percentual, 100)}%` }}
            />
          </div>
        </div>

        {/* INDICADOR STATUS */}
        <div className="flex justify-center">
          <div
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-1 text-lg font-extrabold tracking-wider ${theme.border} ${theme.accent} ${theme.bgColor}`}
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
    </div>
  );
}
