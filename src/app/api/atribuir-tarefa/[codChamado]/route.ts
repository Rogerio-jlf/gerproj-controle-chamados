import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';

export async function GET(
   request: Request,
   { params }: { params: { codChamado: string } }
) {
   try {
      const { codChamado } = await params;

      if (!codChamado) {
         return NextResponse.json(
            { error: 'Código do chamado é obrigatório' },
            { status: 400 }
         );
      }

      // SQL para buscar tarefas baseado na regra de negócio
      // const sql = `
      //    SELECT DISTINCT
      //       T.COD_TAREFA,
      //       T.NOME_TAREFA
      //    FROM TAREFA T
      //    INNER JOIN PROJETO P ON T.CODPRO_TAREFA = P.COD_PROJETO
      //    INNER JOIN CHAMADO C ON P.CODCLI_PROJETO = C.COD_CLIENTE
      //    WHERE C.COD_CHAMADO = ?
      //    ORDER BY T.NOME_TAREFA
      // `;

      // Filtra apenas tarefas que contêm "ASSESSORIA CONTINUADA" no nome
      const sql = `
         SELECT DISTINCT
            T.COD_TAREFA,
            T.NOME_TAREFA
         FROM TAREFA T
         INNER JOIN PROJETO P ON T.CODPRO_TAREFA = P.COD_PROJETO
         INNER JOIN CHAMADO C ON P.CODCLI_PROJETO = C.COD_CLIENTE
         WHERE C.COD_CHAMADO = ?
         AND UPPER(T.NOME_TAREFA) LIKE '%ASSESSORIA CONTINUADA%'
         ORDER BY T.NOME_TAREFA
      `;

      const result = await firebirdQuery(sql, [codChamado]);

      return NextResponse.json(result, { status: 200 });
   } catch (error) {
      console.error('Erro ao buscar tarefas:', error);

      return NextResponse.json(
         { error: 'Erro interno ao buscar tarefas' },
         { status: 500 }
      );
   }
}
