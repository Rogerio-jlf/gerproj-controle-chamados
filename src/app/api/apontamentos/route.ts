import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { firebirdQuery } from '../../../lib/firebird/firebird-client';

interface ApontamentoData {
  codOS: string;
  dataInicioOS: string;
  horaInicioOS: string;
  horaFimOS: string;
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

    // Validação de horário (hora fim deve ser maior que hora início)
    if (body.horaInicioOS >= body.horaFimOS) {
      return NextResponse.json(
        { error: 'Hora fim deve ser maior que hora início' },
        { status: 400 }
      );
    }

    if (!body.observacaoOS?.trim()) {
      return NextResponse.json(
        { error: 'Observação é obrigatória' },
        { status: 400 }
      );
    }

    // Converter data para formato do Firebird (DD.MM.YYYY)
    const [ano, mes, dia] = body.dataInicioOS.split('-');
    const dataFormatada = `${dia}.${mes}.${ano}`;

    // SQL para atualizar campos específicos da OS existente
    const sql = `
      UPDATE OS SET
        DTINI_OS = ?,
        HRINI_OS = ?,
        HRFIM_OS = ?,
        OBS_OS = ?
      WHERE COD_OS = ?
    `;

    // MODO TESTE: Comentar a linha abaixo para não executar o UPDATE
    // const result = await firebirdQuery(sql, [
    //   dataFormatada,
    //   body.horaInicioOS,
    //   body.horaFimOS,
    //   body.observacaoOS.trim(),
    //   body.codOS
    // ]);

    // MODO TESTE: Simular resposta do banco
    console.log('TESTE - SQL que seria executado:', sql);
    console.log('TESTE - Parâmetros:', [
      dataFormatada,
      body.horaInicioOS,
      body.horaFimOS,
      body.observacaoOS.trim(),
      body.codOS,
    ]);

    return NextResponse.json(
      {
        message: 'Apontamento atualizado com sucesso',
        data: {
          codOS: body.codOS,
          observacaoOS: body.observacaoOS,
          dataInicioOS: body.dataInicioOS,
          horaInicioOS: body.horaInicioOS,
          horaFimOS: body.horaFimOS,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao salvar apontamento:', error);

    // Tratamento de erros específicos do Firebird
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
    }

    return NextResponse.json(
      { error: 'Erro interno ao salvar apontamento' },
      { status: 500 }
    );
  }
}
