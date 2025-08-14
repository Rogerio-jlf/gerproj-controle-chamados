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
  'quantidade_total_geral_horas_disponiveis',
  'quantidade_total_geral_horas_faturadas',
  'quantidade_total_geral_horas_nao_faturadas',
  'quantidade_total_geral_horas_executadas',
  'quantidade_total_geral_horas_faturadas_necessarias_produzir_pagar',
  'valor_total_geral_almocos',
  'valor_total_geral_deslocamentos',
  'valor_total_geral_salarios',
  'valor_total_geral_receitas',
  'valor_total_geral_custos',
  'valor_total_geral_despesas',
] as const;

// Queries
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
    LEFT JOIN FATFUN f ON f.COD_RECURSO = r.COD_RECURSO AND f.MESANO_FATFUN = ?
    WHERE r.ATIVO_RECURSO = 1 
    GROUP BY r.COD_RECURSO, r.NOME_RECURSO, r.TPCUSTO_RECURSO
    ORDER BY r.COD_RECURSO`,

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
      AND o.HRINI_OS IS NOT NULL AND o.HRFIM_OS IS NOT NULL
      AND o.HRINI_OS <> '' AND o.HRFIM_OS <> ''
    WHERE r.ATIVO_RECURSO = 1
    GROUP BY r.COD_RECURSO
    ORDER BY r.COD_RECURSO`,

  despesas: `
    SELECT SUM(VRDESP_FATDES) AS TOTAL_DESPESAS
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
      SUM(f.VRTOT_FATREC) AS TOTAL_FATURADO,
      SUM(f.QTDHORA_FATREC) AS TOTAL_HORAS_FATURADAS
    FROM CLIENTE c
    LEFT JOIN FATREC f ON f.COD_CLIENTE = c.COD_CLIENTE AND f.MESANO_FATREC = ?
    WHERE c.ATIVO_CLIENTE = 1
    GROUP BY c.COD_CLIENTE, c.NOME_CLIENTE
    ORDER BY c.NOME_CLIENTE`,
};

// Utilitários
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
  const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const proximoMes = mes === 12 ? 1 : mes + 1;
  const proximoAno = mes === 12 ? ano + 1 : ano;
  const dataFim = `${proximoAno}-${String(proximoMes).padStart(2, '0')}-01`;

  return { dataInicio, dataFim };
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

// Função principal para executar queries de um período
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

// Processar dados do mês
function processarDadosMes(
  mes: number,
  ano: number,
  resultCustos: any[],
  resultHoras: any[],
  resultDespesas: any[],
  resultFaturamento: any[]
) {
  // Calcular totais das horas
  let totalGeralHorasExecutadas = 0;
  const horasMap = new Map();

  resultHoras.forEach((item: any) => {
    const horasFaturadas = Number(item.HORAS_FATURADAS) || 0;
    const horasNaoFaturadas = Number(item.HORAS_NAO_FATURADAS) || 0;
    const horasExecutadas = horasFaturadas + horasNaoFaturadas;

    horasMap.set(item.COD_RECURSO, {
      horasFaturadas,
      horasNaoFaturadas,
      horasExecutadas,
    });

    totalGeralHorasExecutadas += horasExecutadas;
  });

  const valorTotalGeralDespesas =
    Number(resultDespesas[0]?.TOTAL_DESPESAS) || 0;
  const valorTotalGeralReceitas = resultFaturamento.reduce(
    (acc: number, item: any) => acc + (Number(item.TOTAL_FATURADO) || 0),
    0
  );

  // Calcular dados dos recursos
  const dadosRecursos = resultCustos.map((item: any) => {
    const dadosHoras = horasMap.get(item.COD_RECURSO) || {
      horasFaturadas: 0,
      horasNaoFaturadas: 0,
      horasExecutadas: 0,
    };

    const percentualPeso =
      totalGeralHorasExecutadas > 0
        ? Number(
            (dadosHoras.horasExecutadas / totalGeralHorasExecutadas).toFixed(4)
          )
        : 0;

    const valorRateio = Number(
      (valorTotalGeralDespesas * percentualPeso).toFixed(2)
    );
    const valorCusto =
      (Number(item.TOTAL_ALMOCO_RECURSO) || 0) +
      (Number(item.TOTAL_DESLOCAMENTO_RECURSO) || 0) +
      (Number(item.TOTAL_SALARIO_RECURSO) || 0);

    return {
      cod_recurso: item.COD_RECURSO,
      quantidade_horas_faturadas_recurso: dadosHoras.horasFaturadas,
      quantidade_horas_nao_faturadas_recurso: dadosHoras.horasNaoFaturadas,
      quantidade_horas_executadas_recurso: dadosHoras.horasExecutadas,
      percentual_peso_horas_executadas_recurso: percentualPeso,
      valor_rateio_despesas_recurso: valorRateio,
      valor_produzir_pagar_recurso: valorCusto + valorRateio,
    };
  });

  return {
    mes,
    ano,
    resultCustos,
    resultHoras,
    resultDespesas,
    resultFaturamento,
    dadosRecursos,
    totalGeralHorasExecutadas,
    totalGeralHorasNecessariasProduzirPagar: 0, // Calculado depois se necessário
    totalGeralHorasDisponiveis: 0, // Calculado depois se necessário
    totalGeralDespesas: valorTotalGeralDespesas,
  };
}

// Buscar dados históricos
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

      const dadosProcessados = processarDadosMes(
        mes,
        ano,
        resultCustos,
        resultHoras,
        resultDespesas,
        resultFaturamento
      );

      resultados.push({
        ...dadosProcessados,
        resultAgendamentos,
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

// Calcular média de campo por recurso
function calcularMediaCampoRecurso(
  codRecurso: number,
  campo: string,
  valorAtual: number,
  ehMesCorrente: boolean,
  dadosHistoricos: DataMes[],
  resultCustosHistorico: any[] = [],
  resultHorasHistorico: any[] = [],
  resultAgendamentosHistorico: any[] = []
): number {
  if (!ehMesCorrente || dadosHistoricos.length === 0) {
    return valorAtual;
  }

  const camposParaMedia = [
    'valor_almoco',
    'valor_deslocamento',
    'valor_salario',
    'valor_custo',
    'quantidade_horas_disponiveis',
    'quantidade_horas_faturadas',
    'quantidade_horas_nao_faturadas',
    'quantidade_horas_executadas',
    'percentual_peso_total_horas_executadas',
    'valor_rateio_total_despesas',
    'valor_produzir_pagar',
    'quantidade_horas_faturadas_necessarias_produzir_pagar',
  ];

  if (!camposParaMedia.includes(campo)) {
    return valorAtual;
  }

  let soma = 0;
  let contador = 0;

  dadosHistoricos.forEach(dadosMes => {
    let valorMes = 0;

    try {
      switch (campo) {
        case 'valor_almoco':
          const recursoAlmoco = dadosMes.resultCustos.find(
            (r: any) => r.COD_RECURSO === codRecurso
          );
          valorMes = Number(recursoAlmoco?.TOTAL_ALMOCO_RECURSO) || 0;
          break;

        case 'valor_deslocamento':
          const recursoDeslocamento = dadosMes.resultCustos.find(
            (r: any) => r.COD_RECURSO === codRecurso
          );
          valorMes =
            Number(recursoDeslocamento?.TOTAL_DESLOCAMENTO_RECURSO) || 0;
          break;

        case 'valor_salario':
          const recursoSalario = dadosMes.resultCustos.find(
            (r: any) => r.COD_RECURSO === codRecurso
          );
          valorMes = Number(recursoSalario?.TOTAL_SALARIO_RECURSO) || 0;
          break;

        case 'valor_custo':
          const recursoCusto = dadosMes.resultCustos.find(
            (r: any) => r.COD_RECURSO === codRecurso
          );
          if (recursoCusto) {
            const almoco = Number(recursoCusto.TOTAL_ALMOCO_RECURSO) || 0;
            const deslocamento =
              Number(recursoCusto.TOTAL_DESLOCAMENTO_RECURSO) || 0;
            const salario = Number(recursoCusto.TOTAL_SALARIO_RECURSO) || 0;
            valorMes = almoco + deslocamento + salario;
          }
          break;

        case 'quantidade_horas_disponiveis':
          const recursoAgendamento = dadosMes.resultAgendamentos?.find(
            (r: any) => r.COD_RECURSO === codRecurso
          );
          if (recursoAgendamento) {
            const horasDia = converterTempoParaDecimal(
              String(recursoAgendamento.HRDIA_RECURSO || '0')
            );
            const totalDias = Number(recursoAgendamento.TOTAL_DIAS_MES) || 0;
            valorMes = horasDia * totalDias;
          }
          break;

        case 'quantidade_horas_faturadas':
          const recursoHorasFat = dadosMes.resultHoras.find(
            (r: any) => r.COD_RECURSO === codRecurso
          );
          valorMes = Number(recursoHorasFat?.HORAS_FATURADAS) || 0;
          break;

        case 'quantidade_horas_nao_faturadas':
          const recursoHorasNaoFat = dadosMes.resultHoras.find(
            (r: any) => r.COD_RECURSO === codRecurso
          );
          valorMes = Number(recursoHorasNaoFat?.HORAS_NAO_FATURADAS) || 0;
          break;

        case 'quantidade_horas_executadas':
          const recursoHorasExec = dadosMes.resultHoras.find(
            (r: any) => r.COD_RECURSO === codRecurso
          );
          if (recursoHorasExec) {
            const faturadas = Number(recursoHorasExec.HORAS_FATURADAS) || 0;
            const naoFaturadas =
              Number(recursoHorasExec.HORAS_NAO_FATURADAS) || 0;
            valorMes = faturadas + naoFaturadas;
          }
          break;

        case 'percentual_peso_total_horas_executadas':
          const recursoPeso = dadosMes.dadosRecursos.find(
            (r: any) => r.cod_recurso === codRecurso
          );
          valorMes =
            Number(recursoPeso?.percentual_peso_horas_executadas_recurso) || 0;
          break;

        case 'valor_rateio_total_despesas':
          const recursoRateio = dadosMes.dadosRecursos.find(
            (r: any) => r.cod_recurso === codRecurso
          );
          valorMes = Number(recursoRateio?.valor_rateio_despesas_recurso) || 0;
          break;

        case 'valor_produzir_pagar':
          const recursoProduzir = dadosMes.dadosRecursos.find(
            (r: any) => r.cod_recurso === codRecurso
          );
          valorMes = Number(recursoProduzir?.valor_produzir_pagar_recurso) || 0;
          break;

        case 'quantidade_horas_faturadas_necessarias_produzir_pagar':
          const recursoNecessarias = dadosMes.dadosRecursos.find(
            (r: any) => r.cod_recurso === codRecurso
          );
          valorMes =
            Number(
              recursoNecessarias?.quantidade_horas_faturadas_necessarias_produzir_pagar
            ) || 0;
          break;

        default:
          return valorAtual;
      }

      if (!isNaN(valorMes)) {
        soma += valorMes;
        contador++;
      }
    } catch (error) {
      console.error(
        `Erro ao calcular média para campo ${campo} do recurso ${codRecurso}:`,
        error
      );
    }
  });

  return contador > 0 ? Number((soma / contador).toFixed(2)) : valorAtual;
}

// Calcular média dos últimos meses
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

  let soma = 0;
  let contador = 0;

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
        case 'valor_total_geral_deslocamentos':
          valorMes = dadosMes.resultCustos.reduce(
            (acc: number, item: any) =>
              acc + (Number(item.TOTAL_DESLOCAMENTO_RECURSO) || 0),
            0
          );
          break;
        case 'valor_total_geral_salarios':
          valorMes = dadosMes.resultCustos.reduce(
            (acc: number, item: any) =>
              acc + (Number(item.TOTAL_SALARIO_RECURSO) || 0),
            0
          );
          break;
        case 'valor_total_geral_receitas':
          valorMes = dadosMes.resultFaturamento.reduce(
            (acc: number, item: any) =>
              acc + (Number(item.TOTAL_FATURADO) || 0),
            0
          );
          break;
        case 'valor_total_geral_custos':
          valorMes = dadosMes.resultCustos.reduce(
            (acc: number, item: any) =>
              acc + (Number(item.TOTAL_CUSTO_RECURSO) || 0),
            0
          );
          break;
        case 'valor_total_geral_despesas':
          valorMes = dadosMes.resultDespesas.reduce(
            (acc: number, item: any) =>
              acc + (Number(item.TOTAL_DESPESAS) || 0),
            0
          );
          break;
        case 'quantidade_total_geral_horas_disponiveis':
          valorMes = dadosMes.resultAgendamentos.reduce(
            (acc: number, item: any) => {
              const hrDia = converterTempoParaDecimal(
                String(item.HRDIA_RECURSO || '0')
              );
              const totalDias = Number(item.TOTAL_DIAS_MES) || 0;
              return acc + hrDia * totalDias;
            },
            0
          );
          break;
        case 'quantidade_total_geral_horas_faturadas':
          valorMes = dadosMes.resultHoras.reduce(
            (acc: number, item: any) =>
              acc + (Number(item.HORAS_FATURADAS) || 0),
            0
          );
          break;
        case 'quantidade_total_geral_horas_nao_faturadas':
          valorMes = dadosMes.resultHoras.reduce(
            (acc: number, item: any) =>
              acc + (Number(item.HORAS_NAO_FATURADAS) || 0),
            0
          );
          break;
        case 'quantidade_total_geral_horas_executadas':
          valorMes = dadosMes.resultHoras.reduce((acc: number, item: any) => {
            const faturadas = Number(item.HORAS_FATURADAS) || 0;
            const naoFaturadas = Number(item.HORAS_NAO_FATURADAS) || 0;
            return acc + faturadas + naoFaturadas;
          }, 0);
          break;
        case 'quantidade_total_geral_horas_faturadas_necessarias_produzir_pagar':
          valorMes = dadosMes.resultHoras.reduce(
            (acc: number, item: any) =>
              acc + (Number(item.HORAS_FATURADAS) || 0),
            0
          );
          break;
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

  return contador > 0 ? Number((soma / contador).toFixed(2)) : valorAtual;
}

// Handler principal
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

    // Buscar dados históricos se necessário
    let dadosHistoricos: DataMes[] = [];
    if (ehMesCorrente) {
      const ultimos3Meses = getUltimos3Meses(mesParam, anoParam);
      dadosHistoricos = await buscarDadosHistoricos(ultimos3Meses);
    }

    // Calcular valores principais
    const receitaTotal = resultFaturamento.reduce(
      (acc: number, item: any) => acc + (Number(item.TOTAL_FATURADO) || 0),
      0
    );

    const totalHorasFaturadasGeral = resultFaturamento.reduce(
      (acc: number, item: any) =>
        acc + (Number(item.TOTAL_HORAS_FATURADAS) || 0),
      0
    );

    const valorHoraVenda =
      totalHorasFaturadasGeral > 0
        ? receitaTotal / totalHorasFaturadasGeral
        : 0;
    const totalDespesas = Number(resultDespesas[0]?.TOTAL_DESPESAS) || 0;

    // Construir maps para otimizar acesso aos dados
    const horasMap = new Map();
    const agendamentosMap = new Map();
    let totalHorasExecutadasGeral = 0;

    // Processar horas
    resultHoras.forEach((item: HorasRecurso) => {
      const horasFaturadas = Number(item.HORAS_FATURADAS) || 0;
      const horasNaoFaturadas = Number(item.HORAS_NAO_FATURADAS) || 0;
      const horasExecutadas = horasFaturadas + horasNaoFaturadas;

      horasMap.set(item.COD_RECURSO, {
        horasFaturadas,
        horasNaoFaturadas,
        horasExecutadas,
      });

      totalHorasExecutadasGeral += horasExecutadas;
    });

    // Processar agendamentos
    resultAgendamentos.forEach((item: any) => {
      const totalDias = Number(item.TOTAL_DIAS_MES) || 0;
      const horasDia = converterTempoParaDecimal(
        String(item.HRDIA_RECURSO || '0')
      );
      const horasDisponiveis = totalDias * horasDia;

      agendamentosMap.set(item.COD_RECURSO, {
        qtdDiasMes: totalDias,
        qtdHorasDia: horasDia,
        qtdHorasDisponiveisMes: horasDisponiveis,
      });
    });

    // Processar dados por recurso
    const dataRecurso: DataRecurso[] = resultCustos.map(
      (item: CustosRecurso) => {
        // Valores de custo
        const valorAlmoco = Number(item.TOTAL_ALMOCO_RECURSO) || 0;
        const valorDeslocamento = Number(item.TOTAL_DESLOCAMENTO_RECURSO) || 0;
        const valorSalario = Number(item.TOTAL_SALARIO_RECURSO) || 0;
        const valorCusto = valorAlmoco + valorDeslocamento + valorSalario;

        // Dados de horas e agendamentos
        const dadosHoras = horasMap.get(item.COD_RECURSO) || {
          horasFaturadas: 0,
          horasNaoFaturadas: 0,
          horasExecutadas: 0,
        };

        const dadosAgendamento = agendamentosMap.get(item.COD_RECURSO) || {
          qtdHorasDisponiveisMes: 0,
        };

        // Cálculos principais
        const pesoRecurso =
          totalHorasExecutadasGeral > 0
            ? Number(
                (
                  dadosHoras.horasExecutadas / totalHorasExecutadasGeral
                ).toFixed(4)
              )
            : 0;

        const despesaRateio = Number((totalDespesas * pesoRecurso).toFixed(2));
        const valorProduzir = Number((valorCusto + despesaRateio).toFixed(2));
        const horasNecessarias =
          valorHoraVenda > 0
            ? Number((valorProduzir / valorHoraVenda).toFixed(2))
            : 0;

        return {
          cod_recurso: item.COD_RECURSO,
          nome: item.NOME_RECURSO?.trim() || '',
          tipo_custo: item.TPCUSTO_RECURSO,
          valor_almoco: Number(valorAlmoco.toFixed(2)),
          valor_deslocamento: Number(valorDeslocamento.toFixed(2)),
          valor_salario: Number(valorSalario.toFixed(2)),
          valor_custo: Number(valorCusto.toFixed(2)),
          quantidade_horas_disponiveis: Number(
            dadosAgendamento.qtdHorasDisponiveisMes.toFixed(2)
          ),
          quantidade_horas_faturadas: Number(
            dadosHoras.horasFaturadas.toFixed(2)
          ),
          quantidade_horas_nao_faturadas: Number(
            dadosHoras.horasNaoFaturadas.toFixed(2)
          ),
          quantidade_horas_executadas: Number(
            dadosHoras.horasExecutadas.toFixed(2)
          ),
          percentual_peso_total_horas_executadas: pesoRecurso,
          valor_rateio_total_despesas: despesaRateio,
          valor_produzir_pagar: valorProduzir,
          quantidade_horas_faturadas_necessarias_produzir_pagar:
            horasNecessarias,
        };
      }
    );

    // Aplicar médias por recurso se for mês corrente
    const dataRecursoComMedias = dataRecurso.map(recurso => {
      if (ehMesCorrente) {
        return {
          ...recurso,
          valor_almoco: calcularMediaCampoRecurso(
            recurso.cod_recurso,
            'valor_almoco',
            recurso.valor_almoco,
            ehMesCorrente,
            dadosHistoricos
          ),
          valor_deslocamento: calcularMediaCampoRecurso(
            recurso.cod_recurso,
            'valor_deslocamento',
            recurso.valor_deslocamento,
            ehMesCorrente,
            dadosHistoricos
          ),
          valor_salario: calcularMediaCampoRecurso(
            recurso.cod_recurso,
            'valor_salario',
            recurso.valor_salario,
            ehMesCorrente,
            dadosHistoricos
          ),
          valor_custo: calcularMediaCampoRecurso(
            recurso.cod_recurso,
            'valor_custo',
            recurso.valor_custo,
            ehMesCorrente,
            dadosHistoricos
          ),
          quantidade_horas_disponiveis: calcularMediaCampoRecurso(
            recurso.cod_recurso,
            'quantidade_horas_disponiveis',
            recurso.quantidade_horas_disponiveis,
            ehMesCorrente,
            dadosHistoricos
          ),
          quantidade_horas_faturadas: calcularMediaCampoRecurso(
            recurso.cod_recurso,
            'quantidade_horas_faturadas',
            recurso.quantidade_horas_faturadas,
            ehMesCorrente,
            dadosHistoricos
          ),
          quantidade_horas_nao_faturadas: calcularMediaCampoRecurso(
            recurso.cod_recurso,
            'quantidade_horas_nao_faturadas',
            recurso.quantidade_horas_nao_faturadas,
            ehMesCorrente,
            dadosHistoricos
          ),
          quantidade_horas_executadas: calcularMediaCampoRecurso(
            recurso.cod_recurso,
            'quantidade_horas_executadas',
            recurso.quantidade_horas_executadas,
            ehMesCorrente,
            dadosHistoricos
          ),
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

    // Recalcular totais com os dados que podem ter médias aplicadas
    const totaisFinais = dataRecursoComMedias.reduce(
      (acc, recurso) => ({
        almocos: acc.almocos + recurso.valor_almoco,
        deslocamentos: acc.deslocamentos + recurso.valor_deslocamento,
        salarios: acc.salarios + recurso.valor_salario,
        custos: acc.custos + recurso.valor_custo,
        horasDisponiveis:
          acc.horasDisponiveis + recurso.quantidade_horas_disponiveis,
        horasFaturadas: acc.horasFaturadas + recurso.quantidade_horas_faturadas,
        horasNaoFaturadas:
          acc.horasNaoFaturadas + recurso.quantidade_horas_nao_faturadas,
        horasExecutadas:
          acc.horasExecutadas + recurso.quantidade_horas_executadas,
        horasNecessarias:
          acc.horasNecessarias +
          recurso.quantidade_horas_faturadas_necessarias_produzir_pagar,
      }),
      {
        almocos: 0,
        deslocamentos: 0,
        salarios: 0,
        custos: 0,
        horasDisponiveis: 0,
        horasFaturadas: 0,
        horasNaoFaturadas: 0,
        horasExecutadas: 0,
        horasNecessarias: 0,
      }
    );

    // Montar resposta final
    const response = {
      data_recursos: dataRecursoComMedias,

      valor_total_geral_almocos: calcularMediaUltimosMeses(
        'valor_total_geral_almocos',
        Number(totaisFinais.almocos.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      valor_total_geral_deslocamentos: calcularMediaUltimosMeses(
        'valor_total_geral_deslocamentos',
        Number(totaisFinais.deslocamentos.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      valor_total_geral_salarios: calcularMediaUltimosMeses(
        'valor_total_geral_salarios',
        Number(totaisFinais.salarios.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      valor_total_geral_receitas: calcularMediaUltimosMeses(
        'valor_total_geral_receitas',
        Number(receitaTotal.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      valor_total_geral_custos: calcularMediaUltimosMeses(
        'valor_total_geral_custos',
        Number(totaisFinais.custos.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      valor_total_geral_despesas: calcularMediaUltimosMeses(
        'valor_total_geral_despesas',
        Number(totalDespesas.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),

      quantidade_total_geral_recursos: dataRecursoComMedias.length,
      quantidade_total_geral_horas_disponiveis: calcularMediaUltimosMeses(
        'quantidade_total_geral_horas_disponiveis',
        Number(totaisFinais.horasDisponiveis.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      quantidade_total_geral_horas_faturadas: calcularMediaUltimosMeses(
        'quantidade_total_geral_horas_faturadas',
        Number(totaisFinais.horasFaturadas.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      quantidade_total_geral_horas_nao_faturadas: calcularMediaUltimosMeses(
        'quantidade_total_geral_horas_nao_faturadas',
        Number(totaisFinais.horasNaoFaturadas.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      quantidade_total_geral_horas_executadas: calcularMediaUltimosMeses(
        'quantidade_total_geral_horas_executadas',
        Number(totaisFinais.horasExecutadas.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      quantidade_total_geral_horas_faturadas_necessarias_produzir_pagar:
        calcularMediaUltimosMeses(
          'quantidade_total_geral_horas_faturadas_necessarias_produzir_pagar',
          Number(totaisFinais.horasNecessarias.toFixed(2)),
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
