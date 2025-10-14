import { NextResponse } from 'next/server';
import transporter from '@/lib/email/transporter';
import { firebirdQuery } from '../../../../../lib/firebird/firebird-client';
import { gerarTemplateEmailChamado } from '@/lib/templates/email_atribuir_chamados';
import { whatsappClient } from '@/lib/whatsapp/client';
import { gerarMensagemWhatsApp } from '@/lib/whatsapp/template';

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

      // Formatar a data e hora atual no formato brasileiro: DD/MM/AAAA - HH:MM
      const agora = new Date();
      const dataFormatada =
         agora.toLocaleDateString('pt-BR') +
         ' - ' +
         agora.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
         });

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

         // Verificar se o assunto já não tem o prefixo do cliente para evitar duplicação
         if (!assuntoAtual.startsWith(`[${primeiroNome}]`)) {
            novoAssunto = `[${primeiroNome}] - ${assuntoAtual}`;
         }
      }

      const updateSql = `
      UPDATE CHAMADO
      SET COD_CLIENTE = ?, COD_RECURSO = ?, STATUS_CHAMADO = 'ATRIBUIDO', DTENVIO_CHAMADO = ?, ASSUNTO_CHAMADO = ?
      WHERE COD_CHAMADO = ?
    `;
      const updateParams = [
         codClienteNum,
         codRecursoNum,
         dataFormatada,
         novoAssunto,
         codChamadoNum,
      ];

      await firebirdQuery(updateSql, updateParams);

      const destinatarios: string[] = [];

      // Busca SEMPRE os nomes, independente de enviar email
      let nomeCliente = 'Cliente';
      let nomeRecurso = 'Recurso';
      let emailCliente = '';
      let emailRecurso = '';
      let celularCliente = '';
      let zapCliente = 'NAO';

      // Busca informações do cliente (ATUALIZADO para incluir WhatsApp)
      const clienteResult = await firebirdQuery(
         `SELECT FIRST 1 NOME_CLIENTE, EMAIL_CLIENTE, CEL_CLIENTE, ZAP_CLIENTE FROM CLIENTE WHERE COD_CLIENTE = ?`,
         [codClienteNum]
      );

      if (clienteResult[0]) {
         nomeCliente = clienteResult[0].NOME_CLIENTE || 'Cliente';
         emailCliente = clienteResult[0].EMAIL_CLIENTE || '';
         celularCliente = clienteResult[0].CEL_CLIENTE || '';
         zapCliente = clienteResult[0].ZAP_CLIENTE || 'NAO';

         // Só adiciona aos destinatários se quiser enviar email E tiver email
         if (enviarEmailCliente && emailCliente) {
            destinatarios.push(emailCliente);
         }
      }

      // Busca informações do recurso (mantém sua lógica original)
      const recursoResult = await firebirdQuery(
         `SELECT FIRST 1 NOME_RECURSO, EMAIL_RECURSO FROM RECURSO WHERE COD_RECURSO = ?`,
         [codRecursoNum]
      );

      if (recursoResult[0]) {
         nomeRecurso = recursoResult[0].NOME_RECURSO || 'Recurso';
         emailRecurso = recursoResult[0].EMAIL_RECURSO || '';

         // Só adiciona aos destinatários se quiser enviar email E tiver email
         if (enviarEmailRecurso && emailRecurso) {
            destinatarios.push(emailRecurso);
         }
      }

      // Variável para armazenar resultados das notificações
      const resultadosNotificacoes = {
         email: { enviado: false, erro: null as string | null },
         whatsapp: { enviado: false, erro: null as string | null },
      };

      // Envia email somente se houver destinatários (MANTÉM SUA LÓGICA)
      if (destinatarios.length > 0) {
         try {
            const { subject, html } = gerarTemplateEmailChamado({
               codChamado: codChamadoNum,
               nomeCliente,
               nomeRecurso,
            });

            await transporter.sendMail({
               from: process.env.EMAIL_FROM,
               to: destinatarios.join(','),
               subject,
               html,
            });

            resultadosNotificacoes.email.enviado = true;
         } catch (error) {
            console.error('Erro ao enviar email:', error);
            resultadosNotificacoes.email.erro =
               error instanceof Error ? error.message : 'Erro ao enviar email';
         }
      }

      // ================================================================================
      // NOVA FUNCIONALIDADE: ENVIO DE WHATSAPP
      // ================================================================================
      if (zapCliente === 'SIM' && celularCliente) {
         try {
            const mensagemWhatsApp = gerarMensagemWhatsApp({
               codChamado: codChamadoNum,
               nomeCliente,
               nomeRecurso,
               assuntoChamado: novoAssunto,
            });

            const resultadoWhatsApp = await whatsappClient.enviarMensagem({
               to: celularCliente,
               message: mensagemWhatsApp,
            });

            if (resultadoWhatsApp.success) {
               resultadosNotificacoes.whatsapp.enviado = true;

               // Opcional: Log no banco de dados
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
                  console.log(
                     'Erro ao registrar log WhatsApp (não crítico):',
                     logError
                  );
               }
            } else {
               resultadosNotificacoes.whatsapp.erro =
                  resultadoWhatsApp.error || 'Erro desconhecido';
            }
         } catch (error) {
            console.error('Erro ao enviar WhatsApp:', error);
            resultadosNotificacoes.whatsapp.erro =
               error instanceof Error
                  ? error.message
                  : 'Erro ao enviar WhatsApp';
         }
      }

      // Resposta com informações das notificações
      return NextResponse.json({
         message: 'Chamado atualizado com sucesso.',
         notificacoes: {
            email: {
               enviado: resultadosNotificacoes.email.enviado,
               destinatarios: destinatarios.length,
               erro: resultadosNotificacoes.email.erro,
            },
            whatsapp: {
               enviado: resultadosNotificacoes.whatsapp.enviado,
               habilitado: zapCliente === 'SIM',
               temCelular: !!celularCliente,
               erro: resultadosNotificacoes.whatsapp.erro,
            },
         },
      });
   } catch (error) {
      console.error('Erro ao configurar notificações:', error);
      return NextResponse.json(
         {
            error: 'Erro interno ao configurar notificações',
            message:
               error instanceof Error ? error.message : 'Erro desconhecido',
         },
         { status: 500 }
      );
   }
}
