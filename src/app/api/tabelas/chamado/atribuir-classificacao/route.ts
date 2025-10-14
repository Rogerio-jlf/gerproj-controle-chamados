import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../../lib/firebird/firebird-client';

export async function GET() {
   try {
      // SQL para buscar todas as classificações
      const sql = `
      SELECT 
        COD_CLASSIFICACAO,
        NOME_CLASSIFICACAO
      FROM CLASSIFICACAO
      ORDER BY NOME_CLASSIFICACAO
    `;

      const result = await firebirdQuery(sql);

      return NextResponse.json(result, { status: 200 });
   } catch (error) {
      console.error('Erro ao buscar classificações:', error);

      return NextResponse.json(
         { error: 'Erro interno ao buscar classificações' },
         { status: 500 }
      );
   }
}
