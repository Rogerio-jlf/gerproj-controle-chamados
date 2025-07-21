export function gerarTemplateEmailChamado({
  codChamado,
  nomeCliente,
  nomeRecurso,
}: {
  codChamado: number;
  nomeCliente?: string;
  nomeRecurso?: string;
}) {
  return {
    subject: `Você foi designado no chamado #${codChamado}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Chamado #${codChamado}</h2>
        <p>Você foi designado para o chamado <strong>#${codChamado}</strong>.</p>
        <p><strong>Cliente:</strong> ${nomeCliente || 'N/A'}</p>
        <p><strong>Recurso:</strong> ${nomeRecurso || 'N/A'}</p>
        <p>Acesse o sistema para mais detalhes.</p>
        <br />
        <p style="font-size: 12px; color: #888;">Este é um email automático. Não responda.</p>
      </div>
    `,
  };
}
