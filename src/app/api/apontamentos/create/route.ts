import { NextRequest, NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';

export enum STATUS_CHAMADO_COD {
   'ATRIBUIDO' = '1',
   'EM ATENDIMENTO' = '2',
   'STANDBY' = '3',
   'AGUARDANDO VALIDACAO' = '4',
   'FINALIZADO' = '5',
}

export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const {
         os,
         observacaoOS,
         dataInicioOS,
         horaInicioOS,
         horaFimOS,
         recurso,
      } = body;

      // Validação dos parâmetros obrigatórios
      if (
         !os?.COD_TAREFA ||
         !dataInicioOS ||
         !horaInicioOS ||
         !horaFimOS ||
         !recurso
      ) {
         return NextResponse.json(
            { error: 'Parâmetros obrigatórios ausentes ou inválidos' },
            { status: 400 }
         );
      }

      // *** BUSCAR INFORMAÇÕES DA TAREFA E PROJETO ***
      const tarefaQuery = `
         SELECT EXIBECHAM_TAREFA, CODPRO_TAREFA
         FROM TAREFA
         WHERE COD_TAREFA = ?
      `;

      const tarefaResult = await firebirdQuery(tarefaQuery, [os.COD_TAREFA]);

      if (!tarefaResult || tarefaResult.length === 0) {
         return NextResponse.json(
            {
               error: 'Tarefa não encontrada',
               details: `Tarefa COD_TAREFA: ${os.COD_TAREFA} não existe`,
            },
            { status: 400 }
         );
      }

      const tarefaInfo = tarefaResult[0];

      // Busca o projeto
      const projetoQuery = `
         SELECT RESPCLI_PROJETO
         FROM PROJETO
         WHERE COD_PROJETO = ?
      `;

      const projetoResult = await firebirdQuery(projetoQuery, [
         tarefaInfo.CODPRO_TAREFA,
      ]);

      if (!projetoResult || projetoResult.length === 0) {
         return NextResponse.json(
            {
               error: 'Projeto não encontrado',
               details: `Projeto COD_PROJETO: ${tarefaInfo.CODPRO_TAREFA} não existe`,
            },
            { status: 400 }
         );
      }

      const projetoInfo = projetoResult[0];
      let codChamado = null;

      // *** LÓGICA DO CHAMADO BASEADA EM EXIBECHAM_TAREFA ***
      // MUDANÇA IMPORTANTE: Comparar com API antiga, lá era EXIBECHAM_TAREFA = 1
      // Aqui você está fazendo o contrário. Vamos ajustar:

      if (tarefaInfo.EXIBECHAM_TAREFA === 1) {
         // Quando EXIBECHAM_TAREFA = 1, BUSCA o chamado (diferente do que estava fazendo)
         const chamadoQuery = `
            SELECT c.COD_CHAMADO 
            FROM CHAMADO c 
            WHERE c.CODTRF_CHAMADO = ?
            AND c.STATUS_CHAMADO NOT IN ('FINALIZADO', 'CANCELADO')
            ORDER BY c.DATA_CHAMADO DESC, c.HORA_CHAMADO DESC
            ROWS 1
         `;

         const chamadoResult = await firebirdQuery(chamadoQuery, [
            os.COD_TAREFA,
         ]);

         if (chamadoResult && chamadoResult.length > 0) {
            codChamado = chamadoResult[0].COD_CHAMADO;
            console.log(
               `Chamado encontrado: ${codChamado} para tarefa: ${os.COD_TAREFA}`
            );
         } else {
            console.log(
               `Nenhum chamado ativo encontrado para tarefa: ${os.COD_TAREFA}`
            );
            // Não retorna erro, apenas deixa codChamado = null
         }
      } else {
         console.log(
            `Tarefa ${os.COD_TAREFA} tem EXIBECHAM_TAREFA = ${tarefaInfo.EXIBECHAM_TAREFA}, CHAMADO_OS ficará null`
         );
      }

      // Busca o próximo ID para HISTCHAMADO
      const histChamadoResult = await firebirdQuery(
         'SELECT MAX(COD_HISTCHAMADO) + 1 as ID FROM HISTCHAMADO',
         []
      );
      const newHistChamadoID = histChamadoResult[0]?.ID || 1;

      // Busca o próximo COD_OS e NUM_OS
      const osResult = await firebirdQuery(
         'SELECT MAX(COD_OS) + 1 as COD_OS, MAX(NUM_OS) as NUM_OS FROM OS',
         []
      );

      const COD_OS = osResult[0]?.COD_OS || 1;
      const currentNumOS = parseInt(osResult[0]?.NUM_OS || '0');
      const NUM_OS = String(currentNumOS + 1).padStart(6, '0');

      console.log(
         `Criando OS: COD_OS=${COD_OS}, NUM_OS=${NUM_OS}, CHAMADO_OS=${codChamado || 'NULL'}`
      );

      // Formata as datas
      const dataFormatada = new Date(`${dataInicioOS} 00:00`)
         .toLocaleString('pt-br', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
         })
         .replaceAll('/', '.')
         .replaceAll(',', '');

      const dataInclusao = new Date()
         .toLocaleString('pt-br', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
         })
         .replaceAll('/', '.')
         .replaceAll(',', '');

      const competencia = new Date().toLocaleString('pt-br', {
         year: 'numeric',
         month: '2-digit',
      });

      const insertSQL = `
      INSERT INTO OS (
        COD_OS,
        CODTRF_OS,
        DTINI_OS,
        HRINI_OS,
        HRFIM_OS,
        OBS_OS,
        STATUS_OS,
        PRODUTIVO_OS,
        CODREC_OS,
        PRODUTIVO2_OS,
        RESPCLI_OS,
        OBS,
        REMDES_OS,
        ABONO_OS,
        DTINC_OS,
        FATURADO_OS,
        PERC_OS,
        VALID_OS,
        NUM_OS,
        VRHR_OS,
        COMP_OS,
        CHAMADO_OS
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

      const insertParams = [
         COD_OS,
         os.COD_TAREFA,
         dataFormatada,
         horaInicioOS.replace(':', ''),
         horaFimOS.replace(':', ''),
         os.NOME_TAREFA,
         STATUS_CHAMADO_COD['STANDBY'],
         'SIM', // PRODUTIVO_OS
         recurso,
         'SIM', // PRODUTIVO2_OS
         projetoInfo.RESPCLI_PROJETO,
         observacaoOS,
         'NAO', // REMDES_OS
         'NAO', // ABONO_OS
         dataInclusao,
         os.FATURA_TAREFA, // FATURADO_OS
         100, // PERC_OS
         'SIM', // VALID_OS
         NUM_OS,
         0, // VRHR_OS
         competencia,
         codChamado, // CHAMADO_OS - Este é o valor que deve ser retornado
      ];

      // Executa a inserção
      await firebirdQuery(insertSQL, insertParams);

      // VERIFICAÇÃO: Busca a OS recém-criada para confirmar o CHAMADO_OS
      const osVerificacao = await firebirdQuery(
         'SELECT CHAMADO_OS FROM OS WHERE COD_OS = ?',
         [COD_OS]
      );

      const chamadoOSSalvo = osVerificacao[0]?.CHAMADO_OS || null;

      console.log(`OS criada com sucesso: COD_OS=${COD_OS}, NUM_OS=${NUM_OS}`);
      console.log(
         `CHAMADO_OS inserido: ${codChamado}, CHAMADO_OS salvo no banco: ${chamadoOSSalvo}`
      );

      return NextResponse.json({
         success: true,
         message: 'OS criada com sucesso',
         data: {
            COD_OS,
            NUM_OS,
            newHistChamadoID,
            codChamado: chamadoOSSalvo, // Retorna o valor que realmente foi salvo
            exibeChamado: tarefaInfo.EXIBECHAM_TAREFA,
            respCliente: projetoInfo.RESPCLI_PROJETO,
            debug: {
               chamadoEncontrado: codChamado,
               chamadoSalvoNoBanco: chamadoOSSalvo,
            },
         },
      });
   } catch (error) {
      const errorMessage =
         error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao criar OS:', errorMessage);

      return NextResponse.json(
         {
            error: 'Erro ao criar OS',
            details: errorMessage,
         },
         { status: 500 }
      );
   }
}
