import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ codTarefa: string }> }
) {
  try {
    // ===========================================
    // AUTENTICAÇÃO JWT
    // ===========================================
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    let decoded: any;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'minha_chave_secreta'
      );
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const isAdmin = decoded.tipo === 'ADM';
    const codRecurso = decoded.recurso?.id;

    if (!isAdmin && !codRecurso) {
      return NextResponse.json(
        { error: 'Usuário não admin precisa ter codRecurso definido' },
        { status: 400 }
      );
    }

    // ===========================================
    // VALIDAÇÃO DOS PARÂMETROS
    // ===========================================
    // Aguarda o params antes de desestruturar
    const { codTarefa } = await context.params;

    // Validação do parâmetro
    if (!codTarefa) {
      return NextResponse.json(
        { error: 'Parâmetro codTarefa é obrigatório' },
        { status: 400 }
      );
    }

    // Validação básica do parâmetro
    if (isNaN(Number(codTarefa))) {
      return NextResponse.json(
        { error: 'Parâmetro codTarefa deve ser um número válido' },
        { status: 400 }
      );
    }

    // ===========================================
    // CONSTRUÇÃO DA QUERY COM AUTORIZAÇÃO
    // ===========================================
    let sql = `
      SELECT
        OS.COD_OS,
        OS.CODTRF_OS,
        OS.DTINI_OS,
        OS.HRINI_OS,
        OS.HRFIM_OS,
        OS.OBS_OS,
        OS.STATUS_OS,
        OS.PRODUTIVO_OS,
        OS.CODREC_OS,
        OS.PRODUTIVO2_OS,
        OS.RESPCLI_OS,
        OS.REMDES_OS,
        OS.ABONO_OS,
        OS.DESLOC_OS,
        OS.OBS,
        OS.DTINC_OS,
        OS.FATURADO_OS,
        OS.PERC_OS,
        OS.COD_FATURAMENTO,
        OS.COMP_OS,
        OS.VALID_OS,
        OS.VRHR_OS,
        OS.NUM_OS,
        OS.CHAMADO_OS
      FROM OS
      WHERE OS.CODTRF_OS = ?
    `;

    const queryParams = [Number(codTarefa)];

    // Se não for admin, adiciona filtro por recurso
    if (!isAdmin && codRecurso) {
      sql += ` AND OS.CODREC_OS = ?`;
      queryParams.push(codRecurso);
    }

    sql += ` ORDER BY OS.COD_OS`;

    // ===========================================
    // EXECUÇÃO DA QUERY
    // ===========================================
    const rawOsData = await firebirdQuery(sql, queryParams);

    // ===========================================
    // PROCESSAMENTO DOS DADOS
    // ===========================================
    // Função para calcular a diferença entre horários no formato CHAR (ex: "0800")
    const calculateHours = (
      hrini: string | null,
      hrfim: string | null
    ): number | null => {
      if (!hrini || !hrfim) return null;

      try {
        // Parse dos horários no formato HHMM (ex: "0800", "1230")
        const parseTime = (timeStr: string) => {
          // Remove espaços e garante que tenha 4 dígitos
          const cleanTime = timeStr.trim().padStart(4, '0');
          const hours = parseInt(cleanTime.substring(0, 2), 10);
          const minutes = parseInt(cleanTime.substring(2, 4), 10);
          return hours + minutes / 60;
        };

        const horaInicio = parseTime(hrini);
        const horaFim = parseTime(hrfim);

        let diferenca = horaFim - horaInicio;

        // Se a hora final for menor que a inicial, assumimos que passou para o próximo dia
        if (diferenca < 0) {
          diferenca += 24;
        }

        return Math.round(diferenca * 100) / 100; // Arredonda para 2 casas decimais
      } catch (error) {
        console.error('Erro ao calcular horas:', error, { hrini, hrfim });
        return null;
      }
    };

    // Adiciona o campo calculado a cada registro
    const osData = rawOsData.map((record: any) => ({
      ...record,
      QTD_HR_OS: calculateHours(record.HRINI_OS, record.HRFIM_OS),
    }));

    // ===========================================
    // RESPOSTA
    // ===========================================
    // Verifica se foram encontrados registros
    if (!osData || osData.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(osData, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar dados da OS por tarefa:', error);

    // Tratamento mais específico de erros
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Erro interno ao buscar dados da OS por tarefa',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno ao buscar dados da OS por tarefa' },
      { status: 500 }
    );
  }
}
