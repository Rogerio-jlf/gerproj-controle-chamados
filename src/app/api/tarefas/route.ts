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
    const nomeTarefaQuery = searchParams.get('nomeTarefa')?.trim();

    const whereConditions: string[] = [];
    const params: any[] = [];

    // Condição obrigatória: STATUS_TAREFA diferente de 4
    whereConditions.push('TAREFA.STATUS_TAREFA <> ?');
    params.push(4);

    // Se não é admin, filtra pelo codRecurso do usuário
    if (!isAdmin && codRecurso) {
      whereConditions.push('TAREFA.CODREC_TAREFA = ?');
      params.push(Number(codRecurso));
    }

    // Filtro opcional por nome da tarefa
    if (nomeTarefaQuery) {
      whereConditions.push('LOWER(TAREFA.NOME_TAREFA) LIKE ?');
      params.push(`%${nomeTarefaQuery.toLowerCase()}%`);
    }

    const sql = `
      SELECT FIRST 100
        TAREFA.COD_TAREFA,
        TAREFA.NOME_TAREFA,
        TAREFA.CODREC_TAREFA,
        TAREFA.DTSOL_TAREFA,
        TAREFA.HREST_TAREFA,
        TAREFA.STATUS_TAREFA
      FROM TAREFA
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY TAREFA.DTSOL_TAREFA DESC
    `;

    const tarefas = await firebirdQuery(sql, params);

    return NextResponse.json(tarefas, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
