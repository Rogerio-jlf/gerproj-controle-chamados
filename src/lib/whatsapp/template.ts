interface DadosWhatsApp {
   codChamado: number;
   nomeCliente: string;
   nomeRecurso: string;
   assuntoChamado: string;
}

export function gerarMensagemWhatsApp({
   codChamado,
   nomeCliente,
   nomeRecurso,
   assuntoChamado,
}: DadosWhatsApp): string {
   return `🔔 *CHAMADO ATRIBUÍDO*

📋 *Chamado:* #${codChamado}
👤 *Cliente:* ${nomeCliente}
🛠️ *Técnico:* ${nomeRecurso}

📝 *Assunto:*
${assuntoChamado}

✅ Seu chamado foi atribuído e está sendo processado.

_Mensagem automática do sistema_`;
}
