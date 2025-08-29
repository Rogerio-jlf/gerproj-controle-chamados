import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🎯 Importa automaticamente baseado na variável de ambiente
const testMode = process.env.FIREBIRD_TEST_MODE === 'true';
const { firebirdQuery } = testMode
  ? require('../../../lib/firebird/firebird-test-mode')
  : require('../../../lib/firebird/firebird-client');

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
        { error: 'Hora início da OS e hora fim da OS são obrigatórias' },
        { status: 400 }
      );
    }

    // Validação de horário (hora fim deve ser maior que hora início)
    if (body.horaInicioOS >= body.horaFimOS) {
      return NextResponse.json(
        { error: 'Hora fim da OS deve ser maior que hora início da OS' },
        { status: 400 }
      );
    }

    if (!body.observacaoOS?.trim()) {
      return NextResponse.json(
        { error: 'Observação da OS é obrigatória' },
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

    const params = [
      dataFormatada,
      body.horaInicioOS,
      body.horaFimOS,
      body.observacaoOS.trim(),
      body.codOS,
    ];

    // 🔄 Executa o UPDATE (com rollback automático se testMode = true)
    const result = await firebirdQuery(sql, params);

    if (testMode) {
      console.log('[TEST MODE] SQL executado (com rollback):', sql);
      console.log('[TEST MODE] Parâmetros:', params);
    }

    return NextResponse.json(
      {
        message: `Apontamento ${testMode ? '[TESTE - SEM COMMIT]' : ''} realizado com sucesso`,
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
    console.error('Erro ao salvar Apontamento:', error);

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
      { error: 'Erro interno ao salvar Apontamento' },
      { status: 500 }
    );
  }
}
