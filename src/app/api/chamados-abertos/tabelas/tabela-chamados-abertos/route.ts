import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../../lib/firebird/firebird-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const mesParam = Number(searchParams.get('mes'));
    const anoParam = Number(searchParams.get('ano'));
    const isAdmin = searchParams.get('isAdmin') === 'true';
    const codRecurso = searchParams.get('codRecurso')?.trim();
    const clienteQuery = searchParams.get('cliente')?.trim();
    const recursoQuery = searchParams.get('recurso')?.trim();
    const statusQuery = searchParams.get('status');

    if (!mesParam || mesParam < 1 || mesParam > 12) {
      return NextResponse.json(
        { error: "Parâmetro 'mês' inválido" },
        { status: 400 },
      );
    }

    if (!anoParam || anoParam < 2000 || anoParam > 3000) {
      return NextResponse.json(
        { error: "Parâmetro 'ano' inválido" },
        { status: 400 },
      );
    }

    if (!isAdmin && !codRecurso) {
      return NextResponse.json(
        {
          error: "Parâmetro 'codRecurso' é obrigatório para usuários não admin",
        },
        { status: 400 },
      );
    }

    const dataInicio = new Date(anoParam, mesParam - 1, 1);
    const dataFim = new Date(anoParam, mesParam, 1);

    const whereConditions: string[] = [];
    const params: any[] = [];

    whereConditions.push(
      'Chamado.DATA_CHAMADO >= ? AND Chamado.DATA_CHAMADO < ?',
    );
    params.push(dataInicio);
    params.push(dataFim);

    if (!isAdmin && codRecurso) {
      whereConditions.push('Chamado.COD_RECURSO = ?');
      params.push(Number(codRecurso));
    }

    if (clienteQuery) {
      whereConditions.push('LOWER(Cliente.NOME_CLIENTE) LIKE ?');
      params.push(`%${clienteQuery.toLowerCase()}%`);
    }

    if (recursoQuery) {
      whereConditions.push('LOWER(Recurso.NOME_RECURSO) LIKE ?');
      params.push(`%${recursoQuery.toLowerCase()}%`);
    }

    if (statusQuery) {
      whereConditions.push('Chamado.STATUS_CHAMADO = ?');
      params.push(statusQuery);
    }

    const sql = `
      SELECT FIRST 100
        Chamado.COD_CHAMADO,
        Chamado.DATA_CHAMADO,
        Chamado.HORA_CHAMADO,
        Chamado.CONCLUSAO_CHAMADO,
        Chamado.STATUS_CHAMADO,
        Chamado.DTENVIO_CHAMADO,
        Chamado.COD_RECURSO,
        Chamado.CLIENTE_CHAMADO,
        Chamado.CODTRF_CHAMADO,
        Chamado.COD_CLIENTE,
        Chamado.ASSUNTO_CHAMADO,
        Chamado.EMAIL_CHAMADO,
        Chamado.PRIOR_CHAMADO,
        Chamado.COD_CLASSIFICACAO,
        Cliente.NOME_CLIENTE,
        Recurso.NOME_RECURSO
      FROM CHAMADO Chamado
      LEFT JOIN CLIENTE Cliente ON Cliente.COD_CLIENTE = Chamado.COD_CLIENTE
      LEFT JOIN RECURSO Recurso ON Recurso.COD_RECURSO = Chamado.COD_RECURSO
      ${whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      ORDER BY Chamado.DATA_CHAMADO DESC
    `;

    const chamados = await firebirdQuery(sql, params);

    return NextResponse.json(chamados, { status: 200 });
  } catch (error) {
    console.error('Erro ao tentar buscar os chamados abertos:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 },
    );
  }
}
