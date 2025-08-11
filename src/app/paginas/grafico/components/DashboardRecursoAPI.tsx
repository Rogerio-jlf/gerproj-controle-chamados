'use client';
import React, { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatarNumero, calcularStatus } from './utils';

// =======================
// Tipos da API
// =======================
export interface RecursoAPI {
  nome_recurso: string;
  cod_recurso: number;
  quantidade_horas_disponiveis_recurso: number;
  quantidade_horas_executadas_recurso: number;
  quantidade_horas_faturadas_recurso: number;
  quantidade_horas_nao_faturadas_recurso: number;
  quantidade_horas_necessarias_produzir: number;
  valor_custo_recurso: number;
  valor_rateio_despesas_recurso: number;
  valor_total_recurso_produzir_pagar: number;
}

export interface DashboardAPIResponse {
  data_recursos: RecursoAPI[];
  media_custos_recurso_mes?: number;
  quantidade_total_recursos_mes: number;
}

// =======================
// Tipos de dados processados
// =======================
interface RecursoProcessado {
  nome: string;
  nomeCompleto: string;
  codRecurso: number;
  horasDisponiveis: number;
  horasFaturadas: number;
  horasNaoFaturadas: number;
  horasExecutadas: number;
  horasNecessarias: number;
  percentualAtingido: number;
  percentualUtilizacao: number;
  percentualEficiencia: number;
  custo: number;
  custoPorHora: number;
  valorRateio: number;
  valorTotal: number;
  nivelPerformance: number;
  statusCor: string;
  statusTexto: string;
}

// =======================
// Tipos de métricas
// =======================
interface Metricas {
  utilizacaoMedia: number;
  eficienciaMedia: number;
  metaAtingidaMedia: number;
  recursosExcelentes: number;
  recursosCriticos: number;
  custoMedio?: number;
  horasOciosas: number;
  horasImprodutivas: number;
}

export const DashboardRecursosAPI: React.FC<{
  mes: number;
  ano: number;
  children: (params: {
    dados: DashboardAPIResponse;
    metricas: Metricas;
    dadosProcessados: RecursoProcessado[];
    recursoSelecionado: number | null;
    setRecursoSelecionado: React.Dispatch<React.SetStateAction<number | null>>;
    buscarDados: () => void;
  }) => React.ReactNode;
}> = ({ mes, ano, children }) => {
  const [recursoSelecionado, setRecursoSelecionado] = useState<number | null>(
    null
  );

  const {
    data: dados,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<DashboardAPIResponse>({
    queryKey: ['chamadosDashboard', mes, ano],
    queryFn: async () => {
      const response = await fetch(
        `/api/firebird-SQL/chamados-abertos/dashboard?mes=${mes}&ano=${ano}`
      );
      if (!response.ok)
        throw new Error(
          `Erro na API: ${response.status} ${response.statusText}`
        );
      return (await response.json()) as DashboardAPIResponse;
    },
    enabled: !!mes && !!ano,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const dadosProcessados: RecursoProcessado[] = useMemo(() => {
    if (!dados?.data_recursos) return [];

    return dados.data_recursos.map(recurso => {
      const percentualAtingido =
        recurso.quantidade_horas_necessarias_produzir > 0
          ? Math.min(
              (recurso.quantidade_horas_faturadas_recurso /
                recurso.quantidade_horas_necessarias_produzir) *
                100,
              100
            )
          : 0;

      const percentualUtilizacao =
        recurso.quantidade_horas_disponiveis_recurso > 0
          ? (recurso.quantidade_horas_executadas_recurso /
              recurso.quantidade_horas_disponiveis_recurso) *
            100
          : 0;

      const percentualEficiencia =
        recurso.quantidade_horas_executadas_recurso > 0
          ? (recurso.quantidade_horas_faturadas_recurso /
              recurso.quantidade_horas_executadas_recurso) *
            100
          : 0;

      const custoPorHora =
        recurso.quantidade_horas_faturadas_recurso > 0
          ? recurso.valor_custo_recurso /
            recurso.quantidade_horas_faturadas_recurso
          : 0;

      const status = calcularStatus(percentualAtingido, percentualEficiencia);

      return {
        nome: recurso.nome_recurso.split(' ').slice(0, 2).join(' '),
        nomeCompleto: recurso.nome_recurso,
        codRecurso: recurso.cod_recurso,
        horasDisponiveis: formatarNumero(
          recurso.quantidade_horas_disponiveis_recurso
        ),
        horasFaturadas: formatarNumero(
          recurso.quantidade_horas_faturadas_recurso
        ),
        horasNaoFaturadas: formatarNumero(
          recurso.quantidade_horas_nao_faturadas_recurso
        ),
        horasExecutadas: formatarNumero(
          recurso.quantidade_horas_executadas_recurso
        ),
        horasNecessarias: formatarNumero(
          recurso.quantidade_horas_necessarias_produzir
        ),
        percentualAtingido: formatarNumero(percentualAtingido),
        percentualUtilizacao: formatarNumero(percentualUtilizacao),
        percentualEficiencia: formatarNumero(percentualEficiencia),
        custo: recurso.valor_custo_recurso,
        custoPorHora: formatarNumero(custoPorHora, 2),
        valorRateio: recurso.valor_rateio_despesas_recurso,
        valorTotal: recurso.valor_total_recurso_produzir_pagar,
        ...status,
      };
    });
  }, [dados]);

  const metricas: Metricas | null = useMemo(() => {
    if (!dados || dadosProcessados.length === 0) return null;

    const totais = dadosProcessados.reduce(
      (acc, r) => ({
        horasDisponiveis: acc.horasDisponiveis + r.horasDisponiveis,
        horasExecutadas: acc.horasExecutadas + r.horasExecutadas,
        horasFaturadas: acc.horasFaturadas + r.horasFaturadas,
        horasNecessarias: acc.horasNecessarias + r.horasNecessarias,
      }),
      {
        horasDisponiveis: 0,
        horasExecutadas: 0,
        horasFaturadas: 0,
        horasNecessarias: 0,
      }
    );

    const utilizacaoMedia =
      totais.horasDisponiveis > 0
        ? formatarNumero(
            (totais.horasExecutadas / totais.horasDisponiveis) * 100
          )
        : 0;

    const eficienciaMedia =
      totais.horasExecutadas > 0
        ? formatarNumero((totais.horasFaturadas / totais.horasExecutadas) * 100)
        : 0;

    const metaAtingidaMedia =
      totais.horasNecessarias > 0
        ? formatarNumero(
            (totais.horasFaturadas / totais.horasNecessarias) * 100
          )
        : 0;

    return {
      utilizacaoMedia,
      eficienciaMedia,
      metaAtingidaMedia,
      recursosExcelentes: dadosProcessados.filter(r => r.nivelPerformance >= 4)
        .length,
      recursosCriticos: dadosProcessados.filter(r => r.nivelPerformance <= 2)
        .length,
      custoMedio: dados.media_custos_recurso_mes,
      horasOciosas: formatarNumero(
        totais.horasDisponiveis - totais.horasExecutadas
      ),
      horasImprodutivas: formatarNumero(
        totais.horasExecutadas - totais.horasFaturadas
      ),
    };
  }, [dados, dadosProcessados]);

  const buscarDados = useCallback(() => refetch(), [refetch]);

  if (isLoading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">Carregando...</div>
      </div>
    );

  if (isError || !dados || !metricas)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white/90 p-8 shadow-2xl backdrop-blur-sm">
          <div className="text-center">
            <p className="mb-6 text-gray-600">
              {(error instanceof Error ? error.message : String(error)) ||
                'Não foi possível carregar os dados'}
            </p>
            <button
              onClick={buscarDados}
              className="w-full rounded-xl bg-gradient-to-r from-red-500 to-pink-600 px-6 py-3 font-semibold text-white"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );

  return children({
    dados,
    metricas,
    dadosProcessados,
    recursoSelecionado,
    setRecursoSelecionado,
    buscarDados,
  });
};

export default DashboardRecursosAPI;
