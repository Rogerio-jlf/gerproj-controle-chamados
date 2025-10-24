// test-email-locaweb.ts
import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
   host: process.env.EMAIL_HOST,
   port: Number(process.env.EMAIL_PORT),
   secure: process.env.EMAIL_SECURE === 'true',
   auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
   },
   tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
   },
   debug: true, // Ativa logs detalhados
   logger: true, // Mostra informações de conexão
});

async function testarEmail() {
   console.log('🔍 Testando conexão SMTP Locaweb...\n');
   console.log('📋 Configurações:');
   console.log(`   Host: ${process.env.EMAIL_HOST}`);
   console.log(`   Port: ${process.env.EMAIL_PORT}`);
   console.log(`   Secure: ${process.env.EMAIL_SECURE}`);
   console.log(`   User: ${process.env.EMAIL_USER}`);
   console.log(`   From: ${process.env.EMAIL_FROM}\n`);

   try {
      // Testar conexão
      console.log('⏳ Verificando conexão SMTP...');
      await transporter.verify();
      console.log('✅ Conexão SMTP estabelecida com sucesso!\n');

      // Enviar email de teste
      console.log('📧 Enviando email de teste...\n');
      const info = await transporter.sendMail({
         from: process.env.EMAIL_FROM,
         to: 'rogerio.jlf@gmail.com', // Seu email para teste
         subject: 'Teste SMTP Locaweb - GerProj',
         html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h2 style="color: #0d9488; margin-bottom: 20px;">✅ Configuração SMTP Locaweb OK!</h2>
            <p style="color: #374151; line-height: 1.6;">Email enviado com sucesso através do servidor SMTP da Locaweb.</p>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-top: 20px;">
              <p style="margin: 5px 0;"><strong>Remetente:</strong> ${process.env.EMAIL_USER}</p>
              <p style="margin: 5px 0;"><strong>Servidor:</strong> ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}</p>
              <p style="margin: 5px 0;"><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              Este é um email de teste do sistema GerProj.
            </p>
          </div>
        </div>
      `,
      });

      console.log('✅ Email enviado com sucesso!');
      console.log('📬 Message ID:', info.messageId);
      console.log('📨 Aceito por:', info.accepted);

      if (info.rejected && info.rejected.length > 0) {
         console.warn('⚠️  Rejeitado por:', info.rejected);
      }

      console.log('\n✨ Teste concluído! Verifique sua caixa de entrada.');
   } catch (error) {
      console.error('\n❌ Erro ao enviar email:', error);

      if (error instanceof Error) {
         console.error('\n📋 Detalhes do erro:');
         console.error('Mensagem:', error.message);

         // Diagnóstico de erros comuns
         if (error.message.includes('EAUTH')) {
            console.error(
               '\n💡 Dica: Credenciais inválidas. Verifique EMAIL_USER e EMAIL_PASSWORD no .env'
            );
         } else if (error.message.includes('ECONNREFUSED')) {
            console.error(
               '\n💡 Dica: Não foi possível conectar ao servidor. Verifique EMAIL_HOST e EMAIL_PORT'
            );
         } else if (error.message.includes('ETIMEDOUT')) {
            console.error(
               '\n💡 Dica: Timeout de conexão. Verifique sua conexão de internet ou firewall'
            );
         } else if (error.message.includes('ENOTFOUND')) {
            console.error(
               '\n💡 Dica: Servidor não encontrado. Verifique o EMAIL_HOST'
            );
         }
      }

      process.exit(1);
   }
}

testarEmail();
