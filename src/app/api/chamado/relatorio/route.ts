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

type AgrupamentoTipo = 'cliente' | 'recurso' | 'mes';

interface Totalizadores {
   totalGeralChamados: number;
   totalGeralChamadosAbertos: number;
   totalGeralChamadosFinalizados: number;
   totalGeralChamadosPendentes: number;
   totalGeralHorasGastas: number;
}

interface GrupoRelatorio {
   chave: string;
   nome: string;
   quantidadeChamados: number;
   quantidadeChamadosAbertos: number;
   quantidadeChamadosFinalizados: number;
   quantidadeChamadosPendentes: number;
   quantidadeHorasGastas: number;
   detalhes: DetalheChamado[];
}

interface DetalheChamado {
   codChamado: number;
   dataChamado: string;
   horaChamado: string;
   assuntoChamado: string | null;
   emailChamado: string | null;
   nomeRecurso: string | null;
   dtEnvioChamado: string | null;
   quantidadeHorasGastasChamado: number | null;
   statusChamado: string;
   conclusaoChamado: string | null;
   nomeClassificacao: string | null;
}

// ==================== CONSTANTS ====================
const STATUS_ABERTO = ['AGUARDANDO VALIDACAO', 'EM ATENDIMENTO', 'STANDBY'];
const STATUS_FECHADO = ['FINALIZADO'];
const STATUS_PENDENTE = ['NAO FINALIZADO', 'NAO INICIADO'];

const VALID_AGRUPAMENTOS: AgrupamentoTipo[] = ['cliente', 'recurso', 'mes'];
const VALID_FORMATOS = ['json', 'csv'] as const;

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

/**
 * Remove espaços em branco de um parâmetro e retorna null se vazio
 */
function getCleanParam(param: string | null | undefined): string | null {
   if (!param) return null;
   const cleaned = param.trim();
   return cleaned.length > 0 ? cleaned : null;
}

/**
 * Converte DTENVIO_CHAMADO do formato VARCHAR "DD/MM/YYYY - HH:MM" para ISO string
 * Exemplo: "31/10/2025 - 12:50" -> "2025-10-31T12:50:00.000Z"
 */
function parseDtEnvioChamado(dtEnvio: string | null): string | null {
   if (!dtEnvio) return null;

   try {
      const cleaned = dtEnvio.trim();

      // Formato esperado: "DD/MM/YYYY - HH:MM" ou "DD/MM/YYYY-HH:MM"
      const regex = /^(\d{2})\/(\d{2})\/(\d{4})\s*-?\s*(\d{2}):(\d{2})$/;
      const match = cleaned.match(regex);

      if (!match) return null;

      const [, dia, mes, ano, hora, minuto] = match;

      // Valida os valores
      const d = parseInt(dia, 10);
      const m = parseInt(mes, 10);
      const y = parseInt(ano, 10);
      const h = parseInt(hora, 10);
      const min = parseInt(minuto, 10);

      if (d < 1 || d > 31 || m < 1 || m > 12 || h > 23 || min > 59) {
         return null;
      }

      // Cria a data no formato ISO
      const dataISO = new Date(y, m - 1, d, h, min, 0, 0);
      return dataISO.toISOString();
   } catch (error) {
      console.error('❌ Erro ao converter DTENVIO_CHAMADO:', error, {
         dtEnvio,
      });
      return null;
   }
}

/**
 * Converte string de data em objeto com ano, mês e dia
 * Aceita formatos: DD/MM/YYYY, YYYY-MM-DD, DDMMYYYY, DD.MM.YYYY
 */
function parseDateInput(
   dateStr: string
): { ano: number; mes: number; dia: number } | null {
   const trimmed = dateStr.trim();
   const cleanDate = trimmed.replace(/[\/\-\.\s]/g, '');

   // Tenta formato numérico puro (8 dígitos)
   if (/^\d{8}$/.test(cleanDate)) {
      // Tenta DDMMYYYY
      const dia = parseInt(cleanDate.substring(0, 2), 10);
      const mes = parseInt(cleanDate.substring(2, 4), 10);
      const ano = parseInt(cleanDate.substring(4, 8), 10);

      if (
         dia >= 1 &&
         dia <= 31 &&
         mes >= 1 &&
         mes <= 12 &&
         ano >= 1900 &&
         ano <= 2100
      ) {
         return { ano, mes, dia };
      }

      // Tenta YYYYMMDD
      const ano2 = parseInt(cleanDate.substring(0, 4), 10);
      const mes2 = parseInt(cleanDate.substring(4, 6), 10);
      const dia2 = parseInt(cleanDate.substring(6, 8), 10);

      if (
         dia2 >= 1 &&
         dia2 <= 31 &&
         mes2 >= 1 &&
         mes2 <= 12 &&
         ano2 >= 1900 &&
         ano2 <= 2100
      ) {
         return { ano: ano2, mes: mes2, dia: dia2 };
      }
   }

   // Tenta formatos com separadores (/, -, .)
   const separators = ['/', '-', '.'];
   for (const sep of separators) {
      if (trimmed.includes(sep)) {
         const parts = trimmed.split(sep);
         if (parts.length === 3) {
            const p1 = parseInt(parts[0], 10);
            const p2 = parseInt(parts[1], 10);
            const p3 = parseInt(parts[2], 10);

            // Formato YYYY-MM-DD
            if (
               parts[0].length === 4 &&
               p1 >= 1900 &&
               p1 <= 2100 &&
               p2 >= 1 &&
               p2 <= 12 &&
               p3 >= 1 &&
               p3 <= 31
            ) {
               return { ano: p1, mes: p2, dia: p3 };
            }

            // Formato DD/MM/YYYY
            if (
               p1 >= 1 &&
               p1 <= 31 &&
               p2 >= 1 &&
               p2 <= 12 &&
               p3 >= 1900 &&
               p3 <= 2100
            ) {
               return { ano: p3, mes: p2, dia: p1 };
            }
         }
         break;
      }
   }

   return null;
}

/**
 * Valida se as datas de início e fim são válidas
 */
function validateDateRange(dataInicio: string, dataFim: string): void {
   const dateIni = parseDateInput(dataInicio);
   const dateFim = parseDateInput(dataFim);

   if (!dateIni || !dateFim) {
      throw new ApiError(
         400,
         'Datas inválidas. Use formatos como: YYYY-MM-DD, DD/MM/YYYY ou DDMMYYYY'
      );
   }
}

/**
 * Valida se mês e ano são válidos
 */
function validateMesAno(mes: number, ano: number): void {
   if (isNaN(mes) || mes < 1 || mes > 12 || isNaN(ano)) {
      throw new ApiError(400, 'Mês ou ano inválido');
   }
}

/**
 * Valida o tipo de agrupamento solicitado
 */
function validateAgrupamento(agruparPor: string): AgrupamentoTipo {
   if (!VALID_AGRUPAMENTOS.includes(agruparPor as AgrupamentoTipo)) {
      throw new ApiError(
         400,
         `Agrupamento inválido. Use: ${VALID_AGRUPAMENTOS.join(', ')}`
      );
   }
   return agruparPor as AgrupamentoTipo;
}

/**
 * Converte string de hora (HHMM) em decimal (ex: 14:30 = 14.5)
 */
function parseTime(timeStr: string): number | null {
   const cleanTime = timeStr.replace(/[^0-9]/g, '').padStart(4, '0');

   if (cleanTime.length < 4) return null;

   const hours = parseInt(cleanTime.substring(0, 2), 10);
   const minutes = parseInt(cleanTime.substring(2, 4), 10);

   if (isNaN(hours) || isNaN(minutes) || hours > 23 || minutes > 59) {
      return null;
   }

   // Retorna em formato decimal (ex: 14:30 = 14.5)
   return hours + minutes / 60;
}

/**
 * Calcula a diferença de horas entre hora inicial e final
 * Considera casos onde a hora final passa da meia-noite
 */
function calculateHours(hrini: string | null, hrfim: string | null): number {
   if (!hrini || !hrfim) return 0;

   try {
      const strHrini = String(hrini).trim();
      const strHrfim = String(hrfim).trim();

      if (!strHrini || !strHrfim) return 0;

      const horaInicio = parseTime(strHrini);
      const horaFim = parseTime(strHrfim);

      if (horaInicio === null || horaFim === null) return 0;

      let diferenca = horaFim - horaInicio;

      if (diferenca < 0) {
         diferenca += 24;
      }

      // ✅ CORREÇÃO: 2 casas decimais
      return Math.round(diferenca * 100) / 100;
   } catch (error) {
      console.error('❌ Erro ao calcular horas:', error, { hrini, hrfim });
      return 0;
   }
}

/**
 * Calcula em lote as horas gastas em cada chamado
 * Busca todas as OS relacionadas aos chamados e soma as horas
 */
async function calcularHorasGastasPorChamado(
   codChamados: number[]
): Promise<Map<number, number>> {
   if (codChamados.length === 0) return new Map();

   try {
      const placeholders = codChamados.map(() => '?').join(', ');

      const query = `
         SELECT 
            OS.CHAMADO_OS,
            OS.HRINI_OS,
            OS.HRFIM_OS
         FROM OS
         WHERE OS.CHAMADO_OS IN (${placeholders})
            AND OS.HRINI_OS IS NOT NULL 
            AND OS.HRINI_OS != ''
            AND OS.HRFIM_OS IS NOT NULL
            AND OS.HRFIM_OS != ''
      `;

      const osRecords = await firebirdQuery(query, codChamados.map(String));
      const horasPorChamado = new Map<number, number>();

      codChamados.forEach(cod => horasPorChamado.set(cod, 0));

      if (!osRecords || osRecords.length === 0) return horasPorChamado;

      for (const os of osRecords) {
         const codChamadoNumerico = codChamados.find(
            cod => cod.toString() === os.CHAMADO_OS
         );
         if (!codChamadoNumerico) continue;

         const horas = calculateHours(os.HRINI_OS, os.HRFIM_OS);
         const horasAtuais = horasPorChamado.get(codChamadoNumerico) || 0;
         horasPorChamado.set(codChamadoNumerico, horasAtuais + horas);
      }

      // ❌ REMOVA ESTE TRECHO:
      // horasPorChamado.forEach((horas, cod) => {
      //    horasPorChamado.set(cod, Math.round(horas * 10000) / 10000);
      // });

      return horasPorChamado;
   } catch (error) {
      console.error('❌ Erro ao calcular horas gastas em lote:', error);
      const fallbackMap = new Map<number, number>();
      codChamados.forEach(cod => fallbackMap.set(cod, 0));
      return fallbackMap;
   }
}

// ==================== DATA PROCESSING ====================

/**
 * Processa um registro de chamado, formatando datas e adicionando horas gastas
 */
async function processRecord(
   record: any,
   horasMap: Map<number, number>
): Promise<TabelaChamadoProps> {
   return {
      ...record,
      DATA_CHAMADO: record.DATA_CHAMADO ? new Date(record.DATA_CHAMADO) : null,
      DTENVIO_CHAMADO: parseDtEnvioChamado(record.DTENVIO_CHAMADO), // ✅ CORRIGIDO
      CONCLUSAO_CHAMADO: record.CONCLUSAO_CHAMADO
         ? new Date(record.CONCLUSAO_CHAMADO)
         : null,
      STATUS_CHAMADO: record.STATUS_CHAMADO?.trim() || null,
      TOTAL_HORAS_GASTAS: horasMap.get(record.COD_CHAMADO) || 0,
   };
}

/**
 * Agrupa chamados por cliente, recurso ou mês
 * Calcula totalizadores para cada grupo (qtd chamados, horas, status)
 */
function agruparDados(
   processedData: TabelaChamadoProps[],
   agruparPor: AgrupamentoTipo
): GrupoRelatorio[] {
   const grupos: Record<string, GrupoRelatorio> = {};

   processedData.forEach(chamado => {
      const { chave, nomeGrupo } = getGrupoKey(chamado, agruparPor);

      if (!grupos[chave]) {
         grupos[chave] = {
            chave,
            nome: nomeGrupo,
            quantidadeChamados: 0,
            quantidadeChamadosAbertos: 0,
            quantidadeChamadosFinalizados: 0,
            quantidadeChamadosPendentes: 0,
            quantidadeHorasGastas: 0,
            detalhes: [],
         };
      }

      grupos[chave].quantidadeHorasGastas += chamado.TOTAL_HORAS_GASTAS || 0;
      grupos[chave].quantidadeChamados += 1;

      const statusUpper = chamado.STATUS_CHAMADO?.toUpperCase().trim() || '';
      if (STATUS_ABERTO.includes(statusUpper)) {
         grupos[chave].quantidadeChamadosAbertos += 1;
      } else if (STATUS_FECHADO.includes(statusUpper)) {
         grupos[chave].quantidadeChamadosFinalizados += 1;
      } else if (STATUS_PENDENTE.includes(statusUpper)) {
         grupos[chave].quantidadeChamadosPendentes += 1;
      }

      grupos[chave].detalhes.push(buildDetalheChamado(chamado, agruparPor));
   });

   return Object.values(grupos);
}

/**
 * Define a chave e nome do grupo baseado no tipo de agrupamento
 */
function getGrupoKey(
   chamado: TabelaChamadoProps,
   agruparPor: AgrupamentoTipo
): { chave: string; nomeGrupo: string } {
   switch (agruparPor) {
      case 'cliente':
         return {
            chave: `${chamado.COD_CLIENTE || 'SEM_CLIENTE'}`,
            nomeGrupo: chamado.NOME_CLIENTE || 'Sem Cliente',
         };

      case 'recurso':
         return {
            chave: `${chamado.COD_RECURSO || 'SEM_RECURSO'}`,
            nomeGrupo: chamado.NOME_RECURSO || 'Sem Recurso',
         };

      case 'mes':
         if (chamado.DATA_CHAMADO) {
            const data = new Date(chamado.DATA_CHAMADO);
            const mes = data.getMonth() + 1;
            const ano = data.getFullYear();
            return {
               chave: `${ano}-${mes.toString().padStart(2, '0')}`,
               nomeGrupo: `${mes.toString().padStart(2, '0')}/${ano}`,
            };
         }
         return { chave: 'SEM_DATA', nomeGrupo: 'Sem Data' };

      default:
         return {
            chave: `${chamado.COD_CLIENTE || 'SEM_CLIENTE'}`,
            nomeGrupo: chamado.NOME_CLIENTE || 'Sem Cliente',
         };
   }
}

/**
 * Constrói objeto de detalhe do chamado para inclusão no grupo
 * Remove campo nomeRecurso quando agrupado por recurso (evita redundância)
 */
function buildDetalheChamado(
   chamado: TabelaChamadoProps,
   agruparPor: AgrupamentoTipo
): DetalheChamado {
   return {
      codChamado: chamado.COD_CHAMADO,
      dataChamado: chamado.DATA_CHAMADO,
      horaChamado: chamado.HORA_CHAMADO,
      assuntoChamado: chamado.ASSUNTO_CHAMADO,
      emailChamado: chamado.EMAIL_CHAMADO,
      nomeRecurso: agruparPor !== 'recurso' ? chamado.NOME_RECURSO : null,
      dtEnvioChamado: chamado.DTENVIO_CHAMADO, // ✅ Já vem convertido do processRecord
      quantidadeHorasGastasChamado: chamado.TOTAL_HORAS_GASTAS,
      statusChamado: chamado.STATUS_CHAMADO,
      conclusaoChamado: chamado.CONCLUSAO_CHAMADO,
      nomeClassificacao: chamado.NOME_CLASSIFICACAO,
   };
}

/**
 * Calcula totalizadores gerais somando todos os grupos
 */
function calculateTotalizadores(grupos: GrupoRelatorio[]): Totalizadores {
   return {
      totalGeralChamados: grupos.reduce(
         (acc, g) => acc + g.quantidadeChamados,
         0
      ),
      totalGeralChamadosAbertos: grupos.reduce(
         (acc, g) => acc + g.quantidadeChamadosAbertos,
         0
      ),
      totalGeralChamadosFinalizados: grupos.reduce(
         (acc, g) => acc + g.quantidadeChamadosFinalizados,
         0
      ),
      totalGeralChamadosPendentes: grupos.reduce(
         (acc, g) => acc + g.quantidadeChamadosPendentes,
         0
      ),
      // ✅ CORREÇÃO: 2 casas decimais
      totalGeralHorasGastas:
         Math.round(
            grupos.reduce((acc, g) => acc + g.quantidadeHorasGastas, 0) * 100
         ) / 100,
   };
}

// ==================== QUERY BUILDING ====================

/**
 * Constrói filtros SQL para datas baseado nos parâmetros recebidos
 * Suporta: período (dataInicio/dataFim), mês/ano específico, ou ano inteiro
 */
function buildDateFilters(
   dataInicio: string | null,
   dataFim: string | null,
   mesParam: string | null,
   anoParam: string | null
): { conditions: string[]; params: number[] } {
   const conditions: string[] = [];
   const params: number[] = [];

   if (dataInicio && dataFim) {
      validateDateRange(dataInicio, dataFim);
      const dateIni = parseDateInput(dataInicio)!;
      const dateFim = parseDateInput(dataFim)!;

      // Se for o mesmo dia, usa filtro simplificado
      if (
         dateIni.ano === dateFim.ano &&
         dateIni.mes === dateFim.mes &&
         dateIni.dia === dateFim.dia
      ) {
         conditions.push(
            'EXTRACT(YEAR FROM Chamado.DATA_CHAMADO) = ? AND EXTRACT(MONTH FROM Chamado.DATA_CHAMADO) = ? AND EXTRACT(DAY FROM Chamado.DATA_CHAMADO) = ?'
         );
         params.push(dateIni.ano, dateIni.mes, dateIni.dia);
      } else {
         // Filtro de range completo
         conditions.push(`(
            (EXTRACT(YEAR FROM Chamado.DATA_CHAMADO) > ? OR 
             (EXTRACT(YEAR FROM Chamado.DATA_CHAMADO) = ? AND EXTRACT(MONTH FROM Chamado.DATA_CHAMADO) > ?) OR
             (EXTRACT(YEAR FROM Chamado.DATA_CHAMADO) = ? AND EXTRACT(MONTH FROM Chamado.DATA_CHAMADO) = ? AND EXTRACT(DAY FROM Chamado.DATA_CHAMADO) >= ?))
            AND
            (EXTRACT(YEAR FROM Chamado.DATA_CHAMADO) < ? OR
             (EXTRACT(YEAR FROM Chamado.DATA_CHAMADO) = ? AND EXTRACT(MONTH FROM Chamado.DATA_CHAMADO) < ?) OR
             (EXTRACT(YEAR FROM Chamado.DATA_CHAMADO) = ? AND EXTRACT(MONTH FROM Chamado.DATA_CHAMADO) = ? AND EXTRACT(DAY FROM Chamado.DATA_CHAMADO) <= ?))
         )`);
         params.push(
            dateIni.ano,
            dateIni.ano,
            dateIni.mes,
            dateIni.ano,
            dateIni.mes,
            dateIni.dia,
            dateFim.ano,
            dateFim.ano,
            dateFim.mes,
            dateFim.ano,
            dateFim.mes,
            dateFim.dia
         );
      }
   } else if (mesParam && anoParam) {
      const mes = Number(mesParam);
      const ano = Number(anoParam);
      validateMesAno(mes, ano);
      conditions.push(
         'EXTRACT(YEAR FROM Chamado.DATA_CHAMADO) = ? AND EXTRACT(MONTH FROM Chamado.DATA_CHAMADO) = ?'
      );
      params.push(ano, mes);
   } else if (anoParam) {
      const ano = Number(anoParam);
      if (isNaN(ano)) throw new ApiError(400, 'Ano inválido');
      conditions.push('EXTRACT(YEAR FROM Chamado.DATA_CHAMADO) = ?');
      params.push(ano);
   }

   return { conditions, params };
}

/**
 * Constrói todas as condições WHERE da query
 * Aplica filtros de data, recurso, cliente, status e classificação
 */
function buildWhereConditions(searchParams: URLSearchParams): {
   conditions: string[];
   params: any[];
} {
   const conditions: string[] = [];
   const params: any[] = [];

   // Filtros de data
   const dateFilters = buildDateFilters(
      getCleanParam(searchParams.get('dataInicio')),
      getCleanParam(searchParams.get('dataFim')),
      getCleanParam(searchParams.get('mes')),
      getCleanParam(searchParams.get('ano'))
   );
   conditions.push(...dateFilters.conditions);
   params.push(...dateFilters.params);

   // Filtro de recurso
   const codRecursoFilter = getCleanParam(searchParams.get('codRecurso'));
   if (codRecursoFilter) {
      conditions.push('Chamado.COD_RECURSO = ?');
      params.push(Number(codRecursoFilter));
   }

   // Filtro de cliente
   const codClienteFilter = getCleanParam(searchParams.get('codCliente'));
   if (codClienteFilter) {
      conditions.push('Chamado.COD_CLIENTE = ?');
      params.push(Number(codClienteFilter));
   }

   return { conditions, params };
}

/**
 * Constrói a query SQL completa com JOINs e WHERE
 */
function buildQuery(whereConditions: string[]): string {
   return `
      SELECT
         Chamado.COD_CHAMADO,
         Chamado.DATA_CHAMADO,
         Chamado.HORA_CHAMADO,
         Chamado.CONCLUSAO_CHAMADO,
         Chamado.STATUS_CHAMADO,
         Chamado.DTENVIO_CHAMADO,
         Chamado.COD_RECURSO,
         Chamado.COD_CLIENTE,
         Chamado.ASSUNTO_CHAMADO,
         Chamado.EMAIL_CHAMADO,
         Chamado.COD_CLASSIFICACAO,
         Recurso.NOME_RECURSO,
         Cliente.NOME_CLIENTE,
         Classificacao.NOME_CLASSIFICACAO,
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
      ORDER BY Chamado.DATA_CHAMADO DESC, Chamado.HORA_CHAMADO DESC
   `;
}

// ==================== AUTH ====================

/**
 * Verifica e decodifica o token JWT do header Authorization
 */
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

/**
 * Handler principal da API GET
 * Gera relatório de chamados agrupados por cliente, recurso ou mês
 * Calcula horas gastas, totalizadores e aplica filtros
 *
 * Query Params:
 * - agruparPor: 'cliente' | 'recurso' | 'mes' (default: 'cliente')
 * - dataInicio/dataFim: período de datas
 * - mes/ano: filtro por mês específico
 * - codRecurso: filtro por recurso
 * - codCliente: filtro por cliente
 * - status: filtro por status
 * - codClassificacao: filtro por classificação
 * - formato: 'json' | 'csv' (default: 'json')
 */
export async function GET(request: Request) {
   try {
      // Autenticação (verificação de admin feita no login)
      verifyToken(request.headers.get('Authorization'));

      // Parse dos parâmetros
      const { searchParams } = new URL(request.url);
      const agruparPor = validateAgrupamento(
         getCleanParam(searchParams.get('agruparPor')) || 'cliente'
      );
      const formato = getCleanParam(searchParams.get('formato')) || 'json';

      if (!VALID_FORMATOS.includes(formato as any)) {
         throw new ApiError(400, 'Formato inválido. Use: json ou csv');
      }

      // Construção da query
      const { conditions: whereConditions, params } =
         buildWhereConditions(searchParams);
      const sql = buildQuery(whereConditions);

      // Execução da query
      const rawData = await firebirdQuery(sql, params);

      // Cálculo otimizado de horas em lote
      const codChamados = (rawData || []).map((r: any) => r.COD_CHAMADO);
      const horasMap = await calcularHorasGastasPorChamado(codChamados);

      // Processamento dos dados
      const processedData = await Promise.all(
         (rawData || []).map(record => processRecord(record, horasMap))
      );

      // Agrupamento e cálculos
      let dadosAgrupados = agruparDados(processedData, agruparPor);

      // Arredondamento final das horas
      dadosAgrupados.forEach(grupo => {
         // ✅ CORREÇÃO: 2 casas decimais
         grupo.quantidadeHorasGastas =
            Math.round(grupo.quantidadeHorasGastas * 100) / 100;
      });

      // Cálculo dos totalizadores
      const totalizadores = calculateTotalizadores(dadosAgrupados);

      // Ordenação por quantidade de chamados (decrescente)
      dadosAgrupados.sort(
         (a, b) => b.quantidadeChamados - a.quantidadeChamados
      );

      // Retorno do relatório
      return NextResponse.json(
         {
            relatorio: {
               tipoAgrupamento: agruparPor,
               periodo: {
                  dataInicio: getCleanParam(searchParams.get('dataInicio')),
                  dataFim: getCleanParam(searchParams.get('dataFim')),
                  mes: getCleanParam(searchParams.get('mes')),
                  ano: getCleanParam(searchParams.get('ano')),
               },
               totalizadores,
               grupos: dadosAgrupados,
            },
         },
         { status: 200 }
      );
   } catch (error) {
      console.error('❌ Erro no relatório de chamados:', error);

      // Tratamento de erros conhecidos
      if (error instanceof ApiError) {
         return NextResponse.json(
            { error: error.message },
            { status: error.statusCode }
         );
      }
      // Erro genérico
      return NextResponse.json(
         { error: 'Erro interno no servidor' },
         { status: 500 }
      );
   }
}
