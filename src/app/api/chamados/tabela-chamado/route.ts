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

      // FILTROS DE COLUNA
      const filterCodChamado = searchParams.get('filter_COD_CHAMADO')?.trim();
      const filterDataChamado = searchParams.get('filter_DATA_CHAMADO')?.trim();
      const filterAssunto = searchParams.get('filter_ASSUNTO_CHAMADO')?.trim();
      const filterStatus = searchParams.get('filter_STATUS_CHAMADO')?.trim();
      const filterDataEnvio = searchParams
         .get('filter_DTENVIO_CHAMADO')
         ?.trim();
      const filterNomeRecurso = searchParams.get('filter_NOME_RECURSO')?.trim();
      const filterEmailRecurso = searchParams
         .get('filter_EMAIL_RECURSO')
         ?.trim();
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

      // ===== FILTROS DE COLUNA ROBUSTOS =====

      if (filterCodChamado) {
         whereConditions.push(
            'CAST(Chamado.COD_CHAMADO AS VARCHAR(20)) LIKE ?'
         );
         params.push(`%${filterCodChamado}%`);
      }

      // FILTRO DATA_CHAMADO (tipo DATE no banco - formato 25.09.2025 00:00)
      // FILTRO DATA_CHAMADO (tipo DATE no banco - formato 25.09.2025 00:00)
      // FILTRO DATA_CHAMADO (tipo DATE no banco - formato 25.09.2025 00:00)
      // FILTRO DATA_CHAMADO (tipo DATE no banco)
      if (filterDataChamado) {
         let searchValue = filterDataChamado.trim().replace(/\//g, '.');

         // Se só tem números, formata com pontos
         if (/^\d+$/.test(searchValue)) {
            if (searchValue.length === 2) {
               // Apenas dia: 26
               searchValue = searchValue;
            } else if (searchValue.length === 4) {
               // DDMM: 2609 -> 26.09
               searchValue = `${searchValue.substring(0, 2)}.${searchValue.substring(2, 4)}`;
            } else if (searchValue.length === 8) {
               // DDMMYYYY: 26092025 -> 26.09.2025
               searchValue = `${searchValue.substring(0, 2)}.${searchValue.substring(2, 4)}.${searchValue.substring(4, 8)}`;
            }
         }

         const parts = searchValue.split('.');

         if (parts.length === 1 && /^\d{1,2}$/.test(parts[0])) {
            // Apenas dia (ex: 26)
            whereConditions.push('EXTRACT(DAY FROM Chamado.DATA_CHAMADO) = ?');
            params.push(parseInt(parts[0]));
         } else if (
            parts.length === 2 &&
            /^\d{1,2}$/.test(parts[0]) &&
            /^\d{1,2}$/.test(parts[1])
         ) {
            // Dia e mês (ex: 26.09)
            whereConditions.push(
               '(EXTRACT(DAY FROM Chamado.DATA_CHAMADO) = ? AND EXTRACT(MONTH FROM Chamado.DATA_CHAMADO) = ?)'
            );
            params.push(parseInt(parts[0]), parseInt(parts[1]));
         } else if (
            parts.length === 3 &&
            /^\d{1,2}$/.test(parts[0]) &&
            /^\d{1,2}$/.test(parts[1]) &&
            /^\d{4}$/.test(parts[2])
         ) {
            // Dia, mês e ano (ex: 26.09.2025)
            whereConditions.push(
               '(EXTRACT(DAY FROM Chamado.DATA_CHAMADO) = ? AND EXTRACT(MONTH FROM Chamado.DATA_CHAMADO) = ? AND EXTRACT(YEAR FROM Chamado.DATA_CHAMADO) = ?)'
            );
            params.push(
               parseInt(parts[0]),
               parseInt(parts[1]),
               parseInt(parts[2])
            );
         } else {
            // Fallback: busca no formato YYYY-MM-DD
            whereConditions.push(
               `CAST(Chamado.DATA_CHAMADO AS VARCHAR(50)) LIKE ?`
            );
            params.push(`%${searchValue}%`);
         }
      }

      // FILTRO DTENVIO_CHAMADO (tipo VARCHAR no banco - formato 25/09/2025 - 15:30)
      // FILTRO DTENVIO_CHAMADO (tipo VARCHAR no banco - formato 25/09/2025 - 15:30)
      if (filterDataEnvio) {
         let searchValue = filterDataEnvio.trim().replace(/\//g, '/');

         // Se só tem números, formata com barras
         if (/^\d+$/.test(searchValue)) {
            if (searchValue.length === 2) {
               // Apenas dia: 30 -> busca "30/"
               searchValue = searchValue + '/';
            } else if (searchValue.length === 4) {
               // DDMM: 3009 -> 30/09
               searchValue = `${searchValue.substring(0, 2)}/${searchValue.substring(2, 4)}`;
            } else if (searchValue.length === 8) {
               // DDMMYYYY: 30092025 -> 30/09/2025
               searchValue = `${searchValue.substring(0, 2)}/${searchValue.substring(2, 4)}/${searchValue.substring(4, 8)}`;
            }
         }

         whereConditions.push('Chamado.DTENVIO_CHAMADO LIKE ?');
         params.push(`${searchValue}%`); // Removido o % do início
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

      // FILTRO EMAIL_RECURSO (adicionado)
      if (filterEmailRecurso) {
         whereConditions.push('UPPER(Chamado.EMAIL_CHAMADO) LIKE ?');
         params.push(`%${filterEmailRecurso.toUpperCase()}%`);
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

      // TEMPORÁRIO - PARA DEBUG
      if (filterDataChamado) {
         const debugSql = `
      SELECT FIRST 5
         Chamado.COD_CHAMADO,
         Chamado.DATA_CHAMADO,
         CAST(Chamado.DATA_CHAMADO AS VARCHAR(50)) as DATA_FORMATADA
      FROM CHAMADO Chamado
      ORDER BY Chamado.COD_CHAMADO DESC
   `;
         const debugResult = await firebirdQuery(debugSql, []);
         console.log('DEBUG - Formato das datas:', debugResult);
      }

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
