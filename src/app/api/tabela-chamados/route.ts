import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../lib/firebird/firebird-client';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  try {
    // Pega o token do header Authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    let decoded: any;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'minha_chave_secreta'
      );
    } catch (err) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const isAdmin = decoded.tipo === 'ADM';
    const codRecurso = decoded.recurso?.id;

    // Pega parâmetros da query
    const { searchParams } = new URL(request.url);
    const mesParam = Number(searchParams.get('mes'));
    const anoParam = Number(searchParams.get('ano'));
    const clienteQuery = searchParams.get('cliente')?.trim();
    const recursoQuery = searchParams.get('recurso')?.trim();
    const statusQuery = searchParams.get('status')?.trim();
    const codChamadoQuery = searchParams.get('codChamado')?.trim();

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
        { error: 'Usuário não admin precisa ter codRecurso definido' },
        { status: 400 }
      );
    }

    const dataInicio = new Date(anoParam, mesParam - 1, 1);
    const dataFim = new Date(anoParam, mesParam, 1);

    const whereConditions: string[] = [
      'Chamado.DATA_CHAMADO >= ? AND Chamado.DATA_CHAMADO < ?',
    ];
    const params: any[] = [dataInicio, dataFim];

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

    if (codChamadoQuery) {
      whereConditions.push('Chamado.COD_CHAMADO = ?');
      params.push(Number(codChamadoQuery));
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
    console.error('Erro ao buscar chamados abertos:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
