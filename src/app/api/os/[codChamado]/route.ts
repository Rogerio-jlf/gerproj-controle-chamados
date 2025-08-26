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

    const sql = `
      SELECT
        COD_OS,
        CODTRF_OS,
        DTINI_OS,
        HRINI_OS,
        HRFIM_OS,
        OBS_OS,
        STATUS_OS,
        PRODUTIVO_OS,
        CODREC_OS,
        PRODUTIVO2_OS,
        RESPCLI_OS,
        REMDES_OS,
        ABONO_OS,
        DESLOC_OS,
        OBS,
        DTINC_OS,
        FATURADO_OS,
        PERC_OS,
        COD_FATURAMENTO,
        COMP_OS,
        VALID_OS,
        VRHR_OS,
        NUM_OS,
        CHAMADO_OS
      FROM OS
      WHERE CHAMADO_OS = ?
    `;

    const osData = await firebirdQuery(sql, [codChamado]);

    return NextResponse.json(osData, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar dados da OS:', error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar dados da OS' },
      { status: 500 }
    );
  }
}
