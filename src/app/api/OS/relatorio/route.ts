import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';

// ==================== TYPES ====================
interface TokenPayload {
   tipo: string;
   recurso?: {
      id: number;
   };
}

interface ProcessedOS {
   COD_OS: number;
   DTINI_OS: Date | null;
   HRINI_OS: string | null;
   HRFIM_OS: string | null;
   DTINC_OS: Date | null;
   FATURADO_OS: string | null;
   VALID_OS: string | null;
   COMP_OS: string | null;
   CHAMADO_OS: string | null;
   COD_RECURSO: number | null;
   NOME_RECURSO: string | null;
   COD_CLIENTE: number | null;
   NOME_CLIENTE: string | null;
   COD_TAREFA: number | null;
   NOME_TAREFA: string | null;
   COD_PROJETO: number | null;
   NOME_PROJETO: string | null;
   HORAS_TRABALHADAS: number;
   TAREFA_COMPLETA: string | null;
   PROJETO_COMPLETO: string | null;
}

interface GrupoRelatorio {
   chave: string;
   nome: string;
   totalHoras: number;
   quantidadeOS: number;
   osFaturadas: number;
   osValidadas: number;
   detalhes: DetalheOS[];
   codCliente?: number;
   codRecurso?: number;
   codProjeto?: number;
   codTarefa?: number;
}

interface DetalheOS {
   codOs: number;
   data: Date | null;
   chamado: string | null;
   horaInicio: string | null;
   horaFim: string | null;
   horas: number;
   dataInclusao: Date | null;
   faturado: string | null;
   validado: string | null;
   competencia: string | null;
   cliente?: string | null;
   codCliente?: number | null;
   recurso?: string | null;
   codRecurso?: number | null;
   projeto?: string | null;
   codProjeto?: number | null;
   tarefa?: string | null;
   codTarefa?: number | null;
}

interface Totalizadores {
   totalGeralHoras: number;
   totalGeralOS: number;
   totalOSFaturadas: number;
   totalOSValidadas: number;
   quantidadeGrupos: number;
}

interface DateRange {
   dataInicio: string;
   dataFim: string;
}

type AgrupamentoTipo =
   | 'cliente'
   | 'recurso'
   | 'projeto'
   | 'tarefa'
   | 'mes'
   | 'cliente-recurso';

// ==================== CONSTANTS ====================
const MAX_HOURS = 23;
const MAX_MINUTES = 59;
const HOURS_IN_DAY = 24;
const MIN_MONTH = 1;
const MAX_MONTH = 12;
const VALID_AGRUPAMENTOS: AgrupamentoTipo[] = [
   'cliente',
   'recurso',
   'projeto',
   'tarefa',
   'mes',
   'cliente-recurso',
];
const VALID_FORMATOS = ['json', 'csv'] as const;

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

function parseTime(timeStr: string): number | null {
   const cleanTime = timeStr.replace(/[^0-9]/g, '').padStart(4, '0');

   if (cleanTime.length < 4) return null;

   const hours = parseInt(cleanTime.substring(0, 2), 10);
   const minutes = parseInt(cleanTime.substring(2, 4), 10);

   if (isNaN(hours) || isNaN(minutes)) return null;
   if (hours > MAX_HOURS || minutes > MAX_MINUTES) return null;

   return hours + minutes / 60;
}

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
         diferenca += HOURS_IN_DAY;
      }

      return Math.round(diferenca * 100) / 100;
   } catch (error) {
      console.error('Erro ao calcular horas:', error, { hrini, hrfim });
      return 0;
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

function parseDateInput(
   dateStr: string
): { ano: number; mes: number; dia: number } | null {
   const trimmed = dateStr.trim();

   // Remove todos os separadores para verificar se é só números
   const cleanDate = trimmed.replace(/[\/\-\.\s]/g, '');

   // Se for apenas números
   if (/^\d+$/.test(cleanDate)) {
      if (cleanDate.length === 8) {
         // DDMMYYYY ou YYYYMMDD
         // Tenta DDMMYYYY primeiro (mais comum no Brasil)
         const dia = parseInt(cleanDate.substring(0, 2), 10);
         const mes = parseInt(cleanDate.substring(2, 4), 10);
         const ano = parseInt(cleanDate.substring(4, 8), 10);

         // Valida se faz sentido como DDMMYYYY
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

         // Se não fez sentido, tenta YYYYMMDD
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
   }

   // Tenta formato com separadores
   // Primeiro tenta detectar qual separador está sendo usado
   let parts: string[] = [];

   if (trimmed.includes('/')) {
      parts = trimmed.split('/');
   } else if (trimmed.includes('-')) {
      parts = trimmed.split('-');
   } else if (trimmed.includes('.')) {
      parts = trimmed.split('.');
   }

   if (parts.length === 3) {
      const p1 = parseInt(parts[0], 10);
      const p2 = parseInt(parts[1], 10);
      const p3 = parseInt(parts[2], 10);

      // Verifica se está em formato YYYY-MM-DD (ano vem primeiro)
      if (parts[0].length === 4) {
         // YYYY-MM-DD
         if (
            p1 >= 1900 &&
            p1 <= 2100 &&
            p2 >= 1 &&
            p2 <= 12 &&
            p3 >= 1 &&
            p3 <= 31
         ) {
            return { ano: p1, mes: p2, dia: p3 };
         }
      } else {
         // DD/MM/YYYY ou DD-MM-YYYY ou DD.MM.YYYY
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
   }

   return null;
}

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

function validateMesAno(mes: number, ano: number): void {
   if (isNaN(mes) || mes < MIN_MONTH || mes > MAX_MONTH || isNaN(ano)) {
      throw new ApiError(400, 'Mês ou ano inválido');
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

function validateAgrupamento(agruparPor: string): AgrupamentoTipo {
   if (!VALID_AGRUPAMENTOS.includes(agruparPor as AgrupamentoTipo)) {
      throw new ApiError(
         400,
         `Agrupamento inválido. Use: ${VALID_AGRUPAMENTOS.join(', ')}`
      );
   }
   return agruparPor as AgrupamentoTipo;
}

// ==================== DATA PROCESSING ====================
function processRecord(record: any): ProcessedOS {
   return {
      ...record,
      HORAS_TRABALHADAS: calculateHours(record.HRINI_OS, record.HRFIM_OS),
      TAREFA_COMPLETA:
         record.COD_TAREFA && record.NOME_TAREFA
            ? `${record.COD_TAREFA} - ${record.NOME_TAREFA}`
            : null,
      PROJETO_COMPLETO:
         record.COD_PROJETO && record.NOME_PROJETO
            ? `${record.COD_PROJETO} - ${record.NOME_PROJETO}`
            : null,
   };
}

function agruparDados(
   processedData: ProcessedOS[],
   agruparPor: AgrupamentoTipo
): GrupoRelatorio[] {
   const grupos: Record<string, GrupoRelatorio> = {};

   processedData.forEach(os => {
      const { chave, nomeGrupo, extraData } = getGrupoKey(os, agruparPor);

      if (!grupos[chave]) {
         grupos[chave] = {
            chave,
            nome: nomeGrupo,
            totalHoras: 0,
            quantidadeOS: 0,
            osFaturadas: 0,
            osValidadas: 0,
            detalhes: [],
            ...extraData,
         };
      }

      grupos[chave].totalHoras += os.HORAS_TRABALHADAS;
      grupos[chave].quantidadeOS += 1;

      if (os.FATURADO_OS?.trim().toUpperCase() === 'SIM') {
         grupos[chave].osFaturadas += 1;
      }

      if (os.VALID_OS?.trim().toUpperCase() === 'SIM') {
         grupos[chave].osValidadas += 1;
      }

      grupos[chave].detalhes.push(buildDetalheOS(os, agruparPor));
   });

   return Object.values(grupos);
}

function getGrupoKey(
   os: ProcessedOS,
   agruparPor: AgrupamentoTipo
): { chave: string; nomeGrupo: string; extraData: Partial<GrupoRelatorio> } {
   switch (agruparPor) {
      case 'cliente':
         return {
            chave: `${os.COD_CLIENTE || 'SEM_CLIENTE'}`,
            nomeGrupo: os.NOME_CLIENTE || 'Sem Cliente',
            extraData: { codCliente: os.COD_CLIENTE || undefined },
         };

      case 'recurso':
         return {
            chave: `${os.COD_RECURSO || 'SEM_RECURSO'}`,
            nomeGrupo: os.NOME_RECURSO || 'Sem Recurso',
            extraData: { codRecurso: os.COD_RECURSO || undefined },
         };

      case 'projeto':
         return {
            chave: `${os.COD_PROJETO || 'SEM_PROJETO'}`,
            nomeGrupo: os.PROJETO_COMPLETO || 'Sem Projeto',
            extraData: { codProjeto: os.COD_PROJETO || undefined },
         };

      case 'tarefa':
         return {
            chave: `${os.COD_TAREFA || 'SEM_TAREFA'}`,
            nomeGrupo: os.TAREFA_COMPLETA || 'Sem Tarefa',
            extraData: { codTarefa: os.COD_TAREFA || undefined },
         };

      case 'mes':
         if (os.DTINI_OS) {
            const data = new Date(os.DTINI_OS);
            const mes = data.getMonth() + 1;
            const ano = data.getFullYear();
            return {
               chave: `${ano}-${mes.toString().padStart(2, '0')}`,
               nomeGrupo: `${mes.toString().padStart(2, '0')}/${ano}`,
               extraData: {},
            };
         }
         return {
            chave: 'SEM_DATA',
            nomeGrupo: 'Sem Data',
            extraData: {},
         };

      case 'cliente-recurso':
         return {
            chave: `${os.COD_CLIENTE || 'SEM_CLIENTE'}-${os.COD_RECURSO || 'SEM_RECURSO'}`,
            nomeGrupo: `${os.NOME_CLIENTE || 'Sem Cliente'} - ${os.NOME_RECURSO || 'Sem Recurso'}`,
            extraData: {
               codCliente: os.COD_CLIENTE || undefined,
               codRecurso: os.COD_RECURSO || undefined,
            },
         };

      default:
         return {
            chave: `${os.COD_CLIENTE || 'SEM_CLIENTE'}`,
            nomeGrupo: os.NOME_CLIENTE || 'Sem Cliente',
            extraData: { codCliente: os.COD_CLIENTE || undefined },
         };
   }
}

function buildDetalheOS(
   os: ProcessedOS,
   agruparPor: AgrupamentoTipo
): DetalheOS {
   const detalhe: DetalheOS = {
      codOs: os.COD_OS,
      data: os.DTINI_OS,
      chamado: os.CHAMADO_OS,
      horaInicio: os.HRINI_OS,
      horaFim: os.HRFIM_OS,
      horas: os.HORAS_TRABALHADAS,
      dataInclusao: os.DTINC_OS,
      faturado: os.FATURADO_OS?.trim() || null,
      validado: os.VALID_OS?.trim() || null,
      competencia: os.COMP_OS,
   };

   if (agruparPor !== 'cliente') {
      detalhe.cliente = os.NOME_CLIENTE;
      detalhe.codCliente = os.COD_CLIENTE;
   }

   if (agruparPor !== 'recurso') {
      detalhe.recurso = os.NOME_RECURSO;
      detalhe.codRecurso = os.COD_RECURSO;
   }

   if (agruparPor !== 'projeto') {
      detalhe.projeto = os.PROJETO_COMPLETO;
      detalhe.codProjeto = os.COD_PROJETO;
   }

   if (agruparPor !== 'tarefa') {
      detalhe.tarefa = os.TAREFA_COMPLETA;
      detalhe.codTarefa = os.COD_TAREFA;
   }

   return detalhe;
}

function calculateTotalizadores(grupos: GrupoRelatorio[]): Totalizadores {
   const totalizadores = {
      totalGeralHoras: grupos.reduce((acc, g) => acc + g.totalHoras, 0),
      totalGeralOS: grupos.reduce((acc, g) => acc + g.quantidadeOS, 0),
      totalOSFaturadas: grupos.reduce((acc, g) => acc + g.osFaturadas, 0),
      totalOSValidadas: grupos.reduce((acc, g) => acc + g.osValidadas, 0),
      quantidadeGrupos: grupos.length,
   };

   totalizadores.totalGeralHoras =
      Math.round(totalizadores.totalGeralHoras * 100) / 100;

   return totalizadores;
}

// ==================== QUERY BUILDING ====================
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

      const dateIni = parseDateInput(dataInicio);
      const dateFim = parseDateInput(dataFim);

      if (!dateIni || !dateFim) {
         throw new ApiError(400, 'Erro ao processar datas');
      }

      const { ano: anoIni, mes: mesIni, dia: diaIni } = dateIni;
      const { ano: anoFim, mes: mesFim, dia: diaFim } = dateFim;

      // Verifica se são o mesmo dia
      if (anoIni === anoFim && mesIni === mesFim && diaIni === diaFim) {
         conditions.push(
            'EXTRACT(YEAR FROM OS.DTINI_OS) = ? AND EXTRACT(MONTH FROM OS.DTINI_OS) = ? AND EXTRACT(DAY FROM OS.DTINI_OS) = ?'
         );
         params.push(anoIni, mesIni, diaIni);
      } else {
         conditions.push(`(
            (EXTRACT(YEAR FROM OS.DTINI_OS) > ? OR 
             (EXTRACT(YEAR FROM OS.DTINI_OS) = ? AND EXTRACT(MONTH FROM OS.DTINI_OS) > ?) OR
             (EXTRACT(YEAR FROM OS.DTINI_OS) = ? AND EXTRACT(MONTH FROM OS.DTINI_OS) = ? AND EXTRACT(DAY FROM OS.DTINI_OS) >= ?))
            AND
            (EXTRACT(YEAR FROM OS.DTINI_OS) < ? OR
             (EXTRACT(YEAR FROM OS.DTINI_OS) = ? AND EXTRACT(MONTH FROM OS.DTINI_OS) < ?) OR
             (EXTRACT(YEAR FROM OS.DTINI_OS) = ? AND EXTRACT(MONTH FROM OS.DTINI_OS) = ? AND EXTRACT(DAY FROM OS.DTINI_OS) <= ?))
         )`);
         params.push(
            anoIni,
            anoIni,
            mesIni,
            anoIni,
            mesIni,
            diaIni,
            anoFim,
            anoFim,
            mesFim,
            anoFim,
            mesFim,
            diaFim
         );
      }
   } else if (mesParam && anoParam) {
      const mes = Number(mesParam);
      const ano = Number(anoParam);
      validateMesAno(mes, ano);

      conditions.push(
         'EXTRACT(YEAR FROM OS.DTINI_OS) = ? AND EXTRACT(MONTH FROM OS.DTINI_OS) = ?'
      );
      params.push(ano, mes);
   } else if (anoParam) {
      const ano = Number(anoParam);
      if (isNaN(ano)) {
         throw new ApiError(400, 'Ano inválido');
      }
      conditions.push('EXTRACT(YEAR FROM OS.DTINI_OS) = ?');
      params.push(ano);
   }

   return { conditions, params };
}

function buildWhereConditions(
   searchParams: URLSearchParams,
   isAdmin: boolean,
   codRecurso: number | undefined
): { conditions: string[]; params: any[] } {
   const conditions: string[] = [];
   const params: any[] = [];

   // Filtros de data
   const dataInicio = getCleanParam(searchParams.get('dataInicio'));
   const dataFim = getCleanParam(searchParams.get('dataFim'));
   const mesParam = getCleanParam(searchParams.get('mes'));
   const anoParam = getCleanParam(searchParams.get('ano'));

   const dateFilters = buildDateFilters(
      dataInicio,
      dataFim,
      mesParam,
      anoParam
   );
   conditions.push(...dateFilters.conditions);
   params.push(...dateFilters.params);

   // Filtro de recurso
   const codRecursoFilter = getCleanParam(searchParams.get('codRecurso'));
   if (!isAdmin && codRecurso) {
      conditions.push('OS.CODREC_OS = ?');
      params.push(Number(codRecurso));
   } else if (isAdmin && codRecursoFilter) {
      conditions.push('OS.CODREC_OS = ?');
      params.push(Number(codRecursoFilter));
   }

   // Filtro de cliente
   const codClienteFilter = getCleanParam(searchParams.get('codCliente'));
   if (codClienteFilter) {
      conditions.push('Cliente.COD_CLIENTE = ?');
      params.push(Number(codClienteFilter));
   }

   // Filtro de projeto
   const codProjetoFilter = getCleanParam(searchParams.get('codProjeto'));
   if (codProjetoFilter) {
      conditions.push('Projeto.COD_PROJETO = ?');
      params.push(Number(codProjetoFilter));
   }

   // Filtro de faturado
   const faturadoFilter = getCleanParam(searchParams.get('faturado'));
   if (faturadoFilter) {
      const faturado = normalizeYesNoValue(faturadoFilter);
      if (faturado === 'SIM' || faturado === 'NAO') {
         conditions.push('TRIM(UPPER(OS.FATURADO_OS)) = ?');
         params.push(faturado);
      }
   }

   // Filtro de validado
   const validadoFilter = getCleanParam(searchParams.get('validado'));
   if (validadoFilter) {
      const validado = normalizeYesNoValue(validadoFilter);
      if (validado === 'SIM' || validado === 'NAO') {
         conditions.push('TRIM(UPPER(OS.VALID_OS)) = ?');
         params.push(validado);
      }
   }

   // Excluir registros com chamado vazio
   conditions.push(
      '(CAST(OS.CHAMADO_OS AS VARCHAR(20)) <> ? OR OS.CHAMADO_OS IS NULL)'
   );
   params.push('');

   return { conditions, params };
}

function buildQuery(whereConditions: string[]): string {
   return `
      SELECT
         OS.COD_OS,
         OS.DTINI_OS,
         OS.HRINI_OS,
         OS.HRFIM_OS,
         OS.DTINC_OS,
         OS.FATURADO_OS,
         OS.VALID_OS,
         OS.COMP_OS,
         OS.CHAMADO_OS,
         Recurso.COD_RECURSO,
         Recurso.NOME_RECURSO,
         Cliente.COD_CLIENTE,
         Cliente.NOME_CLIENTE,
         Tarefa.COD_TAREFA,
         Tarefa.NOME_TAREFA,
         Projeto.COD_PROJETO,
         Projeto.NOME_PROJETO
      FROM OS
      LEFT JOIN RECURSO Recurso ON Recurso.COD_RECURSO = OS.CODREC_OS
      LEFT JOIN CHAMADO Chamado ON Chamado.COD_CHAMADO = OS.CHAMADO_OS
      LEFT JOIN CLIENTE Cliente ON Cliente.COD_CLIENTE = Chamado.COD_CLIENTE
      LEFT JOIN TAREFA Tarefa ON Tarefa.COD_TAREFA = OS.CODTRF_OS
      LEFT JOIN PROJETO Projeto ON Projeto.COD_PROJETO = Tarefa.CODPRO_TAREFA
      ${whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      ORDER BY OS.DTINI_OS, Cliente.NOME_CLIENTE, Recurso.NOME_RECURSO
   `;
}

// ==================== CSV GENERATION ====================
function generateCSV(
   dadosAgrupados: GrupoRelatorio[],
   totalizadores: Totalizadores,
   agruparPor: AgrupamentoTipo
): string {
   const csvLines: string[] = [];

   // Cabeçalho
   csvLines.push(
      'Agrupamento;Nome;Código;Total Horas;Quantidade OS;OS Faturadas;OS Validadas'
   );

   // Dados
   dadosAgrupados.forEach(grupo => {
      const codigo =
         grupo.codCliente ||
         grupo.codRecurso ||
         grupo.codProjeto ||
         grupo.codTarefa ||
         '';
      csvLines.push(
         `${agruparPor};${grupo.nome};${codigo};${grupo.totalHoras};${grupo.quantidadeOS};${grupo.osFaturadas};${grupo.osValidadas}`
      );
   });

   // Totalizador
   csvLines.push('');
   csvLines.push(
      `TOTAL GERAL;;${totalizadores.totalGeralHoras};${totalizadores.totalGeralOS};${totalizadores.totalOSFaturadas};${totalizadores.totalOSValidadas}`
   );

   return csvLines.join('\n');
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

      // Validação de acesso
      if (!isAdmin && !codRecurso) {
         throw new ApiError(
            400,
            'Usuário não admin precisa ter codRecurso definido'
         );
      }

      // Parse URL params
      const { searchParams } = new URL(request.url);

      // Validar agrupamento
      const agruparPorParam =
         getCleanParam(searchParams.get('agruparPor')) || 'cliente';
      const agruparPor = validateAgrupamento(agruparPorParam);

      // Validar formato
      const formato = getCleanParam(searchParams.get('formato')) || 'json';
      if (!VALID_FORMATOS.includes(formato as any)) {
         throw new ApiError(400, 'Formato inválido. Use: json ou csv');
      }

      // Construção de condições WHERE
      const { conditions: whereConditions, params } = buildWhereConditions(
         searchParams,
         isAdmin,
         codRecurso
      );

      // Construção e execução da query
      const sql = buildQuery(whereConditions);
      const rawData = await firebirdQuery(sql, params);

      // Processamento de dados
      const processedData = (rawData || []).map(processRecord);

      // Agrupamento de dados
      let dadosAgrupados = agruparDados(processedData, agruparPor);

      // Arredondar totais de horas
      dadosAgrupados.forEach(grupo => {
         grupo.totalHoras = Math.round(grupo.totalHoras * 100) / 100;
      });

      // Calcular totalizadores
      const totalizadores = calculateTotalizadores(dadosAgrupados);

      // Ordenar por total de horas (decrescente)
      dadosAgrupados.sort((a, b) => b.totalHoras - a.totalHoras);

      // Retornar CSV se solicitado
      if (formato === 'csv') {
         const csvContent = generateCSV(
            dadosAgrupados,
            totalizadores,
            agruparPor
         );
         const dataAtual = new Date().toISOString().split('T')[0];

         return new NextResponse(csvContent, {
            status: 200,
            headers: {
               'Content-Type': 'text/csv; charset=utf-8',
               'Content-Disposition': `attachment; filename="relatorio_os_${agruparPor}_${dataAtual}.csv"`,
            },
         });
      }

      // Resposta JSON
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
               filtros: {
                  cliente: getCleanParam(searchParams.get('codCliente')),
                  recurso: getCleanParam(searchParams.get('codRecurso')),
                  projeto: getCleanParam(searchParams.get('codProjeto')),
                  faturado: getCleanParam(searchParams.get('faturado')),
                  validado: getCleanParam(searchParams.get('validado')),
               },
               totalizadores,
               grupos: dadosAgrupados,
            },
         },
         { status: 200 }
      );
   } catch (error) {
      console.error('Erro ao gerar relatório:', error);

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
         { error: 'Erro ao gerar relatório' },
         { status: 500 }
      );
   }
}
