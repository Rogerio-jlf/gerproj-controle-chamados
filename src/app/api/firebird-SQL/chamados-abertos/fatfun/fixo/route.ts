import { NextResponse } from 'next/server';
import { firebirdQuery } from '@/lib/firebird/firebird-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const mesParam = Number(searchParams.get('mes'));
    const anoParam = Number(searchParams.get('ano'));

    if (!mesParam || mesParam < 1 || mesParam > 12) {
      return NextResponse.json(
        { error: "Parâmetro 'mes' inválido" },
        { status: 400 }
      );
    }

    if (!anoParam || anoParam < 2000 || anoParam > 3000) {
      return NextResponse.json(
        { error: "Parâmetro 'ano' inválido" },
        { status: 400 }
      );
    }

    const mesAno = `${String(mesParam).padStart(2, '0')}/${anoParam}`;

    // Construindo intervalo de datas para consulta de horas
    const dataInicio = `${anoParam}-${String(mesParam).padStart(2, '0')}-01`;
    const dataFim = `${anoParam}-${String(mesParam + 1).padStart(2, '0')}-01`;

    // Query para buscar salários dos recursos
    const querySalarios = `
      SELECT 
        r.COD_RECURSO,
        r.NOME_RECURSO,
        r.TPCUSTO_RECURSO,
        SUM(f.VRSAL_FATFUN) AS TOTAL_SALARIO
      FROM 
        RECURSO r
      LEFT JOIN 
        FATFUN f ON f.COD_RECURSO = r.COD_RECURSO AND f.MESANO_FATFUN = ?
      WHERE 
        r.ATIVO_RECURSO = 1 AND r.TPCUSTO_RECURSO = 1
      GROUP BY 
        r.COD_RECURSO, r.NOME_RECURSO, r.TPCUSTO_RECURSO
      ORDER BY 
        r.COD_RECURSO
    `;

    // Query para buscar horas executadas dos recursos
    const queryHoras = `
      SELECT 
        r.COD_RECURSO,
        COALESCE(SUM(
          CASE WHEN o.FATURADO_OS = 'SIM' THEN 
            (
              CAST(SUBSTRING(o.HRFIM_OS FROM 1 FOR 2) AS INTEGER) + 
              CAST(SUBSTRING(o.HRFIM_OS FROM 3 FOR 2) AS INTEGER) / 60.0
            ) - (
              CAST(SUBSTRING(o.HRINI_OS FROM 1 FOR 2) AS INTEGER) + 
              CAST(SUBSTRING(o.HRINI_OS FROM 3 FOR 2) AS INTEGER) / 60.0
            )
          ELSE 0 END
        ), 0) AS HORAS_FATURADAS,
        
        COALESCE(SUM(
          CASE WHEN o.FATURADO_OS = 'NAO' THEN 
            (
              CAST(SUBSTRING(o.HRFIM_OS FROM 1 FOR 2) AS INTEGER) + 
              CAST(SUBSTRING(o.HRFIM_OS FROM 3 FOR 2) AS INTEGER) / 60.0
            ) - (
              CAST(SUBSTRING(o.HRINI_OS FROM 1 FOR 2) AS INTEGER) + 
              CAST(SUBSTRING(o.HRINI_OS FROM 3 FOR 2) AS INTEGER) / 60.0
            )
          ELSE 0 END
        ), 0) AS HORAS_NAO_FATURADAS

      FROM RECURSO r
      LEFT JOIN OS o ON o.CODREC_OS = r.COD_RECURSO
        AND o.DTINI_OS >= ? AND o.DTINI_OS < ?
        AND o.HRINI_OS IS NOT NULL 
        AND o.HRFIM_OS IS NOT NULL
        AND o.HRINI_OS <> ''
        AND o.HRFIM_OS <> ''
      WHERE 
        r.ATIVO_RECURSO = 1
      GROUP BY r.COD_RECURSO
      ORDER BY r.COD_RECURSO
    `;

    // Query para buscar total de despesas
    const queryDespesas = `
      SELECT 
        SUM(VRDESP_FATDES) AS TOTAL_DESPESAS
      FROM 
        FATDES
      WHERE 
        MESANO_FATDES = ?
    `;

    // Query para buscar agendamentos e horas disponíveis
    const queryAgendamentos = `
      SELECT
        r.COD_RECURSO,
        r.NOME_RECURSO,
        r.HRDIA_RECURSO,
        COUNT(DISTINCT a.DATA_AGENREC) AS TOTAL_DIAS_MES
      FROM RECURSO r
      JOIN AGENREC a ON a.COD_RECURSO = r.COD_RECURSO
        AND a.DATA_AGENREC >= ? AND a.DATA_AGENREC < ?
      WHERE 
        r.ATIVO_RECURSO = 1        
      GROUP BY r.COD_RECURSO, r.NOME_RECURSO, r.HRDIA_RECURSO
      ORDER BY r.COD_RECURSO
    `;

    // Executando as quatro consultas
    const [resultSalarios, resultHoras, resultDespesas, resultAgendamentos] =
      await Promise.all([
        firebirdQuery(querySalarios, [mesAno]),
        firebirdQuery(queryHoras, [dataInicio, dataFim]),
        firebirdQuery(queryDespesas, [mesAno]),
        firebirdQuery(queryAgendamentos, [dataInicio, dataFim]),
      ]);

    // Processando dados de horas para facilitar o lookup
    const horasMap = new Map();
    let totalHorasExecutadasGeral = 0;

    resultHoras.forEach((item: any) => {
      const horasFaturadas = Number(item.HORAS_FATURADAS || 0);
      const horasNaoFaturadas = Number(item.HORAS_NAO_FATURADAS || 0);
      const totalHorasRecurso = horasFaturadas + horasNaoFaturadas;

      horasMap.set(item.COD_RECURSO, {
        horasFaturadas,
        horasNaoFaturadas,
        totalHorasRecurso,
      });
      totalHorasExecutadasGeral += totalHorasRecurso;
    });

    // Extraindo total de despesas
    const totalDespesas = Number(resultDespesas[0]?.TOTAL_DESPESAS || 0);

    // Processando dados de agendamentos para facilitar o lookup
    const agendamentosMap = new Map();
    resultAgendamentos.forEach((item: any) => {
      const totalDiasMes = Number(item.TOTAL_DIAS_MES || 0);

      // Convertendo HRDIA_RECURSO de formato de tempo para decimal
      let hrDiaRecurso = 0;
      const hrDiaStr = String(item.HRDIA_RECURSO || '0');

      if (hrDiaStr.includes(':')) {
        // Formato HH:MM
        const [horas, minutos] = hrDiaStr.split(':').map(Number);
        hrDiaRecurso = horas + minutos / 60;
      } else if (hrDiaStr.length === 4) {
        // Formato HHMM (ex: 0848 para 08:48)
        const horas = Math.floor(Number(hrDiaStr) / 100);
        const minutos = Number(hrDiaStr) % 100;
        hrDiaRecurso = horas + minutos / 60;
      } else {
        // Formato decimal ou outros
        hrDiaRecurso = Number(hrDiaStr);
      }

      const horasDisponiveis = totalDiasMes * hrDiaRecurso;

      agendamentosMap.set(item.COD_RECURSO, {
        totalDiasMes,
        hrDiaRecurso,
        horasDisponiveis,
      });
    });

    // Processando salários e adicionando peso do recurso e despesa rateio
    const salarios = resultSalarios.map((item: any) => {
      const totalSalario =
        item.TOTAL_SALARIO !== null ? Number(item.TOTAL_SALARIO) : 0;

      // Dados de horas
      const dadosHoras = horasMap.get(item.COD_RECURSO) || {
        horasFaturadas: 0,
        horasNaoFaturadas: 0,
        totalHorasRecurso: 0,
      };

      const quantidadeHorasExecutadas = dadosHoras.totalHorasRecurso;
      const pesoRecurso =
        totalHorasExecutadasGeral > 0
          ? Number(
              (quantidadeHorasExecutadas / totalHorasExecutadasGeral).toFixed(4)
            )
          : 0;

      const despesaRateio = Number((totalDespesas * pesoRecurso).toFixed(2));

      // Dados de agendamentos
      const dadosAgendamento = agendamentosMap.get(item.COD_RECURSO) || {
        totalDiasMes: 0,
        hrDiaRecurso: 0,
        horasDisponiveis: 0,
      };

      return {
        cod_recurso: item.COD_RECURSO,
        nome_recurso: item.NOME_RECURSO?.trim() || '',
        tipo_recurso: item.TPCUSTO_RECURSO,
        salario_recurso: Number(totalSalario.toFixed(2)),
        quantidade_horas_faturadas: Number(
          dadosHoras.horasFaturadas.toFixed(2)
        ),
        quantidade_horas_nao_faturadas: Number(
          dadosHoras.horasNaoFaturadas.toFixed(2)
        ),
        quantidade_horas_executadas: Number(
          quantidadeHorasExecutadas.toFixed(2)
        ),
        quantidade_horas_disponiveis: Number(
          dadosAgendamento.horasDisponiveis.toFixed(2)
        ),
        peso_recurso: pesoRecurso,
        despesa_rateio: despesaRateio,
        valor_total_produzir: Number((totalSalario + despesaRateio).toFixed(2)),
      };
    });

    const totalGeralSalarios = salarios.reduce(
      (acc, cur) => acc + cur.salario_recurso,
      0
    );

    const totalDespesaRateio = salarios.reduce(
      (acc, cur) => acc + cur.despesa_rateio,
      0
    );

    const totalHorasDisponiveis = salarios.reduce(
      (acc, cur) => acc + cur.quantidade_horas_disponiveis,
      0
    );

    const totalHorasFaturadas = salarios.reduce(
      (acc, cur) => acc + cur.quantidade_horas_faturadas,
      0
    );

    const totalHorasNaoFaturadas = salarios.reduce(
      (acc, cur) => acc + cur.quantidade_horas_nao_faturadas,
      0
    );

    const quantidadeRecursos = salarios.length;

    const mediaCustosRecurso =
      salarios.length > 0 ? totalGeralSalarios / salarios.length : 0;

    return NextResponse.json({
      data_recursos_fixos: salarios,
      total_custos_recursos_fixos: totalGeralSalarios.toFixed(2),
      quantidade_recursos_fixos: quantidadeRecursos,
      media_custos_recursos_fixos: mediaCustosRecurso.toFixed(2),
      total_horas_faturadas: Number(totalHorasFaturadas.toFixed(2)),
      total_horas_nao_faturadas: Number(totalHorasNaoFaturadas.toFixed(2)),
      total_horas_executadas: Number(totalHorasExecutadasGeral.toFixed(2)),
      total_horas_disponiveis: Number(totalHorasDisponiveis.toFixed(2)),
      total_despesas: totalDespesas.toFixed(2),
      total_despesa_rateio: totalDespesaRateio.toFixed(2),
    });
  } catch (error) {
    console.error('Erro ao buscar salários dos recursos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
