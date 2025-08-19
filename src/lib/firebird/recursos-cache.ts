import { firebirdQuery } from '@/lib/firebird/firebird-client';

// [Manter todas as interfaces existentes...]
interface CustosRecurso {
  COD_RECURSO: number;
  NOME_RECURSO: string;
  TPCUSTO_RECURSO: number;
  TOTAL_ALMOCO_RECURSO: number | null;
  TOTAL_DESLOCAMENTO_RECURSO: number | null;
  TOTAL_SALARIO_RECURSO: number | null;
  TOTAL_CUSTO_RECURSO: number;
}

interface HorasRecurso {
  COD_RECURSO: number;
  HORAS_FATURADAS: number;
  HORAS_NAO_FATURADAS: number;
}

interface AgendamentoRecurso {
  COD_RECURSO: number;
  NOME_RECURSO: string;
  HRDIA_RECURSO: string;
  TOTAL_DIAS_MES: number;
}

interface FaturamentoCliente {
  COD_CLIENTE: number;
  NOME_CLIENTE: string;
  TOTAL_FATURADO: number;
  TOTAL_HORAS_FATURADAS: number;
}

interface DadosProcessados {
  custos: Map<number, CustosRecurso>;
  horas: Map<
    number,
    { faturadas: number; naoFaturadas: number; executadas: number }
  >;
  agendamentos: Map<number, { horasDisponiveis: number }>;
  totalHorasExecutadas: number;
  totalDespesas: number;
  totalReceitas: number;
  totalHorasFaturadas: number;
  valorHoraVenda: number;
}

// Cache global com logs melhorados
let cache: {
  data: any;
  timestamp: Date;
  mes: number;
  ano: number;
} | null = null;

let isLoading = false;
let lastError: Error | null = null;
let contadorAtualizacoes = 0;

// 🔒 PROTEÇÃO CONTRA EXECUÇÕES SIMULTÂNEAS
let executandoAtualizacao = false;
let filaExecucoes: Promise<boolean>[] = [];

// [Manter todas as funções utilitárias existentes...]
function formatarMesAno(mes: number, ano: number): string {
  return `${String(mes).padStart(2, '0')}/${ano}`;
}

function calcularDatasPeriodo(
  mes: number,
  ano: number
): { dataInicio: string; dataFim: string } {
  const dataInicio = new Date(Date.UTC(ano, mes - 1, 1));
  const dataFim = new Date(Date.UTC(ano, mes, 1));
  return {
    dataInicio: dataInicio.toISOString().split('T')[0],
    dataFim: dataFim.toISOString().split('T')[0],
  };
}

function converterTempoParaDecimal(hrDiaStr: string): number {
  if (!hrDiaStr || hrDiaStr === '0') return 0;
  if (hrDiaStr.includes(':')) {
    const [horas, minutos] = hrDiaStr.split(':').map(Number);
    return horas + minutos / 60;
  }
  if (hrDiaStr.length === 4) {
    const horas = Math.floor(Number(hrDiaStr) / 100);
    const minutos = Number(hrDiaStr) % 100;
    return horas + minutos / 60;
  }
  return Number(hrDiaStr);
}

function criarMapsOtimizados(
  resultCustos: CustosRecurso[],
  resultHoras: HorasRecurso[],
  resultAgendamentos: AgendamentoRecurso[]
) {
  const custosMap = new Map<number, CustosRecurso>();
  resultCustos.forEach(item => {
    custosMap.set(item.COD_RECURSO, item);
  });

  const horasMap = new Map<
    number,
    { faturadas: number; naoFaturadas: number; executadas: number }
  >();
  let totalHorasExecutadas = 0;
  let totalHorasFaturadas = 0;

  resultHoras.forEach(item => {
    const faturadas = Number(item.HORAS_FATURADAS) || 0;
    const naoFaturadas = Number(item.HORAS_NAO_FATURADAS) || 0;
    const executadas = faturadas + naoFaturadas;

    horasMap.set(item.COD_RECURSO, { faturadas, naoFaturadas, executadas });
    totalHorasExecutadas += executadas;
    totalHorasFaturadas += faturadas;
  });

  const agendamentosMap = new Map<number, { horasDisponiveis: number }>();
  resultAgendamentos.forEach(item => {
    const totalDias = Number(item.TOTAL_DIAS_MES) || 0;
    const horasDia = converterTempoParaDecimal(
      String(item.HRDIA_RECURSO || '0')
    );
    const horasDisponiveis = totalDias * horasDia;
    agendamentosMap.set(item.COD_RECURSO, { horasDisponiveis });
  });

  return {
    custosMap,
    horasMap,
    agendamentosMap,
    totalHorasExecutadas,
    totalHorasFaturadas,
  };
}

function processarDadosPeriodo(
  resultCustos: CustosRecurso[],
  resultHoras: HorasRecurso[],
  resultDespesas: any[],
  resultAgendamentos: AgendamentoRecurso[],
  resultFaturamento: FaturamentoCliente[]
): DadosProcessados {
  const {
    custosMap,
    horasMap,
    agendamentosMap,
    totalHorasExecutadas,
    totalHorasFaturadas,
  } = criarMapsOtimizados(resultCustos, resultHoras, resultAgendamentos);

  const totalDespesas = Number(resultDespesas[0]?.TOTAL_DESPESAS) || 0;
  const totalReceitas = resultFaturamento.reduce(
    (acc, item) => acc + (Number(item.TOTAL_FATURADO) || 0),
    0
  );

  const valorHoraVenda =
    totalHorasFaturadas > 0 ? totalReceitas / totalHorasFaturadas : 0;

  return {
    custos: custosMap,
    horas: horasMap,
    agendamentos: agendamentosMap,
    totalHorasExecutadas,
    totalDespesas,
    totalReceitas,
    totalHorasFaturadas,
    valorHoraVenda,
  };
}

// [Manter todas as queries existentes...]
const QUERIES = {
  custos: `
    SELECT 
      r.COD_RECURSO,
      r.NOME_RECURSO,
      r.TPCUSTO_RECURSO,
      COALESCE(SUM(f.VRALM_FATFUN), 0) AS TOTAL_ALMOCO_RECURSO,
      COALESCE(SUM(f.VRDESL_FATFUN), 0) AS TOTAL_DESLOCAMENTO_RECURSO,
      COALESCE(SUM(f.VRSAL_FATFUN), 0) AS TOTAL_SALARIO_RECURSO,
      COALESCE(SUM(f.VRALM_FATFUN), 0) + COALESCE(SUM(f.VRDESL_FATFUN), 0) + COALESCE(SUM(f.VRSAL_FATFUN), 0) AS TOTAL_CUSTO_RECURSO
    FROM RECURSO r
    LEFT JOIN FATFUN f ON f.COD_RECURSO = r.COD_RECURSO AND f.MESANO_FATFUN = ?
    WHERE r.ATIVO_RECURSO = 1 
    GROUP BY r.COD_RECURSO, r.NOME_RECURSO, r.TPCUSTO_RECURSO
    ORDER BY r.COD_RECURSO`,

  horas: `
    SELECT 
      r.COD_RECURSO,
      COALESCE(SUM(
        CASE 
          WHEN o.COD_OS IS NOT NULL 
               AND UPPER(o.FATURADO_OS) = 'SIM'
               AND o.DTINI_OS >= ? 
               AND o.DTINI_OS < ?
          THEN 
            (
              COALESCE(CAST(SUBSTRING(TRIM(o.HRFIM_OS) FROM 1 FOR 2) AS INTEGER), 0) * 60
              + COALESCE(CAST(SUBSTRING(TRIM(o.HRFIM_OS) FROM 3 FOR 2) AS INTEGER), 0)
              - COALESCE(CAST(SUBSTRING(TRIM(o.HRINI_OS) FROM 1 FOR 2) AS INTEGER), 0) * 60
              - COALESCE(CAST(SUBSTRING(TRIM(o.HRINI_OS) FROM 3 FOR 2) AS INTEGER), 0)
              + CASE WHEN TRIM(o.HRFIM_OS) < TRIM(o.HRINI_OS) THEN 1440 ELSE 0 END
            ) / 60.0
          ELSE 0 
        END
      ), 0) AS HORAS_FATURADAS,

      COALESCE(SUM(
        CASE 
          WHEN o.COD_OS IS NOT NULL 
               AND UPPER(o.FATURADO_OS) = 'NAO'
               AND o.DTINI_OS >= ? 
               AND o.DTINI_OS < ?
          THEN 
            (
              COALESCE(CAST(SUBSTRING(TRIM(o.HRFIM_OS) FROM 1 FOR 2) AS INTEGER), 0) * 60
              + COALESCE(CAST(SUBSTRING(TRIM(o.HRFIM_OS) FROM 3 FOR 2) AS INTEGER), 0)
              - COALESCE(CAST(SUBSTRING(TRIM(o.HRINI_OS) FROM 1 FOR 2) AS INTEGER), 0) * 60
              - COALESCE(CAST(SUBSTRING(TRIM(o.HRINI_OS) FROM 3 FOR 2) AS INTEGER), 0)
              + CASE WHEN TRIM(o.HRFIM_OS) < TRIM(o.HRINI_OS) THEN 1440 ELSE 0 END
            ) / 60.0
          ELSE 0 
        END
      ), 0) AS HORAS_NAO_FATURADAS

    FROM RECURSO r
    LEFT JOIN OS o ON o.CODREC_OS = r.COD_RECURSO
    WHERE r.ATIVO_RECURSO = 1
    GROUP BY r.COD_RECURSO
    ORDER BY r.COD_RECURSO`,

  despesas: `
    SELECT COALESCE(SUM(VRDESP_FATDES), 0) AS TOTAL_DESPESAS
    FROM FATDES
    WHERE MESANO_FATDES = ?`,

  agendamentos: `
    SELECT
      r.COD_RECURSO,
      r.NOME_RECURSO,
      r.HRDIA_RECURSO,
      COUNT(DISTINCT a.DATA_AGENREC) AS TOTAL_DIAS_MES
    FROM RECURSO r
    JOIN AGENREC a ON a.COD_RECURSO = r.COD_RECURSO
      AND a.DATA_AGENREC >= ? AND a.DATA_AGENREC < ?
    WHERE r.ATIVO_RECURSO = 1        
    GROUP BY r.COD_RECURSO, r.NOME_RECURSO, r.HRDIA_RECURSO
    ORDER BY r.COD_RECURSO`,

  faturamento: `
    SELECT 
      c.COD_CLIENTE,
      c.NOME_CLIENTE,
      COALESCE(SUM(f.VRTOT_FATREC), 0) AS TOTAL_FATURADO,
      COALESCE(SUM(f.QTDHORA_FATREC), 0) AS TOTAL_HORAS_FATURADAS
    FROM CLIENTE c
    LEFT JOIN FATREC f ON f.COD_CLIENTE = c.COD_CLIENTE AND f.MESANO_FATREC = ?
    WHERE c.ATIVO_CLIENTE = 1
    GROUP BY c.COD_CLIENTE, c.NOME_CLIENTE
    ORDER BY c.NOME_CLIENTE`,
};

// 🔒 Função principal para atualizar o cache - COM PROTEÇÃO CONTRA EXECUÇÕES SIMULTÂNEAS
export async function atualizarCacheRecursos(): Promise<boolean> {
  // 🔒 Verificar se já está executando
  if (executandoAtualizacao) {
    console.log('⚠️ Atualização já em andamento - aguardando conclusão...');

    // Aguardar a execução atual terminar
    if (filaExecucoes.length > 0) {
      return await filaExecucoes[filaExecucoes.length - 1];
    }
    return false;
  }

  // 🔒 Marcar como executando
  executandoAtualizacao = true;

  // 🔒 Criar promise para controle da fila
  const promiseExecucao = new Promise<boolean>(async resolve => {
    let resultado = false;

    if (isLoading) {
      console.log('⚠️ Cache já está sendo atualizado internamente...');
      resolve(false);
      return;
    }

    isLoading = true;
    lastError = null;
    contadorAtualizacoes++;

    const inicioTempo = Date.now();
    const execucaoId = `exec-${contadorAtualizacoes}-${Date.now()}`;

    try {
      console.log(
        `🔄 [${contadorAtualizacoes}] Iniciando atualização do cache... (ID: ${execucaoId})`
      );

      const dataAtual = new Date();
      const mes = dataAtual.getMonth() + 1;
      const ano = dataAtual.getFullYear();
      console.log(`📅 Processando dados para ${mes}/${ano}`);

      const mesAno = formatarMesAno(mes, ano);
      const { dataInicio, dataFim } = calcularDatasPeriodo(mes, ano);

      console.log(
        `📊 Executando queries (${dataInicio} até ${dataFim})... (ID: ${execucaoId})`
      );

      const [
        resultCustos,
        resultHoras,
        resultDespesas,
        resultAgendamentos,
        resultFaturamento,
      ] = await Promise.all([
        firebirdQuery(QUERIES.custos, [mesAno]),
        firebirdQuery(QUERIES.horas, [
          dataInicio,
          dataFim,
          dataInicio,
          dataFim,
        ]),
        firebirdQuery(QUERIES.despesas, [mesAno]),
        firebirdQuery(QUERIES.agendamentos, [dataInicio, dataFim]),
        firebirdQuery(QUERIES.faturamento, [mesAno]),
      ]);

      console.log(
        `✅ Queries concluídas em ${Date.now() - inicioTempo}ms (ID: ${execucaoId})`
      );
      console.log(
        `📊 Dados obtidos: ${resultCustos.length} recursos, ${resultHoras.length} horas, ${resultAgendamentos.length} agendamentos`
      );

      const dadosProcessados = processarDadosPeriodo(
        resultCustos,
        resultHoras,
        resultDespesas,
        resultAgendamentos,
        resultFaturamento
      );

      cache = {
        data: dadosProcessados,
        timestamp: new Date(),
        mes,
        ano,
      };

      const tempoTotal = Date.now() - inicioTempo;
      console.log(
        `✅ Cache atualizado com sucesso em ${tempoTotal}ms (ID: ${execucaoId})`
      );
      console.log(
        `💰 Totais: ${dadosProcessados.totalReceitas.toFixed(2)} receitas, ${dadosProcessados.totalDespesas.toFixed(2)} despesas, ${dadosProcessados.totalHorasExecutadas.toFixed(2)} horas`
      );

      resultado = true;
    } catch (error) {
      const tempoTotal = Date.now() - inicioTempo;
      console.error(
        `❌ Erro ao atualizar cache (${tempoTotal}ms, ID: ${execucaoId}):`,
        error
      );
      lastError = error as Error;
      resultado = false;
    } finally {
      isLoading = false;
      // 🔒 Liberar execução
      executandoAtualizacao = false;

      // 🔒 Remover da fila
      const index = filaExecucoes.indexOf(promiseExecucao);
      if (index > -1) {
        filaExecucoes.splice(index, 1);
      }

      resolve(resultado);
    }
  });

  // 🔒 Adicionar à fila
  filaExecucoes.push(promiseExecucao);

  return await promiseExecucao;
}

export function isCacheValido(): boolean {
  if (!cache) {
    return false;
  }

  // Considera válido por 5 minutos
  const cincoMinutos = 5 * 60 * 1000;
  const tempoDecorrido = Date.now() - cache.timestamp.getTime();
  const valido = tempoDecorrido < cincoMinutos;

  return valido;
}

export function getCacheStatus() {
  const status = {
    cache,
    isLoading,
    lastError: lastError ? lastError.message : null,
    isCacheValido: isCacheValido(),
    contadorAtualizacoes,
    tempoDecorridoSegundos: cache
      ? Math.round((Date.now() - cache.timestamp.getTime()) / 1000)
      : null,
    executandoAtualizacao, // 🔒 Adicionar status de execução
    filaExecucoes: filaExecucoes.length, // 🔒 Quantidade na fila
  };

  return status;
}

console.log('📦 Módulo de cache carregado - aguardando inicialização via cron');
