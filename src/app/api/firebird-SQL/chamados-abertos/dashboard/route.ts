import { NextResponse } from 'next/server';
import { firebirdQuery } from '@/lib/firebird/firebird-client';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

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

interface DadosHistoricos {
  mes: number;
  ano: number;
  dadosProcessados: DadosProcessados;
}

type CampoMedia =
  | 'valor_almoco'
  | 'valor_deslocamento'
  | 'valor_salario'
  | 'valor_custo'
  | 'percentual_peso_total_horas_executadas'
  | 'valor_rateio_total_despesas'
  | 'valor_produzir_pagar'
  | 'quantidade_horas_faturadas_necessarias_produzir_pagar';

// ============================================================================
// CONSTANTES
// ============================================================================

const CAMPOS_PARA_MEDIA_TOTAIS = [
  'quantidade_total_geral_horas_faturadas_necessarias_produzir_pagar',
  'valor_total_geral_almocos',
  'valor_total_geral_deslocamentos',
  'valor_total_geral_salarios',
  'valor_total_geral_receitas',
  'valor_total_geral_custos',
  'valor_total_geral_despesas',
] as const;

const CAMPOS_CUSTO_RECURSO: CampoMedia[] = [
  'valor_almoco',
  'valor_deslocamento',
  'valor_salario',
  'valor_custo',
  'percentual_peso_total_horas_executadas',
  'valor_rateio_total_despesas',
  'valor_produzir_pagar',
  'quantidade_horas_faturadas_necessarias_produzir_pagar',
];

// ============================================================================
// QUERIES OTIMIZADAS
// ============================================================================

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

// ============================================================================
// UTILITÁRIOS
// ============================================================================

function validarParametros(mes: number, ano: number): string[] {
  const errors: string[] = [];
  if (!mes || mes < 1 || mes > 12) {
    errors.push("Parâmetro 'mes' deve estar entre 1 e 12");
  }
  if (!ano || ano < 2000 || ano > 3000) {
    errors.push("Parâmetro 'ano' deve estar entre 2000 e 3000");
  }
  return errors;
}

function isMesCorrente(mes: number, ano: number): boolean {
  const dataAtual = new Date();
  return mes === dataAtual.getMonth() + 1 && ano === dataAtual.getFullYear();
}

function getUltimos3Meses(
  mes: number,
  ano: number
): { mes: number; ano: number }[] {
  const meses: { mes: number; ano: number }[] = [];

  for (let i = 1; i <= 3; i++) {
    let mesTmp = mes - i;
    let anoTmp = ano;

    while (mesTmp <= 0) {
      mesTmp += 12;
      anoTmp -= 1;
    }

    meses.push({ mes: mesTmp, ano: anoTmp });
  }

  return meses;
}

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
  // Map de custos
  const custosMap = new Map<number, CustosRecurso>();
  resultCustos.forEach(item => {
    custosMap.set(item.COD_RECURSO, item);
  });

  // Map de horas com cálculos
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

  // Map de agendamentos
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

// ============================================================================
// PROCESSAMENTO DE DADOS
// ============================================================================

async function executarQueriesPeriodo(mes: number, ano: number) {
  const mesAno = formatarMesAno(mes, ano);
  const { dataInicio, dataFim } = calcularDatasPeriodo(mes, ano);

  return Promise.all([
    firebirdQuery(QUERIES.custos, [mesAno]),
    firebirdQuery(QUERIES.horas, [dataInicio, dataFim, dataInicio, dataFim]),
    firebirdQuery(QUERIES.despesas, [mesAno]),
    firebirdQuery(QUERIES.agendamentos, [dataInicio, dataFim]),
    firebirdQuery(QUERIES.faturamento, [mesAno]),
  ]);
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

async function buscarDadosHistoricos(
  meses: { mes: number; ano: number }[]
): Promise<DadosHistoricos[]> {
  const resultados: DadosHistoricos[] = [];

  for (const { mes, ano } of meses) {
    try {
      const [
        resultCustos,
        resultHoras,
        resultDespesas,
        resultAgendamentos,
        resultFaturamento,
      ] = await executarQueriesPeriodo(mes, ano);

      const dadosProcessados = processarDadosPeriodo(
        resultCustos,
        resultHoras,
        resultDespesas,
        resultAgendamentos,
        resultFaturamento
      );

      resultados.push({ mes, ano, dadosProcessados });
    } catch (error) {
      console.error(
        `Erro ao buscar dados históricos para ${mes}/${ano}:`,
        error
      );
    }
  }

  return resultados;
}

// ============================================================================
// CÁLCULO DE MÉDIAS
// ============================================================================

function calcularMediaCampoRecurso(
  codRecurso: number,
  campo: CampoMedia,
  valorAtual: number,
  ehMesCorrente: boolean,
  dadosHistoricos: DadosHistoricos[]
): number {
  if (
    !ehMesCorrente ||
    dadosHistoricos.length === 0 ||
    !CAMPOS_CUSTO_RECURSO.includes(campo)
  ) {
    return valorAtual;
  }

  let soma = 0;
  let contador = 0;

  for (const { dadosProcessados } of dadosHistoricos) {
    try {
      let valorMes = 0;
      const custosRecurso = dadosProcessados.custos.get(codRecurso);
      const horasRecurso = dadosProcessados.horas.get(codRecurso);

      if (!custosRecurso) continue;

      switch (campo) {
        case 'valor_almoco':
          valorMes = Number(custosRecurso.TOTAL_ALMOCO_RECURSO) || 0;
          break;
        case 'valor_deslocamento':
          valorMes = Number(custosRecurso.TOTAL_DESLOCAMENTO_RECURSO) || 0;
          break;
        case 'valor_salario':
          valorMes = Number(custosRecurso.TOTAL_SALARIO_RECURSO) || 0;
          break;
        case 'valor_custo':
          valorMes =
            (Number(custosRecurso.TOTAL_ALMOCO_RECURSO) || 0) +
            (Number(custosRecurso.TOTAL_DESLOCAMENTO_RECURSO) || 0) +
            (Number(custosRecurso.TOTAL_SALARIO_RECURSO) || 0);
          break;
        case 'percentual_peso_total_horas_executadas':
          if (horasRecurso && dadosProcessados.totalHorasExecutadas > 0) {
            valorMes =
              horasRecurso.executadas / dadosProcessados.totalHorasExecutadas;
          }
          break;
        case 'valor_rateio_total_despesas':
          if (horasRecurso && dadosProcessados.totalHorasExecutadas > 0) {
            const peso =
              horasRecurso.executadas / dadosProcessados.totalHorasExecutadas;
            valorMes = dadosProcessados.totalDespesas * peso;
          }
          break;
        case 'valor_produzir_pagar':
          const custoTotal =
            (Number(custosRecurso.TOTAL_ALMOCO_RECURSO) || 0) +
            (Number(custosRecurso.TOTAL_DESLOCAMENTO_RECURSO) || 0) +
            (Number(custosRecurso.TOTAL_SALARIO_RECURSO) || 0);
          if (horasRecurso && dadosProcessados.totalHorasExecutadas > 0) {
            const peso =
              horasRecurso.executadas / dadosProcessados.totalHorasExecutadas;
            const rateio = dadosProcessados.totalDespesas * peso;
            valorMes = custoTotal + rateio;
          }
          break;
        case 'quantidade_horas_faturadas_necessarias_produzir_pagar':
          const custoTotalNec =
            (Number(custosRecurso.TOTAL_ALMOCO_RECURSO) || 0) +
            (Number(custosRecurso.TOTAL_DESLOCAMENTO_RECURSO) || 0) +
            (Number(custosRecurso.TOTAL_SALARIO_RECURSO) || 0);
          if (
            horasRecurso &&
            dadosProcessados.totalHorasExecutadas > 0 &&
            dadosProcessados.valorHoraVenda > 0
          ) {
            const peso =
              horasRecurso.executadas / dadosProcessados.totalHorasExecutadas;
            const rateio = dadosProcessados.totalDespesas * peso;
            const produzir = custoTotalNec + rateio;
            valorMes = produzir / dadosProcessados.valorHoraVenda;
          }
          break;
      }

      if (!isNaN(valorMes) && valorMes !== 0) {
        soma += valorMes;
        contador++;
      }
    } catch (error) {
      console.error(
        `Erro ao calcular média para campo ${campo} do recurso ${codRecurso}:`,
        error
      );
    }
  }

  return contador > 0 ? Number((soma / contador).toFixed(2)) : valorAtual;
}

function calcularMediaTotais(
  campo: string,
  valorAtual: number,
  ehMesCorrente: boolean,
  dadosHistoricos: DadosHistoricos[]
): number {
  if (
    !ehMesCorrente ||
    dadosHistoricos.length === 0 ||
    !CAMPOS_PARA_MEDIA_TOTAIS.includes(campo as any)
  ) {
    return valorAtual;
  }

  let soma = 0;
  let contador = 0;

  for (const { dadosProcessados } of dadosHistoricos) {
    try {
      let valorMes = 0;

      switch (campo) {
        case 'valor_total_geral_almocos':
          valorMes = Array.from(dadosProcessados.custos.values()).reduce(
            (acc, item) => acc + (Number(item.TOTAL_ALMOCO_RECURSO) || 0),
            0
          );
          break;
        case 'valor_total_geral_deslocamentos':
          valorMes = Array.from(dadosProcessados.custos.values()).reduce(
            (acc, item) => acc + (Number(item.TOTAL_DESLOCAMENTO_RECURSO) || 0),
            0
          );
          break;
        case 'valor_total_geral_salarios':
          valorMes = Array.from(dadosProcessados.custos.values()).reduce(
            (acc, item) => acc + (Number(item.TOTAL_SALARIO_RECURSO) || 0),
            0
          );
          break;
        case 'valor_total_geral_receitas':
          valorMes = dadosProcessados.totalReceitas;
          break;
        case 'valor_total_geral_custos':
          valorMes = Array.from(dadosProcessados.custos.values()).reduce(
            (acc, item) => acc + (Number(item.TOTAL_CUSTO_RECURSO) || 0),
            0
          );
          break;
        case 'valor_total_geral_despesas':
          valorMes = dadosProcessados.totalDespesas;
          break;
        case 'quantidade_total_geral_horas_faturadas_necessarias_produzir_pagar':
          if (dadosProcessados.valorHoraVenda > 0) {
            const totalCustoRateio = Array.from(
              dadosProcessados.custos.values()
            ).reduce((acc, item) => {
              const custoRecurso =
                (Number(item.TOTAL_ALMOCO_RECURSO) || 0) +
                (Number(item.TOTAL_DESLOCAMENTO_RECURSO) || 0) +
                (Number(item.TOTAL_SALARIO_RECURSO) || 0);

              const horasRecurso = dadosProcessados.horas.get(item.COD_RECURSO);
              if (horasRecurso && dadosProcessados.totalHorasExecutadas > 0) {
                const peso =
                  horasRecurso.executadas /
                  dadosProcessados.totalHorasExecutadas;
                const rateio = dadosProcessados.totalDespesas * peso;
                return acc + custoRecurso + rateio;
              }
              return acc + custoRecurso;
            }, 0);

            valorMes = totalCustoRateio / dadosProcessados.valorHoraVenda;
          }
          break;
      }

      if (!isNaN(valorMes) && valorMes !== 0) {
        soma += valorMes;
        contador++;
      }
    } catch (error) {
      console.error(`Erro ao calcular média para campo ${campo}:`, error);
    }
  }

  return contador > 0 ? Number((soma / contador).toFixed(2)) : valorAtual;
}

// ============================================================================
// MONTAGEM DA RESPOSTA
// ============================================================================

function montarDataRecursos(
  dadosProcessados: DadosProcessados,
  ehMesCorrente: boolean,
  dadosHistoricos: DadosHistoricos[]
): DataRecurso[] {
  const recursos: DataRecurso[] = [];

  dadosProcessados.custos.forEach((custoItem, codRecurso) => {
    const dadosHoras = dadosProcessados.horas.get(codRecurso) || {
      faturadas: 0,
      naoFaturadas: 0,
      executadas: 0,
    };

    const dadosAgendamento = dadosProcessados.agendamentos.get(codRecurso) || {
      horasDisponiveis: 0,
    };

    // Cálculos base
    const valorAlmoco = Number(custoItem.TOTAL_ALMOCO_RECURSO) || 0;
    const valorDeslocamento = Number(custoItem.TOTAL_DESLOCAMENTO_RECURSO) || 0;
    const valorSalario = Number(custoItem.TOTAL_SALARIO_RECURSO) || 0;
    const valorCusto = valorAlmoco + valorDeslocamento + valorSalario;

    const pesoRecurso =
      dadosProcessados.totalHorasExecutadas > 0
        ? dadosHoras.executadas / dadosProcessados.totalHorasExecutadas
        : 0;

    const despesaRateio = dadosProcessados.totalDespesas * pesoRecurso;
    const valorProduzir = valorCusto + despesaRateio;
    const horasNecessarias =
      dadosProcessados.valorHoraVenda > 0
        ? valorProduzir / dadosProcessados.valorHoraVenda
        : 0;

    // Criar objeto base com formatação de 2 casas decimais
    const recurso: DataRecurso = {
      cod_recurso: codRecurso,
      nome: custoItem.NOME_RECURSO?.trim() || '',
      tipo_custo: custoItem.TPCUSTO_RECURSO,
      valor_almoco: Number(valorAlmoco.toFixed(2)),
      valor_deslocamento: Number(valorDeslocamento.toFixed(2)),
      valor_salario: Number(valorSalario.toFixed(2)),
      valor_custo: Number(valorCusto.toFixed(2)),

      // Campos de horas - sempre valores originais com 2 casas decimais
      quantidade_horas_disponiveis: Number(
        dadosAgendamento.horasDisponiveis.toFixed(2)
      ),
      quantidade_horas_faturadas: Number(dadosHoras.faturadas.toFixed(2)),
      quantidade_horas_nao_faturadas: Number(
        dadosHoras.naoFaturadas.toFixed(2)
      ),
      quantidade_horas_executadas: Number(dadosHoras.executadas.toFixed(2)),

      // Campos calculados com 2 casas decimais
      percentual_peso_total_horas_executadas: Number(pesoRecurso.toFixed(4)),
      valor_rateio_total_despesas: Number(despesaRateio.toFixed(2)),
      valor_produzir_pagar: Number(valorProduzir.toFixed(2)),
      quantidade_horas_faturadas_necessarias_produzir_pagar: Number(
        horasNecessarias.toFixed(2)
      ),
    };

    // Aplicar médias apenas se for mês corrente (já retornam com 2 casas decimais)
    if (ehMesCorrente) {
      CAMPOS_CUSTO_RECURSO.forEach(campo => {
        (recurso as any)[campo] = calcularMediaCampoRecurso(
          codRecurso,
          campo,
          (recurso as any)[campo],
          ehMesCorrente,
          dadosHistoricos
        );
      });
    }

    recursos.push(recurso);
  });

  return recursos.sort((a, b) => a.cod_recurso - b.cod_recurso);
}

// ============================================================================
// HANDLER PRINCIPAL
// ============================================================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mesParam = Number(searchParams.get('mes'));
    const anoParam = Number(searchParams.get('ano'));

    // Validação
    const validationErrors = validarParametros(mesParam, anoParam);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    const ehMesCorrente = isMesCorrente(mesParam, anoParam);

    // Executar queries principais
    const [
      resultCustos,
      resultHoras,
      resultDespesas,
      resultAgendamentos,
      resultFaturamento,
    ] = await executarQueriesPeriodo(mesParam, anoParam);

    // Processar dados do período atual
    const dadosProcessados = processarDadosPeriodo(
      resultCustos,
      resultHoras,
      resultDespesas,
      resultAgendamentos,
      resultFaturamento
    );

    // Buscar dados históricos se necessário
    let dadosHistoricos: DadosHistoricos[] = [];
    if (ehMesCorrente) {
      const ultimos3Meses = getUltimos3Meses(mesParam, anoParam);
      dadosHistoricos = await buscarDadosHistoricos(ultimos3Meses);
    }

    // Montar dados dos recursos
    const dataRecursos = montarDataRecursos(
      dadosProcessados,
      ehMesCorrente,
      dadosHistoricos
    );

    // Calcular totais sem médias (valores originais para horas)
    const totaisOriginais = dataRecursos.reduce(
      (acc, recurso) => ({
        horasDisponiveis:
          acc.horasDisponiveis + recurso.quantidade_horas_disponiveis,
        horasFaturadas: acc.horasFaturadas + recurso.quantidade_horas_faturadas,
        horasNaoFaturadas:
          acc.horasNaoFaturadas + recurso.quantidade_horas_nao_faturadas,
        horasExecutadas:
          acc.horasExecutadas + recurso.quantidade_horas_executadas,
      }),
      {
        horasDisponiveis: 0,
        horasFaturadas: 0,
        horasNaoFaturadas: 0,
        horasExecutadas: 0,
      }
    );

    // Calcular totais com médias aplicadas para campos de custo
    const totaisComMedias = dataRecursos.reduce(
      (acc, recurso) => ({
        almocos: acc.almocos + recurso.valor_almoco,
        deslocamentos: acc.deslocamentos + recurso.valor_deslocamento,
        salarios: acc.salarios + recurso.valor_salario,
        custos: acc.custos + recurso.valor_custo,
        horasNecessarias:
          acc.horasNecessarias +
          recurso.quantidade_horas_faturadas_necessarias_produzir_pagar,
      }),
      {
        almocos: 0,
        deslocamentos: 0,
        salarios: 0,
        custos: 0,
        horasNecessarias: 0,
      }
    );

    // Montar resposta final
    const response = {
      data_recursos: dataRecursos,

      // Totais com médias aplicadas onde apropriado
      valor_total_geral_almocos: calcularMediaTotais(
        'valor_total_geral_almocos',
        Number(totaisComMedias.almocos.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      valor_total_geral_deslocamentos: calcularMediaTotais(
        'valor_total_geral_deslocamentos',
        Number(totaisComMedias.deslocamentos.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      valor_total_geral_salarios: calcularMediaTotais(
        'valor_total_geral_salarios',
        Number(totaisComMedias.salarios.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      valor_total_geral_receitas: calcularMediaTotais(
        'valor_total_geral_receitas',
        Number(dadosProcessados.totalReceitas.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      valor_total_geral_custos: calcularMediaTotais(
        'valor_total_geral_custos',
        Number(totaisComMedias.custos.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      valor_total_geral_despesas: calcularMediaTotais(
        'valor_total_geral_despesas',
        Number(dadosProcessados.totalDespesas.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),

      // Informações gerais
      quantidade_total_geral_recursos: dataRecursos.length,

      // Totais de horas - sempre valores originais (sem médias)
      quantidade_total_geral_horas_disponiveis: Number(
        totaisOriginais.horasDisponiveis.toFixed(2)
      ),
      quantidade_total_geral_horas_faturadas: Number(
        totaisOriginais.horasFaturadas.toFixed(2)
      ),
      quantidade_total_geral_horas_nao_faturadas: Number(
        totaisOriginais.horasNaoFaturadas.toFixed(2)
      ),
      quantidade_total_geral_horas_executadas: Number(
        totaisOriginais.horasExecutadas.toFixed(2)
      ),

      // Horas necessárias com média aplicada
      quantidade_total_geral_horas_faturadas_necessarias_produzir_pagar:
        calcularMediaTotais(
          'quantidade_total_geral_horas_faturadas_necessarias_produzir_pagar',
          Number(totaisComMedias.horasNecessarias.toFixed(2)),
          ehMesCorrente,
          dadosHistoricos
        ),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro ao buscar dados dos recursos:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
