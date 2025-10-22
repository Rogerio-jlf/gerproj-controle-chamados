import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';
import { TabelaTarefaProps } from '../../../../types/types';

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

function formatDateSearchValue(searchValue: string): string {
   let value = searchValue;

   if (/^\d+$/.test(value)) {
      if (value.length === 2) {
         return value;
      } else if (value.length === 4) {
         return `${value.substring(0, 2)}.${value.substring(2, 4)}`;
      } else if (value.length === 8 || value.length === 10) {
         return `${value.substring(0, 2)}.${value.substring(2, 4)}.${value.substring(4, 8)}`;
      }
   }

   return value;
}

function buildDateFilter(
   fieldName: string,
   searchValue: string
): { condition: string; params: number[] } {
   const formattedValue = formatDateSearchValue(
      searchValue.trim().replace(/\//g, '.')
   );
   const parts = formattedValue.split('.');

   if (parts.length === 1 && /^\d{1,2}$/.test(parts[0])) {
      return {
         condition: `EXTRACT(DAY FROM ${fieldName}) = ?`,
         params: [parseInt(parts[0])],
      };
   } else if (
      parts.length === 2 &&
      /^\d{1,2}$/.test(parts[0]) &&
      /^\d{1,2}$/.test(parts[1])
   ) {
      return {
         condition: `(EXTRACT(DAY FROM ${fieldName}) = ? AND EXTRACT(MONTH FROM ${fieldName}) = ?)`,
         params: [parseInt(parts[0]), parseInt(parts[1])],
      };
   } else if (
      parts.length === 3 &&
      /^\d{1,2}$/.test(parts[0]) &&
      /^\d{1,2}$/.test(parts[1]) &&
      /^\d{4}$/.test(parts[2])
   ) {
      return {
         condition: `(EXTRACT(DAY FROM ${fieldName}) = ? AND EXTRACT(MONTH FROM ${fieldName}) = ? AND EXTRACT(YEAR FROM ${fieldName}) = ?)`,
         params: [parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2])],
      };
   } else {
      return {
         condition: `CAST(${fieldName} AS VARCHAR(50)) LIKE ?`,
         params: [],
      };
   }
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

   // Filtro padrão: apenas tarefas dos últimos 5 anos para evitar dados corrompidos
   // conditions.push('EXTRACT(YEAR FROM TAREFA.DTSOL_TAREFA) >= ?');
   // params.push(new Date().getFullYear() - 5);

   // Filtro por recurso
   if (!isAdmin && codRecurso) {
      conditions.push('TAREFA.CODREC_TAREFA = ?');
      params.push(Number(codRecurso));
   }

   // Filtro por código da tarefa
   const codTarefaQuery = searchParams.get('codTarefa')?.trim();
   if (codTarefaQuery) {
      conditions.push('TAREFA.COD_TAREFA = ?');
      params.push(Number(codTarefaQuery));
   }

   // ===== FILTROS DE COLUNA =====
   // filter_COD_TAREFA
   const filterCodTarefa = getCleanParam(searchParams.get('filter_COD_TAREFA'));
   if (filterCodTarefa) {
      const cleanCodTarefa = filterCodTarefa.replace(/[^\d]/g, '');
      if (cleanCodTarefa.length > 0) {
         conditions.push('CAST(TAREFA.COD_TAREFA AS VARCHAR(20)) LIKE ?');
         params.push(`%${cleanCodTarefa}%`);
      }
   }
   // =====

   // filter_NOME_TAREFA
   const filterNomeTarefa = getCleanParam(
      searchParams.get('filter_NOME_TAREFA')
   );

   if (filterNomeTarefa) {
      conditions.push(
         '(UPPER(TAREFA.NOME_TAREFA) LIKE ? OR CAST(TAREFA.COD_TAREFA AS VARCHAR(20)) LIKE ?)'
      );
      params.push(
         `%${filterNomeTarefa.toUpperCase()}%`,
         `%${filterNomeTarefa}%`
      );
   }
   // =====

   // filter_TAREFA_COMPLETA
   const filterTarefaCompleta = getCleanParam(
      searchParams.get('filter_TAREFA_COMPLETA')
   );
   if (filterTarefaCompleta) {
      conditions.push(
         '(CAST(TAREFA.COD_TAREFA AS VARCHAR(20)) LIKE ? OR UPPER(TAREFA.NOME_TAREFA) LIKE ?)'
      );
      params.push(
         `%${filterTarefaCompleta}%`,
         `%${filterTarefaCompleta.toUpperCase()}%`
      );
   }
   // =====

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
   // =====

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
   // =====

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
   // =====

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
   // =====

   // filter_NOME_CLIENTE
   const filterNomeCliente = getCleanParam(
      searchParams.get('filter_NOME_CLIENTE')
   );
   if (filterNomeCliente) {
      conditions.push('UPPER(CLIENTE.NOME_CLIENTE) LIKE ?');
      params.push(`%${filterNomeCliente.toUpperCase()}%`);
   }
   // =====

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
   // =====

   // filter_NOME_RECURSO
   const filterNomeRecurso = getCleanParam(
      searchParams.get('filter_NOME_RECURSO')
   );
   if (filterNomeRecurso) {
      conditions.push('UPPER(RECURSO.NOME_RECURSO) LIKE ?');
      params.push(`%${filterNomeRecurso.toUpperCase()}%`);
   }
   // =====

   // filter_DTSOL_TAREFA
   const filterDtsolTarefa = getCleanParam(
      searchParams.get('filter_DTSOL_TAREFA')
   );
   if (filterDtsolTarefa) {
      const dateFilter = buildDateFilter(
         'TAREFA.DTSOL_TAREFA',
         filterDtsolTarefa
      );
      if (dateFilter.params.length > 0) {
         conditions.push(dateFilter.condition);
         params.push(...dateFilter.params);
      } else {
         const searchValue = formatDateSearchValue(
            filterDtsolTarefa.trim().replace(/\//g, '.')
         );
         conditions.push('CAST(TAREFA.DTSOL_TAREFA AS VARCHAR(50)) LIKE ?');
         params.push(`%${searchValue}%`);
      }
   }
   // =====

   // filter_DTAPROV_TAREFA
   const filterDtaprovTarefa = getCleanParam(
      searchParams.get('filter_DTAPROV_TAREFA')
   );
   if (filterDtaprovTarefa) {
      const dateFilter = buildDateFilter(
         'TAREFA.DTAPROV_TAREFA',
         filterDtaprovTarefa
      );
      if (dateFilter.params.length > 0) {
         conditions.push(dateFilter.condition);
         params.push(...dateFilter.params);
      } else {
         const searchValue = formatDateSearchValue(
            filterDtaprovTarefa.trim().replace(/\//g, '.')
         );
         conditions.push('CAST(TAREFA.DTAPROV_TAREFA AS VARCHAR(50)) LIKE ?');
         params.push(`%${searchValue}%`);
      }
   }
   // =====

   // filter_DTPREVENT_TAREFA
   const filterDtpreventTarefa = getCleanParam(
      searchParams.get('filter_DTPREVENT_TAREFA')
   );
   if (filterDtpreventTarefa) {
      const dateFilter = buildDateFilter(
         'TAREFA.DTPREVENT_TAREFA',
         filterDtpreventTarefa
      );
      if (dateFilter.params.length > 0) {
         conditions.push(dateFilter.condition);
         params.push(...dateFilter.params);
      } else {
         const searchValue = formatDateSearchValue(
            filterDtpreventTarefa.trim().replace(/\//g, '.')
         );
         conditions.push('CAST(TAREFA.DTPREVENT_TAREFA AS VARCHAR(50)) LIKE ?');
         params.push(`%${searchValue}%`);
      }
   }
   // =====

   // filter_HREST_TAREFA
   const filterHrestTarefa = getCleanParam(
      searchParams.get('filter_HREST_TAREFA')
   );
   if (filterHrestTarefa) {
      const cleanHrest = filterHrestTarefa.replace(/[^\d.,]/g, '');
      if (cleanHrest.length > 0) {
         conditions.push('CAST(TAREFA.HREST_TAREFA AS VARCHAR(20)) LIKE ?');
         params.push(`%${cleanHrest}%`);
      }
   }
   // =====

   // filter_QTD_HRS_GASTAS
   const filterStatusTarefa = getCleanParam(
      searchParams.get('filter_STATUS_TAREFA')
   );
   if (filterStatusTarefa) {
      const cleanStatus = filterStatusTarefa.replace(/[^\d]/g, '');
      if (cleanStatus.length > 0) {
         conditions.push('CAST(TAREFA.STATUS_TAREFA AS VARCHAR(10)) LIKE ?');
         params.push(`%${cleanStatus}%`);
      }
   }
   // =====

   // filter_TIPO_TAREFA_COMPLETO
   const filterTipoTarefaCompleto = getCleanParam(
      searchParams.get('filter_TIPO_TAREFA_COMPLETO')
   );
   if (filterTipoTarefaCompleto) {
      conditions.push(
         '(CAST(TIPOTRF.COD_TIPOTRF AS VARCHAR(20)) LIKE ? OR UPPER(TIPOTRF.NOME_TIPOTRF) LIKE ?)'
      );
      params.push(
         `%${filterTipoTarefaCompleto}%`,
         `%${filterTipoTarefaCompleto.toUpperCase()}%`
      );
   }
   // ====

   return { conditions, params };
}

function buildQuery(
   whereConditions: string[],
   startRow: number,
   endRow: number
): string {
   return `
      SELECT
         tarefa.COD_TAREFA,
         tarefa.NOME_TAREFA,
         CASE 
            WHEN tarefa.COD_TAREFA IS NOT NULL AND tarefa.NOME_TAREFA IS NOT NULL 
            THEN CAST(tarefa.COD_TAREFA AS VARCHAR(20)) || CAST(' - ' AS VARCHAR(3)) || CAST(tarefa.NOME_TAREFA AS VARCHAR(500))
            ELSE NULL
         END AS TAREFA_COMPLETA,
         tarefa.CODPRO_TAREFA,
         tarefa.CODREC_TAREFA,
         tarefa.DTSOL_TAREFA,
         tarefa.HREST_TAREFA,
         tarefa.HRATESC_TAREFA,
         tarefa.MARGEM_TAREFA,
         tarefa.STATUS_TAREFA,
         tarefa.ORDEM_TAREFA,
         tarefa.COD_AREA,
         tarefa.ESTIMADO_TAREFA,
         tarefa.COD_TIPOTRF,
         tarefa.CODRECRESP_TAREFA,
         tarefa.HRREAL_TAREFA,
         tarefa.FATEST_TAREFA,
         tarefa.COD_FASE,
         tarefa.VALINI_TAREFA,
         tarefa.VALFIM_TAREFA,
         tarefa.PERIMP_TAREFA,
         tarefa.DTAPROV_TAREFA,
         tarefa.DTPREVENT_TAREFA,
         tarefa.DTINC_TAREFA,
         tarefa.PERC_TAREFA,
         tarefa.FATURA_TAREFA,
         tarefa.VALIDA_TAREFA,
         tarefa.VRHR_TAREFA,
         CAST(tarefa.OBS_TAREFA AS VARCHAR(8000)) AS OBS_TAREFA,
         tarefa.LIMMES_TAREFA,
         tarefa.EXIBECHAM_TAREFA,
         
         COALESCE((
            SELECT SUM(
               (CAST(SUBSTRING(OS.HRFIM_OS FROM 1 FOR 2) AS INTEGER) * 60 + 
                CAST(SUBSTRING(OS.HRFIM_OS FROM 3 FOR 2) AS INTEGER))
               -
               (CAST(SUBSTRING(OS.HRINI_OS FROM 1 FOR 2) AS INTEGER) * 60 + 
                CAST(SUBSTRING(OS.HRINI_OS FROM 3 FOR 2) AS INTEGER))
            ) / 60.0
            FROM OS
            WHERE OS.CODTRF_OS = tarefa.COD_TAREFA
               AND OS.HRINI_OS IS NOT NULL 
               AND OS.HRFIM_OS IS NOT NULL
               AND TRIM(OS.HRINI_OS) <> ''
               AND TRIM(OS.HRFIM_OS) <> ''
         ), 0) AS QTD_HRS_GASTAS,
         
         Recurso.COD_RECURSO,
         Recurso.NOME_RECURSO,
         RecursoResponsavel.NOME_RECURSO AS NOME_RECURSO_RESPONSAVEL,

         Projeto.COD_PROJETO,
         Projeto.NOME_PROJETO,
         CASE 
         WHEN Projeto.COD_PROJETO IS NOT NULL AND Projeto.NOME_PROJETO IS NOT NULL
         THEN CAST(Projeto.COD_PROJETO AS VARCHAR(20)) || CAST(' - ' AS VARCHAR(3)) || CAST(Projeto.NOME_PROJETO AS VARCHAR(500))
         ELSE NULL
         END AS PROJETO_COMPLETO,
         Projeto.CODCLI_PROJETO,

         Cliente.COD_CLIENTE,
         Cliente.NOME_CLIENTE,
         
         TipoTrf.COD_TIPOTRF AS TIPOTRF_COD_TIPOTRF,
         TipoTrf.NOME_TIPOTRF,
         CASE 
            WHEN TipoTrf.COD_TIPOTRF IS NOT NULL AND TipoTrf.NOME_TIPOTRF IS NOT NULL
            THEN CAST(TipoTrf.COD_TIPOTRF AS VARCHAR(20)) || CAST(' - ' AS VARCHAR(3)) || CAST(TipoTrf.NOME_TIPOTRF AS VARCHAR(500))
            ELSE NULL
         END AS TIPO_TAREFA_COMPLETO
         
      FROM TAREFA tarefa
      LEFT JOIN RECURSO Recurso ON Recurso.COD_RECURSO = tarefa.CODREC_TAREFA
      LEFT JOIN RECURSO RecursoResponsavel ON RecursoResponsavel.COD_RECURSO = tarefa.CODRECRESP_TAREFA
      LEFT JOIN PROJETO Projeto ON Projeto.COD_PROJETO = tarefa.CODPRO_TAREFA
      LEFT JOIN CLIENTE Cliente ON Cliente.COD_CLIENTE = Projeto.CODCLI_PROJETO
      LEFT JOIN TIPOTRF TipoTrf ON TipoTrf.COD_TIPOTRF = tarefa.COD_TIPOTRF      
      ${whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      ORDER BY tarefa.COD_TAREFA DESC
      ROWS ${startRow} TO ${endRow};
   `;
}

function buildCountQuery(whereConditions: string[]): string {
   return `
      SELECT COUNT(*) as TOTAL
      FROM TAREFA tarefa
      LEFT JOIN RECURSO Recurso ON Recurso.COD_RECURSO = tarefa.CODREC_TAREFA
      LEFT JOIN RECURSO RecursoResponsavel ON RecursoResponsavel.COD_RECURSO = tarefa.CODRECRESP_TAREFA
      LEFT JOIN PROJETO Projeto ON Projeto.COD_PROJETO = tarefa.CODPRO_TAREFA
      LEFT JOIN CLIENTE Cliente ON Cliente.COD_CLIENTE = Projeto.CODCLI_PROJETO
      LEFT JOIN TIPOTRF TipoTrf ON TipoTrf.COD_TIPOTRF = tarefa.COD_TIPOTRF
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
      const [rawTarefasData, countResult] = await Promise.all([
         firebirdQuery(sql, params),
         firebirdQuery(countSql, params),
      ]);

      // Processamento de dados
      const tarefasData: TabelaTarefaProps[] = rawTarefasData.map(
         (record: TabelaTarefaProps) => ({
            ...record,
            QTD_HRS_GASTAS: record.QTD_HRS_GASTAS
               ? Number(record.QTD_HRS_GASTAS)
               : 0,
         })
      );

      // Cálculo de paginação
      const total = countResult[0].TOTAL;
      const totalPages = Math.ceil(total / limit);

      const response: ApiResponse<TabelaTarefaProps[]> = {
         data: tarefasData,
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
