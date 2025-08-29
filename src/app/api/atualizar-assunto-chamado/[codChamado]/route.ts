import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🎯 Importa automaticamente baseado na variável de ambiente
const testMode = process.env.FIREBIRD_TEST_MODE === 'true';
const { firebirdQuery } = testMode
  ? require('../../../../lib/firebird/firebird-test-mode')
  : require('../../../../lib/firebird/firebird-client');

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

    // 🔄 Executa o UPDATE (com rollback automático se testMode = true)
    const result = await firebirdQuery(sql, params);

    if (testMode) {
      console.log('[TEST MODE] SQL executado (com rollback):', sql);
      console.log('[TEST MODE] Parâmetros:', params);
    }

    return NextResponse.json(
      {
        message: `Assunto ${testMode ? '[TESTE - SEM COMMIT]' : ''} atualizado com sucesso`,
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
