import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';
import { TabelaOSProps } from '../../../../types/types';

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

interface DateFilter {
   condition: string;
   params: number[];
}

// ==================== CONSTANTS ====================
const MAX_HOURS = 23;
const MAX_MINUTES = 59;
const MIN_YEAR = 2000;
const MAX_YEAR = 3000;
const MIN_MONTH = 1;
const MAX_MONTH = 12;
const MIN_DAY = 1;
const MAX_DAY = 31;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const HOURS_IN_DAY = 24;

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

function validateDateParams(
   mesParam: string | null,
   anoParam: string | null,
   diaParam: string | null
): { mes: number | null; ano: number | null; dia: number | null } {
   let mes: number | null = null;
   if (mesParam && mesParam !== 'todos') {
      mes = Number(mesParam);
      if (isNaN(mes) || mes < MIN_MONTH || mes > MAX_MONTH) {
         throw new ApiError(400, "Parâmetro 'mês' inválido");
      }
   }

   let ano: number | null = null;
   if (anoParam && anoParam !== 'todos') {
      ano = Number(anoParam);
      if (isNaN(ano) || ano < MIN_YEAR || ano > MAX_YEAR) {
         throw new ApiError(400, "Parâmetro 'ano' inválido");
      }
   }

   let dia: number | null = null;
   if (diaParam && diaParam !== 'todos') {
      dia = Number(diaParam);
      if (isNaN(dia) || dia < MIN_DAY || dia > MAX_DAY) {
         throw new ApiError(400, "Parâmetro 'dia' inválido");
      }
   }

   return { mes, ano, dia };
}

function parseTime(timeStr: string): number | null {
   const cleanTime = timeStr.replace(/[^0-9]/g, '').padStart(4, '0');

   if (cleanTime.length < 4) return null;

   const hours = parseInt(cleanTime.substring(0, 2), 10);
   const minutes = parseInt(cleanTime.substring(2, 4), 10);

   if (isNaN(hours) || isNaN(minutes)) return null;
   if (hours > MAX_HOURS || minutes > MAX_MINUTES) return null;

   return hours + minutes / 60;
}

function calculateHours(
   hrini: string | null,
   hrfim: string | null
): number | null {
   if (!hrini || !hrfim) return null;

   try {
      const strHrini = String(hrini).trim();
      const strHrfim = String(hrfim).trim();

      if (!strHrini || !strHrfim) return null;

      const horaInicio = parseTime(strHrini);
      const horaFim = parseTime(strHrfim);

      if (horaInicio === null || horaFim === null) return null;

      let diferenca = horaFim - horaInicio;

      if (diferenca < 0) {
         diferenca += HOURS_IN_DAY;
      }

      return Math.round(diferenca * 100) / 100;
   } catch (error) {
      console.error('Erro ao calcular horas:', error, { hrini, hrfim });
      return null;
   }
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

function buildDateFilter(fieldName: string, searchValue: string): DateFilter {
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

function normalizeYesNoValue(value: string): string {
   const normalized = value.toUpperCase().trim();

   if (normalized === 'SIM' || normalized === 'S') {
      return 'SIM';
   } else if (
      normalized === 'NAO' ||
      normalized === 'NÃO' ||
      normalized === 'N'
   ) {
      return 'NAO';
   }

   return normalized;
}

// Função para converter strings vazias em null
function sanitizeEmptyStrings(value: any): any {
   if (typeof value === 'string' && value.trim() === '') {
      return null;
   }
   return value;
}

// Função para processar todo o registro
function processRecord(record: any): TabelaOSProps {
   const sanitized: any = {};

   for (const key in record) {
      sanitized[key] = sanitizeEmptyStrings(record[key]);
   }

   return {
      ...sanitized,
      QTD_HR_OS: calculateHours(sanitized.HRINI_OS, sanitized.HRFIM_OS),
   };
}

// ==================== QUERY BUILDING ====================
function buildMainDateFilters(
   ano: number | null,
   mes: number | null,
   dia: number | null
): { conditions: string[]; params: number[] } {
   const conditions: string[] = [];
   const params: number[] = [];

   if (ano && mes && dia) {
      conditions.push(
         'OS.DTINI_OS IS NOT NULL AND EXTRACT(YEAR FROM OS.DTINI_OS) = ? AND EXTRACT(MONTH FROM OS.DTINI_OS) = ? AND EXTRACT(DAY FROM OS.DTINI_OS) = ?'
      );
      params.push(ano, mes, dia);
   } else if (ano && mes && !dia) {
      conditions.push(
         'OS.DTINI_OS IS NOT NULL AND EXTRACT(YEAR FROM OS.DTINI_OS) = ? AND EXTRACT(MONTH FROM OS.DTINI_OS) = ?'
      );
      params.push(ano, mes);
   } else if (ano && !mes && !dia) {
      conditions.push(
         'OS.DTINI_OS IS NOT NULL AND EXTRACT(YEAR FROM OS.DTINI_OS) = ?'
      );
      params.push(ano);
   } else if (!ano && mes && !dia) {
      conditions.push(
         'OS.DTINI_OS IS NOT NULL AND EXTRACT(MONTH FROM OS.DTINI_OS) = ?'
      );
      params.push(mes);
   } else if (!ano && !mes && dia) {
      conditions.push(
         'OS.DTINI_OS IS NOT NULL AND EXTRACT(DAY FROM OS.DTINI_OS) = ?'
      );
      params.push(dia);
   } else if (!ano && mes && dia) {
      conditions.push(
         'OS.DTINI_OS IS NOT NULL AND EXTRACT(MONTH FROM OS.DTINI_OS) = ? AND EXTRACT(DAY FROM OS.DTINI_OS) = ?'
      );
      params.push(mes, dia);
   } else if (ano && !mes && dia) {
      conditions.push(
         'OS.DTINI_OS IS NOT NULL AND EXTRACT(YEAR FROM OS.DTINI_OS) = ? AND EXTRACT(DAY FROM OS.DTINI_OS) = ?'
      );
      params.push(ano, dia);
   }

   return { conditions, params };
}

function buildWhereConditions(
   searchParams: URLSearchParams,
   isAdmin: boolean,
   codRecurso: number | undefined,
   ano: number | null,
   mes: number | null,
   dia: number | null
): { conditions: string[]; params: any[] } {
   const conditions: string[] = [];
   const params: any[] = [];

   // Filtros de data principal
   const mainDateFilters = buildMainDateFilters(ano, mes, dia);
   conditions.push(...mainDateFilters.conditions);
   params.push(...mainDateFilters.params);

   // Filtro por recurso
   if (!isAdmin && codRecurso) {
      conditions.push('OS.CODREC_OS = ?');
      params.push(Number(codRecurso));
   }

   // Filtro por código da OS
   const codOsQuery = searchParams.get('codOs')?.trim();
   if (codOsQuery) {
      conditions.push('OS.COD_OS = ?');
      params.push(Number(codOsQuery));
   }

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

   // ===== FILTROS DE COLUNA =====
   const filterChamadoOs = getCleanParam(searchParams.get('filter_CHAMADO_OS'));
   if (filterChamadoOs) {
      const cleanChamado = filterChamadoOs.replace(/[^\w\s]/g, '');
      conditions.push('UPPER(OS.CHAMADO_OS) LIKE ?');
      params.push(`%${cleanChamado.toUpperCase()}%`);
   }

   const filterCodOs = getCleanParam(searchParams.get('filter_COD_OS'));
   if (filterCodOs) {
      const cleanCodOs = filterCodOs.replace(/[^\d]/g, '');
      if (cleanCodOs.length > 0) {
         conditions.push('CAST(OS.COD_OS AS VARCHAR(20)) LIKE ?');
         params.push(`%${cleanCodOs}%`);
      }
   }

   const filterCodtrfOs = getCleanParam(searchParams.get('filter_CODTRF_OS'));
   if (filterCodtrfOs) {
      const cleanCodtrf = filterCodtrfOs.replace(/[^\d]/g, '');
      if (cleanCodtrf.length > 0) {
         conditions.push('CAST(OS.CODTRF_OS AS VARCHAR(20)) LIKE ?');
         params.push(`%${cleanCodtrf}%`);
      }
   }

   const filterDtiniOs = getCleanParam(searchParams.get('filter_DTINI_OS'));
   if (filterDtiniOs) {
      const dateFilter = buildDateFilter('OS.DTINI_OS', filterDtiniOs);
      if (dateFilter.params.length > 0) {
         conditions.push(dateFilter.condition);
         params.push(...dateFilter.params);
      } else {
         const searchValue = formatDateSearchValue(
            filterDtiniOs.trim().replace(/\//g, '.')
         );
         conditions.push('CAST(OS.DTINI_OS AS VARCHAR(50)) LIKE ?');
         params.push(`%${searchValue}%`);
      }
   }

   const filterDtincOs = getCleanParam(searchParams.get('filter_DTINC_OS'));
   if (filterDtincOs) {
      const dateFilter = buildDateFilter('OS.DTINC_OS', filterDtincOs);
      if (dateFilter.params.length > 0) {
         conditions.push(dateFilter.condition);
         params.push(...dateFilter.params);
      } else {
         const searchValue = formatDateSearchValue(
            filterDtincOs.trim().replace(/\//g, '.')
         );
         conditions.push('CAST(OS.DTINC_OS AS VARCHAR(50)) LIKE ?');
         params.push(`%${searchValue}%`);
      }
   }

   const filterCompOs = getCleanParam(searchParams.get('filter_COMP_OS'));
   if (filterCompOs) {
      let searchValue = filterCompOs.trim();
      const cleanValue = searchValue.replace(/[\/\s]/g, '');

      if (/^\d+$/.test(cleanValue) && cleanValue.length >= 6) {
         const mes = cleanValue.substring(0, 2);
         const ano = cleanValue.substring(2);
         searchValue = `${mes}/${ano}`;
      }

      conditions.push(
         "REPLACE(REPLACE(UPPER(OS.COMP_OS), '/', ''), ' ', '') LIKE ?"
      );
      params.push(`%${cleanValue.toUpperCase()}%`);
   }

   const filterNomeCliente = getCleanParam(
      searchParams.get('filter_NOME_CLIENTE')
   );
   if (filterNomeCliente) {
      conditions.push('UPPER(Cliente.NOME_CLIENTE) LIKE ?');
      params.push(`%${filterNomeCliente.toUpperCase()}%`);
   }

   const filterFaturadoOs = getCleanParam(
      searchParams.get('filter_FATURADO_OS')
   );
   if (filterFaturadoOs) {
      const faturadoValue = normalizeYesNoValue(filterFaturadoOs);

      if (faturadoValue === 'SIM' || faturadoValue === 'NAO') {
         conditions.push('TRIM(UPPER(OS.FATURADO_OS)) = ?');
         params.push(faturadoValue);
      } else {
         conditions.push('TRIM(UPPER(OS.FATURADO_OS)) LIKE ?');
         params.push(`%${faturadoValue}%`);
      }
   }

   const filterNomeRecurso = getCleanParam(
      searchParams.get('filter_NOME_RECURSO')
   );
   if (filterNomeRecurso) {
      conditions.push('UPPER(Recurso.NOME_RECURSO) LIKE ?');
      params.push(`%${filterNomeRecurso.toUpperCase()}%`);
   }

   const filterValidOs = getCleanParam(searchParams.get('filter_VALID_OS'));
   if (filterValidOs) {
      const validValue = normalizeYesNoValue(filterValidOs);

      if (validValue === 'SIM' || validValue === 'NAO') {
         conditions.push('TRIM(UPPER(OS.VALID_OS)) = ?');
         params.push(validValue);
      } else {
         conditions.push('TRIM(UPPER(OS.VALID_OS)) LIKE ?');
         params.push(`%${validValue}%`);
      }
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
         os.COD_OS,
         os.CODTRF_OS,
         os.DTINI_OS,
         os.HRINI_OS,
         os.HRFIM_OS,
         CAST(os.OBS_OS AS VARCHAR(8000)) AS OBS_OS,
         os.STATUS_OS,
         os.PRODUTIVO_OS,
         os.CODREC_OS,
         os.PRODUTIVO2_OS,
         os.RESPCLI_OS,
         os.REMDES_OS,
         os.ABONO_OS,
         os.DESLOC_OS,
         CAST(os.OBS AS VARCHAR(8000)) AS OBS,
         os.DTINC_OS,
         os.FATURADO_OS,
         os.PERC_OS,
         os.COD_FATURAMENTO,
         os.COMP_OS,
         os.VALID_OS,
         os.VRHR_OS,
         os.NUM_OS,
         os.CHAMADO_OS,
         Recurso.COD_RECURSO,
         Recurso.NOME_RECURSO,
         Cliente.COD_CLIENTE,
         Cliente.NOME_CLIENTE,
         Tarefa.NOME_TAREFA,
         CASE 
            WHEN os.CODTRF_OS IS NOT NULL AND Tarefa.NOME_TAREFA IS NOT NULL 
            THEN CAST(os.CODTRF_OS AS VARCHAR(20)) || CAST(' - ' AS VARCHAR(3)) || CAST(Tarefa.NOME_TAREFA AS VARCHAR(500))
            ELSE NULL
         END AS TAREFA_COMPLETA,
         Projeto.COD_PROJETO,
         Projeto.NOME_PROJETO,
         CASE 
            WHEN Projeto.COD_PROJETO IS NOT NULL AND Projeto.NOME_PROJETO IS NOT NULL 
            THEN CAST(Projeto.COD_PROJETO AS VARCHAR(20)) || CAST(' - ' AS VARCHAR(3)) || CAST(Projeto.NOME_PROJETO AS VARCHAR(500))
            ELSE NULL
         END AS PROJETO_COMPLETO
      FROM OS os
      LEFT JOIN RECURSO Recurso ON Recurso.COD_RECURSO = os.CODREC_OS
      LEFT JOIN CHAMADO Chamado ON Chamado.COD_CHAMADO = CAST(NULLIF(TRIM(os.CHAMADO_OS), '') AS INTEGER)
      LEFT JOIN CLIENTE Cliente ON Cliente.COD_CLIENTE = Chamado.COD_CLIENTE
      LEFT JOIN TAREFA Tarefa ON Tarefa.COD_TAREFA = os.CODTRF_OS
      LEFT JOIN PROJETO Projeto ON Projeto.COD_PROJETO = Tarefa.CODPRO_TAREFA
      ${whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      ORDER BY os.COD_OS DESC, os.DTINI_OS DESC
      ROWS ${startRow} TO ${endRow};
   `;
}

function buildCountQuery(whereConditions: string[]): string {
   return `
      SELECT COUNT(*) as TOTAL
      FROM OS os
      LEFT JOIN RECURSO Recurso ON Recurso.COD_RECURSO = os.CODREC_OS
      LEFT JOIN CHAMADO Chamado ON Chamado.COD_CHAMADO = CAST(NULLIF(TRIM(os.CHAMADO_OS), '') AS INTEGER)
      LEFT JOIN CLIENTE Cliente ON Cliente.COD_CLIENTE = Chamado.COD_CLIENTE
      LEFT JOIN TAREFA Tarefa ON Tarefa.COD_TAREFA = os.CODTRF_OS
      LEFT JOIN PROJETO Projeto ON Projeto.COD_PROJETO = Tarefa.CODPRO_TAREFA
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
      const mesParam = searchParams.get('mes');
      const anoParam = searchParams.get('ano');
      const diaParam = searchParams.get('dia');

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

      // Validação de datas
      const { mes, ano, dia } = validateDateParams(
         mesParam,
         anoParam,
         diaParam
      );

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
         codRecurso,
         ano,
         mes,
         dia
      );

      // Construção de queries
      const sql = buildQuery(whereConditions, startRow, endRow);
      const countSql = buildCountQuery(whereConditions);

      // Execução paralela
      const [rawOsData, countResult] = await Promise.all([
         firebirdQuery(sql, params),
         firebirdQuery(countSql, params),
      ]);

      // Processamento de dados - converte strings vazias em null
      const osData: TabelaOSProps[] = (rawOsData || []).map(processRecord);

      // Cálculo de paginação
      const total = countResult[0].TOTAL;
      const totalPages = Math.ceil(total / limit);

      const response: ApiResponse<TabelaOSProps[]> = {
         data: osData,
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
      console.error('Erro ao buscar dados da OS:', error);

      if (error instanceof ApiError) {
         return NextResponse.json(
            { error: error.message },
            { status: error.statusCode }
         );
      }

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
