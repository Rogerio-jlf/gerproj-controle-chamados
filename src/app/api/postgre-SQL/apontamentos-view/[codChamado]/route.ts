// app/api/chamados/[chamadoOs]/route.ts
import { solutiiPrisma } from '@/lib/prisma/solutii-prisma';
import { NextResponse } from 'next/server';

// Função para calcular a duração em horas entre dois horários "HH:mm:ss"
function calcularHorasGastas(
  hrIni: string | null,
  hrFim: string | null
): number | null {
  if (!hrIni || !hrFim) return null;

  const [hIni, mIni, sIni] = hrIni.split(':').map(Number);
  const [hFim, mFim, sFim] = hrFim.split(':').map(Number);

  const inicio = new Date(0, 0, 0, hIni, mIni, sIni);
  const fim = new Date(0, 0, 0, hFim, mFim, sFim);

  const diffMs = fim.getTime() - inicio.getTime();
  if (diffMs < 0) return null; // evita resultados negativos

  const diffHoras = diffMs / 1000 / 60 / 60;

  return +diffHoras.toFixed(2); // ex: 4.5
}

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

    const duracaoHoras = calcularHorasGastas(
      chamado.hrini_os,
      chamado.hrfim_os
    );

    return NextResponse.json({
      ...chamado,
      duracaoHoras,
    });
  } catch (error) {
    console.error('Erro ao buscar chamado:', error);
    return new NextResponse('Erro no servidor', { status: 500 });
  }
}
