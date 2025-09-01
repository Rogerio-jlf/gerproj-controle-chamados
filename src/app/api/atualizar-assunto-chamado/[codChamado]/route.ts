import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';

interface AssuntoData {
  codChamado: string;
  assuntoChamado: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AssuntoData = await request.json();

    // Validações
    if (!body.codChamado) {
      return NextResponse.json(
        { error: 'Código do chamado é obrigatório' },
        { status: 400 }
      );
    }

    if (!body.assuntoChamado) {
      return NextResponse.json(
        { error: 'Assunto do chamado é obrigatório' },
        { status: 400 }
      );
    }

    // SQL para atualizar campos específicos do chamado existente
    const sql = `
      UPDATE CHAMADO SET
        ASSUNTO_CHAMADO = ?
      WHERE COD_CHAMADO = ?
    `;

    const params = [body.assuntoChamado, body.codChamado];

    const result = await firebirdQuery(sql, params);

    return NextResponse.json(
      {
        message: 'Assunto atualizado com sucesso',
        data: {
          codChamado: body.codChamado,
          assuntoChamado: body.assuntoChamado,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao salvar Assunto:', error);

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
      { error: 'Erro interno ao salvar Assunto' },
      { status: 500 }
    );
  }
}
