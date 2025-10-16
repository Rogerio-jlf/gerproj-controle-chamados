import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { firebirdQuery } from '../../../../../lib/firebird/firebird-client';

export async function DELETE(
   _request: NextRequest,
   { params }: { params: Promise<{ codChamado: string }> }
) {
   try {
      // Extrai o código do chamado dos parâmetros da rota
      const { codChamado } = await params;

      // Valida se o código do chamado foi fornecido
      if (!codChamado) {
         return NextResponse.json(
            { error: 'O código do chamado é obrigatório' },
            { status: 400 }
         );
      }

      // Verifica se o chamado existe no banco de dados
      const checkSql = `
      SELECT COD_CHAMADO
      FROM CHAMADO 
      WHERE COD_CHAMADO = ?
      `;

      // Executa a consulta para verificar a existência do chamado no banco de dados
      const checkResult = await firebirdQuery(checkSql, [codChamado]);

      if (!checkResult || checkResult.length === 0) {
         return NextResponse.json(
            { error: 'Chamado não encontrado' },
            { status: 404 }
         );
      }

      // SQL para deletar o chamado do banco de dados
      const sql = `
      DELETE FROM CHAMADO 
      WHERE COD_CHAMADO = ?
      `;

      // Executa a consulta para deletar o chamado do banco de dados
      const result = await firebirdQuery(sql, [codChamado]);

      // Retorna uma resposta de sucesso
      return NextResponse.json(
         {
            message: 'Chamado deletado com sucesso',
            data: {
               codChamado: codChamado,
            },
         },
         { status: 200 }
      );
      // Tratamento de erros
   } catch (error) {
      console.error('Erro ao tentar deletar o chamado:', error);

      // Verifica se o erro é uma instância de Error para acessar a mensagem
      if (error instanceof Error) {
         if (error.message.includes('violation of FOREIGN KEY constraint')) {
            return NextResponse.json(
               {
                  error: 'Não foi possível deletar o chamado. Ele está sendo referenciado por outros registros.',
               },
               { status: 400 }
            );
         }

         // Verifica se o erro é devido a um conflito de bloqueio (lock conflict)
         if (error.message.includes('lock conflict')) {
            return NextResponse.json(
               {
                  error: 'O chamado está sendo utilizado por outro usuário. Tente novamente mais tarde.',
               },
               { status: 409 }
            );
         }
      }

      // Para outros tipos de erros, retorna um erro genérico de servidor
      return NextResponse.json(
         { error: 'Erro interno ao tentar deletar o chamado' },
         { status: 500 }
      );
   }
}
