import transporter from '@/lib/email/transporter';
import { gerarTemplateEmailChamado } from '@/lib/templates/email_atribuir_chamados';
import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../lib/firebird/firebird-client';

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

    const updateSql = `
      UPDATE CHAMADO
      SET COD_CLIENTE = ?, COD_RECURSO = ?, STATUS_CHAMADO = 'ATRIBUIDO'
      WHERE COD_CHAMADO = ?
    `;
    const updateParams = [codClienteNum, codRecursoNum, codChamadoNum];

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
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
