import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../lib/firebird/firebird-client';

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
      const diaParam = searchParams.get('dia');
      const codTarefaQuery = searchParams.get('codTarefa')?.trim();

      // Paginação
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '20', 10);

      // ===== FILTROS DE COLUNA =====
      const filterCodTarefa = searchParams.get('filter_COD_TAREFA')?.trim();
      const filterNomeTarefa = searchParams.get('filter_NOME_TAREFA')?.trim();
      const filterCodRecurso = searchParams.get('filter_COD_RECURSO')?.trim();
      const filterNomeRecurso = searchParams.get('filter_NOME_RECURSO')?.trim();
      const filterDtsolTarefa = searchParams.get('filter_DTSOL_TAREFA')?.trim();
      const filterHrestTarefa = searchParams.get('filter_HREST_TAREFA')?.trim();
      const filterStatusTarefa = searchParams
         .get('filter_STATUS_TAREFA')
         ?.trim();
      const filterNomeProjeto = searchParams.get('filter_NOME_PROJETO')?.trim();
      const filterDtaprovTarefa = searchParams
         .get('filter_DTAPROV_TAREFA')
         ?.trim();
      const filterDtpreventTarefa = searchParams
         .get('filter_DTPREVENT_TAREFA')
         ?.trim();
      const filterDtincTarefa = searchParams.get('filter_DTINC_TAREFA')?.trim();
      const filterFaturaTarefa = searchParams
         .get('filter_FATURA_TAREFA')
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

      // Validação mês/ano/dia
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

      let diaNumber: number | null = null;
      if (diaParam && diaParam !== 'todos') {
         diaNumber = Number(diaParam);
         if (isNaN(diaNumber) || diaNumber < 1 || diaNumber > 31) {
            return NextResponse.json(
               { error: "Parâmetro 'dia' inválido" },
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

      // Condição de STATUS_TAREFA <> 4 removida completamente
      // Agora todas as tarefas serão retornadas, independente do status

      // Filtro por data (ano, mês, dia) - DTSOL_TAREFA
      // Agora inclui registros com DTSOL_TAREFA NULL quando não há filtro de data
      if (anoNumber && mesNumber && diaNumber) {
         whereConditions.push(
            'EXTRACT(YEAR FROM TAREFA.DTSOL_TAREFA) = ? AND EXTRACT(MONTH FROM TAREFA.DTSOL_TAREFA) = ? AND EXTRACT(DAY FROM TAREFA.DTSOL_TAREFA) = ?'
         );
         params.push(anoNumber, mesNumber, diaNumber);
      } else if (anoNumber && mesNumber && !diaNumber) {
         whereConditions.push(
            'EXTRACT(YEAR FROM TAREFA.DTSOL_TAREFA) = ? AND EXTRACT(MONTH FROM TAREFA.DTSOL_TAREFA) = ?'
         );
         params.push(anoNumber, mesNumber);
      } else if (anoNumber && !mesNumber && !diaNumber) {
         whereConditions.push('EXTRACT(YEAR FROM TAREFA.DTSOL_TAREFA) = ?');
         params.push(anoNumber);
      } else if (!anoNumber && mesNumber && !diaNumber) {
         whereConditions.push('EXTRACT(MONTH FROM TAREFA.DTSOL_TAREFA) = ?');
         params.push(mesNumber);
      } else if (!anoNumber && !mesNumber && diaNumber) {
         whereConditions.push('EXTRACT(DAY FROM TAREFA.DTSOL_TAREFA) = ?');
         params.push(diaNumber);
      } else if (!anoNumber && mesNumber && diaNumber) {
         whereConditions.push(
            'EXTRACT(MONTH FROM TAREFA.DTSOL_TAREFA) = ? AND EXTRACT(DAY FROM TAREFA.DTSOL_TAREFA) = ?'
         );
         params.push(mesNumber, diaNumber);
      } else if (anoNumber && !mesNumber && diaNumber) {
         whereConditions.push(
            'EXTRACT(YEAR FROM TAREFA.DTSOL_TAREFA) = ? AND EXTRACT(DAY FROM TAREFA.DTSOL_TAREFA) = ?'
         );
         params.push(anoNumber, diaNumber);
      }

      // Filtro por recurso (não admin)
      if (!isAdmin && codRecurso) {
         whereConditions.push('TAREFA.CODREC_TAREFA = ?');
         params.push(Number(codRecurso));
      }

      // Filtro por código da tarefa (query parameter)
      if (codTarefaQuery) {
         whereConditions.push('TAREFA.COD_TAREFA = ?');
         params.push(Number(codTarefaQuery));
      }

      // ===== FILTROS DE COLUNA =====

      if (filterCodTarefa) {
         const cleanCodTarefa = filterCodTarefa.replace(/[^\d]/g, '');
         whereConditions.push('CAST(TAREFA.COD_TAREFA AS VARCHAR(20)) LIKE ?');
         params.push(`%${cleanCodTarefa}%`);
      }

      if (filterNomeTarefa) {
         whereConditions.push('UPPER(TAREFA.NOME_TAREFA) LIKE ?');
         params.push(`%${filterNomeTarefa.toUpperCase()}%`);
      }

      if (filterCodRecurso) {
         const cleanCodRecurso = filterCodRecurso.replace(/[^\d]/g, '');
         whereConditions.push(
            'CAST(RECURSO.COD_RECURSO AS VARCHAR(20)) LIKE ?'
         );
         params.push(`%${cleanCodRecurso}%`);
      }

      if (filterNomeRecurso) {
         whereConditions.push('UPPER(RECURSO.NOME_RECURSO) LIKE ?');
         params.push(`%${filterNomeRecurso.toUpperCase()}%`);
      }

      if (filterDtsolTarefa) {
         let searchValue = filterDtsolTarefa.trim().replace(/\//g, '.');

         // Se só tem números, formata com pontos
         if (/^\d+$/.test(searchValue)) {
            if (searchValue.length === 2) {
               searchValue = searchValue;
            } else if (searchValue.length === 4) {
               searchValue = `${searchValue.substring(0, 2)}.${searchValue.substring(2, 4)}`;
            } else if (searchValue.length === 8) {
               searchValue = `${searchValue.substring(0, 2)}.${searchValue.substring(2, 4)}.${searchValue.substring(4, 8)}`;
            }
         }

         const parts = searchValue.split('.');

         if (parts.length === 1 && /^\d{1,2}$/.test(parts[0])) {
            whereConditions.push('EXTRACT(DAY FROM TAREFA.DTSOL_TAREFA) = ?');
            params.push(parseInt(parts[0]));
         } else if (
            parts.length === 2 &&
            /^\d{1,2}$/.test(parts[0]) &&
            /^\d{1,2}$/.test(parts[1])
         ) {
            whereConditions.push(
               '(EXTRACT(DAY FROM TAREFA.DTSOL_TAREFA) = ? AND EXTRACT(MONTH FROM TAREFA.DTSOL_TAREFA) = ?)'
            );
            params.push(parseInt(parts[0]), parseInt(parts[1]));
         } else if (
            parts.length === 3 &&
            /^\d{1,2}$/.test(parts[0]) &&
            /^\d{1,2}$/.test(parts[1]) &&
            /^\d{4}$/.test(parts[2])
         ) {
            whereConditions.push(
               '(EXTRACT(DAY FROM TAREFA.DTSOL_TAREFA) = ? AND EXTRACT(MONTH FROM TAREFA.DTSOL_TAREFA) = ? AND EXTRACT(YEAR FROM TAREFA.DTSOL_TAREFA) = ?)'
            );
            params.push(
               parseInt(parts[0]),
               parseInt(parts[1]),
               parseInt(parts[2])
            );
         } else {
            whereConditions.push(
               `CAST(TAREFA.DTSOL_TAREFA AS VARCHAR(50)) LIKE ?`
            );
            params.push(`%${searchValue}%`);
         }
      }

      if (filterHrestTarefa) {
         const cleanHrest = filterHrestTarefa.replace(/[^\d.,]/g, '');
         whereConditions.push(
            'CAST(TAREFA.HREST_TAREFA AS VARCHAR(20)) LIKE ?'
         );
         params.push(`%${cleanHrest}%`);
      }

      if (filterStatusTarefa) {
         const cleanStatus = filterStatusTarefa.replace(/[^\d]/g, '');
         if (cleanStatus) {
            whereConditions.push(
               'CAST(TAREFA.STATUS_TAREFA AS VARCHAR(10)) LIKE ?'
            );
            params.push(`%${cleanStatus}%`);
         }
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

      if (filterDtaprovTarefa) {
         let searchValue = filterDtaprovTarefa.trim().replace(/\//g, '.');

         if (/^\d+$/.test(searchValue)) {
            if (searchValue.length === 2) {
               searchValue = searchValue;
            } else if (searchValue.length === 4) {
               searchValue = `${searchValue.substring(0, 2)}.${searchValue.substring(2, 4)}`;
            } else if (searchValue.length === 8) {
               searchValue = `${searchValue.substring(0, 2)}.${searchValue.substring(2, 4)}.${searchValue.substring(4, 8)}`;
            }
         }

         const parts = searchValue.split('.');

         if (parts.length === 1 && /^\d{1,2}$/.test(parts[0])) {
            whereConditions.push('EXTRACT(DAY FROM TAREFA.DTAPROV_TAREFA) = ?');
            params.push(parseInt(parts[0]));
         } else if (
            parts.length === 2 &&
            /^\d{1,2}$/.test(parts[0]) &&
            /^\d{1,2}$/.test(parts[1])
         ) {
            whereConditions.push(
               '(EXTRACT(DAY FROM TAREFA.DTAPROV_TAREFA) = ? AND EXTRACT(MONTH FROM TAREFA.DTAPROV_TAREFA) = ?)'
            );
            params.push(parseInt(parts[0]), parseInt(parts[1]));
         } else if (
            parts.length === 3 &&
            /^\d{1,2}$/.test(parts[0]) &&
            /^\d{1,2}$/.test(parts[1]) &&
            /^\d{4}$/.test(parts[2])
         ) {
            whereConditions.push(
               '(EXTRACT(DAY FROM TAREFA.DTAPROV_TAREFA) = ? AND EXTRACT(MONTH FROM TAREFA.DTAPROV_TAREFA) = ? AND EXTRACT(YEAR FROM TAREFA.DTAPROV_TAREFA) = ?)'
            );
            params.push(
               parseInt(parts[0]),
               parseInt(parts[1]),
               parseInt(parts[2])
            );
         } else {
            whereConditions.push(
               `CAST(TAREFA.DTAPROV_TAREFA AS VARCHAR(50)) LIKE ?`
            );
            params.push(`%${searchValue}%`);
         }
      }

      if (filterDtpreventTarefa) {
         let searchValue = filterDtpreventTarefa.trim().replace(/\//g, '.');

         if (/^\d+$/.test(searchValue)) {
            if (searchValue.length === 2) {
               searchValue = searchValue;
            } else if (searchValue.length === 4) {
               searchValue = `${searchValue.substring(0, 2)}.${searchValue.substring(2, 4)}`;
            } else if (searchValue.length === 8) {
               searchValue = `${searchValue.substring(0, 2)}.${searchValue.substring(2, 4)}.${searchValue.substring(4, 8)}`;
            }
         }

         const parts = searchValue.split('.');

         if (parts.length === 1 && /^\d{1,2}$/.test(parts[0])) {
            whereConditions.push(
               'EXTRACT(DAY FROM TAREFA.DTPREVENT_TAREFA) = ?'
            );
            params.push(parseInt(parts[0]));
         } else if (
            parts.length === 2 &&
            /^\d{1,2}$/.test(parts[0]) &&
            /^\d{1,2}$/.test(parts[1])
         ) {
            whereConditions.push(
               '(EXTRACT(DAY FROM TAREFA.DTPREVENT_TAREFA) = ? AND EXTRACT(MONTH FROM TAREFA.DTPREVENT_TAREFA) = ?)'
            );
            params.push(parseInt(parts[0]), parseInt(parts[1]));
         } else if (
            parts.length === 3 &&
            /^\d{1,2}$/.test(parts[0]) &&
            /^\d{1,2}$/.test(parts[1]) &&
            /^\d{4}$/.test(parts[2])
         ) {
            whereConditions.push(
               '(EXTRACT(DAY FROM TAREFA.DTPREVENT_TAREFA) = ? AND EXTRACT(MONTH FROM TAREFA.DTPREVENT_TAREFA) = ? AND EXTRACT(YEAR FROM TAREFA.DTPREVENT_TAREFA) = ?)'
            );
            params.push(
               parseInt(parts[0]),
               parseInt(parts[1]),
               parseInt(parts[2])
            );
         } else {
            whereConditions.push(
               `CAST(TAREFA.DTPREVENT_TAREFA AS VARCHAR(50)) LIKE ?`
            );
            params.push(`%${searchValue}%`);
         }
      }

      if (filterDtincTarefa) {
         let searchValue = filterDtincTarefa.trim().replace(/\//g, '.');

         if (/^\d+$/.test(searchValue)) {
            if (searchValue.length === 2) {
               searchValue = searchValue;
            } else if (searchValue.length === 4) {
               searchValue = `${searchValue.substring(0, 2)}.${searchValue.substring(2, 4)}`;
            } else if (searchValue.length === 8) {
               searchValue = `${searchValue.substring(0, 2)}.${searchValue.substring(2, 4)}.${searchValue.substring(4, 8)}`;
            }
         }

         const parts = searchValue.split('.');

         if (parts.length === 1 && /^\d{1,2}$/.test(parts[0])) {
            whereConditions.push('EXTRACT(DAY FROM TAREFA.DTINC_TAREFA) = ?');
            params.push(parseInt(parts[0]));
         } else if (
            parts.length === 2 &&
            /^\d{1,2}$/.test(parts[0]) &&
            /^\d{1,2}$/.test(parts[1])
         ) {
            whereConditions.push(
               '(EXTRACT(DAY FROM TAREFA.DTINC_TAREFA) = ? AND EXTRACT(MONTH FROM TAREFA.DTINC_TAREFA) = ?)'
            );
            params.push(parseInt(parts[0]), parseInt(parts[1]));
         } else if (
            parts.length === 3 &&
            /^\d{1,2}$/.test(parts[0]) &&
            /^\d{1,2}$/.test(parts[1]) &&
            /^\d{4}$/.test(parts[2])
         ) {
            whereConditions.push(
               '(EXTRACT(DAY FROM TAREFA.DTINC_TAREFA) = ? AND EXTRACT(MONTH FROM TAREFA.DTINC_TAREFA) = ? AND EXTRACT(YEAR FROM TAREFA.DTINC_TAREFA) = ?)'
            );
            params.push(
               parseInt(parts[0]),
               parseInt(parts[1]),
               parseInt(parts[2])
            );
         } else {
            whereConditions.push(
               `CAST(TAREFA.DTINC_TAREFA AS VARCHAR(50)) LIKE ?`
            );
            params.push(`%${searchValue}%`);
         }
      }

      if (filterFaturaTarefa) {
         console.log('🔍 Filtro FATURA_TAREFA:', filterFaturaTarefa);
         // CHAR(3) tem padding de espaços, então usamos TRIM para comparação exata
         whereConditions.push('UPPER(TRIM(TAREFA.FATURA_TAREFA)) = UPPER(?)');
         params.push(filterFaturaTarefa.trim());
      }

      const sql = `
         SELECT
            TAREFA.COD_TAREFA,
            TAREFA.NOME_TAREFA,
            TAREFA.CODPRO_TAREFA,
            TAREFA.CODREC_TAREFA,
            TAREFA.DTSOL_TAREFA,
            TAREFA.DTAPROV_TAREFA,
            TAREFA.DTPREVENT_TAREFA,
            TAREFA.HREST_TAREFA,
            TAREFA.STATUS_TAREFA,
            TAREFA.DTINC_TAREFA,
            TAREFA.FATURA_TAREFA,
            PROJETO.COD_PROJETO,
            PROJETO.NOME_PROJETO,
            PROJETO.CODCLI_PROJETO,
            RECURSO.COD_RECURSO,
            RECURSO.NOME_RECURSO,
            CLIENTE.COD_CLIENTE,
            CLIENTE.NOME_CLIENTE
         FROM TAREFA
         LEFT JOIN PROJETO ON TAREFA.CODPRO_TAREFA = PROJETO.COD_PROJETO
         LEFT JOIN RECURSO ON TAREFA.CODREC_TAREFA = RECURSO.COD_RECURSO
         LEFT JOIN CLIENTE ON PROJETO.CODCLI_PROJETO = CLIENTE.COD_CLIENTE
         ${whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : ''}
         ORDER BY TAREFA.COD_TAREFA DESC, TAREFA.DTSOL_TAREFA DESC
         ROWS ${startRow} TO ${endRow};
      `;

      const countSql = `
         SELECT COUNT(*) as TOTAL
         FROM TAREFA
         LEFT JOIN PROJETO ON TAREFA.CODPRO_TAREFA = PROJETO.COD_PROJETO
         LEFT JOIN RECURSO ON TAREFA.CODREC_TAREFA = RECURSO.COD_RECURSO
         LEFT JOIN CLIENTE ON PROJETO.CODCLI_PROJETO = CLIENTE.COD_CLIENTE
         ${whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      `;

      const [rawTarefasData, countResult] = await Promise.all([
         firebirdQuery(sql, params),
         firebirdQuery(countSql, params),
      ]);

      // Processa os dados para adicionar os campos compostos
      const tarefasData = (rawTarefasData || []).map((record: any) => {
         const tarefaCompleta =
            record.COD_TAREFA && record.NOME_TAREFA
               ? `${record.COD_TAREFA} - ${record.NOME_TAREFA}`
               : null;

         const projetoCompleto =
            record.COD_PROJETO && record.NOME_PROJETO
               ? `${record.COD_PROJETO} - ${record.NOME_PROJETO}`
               : null;

         const recursoCompleto =
            record.COD_RECURSO && record.NOME_RECURSO
               ? `${record.COD_RECURSO} - ${record.NOME_RECURSO}`
               : null;

         return {
            ...record,
            TAREFA_COMPLETA: tarefaCompleta,
            PROJETO_COMPLETO: projetoCompleto,
            RECURSO_COMPLETO: recursoCompleto,
         };
      });

      const total = countResult[0].TOTAL;
      const totalPages = Math.ceil(total / limit);

      return NextResponse.json(
         {
            data: tarefasData,
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
      console.error('Erro ao buscar dados de tarefas:', error);

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
