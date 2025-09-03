import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ codChamado: string }> }
) {
  try {
    // Aguarda o params antes de desestruturar
    const { codChamado } = await context.params;

    if (!codChamado) {
      return NextResponse.json(
        { error: 'Parâmetro codChamado é obrigatório' },
        { status: 400 }
      );
    }

    // Validação básica do parâmetro
    if (isNaN(Number(codChamado))) {
      return NextResponse.json(
        { error: 'Parâmetro codChamado deve ser um número válido' },
        { status: 400 }
      );
    }

    const sql = `
      SELECT
        OS.COD_OS,
        OS.CODTRF_OS,
        OS.DTINI_OS,
        OS.HRINI_OS,
        OS.HRFIM_OS,
        OS.OBS_OS,
        OS.STATUS_OS,
        OS.PRODUTIVO_OS,
        OS.CODREC_OS,
        OS.PRODUTIVO2_OS,
        OS.RESPCLI_OS,
        OS.REMDES_OS,
        OS.ABONO_OS,
        OS.DESLOC_OS,
        OS.OBS,
        OS.DTINC_OS,
        OS.FATURADO_OS,
        OS.PERC_OS,
        OS.COD_FATURAMENTO,
        OS.COMP_OS,
        OS.VALID_OS,
        OS.VRHR_OS,
        OS.NUM_OS,
        OS.CHAMADO_OS,
        CHAMADO.COD_CHAMADO,
        CHAMADO.COD_CLIENTE,
        CLIENTE.NOME_CLIENTE
      FROM OS
      INNER JOIN CHAMADO ON CHAMADO.COD_CHAMADO = OS.CHAMADO_OS
      INNER JOIN CLIENTE ON CLIENTE.COD_CLIENTE = CHAMADO.COD_CLIENTE
      WHERE OS.CHAMADO_OS = ?
    `;

    const rawOsData = await firebirdQuery(sql, [Number(codChamado)]);

    // Função para calcular a diferença entre horários no formato CHAR (ex: "0800")
    const calculateHours = (
      hrini: string | null,
      hrfim: string | null
    ): number | null => {
      if (!hrini || !hrfim) return null;

      try {
        // Parse dos horários no formato HHMM (ex: "0800", "1230")
        const parseTime = (timeStr: string) => {
          // Remove espaços e garante que tenha 4 dígitos
          const cleanTime = timeStr.trim().padStart(4, '0');
          const hours = parseInt(cleanTime.substring(0, 2), 10);
          const minutes = parseInt(cleanTime.substring(2, 4), 10);
          return hours + minutes / 60;
        };

        const horaInicio = parseTime(hrini);
        const horaFim = parseTime(hrfim);

        let diferenca = horaFim - horaInicio;

        // Se a hora final for menor que a inicial, assumimos que passou para o próximo dia
        if (diferenca < 0) {
          diferenca += 24;
        }

        return Math.round(diferenca * 100) / 100; // Arredonda para 2 casas decimais
      } catch (error) {
        console.error('Erro ao calcular horas:', error, { hrini, hrfim });
        return null;
      }
    };

    // Adiciona o campo calculado a cada registro
    const osData = rawOsData.map((record: any) => ({
      ...record,
      QTD_HR_OS: calculateHours(record.HRINI_OS, record.HRFIM_OS),
    }));

    // Verifica se foram encontrados registros
    if (!osData || osData.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(osData, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar dados da OS com cliente:', error);

    // Tratamento mais específico de erros
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Erro interno ao buscar dados da OS',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno ao buscar dados da OS' },
      { status: 500 }
    );
  }
}
