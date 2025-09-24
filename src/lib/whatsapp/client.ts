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
         if (!this.apiUrl || !this.apiKey) {
            console.log('WhatsApp não configurado, pulando envio');
            return { success: false, error: 'WhatsApp não configurado' };
         }

         const numeroFormatado = this.formatarNumero(to);

         if (!numeroFormatado) {
            return { success: false, error: 'Número inválido' };
         }

         const payload = {
            number: numeroFormatado,
            message: message,
            instance: this.instanceId,
         };

         const response = await fetch(`${this.apiUrl}/send-message`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(payload),
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao enviar WhatsApp');
         }

         const data = await response.json();

         return {
            success: true,
            messageId: data.messageId,
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
         return null;
      }

      // Se não tem código do país, adiciona 55 (Brasil)
      if (apenasNumeros.length === 10 || apenasNumeros.length === 11) {
         return `55${apenasNumeros}`;
      }

      return apenasNumeros;
   }
}

export const whatsappClient = new WhatsAppClient();
