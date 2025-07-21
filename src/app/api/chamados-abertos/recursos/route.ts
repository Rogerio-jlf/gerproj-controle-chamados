import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';

export async function GET() {
  try {
    const sql = `
    SELECT DISTINCT
      Recurso.COD_RECURSO,
      Recurso.NOME_RECURSO,
      Recurso.EMAIL_RECURSO
    FROM RECURSO Recurso
    WHERE Recurso.ATIVO_RECURSO = 1
    ORDER BY Recurso.NOME_RECURSO ASC
    `;

    const responseRecursos = await firebirdQuery<{
      COD_RECURSO: number;
      NOME_RECURSO: string | null;
      EMAIL_RECURSO: string | null;
    }>(sql);

    const recursos = responseRecursos.map(recurso => ({
      cod_recurso: recurso.COD_RECURSO,
      nome_recurso: recurso.NOME_RECURSO?.trim() ?? '',
      email_recurso: recurso.EMAIL_RECURSO?.trim() ?? '',
    }));

    return NextResponse.json(recursos, { status: 200 });
  } catch (error) {
    console.error('Erro ao tentar buscar os recursos:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
