import { NextResponse } from 'next/server';
import { firebirdQuery } from '@/lib/firebird/firebird-client';

// Interfaces
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
  HORAS_EXECUTADAS: number;
  HORAS_FATURADAS: number;
  HORAS_NAO_FATURADAS: number;
}

interface DadosHoras {
  qtdHorasExecutadas: number;
  qtdHorasFaturadas: number;
  qtdHorasNaoFaturadas: number;
}

interface DadosAgendamento {
  qtdDiasMes: number;
  qtdHorasDia: number;
  qtdHorasDisponiveisMes: number;
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

interface DataMes {
  mes: number;
  ano: number;
  resultCustos: any[];
  resultHoras: any[];
  resultDespesas: any[];
  resultAgendamentos: any[];
  resultFaturamento: any[];
  dadosRecursos: any[];
  totalGeralHorasExecutadas: number;
  totalGeralHorasNecessariasProduzirPagar: number;
  totalGeralHorasDisponiveis: number;
  totalGeralDespesas: number;
}

// Constantes
const CAMPOS_PARA_MEDIA = [
  'percentual_peso_recurso_total_horas_executadas',
  'valor_rateio_despesas_recurso',
  'valor_total_recurso_produzir_pagar',
  'quantidade_horas_necessarias_produzir',
  // custos
  'valor_total_geral_almocos',
  'valor_total_geral_deslocamentos',
  'valor_total_geral_salarios',
  'valor_total_geral_media_custos',
  // horas por
  'quantidade_total_geral_horas_disponiveis',
  'quantidade_total_geral_horas_faturadas',
  'quantidade_total_geral_horas_nao_faturadas',
  'quantidade_total_geral_horas_executadas',
  'quantidade_total_geral_horas_faturadas_necessarias_produzir_pagar',
  // financeiro
  'valor_total_geral_receitas',
  'valor_total_geral_custos',
  'valor_total_geral_despesas',
  'valor_total_geral_despesas_rateadas',
] as const;

// Queries organizadas
const QUERIES = {
  custos: `
    SELECT 
      r.COD_RECURSO,
      r.NOME_RECURSO,
      r.TPCUSTO_RECURSO,
      SUM(f.VRALM_FATFUN) AS TOTAL_ALMOCO_RECURSO,
      SUM(f.VRDESL_FATFUN) AS TOTAL_DESLOCAMENTO_RECURSO,
      SUM(f.VRSAL_FATFUN) AS TOTAL_SALARIO_RECURSO,
      COALESCE(SUM(f.VRALM_FATFUN),0) + COALESCE(SUM(f.VRDESL_FATFUN),0) + COALESCE(SUM(f.VRSAL_FATFUN),0) AS TOTAL_CUSTO_RECURSO
    FROM RECURSO r
    LEFT JOIN FATFUN f ON f.COD_RECURSO = r.COD_RECURSO 
      AND f.MESANO_FATFUN = ?
    WHERE r.ATIVO_RECURSO = 1 
    GROUP BY r.COD_RECURSO, r.NOME_RECURSO, r.TPCUSTO_RECURSO
    ORDER BY r.COD_RECURSO
  `,
  // ----------

  horas: `
    SELECT 
      r.COD_RECURSO,
      COALESCE(SUM(
        CASE WHEN o.FATURADO_OS = 'SIM' THEN 
          (CAST(SUBSTRING(o.HRFIM_OS FROM 1 FOR 2) AS INTEGER) + 
           CAST(SUBSTRING(o.HRFIM_OS FROM 3 FOR 2) AS INTEGER) / 60.0) - 
          (CAST(SUBSTRING(o.HRINI_OS FROM 1 FOR 2) AS INTEGER) + 
           CAST(SUBSTRING(o.HRINI_OS FROM 3 FOR 2) AS INTEGER) / 60.0)
        ELSE 0 END
      ), 0) AS HORAS_FATURADAS,
      
      COALESCE(SUM(
        CASE WHEN o.FATURADO_OS = 'NAO' THEN 
          (CAST(SUBSTRING(o.HRFIM_OS FROM 1 FOR 2) AS INTEGER) + 
           CAST(SUBSTRING(o.HRFIM_OS FROM 3 FOR 2) AS INTEGER) / 60.0) - 
          (CAST(SUBSTRING(o.HRINI_OS FROM 1 FOR 2) AS INTEGER) + 
           CAST(SUBSTRING(o.HRINI_OS FROM 3 FOR 2) AS INTEGER) / 60.0)
        ELSE 0 END
      ), 0) AS HORAS_NAO_FATURADAS

    FROM RECURSO r
    LEFT JOIN OS o ON o.CODREC_OS = r.COD_RECURSO
      AND o.DTINI_OS >= ? AND o.DTINI_OS < ?
      AND o.HRINI_OS IS NOT NULL 
      AND o.HRFIM_OS IS NOT NULL
      AND o.HRINI_OS <> ''
      AND o.HRFIM_OS <> ''
    WHERE r.ATIVO_RECURSO = 1
    GROUP BY r.COD_RECURSO
    ORDER BY r.COD_RECURSO
  `,
  // ----------

  despesas: `
    SELECT SUM(VRDESP_FATDES) AS TOTAL_DESPESAS
    FROM FATDES
    WHERE MESANO_FATDES = ?
  `,
  // ----------

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
    ORDER BY r.COD_RECURSO
  `,
  // ----------

  faturamento: `
    SELECT 
      c.COD_CLIENTE,
      c.NOME_CLIENTE,
      SUM(f.VRTOT_FATREC) AS TOTAL_FATURADO,
      SUM(f.QTDHORA_FATREC) AS TOTAL_HORAS_FATURADAS
    FROM CLIENTE c
    LEFT JOIN FATREC f ON f.COD_CLIENTE = c.COD_CLIENTE 
      AND f.MESANO_FATREC = ?
    WHERE c.ATIVO_CLIENTE = 1
    GROUP BY c.COD_CLIENTE, c.NOME_CLIENTE
    ORDER BY c.NOME_CLIENTE
  `,
};
// ------------------------------------------------------------------------------------

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

// ------------------------------------------------------------------------------------

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
  const mesAtual = dataAtual.getMonth() + 1;
  const anoAtual = dataAtual.getFullYear();

  return mes === mesAtual && ano === anoAtual;
}

// ------------------------------------------------------------------------------------

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

// ------------------------------------------------------------------------------------

function formatarMesAno(mes: number, ano: number): string {
  return `${String(mes).padStart(2, '0')}/${ano}`;
}

// ------------------------------------------------------------------------------------

function calcularDatasPeriodo(
  mes: number,
  ano: number
): { dataInicio: string; dataFim: string } {
  const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const proximoMes = mes === 12 ? 1 : mes + 1;
  const proximoAno = mes === 12 ? ano + 1 : ano;
  const dataFim = `${proximoAno}-${String(proximoMes).padStart(2, '0')}-01`;

  return { dataInicio, dataFim };
}

// ------------------------------------------------------------------------------------

// Função para executar queries de um período
async function executarQueriesPeriodo(mes: number, ano: number) {
  const mesAno = formatarMesAno(mes, ano);
  const { dataInicio, dataFim } = calcularDatasPeriodo(mes, ano);

  return Promise.all([
    firebirdQuery(QUERIES.custos, [mesAno]),
    firebirdQuery(QUERIES.horas, [dataInicio, dataFim]),
    firebirdQuery(QUERIES.despesas, [mesAno]),
    firebirdQuery(QUERIES.agendamentos, [dataInicio, dataFim]),
    firebirdQuery(QUERIES.faturamento, [mesAno]),
  ]);
}
// ------------------------------------------------------------------------------------

// ========== PROCESSA OS DADOS DO MÊS ==========
function processarDadosMes(
  mes: number,
  ano: number,
  resultCustos: any[],
  resultHoras: any[],
  resultDespesas: any[],
  resultFaturamento: any[]
) {
  // ========== PRIMEIRO: CALCULAR TOTAIS GERAIS ==========
  let totalGeralHorasExecutadas = 0;
  let totalGeralHorasFaturadasNecessariasProduzirPagar = 0;
  let totalGeralHorasDisponiveis = 0;
  const horasMap = new Map();

  resultHoras.forEach((item: any) => {
    const qtdTotalHorasFaturadasRecurso = Number(item.HORAS_FATURADAS) || 0;
    const qtdTotalHorasNaoFaturadasRecurso =
      Number(item.HORAS_NAO_FATURADAS) || 0;
    const qtdTotalHorasExecutadasRecurso =
      qtdTotalHorasFaturadasRecurso + qtdTotalHorasNaoFaturadasRecurso;
    const qtdTotalHorasFaturadasNecessariasProduzirPagarRecurso = Number(
      item.quantidade_horas_faturadas_necessarias_produzir_pagar
    );
    const qtdTotalHorasDisponiveisRecurso = Number(
      item.quantidade_horas_disponiveis
    );

    horasMap.set(item.COD_RECURSO, {
      qtdHorasFaturadasRecurso: qtdTotalHorasFaturadasRecurso,
      qtdHorasNaoFaturadasRecurso: qtdTotalHorasNaoFaturadasRecurso,
      qtdHorasExecutadasRecurso: qtdTotalHorasExecutadasRecurso,
      qtdHorasFaturadasNecessariasProduzirPagarRecurso:
        qtdTotalHorasFaturadasNecessariasProduzirPagarRecurso,
      qtdHorasDisponiveisRecurso: qtdTotalHorasDisponiveisRecurso,
    });

    totalGeralHorasExecutadas += qtdTotalHorasExecutadasRecurso;
    totalGeralHorasFaturadasNecessariasProduzirPagar +=
      qtdTotalHorasFaturadasNecessariasProduzirPagarRecurso;
    totalGeralHorasDisponiveis += qtdTotalHorasDisponiveisRecurso;
  });

  const valorTotalGeralDespesas =
    Number(resultDespesas[0]?.TOTAL_DESPESAS) || 0;

  const valorTotalGeralReceitas = resultFaturamento.reduce(
    (acc: number, item: any) => {
      return acc + (Number(item.TOTAL_FATURADO) || 0);
    },
    0
  );

  const qtdTotalGeralHorasFaturadas = resultFaturamento.reduce(
    (acc: number, item: any) => {
      return acc + (Number(item.TOTAL_HORAS_FATURADAS) || 0);
    },
    0
  );

  const valorTotalGeralHoraVenda =
    qtdTotalGeralHorasFaturadas > 0
      ? valorTotalGeralReceitas / qtdTotalGeralHorasFaturadas
      : 0;

  // ========== SEGUNDO: CALCULAR TOTAIS POR RECURSO ==========
  const dadosRecursos = resultCustos.map((item: any) => {
    const valortotalAlmocoRecurso = Number(item.TOTAL_ALMOCO_RECURSO) || 0;

    const valortotalDeslocamentoRecurso =
      Number(item.TOTAL_DESLOCAMENTO_RECURSO) || 0;

    const valortotalSalarioRecurso = Number(item.TOTAL_SALARIO_RECURSO) || 0;

    const valorTotalCustoRecurso =
      valortotalAlmocoRecurso +
      valortotalDeslocamentoRecurso +
      valortotalSalarioRecurso;

    const qtdTotalHorasRecurso = horasMap.get(item.COD_RECURSO) || {
      qtdHorasFaturadasRecurso: 0,
      qtdHorasNaoFaturadasRecurso: 0,
      qtdHorasExecutadasRecurso: 0,
      qtdHorasFaturadasNecessariasProduzirPagarRecurso: 0,
    };

    const qtdTotalHorasExecutadasRecurso =
      qtdTotalHorasRecurso.qtdHorasExecutadasRecurso;

    qtdTotalHorasRecurso.qtdHorasFaturadasNecessariasProduzirPagarRecurso;

    const percentualPesoHorasExecutadasRecurso =
      totalGeralHorasExecutadas > 0
        ? Number(
            (
              qtdTotalHorasExecutadasRecurso / totalGeralHorasExecutadas
            ).toFixed(4)
          )
        : 0;

    const valorTotalRateioDespesasRecurso = Number(
      (valorTotalGeralDespesas * percentualPesoHorasExecutadasRecurso).toFixed(
        2
      )
    );

    const valorProduzirPagarRecurso = Number(
      (valorTotalCustoRecurso + valorTotalRateioDespesasRecurso).toFixed(2)
    );

    const qtdHorasFaturadasNecessariasProduzirPagarRecurso =
      valorTotalGeralHoraVenda > 0
        ? Number(
            (valorProduzirPagarRecurso / valorTotalGeralHoraVenda).toFixed(2)
          )
        : 0;

    return {
      cod_recurso: item.COD_RECURSO,
      quantidade_horas_faturadas_recurso: Number(
        qtdTotalHorasRecurso.qtdHorasFaturadasRecurso.toFixed(2)
      ),
      quantidade_horas_nao_faturadas_recurso: Number(
        qtdTotalHorasRecurso.qtdHorasNaoFaturadasRecurso.toFixed(2)
      ),
      quantidade_horas_executadas_recurso: Number(
        qtdTotalHorasExecutadasRecurso.toFixed(2)
      ),
      percentual_peso_horas_executadas_recurso:
        percentualPesoHorasExecutadasRecurso,
      valor_rateio_despesas_recurso: valorTotalRateioDespesasRecurso,
      valor_produzir_pagar_recurso: valorProduzirPagarRecurso,
      quantidade_horas_faturadas_necessarias_produzir_pagar: Number(
        qtdHorasFaturadasNecessariasProduzirPagarRecurso.toFixed(2)
      ),
    };
  });

  // ----------

  return {
    mes,
    ano,
    resultCustos,
    resultHoras,
    resultDespesas,
    resultFaturamento,
    dadosRecursos,
    totalGeralHorasExecutadas,
    totalGeralHorasFaturadasNecessariasProduzirPagar,
    totalGeralHorasDisponiveis,
    valorTotalGeralReceitas,
    valorTotalGeralDespesas,
  };
}
// ------------------------------------------------------------------------

// Função para buscar dados históricos
async function buscarDadosHistoricos(
  meses: { mes: number; ano: number }[]
): Promise<DataMes[]> {
  const resultados: DataMes[] = [];

  for (const { mes, ano } of meses) {
    try {
      const [
        resultCustos,
        resultHoras,
        resultDespesas,
        resultAgendamentos,
        resultFaturamento,
      ] = await executarQueriesPeriodo(mes, ano);

      const dadosMesProcessados = processarDadosMes(
        mes,
        ano,
        resultCustos,
        resultHoras,
        resultDespesas,
        resultFaturamento
      );

      resultados.push({
        ...dadosMesProcessados,
        resultCustos: resultCustos,
        resultAgendamentos,
        resultFaturamento,
        totalGeralDespesas: dadosMesProcessados.valorTotalGeralDespesas,
        totalGeralHorasNecessariasProduzirPagar:
          dadosMesProcessados.totalGeralHorasFaturadasNecessariasProduzirPagar,
      });
    } catch (error) {
      console.error(
        `Erro ao buscar dados históricos para ${mes}/${ano}:`,
        error
      );
    }
  }

  return resultados;
}

// ------------------------------------------------------------------------------------

// Função para calcular média dos últimos 6 meses
function calcularMediaUltimosMeses(
  campo: string,
  valorAtual: number,
  ehMesCorrente: boolean,
  dadosHistoricos: DataMes[]
): number {
  if (!ehMesCorrente || dadosHistoricos.length === 0) {
    return valorAtual;
  }

  if (!CAMPOS_PARA_MEDIA.includes(campo as any)) {
    return valorAtual;
  }

  let soma = 0; // 👈 MUDANÇA: Não inicializar com valorAtual
  let contador = 0; // 👈 MUDANÇA: Não contar o mês atual

  dadosHistoricos.forEach(dadosMes => {
    let valorMes = 0;

    try {
      switch (campo) {
        case 'valor_total_geral_almocos':
          valorMes = dadosMes.resultCustos.reduce(
            (acc: number, item: any) =>
              acc + (Number(item.TOTAL_ALMOCO_RECURSO) || 0),
            0
          );
          break;
        // ==========

        case 'valor_total_geral_deslocamentos':
          valorMes = dadosMes.resultCustos.reduce(
            (acc: number, item: any) =>
              acc + (Number(item.TOTAL_DESLOCAMENTO_RECURSO) || 0),
            0
          );
          break;
        // ==========

        case 'valor_total_geral_salarios':
          valorMes = dadosMes.resultCustos.reduce(
            (acc: number, item: any) =>
              acc + (Number(item.TOTAL_SALARIO_RECURSO) || 0),
            0
          );
          break;
        // ==========

        case 'valor_total_geral_receitas':
          valorMes = dadosMes.resultFaturamento.reduce(
            (acc: number, item: any) =>
              acc + (Number(item.TOTAL_FATURADO) || 0),
            0
          );
          break;
        // ==========

        case 'valor_total_geral_custos':
          valorMes = dadosMes.resultCustos.reduce(
            (acc: number, item: any) =>
              acc + (Number(item.TOTAL_CUSTO_RECURSO) || 0),
            0
          );
          break;
        // ==========

        case 'valor_total_geral_despesas':
          valorMes = dadosMes.resultDespesas.reduce(
            (acc: number, item: any) =>
              acc + (Number(item.TOTAL_DESPESAS) || 0),
            0
          );
          break;
        // ==========

        // case 'valor_total_geral_media_custos':
        //   const totalCustosMes = dadosMes.resultCustos.reduce(
        //     (acc: number, item: any) =>
        //       acc + (Number(item.TOTAL_CUSTO_RECURSO) || 0),
        //     0
        //   );
        //   const quantidadeRecursosMes = dadosMes.resultCustos.length;
        //   valorMes =
        //     quantidadeRecursosMes > 0
        //       ? totalCustosMes / quantidadeRecursosMes
        //       : 0;
        //   break;
        // ==========

        // case 'valor_total_geral_despesas_rateadas':
        //   valorMes = calcularTotalDespesasRateadas(dadosMes);
        //   break;
        // ==========

        case 'quantidade_total_geral_horas_disponiveis':
          valorMes = dadosMes.resultAgendamentos.reduce(
            (acc: number, item: any) => {
              const hrDiaConvertida = converterTempoParaDecimal(
                String(item.HRDIA_RECURSO || '0')
              );
              const totalDias = Number(item.TOTAL_DIAS_MES) || 0;
              return acc + hrDiaConvertida * totalDias;
            },
            0
          );
          break;
        // ==========

        case 'quantidade_total_geral_horas_faturadas':
          valorMes = dadosMes.resultHoras.reduce(
            (acc: number, item: any) =>
              acc + (Number(item.HORAS_FATURADAS) || 0),
            0
          );
          break;
        // ----------

        case 'quantidade_total_geral_horas_nao_faturadas':
          valorMes = dadosMes.resultHoras.reduce(
            (acc: number, item: any) =>
              acc + (Number(item.HORAS_NAO_FATURADAS) || 0),
            0
          );
          break;
        // ----------

        case 'quantidade_total_geral_horas_executadas':
          valorMes = dadosMes.resultHoras.reduce((acc: number, item: any) => {
            const horasFaturadas = Number(item.HORAS_FATURADAS) || 0;
            const horasNaoFaturadas = Number(item.HORAS_NAO_FATURADAS) || 0;
            return acc + horasFaturadas + horasNaoFaturadas;
          }, 0);
          break;
        // ----------

        case 'quantidade_total_geral_horas_faturadas_necessarias_produzir_pagar':
          valorMes = dadosMes.resultHoras.reduce((acc: number, item: any) => {
            return acc + (Number(item.HORAS_FATURADAS) || 0);
          }, 0);
          break;
        // ----------

        default:
          return valorAtual;
      }

      if (!isNaN(valorMes) && valorMes !== 0) {
        soma += valorMes;
        contador++;
      }
    } catch (error) {
      console.error(`Erro ao calcular média para campo ${campo}:`, error);
    }
  });

  // 👈 RESULTADO: Apenas (julho + junho + maio) / 3
  return contador > 0 ? Number((soma / contador).toFixed(2)) : valorAtual;
}

// ------------------------------------------------------------------------------------

// Função auxiliar para calcular despesas rateadas
function calcularTotalDespesasRateadas(dadosMes: DataMes): number {
  const totalGeralDespesas =
    Number(dadosMes.resultDespesas[0]?.TOTAL_DESPESAS) || 0;

  const totalGeralHorasExecutadas = dadosMes.resultHoras.reduce(
    (total: number, recurso: any) => {
      const horasFat = Number(recurso.HORAS_FATURADAS) || 0;
      const horasNaoFat = Number(recurso.HORAS_NAO_FATURADAS) || 0;
      return total + horasFat + horasNaoFat;
    },
    0
  );

  return dadosMes.resultHoras.reduce((acc: number, item: any) => {
    const horasFaturadas = Number(item.HORAS_FATURADAS) || 0;
    const horasNaoFaturadas = Number(item.HORAS_NAO_FATURADAS) || 0;
    const totalHorasRecurso = horasFaturadas + horasNaoFaturadas;

    const pesoRecurso =
      totalGeralHorasExecutadas > 0
        ? totalHorasRecurso / totalGeralHorasExecutadas
        : 0;

    return acc + totalGeralDespesas * pesoRecurso;
  }, 0);
}

// ------------------------------------------------------------------------------------

// Função para calcular média de campo por recurso
function calcularMediaCampoRecurso(
  codRecurso: number,
  campo: string,
  valorAtual: number,
  ehMesCorrente: boolean,
  dadosHistoricos: DataMes[]
): number {
  if (!ehMesCorrente || dadosHistoricos.length === 0) {
    return valorAtual;
  }

  const camposParaMedia = [
    'percentual_peso_recurso_total_horas_executadas',
    'valor_rateio_despesas_recurso',
    'valor_total_recurso_produzir_pagar',
    'quantidade_horas_necessarias_produzir',
  ];

  if (!camposParaMedia.includes(campo)) {
    return valorAtual;
  }

  let soma = valorAtual;
  let contador = 1;

  dadosHistoricos.forEach(dadosMes => {
    const recursoHistorico = dadosMes.dadosRecursos.find(
      (r: any) => r.cod_recurso === codRecurso
    );

    if (recursoHistorico && recursoHistorico[campo] !== undefined) {
      soma += Number(recursoHistorico[campo]);
      contador++;
    }
  });

  return contador > 0 ? Number((soma / contador).toFixed(2)) : valorAtual;
}

// ------------------------------------------------------------------------------------

// Handler principal
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mesParam = Number(searchParams.get('mes'));
    const anoParam = Number(searchParams.get('ano'));

    // Validação de parâmetros
    const validationErrors = validarParametros(mesParam, anoParam);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    const ehMesCorrente = isMesCorrente(mesParam, anoParam);

    // Executar queries para o período solicitado
    const [
      resultSalarios,
      resultHoras,
      resultDespesas,
      resultAgendamentos,
      resultFaturamento,
    ] = await executarQueriesPeriodo(mesParam, anoParam);

    // Buscar dados históricos se for mês corrente
    let dadosHistoricos: DataMes[] = [];
    if (ehMesCorrente) {
      const ultimos3Meses = getUltimos3Meses(mesParam, anoParam);
      dadosHistoricos = await buscarDadosHistoricos(ultimos3Meses);
    }

    // Calcular receita e valor hora de venda
    const receitaTotal = resultFaturamento.reduce(
      (acc: number, item: any) => acc + (Number(item.TOTAL_FATURADO) || 0),
      0
    );

    const totalHorasFaturadasGeral = resultFaturamento.reduce(
      (acc: number, item: any) =>
        acc + (Number(item.TOTAL_HORAS_FATURADAS) || 0),
      0
    );

    const valorHoraVendaMes =
      totalHorasFaturadasGeral > 0
        ? receitaTotal / totalHorasFaturadasGeral
        : 0;

    // Processar dados de horas
    const horasMap = new Map<number, DadosHoras>();
    let totalHorasExecutadasGeral = 0;

    resultHoras.forEach((item: HorasRecurso) => {
      const horasFaturadas = Number(item.HORAS_FATURADAS) || 0;
      const horasNaoFaturadas = Number(item.HORAS_NAO_FATURADAS) || 0;
      const totalHorasRecurso = horasFaturadas + horasNaoFaturadas;

      horasMap.set(item.COD_RECURSO, {
        qtdHorasExecutadas: totalHorasRecurso,
        qtdHorasNaoFaturadas: horasNaoFaturadas,
        qtdHorasFaturadas: horasFaturadas,
      });

      totalHorasExecutadasGeral += totalHorasRecurso;
    });

    const totalDespesas = Number(resultDespesas[0]?.TOTAL_DESPESAS) || 0;

    const valorTotalGeralReceitas = Number(
      resultFaturamento.reduce(
        (acc: number, item: any) => acc + (Number(item.TOTAL_FATURADO) || 0),
        0
      )
    );

    // Processar dados de agendamentos
    const agendamentosMap = new Map<number, DadosAgendamento>();

    resultAgendamentos.forEach((item: any) => {
      const totalDiasMes = Number(item.TOTAL_DIAS_MES) || 0;
      const totalHorasDia = converterTempoParaDecimal(
        String(item.HRDIA_RECURSO || '0')
      );
      const totalGeralHorasDisponiveis = totalDiasMes * totalHorasDia;

      agendamentosMap.set(item.COD_RECURSO, {
        qtdDiasMes: totalDiasMes,
        qtdHorasDia: totalHorasDia,
        qtdHorasDisponiveisMes: totalGeralHorasDisponiveis,
      });
    });
    // --------------------------------------------------------------------------------

    // cálculos por recurso
    const dataRecurso: DataRecurso[] = resultSalarios.map(
      (item: CustosRecurso) => {
        const valorAlmocoRecurso = Number(item.TOTAL_ALMOCO_RECURSO) || 0;
        const valorDeslocamentoRecurso =
          Number(item.TOTAL_DESLOCAMENTO_RECURSO) || 0;
        const valorSalarioRecurso = Number(item.TOTAL_SALARIO_RECURSO) || 0;
        const valorCustoRecurso =
          valorAlmocoRecurso + valorDeslocamentoRecurso + valorSalarioRecurso;
        const dadosAgendamento = agendamentosMap.get(item.COD_RECURSO) || {
          qtdDiasMes: 0,
          qtdHorasDia: 0,
          qtdHorasDisponiveisMes: 0,
        };
        const dadosHoras = horasMap.get(item.COD_RECURSO) || {
          qtdHorasExecutadas: 0,
          qtdHorasFaturadas: 0,
          qtdHorasNaoFaturadas: 0,
        };
        const quantidadeHorasExecutadas = dadosHoras.qtdHorasExecutadas;
        const pesoRecurso =
          totalHorasExecutadasGeral > 0
            ? Number(
                (quantidadeHorasExecutadas / totalHorasExecutadasGeral).toFixed(
                  4
                )
              )
            : 0;
        const despesaRateio = Number((totalDespesas * pesoRecurso).toFixed(2));

        const valorTotalProduzir = Number(
          (valorSalarioRecurso + despesaRateio).toFixed(2)
        );
        const horasNecessarias =
          valorHoraVendaMes > 0
            ? Number((valorTotalProduzir / valorHoraVendaMes).toFixed(2))
            : 0;

        return {
          cod_recurso: item.COD_RECURSO,
          nome: item.NOME_RECURSO?.trim() || '',
          tipo_custo: item.TPCUSTO_RECURSO,
          valor_almoco: Number(valorAlmocoRecurso.toFixed(2)),
          valor_deslocamento: Number(valorDeslocamentoRecurso.toFixed(2)),
          valor_salario: Number(valorSalarioRecurso.toFixed(2)),
          valor_custo: Number(valorCustoRecurso.toFixed(2)),
          quantidade_horas_disponiveis: Number(
            dadosAgendamento.qtdHorasDisponiveisMes.toFixed(2)
          ),
          quantidade_horas_faturadas: Number(
            dadosHoras.qtdHorasFaturadas.toFixed(2)
          ),
          quantidade_horas_nao_faturadas: Number(
            dadosHoras.qtdHorasNaoFaturadas.toFixed(2)
          ),
          quantidade_horas_executadas: Number(
            quantidadeHorasExecutadas.toFixed(2)
          ),
          percentual_peso_total_horas_executadas: pesoRecurso,
          valor_rateio_total_despesas: despesaRateio,
          valor_produzir_pagar: valorTotalProduzir,
          quantidade_horas_faturadas_necessarias_produzir_pagar:
            horasNecessarias,
        };
      }
    );
    // --------------------------------------------------------------------------------

    // Calcular totais
    const totais = dataRecurso.reduce(
      (acc, recurso) => ({
        totalGeralAlmocos: acc.totalGeralAlmocos + recurso.valor_almoco,
        // ----------

        totalGeralDeslocamentos:
          acc.totalGeralDeslocamentos + recurso.valor_deslocamento,
        // ----------

        totalGeralSalarios: acc.totalGeralSalarios + recurso.valor_salario,
        // ----------

        totalGeralCustos: acc.totalGeralCustos + recurso.valor_custo,
        // ----------

        totalGeralRateioDespesas:
          acc.totalGeralRateioDespesas + recurso.valor_rateio_total_despesas,
        // ----------

        totalGeralHorasDisponiveis:
          acc.totalGeralHorasDisponiveis + recurso.quantidade_horas_disponiveis,
        // ----------

        totalGeralHorasFaturadas:
          acc.totalGeralHorasFaturadas + recurso.quantidade_horas_faturadas,
        // ----------

        totalGeralHorasNaoFaturadas:
          acc.totalGeralHorasNaoFaturadas +
          recurso.quantidade_horas_nao_faturadas,
        // ----------

        totalGeralHorasExecutadas:
          acc.totalGeralHorasExecutadas + recurso.quantidade_horas_executadas,
        // ----------

        totalGeralHorasNecessarias:
          acc.totalGeralHorasNecessarias +
          recurso.quantidade_horas_faturadas_necessarias_produzir_pagar,
        // ----------

        totalGeralHorasFaturadasNecessariasProduzirPagar:
          acc.totalGeralHorasFaturadasNecessariasProduzirPagar +
          recurso.quantidade_horas_faturadas_necessarias_produzir_pagar,
      }),
      {
        totalGeralAlmocos: 0,
        totalGeralDeslocamentos: 0,
        totalGeralSalarios: 0,
        totalGeralCustos: 0,
        totalGeralRateioDespesas: 0,
        totalGeralHorasDisponiveis: 0,
        totalGeralHorasFaturadas: 0,
        totalGeralHorasNaoFaturadas: 0,
        totalGeralHorasExecutadas: 0,
        totalGeralHorasFaturadasNecessariasProduzirPagar: 0,
        totalGeralHorasNecessarias: 0,
      }
    );
    // --------------------------------------------------------------------------------

    const qtdtotalGeralRecursos = dataRecurso.length;
    // ----------

    const mediaCustosRecurso =
      qtdtotalGeralRecursos > 0
        ? totais.totalGeralCustos / qtdtotalGeralRecursos
        : 0;
    // ----------
    // --------------------------------------------------------------------------------

    // Aplicar médias se for mês corrente
    const dataCustos = dataRecurso.map(recurso => {
      if (ehMesCorrente) {
        return {
          ...recurso,
          percentual_peso_total_horas_executadas: calcularMediaCampoRecurso(
            recurso.cod_recurso,
            'percentual_peso_total_horas_executadas',
            recurso.percentual_peso_total_horas_executadas,
            ehMesCorrente,
            dadosHistoricos
          ),
          valor_rateio_total_despesas: calcularMediaCampoRecurso(
            recurso.cod_recurso,
            'valor_rateio_total_despesas',
            recurso.valor_rateio_total_despesas,
            ehMesCorrente,
            dadosHistoricos
          ),
          valor_produzir_pagar: calcularMediaCampoRecurso(
            recurso.cod_recurso,
            'valor_produzir_pagar',
            recurso.valor_produzir_pagar,
            ehMesCorrente,
            dadosHistoricos
          ),
          quantidade_horas_faturadas_necessarias_produzir_pagar:
            calcularMediaCampoRecurso(
              recurso.cod_recurso,
              'quantidade_horas_faturadas_necessarias_produzir_pagar',
              recurso.quantidade_horas_faturadas_necessarias_produzir_pagar,
              ehMesCorrente,
              dadosHistoricos
            ),
        };
      }
      return recurso;
    });
    // --------------------------------------------------------------------------------

    // resposta final - totalizadores gerais
    const response = {
      data_recursos: dataCustos,
      // ==========

      valor_total_geral_almocos: calcularMediaUltimosMeses(
        'valor_total_geral_almocos',
        Number(totais.totalGeralAlmocos.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      // ==========

      valor_total_geral_deslocamentos: calcularMediaUltimosMeses(
        'valor_total_geral_deslocamentos',
        Number(totais.totalGeralDeslocamentos.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      // ==========

      valor_total_geral_salarios: calcularMediaUltimosMeses(
        'valor_total_geral_salarios',
        Number(totais.totalGeralSalarios.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      // ==========

      valor_total_geral_receitas: calcularMediaUltimosMeses(
        'valor_total_geral_receitas',
        Number(valorTotalGeralReceitas.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      // ----------

      valor_total_geral_custos: calcularMediaUltimosMeses(
        'valor_total_geral_custos',
        Number(totais.totalGeralCustos.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      // ==========

      valor_total_geral_despesas: calcularMediaUltimosMeses(
        'valor_total_geral_despesas',
        Number(totalDespesas.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      // ==========

      // valor_total_geral_media_custos: calcularMediaUltimosMeses(
      //   'valor_total_geral_media_custos',
      //   Number(mediaCustosRecurso.toFixed(2)),
      //   ehMesCorrente,
      //   dadosHistoricos
      // ),
      // ==========

      // valor_total_geral_despesas_rateadas: calcularMediaUltimosMeses(
      //   'valor_total_geral_despesas_rateadas',
      //   Number(totais.totalGeralRateioDespesas.toFixed(2)),
      //   ehMesCorrente,
      //   dadosHistoricos
      // ),

      quantidade_total_geral_recursos: qtdtotalGeralRecursos,
      // ==========

      // ===== horas =====
      quantidade_total_geral_horas_disponiveis: calcularMediaUltimosMeses(
        'quantidade_total_geral_horas_disponiveis',
        Number(totais.totalGeralHorasDisponiveis.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      // ==========

      quantidade_total_geral_horas_faturadas: calcularMediaUltimosMeses(
        'quantidade_total_geral_horas_faturadas',
        Number(totais.totalGeralHorasFaturadas.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      // ==========

      quantidade_total_geral_horas_nao_faturadas: calcularMediaUltimosMeses(
        'quantidade_total_geral_horas_nao_faturadas',
        Number(totais.totalGeralHorasNaoFaturadas.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      // ==========

      quantidade_total_geral_horas_executadas: calcularMediaUltimosMeses(
        'quantidade_total_geral_horas_executadas',
        Number(totais.totalGeralHorasExecutadas.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      // ==========

      quantidade_total_geral_horas_faturadas_necessarias_produzir_pagar:
        calcularMediaUltimosMeses(
          'quantidade_total_geral_horas_faturadas_necessarias_produzir_pagar',
          Number(
            totais.totalGeralHorasFaturadasNecessariasProduzirPagar.toFixed(2)
          ),
          ehMesCorrente,
          dadosHistoricos
        ),
      // ----------
    };
    // --------------------------------------------------------------------------------

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
