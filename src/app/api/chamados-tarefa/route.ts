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

    // Extrai o token do header Authorization
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

    // Verifica se o usuário é admin ou tem codRecurso
    const isAdmin = decoded.tipo === 'ADM';
    const codRecurso = decoded.recurso?.id;

    // Se não é admin e não tem codRecurso, retorna erro
    if (!isAdmin && !codRecurso) {
      return NextResponse.json(
        { error: 'Usuário não admin precisa ter codRecurso definido' },
        { status: 400 }
      );
    }

    // Pega parâmetros da query (opcionais para filtros)
    const { searchParams } = new URL(request.url);
    const assuntoChamadoQuery = searchParams.get('assunto')?.trim();
    const statusChamadoQuery = searchParams.get('status')?.trim();

    const whereConditions: string[] = [];
    const params: any[] = [];

    // Se não é admin, filtra pelo codRecurso do usuário na tabela CHAMADO
    if (!isAdmin && codRecurso) {
      whereConditions.push('CHAMADO.COD_RECURSO = ?');
      params.push(Number(codRecurso));
    }

    // NOVO: Sempre exclui chamados com status FINALIZADO
    whereConditions.push('CHAMADO.STATUS_CHAMADO <> ?');
    params.push('FINALIZADO');

    // Filtro opcional por assunto do chamado
    if (assuntoChamadoQuery) {
      whereConditions.push('LOWER(CHAMADO.ASSUNTO_CHAMADO) LIKE ?');
      params.push(`%${assuntoChamadoQuery.toLowerCase()}%`);
    }

    // Filtro opcional por status do chamado
    if (statusChamadoQuery) {
      whereConditions.push('CHAMADO.STATUS_CHAMADO = ?');
      params.push(statusChamadoQuery); // Removido Number() pois STATUS pode ser string
    }

    // Monta a cláusula WHERE
    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const sql = `
      SELECT FIRST 100
        CHAMADO.COD_CHAMADO,
        CHAMADO.DATA_CHAMADO,
        CHAMADO.STATUS_CHAMADO,
        CHAMADO.CODTRF_CHAMADO,
        CHAMADO.COD_CLIENTE,
        CHAMADO.ASSUNTO_CHAMADO,
        TAREFA.NOME_TAREFA,
        CLIENTE.NOME_CLIENTE
      FROM CHAMADO
      INNER JOIN TAREFA ON TAREFA.COD_TAREFA = CHAMADO.CODTRF_CHAMADO
      INNER JOIN CLIENTE ON CLIENTE.COD_CLIENTE = CHAMADO.COD_CLIENTE
      ${whereClause}
      ORDER BY CHAMADO.DATA_CHAMADO DESC
    `;

    const chamados = await firebirdQuery(sql, params);

    return NextResponse.json(chamados, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar chamados:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
