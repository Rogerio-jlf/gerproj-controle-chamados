import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { firebirdQuery } from '@/lib/firebird/firebird-client';

export async function POST(request: Request) {
   try {
      const { login, senha } = await request.json();

      if (!login || !senha) {
         return NextResponse.json(
            { error: 'Login e senha são obrigatórios' },
            { status: 400 }
         );
      }

      const sql = `
      SELECT 
        U.COD_USUARIO, 
        U.NOME_USUARIO, 
        U.SENHA, 
        U.TIPO_USUARIO,
        R.COD_RECURSO,
        R.NOME_RECURSO,
        R.EMAIL_RECURSO,
        R.ATIVO_RECURSO
      FROM USUARIO U
      LEFT JOIN RECURSO R ON U.COD_USUARIO = R.CODUSR_RECURSO
      WHERE ID_USUARIO = ?
    `;

      const result = await firebirdQuery(sql, [login.toUpperCase()]);

      if (!result || result.length === 0) {
         return NextResponse.json(
            { error: 'Usuário não encontrado' },
            { status: 401 }
         );
      }

      const user = result[0];

      if (user.SENHA.trim() !== senha) {
         return NextResponse.json({ error: 'Senha inválida' }, { status: 401 });
      }

      // Gerar token JWT
      const token = jwt.sign(
         {
            id: user.COD_USUARIO,
            nome: user.NOME_USUARIO.trim(),
            tipo: user.TIPO_USUARIO,
            recurso: {
               id: user.COD_RECURSO,
               nome: user.NOME_RECURSO,
               email: user.EMAIL_RECURSO,
               ativo: user.ATIVO_RECURSO,
            },
         },
         process.env.JWT_SECRET || 'minha_chave_secreta',
         { expiresIn: '3h' } // Token válido por 3 horas
      );

      const isAdmin = user.TIPO_USUARIO === 'ADM';
      const codCliente = null; //
      const codRecurso = user.COD_RECURSO || null;

      return NextResponse.json({
         token,
         isAdmin,
         codCliente,
         codRecurso,
      });
   } catch (error) {
      console.error('Erro na API de login:', error);
      return NextResponse.json(
         { error: 'Erro interno no servidor' },
         { status: 500 }
      );
   }
}
