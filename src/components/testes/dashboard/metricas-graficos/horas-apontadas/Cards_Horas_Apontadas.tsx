'use client';

import { useAuth } from '@/context/AuthContext';
import { formatHorasDecimalParaHHMM } from '@/functions/formatarHoras';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CircleX, Clock, Users } from 'lucide-react';
import HeaderComponente from './Header';

interface FiltersProps {
  filters: {
    ano: string;
    mes?: string;
    cliente?: string;
    recurso?: string;
    status?: string;
  };
}

interface ApiResponseProps {
  mes: number;
  ano: number;
  periodo: string;
  total_horas: number;
  total_apontamentos: number;
  label_mes: string;
}

export function CardsHorasApontadas({ filters }: FiltersProps) {
  const { isAdmin, codCliente, isLoggedIn } = useAuth();

  const { data, isLoading, isError } = useQuery<ApiResponseProps[]>({
    queryKey: ['horas-apontadas-metricas', filters, isAdmin, codCliente],
    queryFn: async () => {
      const ano = parseInt(filters.ano);

      const promises = Array.from({ length: 12 }, async (_, index) => {
        const mes = index + 1;
        const params = {
          ...filters,
          mes: mes.toString(),
          isAdmin: isAdmin.toString(),
          ...(!isAdmin && codCliente && { codCliente }),
        };

        const res = await axios.get<{ dados_grafico: ApiResponseProps }>(
          '/api/metrica-grafico/hora_apontamento',
          { params },
        );

        const { dados_grafico } = res.data;

        return {
          mes: dados_grafico.mes,
          ano: dados_grafico.ano,
          periodo: dados_grafico.periodo,
          total_horas: dados_grafico.total_horas,
          total_apontamentos: dados_grafico.total_apontamentos,
          label_mes: dados_grafico.label_mes,
        };
      });

      return Promise.all(promises);
    },
    enabled: isLoggedIn && !!filters.ano,
  });

  const totalHoras =
    data?.reduce((acc, curr) => acc + curr.total_horas, 0) || 0;
  const mesesComDados =
    data?.filter((item) => item.total_horas > 0).length || 0;
  const mediaHoras = mesesComDados > 0 ? totalHoras / mesesComDados : 0;

  return (
    <div className="space-y-4">
      <HeaderComponente />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[1, 2, 3].map((index) => (
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
          <div className="group relative min-h-[60px] overflow-hidden rounded-xl bg-gradient-to-br from-blue-300 via-slate-600 to-blue-300 p-3 shadow-md shadow-black">
            <div className="relative flex items-center gap-4">
              <div className="relative transition-transform duration-400">
                <div className="relative -top-5 left-0 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-black via-blue-500 to-black">
                  <Clock className="absolute h-6 w-6 animate-pulse text-white" />
                </div>
              </div>

              <div className="flex-1">
                <p className="mb-1 text-sm font-bold text-white">
                  Total de horas executadas
                </p>
                <p className="items-center text-2xl font-extrabold text-white italic">
                  {formatHorasDecimalParaHHMM(totalHoras)}
                </p>
              </div>
            </div>
          </div>

          {/* Número de Recursos (meses com dados) */}
          <div className="group relative min-h-[60px] overflow-hidden rounded-xl bg-gradient-to-br from-yellow-300 via-slate-600 to-yellow-300 p-3 shadow-md shadow-black">
            <div className="relative flex items-center gap-4">
              <div className="relative transition-transform duration-400">
                <div className="relative -top-5 left-0 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-black via-yellow-500 to-black">
                  <Users className="absolute h-6 w-6 animate-pulse text-white" />
                </div>
              </div>

              <div className="flex-1">
                <p className="mb-1 text-sm font-bold text-white italic">
                  Total de recursos utilizados
                </p>
                <p className="items-center text-2xl font-extrabold text-white italic">
                  {mesesComDados}
                </p>
              </div>
            </div>
          </div>

          {/* Média de Horas */}
          <div className="group relative min-h-[60px] overflow-hidden rounded-xl bg-gradient-to-br from-lime-300 via-slate-600 to-lime-300 p-3 shadow-md shadow-black">
            <div className="relative flex items-center gap-4">
              <div className="relative transition-transform duration-400">
                <div className="relative -top-5 left-0 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-black via-lime-500 to-black">
                  <Clock className="absolute h-6 w-6 animate-pulse text-white" />
                </div>
              </div>

              <div className="flex-1">
                <p className="mb-1 text-sm font-bold text-white italic">
                  Média de horas por mês
                </p>
                <p className="items-center text-2xl font-extrabold text-white italic">
                  {formatHorasDecimalParaHHMM(mediaHoras)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
