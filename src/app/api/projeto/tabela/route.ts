import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';
import { TabelaProjetoProps } from '../../../../types/types';

// ==================== TYPES ====================
interface TokenPayload {
   tipo: string;
   recurso?: {
      id: number;
   };
}

interface PaginationInfo {
   currentPage: number;
   totalPages: number;
   totalRecords: number;
   recordsPerPage: number;
   hasNextPage: boolean;
   hasPrevPage: boolean;
}

interface ApiResponse<T> {
   data?: T;
   pagination?: PaginationInfo;
   error?: string;
}

// ==================== CONSTANTS ====================
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// ==================== ERROR HANDLING ====================
class ApiError extends Error {
   constructor(
      public statusCode: number,
      message: string
   ) {
      super(message);
      this.name = 'ApiError';
   }
}

// ==================== UTILITY FUNCTIONS ====================
function getCleanParam(param: string | null | undefined): string | null {
   if (!param) return null;
   const cleaned = param.trim();
   return cleaned.length > 0 ? cleaned : null;
}

function validatePagination(page: number, limit: number): void {
   if (page < 1 || limit < 1 || limit > MAX_LIMIT) {
      throw new ApiError(
         400,
         `Parâmetros de paginação inválidos. Page deve ser >= 1, limit entre 1 e ${MAX_LIMIT}`
      );
   }
}

// ==================== QUERY BUILDING ====================
function buildWhereConditions(
   searchParams: URLSearchParams,
   isAdmin: boolean,
   codRecurso: number | undefined
): { conditions: string[]; params: any[] } {
   const conditions: string[] = [];
   const params: any[] = [];

   // Filtro por recurso (não admin)
   if (!isAdmin && codRecurso) {
      conditions.push('PROJETO.CODREC_PROJETO = ?');
      params.push(Number(codRecurso));
   }

   // Filtro por código do projeto (query parameter)
   const codProjetoQuery = searchParams.get('codProjeto')?.trim();
   if (codProjetoQuery) {
      conditions.push('PROJETO.COD_PROJETO = ?');
      params.push(Number(codProjetoQuery));
   }

   // ===== FILTROS DE COLUNA =====

   // filter_COD_PROJETO
   const filterCodProjeto = getCleanParam(
      searchParams.get('filter_COD_PROJETO')
   );
   if (filterCodProjeto) {
      const cleanCodProjeto = filterCodProjeto.replace(/[^\d]/g, '');
      if (cleanCodProjeto.length > 0) {
         conditions.push('CAST(PROJETO.COD_PROJETO AS VARCHAR(20)) LIKE ?');
         params.push(`%${cleanCodProjeto}%`);
      }
   }

   // filter_NOME_PROJETO
   const filterNomeProjeto = getCleanParam(
      searchParams.get('filter_NOME_PROJETO')
   );
   if (filterNomeProjeto) {
      conditions.push(
         '(UPPER(PROJETO.NOME_PROJETO) LIKE ? OR CAST(PROJETO.COD_PROJETO AS VARCHAR(20)) LIKE ?)'
      );
      params.push(
         `%${filterNomeProjeto.toUpperCase()}%`,
         `%${filterNomeProjeto}%`
      );
   }

   // filter_PROJETO_COMPLETO
   const filterProjetoCompleto = getCleanParam(
      searchParams.get('filter_PROJETO_COMPLETO')
   );
   if (filterProjetoCompleto) {
      conditions.push(
         '(CAST(PROJETO.COD_PROJETO AS VARCHAR(20)) LIKE ? OR UPPER(PROJETO.NOME_PROJETO) LIKE ?)'
      );
      params.push(
         `%${filterProjetoCompleto}%`,
         `%${filterProjetoCompleto.toUpperCase()}%`
      );
   }

   // filter_COD_CLIENTE
   const filterCodCliente = getCleanParam(
      searchParams.get('filter_COD_CLIENTE')
   );
   if (filterCodCliente) {
      const cleanCodCliente = filterCodCliente.replace(/[^\d]/g, '');
      if (cleanCodCliente.length > 0) {
         conditions.push('CAST(CLIENTE.COD_CLIENTE AS VARCHAR(20)) LIKE ?');
         params.push(`%${cleanCodCliente}%`);
      }
   }

   // filter_NOME_CLIENTE
   const filterNomeCliente = getCleanParam(
      searchParams.get('filter_NOME_CLIENTE')
   );
   if (filterNomeCliente) {
      conditions.push(
         '(UPPER(CLIENTE.NOME_CLIENTE) LIKE ? OR CAST(CLIENTE.COD_CLIENTE AS VARCHAR(20)) LIKE ?)'
      );
      params.push(
         `%${filterNomeCliente.toUpperCase()}%`,
         `%${filterNomeCliente}%`
      );
   }

   // filter_RESPCLI_PROJETO
   const filterRespCliProjeto = getCleanParam(
      searchParams.get('filter_RESPCLI_PROJETO')
   );
   if (filterRespCliProjeto) {
      conditions.push('UPPER(PROJETO.RESPCLI_PROJETO) LIKE ?');
      params.push(`%${filterRespCliProjeto.toUpperCase()}%`);
   }

   // filter_COD_RECURSO
   const filterCodRecurso = getCleanParam(
      searchParams.get('filter_COD_RECURSO')
   );
   if (filterCodRecurso) {
      const cleanCodRecurso = filterCodRecurso.replace(/[^\d]/g, '');
      if (cleanCodRecurso.length > 0) {
         conditions.push('CAST(RECURSO.COD_RECURSO AS VARCHAR(20)) LIKE ?');
         params.push(`%${cleanCodRecurso}%`);
      }
   }

   // filter_NOME_RECURSO
   const filterNomeRecurso = getCleanParam(
      searchParams.get('filter_NOME_RECURSO')
   );
   if (filterNomeRecurso) {
      conditions.push(
         '(UPPER(RECURSO.NOME_RECURSO) LIKE ? OR CAST(RECURSO.COD_RECURSO AS VARCHAR(20)) LIKE ?)'
      );
      params.push(
         `%${filterNomeRecurso.toUpperCase()}%`,
         `%${filterNomeRecurso}%`
      );
   }

   // filter_QTDHORAS_PROJETO
   const filterQtdhorasProjeto = getCleanParam(
      searchParams.get('filter_QTDHORAS_PROJETO')
   );
   if (filterQtdhorasProjeto) {
      const cleanQtdhoras = filterQtdhorasProjeto.replace(/[^\d.,]/g, '');
      if (cleanQtdhoras.length > 0) {
         conditions.push(
            'CAST(PROJETO.QTDHORAS_PROJETO AS VARCHAR(20)) LIKE ?'
         );
         params.push(`%${cleanQtdhoras}%`);
      }
   }

   // filter_STATUS_PROJETO
   const filterStatusProjeto = getCleanParam(
      searchParams.get('filter_STATUS_PROJETO')
   );
   if (filterStatusProjeto) {
      conditions.push('UPPER(TRIM(PROJETO.STATUS_PROJETO)) = UPPER(?)');
      params.push(filterStatusProjeto.trim());
   }

   return { conditions, params };
}

function buildQuery(
   whereConditions: string[],
   startRow: number,
   endRow: number
): string {
   return `
      SELECT
         PROJETO.COD_PROJETO,
         PROJETO.NOME_PROJETO,
         PROJETO.CODCLI_PROJETO,
         PROJETO.RESPCLI_PROJETO,
         PROJETO.PROPOSTA_PROJETO,
         PROJETO.CODREC_PROJETO,
         PROJETO.PERC_PROJETO,
         PROJETO.LOGINC_PROJETO,
         PROJETO.LOGALT_PROJETO,
         PROJETO.QTDHORAS_PROJETO,
         PROJETO.STATUS_PROJETO,
         CLIENTE.COD_CLIENTE,
         CLIENTE.NOME_CLIENTE,
         RECURSO.COD_RECURSO,
         RECURSO.NOME_RECURSO,
         CASE 
            WHEN PROJETO.COD_PROJETO IS NOT NULL AND PROJETO.NOME_PROJETO IS NOT NULL
            THEN CAST(PROJETO.COD_PROJETO AS VARCHAR(20)) || CAST(' - ' AS VARCHAR(3)) || CAST(PROJETO.NOME_PROJETO AS VARCHAR(500))
            ELSE NULL
         END AS PROJETO_COMPLETO,
         
         COALESCE((
            SELECT SUM(
               (CAST(SUBSTRING(OS.HRFIM_OS FROM 1 FOR 2) AS INTEGER) * 60 + 
                CAST(SUBSTRING(OS.HRFIM_OS FROM 3 FOR 2) AS INTEGER))
               -
               (CAST(SUBSTRING(OS.HRINI_OS FROM 1 FOR 2) AS INTEGER) * 60 + 
                CAST(SUBSTRING(OS.HRINI_OS FROM 3 FOR 2) AS INTEGER))
            ) / 60.0
            FROM OS
            INNER JOIN TAREFA ON TAREFA.COD_TAREFA = OS.CODTRF_OS
            WHERE TAREFA.CODPRO_TAREFA = PROJETO.COD_PROJETO
               AND OS.HRINI_OS IS NOT NULL 
               AND OS.HRFIM_OS IS NOT NULL
               AND TRIM(OS.HRINI_OS) <> ''
               AND TRIM(OS.HRFIM_OS) <> ''
         ), 0) AS QTD_HRS_GASTAS
         
      FROM PROJETO
      LEFT JOIN CLIENTE ON PROJETO.CODCLI_PROJETO = CLIENTE.COD_CLIENTE
      LEFT JOIN RECURSO ON PROJETO.CODREC_PROJETO = RECURSO.COD_RECURSO
      ${whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      ORDER BY PROJETO.COD_PROJETO DESC
      ROWS ${startRow} TO ${endRow};
   `;
}

function buildCountQuery(whereConditions: string[]): string {
   return `
      SELECT COUNT(*) as TOTAL
      FROM PROJETO
      LEFT JOIN CLIENTE ON PROJETO.CODCLI_PROJETO = CLIENTE.COD_CLIENTE
      LEFT JOIN RECURSO ON PROJETO.CODREC_PROJETO = RECURSO.COD_RECURSO
      ${whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : ''}
   `;
}

// ==================== AUTH ====================
function verifyToken(authHeader: string | null): TokenPayload {
   if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Token não fornecido');
   }

   const token = authHeader.replace('Bearer ', '');

   if (!process.env.JWT_SECRET) {
      throw new ApiError(500, 'Configuração de segurança inválida');
   }

   try {
      return jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
   } catch (err) {
      throw new ApiError(401, 'Token inválido');
   }
}

// ==================== MAIN HANDLER ====================
export async function GET(request: Request) {
   try {
      // Autenticação
      const decoded = verifyToken(request.headers.get('Authorization'));
      const isAdmin = decoded.tipo === 'ADM';
      const codRecurso = decoded.recurso?.id;

      // Parse URL params
      const { searchParams } = new URL(request.url);

      // Validação de paginação
      const page = parseInt(
         searchParams.get('page') || String(DEFAULT_PAGE),
         10
      );
      const limit = parseInt(
         searchParams.get('limit') || String(DEFAULT_LIMIT),
         10
      );
      validatePagination(page, limit);

      const startRow = (page - 1) * limit + 1;
      const endRow = page * limit;

      // Validação de acesso
      if (!isAdmin && !codRecurso) {
         throw new ApiError(
            400,
            'Usuário não admin precisa ter codRecurso definido'
         );
      }

      // Construção de condições WHERE
      const { conditions: whereConditions, params } = buildWhereConditions(
         searchParams,
         isAdmin,
         codRecurso
      );

      // Construção de queries
      const sql = buildQuery(whereConditions, startRow, endRow);
      const countSql = buildCountQuery(whereConditions);

      // Execução paralela
      const [rawProjetosData, countResult] = await Promise.all([
         firebirdQuery(sql, params),
         firebirdQuery(countSql, params),
      ]);

      // Processamento de dados
      const projetosData: TabelaProjetoProps[] = rawProjetosData.map(
         (record: TabelaProjetoProps) => ({
            ...record,
         })
      );

      // Cálculo de paginação
      const total = countResult[0].TOTAL;
      const totalPages = Math.ceil(total / limit);

      const response: ApiResponse<TabelaProjetoProps[]> = {
         data: projetosData,
         pagination: {
            currentPage: page,
            totalPages,
            totalRecords: total,
            recordsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
         },
      };

      return NextResponse.json(response, { status: 200 });
   } catch (error) {
      console.error('=== ERRO NA REQUISIÇÃO ===');
      console.error('Tipo de erro:', error?.constructor?.name);
      console.error('Erro completo:', error);

      if (error instanceof ApiError) {
         console.error('ApiError detectado:', error.message);
         return NextResponse.json(
            { error: error.message },
            { status: error.statusCode }
         );
      }

      if (error instanceof Error) {
         console.error('Error genérico:');
         console.error('- Mensagem:', error.message);
         console.error('- Stack:', error.stack);
         console.error('- Nome:', error.name);
      }

      return NextResponse.json(
         {
            error: 'Erro interno no servidor',
            details:
               error instanceof Error ? error.message : 'Erro desconhecido',
         },
         { status: 500 }
      );
   }
}
