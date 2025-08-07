import { NextResponse } from 'next/server';
import { firebirdQuery } from '@/lib/firebird/firebird-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const mesParam = Number(searchParams.get('mes'));
    const anoParam = Number(searchParams.get('ano'));

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

    const mesAno = `${String(mesParam).padStart(2, '0')}/${anoParam}`;

    const query = `
      SELECT 
        SUM(VRDESP_FATDES) AS TOTAL_DESPESAS
      FROM 
        FATDES
      WHERE 
        MESANO_FATDES = ?
    `;

    const result = await firebirdQuery(query, [mesAno]);

    const totalDespesas = Number(result[0]?.TOTAL_DESPESAS || 0);

    return NextResponse.json({
      total_despesas: totalDespesas.toFixed(2),
    });
  } catch (error) {
    console.error('Erro ao buscar total de despesas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
