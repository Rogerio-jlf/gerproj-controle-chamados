import { NextResponse } from 'next/server';
import { whatsappClient } from '@/lib/whatsapp/client';

export async function POST(request: Request) {
   const { telefone, mensagem } = await request.json();

   const resultado = await whatsappClient.enviarMensagem({
      to: telefone || '31988625920',
      message: mensagem || 'Teste de mensagem do sistema ✅',
   });

   return NextResponse.json(resultado);
}
