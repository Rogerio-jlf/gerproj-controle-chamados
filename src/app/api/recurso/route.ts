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
      const { searchParams } = new URL(request.url);
      const codRecurso = searchParams.get('codRecurso');
      const codCliente = searchParams.get('codCliente');
      const ano = searchParams.get('ano');
      const mes = searchParams.get('mes');
      const dataInicio = searchParams.get('dataInicio');
      const dataFim = searchParams.get('dataFim');

      let sql = `
         SELECT DISTINCT
            Recurso.COD_RECURSO,
            Recurso.NOME_RECURSO,
            Recurso.HRDIA_RECURSO,
            Recurso.CUSTO_RECURSO,
            Recurso.RECEITA_RECURSO,
            Recurso.TPCUSTO_RECURSO
         FROM RECURSO Recurso
      `;

      const params: any[] = [];
      const conditions: string[] = ['Recurso.ATIVO_RECURSO = 1'];

      // Se codCliente foi fornecido, buscar recursos que têm OS para esse cliente
      if (codCliente) {
         const codClienteNumber = Number(codCliente);
         if (isNaN(codClienteNumber)) {
            return NextResponse.json(
               { error: 'Código do cliente inválido' },
               { status: 400 }
            );
         }

         sql += `
            INNER JOIN OS ON Recurso.COD_RECURSO = OS.CODREC_OS
            INNER JOIN CHAMADO ON OS.CHAMADO_OS = CHAMADO.COD_CHAMADO
         `;

         conditions.push('CHAMADO.COD_CLIENTE = ?');
         params.push(codClienteNumber);

         // Filtros de data (apenas quando há cliente selecionado e valores válidos)
         const hasDataInicio = dataInicio && dataInicio.trim() !== '';
         const hasDataFim = dataFim && dataFim.trim() !== '';
         const hasAno = ano && ano.trim() !== '';
         const hasMes = mes && mes.trim() !== '';

         if (hasDataInicio && hasDataFim) {
            conditions.push('OS.DTINI_OS BETWEEN ? AND ?');
            params.push(dataInicio, dataFim);
         } else if (hasAno && hasMes) {
            const anoNum = Number(ano);
            const mesNum = Number(mes);
            if (!isNaN(anoNum) && !isNaN(mesNum)) {
               conditions.push('EXTRACT(YEAR FROM OS.DTINI_OS) = ?');
               conditions.push('EXTRACT(MONTH FROM OS.DTINI_OS) = ?');
               params.push(anoNum, mesNum);
            }
         } else if (hasDataInicio) {
            conditions.push('OS.DTINI_OS >= ?');
            params.push(dataInicio);
         } else if (hasDataFim) {
            conditions.push('OS.DTINI_OS <= ?');
            params.push(dataFim);
         }
      }

      // Se codRecurso foi fornecido, adicionar ao filtro
      if (codRecurso) {
         const codRecursoNumber = Number(codRecurso);
         if (isNaN(codRecursoNumber)) {
            return NextResponse.json(
               { error: 'Código do recurso inválido' },
               { status: 400 }
            );
         }
         conditions.push('Recurso.COD_RECURSO = ?');
         params.push(codRecursoNumber);
      }

      sql += ' WHERE ' + conditions.join(' AND ');
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
