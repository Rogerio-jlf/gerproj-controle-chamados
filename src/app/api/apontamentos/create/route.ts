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
         codChamado,
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

      console.log(`Criando OS: COD_OS=${COD_OS}, NUM_OS=${NUM_OS}`);

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
         os.RESPCLI_PROJETO, // RESPCLI_OS
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
         codChamado, // CHAMADO_OS
      ];

      // Executa a query diretamente
      await firebirdQuery(insertSQL, insertParams);

      console.log(`OS criada com sucesso: COD_OS=${COD_OS}, NUM_OS=${NUM_OS}`);

      return NextResponse.json({
         success: true,
         message: 'OS criada com sucesso',
         data: {
            COD_OS,
            NUM_OS,
            newHistChamadoID,
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
