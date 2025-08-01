// app/api/chamados/[chamadoOs]/route.ts
import { solutiiPrisma } from '@/lib/prisma/solutii-prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { chamadoOs: string } }
) {
  try {
    const chamadoOs = params.chamadoOs;

    const chamado = await solutiiPrisma.apontamentos.findFirst({
      where: {
        chamado_os: chamadoOs,
      },
    });

    if (!chamado) {
      return NextResponse.json(
        { error: 'Chamado não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(chamado);
  } catch (error) {
    console.error('Erro ao buscar chamado:', error);
    return new NextResponse('Erro no servidor', { status: 500 });
  }
}
