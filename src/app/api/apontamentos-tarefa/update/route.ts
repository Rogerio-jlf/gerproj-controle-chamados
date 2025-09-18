import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';

interface ApontamentoData {
  codOS: string;
  dataInicioOS: string; // formato: YYYY-MM-DD
  horaInicioOS: string; // formato: HH:MM
  horaFimOS: string; // formato: HH:MM
  observacaoOS: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ApontamentoData = await request.json();

    // Validações
    if (!body.codOS) {
      return NextResponse.json(
        { error: 'Código da OS é obrigatório' },
        { status: 400 }
      );
    }
    if (!body.dataInicioOS) {
      return NextResponse.json(
        { error: 'Data do apontamento é obrigatória' },
        { status: 400 }
      );
    }
    if (!body.horaInicioOS || !body.horaFimOS) {
      return NextResponse.json(
        { error: 'Hora início e hora fim são obrigatórias' },
        { status: 400 }
      );
    }
    if (body.horaInicioOS >= body.horaFimOS) {
      return NextResponse.json(
        { error: 'Hora fim deve ser maior que hora início' },
        { status: 400 }
      );
    }
    if (!body.observacaoOS?.trim()) {
      return NextResponse.json(
        { error: 'Observação da OS é obrigatória' },
        { status: 400 }
      );
    }
    if (body.observacaoOS.trim().length > 200) {
      return NextResponse.json(
        { error: 'Observação não pode exceder 200 caracteres' },
        { status: 400 }
      );
    }

    // ✅ Formatar data para padrão aceito pelo Firebird: YYYY-MM-DD
    const [ano, mes, dia] = body.dataInicioOS.split('-');
    const dataFormatada = `${ano}-${mes}-${dia}`; // Firebird aceita este formato

    // ✅ Formatar hora para CHAR(4) -> ex.: "1500"
    const formatarHora = (hora: string): string => {
      const horaLimpa = hora.trim();
      if (!/^\d{2}:\d{2}$/.test(horaLimpa)) {
        throw new Error(`Formato de hora inválido: ${hora}`);
      }
      return horaLimpa.replace(':', ''); // remove os dois pontos
    };

    const horaInicioFormatada = formatarHora(body.horaInicioOS);
    const horaFimFormatada = formatarHora(body.horaFimOS);

    // ✅ Limitar observação para 200 caracteres
    const observacaoLimitada = body.observacaoOS.trim().substring(0, 200);

    // ✅ Query
    const sql = `
      UPDATE OS SET
        DTINI_OS = ?,
        HRINI_OS = ?,
        HRFIM_OS = ?,
        OBS_OS = ?
      WHERE COD_OS = ?
    `;

    const params = [
      dataFormatada, // DATE (YYYY-MM-DD)
      horaInicioFormatada, // CHAR(4)
      horaFimFormatada, // CHAR(4)
      observacaoLimitada, // VARCHAR(200)
      body.codOS,
    ];

    console.log('Parâmetros SQL:', {
      data: dataFormatada,
      horaInicio: horaInicioFormatada,
      horaFim: horaFimFormatada,
      observacao: `${observacaoLimitada.length} caracteres`,
      codOS: body.codOS,
    });

    await firebirdQuery(sql, params);

    return NextResponse.json(
      {
        message: 'Apontamento realizado com sucesso',
        data: {
          codOS: body.codOS,
          observacaoOS: observacaoLimitada,
          dataInicioOS: body.dataInicioOS,
          horaInicioOS: body.horaInicioOS,
          horaFimOS: body.horaFimOS,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao salvar Apontamento:', error);

    if (error instanceof Error) {
      if (error.message.includes('violation of FOREIGN KEY constraint')) {
        return NextResponse.json(
          { error: 'OS não encontrada' },
          { status: 400 }
        );
      }
      if (error.message.includes('lock conflict')) {
        return NextResponse.json(
          {
            error:
              'OS está sendo utilizada por outro usuário. Tente novamente.',
          },
          { status: 409 }
        );
      }
      if (
        error.message.includes('string truncation') ||
        error.message.includes('numeric overflow')
      ) {
        return NextResponse.json(
          { error: 'Dados excedem o tamanho permitido nos campos' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erro interno ao salvar Apontamento' },
      { status: 500 }
    );
  }
}
