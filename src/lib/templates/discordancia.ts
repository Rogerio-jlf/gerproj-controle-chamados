// src/lib/templates/discordancia.ts
interface TemplateDiscordanciaProps {
  os: string;
  cliente: string;
  status: string;
  data: string;
  motivo: string;
}

export const discordanciaTemplate = ({
  os,
  cliente,
  status,
  data,
  motivo,
}: TemplateDiscordanciaProps) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 20px; background-color: #fff; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
        .footer { margin-top: 20px; font-size: 12px; text-align: center; color: #777; }
        .alert { background-color: #fff3cd; padding: 10px; border-radius: 4px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Discordância no Chamado ${os}</h2>
        </div>
        <div class="content">
            <p><strong>Cliente:</strong> ${cliente}</p>
            <p><strong>OS:</strong> ${os}</p>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Data:</strong> ${data}</p>
            
            <div class="alert">
                <h3>Motivo da Discordância</h3>
                <p>${motivo}</p>
            </div>
            
            <p>Por favor, verifique este chamado com urgência.</p>
        </div>
        <div class="footer">
            <p>Este é um e-mail automático, por favor não responda.</p>
        </div>
    </div>
</body>
</html>
`;
