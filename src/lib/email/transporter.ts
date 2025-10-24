// src/lib/email/transporter.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
   host: process.env.EMAIL_HOST,
   port: Number(process.env.EMAIL_PORT),
   secure: process.env.EMAIL_SECURE === 'true', // false para porta 587
   auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
   },
   tls: {
      // Necessário para Locaweb
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
   },
   connectionTimeout: 10000, // 10 segundos
   greetingTimeout: 10000,
   socketTimeout: 20000,
});

// Verificar conexão ao iniciar
transporter.verify((error, success) => {
   if (error) {
      console.error('❌ Erro na configuração de email Locaweb:', error);
   } else {
      console.log('✅ Servidor SMTP Locaweb pronto para enviar mensagens');
   }
});

export default transporter;
