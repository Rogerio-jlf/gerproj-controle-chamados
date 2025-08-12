'use client';
import React, { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatarNumero, calcularStatus } from './utils';

// =======================
// Tipos da API
// =======================
interface DataRecurso {
  cod_recurso: number;
  nome: string;
  tipo_custo: number;
  valor_almoco: number;
  valor_deslocamento: number;
  valor_salario: number;
  valor_custo: number;
  quantidade_horas_disponiveis: number;
  quantidade_horas_faturadas: number;
  quantidade_horas_nao_faturadas: number;
  quantidade_horas_executadas: number;
  percentual_peso_total_horas_executadas: number;
  valor_rateio_total_despesas: number;
  valor_produzir_pagar: number;
  quantidade_horas_faturadas_necessarias_produzir_pagar: number;
}

export interface DataAPI {
  data_recursos: DataRecurso[];
  valor_total_geral_media_custos?: number;
  quantidade_total_geral_recursos: number;
}

// =======================
// Tipos de dados processados
// =======================
interface DadosProcessados {
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
  metaGeral: number;
  eficienciaMedia: number;
  utilizacaoMedia: number;
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
    dados: DataAPI;
    dadosProcessados: DadosProcessados[];
    metricas: Metricas;
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
  } = useQuery<DataAPI>({
    queryKey: ['chamadosDashboard', mes, ano],
    queryFn: async () => {
      const response = await fetch(
        `/api/firebird-SQL/chamados-abertos/dashboard?mes=${mes}&ano=${ano}`
      );
      if (!response.ok)
        throw new Error(
          `Erro na API: ${response.status} ${response.statusText}`
        );
      return (await response.json()) as DataAPI;
    },
    enabled: !!mes && !!ano,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const dadosProcessados: DadosProcessados[] = useMemo(() => {
    if (!dados?.data_recursos) return [];

    return dados.data_recursos.map(recurso => {
      const percentualAtingido =
        recurso.quantidade_horas_faturadas_necessarias_produzir_pagar > 0
          ? Math.min(
              (recurso.quantidade_horas_faturadas /
                recurso.quantidade_horas_faturadas_necessarias_produzir_pagar) *
                100,
              100
            )
          : 0;

      const percentualUtilizacao =
        recurso.quantidade_horas_disponiveis > 0
          ? (recurso.quantidade_horas_executadas /
              recurso.quantidade_horas_disponiveis) *
            100
          : 0;

      const percentualEficiencia =
        recurso.quantidade_horas_executadas > 0
          ? (recurso.quantidade_horas_faturadas /
              recurso.quantidade_horas_executadas) *
            100
          : 0;

      const custoPorHora =
        recurso.quantidade_horas_faturadas > 0
          ? recurso.valor_custo / recurso.quantidade_horas_faturadas
          : 0;

      const status = calcularStatus(percentualAtingido, percentualEficiencia);

      return {
        nome: recurso.nome.split(' ').slice(0, 2).join(' '),
        nomeCompleto: recurso.nome,
        codRecurso: recurso.cod_recurso,
        horasDisponiveis: formatarNumero(recurso.quantidade_horas_disponiveis),
        horasFaturadas: formatarNumero(recurso.quantidade_horas_faturadas),
        horasNaoFaturadas: formatarNumero(
          recurso.quantidade_horas_nao_faturadas
        ),
        horasExecutadas: formatarNumero(recurso.quantidade_horas_executadas),
        horasNecessarias: formatarNumero(
          recurso.quantidade_horas_faturadas_necessarias_produzir_pagar
        ),
        percentualAtingido: formatarNumero(percentualAtingido),
        percentualUtilizacao: formatarNumero(percentualUtilizacao),
        percentualEficiencia: formatarNumero(percentualEficiencia),
        custo: recurso.valor_custo,
        custoPorHora: formatarNumero(custoPorHora, 2),
        valorRateio: recurso.valor_rateio_total_despesas,
        valorTotal: recurso.valor_produzir_pagar,
        ...status,
      };
    });
  }, [dados]);

  const metricas: Metricas | null = useMemo(() => {
    if (!dados || dadosProcessados.length === 0) return null;

    const totais = dadosProcessados.reduce(
      (acc, r) => ({
        horasNecessarias: acc.horasNecessarias + r.horasNecessarias,
        horasDisponiveis: acc.horasDisponiveis + r.horasDisponiveis,
        horasExecutadas: acc.horasExecutadas + r.horasExecutadas,
        horasFaturadas: acc.horasFaturadas + r.horasFaturadas,
      }),
      {
        horasNecessarias: 0,
        horasDisponiveis: 0,
        horasExecutadas: 0,
        horasFaturadas: 0,
      }
    );

    const metaGeral =
      totais.horasNecessarias > 0
        ? formatarNumero(
            (totais.horasFaturadas / totais.horasNecessarias) * 100
          )
        : 0;

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

    return {
      metaGeral,
      utilizacaoMedia,
      eficienciaMedia,
      recursosExcelentes: dadosProcessados.filter(r => r.nivelPerformance >= 4)
        .length,
      recursosCriticos: dadosProcessados.filter(r => r.nivelPerformance <= 2)
        .length,
      custoMedio: dados.valor_total_geral_media_custos,
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
