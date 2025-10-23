interface WhatsAppMessage {
   to: string;
   message: string;
}

interface WhatsAppResponse {
   success: boolean;
   messageId?: string;
   error?: string;
}

class WhatsAppClient {
   private apiUrl: string;
   private apiKey: string;
   private instanceId: string;

   constructor() {
      this.apiUrl = process.env.WHATSAPP_API_URL || '';
      this.apiKey = process.env.WHATSAPP_API_KEY || '';
      this.instanceId = process.env.WHATSAPP_INSTANCE_ID || '';
   }

   async enviarMensagem({
      to,
      message,
   }: WhatsAppMessage): Promise<WhatsAppResponse> {
      try {
         // Se WhatsApp não estiver configurado, retorna sucesso falso silenciosamente
         if (!this.apiUrl || !this.apiKey || !this.instanceId) {
            return { success: false, error: 'WhatsApp não configurado' };
         }

         const numeroFormatado = this.formatarNumero(to);

         if (!numeroFormatado) {
            return { success: false, error: 'Número inválido' };
         }

         // Payload correto conforme a API espera
         const payload = {
            instance: this.instanceId,
            type: 'text',
            content: {
               telephone: numeroFormatado,
               message: message,
            },
         };

         const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'x-api-key': this.apiKey,
            },
            body: JSON.stringify(payload),
         });

         const data = await response.json();

         if (!response.ok) {
            console.error('Erro na resposta WhatsApp:', data);
            throw new Error(
               data.message || `Erro ${response.status}: ${response.statusText}`
            );
         }

         return {
            success: true,
            messageId: data.messageId || data.id || 'success',
         };
      } catch (error) {
         console.error('Erro ao enviar WhatsApp:', error);
         return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido',
         };
      }
   }

   private formatarNumero(numero: string): string | null {
      // Remove todos os caracteres não numéricos
      const apenasNumeros = numero.replace(/\D/g, '');

      // Valida se tem pelo menos 10 dígitos
      if (apenasNumeros.length < 10 || apenasNumeros.length > 13) {
         console.warn(
            `Número inválido: ${numero} (${apenasNumeros.length} dígitos)`
         );
         return null;
      }

      // Se não tem código do país, adiciona 55 (Brasil)
      if (apenasNumeros.length === 10 || apenasNumeros.length === 11) {
         return `55${apenasNumeros}`;
      }

      return apenasNumeros;
   }

   // Método para testar a configuração
   async testarConexao(): Promise<boolean> {
      try {
         if (!this.apiUrl || !this.apiKey || !this.instanceId) {
            console.error('Configurações do WhatsApp ausentes');
            return false;
         }

         return true;
      } catch (error) {
         console.error('Erro ao testar conexão WhatsApp:', error);
         return false;
      }
   }
}

export const whatsappClient = new WhatsAppClient();
