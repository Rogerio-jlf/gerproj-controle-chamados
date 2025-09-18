import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { firebirdQuery } from '../../../../../lib/firebird/firebird-client';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ codOS: string }> }
) {
  try {
    const { codOS } = await params;

    // Validação
    if (!codOS) {
      return NextResponse.json(
        { error: 'O código da OS é obrigatório' },
        { status: 400 }
      );
    }

    // Primeiro verifica se a OS existe
    const checkSql = `
      SELECT COD_OS
      FROM OS 
      WHERE COD_OS = ?
    `;

    const checkResult = await firebirdQuery(checkSql, [codOS]);

    if (!checkResult || checkResult.length === 0) {
      return NextResponse.json({ error: 'OS não encontrada' }, { status: 404 });
    }

    // SQL para deletar a OS inteira do banco
    const sql = `
      DELETE FROM OS 
      WHERE COD_OS = ?
    `;

    const result = await firebirdQuery(sql, [codOS]);

    return NextResponse.json(
      {
        message: 'OS deletada com sucesso',
        data: {
          codOS: codOS,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao tentar deletar a OS:', error);

    // Tratamento de erros específicos do Firebird
    if (error instanceof Error) {
      if (error.message.includes('violation of FOREIGN KEY constraint')) {
        return NextResponse.json(
          {
            error:
              'Não foi possível deletar a OS. Ela está sendo referenciada por outros registros.',
          },
          { status: 400 }
        );
      }

      if (error.message.includes('lock conflict')) {
        return NextResponse.json(
          {
            error:
              'A OS está sendo utilizada por outro usuário. Tente novamente mais tarde.',
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erro interno ao tentar deletar a OS' },
      { status: 500 }
    );
  }
}
