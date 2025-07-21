'use client';

import { useAuth } from '@/contexts/AuthContext';
import { formatHorasDecimalParaHHMM } from '@/functions/formatarHoras';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CircleFadingPlus, CircleX, Clock, Users2 } from 'lucide-react';
import HeaderComponente from './Header';

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
  detalhesRecursos: Array<{
    codrec_os: string;
    nome_recurso: string | null;
    horasExecutadas: number;
    numeroClientesUnicos: number;
    percentual: number;
  }>;
  totalHorasExecutadas: number;
  numeroDeClientes: number;
  numeroDeRecursos: number;
  mediaHorasPorCliente: number;
}

export default function CardsHorasRecurso({ filters }: FiltersProps) {
  const { isAdmin, codCliente } = useAuth();

  const { data, isLoading, isError } = useQuery<ApiResponseProps>({
    queryKey: ['metrica-hora-recurso', filters, isAdmin, codCliente],
    queryFn: async () => {
      const params = {
        ...filters,
        isAdmin: isAdmin.toString(),
        ...(!isAdmin && codCliente && { codCliente }),
      };

      const res = await axios.get<ApiResponseProps>(
        '/api/metrica-grafico/hora_recurso',
        {
          params,
        }
      );
      return res.data;
    },
    enabled: !!filters.mes && !!filters.ano,
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <HeaderComponente />

      {/* Cards de métricas */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[1, 2, 3].map(index => (
            <div
              key={index}
              className="relative h-48 overflow-hidden rounded-xl border-2 border-dashed border-gray-400 bg-gray-200"
            >
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="relative mx-auto mb-4 h-12 w-12">
                    <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-purple-600 border-r-purple-600" />
                    <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-blue-600 border-l-blue-600 [animation-direction:reverse] [animation-duration:1.5s]" />
                    <div className="absolute inset-4 animate-spin rounded-full border-2 border-transparent border-t-purple-600 border-r-purple-600" />
                  </div>
                  <p className="text-md font-semibold text-gray-600">
                    Carregando...
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError || !data ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="group relative col-span-full min-h-[60px] overflow-hidden rounded-xl border-2 border-dashed border-red-300 bg-red-100 p-8 text-center shadow-xl">
            <div className="space-y-3">
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
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {/* Total de Horas executadas */}
          <div className="group relative min-h-[60px] overflow-hidden rounded-xl bg-gradient-to-br from-purple-300 via-slate-900 to-purple-300 p-3 shadow-md shadow-black">
            <div className="relative flex items-center gap-4">
              <div className="relative transition-transform duration-400">
                <div className="relative -top-3 left-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-black via-purple-500 to-black">
                  <Clock className="absolute h-6 w-6 animate-pulse text-white" />
                </div>
              </div>

              <div className="flex-1">
                <p className="mb-1 text-[13px] font-bold text-white">
                  Total de horas executadas
                </p>
                <p className="items-center text-[22px] font-extrabold text-white italic">
                  {formatHorasDecimalParaHHMM(data.totalHorasExecutadas)}
                </p>
              </div>
            </div>
          </div>

          {/* Número de Recursos */}
          <div className="group relative min-h-[60px] overflow-hidden rounded-xl bg-gradient-to-br from-teal-300 via-slate-900 to-teal-300 p-3 shadow-md shadow-black">
            {/* Background effects */}
            <div className="relative flex items-center gap-4">
              <div className="relative transition-transform duration-400">
                <div className="relative -top-3 left-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-black via-teal-500 to-black">
                  <Users2 className="absolute h-6 w-6 animate-pulse text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="mb-1 text-[13px] font-bold text-white">
                  Total de recursos utilizados
                </p>
                <p className="items-center text-[22px] font-extrabold text-white italic">
                  {data.numeroDeRecursos}
                </p>
              </div>
            </div>
          </div>

          {/* Média por Recurso */}
          <div className="group relative min-h-[60px] overflow-hidden rounded-xl bg-gradient-to-br from-pink-300 via-slate-600 to-pink-300 p-3 shadow-md shadow-black">
            <div className="relative flex items-center gap-4">
              <div className="relative transition-transform duration-400">
                <div className="relative -top-5 left-0 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-black via-pink-500 to-black">
                  <CircleFadingPlus className="absolute h-6 w-6 animate-pulse text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="mb-1 text-sm font-bold text-white italic">
                  Média de horas por recurso
                </p>
                <p className="items-center text-2xl font-extrabold text-white italic">
                  {formatHorasDecimalParaHHMM(data.mediaHorasPorCliente)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
