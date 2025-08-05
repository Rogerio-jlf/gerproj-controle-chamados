import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../../lib/firebird/firebird-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const mesParam = Number(searchParams.get('mes'));
    const anoParam = Number(searchParams.get('ano'));
    const isAdmin = searchParams.get('isAdmin') === 'true';
    const codRecurso = searchParams.get('codRecurso')?.trim();
    const recursoQuery = searchParams.get('recurso')?.trim();

    if (!mesParam || mesParam < 1 || mesParam > 12) {
      return NextResponse.json(
        { error: "Parâmetro 'mês' inválido" },
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

    const whereConditions: string[] = [];
    const params: any[] = [];

    // Filtro por mês e ano
    whereConditions.push(
      'RESCON.REALIZADO_RESCON >= ? AND RESCON.REALIZADO_RESCON < ?'
    );
    params.push(dataInicio);
    params.push(dataFim);

    // Filtro por código de recurso para usuários não admin
    if (!isAdmin && codRecurso) {
      whereConditions.push('RESCON.COD_RECURSO = ?');
      params.push(Number(codRecurso));
    } else if (codRecurso) { // Filtro opcional por código de recurso para admin
      whereConditions.push('RESCON.COD_RECURSO = ?');
      params.push(Number(codRecurso));
    }

    // Filtro por nome de recurso
    if (recursoQuery) {
      whereConditions.push('LOWER(Recurso.NOME_RECURSO) LIKE ?');
      params.push(`%${recursoQuery.toLowerCase()}%`);
    }

    const sql = `
      SELECT 
        RESCON.COD_RESCON,
        RESCON.COD_FUTURA,
        RESCON.COD_RECURSO,
        RESCON.HRFAT_RESCON,
        RESCON.HRNFAT_RESCON,
        RESCON.VRFAT_RESCON,
        RESCON.VRNFAT_RESCON,
        RESCON.REALIZADO_RESCON,
        RESCON.DISPONIVEL_RESCON,
        RESCON.PERC1_RESCON,
        RESCON.PERC2_RESCON,
        RESCON.PERC3_RESCON,
        RESCON.CUSTO_RESCON,
        RESCON.CONTRIB_RESCON,
        RESCON.PERCCONTRIB_RESCON,
        RESCON.HRBASE_RESCON,
        RESCON.MO_RESCON,
        RESCON.DESP_RESCON,
        Recurso.NOME_RECURSO
      FROM RESCON RESCON
      LEFT JOIN RECURSO Recurso ON Recurso.COD_RECURSO = RESCON.COD_RECURSO
      ${whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      ORDER BY RESCON.REALIZADO_RESCON DESC
    `;

    const result = await firebirdQuery(sql, params);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao buscar dados da tabela RESCON:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados da tabela RESCON' },
      { status: 500 }
    );
  }
}