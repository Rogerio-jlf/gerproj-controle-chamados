import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';

interface StatusData {
  codChamado: string;
  statusChamado: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: StatusData = await request.json();

    // Validações
    if (!body.codChamado) {
      return NextResponse.json(
        { error: 'Código do chamado é obrigatório' },
        { status: 400 }
      );
    }

    if (!body.statusChamado) {
      return NextResponse.json(
        { error: 'Status do chamado é obrigatório' },
        { status: 400 }
      );
    }

    // SQL para atualizar campos específicos do chamado existente
    const sql = `
      UPDATE CHAMADO SET
        STATUS_CHAMADO = ?
      WHERE COD_CHAMADO = ?
    `;

    // MODO TESTE: Comentar a linha abaixo para não executar o UPDATE
    // const result = await firebirdQuery(sql, [
    //   body.statusChamado,
    //   body.codChamado
    // ]);

    // MODO TESTE: Simular resposta do banco
    console.log('TESTE - SQL que seria executado:', sql);
    console.log('TESTE - Parâmetros:', [body.statusChamado, body.codChamado]);

    return NextResponse.json(
      {
        message: 'Status atualizado com sucesso',
        data: {
          codChamado: body.codChamado,
          statusChamado: body.statusChamado,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao salvar Status:', error);

    // Tratamento de erros específicos do Firebird
    if (error instanceof Error) {
      if (error.message.includes('violation of FOREIGN KEY constraint')) {
        return NextResponse.json(
          { error: 'Chamado não encontrado' },
          { status: 400 }
        );
      }

      if (error.message.includes('lock conflict')) {
        return NextResponse.json(
          {
            error:
              'Chamado está sendo utilizado por outro usuário. Tente novamente.',
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erro interno ao salvar Status' },
      { status: 500 }
    );
  }
}
