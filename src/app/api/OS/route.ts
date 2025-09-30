import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../lib/firebird/firebird-client';

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

      // Verifica e decodifica o token
      const token = authHeader.replace('Bearer ', '');
      let decoded: any;

      // Verifica o token JWT
      try {
         decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'minha_chave_secreta'
         );
      } catch (err) {
         return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }

      // Pega informações do usuário do token
      const isAdmin = decoded.tipo === 'ADM';
      // Pega o código do recurso se existir
      const codRecurso = decoded.recurso?.id;

      // Pega parâmetros da query
      const { searchParams } = new URL(request.url);
      const mesParam = searchParams.get('mes');
      const anoParam = searchParams.get('ano');
      const diaParam = searchParams.get('dia');
      const codOsQuery = searchParams.get('codOs')?.trim();

      // Pega os parâmetros de paginação (com defaults)
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '20', 10);

      // Validação dos parâmetros de paginação
      if (page < 1 || limit < 1 || limit > 100) {
         return NextResponse.json(
            {
               error: 'Parâmetros de paginação inválidos. Page deve ser >= 1, limit entre 1 e 100',
            },
            { status: 400 }
         );
      }

      // Calcula o range
      const startRow = (page - 1) * limit + 1;
      const endRow = page * limit;

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

      // Validação para dia (aceita número ou "todos")
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

      // Usuários não admin devem obrigatoriamente ter codRecurso definido
      if (!isAdmin && !codRecurso) {
         return NextResponse.json(
            { error: 'Usuário não admin precisa ter codRecurso definido' },
            { status: 400 }
         );
      }

      // Monta as condições do WHERE dinamicamente
      const whereConditions: string[] = [];
      // Array de parâmetros para a query
      const params: any[] = [];

      // Função auxiliar para formatar data para Firebird
      const formatDateForFirebird = (date: Date): string => {
         const year = date.getFullYear();
         const month = String(date.getMonth() + 1).padStart(2, '0');
         const day = String(date.getDate()).padStart(2, '0');
         return `${year}-${month}-${day}`;
      };

      // Filtro por data - com suporte a ano, mês e dia
      if (anoNumber && mesNumber && diaNumber) {
         // Ano, mês e dia específicos - filtro por data exata
         whereConditions.push(
            'EXTRACT(YEAR FROM OS.DTINI_OS) = ? AND EXTRACT(MONTH FROM OS.DTINI_OS) = ? AND EXTRACT(DAY FROM OS.DTINI_OS) = ?'
         );
         params.push(anoNumber, mesNumber, diaNumber);
      } else if (anoNumber && mesNumber && !diaNumber) {
         // Ano e mês específicos, todos os dias - filtro por mês/ano
         whereConditions.push(
            'EXTRACT(YEAR FROM OS.DTINI_OS) = ? AND EXTRACT(MONTH FROM OS.DTINI_OS) = ?'
         );
         params.push(anoNumber, mesNumber);
      } else if (anoNumber && !mesNumber && !diaNumber) {
         // Apenas ano específico - filtro por ano todo
         whereConditions.push('EXTRACT(YEAR FROM OS.DTINI_OS) = ?');
         params.push(anoNumber);
      } else if (!anoNumber && mesNumber && !diaNumber) {
         // Apenas mês específico - filtro por mês em todos os anos
         whereConditions.push('EXTRACT(MONTH FROM OS.DTINI_OS) = ?');
         params.push(mesNumber);
      } else if (!anoNumber && !mesNumber && diaNumber) {
         // Apenas dia específico - filtro por dia em todos os meses/anos
         whereConditions.push('EXTRACT(DAY FROM OS.DTINI_OS) = ?');
         params.push(diaNumber);
      } else if (!anoNumber && mesNumber && diaNumber) {
         // Mês e dia específicos, todos os anos
         whereConditions.push(
            'EXTRACT(MONTH FROM OS.DTINI_OS) = ? AND EXTRACT(DAY FROM OS.DTINI_OS) = ?'
         );
         params.push(mesNumber, diaNumber);
      } else if (anoNumber && !mesNumber && diaNumber) {
         // Ano e dia específicos, todos os meses
         whereConditions.push(
            'EXTRACT(YEAR FROM OS.DTINI_OS) = ? AND EXTRACT(DAY FROM OS.DTINI_OS) = ?'
         );
         params.push(anoNumber, diaNumber);
      }

      // Filtro por recurso baseado no tipo de usuário
      if (!isAdmin && codRecurso) {
         whereConditions.push('OS.CODREC_OS = ?');
         params.push(Number(codRecurso));
      }

      // Filtro por código da OS
      if (codOsQuery) {
         whereConditions.push('OS.COD_OS = ?');
         params.push(Number(codOsQuery));
      }

      // Monta a query final com paginação - VERSÃO SIMPLIFICADA
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

      // Query para contar o total de registros (sem paginação)
      const countSql = `
         SELECT COUNT(*) as TOTAL
         FROM OS os
         ${whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      `;

      // Log para debug
      console.log('Query SQL:', sql);
      console.log('Parâmetros:', params);
      console.log('Where Conditions:', whereConditions);

      // Executa as queries com tratamento de erro individual
      let rawOsData: any[] = [];
      let countResult: any[] = [];

      try {
         // Tenta executar o COUNT primeiro (mais simples)
         countResult = await firebirdQuery(countSql, params);
         console.log('Count Result:', countResult);

         // Se o count for 0, não precisa buscar os dados
         if (countResult && countResult[0] && countResult[0].TOTAL > 0) {
            console.log('Executando query principal...');
            rawOsData = await firebirdQuery(sql, params);
            console.log('Dados retornados:', rawOsData.length);
         }
      } catch (queryError) {
         console.error('Erro específico na query:', queryError);
         console.error('SQL que causou erro:', sql);
         console.error('Params que causaram erro:', params);
         console.error('GDS Code:', (queryError as any)?.gdscode);
         console.error('Message:', (queryError as any)?.message);

         // Retorna resposta vazia em caso de erro na query
         return NextResponse.json(
            {
               data: [],
               pagination: {
                  currentPage: page,
                  totalPages: 0,
                  totalRecords: 0,
                  recordsPerPage: limit,
                  hasNextPage: false,
                  hasPrevPage: false,
               },
               error: 'Erro ao buscar dados. Possível problema com dados corrompidos no banco.',
            },
            { status: 200 }
         );
      }

      // ✅ CORREÇÃO: Validação robusta dos resultados
      if (
         !countResult ||
         !Array.isArray(countResult) ||
         countResult.length === 0
      ) {
         return NextResponse.json(
            {
               data: [],
               pagination: {
                  currentPage: page,
                  totalPages: 0,
                  totalRecords: 0,
                  recordsPerPage: limit,
                  hasNextPage: false,
                  hasPrevPage: false,
               },
            },
            { status: 200 }
         );
      }

      const total = countResult[0]?.TOTAL || 0;
      const totalPages = Math.ceil(total / limit);

      // Se não houver registros, retorna array vazio
      if (total === 0) {
         return NextResponse.json(
            {
               data: [],
               pagination: {
                  currentPage: page,
                  totalPages: 0,
                  totalRecords: 0,
                  recordsPerPage: limit,
                  hasNextPage: false,
                  hasPrevPage: false,
               },
            },
            { status: 200 }
         );
      }

      // Função para calcular horas - VERSÃO MAIS PERMISSIVA
      const calculateHours = (
         hrini: string | null,
         hrfim: string | null
      ): number | null => {
         if (!hrini || !hrfim) return null;

         try {
            // Converte para string e remove espaços
            const strHrini = String(hrini).trim();
            const strHrfim = String(hrfim).trim();

            if (!strHrini || !strHrfim) return null;

            // Parse dos horários no formato HHMM (ex: "0800", "1230")
            const parseTime = (timeStr: string) => {
               // Remove qualquer caractere não numérico
               const cleanTime = timeStr
                  .replace(/[^0-9]/g, '')
                  .padStart(4, '0');

               if (cleanTime.length < 4) return null;

               const hours = parseInt(cleanTime.substring(0, 2), 10);
               const minutes = parseInt(cleanTime.substring(2, 4), 10);

               // Validação básica
               if (isNaN(hours) || isNaN(minutes)) return null;
               if (hours > 23 || minutes > 59) return null;

               return hours + minutes / 60;
            };

            const horaInicio = parseTime(strHrini);
            const horaFim = parseTime(strHrfim);

            if (horaInicio === null || horaFim === null) return null;

            let diferenca = horaFim - horaInicio;

            // Se a hora final for menor que a inicial, assumimos que passou para o próximo dia
            if (diferenca < 0) {
               diferenca += 24;
            }

            return Math.round(diferenca * 100) / 100; // Arredonda para 2 casas decimais
         } catch (error) {
            console.error('Erro ao calcular horas:', error, { hrini, hrfim });
            return null;
         }
      };

      // ✅ CORREÇÃO: Validação de rawOsData antes do map + adiciona campos calculados
      const osData = (rawOsData || []).map((record: any) => {
         // Adiciona os campos calculados que estavam na query anterior
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
      // ✅ CORREÇÃO: Logs mais detalhados para debug
      console.error('Detalhes do erro:', {
         message: (error as any)?.message,
         stack: (error as any)?.stack,
         gdscode: (error as any)?.gdscode,
      });
      return NextResponse.json(
         { error: 'Erro interno no servidor' },
         { status: 500 }
      );
   }
}
