import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../lib/firebird/firebird-client';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
   try {
      // Pega o token do header Authorization
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

      const isAdmin = decoded.tipo === 'ADM';
      const codRecurso = decoded.recurso?.id;

      // Pega parâmetros da query
      const { searchParams } = new URL(request.url);
      const mesParam = searchParams.get('mes');
      const anoParam = searchParams.get('ano');
      const codChamadoQuery = searchParams.get('codChamado')?.trim();

      // Validação para mês (aceita número ou "todos")
      let mesNumber: number | null = null;
      if (mesParam && mesParam !== 'todos') {
         mesNumber = Number(mesParam);
         if (isNaN(mesNumber) || mesNumber < 1 || mesNumber > 12) {
            return NextResponse.json(
               { error: "Parâmetro 'mês' inválido" },
               { status: 400 }
            );
         }
      }

      // Validação para ano (aceita número ou "todos")
      let anoNumber: number | null = null;
      if (anoParam && anoParam !== 'todos') {
         anoNumber = Number(anoParam);
         if (isNaN(anoNumber) || anoNumber < 2000 || anoNumber > 3000) {
            return NextResponse.json(
               { error: "Parâmetro 'ano' inválido" },
               { status: 400 }
            );
         }
      }

      if (!isAdmin && !codRecurso) {
         return NextResponse.json(
            { error: 'Usuário não admin precisa ter codRecurso definido' },
            { status: 400 }
         );
      }

      const whereConditions: string[] = [];
      const params: any[] = [];

      // Filtro por data - apenas se ano e mês específicos forem fornecidos
      if (anoNumber && mesNumber) {
         // Ambos específicos - filtro por mês/ano
         const dataInicio = new Date(anoNumber, mesNumber - 1, 1);
         const dataFim = new Date(anoNumber, mesNumber, 1);
         whereConditions.push(
            'Chamado.DATA_CHAMADO >= ? AND Chamado.DATA_CHAMADO < ?'
         );
         params.push(dataInicio, dataFim);
      } else if (anoNumber && !mesNumber) {
         // Apenas ano específico - filtro por ano todo
         const dataInicio = new Date(anoNumber, 0, 1);
         const dataFim = new Date(anoNumber + 1, 0, 1);
         whereConditions.push(
            'Chamado.DATA_CHAMADO >= ? AND Chamado.DATA_CHAMADO < ?'
         );
         params.push(dataInicio, dataFim);
      } else if (!anoNumber && mesNumber) {
         // Apenas mês específico - filtro por mês em todos os anos (usando EXTRACT)
         whereConditions.push('EXTRACT(MONTH FROM Chamado.DATA_CHAMADO) = ?');
         params.push(mesNumber);
      }
      // Se ambos forem "todos", não adiciona filtro de data

      // NOVA LÓGICA: Filtro por recurso e status baseado no tipo de usuário
      if (!isAdmin && codRecurso) {
         whereConditions.push('Chamado.COD_RECURSO = ?');
         params.push(Number(codRecurso));
      }

      // ADICIONADO: Filtro de status para usuários não-admin (EXCLUIR chamados finalizados)
      if (!isAdmin) {
         whereConditions.push('Chamado.STATUS_CHAMADO != ?');
         params.push('FINALIZADO');
      }

      if (codChamadoQuery) {
         whereConditions.push('Chamado.COD_CHAMADO = ?');
         params.push(Number(codChamadoQuery));
      }

      const sql = `
      SELECT FIRST 500
        Chamado.COD_CHAMADO,
        Chamado.DATA_CHAMADO,
        Chamado.HORA_CHAMADO,
        Chamado.CONCLUSAO_CHAMADO,
        Chamado.STATUS_CHAMADO,
        Chamado.DTENVIO_CHAMADO,
        Chamado.COD_RECURSO,
        Chamado.CLIENTE_CHAMADO,
        Chamado.CODTRF_CHAMADO,
        Chamado.COD_CLIENTE,
        Chamado.ASSUNTO_CHAMADO,
        Chamado.EMAIL_CHAMADO,
        Chamado.PRIOR_CHAMADO,
        Chamado.COD_CLASSIFICACAO,
        Cliente.NOME_CLIENTE,
        Recurso.NOME_RECURSO
      FROM CHAMADO Chamado
      LEFT JOIN CLIENTE Cliente ON Cliente.COD_CLIENTE = Chamado.COD_CLIENTE
      LEFT JOIN RECURSO Recurso ON Recurso.COD_RECURSO = Chamado.COD_RECURSO
      ${whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      ORDER BY Chamado.DATA_CHAMADO DESC, Chamado.COD_CHAMADO DESC
    `;

      const chamados = await firebirdQuery(sql, params);

      return NextResponse.json(chamados, { status: 200 });
   } catch (error) {
      console.error('Erro ao buscar chamados abertos:', error);
      return NextResponse.json(
         { error: 'Erro interno no servidor' },
         { status: 500 }
      );
   }
}
