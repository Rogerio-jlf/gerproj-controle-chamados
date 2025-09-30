import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';

export async function GET(request: Request) {
   try {
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

      const { searchParams } = new URL(request.url);
      const mesParam = searchParams.get('mes');
      const anoParam = searchParams.get('ano');
      const codChamadoQuery = searchParams.get('codChamado')?.trim();

      // Paginação
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '20', 10);

      // NOVOS FILTROS DE COLUNA
      const filterCodChamado = searchParams.get('filter_COD_CHAMADO')?.trim();
      const filterDataChamado = searchParams.get('filter_DATA_CHAMADO')?.trim();
      const filterAssunto = searchParams.get('filter_ASSUNTO_CHAMADO')?.trim();
      const filterStatus = searchParams.get('filter_STATUS_CHAMADO')?.trim();
      const filterNomeRecurso = searchParams.get('filter_NOME_RECURSO')?.trim();
      const globalFilter = searchParams.get('globalFilter')?.trim();

      if (page < 1 || limit < 1 || limit > 100) {
         return NextResponse.json(
            {
               error: 'Parâmetros de paginação inválidos. Page deve ser >= 1, limit entre 1 e 100',
            },
            { status: 400 }
         );
      }

      const startRow = (page - 1) * limit + 1;
      const endRow = page * limit;

      // Validação mês/ano
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

      // Filtro por data
      if (anoNumber && mesNumber) {
         const dataInicio = new Date(anoNumber, mesNumber - 1, 1);
         const dataFim = new Date(anoNumber, mesNumber, 1);
         whereConditions.push(
            'Chamado.DATA_CHAMADO >= ? AND Chamado.DATA_CHAMADO < ?'
         );
         params.push(dataInicio, dataFim);
      } else if (anoNumber && !mesNumber) {
         const dataInicio = new Date(anoNumber, 0, 1);
         const dataFim = new Date(anoNumber + 1, 0, 1);
         whereConditions.push(
            'Chamado.DATA_CHAMADO >= ? AND Chamado.DATA_CHAMADO < ?'
         );
         params.push(dataInicio, dataFim);
      } else if (!anoNumber && mesNumber) {
         whereConditions.push('EXTRACT(MONTH FROM Chamado.DATA_CHAMADO) = ?');
         params.push(mesNumber);
      }

      // Filtro por recurso e status
      if (!isAdmin && codRecurso) {
         whereConditions.push('Chamado.COD_RECURSO = ?');
         params.push(Number(codRecurso));
      }

      if (!isAdmin) {
         whereConditions.push('Chamado.STATUS_CHAMADO != ?');
         params.push('FINALIZADO');
      }

      if (codChamadoQuery) {
         whereConditions.push('Chamado.COD_CHAMADO = ?');
         params.push(Number(codChamadoQuery));
      }

      // ===== NOVOS FILTROS DE COLUNA =====
      if (filterCodChamado) {
         whereConditions.push(
            'CAST(Chamado.COD_CHAMADO AS VARCHAR(20)) LIKE ?'
         );
         params.push(`%${filterCodChamado}%`);
      }

      if (filterDataChamado) {
         whereConditions.push(
            'CAST(Chamado.DATA_CHAMADO AS VARCHAR(50)) LIKE ?'
         );
         params.push(`%${filterDataChamado}%`);
      }

      if (filterAssunto) {
         whereConditions.push('UPPER(Chamado.ASSUNTO_CHAMADO) LIKE ?');
         params.push(`%${filterAssunto.toUpperCase()}%`);
      }

      if (filterStatus) {
         whereConditions.push('UPPER(Chamado.STATUS_CHAMADO) LIKE ?');
         params.push(`%${filterStatus.toUpperCase()}%`);
      }

      if (filterNomeRecurso) {
         whereConditions.push('UPPER(Recurso.NOME_RECURSO) LIKE ?');
         params.push(`%${filterNomeRecurso.toUpperCase()}%`);
      }

      // Filtro global (busca em múltiplas colunas)
      if (globalFilter) {
         const globalCondition = `(
            CAST(Chamado.COD_CHAMADO AS VARCHAR(20)) LIKE ? OR
            UPPER(Chamado.ASSUNTO_CHAMADO) LIKE ? OR
            UPPER(Chamado.STATUS_CHAMADO) LIKE ? OR
            UPPER(Chamado.EMAIL_CHAMADO) LIKE ? OR
            UPPER(Recurso.NOME_RECURSO) LIKE ?
         )`;
         whereConditions.push(globalCondition);
         const globalValue = `%${globalFilter.toUpperCase()}%`;
         params.push(
            globalValue,
            globalValue,
            globalValue,
            globalValue,
            globalValue
         );
      }

      const sql = `
         SELECT 
            Chamado.COD_CHAMADO,
            Chamado.DATA_CHAMADO,
            Chamado.STATUS_CHAMADO,
            Chamado.DTENVIO_CHAMADO,
            Chamado.COD_RECURSO,
            Chamado.ASSUNTO_CHAMADO,
            Chamado.EMAIL_CHAMADO,
            Recurso.NOME_RECURSO
         FROM CHAMADO Chamado
         LEFT JOIN RECURSO Recurso ON Recurso.COD_RECURSO = Chamado.COD_RECURSO
         ${whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : ''}
         ORDER BY Chamado.DATA_CHAMADO DESC, Chamado.COD_CHAMADO DESC
         ROWS ${startRow} TO ${endRow};
      `;

      const countSql = `
         SELECT COUNT(*) as TOTAL
         FROM CHAMADO Chamado
         LEFT JOIN RECURSO Recurso ON Recurso.COD_RECURSO = Chamado.COD_RECURSO
         ${whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      `;

      const [chamados, countResult] = await Promise.all([
         firebirdQuery(sql, params),
         firebirdQuery(countSql, params),
      ]);

      const total = countResult[0].TOTAL;
      const totalPages = Math.ceil(total / limit);

      return NextResponse.json(
         {
            data: chamados,
            pagination: {
               currentPage: page,
               totalPages,
               totalRecords: total,
               recordsPerPage: limit,
               hasNextPage: page < totalPages,
               hasPrevPage: page > 1,
            },
         },
         { status: 200 }
      );
   } catch (error) {
      console.error('Erro ao buscar chamados abertos:', error);
      return NextResponse.json(
         { error: 'Erro interno no servidor' },
         { status: 500 }
      );
   }
}
