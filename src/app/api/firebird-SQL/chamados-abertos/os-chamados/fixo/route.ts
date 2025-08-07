import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../../../lib/firebird/firebird-client';

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

    // Construindo intervalo de datas
    const dataInicio = `${anoParam}-${String(mesParam).padStart(2, '0')}-01`;
    const dataFim = `${anoParam}-${String(mesParam + 1).padStart(2, '0')}-01`;

    const query = `
      SELECT 
        r.COD_RECURSO,
        r.NOME_RECURSO,
        r.TPCUSTO_RECURSO,
        SUM(
          CASE WHEN o.FATURADO_OS = 'SIM' THEN 
            (
              CAST(SUBSTRING(o.HRFIM_OS FROM 1 FOR 2) AS INTEGER) + 
              CAST(SUBSTRING(o.HRFIM_OS FROM 3 FOR 2) AS INTEGER) / 60.0
            ) - (
              CAST(SUBSTRING(o.HRINI_OS FROM 1 FOR 2) AS INTEGER) + 
              CAST(SUBSTRING(o.HRINI_OS FROM 3 FOR 2) AS INTEGER) / 60.0
            )
          ELSE 0 END
        ) AS HORAS_FATURADAS,
        
        SUM(
          CASE WHEN o.FATURADO_OS = 'NAO' THEN 
            (
              CAST(SUBSTRING(o.HRFIM_OS FROM 1 FOR 2) AS INTEGER) + 
              CAST(SUBSTRING(o.HRFIM_OS FROM 3 FOR 2) AS INTEGER) / 60.0
            ) - (
              CAST(SUBSTRING(o.HRINI_OS FROM 1 FOR 2) AS INTEGER) + 
              CAST(SUBSTRING(o.HRINI_OS FROM 3 FOR 2) AS INTEGER) / 60.0
            )
          ELSE 0 END
        ) AS HORAS_NAO_FATURADAS

      FROM RECURSO r
      LEFT JOIN OS o ON o.CODREC_OS = r.COD_RECURSO
        AND o.DTINI_OS >= ? AND o.DTINI_OS < ?
      WHERE 
        r.ATIVO_RECURSO = 1
        AND r.TPCUSTO_RECURSO = 1
      GROUP BY r.COD_RECURSO, r.NOME_RECURSO, r.TPCUSTO_RECURSO
      ORDER BY r.COD_RECURSO
    `;

    const result = await firebirdQuery(query, [dataInicio, dataFim]);

    const recursos = result.map((item: any) => {
      const horasFaturadas = Number(item.HORAS_FATURADAS || 0);
      const horasNaoFaturadas = Number(item.HORAS_NAO_FATURADAS || 0);
      const totalHoras = horasFaturadas + horasNaoFaturadas;

      return {
        cod_recurso: item.COD_RECURSO,
        nome_recurso: item.NOME_RECURSO.trim(),
        tipo_custo_recurso: item.TPCUSTO_RECURSO,
        quantidade_horas_faturadas: horasFaturadas,
        quantidade_horas_nao_faturadas: horasNaoFaturadas,
        quantidade_horas_executadas: Number(totalHoras.toFixed(2)),
      };
    });

    // Somando totais gerais
    const totalHorasFaturadas = recursos.reduce(
      (acc, cur) => acc + cur.quantidade_horas_faturadas,
      0
    );

    const totalHorasNaoFaturadas = recursos.reduce(
      (acc, cur) => acc + cur.quantidade_horas_nao_faturadas,
      0
    );

    const totalHorasExecutadas = totalHorasFaturadas + totalHorasNaoFaturadas;

    return NextResponse.json({
      data_recursos_fixos_os_chamado: recursos,
      total_horas_faturadas: Number(totalHorasFaturadas.toFixed(2)),
      total_horas_nao_faturadas: Number(totalHorasNaoFaturadas.toFixed(2)),
      total_horas_executadas: Number(totalHorasExecutadas.toFixed(2)),
    });
  } catch (error) {
    console.error('Erro ao calcular horas de OS:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
