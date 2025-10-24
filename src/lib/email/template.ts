// src/lib/email/template.ts

/**
 * Template de email para o CONSULTOR (Recurso)
 * Informa que ele foi designado para atender um chamado
 */
export function gerarTemplateEmailConsultor({
   codChamado,
   dataChamado,
   horaChamado,
   nomeCliente,
   emailCliente,
   nomeRecurso,
   assuntoChamado,
}: {
   codChamado: number;
   dataChamado?: string;
   horaChamado?: string;
   nomeCliente?: string;
   emailCliente?: string;
   nomeRecurso?: string;
   assuntoChamado?: string;
}) {
   const codFormatado = String(codChamado).padStart(6, '0');

   return {
      subject: `Chamado #${codFormatado} - Você foi designado`,
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%); padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                        SOLUTII - GERPROJ
                      </h1>
                      <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">
                        Novo Chamado Atribuído
                      </p>
                    </td>
                  </tr>

                  <!-- Código do Chamado -->
                  <tr>
                    <td style="padding: 30px; text-align: center; background-color: #f9fafb;">
                      <div style="display: inline-block; background-color: #8b5cf6; color: #ffffff; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: bold;">
                        Chamado #${codFormatado}
                      </div>
                    </td>
                  </tr>

                  <!-- Conteúdo -->
                  <tr>
                    <td style="padding: 30px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                        Olá <strong>${nomeRecurso || 'Consultor'}</strong>! 👋
                      </p>
                      
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                        Você foi designado para atender um novo chamado. Confira os detalhes abaixo:
                      </p>

                      <!-- Informações -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                        ${
                           dataChamado
                              ? `
                        <tr>
                          <td style="padding: 12px; background-color: #f9fafb; border-left: 4px solid #8b5cf6;">
                            <strong style="color: #374151; font-size: 14px;">📅 Data do Chamado:</strong>
                            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">${dataChamado}</p>
                          </td>
                        </tr>
                        <tr><td style="height: 10px;"></td></tr>
                        `
                              : ''
                        }
                        
                        ${
                           horaChamado
                              ? `
                        <tr>
                          <td style="padding: 12px; background-color: #f9fafb; border-left: 4px solid #8b5cf6;">
                            <strong style="color: #374151; font-size: 14px;">🕐 Hora do Chamado:</strong>
                            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">${horaChamado}</p>
                          </td>
                        </tr>
                        <tr><td style="height: 10px;"></td></tr>
                        `
                              : ''
                        }
                        
                        <tr>
                          <td style="padding: 12px; background-color: #f9fafb; border-left: 4px solid #3b82f6;">
                            <strong style="color: #374151; font-size: 14px;">👤 Nome do Cliente:</strong>
                            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">${nomeCliente || 'Não informado'}</p>
                          </td>
                        </tr>
                        
                        ${
                           emailCliente
                              ? `
                        <tr><td style="height: 10px;"></td></tr>
                        <tr>
                          <td style="padding: 12px; background-color: #f9fafb; border-left: 4px solid #3b82f6;">
                            <strong style="color: #374151; font-size: 14px;">📧 Email do Cliente:</strong>
                            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;"><a href="mailto:${emailCliente}" style="color: #3b82f6; text-decoration: none;">${emailCliente}</a></p>
                          </td>
                        </tr>
                        `
                              : ''
                        }
                        
                        ${
                           assuntoChamado
                              ? `
                        <tr><td style="height: 10px;"></td></tr>
                        <tr>
                          <td style="padding: 12px; background-color: #f9fafb; border-left: 4px solid #f59e0b;">
                            <strong style="color: #374151; font-size: 14px;">📋 Assunto:</strong>
                            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">${assuntoChamado}</p>
                          </td>
                        </tr>
                        `
                              : ''
                        }
                      </table>

                      <!-- Call to Action -->
                      <!-- 
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" 
                               style="display: inline-block; background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                              Acessar Chamado
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                        Por favor, acesse o sistema para iniciar o atendimento e manter o cliente informado sobre o andamento.
                      </p>
                      -->
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
                      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                        Este é um email automático. Por favor, não responda.
                      </p>
                      <p style="margin: 10px 0 0 0; font-size: 12px; color: #9ca3af;">
                        © ${new Date().getFullYear()} Solutii Sistemas - Todos os direitos reservados
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
   };
}

/**
 * Template de email para o CLIENTE
 * Informa que o chamado dele foi atribuído a um consultor
 */
export function gerarTemplateEmailCliente({
   codChamado,
   dtEnvioChamado,
   nomeCliente,
   nomeRecurso,
   assuntoChamado,
}: {
   codChamado: number;
   dtEnvioChamado?: string;
   nomeCliente?: string;
   nomeRecurso?: string;
   assuntoChamado?: string;
}) {
   const codFormatado = String(codChamado).padStart(6, '0');

   return {
      subject: `Chamado #${codFormatado} - Atribuído ao Consultor`,
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                        SOLUTII - GERPROJ
                      </h1>
                      <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">
                        Atualização do seu Chamado
                      </p>
                    </td>
                  </tr>

                  <!-- Código do Chamado -->
                  <tr>
                    <td style="padding: 30px; text-align: center; background-color: #f9fafb;">
                      <div style="display: inline-block; background-color: #0d9488; color: #ffffff; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: bold;">
                        Chamado #${codFormatado}
                      </div>
                    </td>
                  </tr>

                  <!-- Conteúdo -->
                  <tr>
                    <td style="padding: 30px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                        Olá <strong>${nomeCliente || 'Cliente'}</strong>! 👋
                      </p>
                      
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                        Seu chamado foi atribuído a um consultor e está sendo analisado. Em breve você receberá um retorno.
                      </p>

                      <!-- Informações -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                        ${
                           dtEnvioChamado
                              ? `
                        <tr>
                          <td style="padding: 12px; background-color: #f9fafb; border-left: 4px solid #0d9488;">
                            <strong style="color: #374151; font-size: 14px;">📅 Data de Atribuição:</strong>
                            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">${dtEnvioChamado}</p>
                          </td>
                        </tr>
                        <tr><td style="height: 10px;"></td></tr>
                        `
                              : ''
                        }
                        
                        <tr>
                          <td style="padding: 12px; background-color: #f9fafb; border-left: 4px solid #3b82f6;">
                            <strong style="color: #374151; font-size: 14px;">👨‍💼 Consultor Responsável:</strong>
                            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">${nomeRecurso || 'Não informado'}</p>
                          </td>
                        </tr>
                        
                        ${
                           assuntoChamado
                              ? `
                        <tr><td style="height: 10px;"></td></tr>
                        <tr>
                          <td style="padding: 12px; background-color: #f9fafb; border-left: 4px solid #f59e0b;">
                            <strong style="color: #374151; font-size: 14px;">📋 Assunto do Chamado:</strong>
                            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">${assuntoChamado}</p>
                          </td>
                        </tr>
                        `
                              : ''
                        }
                        
                        <tr><td style="height: 10px;"></td></tr>
                        
                        <tr>
                          <td style="padding: 12px; background-color: #ecfdf5; border-left: 4px solid #10b981;">
                            <strong style="color: #374151; font-size: 14px;">✅ Status:</strong>
                            <p style="margin: 5px 0 0 0; color: #059669; font-size: 14px; font-weight: bold;">Em Atendimento</p>
                          </td>
                        </tr>
                      </table>

                      <!-- Call to Action -->
                      <!-- 
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" 
                               style="display: inline-block; background-color: #0d9488; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                              Acompanhar Chamado
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                        Acesse o sistema para acompanhar o andamento do seu chamado e visualizar atualizações em tempo real.
                      </p>
                      -->
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
                      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                        Este é um email automático. Por favor, não responda.
                      </p>
                      <p style="margin: 10px 0 0 0; font-size: 12px; color: #9ca3af;">
                        © ${new Date().getFullYear()} Solutii Sistemas - Todos os direitos reservados
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
   };
}

/**
 * Função legada mantida para compatibilidade
 * @deprecated Use gerarTemplateEmailConsultor ou gerarTemplateEmailCliente
 */
export function gerarTemplateEmailChamado(params: {
   codChamado: number;
   nomeCliente?: string;
   nomeRecurso?: string;
   assuntoChamado?: string;
}) {
   return gerarTemplateEmailConsultor(params);
}
