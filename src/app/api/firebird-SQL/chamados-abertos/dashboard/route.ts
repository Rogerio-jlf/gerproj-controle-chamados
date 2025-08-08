import { NextResponse } from 'next/server';
import { firebirdQuery } from '@/lib/firebird/firebird-client';

// Interfaces
interface RecursoSalario {
  COD_RECURSO: number;
  NOME_RECURSO: string;
  TPCUSTO_RECURSO: number;
  TOTAL_SALARIO: number | null;
}

interface RecursoHoras {
  COD_RECURSO: number;
  HORAS_FATURADAS: number;
  HORAS_NAO_FATURADAS: number;
}

interface DadosHoras {
  horasFaturadas: number;
  horasNaoFaturadas: number;
  totalHorasRecurso: number;
}

interface DadosAgendamento {
  totalDiasMes: number;
  hrDiaRecurso: number;
  horasDisponiveis: number;
}

interface RecursoProcessado {
  cod_recurso: number;
  nome_recurso: string;
  tipo_custo_recurso: number;
  valor_custo_recurso: number;
  quantidade_horas_disponiveis_recurso: number;
  quantidade_horas_executadas_recurso: number;
  quantidade_horas_faturadas_recurso: number;
  quantidade_horas_nao_faturadas_recurso: number;
  percentual_peso_recurso_total_horas_executadas: number;
  valor_rateio_despesas_recurso: number;
  valor_total_recurso_produzir_pagar: number;
  quantidade_horas_necessarias_produzir: number;
}

interface DadosHistoricosMes {
  mes: number;
  ano: number;
  resultSalarios: any[];
  resultHoras: any[];
  resultDespesas: any[];
  resultAgendamentos: any[];
  resultFaturamento: any[];
  dadosRecursos: any[];
  totalHorasExecutadasGeralMes: number;
  totalDespesasMes: number;
}

// Constantes
const CAMPOS_PARA_MEDIA = [
  'percentual_peso_recurso_total_horas_executadas',
  'valor_rateio_despesas_recurso',
  'valor_total_recurso_produzir_pagar',
  'quantidade_horas_necessarias_produzir',
  'valor_total_custos_mes',
  'media_custos_recurso_mes',
  'quantidade_total_horas_executadas_recursos_mes',
  'quantidade_total_horas_faturadas_recursos_mes',
  'quantidade_total_horas_nao_faturadas_recursos_mes',
  'valor_total_despesas_mes',
  'valor_total_despesas_rateadas_recursos_mes',
] as const;

// Queries organizadas
const QUERIES = {
  salarios: `
    SELECT 
      r.COD_RECURSO,
      r.NOME_RECURSO,
      r.TPCUSTO_RECURSO,
      SUM(f.VRSAL_FATFUN) AS TOTAL_SALARIO
    FROM RECURSO r
    LEFT JOIN FATFUN f ON f.COD_RECURSO = r.COD_RECURSO 
      AND f.MESANO_FATFUN = ?
    WHERE r.ATIVO_RECURSO = 1 
    GROUP BY r.COD_RECURSO, r.NOME_RECURSO, r.TPCUSTO_RECURSO
    ORDER BY r.COD_RECURSO
  `,

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

  despesas: `
    SELECT SUM(VRDESP_FATDES) AS TOTAL_DESPESAS
    FROM FATDES
    WHERE MESANO_FATDES = ?
  `,

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

// Funções utilitárias
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

function getUltimos6Meses(
  mes: number,
  ano: number
): { mes: number; ano: number }[] {
  const meses: { mes: number; ano: number }[] = [];

  for (let i = 1; i <= 6; i++) {
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

// Função para executar queries de um período
async function executarQueriesPeriodo(mes: number, ano: number) {
  const mesAno = formatarMesAno(mes, ano);
  const { dataInicio, dataFim } = calcularDatasPeriodo(mes, ano);

  return Promise.all([
    firebirdQuery(QUERIES.salarios, [mesAno]),
    firebirdQuery(QUERIES.horas, [dataInicio, dataFim]),
    firebirdQuery(QUERIES.despesas, [mesAno]),
    firebirdQuery(QUERIES.agendamentos, [dataInicio, dataFim]),
    firebirdQuery(QUERIES.faturamento, [mesAno]),
  ]);
}

// Função para processar dados de um mês histórico
function processarDadosMesHistorico(
  mes: number,
  ano: number,
  resultSalarios: any[],
  resultHoras: any[],
  resultDespesas: any[],
  resultFaturamento: any[]
) {
  // Calcular total de horas executadas
  let totalHorasExecutadasGeralMes = 0;
  const horasMap = new Map();

  resultHoras.forEach((item: any) => {
    const horasFaturadas = Number(item.HORAS_FATURADAS) || 0;
    const horasNaoFaturadas = Number(item.HORAS_NAO_FATURADAS) || 0;
    const totalHorasRecurso = horasFaturadas + horasNaoFaturadas;

    horasMap.set(item.COD_RECURSO, {
      horasFaturadas,
      horasNaoFaturadas,
      totalHorasRecurso,
    });

    totalHorasExecutadasGeralMes += totalHorasRecurso;
  });

  const totalDespesasMes = Number(resultDespesas[0]?.TOTAL_DESPESAS) || 0;

  // Calcular valor hora de venda
  const receitaTotalMes = resultFaturamento.reduce((acc: number, item: any) => {
    return acc + (Number(item.TOTAL_FATURADO) || 0);
  }, 0);

  const totalHorasFaturadasGeralMes = resultFaturamento.reduce(
    (acc: number, item: any) => {
      return acc + (Number(item.TOTAL_HORAS_FATURADAS) || 0);
    },
    0
  );

  const valorHoraVendaMesMes =
    totalHorasFaturadasGeralMes > 0
      ? receitaTotalMes / totalHorasFaturadasGeralMes
      : 0;

  // Processar cada recurso
  const dadosRecursos = resultSalarios.map((item: any) => {
    const totalSalario = Number(item.TOTAL_SALARIO) || 0;
    const dadosHoras = horasMap.get(item.COD_RECURSO) || {
      horasFaturadas: 0,
      horasNaoFaturadas: 0,
      totalHorasRecurso: 0,
    };

    const quantidadeHorasExecutadas = dadosHoras.totalHorasRecurso;
    const pesoRecurso =
      totalHorasExecutadasGeralMes > 0
        ? Number(
            (quantidadeHorasExecutadas / totalHorasExecutadasGeralMes).toFixed(
              4
            )
          )
        : 0;

    const despesaRateio = Number((totalDespesasMes * pesoRecurso).toFixed(2));
    const valorTotalProduzir = Number(
      (totalSalario + despesaRateio).toFixed(2)
    );
    const horasNecessarias =
      valorHoraVendaMesMes > 0
        ? Number((valorTotalProduzir / valorHoraVendaMesMes).toFixed(2))
        : 0;

    return {
      cod_recurso: item.COD_RECURSO,
      percentual_peso_recurso_total_horas_executadas: pesoRecurso,
      valor_rateio_despesas_recurso: despesaRateio,
      valor_total_recurso_produzir_pagar: valorTotalProduzir,
      quantidade_horas_necessarias_produzir: horasNecessarias,
      quantidade_horas_executadas_recurso: Number(
        quantidadeHorasExecutadas.toFixed(2)
      ),
      quantidade_horas_faturadas_recurso: Number(
        dadosHoras.horasFaturadas.toFixed(2)
      ),
      quantidade_horas_nao_faturadas_recurso: Number(
        dadosHoras.horasNaoFaturadas.toFixed(2)
      ),
    };
  });

  return {
    mes,
    ano,
    resultSalarios,
    resultHoras,
    resultDespesas,
    resultFaturamento,
    dadosRecursos,
    totalHorasExecutadasGeralMes,
    totalDespesasMes,
  };
}

// Função para buscar dados históricos
async function buscarDadosHistoricos(
  meses: { mes: number; ano: number }[]
): Promise<DadosHistoricosMes[]> {
  const resultados: DadosHistoricosMes[] = [];

  for (const { mes, ano } of meses) {
    try {
      const [
        resultSalarios,
        resultHoras,
        resultDespesas,
        resultAgendamentos,
        resultFaturamento,
      ] = await executarQueriesPeriodo(mes, ano);

      const dadosMesProcessados = processarDadosMesHistorico(
        mes,
        ano,
        resultSalarios,
        resultHoras,
        resultDespesas,
        resultFaturamento
      );

      resultados.push({
        ...dadosMesProcessados,
        resultAgendamentos, // Manter para compatibilidade
      });
    } catch (error) {
      console.error(
        `Erro ao buscar dados históricos para ${mes}/${ano}:`,
        error
      );
      // Continua processando outros meses mesmo se um falhar
    }
  }

  return resultados;
}

// Função para calcular média dos últimos 6 meses
function calcularMediaUltimos6Meses(
  campo: string,
  valorAtual: number,
  ehMesCorrente: boolean,
  dadosHistoricos: DadosHistoricosMes[]
): number {
  if (!ehMesCorrente || dadosHistoricos.length === 0) {
    return valorAtual;
  }

  if (!CAMPOS_PARA_MEDIA.includes(campo as any)) {
    return valorAtual;
  }

  let soma = valorAtual;
  let contador = 1;

  dadosHistoricos.forEach(dadosMes => {
    let valorMes = 0;

    try {
      switch (campo) {
        case 'valor_total_custos_mes':
          valorMes = dadosMes.resultSalarios.reduce(
            (acc: number, item: any) => acc + (Number(item.TOTAL_SALARIO) || 0),
            0
          );
          break;

        case 'media_custos_recurso_mes':
          const totalSalarios = dadosMes.resultSalarios.reduce(
            (acc: number, item: any) => acc + (Number(item.TOTAL_SALARIO) || 0),
            0
          );
          valorMes =
            dadosMes.resultSalarios.length > 0
              ? totalSalarios / dadosMes.resultSalarios.length
              : 0;
          break;

        case 'quantidade_total_horas_executadas_recursos_mes':
          valorMes = dadosMes.resultHoras.reduce((acc: number, item: any) => {
            const horasFaturadas = Number(item.HORAS_FATURADAS) || 0;
            const horasNaoFaturadas = Number(item.HORAS_NAO_FATURADAS) || 0;
            return acc + horasFaturadas + horasNaoFaturadas;
          }, 0);
          break;

        case 'quantidade_total_horas_faturadas_recursos_mes':
          valorMes = dadosMes.resultHoras.reduce(
            (acc: number, item: any) =>
              acc + (Number(item.HORAS_FATURADAS) || 0),
            0
          );
          break;

        case 'quantidade_total_horas_nao_faturadas_recursos_mes':
          valorMes = dadosMes.resultHoras.reduce(
            (acc: number, item: any) =>
              acc + (Number(item.HORAS_NAO_FATURADAS) || 0),
            0
          );
          break;

        case 'valor_total_despesas_mes':
          valorMes = Number(dadosMes.resultDespesas[0]?.TOTAL_DESPESAS) || 0;
          break;

        case 'valor_total_despesas_rateadas_recursos_mes':
          valorMes = calcularTotalDespesasRateadas(dadosMes);
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

// Função auxiliar para calcular despesas rateadas
function calcularTotalDespesasRateadas(dadosMes: DadosHistoricosMes): number {
  const totalDespesasMes =
    Number(dadosMes.resultDespesas[0]?.TOTAL_DESPESAS) || 0;

  const totalHorasExecutadasGeralMes = dadosMes.resultHoras.reduce(
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
      totalHorasExecutadasGeralMes > 0
        ? totalHorasRecurso / totalHorasExecutadasGeralMes
        : 0;

    return acc + totalDespesasMes * pesoRecurso;
  }, 0);
}

// Função para calcular média de campo por recurso
function calcularMediaCampoRecurso(
  codRecurso: number,
  campo: string,
  valorAtual: number,
  ehMesCorrente: boolean,
  dadosHistoricos: DadosHistoricosMes[]
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
    let dadosHistoricos: DadosHistoricosMes[] = [];
    if (ehMesCorrente) {
      const ultimos6Meses = getUltimos6Meses(mesParam, anoParam);
      dadosHistoricos = await buscarDadosHistoricos(ultimos6Meses);
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

    resultHoras.forEach((item: RecursoHoras) => {
      const horasFaturadas = Number(item.HORAS_FATURADAS) || 0;
      const horasNaoFaturadas = Number(item.HORAS_NAO_FATURADAS) || 0;
      const totalHorasRecurso = horasFaturadas + horasNaoFaturadas;

      horasMap.set(item.COD_RECURSO, {
        horasFaturadas,
        horasNaoFaturadas,
        totalHorasRecurso,
      });

      totalHorasExecutadasGeral += totalHorasRecurso;
    });

    const totalDespesas = Number(resultDespesas[0]?.TOTAL_DESPESAS) || 0;

    // Processar dados de agendamentos
    const agendamentosMap = new Map<number, DadosAgendamento>();

    resultAgendamentos.forEach((item: any) => {
      const totalDiasMes = Number(item.TOTAL_DIAS_MES) || 0;
      const hrDiaRecurso = converterTempoParaDecimal(
        String(item.HRDIA_RECURSO || '0')
      );
      const horasDisponiveis = totalDiasMes * hrDiaRecurso;

      agendamentosMap.set(item.COD_RECURSO, {
        totalDiasMes,
        hrDiaRecurso,
        horasDisponiveis,
      });
    });

    // Processar salários com cálculos
    const salarios: RecursoProcessado[] = resultSalarios.map(
      (item: RecursoSalario) => {
        const totalSalario = Number(item.TOTAL_SALARIO) || 0;
        const dadosHoras = horasMap.get(item.COD_RECURSO) || {
          horasFaturadas: 0,
          horasNaoFaturadas: 0,
          totalHorasRecurso: 0,
        };

        const quantidadeHorasExecutadas = dadosHoras.totalHorasRecurso;
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
          (totalSalario + despesaRateio).toFixed(2)
        );
        const horasNecessarias =
          valorHoraVendaMes > 0
            ? Number((valorTotalProduzir / valorHoraVendaMes).toFixed(2))
            : 0;

        const dadosAgendamento = agendamentosMap.get(item.COD_RECURSO) || {
          totalDiasMes: 0,
          hrDiaRecurso: 0,
          horasDisponiveis: 0,
        };

        return {
          cod_recurso: item.COD_RECURSO,
          nome_recurso: item.NOME_RECURSO?.trim() || '',
          tipo_custo_recurso: item.TPCUSTO_RECURSO,
          valor_custo_recurso: Number(totalSalario.toFixed(2)),
          quantidade_horas_disponiveis_recurso: Number(
            dadosAgendamento.horasDisponiveis.toFixed(2)
          ),
          quantidade_horas_executadas_recurso: Number(
            quantidadeHorasExecutadas.toFixed(2)
          ),
          quantidade_horas_faturadas_recurso: Number(
            dadosHoras.horasFaturadas.toFixed(2)
          ),
          quantidade_horas_nao_faturadas_recurso: Number(
            dadosHoras.horasNaoFaturadas.toFixed(2)
          ),
          percentual_peso_recurso_total_horas_executadas: pesoRecurso,
          valor_rateio_despesas_recurso: despesaRateio,
          valor_total_recurso_produzir_pagar: valorTotalProduzir,
          quantidade_horas_necessarias_produzir: horasNecessarias,
        };
      }
    );

    // Calcular totais
    const totais = salarios.reduce(
      (acc, recurso) => ({
        totalGeralSalarios:
          acc.totalGeralSalarios + recurso.valor_custo_recurso,
        totalDespesaRateio:
          acc.totalDespesaRateio + recurso.valor_rateio_despesas_recurso,
        totalHorasDisponiveis:
          acc.totalHorasDisponiveis +
          recurso.quantidade_horas_disponiveis_recurso,
        totalHorasFaturadas:
          acc.totalHorasFaturadas + recurso.quantidade_horas_faturadas_recurso,
        totalHorasNaoFaturadas:
          acc.totalHorasNaoFaturadas +
          recurso.quantidade_horas_nao_faturadas_recurso,
        totalHorasNecessarias:
          acc.totalHorasNecessarias +
          recurso.quantidade_horas_necessarias_produzir,
        totalHorasExecutadas:
          acc.totalHorasExecutadas +
          recurso.quantidade_horas_executadas_recurso,
      }),
      {
        totalGeralSalarios: 0,
        totalDespesaRateio: 0,
        totalHorasDisponiveis: 0,
        totalHorasFaturadas: 0,
        totalHorasNaoFaturadas: 0,
        totalHorasNecessarias: 0,
        totalHorasExecutadas: 0,
      }
    );

    const quantidadeRecursos = salarios.length;
    const mediaCustosRecurso =
      quantidadeRecursos > 0
        ? totais.totalGeralSalarios / quantidadeRecursos
        : 0;

    // Aplicar médias se for mês corrente
    const salariosProcessados = salarios.map(recurso => {
      if (ehMesCorrente) {
        return {
          ...recurso,
          percentual_peso_recurso_total_horas_executadas:
            calcularMediaCampoRecurso(
              recurso.cod_recurso,
              'percentual_peso_recurso_total_horas_executadas',
              recurso.percentual_peso_recurso_total_horas_executadas,
              ehMesCorrente,
              dadosHistoricos
            ),
          valor_rateio_despesas_recurso: calcularMediaCampoRecurso(
            recurso.cod_recurso,
            'valor_rateio_despesas_recurso',
            recurso.valor_rateio_despesas_recurso,
            ehMesCorrente,
            dadosHistoricos
          ),
          valor_total_recurso_produzir_pagar: calcularMediaCampoRecurso(
            recurso.cod_recurso,
            'valor_total_recurso_produzir_pagar',
            recurso.valor_total_recurso_produzir_pagar,
            ehMesCorrente,
            dadosHistoricos
          ),
          quantidade_horas_necessarias_produzir: calcularMediaCampoRecurso(
            recurso.cod_recurso,
            'quantidade_horas_necessarias_produzir',
            recurso.quantidade_horas_necessarias_produzir,
            ehMesCorrente,
            dadosHistoricos
          ),
        };
      }
      return recurso;
    });

    // Preparar resposta final
    const response = {
      data_recursos: salariosProcessados,
      valor_total_custos_mes: calcularMediaUltimos6Meses(
        'valor_total_custos_mes',
        Number(totais.totalGeralSalarios.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      quantidade_total_recursos_mes: quantidadeRecursos,
      media_custos_recurso_mes: calcularMediaUltimos6Meses(
        'media_custos_recurso_mes',
        Number(mediaCustosRecurso.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      quantidade_total_horas_executadas_recursos_mes:
        calcularMediaUltimos6Meses(
          'quantidade_total_horas_executadas_recursos_mes',
          Number(totais.totalHorasExecutadas.toFixed(2)),
          ehMesCorrente,
          dadosHistoricos
        ),
      quantidade_total_horas_faturadas_recursos_mes: calcularMediaUltimos6Meses(
        'quantidade_total_horas_faturadas_recursos_mes',
        Number(totais.totalHorasFaturadas.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      quantidade_total_horas_nao_faturadas_recursos_mes:
        calcularMediaUltimos6Meses(
          'quantidade_total_horas_nao_faturadas_recursos_mes',
          Number(totais.totalHorasNaoFaturadas.toFixed(2)),
          ehMesCorrente,
          dadosHistoricos
        ),
      valor_total_despesas_mes: calcularMediaUltimos6Meses(
        'valor_total_despesas_mes',
        Number(totalDespesas.toFixed(2)),
        ehMesCorrente,
        dadosHistoricos
      ),
      valor_total_despesas_rateadas_recursos_mes: calcularMediaUltimos6Meses(
        'valor_total_despesas_rateadas_recursos_mes',
        Number(totais.totalDespesaRateio.toFixed(2)),
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
