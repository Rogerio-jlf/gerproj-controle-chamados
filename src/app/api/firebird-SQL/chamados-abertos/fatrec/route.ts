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

    const query = `
      SELECT 
        c.COD_CLIENTE,
        c.NOME_CLIENTE,
        SUM(f.VRTOT_FATREC) AS TOTAL_FATURADO,
        SUM(f.QTDHORA_FATREC) AS TOTAL_HORAS_FATURADAS
      FROM 
        CLIENTE c
      LEFT JOIN 
        FATREC f ON f.COD_CLIENTE = c.COD_CLIENTE AND f.MESANO_FATREC = ?
      WHERE 
        c.ATIVO_CLIENTE = 1
      GROUP BY 
        c.COD_CLIENTE, c.NOME_CLIENTE
      ORDER BY 
        c.NOME_CLIENTE
    `;

    const result = await firebirdQuery(query, [mesAno]);

    // Convertendo os valores para número, caso venham como string
    const clientes = result.map((item: any) => {
      const totalFaturado =
        item.TOTAL_FATURADO !== null ? Number(item.TOTAL_FATURADO) : 0;
      const totalHorasFaturadas =
        item.TOTAL_HORAS_FATURADAS !== null
          ? Number(item.TOTAL_HORAS_FATURADAS)
          : 0;

      return {
        codCliente: item.COD_CLIENTE,
        nomeCliente: item.NOME_CLIENTE?.trim() || '',
        totalFaturado: Number(totalFaturado.toFixed(2)),
        totalHorasFaturadas: Number(totalHorasFaturadas.toFixed(2)),
      };
    });

    // Calculando a receita total
    const receitaTotal = clientes.reduce(
      (acc, cur) => acc + cur.totalFaturado,
      0
    );

    // Calculando a média por cliente
    const mediaPorCliente =
      clientes.length > 0 ? receitaTotal / clientes.length : 0;

    // Calculando o total de horas faturadas
    const totalHorasFaturadas = clientes.reduce(
      (acc, cur) => acc + cur.totalHorasFaturadas,
      0
    );

    // Calculando o valor da hora de venda
    const valorHoraVenda = receitaTotal / totalHorasFaturadas;

    return NextResponse.json({
      data_clientes: clientes,
      receita_total_mes: receitaTotal.toFixed(2),
      media_cliente_mes: mediaPorCliente.toFixed(2),
      valor_hora_venda_mes: valorHoraVenda.toFixed(2),
    });
  } catch (error) {
    console.error('Erro ao buscar faturamento por cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
