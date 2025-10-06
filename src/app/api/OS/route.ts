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
      const codOsQuery = searchParams.get('codOs')?.trim();

      // Paginação
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '20', 10);

      // ===== FILTROS DE COLUNA =====

      const filterChamadoOs = searchParams.get('filter_CHAMADO_OS')?.trim();
      const filterCodOs = searchParams.get('filter_COD_OS')?.trim();
      const filterDtiniOs = searchParams.get('filter_DTINI_OS')?.trim();
      const filterDtincOs = searchParams.get('filter_DTINC_OS')?.trim();
      const filterCompOs = searchParams.get('filter_COMP_OS')?.trim();
      const filterNomeCliente = searchParams.get('filter_NOME_CLIENTE')?.trim();
      const filterFaturadoOs = searchParams.get('filter_FATURADO_OS')?.trim();
      const filterNomeRecurso = searchParams.get('filter_NOME_RECURSO')?.trim();
      const filterValidOs = searchParams.get('filter_VALID_OS')?.trim();
      const filterNomeTarefa = searchParams.get('filter_NOME_TAREFA')?.trim();
      const filterNomeProjeto = searchParams.get('filter_NOME_PROJETO')?.trim();

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

      // Filtro por data (ano, mês, dia)
      if (anoNumber && mesNumber && diaNumber) {
         whereConditions.push(
            'EXTRACT(YEAR FROM OS.DTINI_OS) = ? AND EXTRACT(MONTH FROM OS.DTINI_OS) = ? AND EXTRACT(DAY FROM OS.DTINI_OS) = ?'
         );
         params.push(anoNumber, mesNumber, diaNumber);
      } else if (anoNumber && mesNumber && !diaNumber) {
         whereConditions.push(
            'EXTRACT(YEAR FROM OS.DTINI_OS) = ? AND EXTRACT(MONTH FROM OS.DTINI_OS) = ?'
         );
         params.push(anoNumber, mesNumber);
      } else if (anoNumber && !mesNumber && !diaNumber) {
         whereConditions.push('EXTRACT(YEAR FROM OS.DTINI_OS) = ?');
         params.push(anoNumber);
      } else if (!anoNumber && mesNumber && !diaNumber) {
         whereConditions.push('EXTRACT(MONTH FROM OS.DTINI_OS) = ?');
         params.push(mesNumber);
      } else if (!anoNumber && !mesNumber && diaNumber) {
         whereConditions.push('EXTRACT(DAY FROM OS.DTINI_OS) = ?');
         params.push(diaNumber);
      } else if (!anoNumber && mesNumber && diaNumber) {
         whereConditions.push(
            'EXTRACT(MONTH FROM OS.DTINI_OS) = ? AND EXTRACT(DAY FROM OS.DTINI_OS) = ?'
         );
         params.push(mesNumber, diaNumber);
      } else if (anoNumber && !mesNumber && diaNumber) {
         whereConditions.push(
            'EXTRACT(YEAR FROM OS.DTINI_OS) = ? AND EXTRACT(DAY FROM OS.DTINI_OS) = ?'
         );
         params.push(anoNumber, diaNumber);
      }

      // Filtro por recurso
      if (!isAdmin && codRecurso) {
         whereConditions.push('OS.CODREC_OS = ?');
         params.push(Number(codRecurso));
      }

      // Filtro por código da OS
      if (codOsQuery) {
         whereConditions.push('OS.COD_OS = ?');
         params.push(Number(codOsQuery));
      }

      // ===== FILTROS DE COLUNA ROBUSTOS =====
      if (filterChamadoOs) {
         whereConditions.push('UPPER(OS.CHAMADO_OS) LIKE ?');
         params.push(`%${filterChamadoOs.toUpperCase()}%`);
      }

      if (filterCodOs) {
         whereConditions.push('CAST(OS.COD_OS AS VARCHAR(20)) LIKE ?');
         params.push(`%${filterCodOs}%`);
      }

      if (filterDtiniOs) {
         let searchValue = filterDtiniOs.trim().replace(/\//g, '.');

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
            whereConditions.push('EXTRACT(DAY FROM OS.DTINI_OS) = ?');
            params.push(parseInt(parts[0]));
         } else if (
            parts.length === 2 &&
            /^\d{1,2}$/.test(parts[0]) &&
            /^\d{1,2}$/.test(parts[1])
         ) {
            whereConditions.push(
               '(EXTRACT(DAY FROM OS.DTINI_OS) = ? AND EXTRACT(MONTH FROM OS.DTINI_OS) = ?)'
            );
            params.push(parseInt(parts[0]), parseInt(parts[1]));
         } else if (
            parts.length === 3 &&
            /^\d{1,2}$/.test(parts[0]) &&
            /^\d{1,2}$/.test(parts[1]) &&
            /^\d{4}$/.test(parts[2])
         ) {
            whereConditions.push(
               '(EXTRACT(DAY FROM OS.DTINI_OS) = ? AND EXTRACT(MONTH FROM OS.DTINI_OS) = ? AND EXTRACT(YEAR FROM OS.DTINI_OS) = ?)'
            );
            params.push(
               parseInt(parts[0]),
               parseInt(parts[1]),
               parseInt(parts[2])
            );
         } else {
            whereConditions.push(`CAST(OS.DTINI_OS AS VARCHAR(50)) LIKE ?`);
            params.push(`%${searchValue}%`);
         }
      }

      if (filterDtincOs) {
         let searchValue = filterDtincOs.trim().replace(/\//g, '.');
         // Se só tem números, formata com pontos
         if (/^\d+$/.test(searchValue)) {
            if (searchValue.length === 2) {
               searchValue = searchValue;
            } else if (searchValue.length === 4) {
               searchValue = `${searchValue.substring(0, 2)}.${searchValue.substring(2, 4)}`;
            } else if (searchValue.length === 8) {
               searchValue = `${searchValue.substring(0, 2)}.${searchValue.substring(2, 4)}.${searchValue.substring(4, 8)}`;
            } else if (searchValue.length === 10) {
               searchValue = `${searchValue.substring(0, 2)}.${searchValue.substring(2, 4)}.${searchValue.substring(4, 8)}`;
            }
         }

         const parts = searchValue.split('.');

         if (parts.length === 1 && /^\d{1,2}$/.test(parts[0])) {
            whereConditions.push('EXTRACT(DAY FROM OS.DTINC_OS) = ?');
            params.push(parseInt(parts[0]));
         } else if (
            parts.length === 2 &&
            /^\d{1,2}$/.test(parts[0]) &&
            /^\d{1,2}$/.test(parts[1])
         ) {
            whereConditions.push(
               '(EXTRACT(DAY FROM OS.DTINC_OS) = ? AND EXTRACT(MONTH FROM OS.DTINC_OS) = ?)'
            );
            params.push(parseInt(parts[0]), parseInt(parts[1]));
         } else if (
            parts.length === 3 &&
            /^\d{1,2}$/.test(parts[0]) &&
            /^\d{1,2}$/.test(parts[1]) &&
            /^\d{4}$/.test(parts[2])
         ) {
            whereConditions.push(
               '(EXTRACT(DAY FROM OS.DTINC_OS) = ? AND EXTRACT(MONTH FROM OS.DTINC_OS) = ? AND EXTRACT(YEAR FROM OS.DTINC_OS) = ?)'
            );
            params.push(
               parseInt(parts[0]),
               parseInt(parts[1]),
               parseInt(parts[2])
            );
         } else {
            whereConditions.push(`CAST(OS.DTINC_OS AS VARCHAR(50)) LIKE ?`);
            params.push(`%${searchValue}%`);
         }
      }

      if (filterCompOs) {
         whereConditions.push('UPPER(OS.COMP_OS) LIKE ?');
         params.push(`%${filterCompOs.toUpperCase()}%`);
      }

      if (filterNomeCliente) {
         whereConditions.push('UPPER(Cliente.NOME_CLIENTE) LIKE ?');
         params.push(`%${filterNomeCliente.toUpperCase()}%`);
      }

      if (filterFaturadoOs) {
         let faturadoValue = filterFaturadoOs.toUpperCase().trim();

         // Normaliza valores comuns
         if (faturadoValue === 'SIM' || faturadoValue === 'S') {
            faturadoValue = 'SIM';
         } else if (
            faturadoValue === 'NAO' ||
            faturadoValue === 'NÃO' ||
            faturadoValue === 'N'
         ) {
            faturadoValue = 'NAO';
         }

         // Usa comparação exata para evitar problemas com CHAR
         if (faturadoValue === 'SIM' || faturadoValue === 'NAO') {
            whereConditions.push('TRIM(UPPER(OS.FATURADO_OS)) = ?');
            params.push(faturadoValue);
         } else {
            whereConditions.push('TRIM(UPPER(OS.FATURADO_OS)) LIKE ?');
            params.push(`%${faturadoValue}%`);
         }
      }

      if (filterNomeRecurso) {
         whereConditions.push('UPPER(Recurso.NOME_RECURSO) LIKE ?');
         params.push(`%${filterNomeRecurso.toUpperCase()}%`);
      }

      if (filterValidOs) {
         let validValue = filterValidOs.toUpperCase().trim();

         // Normaliza valores comuns
         if (validValue === 'SIM' || validValue === 'S') {
            validValue = 'SIM';
         } else if (
            validValue === 'NAO' ||
            validValue === 'NÃO' ||
            validValue === 'N'
         ) {
            validValue = 'NAO';
         }

         // Usa comparação exata para evitar problemas com CHAR
         if (validValue === 'SIM' || validValue === 'NAO') {
            whereConditions.push('TRIM(UPPER(OS.VALID_OS)) = ?');
            params.push(validValue);
         } else {
            whereConditions.push('TRIM(UPPER(OS.VALID_OS)) LIKE ?');
            params.push(`%${validValue}%`);
         }
      }

      if (filterNomeTarefa) {
         whereConditions.push('UPPER(Tarefa.NOME_TAREFA) LIKE ?');
         params.push(`%${filterNomeTarefa.toUpperCase()}%`);
      }

      if (filterNomeProjeto) {
         whereConditions.push('UPPER(Projeto.NOME_PROJETO) LIKE ?');
         params.push(`%${filterNomeProjeto.toUpperCase()}%`);
      }

      const sql = `
         SELECT
            os.COD_OS,
            os.CODTRF_OS,
            os.DTINI_OS,
            os.HRINI_OS,
            os.HRFIM_OS,
            os.CODREC_OS,
            os.DTINC_OS,
            os.FATURADO_OS,
            os.COMP_OS,
            os.VALID_OS,
            os.CHAMADO_OS,
            Recurso.COD_RECURSO,
            Recurso.NOME_RECURSO,
            Cliente.COD_CLIENTE,
            Cliente.NOME_CLIENTE,
            Tarefa.COD_TAREFA,
            Tarefa.NOME_TAREFA,
            Projeto.COD_PROJETO,
            Projeto.NOME_PROJETO
         FROM OS os
         LEFT JOIN RECURSO Recurso ON Recurso.COD_RECURSO = os.CODREC_OS
         LEFT JOIN CHAMADO Chamado ON Chamado.COD_CHAMADO = os.CHAMADO_OS
         LEFT JOIN CLIENTE Cliente ON Cliente.COD_CLIENTE = Chamado.COD_CLIENTE
         LEFT JOIN TAREFA Tarefa ON Tarefa.COD_TAREFA = os.CODTRF_OS
         LEFT JOIN PROJETO Projeto ON Projeto.COD_PROJETO = Tarefa.CODPRO_TAREFA
         ${whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : ''}
         ORDER BY os.DTINI_OS DESC, os.COD_OS DESC
         ROWS ${startRow} TO ${endRow};
      `;

      const countSql = `
         SELECT COUNT(*) as TOTAL
         FROM OS os
         LEFT JOIN RECURSO Recurso ON Recurso.COD_RECURSO = os.CODREC_OS
         LEFT JOIN CHAMADO Chamado ON Chamado.COD_CHAMADO = os.CHAMADO_OS
         LEFT JOIN CLIENTE Cliente ON Cliente.COD_CLIENTE = Chamado.COD_CLIENTE
         LEFT JOIN TAREFA Tarefa ON Tarefa.COD_TAREFA = os.CODTRF_OS
         LEFT JOIN PROJETO Projeto ON Projeto.COD_PROJETO = Tarefa.CODPRO_TAREFA
         ${whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      `;

      const [rawOsData, countResult] = await Promise.all([
         firebirdQuery(sql, params),
         firebirdQuery(countSql, params),
      ]);

      const calculateHours = (
         hrini: string | null,
         hrfim: string | null
      ): number | null => {
         if (!hrini || !hrfim) return null;

         try {
            const strHrini = String(hrini).trim();
            const strHrfim = String(hrfim).trim();

            if (!strHrini || !strHrfim) return null;

            const parseTime = (timeStr: string) => {
               const cleanTime = timeStr
                  .replace(/[^0-9]/g, '')
                  .padStart(4, '0');

               if (cleanTime.length < 4) return null;

               const hours = parseInt(cleanTime.substring(0, 2), 10);
               const minutes = parseInt(cleanTime.substring(2, 4), 10);

               if (isNaN(hours) || isNaN(minutes)) return null;
               if (hours > 23 || minutes > 59) return null;

               return hours + minutes / 60;
            };

            const horaInicio = parseTime(strHrini);
            const horaFim = parseTime(strHrfim);

            if (horaInicio === null || horaFim === null) return null;

            let diferenca = horaFim - horaInicio;

            if (diferenca < 0) {
               diferenca += 24;
            }

            return Math.round(diferenca * 100) / 100;
         } catch (error) {
            console.error('Erro ao calcular horas:', error, { hrini, hrfim });
            return null;
         }
      };

      const osData = (rawOsData || []).map((record: any) => {
         const tarefaCompleta =
            record.COD_TAREFA && record.NOME_TAREFA
               ? `${record.COD_TAREFA} - ${record.NOME_TAREFA}`
               : null;

         const projetoCompleto =
            record.COD_PROJETO && record.NOME_PROJETO
               ? `${record.COD_PROJETO} - ${record.NOME_PROJETO}`
               : null;

         return {
            ...record,
            TAREFA_COMPLETA: tarefaCompleta,
            PROJETO_COMPLETO: projetoCompleto,
            QTD_HR_OS: calculateHours(record.HRINI_OS, record.HRFIM_OS),
         };
      });

      const total = countResult[0].TOTAL;
      const totalPages = Math.ceil(total / limit);

      return NextResponse.json(
         {
            data: osData,
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
      console.error('Erro ao buscar dados da OS:', error);
      return NextResponse.json(
         { error: 'Erro interno no servidor' },
         { status: 500 }
      );
   }
}
