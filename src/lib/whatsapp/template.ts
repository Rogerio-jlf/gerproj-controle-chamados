// ============================================================
// TEMPLATES PARA ATRIBUIÇÃO DE CHAMADO
// ============================================================

interface DadosWhatsAppCliente {
   codChamado: number;
   dtEnvioChamado: string;
   nomeRecurso: string;
   assuntoChamado: string;
}

export function gerarMensagemWhatsAppCliente({
   codChamado,
   dtEnvioChamado,
   nomeRecurso,
   assuntoChamado,
}: DadosWhatsAppCliente): string {
   return `🔔 *CHAMADO TÉCNICO ATRIBUÍDO*

✅ Seu Chamado foi Atribuído com Sucesso e já está sendo analisado.

📋 *Chamado nº:* ${codChamado}
📅 *Data/Hora:* ${dtEnvioChamado}
🛠️ *Consultor:* ${nomeRecurso}
📝 *Assunto:*
${assuntoChamado}

_Mensagem automática do sistema_`;
}

interface DadosWhatsAppRecurso {
   codChamado: number;
   dataChamado: string;
   horaChamado: string;
   nomeCliente: string;
   assuntoChamado: string;
}

export function gerarMensagemWhatsAppRecurso({
   codChamado,
   dataChamado,
   horaChamado,
   nomeCliente,
   assuntoChamado,
}: DadosWhatsAppRecurso): string {
   return `🎫 *NOVO CHAMADO ATRIBUÍDO*

📋 *Chamado nº:* ${codChamado}
📅 *Data:* ${dataChamado}
🕒 *Hora:* ${horaChamado}
👤 *Cliente:* ${nomeCliente}
📝 *Assunto:*
${assuntoChamado}

⚡ Acesse o sistema para visualizar os detalhes completos.

_Mensagem automática do sistema_`;
}

// ============================================================
// TEMPLATES ADICIONAIS PARA OUTROS CENÁRIOS
// ============================================================

export function gerarMensagemChamadoConcluido(dados: {
   codChamado: number;
   nomeCliente: string;
   nomeRecurso: string;
}): string {
   return `✅ *CHAMADO CONCLUÍDO*

📋 *Chamado:* #${dados.codChamado}
👤 *Cliente:* ${dados.nomeCliente}
🛠️ *Técnico:* ${dados.nomeRecurso}

🎉 Seu chamado foi concluído com sucesso!

_Mensagem automática do sistema_`;
}

export function gerarMensagemChamadoEmAndamento(dados: {
   codChamado: number;
   nomeCliente: string;
   mensagem: string;
}): string {
   return `🔄 *ATUALIZAÇÃO DO CHAMADO*

📋 *Chamado:* #${dados.codChamado}
👤 *Cliente:* ${dados.nomeCliente}

💬 *Atualização:*
${dados.mensagem}

_Mensagem automática do sistema_`;
}

export function gerarMensagemChamadoCancelado(dados: {
   codChamado: number;
   nomeCliente: string;
   motivo?: string;
}): string {
   return `❌ *CHAMADO CANCELADO*

📋 *Chamado:* #${dados.codChamado}
👤 *Cliente:* ${dados.nomeCliente}

${dados.motivo ? `📝 *Motivo:* ${dados.motivo}` : ''}

_Mensagem automática do sistema_`;
}
