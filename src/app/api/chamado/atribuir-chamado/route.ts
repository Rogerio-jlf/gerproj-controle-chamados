import { NextResponse } from 'next/server';
import transporter from '@/lib/email/transporter';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';
import {
   gerarTemplateEmailCliente,
   gerarTemplateEmailConsultor,
} from '@/lib/email/template';
import { whatsappClient } from '@/lib/whatsapp/client';
import {
   gerarMensagemWhatsAppCliente,
   gerarMensagemWhatsAppRecurso,
} from '@/lib/whatsapp/template';

export async function POST(request: Request) {
   try {
      const body = await request.json();
      const {
         cod_chamado,
         cod_cliente,
         cod_recurso,
         enviarEmailCliente,
         enviarEmailRecurso,
      } = body;

      const codChamadoNum = Number(cod_chamado);
      const codClienteNum = Number(cod_cliente);
      const codRecursoNum = Number(cod_recurso);

      if (!codChamadoNum || !codClienteNum || !codRecursoNum) {
         return NextResponse.json(
            { error: 'Parâmetros obrigatórios ausentes ou inválidos' },
            { status: 400 }
         );
      }

      // Formatar a data e hora atual no formato brasileiro
      const agora = new Date();
      const dataFormatada = agora.toLocaleDateString('pt-BR');
      const horaFormatada = agora.toLocaleTimeString('pt-BR', {
         hour: '2-digit',
         minute: '2-digit',
      });
      const dtEnvioFormatada = `${dataFormatada} - ${horaFormatada}`;

      // Buscar o assunto atual do chamado
      const chamadoResult = await firebirdQuery(
         `SELECT FIRST 1 ASSUNTO_CHAMADO FROM CHAMADO WHERE COD_CHAMADO = ?`,
         [codChamadoNum]
      );

      if (!chamadoResult[0]) {
         return NextResponse.json(
            { error: 'Chamado não encontrado' },
            { status: 404 }
         );
      }

      const assuntoAtual = chamadoResult[0].ASSUNTO_CHAMADO || '';

      // Buscar informações do cliente para o assunto
      const clienteAssuntoResult = await firebirdQuery(
         `SELECT FIRST 1 NOME_CLIENTE FROM CLIENTE WHERE COD_CLIENTE = ?`,
         [codClienteNum]
      );

      let novoAssunto = assuntoAtual;
      if (clienteAssuntoResult[0] && clienteAssuntoResult[0].NOME_CLIENTE) {
         const nomeCompleto = clienteAssuntoResult[0].NOME_CLIENTE;
         const primeiroNome = nomeCompleto.split(' ')[0].toUpperCase();

         // Verificar se o assunto já não tem o prefixo do cliente
         if (!assuntoAtual.startsWith(`[${primeiroNome}]`)) {
            novoAssunto = `[${primeiroNome}] - ${assuntoAtual}`;
         }
      }

      // Atualizar o chamado no banco
      const updateSql = `
         UPDATE CHAMADO
         SET COD_CLIENTE = ?, COD_RECURSO = ?, STATUS_CHAMADO = 'ATRIBUIDO', 
             DTENVIO_CHAMADO = ?, ASSUNTO_CHAMADO = ?
         WHERE COD_CHAMADO = ?
      `;
      const updateParams = [
         codClienteNum,
         codRecursoNum,
         dtEnvioFormatada,
         novoAssunto,
         codChamadoNum,
      ];

      await firebirdQuery(updateSql, updateParams);

      // Buscar informações do cliente
      const clienteResult = await firebirdQuery(
         `SELECT FIRST 1 NOME_CLIENTE, EMAIL_CLIENTE, CEL_CLIENTE, ZAP_CLIENTE 
          FROM CLIENTE WHERE COD_CLIENTE = ?`,
         [codClienteNum]
      );

      let nomeCliente = 'Cliente';
      let emailCliente = '';
      let celularCliente = '';
      let zapCliente = 'NAO';

      if (clienteResult[0]) {
         nomeCliente = clienteResult[0].NOME_CLIENTE || 'Cliente';
         emailCliente = clienteResult[0].EMAIL_CLIENTE || '';
         celularCliente = clienteResult[0].CEL_CLIENTE || '';
         zapCliente = clienteResult[0].ZAP_CLIENTE || 'NAO';
      }

      // Buscar informações do recurso
      const recursoResult = await firebirdQuery(
         `SELECT FIRST 1 NOME_RECURSO, EMAIL_RECURSO, CEL_RECURSO FROM RECURSO WHERE COD_RECURSO = ?`,
         [codRecursoNum]
      );

      let nomeRecurso = 'Recurso';
      let emailRecurso = '';
      let celularRecurso = '';

      if (recursoResult[0]) {
         nomeRecurso = recursoResult[0].NOME_RECURSO || 'Recurso';
         emailRecurso = recursoResult[0].EMAIL_RECURSO || '';
         celularRecurso = recursoResult[0].CEL_RECURSO || '';
      }

      // Resultados das notificações
      const resultadosNotificacoes = {
         email: {
            enviado: false,
            erro: null as string | null,
            detalhes: {
               cliente: { enviado: false, erro: null as string | null },
               recurso: { enviado: false, erro: null as string | null },
            },
         },
         whatsapp: {
            cliente: { enviado: false, erro: null as string | null },
            recurso: { enviado: false, erro: null as string | null },
         },
      };

      // ============================================================
      // ENVIO DE EMAIL PARA O CLIENTE
      // ============================================================
      if (enviarEmailCliente && emailCliente) {
         try {
            console.log(`[EMAIL CLIENTE] Enviando para: ${emailCliente}`);

            const { subject, html } = gerarTemplateEmailCliente({
               codChamado: codChamadoNum,
               dtEnvioChamado: dtEnvioFormatada,
               nomeCliente,
               nomeRecurso,
               assuntoChamado: novoAssunto,
            });

            const emailInfo = await transporter.sendMail({
               from: process.env.EMAIL_FROM,
               to: emailCliente,
               subject,
               html,
            });

            resultadosNotificacoes.email.detalhes.cliente.enviado = true;
            resultadosNotificacoes.email.enviado = true;
            console.log(
               `[EMAIL CLIENTE] ✅ Enviado com sucesso! Message ID: ${emailInfo.messageId}`
            );
         } catch (error) {
            console.error('[EMAIL CLIENTE] ❌ Erro ao enviar:', error);
            resultadosNotificacoes.email.detalhes.cliente.erro =
               error instanceof Error ? error.message : 'Erro ao enviar email';
         }
      } else {
         const motivo = !enviarEmailCliente
            ? 'Envio não solicitado'
            : 'Email não cadastrado';
         console.log(`[EMAIL CLIENTE] ⏭️  ${motivo}`);
      }

      // ============================================================
      // ENVIO DE EMAIL PARA O RECURSO (CONSULTOR)
      // ============================================================
      if (enviarEmailRecurso && emailRecurso) {
         try {
            console.log(`[EMAIL RECURSO] Enviando para: ${emailRecurso}`);

            const { subject, html } = gerarTemplateEmailConsultor({
               codChamado: codChamadoNum,
               dataChamado: dataFormatada,
               horaChamado: horaFormatada,
               nomeCliente,
               emailCliente,
               nomeRecurso,
               assuntoChamado: novoAssunto,
            });

            const emailInfo = await transporter.sendMail({
               from: process.env.EMAIL_FROM,
               to: emailRecurso,
               subject,
               html,
            });

            resultadosNotificacoes.email.detalhes.recurso.enviado = true;
            resultadosNotificacoes.email.enviado = true;
            console.log(
               `[EMAIL RECURSO] ✅ Enviado com sucesso! Message ID: ${emailInfo.messageId}`
            );
         } catch (error) {
            console.error('[EMAIL RECURSO] ❌ Erro ao enviar:', error);
            resultadosNotificacoes.email.detalhes.recurso.erro =
               error instanceof Error ? error.message : 'Erro ao enviar email';
         }
      } else {
         const motivo = !enviarEmailRecurso
            ? 'Envio não solicitado'
            : 'Email não cadastrado';
         console.log(`[EMAIL RECURSO] ⏭️  ${motivo}`);
      }

      // ============================================================
      // ENVIO DE WHATSAPP PARA O CLIENTE
      // ============================================================
      if (zapCliente === 'SIM' && celularCliente) {
         try {
            console.log(`[WHATSAPP CLIENTE] Enviando para: ${celularCliente}`);

            const mensagemWhatsApp = gerarMensagemWhatsAppCliente({
               codChamado: codChamadoNum,
               dtEnvioChamado: dtEnvioFormatada,
               nomeRecurso,
               assuntoChamado: novoAssunto,
            });

            const resultadoWhatsApp = await whatsappClient.enviarMensagem({
               to: celularCliente,
               message: mensagemWhatsApp,
            });

            if (resultadoWhatsApp.success) {
               resultadosNotificacoes.whatsapp.cliente.enviado = true;
               console.log(
                  `[WHATSAPP CLIENTE] ✅ Enviado com sucesso! Message ID: ${resultadoWhatsApp.messageId}`
               );

               // Log no banco de dados
               try {
                  await firebirdQuery(
                     `INSERT INTO LOG_WHATSAPP (COD_CHAMADO, COD_CLIENTE, TELEFONE, MESSAGE_ID, STATUS_ENVIO, DATA_ENVIO) 
                      VALUES (?, ?, ?, ?, 'ENVIADO', CURRENT_TIMESTAMP)`,
                     [
                        codChamadoNum,
                        codClienteNum,
                        celularCliente,
                        resultadoWhatsApp.messageId || '',
                     ]
                  );
               } catch (logError) {
                  console.error(
                     '[WHATSAPP CLIENTE] Erro ao logar no banco:',
                     logError
                  );
               }
            } else {
               resultadosNotificacoes.whatsapp.cliente.erro =
                  resultadoWhatsApp.error || 'Erro desconhecido';
               console.error(
                  `[WHATSAPP CLIENTE] ❌ Falha no envio: ${resultadosNotificacoes.whatsapp.cliente.erro}`
               );
            }
         } catch (error) {
            console.error('[WHATSAPP CLIENTE] ❌ Erro ao enviar:', error);
            resultadosNotificacoes.whatsapp.cliente.erro =
               error instanceof Error
                  ? error.message
                  : 'Erro ao enviar WhatsApp';
         }
      } else {
         const motivo =
            zapCliente !== 'SIM'
               ? 'Cliente não tem WhatsApp habilitado'
               : 'Cliente não tem celular cadastrado';
         console.log(`[WHATSAPP CLIENTE] ⏭️  ${motivo}`);
      }

      // ============================================================
      // ENVIO DE WHATSAPP PARA O RECURSO
      // ============================================================
      // Envia automaticamente se o recurso tiver celular cadastrado
      if (celularRecurso) {
         try {
            console.log(`[WHATSAPP RECURSO] Enviando para: ${celularRecurso}`);

            const mensagemWhatsAppRecurso = gerarMensagemWhatsAppRecurso({
               codChamado: codChamadoNum,
               dataChamado: dataFormatada,
               horaChamado: horaFormatada,
               nomeCliente,
               assuntoChamado: novoAssunto,
            });

            const resultadoWhatsApp = await whatsappClient.enviarMensagem({
               to: celularRecurso,
               message: mensagemWhatsAppRecurso,
            });

            if (resultadoWhatsApp.success) {
               resultadosNotificacoes.whatsapp.recurso.enviado = true;
               console.log(
                  `[WHATSAPP RECURSO] ✅ Enviado com sucesso! Message ID: ${resultadoWhatsApp.messageId}`
               );

               // Log no banco de dados
               try {
                  await firebirdQuery(
                     `INSERT INTO LOG_WHATSAPP (COD_CHAMADO, COD_CLIENTE, TELEFONE, MESSAGE_ID, STATUS_ENVIO, DATA_ENVIO) 
                      VALUES (?, ?, ?, ?, 'ENVIADO', CURRENT_TIMESTAMP)`,
                     [
                        codChamadoNum,
                        codRecursoNum, // Para recurso, usa COD_RECURSO
                        celularRecurso,
                        resultadoWhatsApp.messageId || '',
                     ]
                  );
               } catch (logError) {
                  console.error(
                     '[WHATSAPP RECURSO] Erro ao logar no banco:',
                     logError
                  );
               }
            } else {
               resultadosNotificacoes.whatsapp.recurso.erro =
                  resultadoWhatsApp.error || 'Erro desconhecido';
               console.error(
                  `[WHATSAPP RECURSO] ❌ Falha no envio: ${resultadosNotificacoes.whatsapp.recurso.erro}`
               );
            }
         } catch (error) {
            console.error('[WHATSAPP RECURSO] ❌ Erro ao enviar:', error);
            resultadosNotificacoes.whatsapp.recurso.erro =
               error instanceof Error
                  ? error.message
                  : 'Erro ao enviar WhatsApp';
         }
      } else {
         console.log(
            `[WHATSAPP RECURSO] ⏭️  Recurso não tem celular cadastrado`
         );
      }

      // ============================================================
      // RESPOSTA
      // ============================================================
      return NextResponse.json({
         success: true,
         message: 'Chamado atualizado com sucesso.',
         chamado: {
            codigo: codChamadoNum,
            assunto: novoAssunto,
            cliente: nomeCliente,
            recurso: nomeRecurso,
         },
         notificacoes: {
            email: {
               enviado: resultadosNotificacoes.email.enviado,
               cliente: {
                  enviado:
                     resultadosNotificacoes.email.detalhes.cliente.enviado,
                  email: emailCliente || null,
                  erro: resultadosNotificacoes.email.detalhes.cliente.erro,
               },
               recurso: {
                  enviado:
                     resultadosNotificacoes.email.detalhes.recurso.enviado,
                  email: emailRecurso || null,
                  erro: resultadosNotificacoes.email.detalhes.recurso.erro,
               },
            },
            whatsapp: {
               cliente: {
                  enviado: resultadosNotificacoes.whatsapp.cliente.enviado,
                  habilitado: zapCliente === 'SIM',
                  telefone: celularCliente || null,
                  erro: resultadosNotificacoes.whatsapp.cliente.erro,
               },
               recurso: {
                  enviado: resultadosNotificacoes.whatsapp.recurso.enviado,
                  telefone: celularRecurso || null,
                  erro: resultadosNotificacoes.whatsapp.recurso.erro,
               },
            },
         },
      });
   } catch (error) {
      console.error('[API] ❌ Erro ao configurar notificações:', error);
      return NextResponse.json(
         {
            success: false,
            error: 'Erro interno ao configurar notificações',
            message:
               error instanceof Error ? error.message : 'Erro desconhecido',
         },
         { status: 500 }
      );
   }
}
