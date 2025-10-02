import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { firebirdQuery } from '../../../../../lib/firebird/firebird-client';

interface UnifiedRequestData {
   statusChamado: string;
   codClassificacao?: number;
   codTarefa?: number;
   // Dados para criar OS (opcionais)
   criarOS?: boolean;
   dadosOS?: {
      dataInicioOS: string;
      horaInicioOS: string;
      horaFimOS: string;
      observacaoOS: string;
      recurso: string;
   };
}

// Enum para mapear os códigos de status do chamado
enum STATUS_CHAMADO_COD {
   'ATRIBUIDO' = '1',
   'EM ATENDIMENTO' = '2',
   'STANDBY' = '3',
   'AGUARDANDO VALIDACAO' = '4',
   'FINALIZADO' = '5',
}

export async function POST(
   request: NextRequest,
   { params }: { params: Promise<{ codChamado: string }> }
) {
   try {
      const { codChamado } = await params;
      const body: UnifiedRequestData = await request.json();

      // Validações básicas
      if (!codChamado || !body.statusChamado) {
         return NextResponse.json(
            { error: 'Parâmetros obrigatórios ausentes' },
            { status: 400 }
         );
      }

      // ===== BUSCAR DADOS DO CHAMADO (INCLUINDO TAREFA) =====
      const chamadoQuery = `
         SELECT 
            COD_CHAMADO, 
            CODTRF_CHAMADO,
            STATUS_CHAMADO,
            COD_CLASSIFICACAO
         FROM CHAMADO 
         WHERE COD_CHAMADO = ?
      `;
      const chamadoResult = await firebirdQuery(chamadoQuery, [codChamado]);

      if (chamadoResult.length === 0) {
         return NextResponse.json(
            { error: 'Chamado não encontrado' },
            { status: 404 }
         );
      }

      const chamadoInfo = chamadoResult[0];
      const tarefaDoChamado = chamadoInfo.CODTRF_CHAMADO; // ✅ Tarefa já associada ao chamado

      // ===== VALIDAÇÕES ESPECÍFICAS POR STATUS =====
      if (body.statusChamado === 'EM ATENDIMENTO') {
         if (!body.codTarefa) {
            return NextResponse.json(
               { error: 'Tarefa é obrigatória para status "EM ATENDIMENTO"' },
               { status: 400 }
            );
         }
         if (body.criarOS) {
            return NextResponse.json(
               {
                  error: 'Não é permitido criar OS quando o status é "EM ATENDIMENTO"',
               },
               { status: 400 }
            );
         }
      } else {
         // Para outros status: sempre precisa de classificação
         if (!body.codClassificacao) {
            return NextResponse.json(
               { error: 'Classificação é obrigatória para este status' },
               { status: 400 }
            );
         }

         // Se não tem tarefa associada ao chamado, não pode criar OS
         if (body.criarOS && !tarefaDoChamado) {
            return NextResponse.json(
               {
                  error: 'Não é possível criar OS: chamado não possui tarefa associada',
               },
               { status: 400 }
            );
         }

         // Validar dados da OS se necessário
         if (body.criarOS && body.dadosOS) {
            const {
               dataInicioOS,
               horaInicioOS,
               horaFimOS,
               observacaoOS,
               recurso,
            } = body.dadosOS;
            if (!dataInicioOS || !horaInicioOS || !horaFimOS || !recurso) {
               return NextResponse.json(
                  { error: 'Dados da OS incompletos' },
                  { status: 400 }
               );
            }
            if (!observacaoOS || observacaoOS.trim().length < 10) {
               return NextResponse.json(
                  {
                     error: 'Observação da OS deve ter pelo menos 10 caracteres',
                  },
                  { status: 400 }
               );
            }
         }
      }

      // ===== VALIDAR CLASSIFICAÇÃO SE FORNECIDA =====
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

      // ===== VALIDAR TAREFA SE FORNECIDA =====
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

      // ===== ATUALIZAR STATUS DO CHAMADO =====
      let updateSql: string;
      let updateParams: any[];

      if (body.statusChamado === 'EM ATENDIMENTO') {
         updateSql = `UPDATE CHAMADO SET STATUS_CHAMADO = ?, CODTRF_CHAMADO = ? WHERE COD_CHAMADO = ?`;
         updateParams = [body.statusChamado, body.codTarefa, codChamado];
      } else {
         updateSql = `UPDATE CHAMADO SET STATUS_CHAMADO = ?, COD_CLASSIFICACAO = ? WHERE COD_CHAMADO = ?`;
         updateParams = [body.statusChamado, body.codClassificacao, codChamado];
      }

      await firebirdQuery(updateSql, updateParams);

      // ===== PREPARAR RESPOSTA =====
      const responseData: any = {
         message: 'Status atualizado com sucesso',
         chamado: {
            codChamado,
            statusChamado: body.statusChamado,
            codClassificacao: body.codClassificacao || null,
            codTarefa: body.codTarefa || tarefaDoChamado, // ✅ Usar tarefa do chamado como fallback
         },
      };

      // ===== CRIAR OS SE SOLICITADO =====
      if (body.criarOS && body.dadosOS && tarefaDoChamado) {
         try {
            // Buscar informações da tarefa DO CHAMADO
            const tarefaQuery = `
               SELECT 
                  T.CODPRO_TAREFA,
                  T.NOME_TAREFA,
                  T.EXIBECHAM_TAREFA,
                  T.FATURA_TAREFA,
                  P.RESPCLI_PROJETO,
                  C.NOME_CLIENTE
               FROM TAREFA T
               JOIN PROJETO P ON P.COD_PROJETO = T.CODPRO_TAREFA
               JOIN CLIENTE C ON C.COD_CLIENTE = P.CODCLI_PROJETO
               WHERE T.COD_TAREFA = ?
            `;
            const tarefaResult = await firebirdQuery(tarefaQuery, [
               tarefaDoChamado,
            ]);

            if (!tarefaResult || tarefaResult.length === 0) {
               throw new Error('Tarefa associada ao chamado não encontrada');
            }

            const tarefaInfo = tarefaResult[0];

            // Buscar próximos IDs
            const osResult = await firebirdQuery(
               'SELECT MAX(COD_OS) + 1 as COD_OS, MAX(NUM_OS) as NUM_OS FROM OS',
               []
            );
            const COD_OS = osResult[0]?.COD_OS || 1;
            const currentNumOS = parseInt(osResult[0]?.NUM_OS || '0');
            const NUM_OS = String(currentNumOS + 1).padStart(6, '0');

            // Formatar datas
            const dataFormatada = new Date(`${body.dadosOS.dataInicioOS} 00:00`)
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

            // Determinar CHAMADO_OS baseado no EXIBECHAM_TAREFA
            const codChamadoOS =
               tarefaInfo.EXIBECHAM_TAREFA === 1 ? codChamado : null;

            // Criar observação da OS
            const obsOS = `[${tarefaInfo.NOME_CLIENTE}] - ${tarefaInfo.NOME_TAREFA}`;

            // Inserir OS
            const insertOSSQL = `
               INSERT INTO OS (
                  COD_OS, CODTRF_OS, DTINI_OS, HRINI_OS, HRFIM_OS, OBS_OS,
                  STATUS_OS, PRODUTIVO_OS, CODREC_OS, PRODUTIVO2_OS, RESPCLI_OS,
                  OBS, REMDES_OS, ABONO_OS, DTINC_OS, FATURADO_OS, PERC_OS,
                  VALID_OS, NUM_OS, VRHR_OS, COMP_OS, CHAMADO_OS
               ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const insertOSParams = [
               COD_OS,
               tarefaDoChamado, // ✅ USAR A TAREFA DO CHAMADO
               dataFormatada,
               body.dadosOS.horaInicioOS.replace(':', ''),
               body.dadosOS.horaFimOS.replace(':', ''),
               obsOS,
               STATUS_CHAMADO_COD['STANDBY'],
               'SIM',
               body.dadosOS.recurso,
               'SIM',
               tarefaInfo.RESPCLI_PROJETO,
               body.dadosOS.observacaoOS,
               'NAO',
               'NAO',
               dataInclusao,
               tarefaInfo.FATURA_TAREFA || 'SIM', // Usar valor da tarefa ou padrão
               100,
               'SIM',
               NUM_OS,
               0,
               competencia,
               codChamadoOS,
            ];

            await firebirdQuery(insertOSSQL, insertOSParams);

            responseData.os = {
               COD_OS,
               NUM_OS,
               codChamadoOS,
               tarefaUtilizada: tarefaDoChamado,
               message: 'OS criada com sucesso',
            };
         } catch (osError) {
            console.error('Erro ao criar OS:', osError);
            responseData.warning =
               'Status atualizado, mas houve erro ao criar a OS';
            responseData.osError =
               osError instanceof Error ? osError.message : 'Erro desconhecido';
         }
      }

      return NextResponse.json(responseData, { status: 200 });
   } catch (error) {
      console.error('Erro na operação:', error);

      if (error instanceof Error) {
         if (error.message.includes('violation of FOREIGN KEY constraint')) {
            return NextResponse.json(
               { error: 'Referência inválida' },
               { status: 400 }
            );
         }
         if (error.message.includes('lock conflict')) {
            return NextResponse.json(
               { error: 'Chamado em uso por outro usuário' },
               { status: 409 }
            );
         }
      }

      return NextResponse.json(
         { error: 'Erro interno na operação' },
         { status: 500 }
      );
   }
}
