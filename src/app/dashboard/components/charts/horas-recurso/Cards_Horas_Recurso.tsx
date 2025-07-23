'use client';

import { useAuth } from '@/contexts/Auth_Context';
import { formatHorasDecimalParaHHMM } from '@/functions/formatarHoras';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CircleFadingPlus, CircleX, Clock, Users2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
} from '../../../../../components/ui/card';

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
                  QTD. horas executadas mês
                </p>
                <p className="items-center text-2xl font-extrabold text-black italic">
                  {formatHorasDecimalParaHHMM(data.totalHorasExecutadas)}
                </p>
              </div>
            </CardHeader>
            <CardContent className="hidden" />{' '}
          </Card>

          {/* NÚMERO RECURSO */}
          <Card className="group relative min-h-[60px] overflow-hidden rounded-lg border border-gray-300 bg-white p-4 shadow-md shadow-black">
            <CardHeader className="relative flex flex-row items-center gap-4 p-0">
              <div className="relative -top-6 left-0 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-800">
                <Users2 className="absolute h-5 w-5 animate-pulse text-white" />
              </div>
              <div className="flex-1">
                <p className="mb-4 text-sm font-semibold tracking-wider text-black italic">
                  Número recursos utilizados
                </p>
                <p className="items-center text-2xl font-extrabold text-black italic">
                  {data.numeroDeRecursos}
                </p>
              </div>
            </CardHeader>
            <CardContent className="hidden" />{' '}
          </Card>

          {/* MÉDIA RECURSO */}
          <Card className="group relative min-h-[60px] overflow-hidden rounded-lg border border-gray-300 bg-white p-4 shadow-md shadow-black">
            <CardHeader className="relative flex flex-row items-center gap-4 p-0">
              <div className="relative -top-6 left-0 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-800">
                <CircleFadingPlus className="absolute h-5 w-5 animate-pulse text-white" />
              </div>
              <div className="flex-1">
                <p className="mb-4 text-sm font-semibold tracking-wider text-black italic">
                  Média de horas por recurso
                </p>
                <p className="items-center text-2xl font-extrabold text-black italic">
                  {formatHorasDecimalParaHHMM(data.mediaHorasPorCliente)}
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
