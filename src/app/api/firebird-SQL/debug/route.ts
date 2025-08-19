import { NextResponse } from 'next/server';
import { firebirdQuery } from '@/lib/firebird/firebird-client';

export async function GET(req: Request) {
  try {
    // Recebe query params ou usa padrão (exemplo)
    const { searchParams } = new URL(req.url);
    const dataInicio = searchParams.get('dataInicio') || '01.08.2025';
    const dataFim = searchParams.get('dataFim') || '01.09.2025';

    const query = `
      SELECT 
    r.COD_RECURSO,
    COALESCE(SUM(
        CASE 
            WHEN o.COD_OS IS NOT NULL
                 AND UPPER(TRIM(o.FATURADO_OS)) = 'SIM'
                 AND CHAR_LENGTH(TRIM(o.HRINI_OS)) = 4
                 AND CHAR_LENGTH(TRIM(o.HRFIM_OS)) = 4
                 AND o.DTINI_OS >= CAST(? AS DATE)
                 AND o.DTINI_OS < CAST(? AS DATE)
            THEN 
                (
                  (CAST(SUBSTRING(TRIM(o.HRFIM_OS) FROM 1 FOR 2) AS INTEGER) * 60
                   + CAST(SUBSTRING(TRIM(o.HRFIM_OS) FROM 3 FOR 2) AS INTEGER))
                  - (CAST(SUBSTRING(TRIM(o.HRINI_OS) FROM 1 FOR 2) AS INTEGER) * 60
                   + CAST(SUBSTRING(TRIM(o.HRINI_OS) FROM 3 FOR 2) AS INTEGER))
                  + CASE WHEN TRIM(o.HRFIM_OS) < TRIM(o.HRINI_OS) THEN 1440 ELSE 0 END
                ) / 60.0
            ELSE 0
        END
    ), 0) AS HORAS_FATURADAS,

    COALESCE(SUM(
        CASE 
            WHEN o.COD_OS IS NOT NULL
                 AND UPPER(TRIM(o.FATURADO_OS)) = 'NAO'
                 AND CHAR_LENGTH(TRIM(o.HRINI_OS)) = 4
                 AND CHAR_LENGTH(TRIM(o.HRFIM_OS)) = 4
                 AND o.DTINI_OS >= CAST(? AS DATE)
                 AND o.DTINI_OS < CAST(? AS DATE)
            THEN 
                (
                  (CAST(SUBSTRING(TRIM(o.HRFIM_OS) FROM 1 FOR 2) AS INTEGER) * 60
                   + CAST(SUBSTRING(TRIM(o.HRFIM_OS) FROM 3 FOR 2) AS INTEGER))
                  - (CAST(SUBSTRING(TRIM(o.HRINI_OS) FROM 1 FOR 2) AS INTEGER) * 60
                   + CAST(SUBSTRING(TRIM(o.HRINI_OS) FROM 3 FOR 2) AS INTEGER))
                  + CASE WHEN TRIM(o.HRFIM_OS) < TRIM(o.HRINI_OS) THEN 1440 ELSE 0 END
                ) / 60.0
            ELSE 0
        END
    ), 0) AS HORAS_NAO_FATURADAS

FROM RECURSO r
LEFT JOIN OS o ON o.CODREC_OS = r.COD_RECURSO
WHERE r.ATIVO_RECURSO = 1
GROUP BY r.COD_RECURSO
ORDER BY r.COD_RECURSO
    `;

    const params = [dataInicio, dataFim, dataInicio, dataFim];

    const resultados = await firebirdQuery(query, params);

    return NextResponse.json(resultados);
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { error: 'Erro ao consultar Firebird' },
      { status: 500 }
    );
  }
}
