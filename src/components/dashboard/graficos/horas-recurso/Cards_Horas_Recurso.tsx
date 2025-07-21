'use client';

import { useAuth } from '@/context/AuthContext';
import { formatHorasDecimalParaHHMM } from '@/functions/formatarHoras';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface FiltersProps {
  mes: string;
  ano: string;
  cliente?: string;
  recurso?: string;
  status?: string;
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

export default function CardsHorasRecurso({
  filters,
}: {
  filters: FiltersProps;
}) {
  const [dados, setDados] = useState<ApiResponseProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const { isAdmin, codCliente } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErro(null);

        const params = {
          ...filters,
          isAdmin: isAdmin.toString(),
          ...(!isAdmin && codCliente && { codCliente }),
        };

        const res = await axios.get('/api/metrica-grafico/hora_recurso', {
          params,
        });

        setDados(res.data as ApiResponseProps);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setErro('Erro ao carregar os dados');
        setDados(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, isAdmin, codCliente]);

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg ring-1 shadow-indigo-500/25 ring-white/20 lg:h-12 lg:w-12">
              <svg
                className="h-5 w-5 text-white lg:h-6 lg:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-emerald-400 lg:h-4 lg:w-4"></div>
          </div>

          <div>
            <h2 className="bg-gradient-to-r from-gray-800 via-indigo-800 to-purple-800 bg-clip-text text-2xl font-black text-transparent lg:text-3xl">
              Horas por recurso
            </h2>
            <p className="text-xs font-medium text-gray-500 lg:text-sm">
              Distribuição de horas executadas por recurso
              {/* {!isAdmin && codCliente && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Cliente: {codCliente}
                </span>
              )} */}
            </p>
          </div>
        </div>

        {/* Badge de status */}
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-2 lg:px-4">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></div>
          <span className="text-xs font-semibold text-emerald-700 lg:text-sm">
            {isAdmin ? 'Administrador' : ''}
          </span>
        </div>
      </div>

      {/* Cards das métricas */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-200"></div>
                <div className="flex-1">
                  <div className="mb-1 h-3 rounded bg-blue-200"></div>
                  <div className="h-5 rounded bg-blue-200"></div>
                  <span className="mt-1">Carregando...</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : erro || !dados ? (
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
          <div className="col-span-full rounded-xl border border-red-200 bg-red-50 p-4 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <p className="font-medium text-red-600">
              {erro || 'Erro ao carregar dados'}
            </p>
          </div>
        </div>
      ) : (
        // Cards
        <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-3">
          {/* Card Total de Horas executadas */}
          <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-100 to-indigo-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <div>
                <p className="text-xs font-medium text-blue-600">
                  Total horas executadas
                </p>
                <p className="text-xl font-bold text-blue-800">
                  {formatHorasDecimalParaHHMM(dados.totalHorasExecutadas)}
                </p>
              </div>
            </div>
          </div>

          {/* Card Número de Recursos */}
          <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-100 to-teal-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-600">
                  Total recursos utilizados
                </p>
                <p className="text-xl font-bold text-emerald-800">
                  {dados.numeroDeRecursos}
                </p>
              </div>
            </div>
          </div>

          {/* Card Média por Recurso */}
          <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-100 to-pink-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-purple-600">
                  Total média horas recurso
                </p>
                <p className="text-xl font-bold text-purple-800">
                  {formatHorasDecimalParaHHMM(dados.mediaHorasPorCliente)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
