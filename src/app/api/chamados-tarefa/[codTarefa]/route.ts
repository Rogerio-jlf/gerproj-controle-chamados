import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ codTarefa: string }> }
) {
  try {
    // ===========================================
    // AUTENTICAÇÃO JWT
    // ===========================================
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
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const isAdmin = decoded.tipo === 'ADM' || decoded.tipo === 'ADMIN';
    const codRecurso = decoded.recurso?.id;

    if (!isAdmin && !codRecurso) {
      return NextResponse.json(
        { error: 'Usuário não admin precisa ter codRecurso definido' },
        { status: 400 }
      );
    }

    // ===========================================
    // VALIDAÇÃO DOS PARÂMETROS
    // ===========================================
    // Aguarda o params antes de desestruturar
    const { codTarefa } = await context.params;

    // Validação do parâmetro
    if (!codTarefa) {
      return NextResponse.json(
        { error: 'Parâmetro codTarefa é obrigatório' },
        { status: 400 }
      );
    }

    // Validação básica do parâmetro
    if (isNaN(Number(codTarefa))) {
      return NextResponse.json(
        { error: 'Parâmetro codTarefa deve ser um número válido' },
        { status: 400 }
      );
    }

    // ===========================================
    // CONSTRUÇÃO DA QUERY COM AUTORIZAÇÃO
    // ===========================================
    let sql = `
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
      WHERE CHAMADO.CODTRF_CHAMADO = ?
    `;

    const queryParams = [Number(codTarefa)];

    // Se não for admin, adiciona filtro por recurso (assumindo que existe um campo de recurso)
    if (!isAdmin && codRecurso) {
      sql += ` AND CHAMADO.COD_RECURSO = ?`;
      queryParams.push(codRecurso);
    }

    sql += ` ORDER BY CHAMADO.DATA_CHAMADO DESC`;

    // ===========================================
    // EXECUÇÃO DA QUERY
    // ===========================================
    const chamados = await firebirdQuery(sql, queryParams);

    // ===========================================
    // RESPOSTA
    // ===========================================
    // Verifica se foram encontrados registros
    if (!chamados || chamados.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(chamados, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar chamados por tarefa:', error);

    // Tratamento mais específico de erros
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Erro interno ao buscar chamados por tarefa',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno ao buscar chamados por tarefa' },
      { status: 500 }
    );
  }
}
