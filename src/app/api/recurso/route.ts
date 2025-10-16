import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../lib/firebird/firebird-client';

// Converte "0730" → 7.5
function converterHoraParaDecimal(hora: string): number {
   const match = hora.match(/^(\d{2})(\d{2})$/);
   if (!match) return 0;
   const horas = parseInt(match[1], 10);
   const minutos = parseInt(match[2], 10);
   return horas + minutos / 60;
}

// Converte "0730" → "07:30"
function converterHoraParaHHmm(hora: string): string {
   const match = hora.match(/^(\d{2})(\d{2})$/);
   if (!match) return '00:00';
   return `${match[1]}:${match[2]}`;
}

export async function GET(request: Request) {
   try {
      // Pega parâmetros da query
      const { searchParams } = new URL(request.url);
      const codRecurso = searchParams.get('codRecurso');

      let sql = `
      SELECT DISTINCT
        Recurso.COD_RECURSO,
        Recurso.NOME_RECURSO,
        Recurso.HRDIA_RECURSO,
        Recurso.CUSTO_RECURSO,
        Recurso.RECEITA_RECURSO,
        Recurso.TPCUSTO_RECURSO,
        tarefa.CODREC_TAREFA
      FROM RECURSO Recurso
      LEFT JOIN TAREFA tarefa ON Recurso.COD_RECURSO = tarefa.CODREC_TAREFA
      WHERE Recurso.ATIVO_RECURSO = 1
    `;

      const params: any[] = [];

      // Se codRecurso foi fornecido, filtrar por ele
      if (codRecurso) {
         const codRecursoNumber = Number(codRecurso);
         if (isNaN(codRecursoNumber)) {
            return NextResponse.json(
               { error: 'Código do recurso inválido' },
               { status: 400 }
            );
         }
         sql += ' AND Recurso.COD_RECURSO = ?';
         params.push(codRecursoNumber);
      }

      sql += ' ORDER BY Recurso.NOME_RECURSO ASC';

      const responseRecursos = await firebirdQuery<{
         COD_RECURSO: number;
         NOME_RECURSO: string;
         HRDIA_RECURSO: string | null;
         CUSTO_RECURSO: number | null;
         RECEITA_RECURSO: number | null;
         TPCUSTO_RECURSO: number | null;
      }>(sql, params);

      const recursos = responseRecursos.map(recurso => {
         const horaBruta = recurso.HRDIA_RECURSO?.trim() ?? '';

         return {
            cod_recurso: recurso.COD_RECURSO,
            nome_recurso: recurso.NOME_RECURSO.trim(),
            hrdia_decimal: horaBruta ? converterHoraParaDecimal(horaBruta) : 0,
            hrdia_formatado: horaBruta
               ? converterHoraParaHHmm(horaBruta)
               : '00:00',
            custo_recurso: recurso.CUSTO_RECURSO ?? 0,
            receita_recurso: recurso.RECEITA_RECURSO ?? 0,
            tpcusto_recurso: recurso.TPCUSTO_RECURSO ?? 0,
         };
      });

      return NextResponse.json(recursos, { status: 200 });
   } catch (error) {
      console.error('Erro ao tentar buscar os recursos:', error);
      return NextResponse.json(
         { error: 'Erro interno no servidor' },
         { status: 500 }
      );
   }
}
