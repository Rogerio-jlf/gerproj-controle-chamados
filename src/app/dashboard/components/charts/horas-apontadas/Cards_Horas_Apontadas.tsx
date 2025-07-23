'use client';

import { useAuth } from '@/contexts/Auth_Context';
import { formatHorasDecimalParaHHMM } from '@/functions/formatarHoras';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Calendar, CircleFadingPlus, CircleX, Clock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
} from '../../../../../components/ui/card';
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

export default function CardsHoraApontadas({ filters }: FiltersProps) {
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
          { params }
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
  const mesesComDados = data?.filter(item => item.total_horas > 0).length || 0;
  const mediaHoras = mesesComDados > 0 ? totalHoras / mesesComDados : 0;

  return (
    <div className="space-y-4">
      {/* LOADING CARREGAMENTO */}
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
                  <p className="text-md font-semibold text-black">
                    Carregando...
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : // ERRO CARREGAMENTO
      isError || !data ? (
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
        // CARDS MÉTRICAS
        <div className="grid grid-cols-3 gap-4">
          {/* TOTAL HORAS EXECUTADAS */}
          <Card className="group relative min-h-[60px] overflow-hidden rounded-lg border border-gray-300 bg-white p-4 shadow-md shadow-black">
            <CardHeader className="relative flex flex-row items-center gap-4 p-0">
              <div className="relative -top-6 left-0 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-800">
                <Clock className="absolute h-5 w-5 animate-pulse text-white" />
              </div>

              <div className="flex-1">
                <p className="mb-4 text-sm font-semibold tracking-wider text-black italic">
                  QTD. horas executadas ano
                </p>
                <p className="items-center text-2xl font-extrabold text-black italic">
                  {formatHorasDecimalParaHHMM(totalHoras)}
                </p>
              </div>
            </CardHeader>
            <CardContent className="hidden" />{' '}
          </Card>

          {/* NÚMERO MESES */}
          <Card className="group relative min-h-[60px] overflow-hidden rounded-lg border border-gray-300 bg-white p-4 shadow-md shadow-black">
            <CardHeader className="relative flex flex-row items-center gap-4 p-0">
              <div className="relative -top-6 left-0 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-800">
                <Calendar className="absolute h-5 w-5 animate-pulse text-white" />
              </div>

              <div className="flex-1">
                <p className="mb-4 text-sm font-semibold tracking-wider text-black italic">
                  Número de meses com dados
                </p>
                <p className="items-center text-2xl font-extrabold text-black italic">
                  {mesesComDados}
                </p>
              </div>
            </CardHeader>
            <CardContent className="hidden" />{' '}
          </Card>

          {/* MÉDIA HORAS MÊS */}
          <Card className="group relative min-h-[60px] overflow-hidden rounded-lg border border-gray-300 bg-white p-4 shadow-md shadow-black">
            <CardHeader className="relative flex flex-row items-center gap-4 p-0">
              <div className="relative -top-6 left-0 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-800">
                <CircleFadingPlus className="absolute h-5 w-5 animate-pulse text-white" />
              </div>

              <div className="flex-1">
                <p className="mb-4 text-sm font-semibold tracking-wider text-black italic">
                  Média de horas por mês
                </p>
                <p className="items-center text-2xl font-extrabold text-black italic">
                  {formatHorasDecimalParaHHMM(mediaHoras)}
                </p>
              </div>
            </CardHeader>
            <CardContent className="hidden" />{' '}
          </Card>
        </div>
      )}
    </div>
  );
}
