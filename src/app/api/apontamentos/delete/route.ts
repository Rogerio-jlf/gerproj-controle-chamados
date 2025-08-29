import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🎯 Importa automaticamente baseado na variável de ambiente
const testMode = process.env.FIREBIRD_TEST_MODE === 'true';
const { firebirdQuery } = testMode
  ? require('../../../../lib/firebird/firebird-test-mode')
  : require('../../../../lib/firebird/firebird-client');

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codOS = searchParams.get('codOS');

    // Validação
    if (!codOS) {
      return NextResponse.json(
        { error: 'Código da OS é obrigatório' },
        { status: 400 }
      );
    }

    // Primeiro verifica se a OS existe
    const checkSql = `
      SELECT COD_OS
      FROM OS 
      WHERE COD_OS = ?
    `;

    // ✅ CORREÇÃO: Passa o parâmetro testMode
    const checkResult = await firebirdQuery(checkSql, [codOS], testMode);

    if (!checkResult || checkResult.length === 0) {
      return NextResponse.json({ error: 'OS não encontrada' }, { status: 404 });
    }

    // SQL para deletar a OS inteira do banco
    const sql = `
      DELETE FROM OS 
      WHERE COD_OS = ?
    `;

    // 🔄 CORREÇÃO: Passa o parâmetro testMode para executar com rollback
    const result = await firebirdQuery(sql, [codOS], testMode);

    if (testMode) {
      console.log('[TEST MODE] SQL executado (com rollback):', sql);
      console.log('[TEST MODE] Parâmetros:', [codOS]);
    }

    return NextResponse.json(
      {
        message: `OS ${testMode ? '[TESTE - SEM COMMIT]' : ''} deletada com sucesso`,
        data: {
          codOS: codOS,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao deletar OS:', error);

    // Tratamento de erros específicos do Firebird
    if (error instanceof Error) {
      if (error.message.includes('violation of FOREIGN KEY constraint')) {
        return NextResponse.json(
          {
            error:
              'Não é possível deletar esta OS. Ela está sendo referenciada por outros registros.',
          },
          { status: 400 }
        );
      }

      if (error.message.includes('lock conflict')) {
        return NextResponse.json(
          {
            error:
              'OS está sendo utilizada por outro usuário. Tente novamente.',
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erro interno ao deletar OS' },
      { status: 500 }
    );
  }
}
