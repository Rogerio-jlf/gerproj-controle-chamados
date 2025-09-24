import { NextResponse } from 'next/server';
import transporter from '@/lib/email/transporter';
import { firebirdQuery } from '../../../lib/firebird/firebird-client';
import { gerarTemplateEmailChamado } from '@/lib/templates/email_atribuir_chamados';

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

      // Busca informações do cliente (sempre busca o nome)
      const clienteResult = await firebirdQuery(
         `SELECT FIRST 1 NOME_CLIENTE, EMAIL_CLIENTE FROM CLIENTE WHERE COD_CLIENTE = ?`,
         [codClienteNum]
      );

      if (clienteResult[0]) {
         nomeCliente = clienteResult[0].NOME_CLIENTE || 'Cliente';
         emailCliente = clienteResult[0].EMAIL_CLIENTE || '';

         // Só adiciona aos destinatários se quiser enviar email E tiver email
         if (enviarEmailCliente && emailCliente) {
            destinatarios.push(emailCliente);
         }
      }

      // Busca informações do recurso (sempre busca o nome)
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

      // Envia email somente se houver destinatários
      if (destinatarios.length > 0) {
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
      }

      return NextResponse.json({
         message: 'Chamado atualizado e e-mails enviados.',
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
