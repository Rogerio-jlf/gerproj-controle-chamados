// src/app/api/send-notification/route.ts
import transporter from '@/lib/email/transporter';
import { discordanciaTemplate } from '@/lib/templates/discordancia';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { chamado, observacao } = await request.json();

    // Validação dos dados
    if (!chamado || !observacao) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Preparar template de e-mail
    const emailHtml = discordanciaTemplate({
      os: chamado.chamado_os,
      cliente: chamado.nome_cliente,
      status: chamado.status_chamado,
      data: chamado.dtini_os,
      motivo: observacao,
    });

    // Configuração do e-mail
    const mailOptions = {
      from: `Sistema de Chamados <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || 'suporte@empresa.com',
      subject: `Discordância no Chamado ${chamado.chamado_os}`,
      html: emailHtml,
    };

    // Enviar e-mail
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: 'Notificações enviadas com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao enviar notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar a solicitação' },
      { status: 500 }
    );
  }
}
