import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';

interface StatusData {
   codChamado: string;
   statusChamado: string;
   codClassificacao?: number;
   codTarefa?: number;
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

      // Validar se classificação é obrigatória para status diferente de "EM ATENDIMENTO"
      if (body.statusChamado !== 'EM ATENDIMENTO' && !body.codClassificacao) {
         return NextResponse.json(
            { error: 'Classificação é obrigatória para este status' },
            { status: 400 }
         );
      }

      // Validar se tarefa é obrigatória para status "EM ATENDIMENTO"
      if (body.statusChamado === 'EM ATENDIMENTO' && !body.codTarefa) {
         return NextResponse.json(
            { error: 'Tarefa é obrigatória para status "EM ATENDIMENTO"' },
            { status: 400 }
         );
      }

      let sql: string;
      let params: any[];

      // Definir SQL baseado no status
      if (body.statusChamado === 'EM ATENDIMENTO') {
         // Para "EM ATENDIMENTO", atualiza status e tarefa no campo CODTRF_CHAMADO
         sql = `
            UPDATE CHAMADO SET
               STATUS_CHAMADO = ?,
               CODTRF_CHAMADO = ?
            WHERE COD_CHAMADO = ?
         `;
         params = [body.statusChamado, body.codTarefa, body.codChamado];
      } else {
         // Para outros status, atualiza status e classificação
         sql = `
            UPDATE CHAMADO SET
               STATUS_CHAMADO = ?,
               COD_CLASSIFICACAO = ?
            WHERE COD_CHAMADO = ?
         `;
         params = [body.statusChamado, body.codClassificacao, body.codChamado];
      }

      // Verificar se o chamado existe
      const checkSql = 'SELECT COD_CHAMADO FROM CHAMADO WHERE COD_CHAMADO = ?';
      const existingChamado = await firebirdQuery(checkSql, [body.codChamado]);

      if (existingChamado.length === 0) {
         return NextResponse.json(
            { error: 'Chamado não encontrado' },
            { status: 404 }
         );
      }

      // Se foi informada uma classificação, verificar se ela existe
      if (body.codClassificacao) {
         const checkClassSql =
            'SELECT COD_CLASSIFICACAO FROM CLASSIFICACAO WHERE COD_CLASSIFICACAO = ?';
         const existingClass = await firebirdQuery(checkClassSql, [
            body.codClassificacao,
         ]);

         if (existingClass.length === 0) {
            return NextResponse.json(
               { error: 'Classificação não encontrada' },
               { status: 404 }
            );
         }
      }

      // Se foi informada uma tarefa, verificar se ela existe
      if (body.codTarefa) {
         const checkTaskSql =
            'SELECT COD_TAREFA FROM TAREFA WHERE COD_TAREFA = ?';
         const existingTask = await firebirdQuery(checkTaskSql, [
            body.codTarefa,
         ]);

         if (existingTask.length === 0) {
            return NextResponse.json(
               { error: 'Tarefa não encontrada' },
               { status: 404 }
            );
         }
      }

      // Executar a atualização
      const result = await firebirdQuery(sql, params);

      return NextResponse.json(
         {
            message: 'Status atualizado com sucesso',
            data: {
               codChamado: body.codChamado,
               statusChamado: body.statusChamado,
               codClassificacao: body.codClassificacao || null,
               codTarefa: body.codTarefa || null,
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
               {
                  error: 'Referência inválida (chamado, classificação ou tarefa não encontrados)',
               },
               { status: 400 }
            );
         }

         if (error.message.includes('lock conflict')) {
            return NextResponse.json(
               {
                  error: 'Chamado está sendo utilizado por outro usuário. Tente novamente.',
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
