import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../lib/firebird/firebird-client';

export async function GET(request: Request) {
   try {
      const { searchParams } = new URL(request.url);
      const ano = searchParams.get('ano');
      const mes = searchParams.get('mes');
      const dataInicio = searchParams.get('dataInicio');
      const dataFim = searchParams.get('dataFim');

      let sql = `
         SELECT DISTINCT
            Cliente.COD_CLIENTE,
            Cliente.NOME_CLIENTE,
            Cliente.EMAIL_CLIENTE
         FROM CLIENTE Cliente
      `;

      const params: any[] = [];
      const conditions: string[] = ['Cliente.ATIVO_CLIENTE = 1'];

      // Se houver filtros de data, buscar apenas clientes com OS no período
      const hasDataInicio = dataInicio && dataInicio.trim() !== '';
      const hasDataFim = dataFim && dataFim.trim() !== '';
      const hasAno = ano && ano.trim() !== '';
      const hasMes = mes && mes.trim() !== '';

      if (hasDataInicio || hasDataFim || (hasAno && hasMes)) {
         sql += `
            INNER JOIN CHAMADO ON Cliente.COD_CLIENTE = CHAMADO.COD_CLIENTE
            INNER JOIN OS ON CHAMADO.COD_CHAMADO = OS.CHAMADO_OS
         `;

         // Aplicar filtros de data
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

      sql += ' WHERE ' + conditions.join(' AND ');
      sql += ' ORDER BY Cliente.NOME_CLIENTE ASC';

      const responseClientes = await firebirdQuery<{
         COD_CLIENTE: number;
         NOME_CLIENTE: string | null;
         EMAIL_CLIENTE: string | null;
      }>(sql, params);

      const clientes = responseClientes.map(cliente => ({
         cod_cliente: cliente.COD_CLIENTE,
         nome_cliente: cliente.NOME_CLIENTE?.trim() ?? '',
         email_cliente: cliente.EMAIL_CLIENTE?.trim() ?? '',
      }));

      return NextResponse.json(clientes, { status: 200 });
   } catch (error) {
      console.error('Erro ao tentar buscar os clientes:', error);
      return NextResponse.json(
         { error: 'Erro interno no servidor' },
         { status: 500 }
      );
   }
}
