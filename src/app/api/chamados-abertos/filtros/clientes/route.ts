import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../../lib/firebird/firebird-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const mesParam = searchParams.get('mes');
    const anoParam = searchParams.get('ano');
    const isAdmin = searchParams.get('isAdmin') === 'true';
    const codRecurso = searchParams.get('codRecurso');

    const mes = Number(mesParam);
    const ano = Number(anoParam);

    if (!mesParam || isNaN(mes) || mes < 1 || mes > 12) {
      return NextResponse.json(
        { error: "Parâmetro 'mês' inválido" },
        { status: 400 }
      );
    }

    if (!anoParam || isNaN(ano) || ano < 2000 || ano > 3000) {
      return NextResponse.json(
        { error: "Parâmetro 'ano' inválido" },
        { status: 400 }
      );
    }

    if (!isAdmin && (!codRecurso || codRecurso.trim() === '')) {
      return NextResponse.json(
        {
          error: "Parâmetro 'codRecurso' é obrigatório para usuários não admin",
        },
        { status: 400 }
      );
    }

    const dataInicio = new Date(ano, mes - 1, 1, 0, 0, 0, 0);
    const dataFim = new Date(ano, mes, 1, 0, 0, 0, 0);

    const whereConditions: string[] = [];
    const params: any[] = [];

    whereConditions.push(
      'Chamado.DATA_CHAMADO >= ? AND Chamado.DATA_CHAMADO < ?'
    );
    params.push(dataInicio);
    params.push(dataFim);

    if (!isAdmin && codRecurso) {
      whereConditions.push('Chamado.COD_RECURSO = ?');
      params.push(Number(codRecurso));
    }

    const sql = `
      SELECT DISTINCT Cliente.NOME_CLIENTE
      FROM CHAMADO Chamado
      LEFT JOIN CLIENTE Cliente ON Cliente.COD_CLIENTE = Chamado.COD_CLIENTE
      ${whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : ''}
    `;

    const results = await firebirdQuery<{ NOME_CLIENTE: string | null }>(
      sql,
      params
    );

    const nomesClientes = results
      .map(row => row.NOME_CLIENTE?.trim())
      .filter((nome): nome is string => !!nome && nome.length > 0)
      .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));

    return NextResponse.json(nomesClientes);
  } catch (error) {
    console.error('Erro ao tentar buscar os clientes:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Erro ao buscar clientes',
          message: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
