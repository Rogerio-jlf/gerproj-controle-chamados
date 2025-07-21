import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';

export async function GET() {
  try {
    const sql = `
      SELECT DISTINCT
        Cliente.COD_CLIENTE,
        Cliente.NOME_CLIENTE,
        Cliente.EMAIL_CLIENTE
      FROM CLIENTE Cliente
      WHERE Cliente.ATIVO_CLIENTE = 1
      ORDER BY Cliente.NOME_CLIENTE ASC
    `;

    const responseClientes = await firebirdQuery<{
      COD_CLIENTE: number;
      NOME_CLIENTE: string | null;
      EMAIL_CLIENTE: string | null;
    }>(sql);

    const clientes = responseClientes.map((cliente) => ({
      cod_cliente: cliente.COD_CLIENTE,
      nome_cliente: cliente.NOME_CLIENTE?.trim() ?? '',
      email_cliente: cliente.EMAIL_CLIENTE?.trim() ?? '',
    }));

    return NextResponse.json(clientes, { status: 200 });
  } catch (error) {
    console.error('Erro ao tentar buscar os clientes:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 },
    );
  }
}
