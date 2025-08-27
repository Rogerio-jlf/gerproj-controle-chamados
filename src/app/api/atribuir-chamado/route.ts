import transporter from '@/lib/email/transporter';
import { gerarTemplateEmailChamado } from '@/lib/templates/email_atribuir_chamados';
import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../lib/firebird/firebird-test-mode';

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

    // 🔁 Modo de teste ativado por variável de ambiente
    const testMode = process.env.FIREBIRD_TEST_MODE === 'true';

    const updateSql = `
      UPDATE CHAMADO
      SET COD_CLIENTE = ?, COD_RECURSO = ?, STATUS_CHAMADO = 'ATRIBUIDO'
      WHERE COD_CHAMADO = ?
    `;
    const updateParams = [codClienteNum, codRecursoNum, codChamadoNum];

    await firebirdQuery(updateSql, updateParams, testMode);

    const destinatarios: string[] = [];

    let nomeCliente = 'Cliente';
    let nomeRecurso = 'Recurso';
    let emailCliente = '';
    let emailRecurso = '';

    if (enviarEmailCliente) {
      const clienteResult = await firebirdQuery(
        `SELECT FIRST 1 NOME_CLIENTE, EMAIL_CLIENTE FROM CLIENTE WHERE COD_CLIENTE = ?`,
        [codClienteNum]
      );
      if (clienteResult[0]?.EMAIL_CLIENTE) {
        emailCliente = clienteResult[0].EMAIL_CLIENTE;
        nomeCliente = clienteResult[0].NOME_CLIENTE;
        destinatarios.push(emailCliente);
      }
    }

    if (enviarEmailRecurso) {
      const recursoResult = await firebirdQuery(
        `SELECT FIRST 1 NOME_RECURSO, EMAIL_RECURSO FROM RECURSO WHERE COD_RECURSO = ?`,
        [codRecursoNum]
      );
      if (recursoResult[0]?.EMAIL_RECURSO) {
        emailRecurso = recursoResult[0].EMAIL_RECURSO;
        nomeRecurso = recursoResult[0].NOME_RECURSO;
        destinatarios.push(emailRecurso);
      }
    }

    if (destinatarios.length > 0) {
      const { subject, html } = gerarTemplateEmailChamado({
        codChamado: codChamadoNum,
        nomeCliente,
        nomeRecurso,
      });

      if (!testMode) {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: destinatarios.join(','),
          subject,
          html,
        });
      } else {
        console.log(
          '[TEST MODE] E-mail não enviado. Destinatários:',
          destinatarios
        );
      }
    }

    return NextResponse.json({
      message: `Chamado ${testMode ? '[TESTE - SEM COMMIT]' : ''} atualizado e e-mails ${testMode ? 'simulados' : 'enviados'}.`,
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
