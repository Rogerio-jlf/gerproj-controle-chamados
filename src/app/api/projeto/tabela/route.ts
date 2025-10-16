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
      const codProjetoQuery = searchParams.get('codProjeto')?.trim();

      // Paginação
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '20', 10);

      // ===== FILTROS DE COLUNA =====
      const filterCodProjeto = searchParams.get('filter_COD_PROJETO')?.trim();
      const filterNomeProjeto = searchParams.get('filter_NOME_PROJETO')?.trim();
      const filterCodCliente = searchParams.get('filter_COD_CLIENTE')?.trim();
      const filterNomeCliente = searchParams.get('filter_NOME_CLIENTE')?.trim();
      const filterRespCliProjeto = searchParams
         .get('filter_RESPCLI_PROJETO')
         ?.trim();
      const filterCodRecurso = searchParams.get('filter_COD_RECURSO')?.trim();
      const filterNomeRecurso = searchParams.get('filter_NOME_RECURSO')?.trim();
      const filterQtdhorasProjeto = searchParams
         .get('filter_QTDHORAS_PROJETO')
         ?.trim();
      const filterStatusProjeto = searchParams
         .get('filter_STATUS_PROJETO')
         ?.trim();

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

      if (!isAdmin && !codRecurso) {
         return NextResponse.json(
            { error: 'Usuário não admin precisa ter codRecurso definido' },
            { status: 400 }
         );
      }

      const whereConditions: string[] = [];
      const params: any[] = [];

      // Filtro por recurso (não admin)
      if (!isAdmin && codRecurso) {
         whereConditions.push('PROJETO.CODREC_PROJETO = ?');
         params.push(Number(codRecurso));
      }

      // Filtro por código do projeto (query parameter)
      if (codProjetoQuery) {
         whereConditions.push('PROJETO.COD_PROJETO = ?');
         params.push(Number(codProjetoQuery));
      }

      // ===== FILTROS DE COLUNA =====

      if (filterCodProjeto) {
         const cleanCodProjeto = filterCodProjeto.replace(/[^\d]/g, '');
         whereConditions.push(
            'CAST(PROJETO.COD_PROJETO AS VARCHAR(20)) LIKE ?'
         );
         params.push(`%${cleanCodProjeto}%`);
      }

      if (filterNomeProjeto) {
         // Busca tanto no código quanto no nome do projeto
         whereConditions.push(
            '(UPPER(PROJETO.NOME_PROJETO) LIKE ? OR CAST(PROJETO.COD_PROJETO AS VARCHAR(20)) LIKE ?)'
         );
         params.push(
            `%${filterNomeProjeto.toUpperCase()}%`,
            `%${filterNomeProjeto}%`
         );
      }

      if (filterCodCliente) {
         const cleanCodCliente = filterCodCliente.replace(/[^\d]/g, '');
         whereConditions.push(
            'CAST(CLIENTE.COD_CLIENTE AS VARCHAR(20)) LIKE ?'
         );
         params.push(`%${cleanCodCliente}%`);
      }

      if (filterNomeCliente) {
         // Busca tanto no código quanto no nome do cliente
         whereConditions.push(
            '(UPPER(CLIENTE.NOME_CLIENTE) LIKE ? OR CAST(CLIENTE.COD_CLIENTE AS VARCHAR(20)) LIKE ?)'
         );
         params.push(
            `%${filterNomeCliente.toUpperCase()}%`,
            `%${filterNomeCliente}%`
         );
      }

      if (filterRespCliProjeto) {
         whereConditions.push('UPPER(PROJETO.RESPCLI_PROJETO) LIKE ?');
         params.push(`%${filterRespCliProjeto.toUpperCase()}%`);
      }

      if (filterCodRecurso) {
         const cleanCodRecurso = filterCodRecurso.replace(/[^\d]/g, '');
         whereConditions.push(
            'CAST(RECURSO.COD_RECURSO AS VARCHAR(20)) LIKE ?'
         );
         params.push(`%${cleanCodRecurso}%`);
      }

      if (filterNomeRecurso) {
         // Busca tanto no código quanto no nome do recurso
         whereConditions.push(
            '(UPPER(RECURSO.NOME_RECURSO) LIKE ? OR CAST(RECURSO.COD_RECURSO AS VARCHAR(20)) LIKE ?)'
         );
         params.push(
            `%${filterNomeRecurso.toUpperCase()}%`,
            `%${filterNomeRecurso}%`
         );
      }

      if (filterQtdhorasProjeto) {
         const cleanQtdhoras = filterQtdhorasProjeto.replace(/[^\d.,]/g, '');
         whereConditions.push(
            'CAST(PROJETO.QTDHORAS_PROJETO AS VARCHAR(20)) LIKE ?'
         );
         params.push(`%${cleanQtdhoras}%`);
      }

      if (filterStatusProjeto) {
         console.log('🔍 Filtro STATUS_PROJETO:', filterStatusProjeto);
         // CHAR(3) tem padding de espaços, então usamos TRIM para comparação exata
         whereConditions.push('UPPER(TRIM(PROJETO.STATUS_PROJETO)) = UPPER(?)');
         params.push(filterStatusProjeto.trim());
      }

      const sql = `
         SELECT
            PROJETO.COD_PROJETO,
            PROJETO.NOME_PROJETO,
            PROJETO.CODCLI_PROJETO,
            PROJETO.RESPCLI_PROJETO,
            PROJETO.CODREC_PROJETO,
            PROJETO.QTDHORAS_PROJETO,
            PROJETO.STATUS_PROJETO,
            CLIENTE.COD_CLIENTE,
            CLIENTE.NOME_CLIENTE,
            RECURSO.COD_RECURSO,
            RECURSO.NOME_RECURSO
         FROM PROJETO
         LEFT JOIN CLIENTE ON PROJETO.CODCLI_PROJETO = CLIENTE.COD_CLIENTE
         LEFT JOIN RECURSO ON PROJETO.CODREC_PROJETO = RECURSO.COD_RECURSO
         ${whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : ''}
         ORDER BY PROJETO.COD_PROJETO DESC
         ROWS ${startRow} TO ${endRow};
      `;

      const countSql = `
         SELECT COUNT(*) as TOTAL
         FROM PROJETO
         LEFT JOIN CLIENTE ON PROJETO.CODCLI_PROJETO = CLIENTE.COD_CLIENTE
         LEFT JOIN RECURSO ON PROJETO.CODREC_PROJETO = RECURSO.COD_RECURSO
         ${whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      `;

      const [rawProjetosData, countResult] = await Promise.all([
         firebirdQuery(sql, params),
         firebirdQuery(countSql, params),
      ]);

      // Processa os dados para adicionar os campos compostos
      const projetosData = (rawProjetosData || []).map((record: any) => {
         const projetoCompleto =
            record.COD_PROJETO && record.NOME_PROJETO
               ? `${record.COD_PROJETO} - ${record.NOME_PROJETO}`
               : null;

         const clienteCompleto =
            record.COD_CLIENTE && record.NOME_CLIENTE
               ? `${record.COD_CLIENTE} - ${record.NOME_CLIENTE}`
               : null;

         const recursoCompleto =
            record.COD_RECURSO && record.NOME_RECURSO
               ? `${record.COD_RECURSO} - ${record.NOME_RECURSO}`
               : null;

         return {
            ...record,
            PROJETO_COMPLETO: projetoCompleto,
            CLIENTE_COMPLETO: clienteCompleto,
            RECURSO_COMPLETO: recursoCompleto,
         };
      });

      const total = countResult[0].TOTAL;
      const totalPages = Math.ceil(total / limit);

      return NextResponse.json(
         {
            data: projetosData,
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
      console.error('Erro ao buscar dados de projetos:', error);

      if (error instanceof Error) {
         console.error('DEBUG - Mensagem de erro:', error.message);
         console.error('DEBUG - Stack trace:', error.stack);
      }

      return NextResponse.json(
         { error: 'Erro interno no servidor' },
         { status: 500 }
      );
   }
}
