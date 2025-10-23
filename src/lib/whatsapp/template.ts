interface DadosWhatsApp {
   codChamado: number;
   dataChamado: string;
   horaChamado: string;
   nomeRecurso: string;
   assuntoChamado: string;
}

export function gerarMensagemWhatsApp({
   codChamado,
   dataChamado,
   horaChamado,
   nomeRecurso,
   assuntoChamado,
}: DadosWhatsApp): string {
   return `🔔 *CHAMADO TÉCNICO ATRIBUÍDO*

✅ Seu Chamado foi Atribuído com Sucesso e já está sendo analisado.

📋 *Chamado nº: ${codChamado}
📅 *Data do Chamado: ${dataChamado}
🕒 *Hora do Chamado: ${horaChamado}
🛠️ *Consultor: ${nomeRecurso}
📝 *Assunto: 
${assuntoChamado}

_Mensagem automática do sistema_`;
}

// Templates adicionais para outros cenários (opcional)

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
