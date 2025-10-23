import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';
import { TabelaChamadoProps } from '../../../../types/types';

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
const MIN_YEAR = 2000;
const MAX_YEAR = 3000;
const MIN_MONTH = 1;
const MAX_MONTH = 12;
const MIN_DAY = 1;
const MAX_DAY = 31;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const FINALIZED_STATUS = 'FINALIZADO';

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

function formatHora(hora: string | number | null): string | null {
   if (!hora) return null;

   const str = hora.toString().padStart(4, '0');
   const hh = str.substring(0, 2);
   const mm = str.substring(2, 4);

   return `${hh}:${mm}`;
}

function formatDateSearchValue(searchValue: string): string {
   let value = searchValue;

   if (/^\d+$/.test(value)) {
      if (value.length === 2) {
         return value;
      } else if (value.length === 4) {
         return `${value.substring(0, 2)}.${value.substring(2, 4)}`;
      } else if (value.length === 8) {
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

function formatDateEnvioSearchValue(searchValue: string): string {
   let value = searchValue;

   if (/^\d+$/.test(value)) {
      if (value.length === 2) {
         return value + '/';
      } else if (value.length === 4) {
         return `${value.substring(0, 2)}/${value.substring(2, 4)}`;
      } else if (value.length === 8) {
         return `${value.substring(0, 2)}/${value.substring(2, 4)}/${value.substring(4, 8)}`;
      }
   }

   return value;
}

function formatDataHoraChamado(
   dataChamado: string | null,
   horaChamado: string | number | null
): string | null {
   if (!dataChamado) return null;

   const data = new Date(dataChamado);
   const dia = String(data.getDate()).padStart(2, '0');
   const mes = String(data.getMonth() + 1).padStart(2, '0');
   const ano = data.getFullYear();
   const dataFormatada = `${dia}/${mes}/${ano}`;

   const horaFormatada = formatHora(horaChamado);

   return horaFormatada ? `${dataFormatada} - ${horaFormatada}` : dataFormatada;
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
         'Chamado.DATA_CHAMADO IS NOT NULL AND EXTRACT(YEAR FROM Chamado.DATA_CHAMADO) = ? AND EXTRACT(MONTH FROM Chamado.DATA_CHAMADO) = ? AND EXTRACT(DAY FROM Chamado.DATA_CHAMADO) = ?'
      );
      params.push(ano, mes, dia);
   } else if (ano && mes && !dia) {
      conditions.push(
         'Chamado.DATA_CHAMADO IS NOT NULL AND EXTRACT(YEAR FROM Chamado.DATA_CHAMADO) = ? AND EXTRACT(MONTH FROM Chamado.DATA_CHAMADO) = ?'
      );
      params.push(ano, mes);
   } else if (ano && !mes && !dia) {
      conditions.push(
         'Chamado.DATA_CHAMADO IS NOT NULL AND EXTRACT(YEAR FROM Chamado.DATA_CHAMADO) = ?'
      );
      params.push(ano);
   } else if (!ano && mes && !dia) {
      conditions.push(
         'Chamado.DATA_CHAMADO IS NOT NULL AND EXTRACT(MONTH FROM Chamado.DATA_CHAMADO) = ?'
      );
      params.push(mes);
   } else if (!ano && !mes && dia) {
      conditions.push(
         'Chamado.DATA_CHAMADO IS NOT NULL AND EXTRACT(DAY FROM Chamado.DATA_CHAMADO) = ?'
      );
      params.push(dia);
   } else if (!ano && mes && dia) {
      conditions.push(
         'Chamado.DATA_CHAMADO IS NOT NULL AND EXTRACT(MONTH FROM Chamado.DATA_CHAMADO) = ? AND EXTRACT(DAY FROM Chamado.DATA_CHAMADO) = ?'
      );
      params.push(mes, dia);
   } else if (ano && !mes && dia) {
      conditions.push(
         'Chamado.DATA_CHAMADO IS NOT NULL AND EXTRACT(YEAR FROM Chamado.DATA_CHAMADO) = ? AND EXTRACT(DAY FROM Chamado.DATA_CHAMADO) = ?'
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
      conditions.push('Chamado.COD_RECURSO = ?');
      params.push(Number(codRecurso));
   }

   // Filtro de status para não-admin
   if (!isAdmin) {
      conditions.push('Chamado.STATUS_CHAMADO != ?');
      params.push(FINALIZED_STATUS);
   }

   // Filtro por código do chamado
   const codChamadoQuery = searchParams.get('codChamado')?.trim();
   if (codChamadoQuery) {
      conditions.push('Chamado.COD_CHAMADO = ?');
      params.push(Number(codChamadoQuery));
   }

   // ===== FILTROS DE COLUNA =====
   const filterCodChamado = getCleanParam(
      searchParams.get('filter_COD_CHAMADO')
   );
   if (filterCodChamado) {
      conditions.push('CAST(Chamado.COD_CHAMADO AS VARCHAR(20)) LIKE ?');
      params.push(`%${filterCodChamado}%`);
   }

   const filterDataChamado = getCleanParam(
      searchParams.get('filter_DATA_CHAMADO')
   );
   if (filterDataChamado) {
      const dateFilter = buildDateFilter(
         'Chamado.DATA_CHAMADO',
         filterDataChamado
      );
      if (dateFilter.params.length > 0) {
         conditions.push(dateFilter.condition);
         params.push(...dateFilter.params);
      } else {
         const searchValue = formatDateSearchValue(
            filterDataChamado.trim().replace(/\//g, '.')
         );
         conditions.push('CAST(Chamado.DATA_CHAMADO AS VARCHAR(50)) LIKE ?');
         params.push(`%${searchValue}%`);
      }
   }

   const filterDataEnvio = getCleanParam(
      searchParams.get('filter_DTENVIO_CHAMADO')
   );
   if (filterDataEnvio) {
      const searchValue = formatDateEnvioSearchValue(filterDataEnvio);
      conditions.push('Chamado.DTENVIO_CHAMADO LIKE ?');
      params.push(`${searchValue}%`);
   }

   const filterAssunto = getCleanParam(
      searchParams.get('filter_ASSUNTO_CHAMADO')
   );
   if (filterAssunto) {
      conditions.push('UPPER(Chamado.ASSUNTO_CHAMADO) LIKE ?');
      params.push(`%${filterAssunto.toUpperCase()}%`);
   }

   const filterStatus = getCleanParam(
      searchParams.get('filter_STATUS_CHAMADO')
   );
   if (filterStatus) {
      conditions.push('UPPER(Chamado.STATUS_CHAMADO) LIKE ?');
      params.push(`%${filterStatus.toUpperCase()}%`);
   }

   const filterNomeRecurso = getCleanParam(
      searchParams.get('filter_NOME_RECURSO')
   );
   if (filterNomeRecurso) {
      conditions.push('UPPER(Recurso.NOME_RECURSO) LIKE ?');
      params.push(`%${filterNomeRecurso.toUpperCase()}%`);
   }

   const filterNomeCliente = getCleanParam(
      searchParams.get('filter_NOME_CLIENTE')
   );
   if (filterNomeCliente) {
      conditions.push('UPPER(Cliente.NOME_CLIENTE) LIKE ?');
      params.push(`%${filterNomeCliente.toUpperCase()}%`);
   }

   const filterEmailChamado = getCleanParam(
      searchParams.get('filter_EMAIL_CHAMADO')
   );
   if (filterEmailChamado) {
      conditions.push('UPPER(Chamado.EMAIL_CHAMADO) LIKE ?');
      params.push(`%${filterEmailChamado.toUpperCase()}%`);
   }

   // Filtro global
   const globalFilter = getCleanParam(searchParams.get('globalFilter'));
   if (globalFilter) {
      const globalCondition = `(
         CAST(Chamado.COD_CHAMADO AS VARCHAR(20)) LIKE ? OR
         UPPER(Chamado.ASSUNTO_CHAMADO) LIKE ? OR
         UPPER(Chamado.STATUS_CHAMADO) LIKE ? OR
         UPPER(Recurso.NOME_RECURSO) LIKE ? OR
         UPPER(Cliente.NOME_CLIENTE) LIKE ? OR
         UPPER(Chamado.EMAIL_CHAMADO) LIKE ?
      )`;
      conditions.push(globalCondition);
      const globalValue = `%${globalFilter.toUpperCase()}%`;
      params.push(
         globalValue,
         globalValue,
         globalValue,
         globalValue,
         globalValue,
         globalValue
      );
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
         Chamado.COD_CHAMADO,
         Chamado.DATA_CHAMADO,
         Chamado.HORA_CHAMADO,
         Chamado.STATUS_CHAMADO,
         Chamado.DTENVIO_CHAMADO,
         Chamado.COD_RECURSO,
         Chamado.CODTRF_CHAMADO,
         Chamado.COD_CLIENTE,
         Chamado.ASSUNTO_CHAMADO,
         Chamado.EMAIL_CHAMADO,
         Chamado.PRIOR_CHAMADO,
         Chamado.COD_CLASSIFICACAO,
         Recurso.NOME_RECURSO,
         Cliente.NOME_CLIENTE,
         Classificacao.NOME_CLASSIFICACAO,
         Tarefa.COD_TAREFA,
         Tarefa.NOME_TAREFA,
         Projeto.COD_PROJETO,
         Projeto.NOME_PROJETO
      FROM CHAMADO Chamado
      LEFT JOIN RECURSO Recurso ON Recurso.COD_RECURSO = Chamado.COD_RECURSO
      LEFT JOIN CLIENTE Cliente ON Cliente.COD_CLIENTE = Chamado.COD_CLIENTE
      LEFT JOIN CLASSIFICACAO Classificacao ON Classificacao.COD_CLASSIFICACAO = Chamado.COD_CLASSIFICACAO
      LEFT JOIN TAREFA Tarefa ON Tarefa.COD_TAREFA = Chamado.CODTRF_CHAMADO
      LEFT JOIN PROJETO Projeto ON Projeto.COD_PROJETO = Tarefa.CODPRO_TAREFA
      ${whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      ORDER BY Chamado.DATA_CHAMADO DESC, Chamado.COD_CHAMADO DESC
      ROWS ${startRow} TO ${endRow};
   `;
}

function buildCountQuery(whereConditions: string[]): string {
   return `
      SELECT COUNT(*) as TOTAL
      FROM CHAMADO Chamado
      LEFT JOIN RECURSO Recurso ON Recurso.COD_RECURSO = Chamado.COD_RECURSO
      LEFT JOIN CLIENTE Cliente ON Cliente.COD_CLIENTE = Chamado.COD_CLIENTE
      LEFT JOIN CLASSIFICACAO Classificacao ON Classificacao.COD_CLASSIFICACAO = Chamado.COD_CLASSIFICACAO
      LEFT JOIN TAREFA Tarefa ON Tarefa.COD_TAREFA = Chamado.CODTRF_CHAMADO
      LEFT JOIN PROJETO Projeto ON Projeto.COD_PROJETO = Tarefa.CODPRO_TAREFA
      ${whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : ''}
   `;
}

// ==================== DATA PROCESSING ====================
function processChamadoRecord(record: any): TabelaChamadoProps {
   const tarefaCompleta =
      record.COD_TAREFA && record.NOME_TAREFA
         ? `${record.COD_TAREFA} - ${record.NOME_TAREFA}`
         : null;

   const projetoCompleto =
      record.COD_PROJETO && record.NOME_PROJETO
         ? `${record.COD_PROJETO} - ${record.NOME_PROJETO}`
         : null;

   const dataHora = formatDataHoraChamado(
      record.DATA_CHAMADO,
      record.HORA_CHAMADO
   );

   return {
      ...record,
      TAREFA_COMPLETA: tarefaCompleta,
      PROJETO_COMPLETO: projetoCompleto,
      DATA_HORA_CHAMADO: dataHora,
   };
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
      const [rawChamados, countResult] = await Promise.all([
         firebirdQuery(sql, params),
         firebirdQuery(countSql, params),
      ]);

      // Processamento de dados
      const chamados: TabelaChamadoProps[] = (rawChamados || []).map(
         processChamadoRecord
      );

      // Cálculo de paginação
      const total = countResult[0].TOTAL;
      const totalPages = Math.ceil(total / limit);

      const response: ApiResponse<TabelaChamadoProps[]> = {
         data: chamados,
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
      console.error('Erro ao buscar chamados abertos:', error);

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
