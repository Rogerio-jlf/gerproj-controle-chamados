import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../../lib/firebird/firebird-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const mesParam = Number(searchParams.get('mes'));
    const anoParam = Number(searchParams.get('ano'));
    const isAdmin = searchParams.get('isAdmin') === 'true';
    const codRecurso = searchParams.get('codRecurso')?.trim();

    if (!mesParam || mesParam < 1 || mesParam > 12) {
      return NextResponse.json(
        { error: "Parâmetro 'mes' inválido" },
        { status: 400 }
      );
    }

    if (!anoParam || anoParam < 2000 || anoParam > 3000) {
      return NextResponse.json(
        { error: "Parâmetro 'ano' inválido" },
        { status: 400 }
      );
    }

    if (!isAdmin && !codRecurso) {
      return NextResponse.json(
        {
          error: "Parâmetro 'codRecurso' é obrigatório para usuários não admin",
        },
        { status: 400 }
      );
    }

    const dataInicio = new Date(anoParam, mesParam - 1, 1);
    const dataFim = new Date(anoParam, mesParam, 1);

    const whereConditions: string[] = [
      'r.ATIVO_RECURSO = 1',
      'a.STATUS_AGENREC = 0',
      'a.DATA_AGENREC >= ? AND a.DATA_AGENREC < ?',
    ];
    const params: any[] = [dataInicio, dataFim];

    if (!isAdmin && codRecurso) {
      whereConditions.push('r.COD_RECURSO = ?');
      params.push(Number(codRecurso));
    }

    // Query principal para agendamentos
    const sqlAgendamentos = `
      SELECT
        r.COD_RECURSO,
        r.NOME_RECURSO,
        r.HRDIA_RECURSO,
        COUNT(DISTINCT a.DATA_AGENREC) AS TOTAL_DIAS_MES
      FROM RECURSO r
      JOIN AGENREC a ON a.COD_RECURSO = r.COD_RECURSO
      ${whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      GROUP BY r.COD_RECURSO, r.NOME_RECURSO, r.HRDIA_RECURSO
      ORDER BY r.COD_RECURSO
    `;

    // Query para horas faturadas da OS
    const whereConditionsOSFaturadas: string[] = [
      'r.ATIVO_RECURSO = 1',
      'os.FATURADO_OS = ?',
      'os.DTINI_OS >= ? AND os.DTINI_OS < ?',
    ];
    const paramsOSFaturadas: any[] = ['SIM', dataInicio, dataFim];

    if (!isAdmin && codRecurso) {
      whereConditionsOSFaturadas.push('r.COD_RECURSO = ?');
      paramsOSFaturadas.push(Number(codRecurso));
    }

    const sqlHorasFaturadas = `
      SELECT
        r.COD_RECURSO,
        COALESCE(os.HRINI_OS, '0000') as HRINI_OS,
        COALESCE(os.HRFIM_OS, '0000') as HRFIM_OS
      FROM RECURSO r
      JOIN OS os ON os.CODREC_OS = r.COD_RECURSO
      ${whereConditionsOSFaturadas.length ? 'WHERE ' + whereConditionsOSFaturadas.join(' AND ') : ''}
        AND os.HRINI_OS IS NOT NULL 
        AND os.HRFIM_OS IS NOT NULL
        AND TRIM(os.HRINI_OS) <> ''
        AND TRIM(os.HRFIM_OS) <> ''
    `;

    // Query para horas não faturadas da OS
    const whereConditionsOSNaoFaturadas: string[] = [
      'r.ATIVO_RECURSO = 1',
      'os.FATURADO_OS = ?',
      'os.DTINI_OS >= ? AND os.DTINI_OS < ?',
    ];
    const paramsOSNaoFaturadas: any[] = ['NAO', dataInicio, dataFim];

    if (!isAdmin && codRecurso) {
      whereConditionsOSNaoFaturadas.push('r.COD_RECURSO = ?');
      paramsOSNaoFaturadas.push(Number(codRecurso));
    }

    const sqlHorasNaoFaturadas = `
      SELECT
        r.COD_RECURSO,
        COALESCE(os.HRINI_OS, '0000') as HRINI_OS,
        COALESCE(os.HRFIM_OS, '0000') as HRFIM_OS
      FROM RECURSO r
      JOIN OS os ON os.CODREC_OS = r.COD_RECURSO
      ${whereConditionsOSNaoFaturadas.length ? 'WHERE ' + whereConditionsOSNaoFaturadas.join(' AND ') : ''}
        AND os.HRINI_OS IS NOT NULL 
        AND os.HRFIM_OS IS NOT NULL
        AND TRIM(os.HRINI_OS) <> ''
        AND TRIM(os.HRFIM_OS) <> ''
    `;

    // Executar todas as queries
    const [agendamentos, horasFaturadas, horasNaoFaturadas] = await Promise.all(
      [
        firebirdQuery<{
          COD_RECURSO: number;
          NOME_RECURSO: string;
          HRDIA_RECURSO: string;
          TOTAL_DIAS_MES: number;
        }>(sqlAgendamentos, params),

        firebirdQuery<{
          COD_RECURSO: number;
          HRINI_OS: string;
          HRFIM_OS: string;
        }>(sqlHorasFaturadas, paramsOSFaturadas),

        firebirdQuery<{
          COD_RECURSO: number;
          HRINI_OS: string;
          HRFIM_OS: string;
        }>(sqlHorasNaoFaturadas, paramsOSNaoFaturadas),
      ]
    );

    function converterHoraCharParaDecimal(horaStr: string): number {
      if (!horaStr) return 0;

      // Remove espaços e pads com zeros se necessário
      const horaLimpa = horaStr.toString().trim().padStart(4, '0');

      // Verifica se tem pelo menos 4 caracteres após limpeza
      if (horaLimpa.length < 4) return 0;

      const horasStr = horaLimpa.slice(0, 2);
      const minutosStr = horaLimpa.slice(2, 4);

      const horas = parseInt(horasStr, 10);
      const minutos = parseInt(minutosStr, 10);

      // Validações básicas
      if (
        isNaN(horas) ||
        isNaN(minutos) ||
        horas < 0 ||
        horas > 23 ||
        minutos < 0 ||
        minutos > 59
      ) {
        return 0;
      }

      return horas + minutos / 60;
    }

    function calcularDiferencaHoras(hrini: string, hrfim: string): number {
      try {
        const horaInicial = converterHoraCharParaDecimal(hrini);
        const horaFinal = converterHoraCharParaDecimal(hrfim);

        let diferenca = horaFinal - horaInicial;

        // Se a hora final for menor que a inicial, assume que passou do dia (ex: 23:00 até 01:00)
        if (diferenca < 0) {
          diferenca = 24 + horaFinal - horaInicial;
        }

        return Math.max(0, diferenca);
      } catch (error) {
        console.warn('Erro ao calcular diferença de horas:', error, {
          hrini,
          hrfim,
        });
        return 0;
      }
    }

    // Calcular total de horas faturadas por recurso
    const horasFaturadasPorRecurso = horasFaturadas.reduce(
      (acc, item) => {
        const codRecurso = item.COD_RECURSO;
        const diferencaHoras = calcularDiferencaHoras(
          item.HRINI_OS,
          item.HRFIM_OS
        );

        if (!acc[codRecurso]) {
          acc[codRecurso] = 0;
        }
        acc[codRecurso] += diferencaHoras;

        return acc;
      },
      {} as Record<number, number>
    );

    // Calcular total de horas não faturadas por recurso
    const horasNaoFaturadasPorRecurso = horasNaoFaturadas.reduce(
      (acc, item) => {
        const codRecurso = item.COD_RECURSO;
        const diferencaHoras = calcularDiferencaHoras(
          item.HRINI_OS,
          item.HRFIM_OS
        );

        if (!acc[codRecurso]) {
          acc[codRecurso] = 0;
        }
        acc[codRecurso] += diferencaHoras;

        return acc;
      },
      {} as Record<number, number>
    );

    const result = agendamentos.map(item => {
      const horasDiaDecimal = converterHoraCharParaDecimal(item.HRDIA_RECURSO);
      const totalHorasFaturadas =
        horasFaturadasPorRecurso[item.COD_RECURSO] || 0;
      const totalHorasNaoFaturadas =
        horasNaoFaturadasPorRecurso[item.COD_RECURSO] || 0;

      return {
        cod_recurso: item.COD_RECURSO,
        nome_recurso: item.NOME_RECURSO,
        horas_dia: item.HRDIA_RECURSO,
        total_dias_mes: item.TOTAL_DIAS_MES,
        total_horas_mes: +(item.TOTAL_DIAS_MES * horasDiaDecimal).toFixed(2),
        total_horas_faturadas: +totalHorasFaturadas.toFixed(2),
        total_horas_nao_faturadas: +totalHorasNaoFaturadas.toFixed(2),
        total_horas_os: +(totalHorasFaturadas + totalHorasNaoFaturadas).toFixed(
          2
        ),
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Erro ao tentar buscar agendamentos:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
