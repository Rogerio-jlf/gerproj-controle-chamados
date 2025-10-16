import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';

export async function PATCH(request: Request) {
   try {
      // Validação do token
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
      } catch (err) {
         return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }

      // Pegar dados do body
      const body = await request.json();
      const { codOs, field, value } = body;

      // Validações
      if (!codOs || typeof codOs !== 'number') {
         return NextResponse.json(
            { error: 'COD_OS inválido ou não fornecido' },
            { status: 400 }
         );
      }

      if (!field || !['FATURADO_OS', 'VALID_OS'].includes(field)) {
         return NextResponse.json(
            { error: 'Campo inválido. Permitidos: FATURADO_OS, VALID_OS' },
            { status: 400 }
         );
      }

      if (!value || !['SIM', 'NAO'].includes(value)) {
         return NextResponse.json(
            { error: 'Valor inválido. Permitidos: SIM, NAO' },
            { status: 400 }
         );
      }

      // Verificar se a OS existe
      const checkSql = 'SELECT COD_OS FROM OS WHERE COD_OS = ?';
      const osExists = await firebirdQuery(checkSql, [codOs]);

      if (!osExists || osExists.length === 0) {
         return NextResponse.json(
            { error: 'OS não encontrada' },
            { status: 404 }
         );
      }

      // Atualizar o campo
      const updateSql = `UPDATE OS SET ${field} = ? WHERE COD_OS = ?`;
      await firebirdQuery(updateSql, [value, codOs]);

      // Buscar dados atualizados
      const selectSql = `
         SELECT 
            COD_OS,
            FATURADO_OS,
            VALID_OS
         FROM OS
         WHERE COD_OS = ?
      `;
      const updatedData = await firebirdQuery(selectSql, [codOs]);

      return NextResponse.json(
         {
            message: 'Campo atualizado com sucesso',
            data: updatedData[0],
         },
         { status: 200 }
      );
   } catch (error) {
      console.error('Erro ao atualizar OS:', error);
      return NextResponse.json(
         { error: 'Erro interno no servidor' },
         { status: 500 }
      );
   }
}
