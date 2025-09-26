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

      // Filtro por data - com suporte a ano, mês e dia
      if (anoNumber && mesNumber && diaNumber) {
         // Ano, mês e dia específicos - filtro por data exata
         const dataEspecifica = new Date(anoNumber, mesNumber - 1, diaNumber);
         const proximoDia = new Date(anoNumber, mesNumber - 1, diaNumber + 1);
         whereConditions.push('OS.DTINI_OS >= ? AND OS.DTINI_OS < ?');
         params.push(dataEspecifica, proximoDia);
      } else if (anoNumber && mesNumber && !diaNumber) {
         // Ano e mês específicos, todos os dias - filtro por mês/ano
         const dataInicio = new Date(anoNumber, mesNumber - 1, 1);
         const dataFim = new Date(anoNumber, mesNumber, 1);
         whereConditions.push('OS.DTINI_OS >= ? AND OS.DTINI_OS < ?');
         params.push(dataInicio, dataFim);
      } else if (anoNumber && !mesNumber && !diaNumber) {
         // Apenas ano específico - filtro por ano todo
         const dataInicio = new Date(anoNumber, 0, 1);
         const dataFim = new Date(anoNumber + 1, 0, 1);
         whereConditions.push('OS.DTINI_OS >= ? AND OS.DTINI_OS < ?');
         params.push(dataInicio, dataFim);
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

      // Monta a query final com paginação
      const sql = `
         SELECT
            os.COD_OS,
            os.DTINI_OS,
            os.HRINI_OS,
            os.HRFIM_OS,
            os.CODREC_OS,
            os.DTINC_OS,
            os.FATURADO_OS,
            os.COMP_OS,
            os.VALID_OS,
            os.CHAMADO_OS,
            Recurso.NOME_RECURSO
         FROM OS os
         LEFT JOIN RECURSO Recurso ON Recurso.COD_RECURSO = os.CODREC_OS
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

      // Executa as queries em paralelo
      const [OS, countResult] = await Promise.all([
         firebirdQuery(sql, params),
         firebirdQuery(countSql, params),
      ]);

      // Calcula total de páginas
      const total = countResult[0].TOTAL;
      // totalPages
      const totalPages = Math.ceil(total / limit);

      return NextResponse.json(
         {
            data: OS,
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
