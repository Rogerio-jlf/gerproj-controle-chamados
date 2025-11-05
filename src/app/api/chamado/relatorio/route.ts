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

interface ProcessedChamado {
   COD_CHAMADO: number;
   DATA_CHAMADO: Date | null;
   HORA_CHAMADO: string | null;
   SOLICITACAO_CHAMADO: string | null;
   CONCLUSAO_CHAMADO: string | null;
   STATUS_CHAMADO: string | null;
   DTENVIO_CHAMADO: Date | null;
   COD_RECURSO: number | null;
   NOME_RECURSO: string | null;
   COD_CLIENTE: number | null;
   NOME_CLIENTE: string | null;
   CODTRF_CHAMADO: number | null;
   NOME_TAREFA: string | null;
   TAREFA_COMPLETA: string | null;
   COD_PROJETO: number | null;
   NOME_PROJETO: string | null;
   PROJETO_COMPLETO: string | null;
   ASSUNTO_CHAMADO: string | null;
   EMAIL_CHAMADO: string | null;
   PRIOR_CHAMADO: number | null;
   COD_CLASSIFICACAO: number | null;
   NOME_CLASSIFICACAO: string | null;
   DIAS_EM_ABERTO: number | null;
   TEMPO_ATENDIMENTO_DIAS: number | null;
   HORAS_GASTAS: number | null; // NOVO: horas totais gastas no chamado
}

interface GrupoRelatorio {
   chave: string;
   nome: string;
   quantidadeChamados: number;
   chamadosAbertos: number;
   chamadosFechados: number;
   chamadosPendentes: number;
   mediaTempoAtendimento: number | null;
   totalHorasGastas: number; // NOVO: soma das horas gastas no grupo
   mediaHorasPorChamado: number | null; // NOVO: média de horas por chamado
   detalhes: DetalheChamado[];
   codCliente?: number;
   codRecurso?: number;
   codProjeto?: number;
   codClassificacao?: number;
   status?: string;
}

interface DetalheChamado {
   codChamado: number;
   data: Date | null;
   hora: string | null;
   assunto: string | null;
   status: string | null;
   prioridade: number | null;
   dataEnvio: Date | null;
   diasEmAberto: number | null;
   tempoAtendimentoDias: number | null;
   horasGastas: number | null; // NOVO
   cliente?: string | null;
   codCliente?: number | null;
   recurso?: string | null;
   codRecurso?: number | null;
   projeto?: string | null;
   codProjeto?: number | null;
   tarefa?: string | null;
   codTarefa?: number | null;
   classificacao?: string | null;
   codClassificacao?: number | null;
}

interface Totalizadores {
   totalChamados: number;
   totalAbertos: number;
   totalFechados: number;
   totalPendentes: number;
   mediaGeralTempoAtendimento: number | null;
   quantidadeGrupos: number;
   totalHorasGastas: number; // NOVO: soma total de todas as horas
   mediaHorasPorChamado: number | null; // NOVO: média geral de horas por chamado
}

type AgrupamentoTipo =
   | 'cliente'
   | 'recurso'
   | 'projeto'
   | 'status'
   | 'classificacao'
   | 'prioridade'
   | 'mes'
   | 'cliente-recurso';

// ==================== CONSTANTS ====================
const MIN_MONTH = 1;
const MAX_MONTH = 12;
const VALID_AGRUPAMENTOS: AgrupamentoTipo[] = [
   'cliente',
   'recurso',
   'projeto',
   'status',
   'classificacao',
   'prioridade',
   'mes',
   'cliente-recurso',
];
const VALID_FORMATOS = ['json', 'csv'] as const;

const STATUS_ABERTO = ['ABERTO', 'EM ANDAMENTO', 'AGUARDANDO'];
const STATUS_FECHADO = ['FECHADO', 'CONCLUIDO', 'CONCLUÍDO'];
const STATUS_PENDENTE = ['PENDENTE', 'AGUARDANDO CLIENTE'];

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

function parseDateInput(
   dateStr: string
): { ano: number; mes: number; dia: number } | null {
   const trimmed = dateStr.trim();
   const cleanDate = trimmed.replace(/[\/\-\.\s]/g, '');

   if (/^\d+$/.test(cleanDate)) {
      if (cleanDate.length === 8) {
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

      if (parts[0].length === 4) {
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

function validateAgrupamento(agruparPor: string): AgrupamentoTipo {
   if (!VALID_AGRUPAMENTOS.includes(agruparPor as AgrupamentoTipo)) {
      throw new ApiError(
         400,
         `Agrupamento inválido. Use: ${VALID_AGRUPAMENTOS.join(', ')}`
      );
   }
   return agruparPor as AgrupamentoTipo;
}

function calculateDiasEmAberto(
   dataChamado: Date | null,
   status: string | null
): number | null {
   if (!dataChamado || !status) return null;

   const statusUpper = status.toUpperCase().trim();
   if (!STATUS_ABERTO.includes(statusUpper)) return null;

   const hoje = new Date();
   const diffTime = hoje.getTime() - dataChamado.getTime();
   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

   return diffDays >= 0 ? diffDays : null;
}

function calculateTempoAtendimento(
   dataChamado: Date | null,
   dataEnvio: Date | null
): number | null {
   if (!dataChamado || !dataEnvio) return null;

   const diffTime = dataEnvio.getTime() - dataChamado.getTime();
   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

   return diffDays >= 0 ? diffDays : null;
}

function getPrioridadeNome(prioridade: number | null): string {
   if (prioridade === null) return 'Sem Prioridade';

   switch (prioridade) {
      case 1:
         return '1 - Baixa';
      case 2:
         return '2 - Normal';
      case 3:
         return '3 - Alta';
      case 4:
         return '4 - Urgente';
      case 5:
         return '5 - Crítica';
      default:
         return `${prioridade} - Indefinida`;
   }
}

/**
 * Converte uma string de hora no formato HHMM (ex: "0800", "1430") para minutos
 */
function parseTimeToMinutes(timeStr: string | null): number | null {
   if (!timeStr) return null;

   try {
      const cleaned = timeStr.trim().replace(/\D/g, '');

      if (cleaned.length !== 4) return null;

      const horas = parseInt(cleaned.substring(0, 2), 10);
      const minutos = parseInt(cleaned.substring(2, 4), 10);

      if (isNaN(horas) || isNaN(minutos)) return null;
      if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) return null;

      return horas * 60 + minutos;
   } catch {
      return null;
   }
}

/**
 * Calcula o total de horas gastas em todas as OS de um chamado
 */
async function calcularHorasGastasChamado(codChamado: number): Promise<number> {
   try {
      const query = `
         SELECT 
            OS.HRINI_OS,
            OS.HRFIM_OS
         FROM OS
         WHERE OS.CHAMADO_OS = ?
            AND OS.HRINI_OS IS NOT NULL
            AND OS.HRFIM_OS IS NOT NULL
      `;

      const osRecords = await firebirdQuery(query, [codChamado]);

      if (!osRecords || osRecords.length === 0) {
         return 0;
      }

      let totalMinutos = 0;

      for (const os of osRecords) {
         const horaInicio = parseTimeToMinutes(os.HRINI_OS);
         const horaFim = parseTimeToMinutes(os.HRFIM_OS);

         if (horaInicio !== null && horaFim !== null) {
            let diffMinutos = horaFim - horaInicio;

            // Se a hora fim for menor que início, passou da meia-noite
            if (diffMinutos < 0) {
               diffMinutos += 24 * 60;
            }

            totalMinutos += diffMinutos;
         }
      }

      // Converte minutos para horas (com 2 decimais)
      return Math.round((totalMinutos / 60) * 100) / 100;
   } catch (error) {
      console.error(`Erro ao calcular horas do chamado ${codChamado}:`, error);
      return 0;
   }
}

// ==================== DATA PROCESSING ====================
async function processRecord(record: any): Promise<ProcessedChamado> {
   const dataChamado = record.DATA_CHAMADO
      ? new Date(record.DATA_CHAMADO)
      : null;
   const dataEnvio = record.DTENVIO_CHAMADO
      ? new Date(record.DTENVIO_CHAMADO)
      : null;
   const status = record.STATUS_CHAMADO?.trim() || null;

   // NOVO: Calcular horas gastas
   const horasGastas = await calcularHorasGastasChamado(record.COD_CHAMADO);

   return {
      ...record,
      DATA_CHAMADO: dataChamado,
      DTENVIO_CHAMADO: dataEnvio,
      STATUS_CHAMADO: status,
      TAREFA_COMPLETA:
         record.CODTRF_CHAMADO && record.NOME_TAREFA
            ? `${record.CODTRF_CHAMADO} - ${record.NOME_TAREFA}`
            : null,
      PROJETO_COMPLETO:
         record.COD_PROJETO && record.NOME_PROJETO
            ? `${record.COD_PROJETO} - ${record.NOME_PROJETO}`
            : null,
      DIAS_EM_ABERTO: calculateDiasEmAberto(dataChamado, status),
      TEMPO_ATENDIMENTO_DIAS: calculateTempoAtendimento(dataChamado, dataEnvio),
      HORAS_GASTAS: horasGastas, // NOVO
   };
}

function agruparDados(
   processedData: ProcessedChamado[],
   agruparPor: AgrupamentoTipo
): GrupoRelatorio[] {
   const grupos: Record<string, GrupoRelatorio> = {};

   processedData.forEach(chamado => {
      const { chave, nomeGrupo, extraData } = getGrupoKey(chamado, agruparPor);

      if (!grupos[chave]) {
         grupos[chave] = {
            chave,
            nome: nomeGrupo,
            quantidadeChamados: 0,
            chamadosAbertos: 0,
            chamadosFechados: 0,
            chamadosPendentes: 0,
            mediaTempoAtendimento: null,
            totalHorasGastas: 0, // ⬅️ ADICIONE
            mediaHorasPorChamado: null, // ⬅️ ADICIONE
            detalhes: [],
            ...extraData,
         };
      }

      // NOVO: Acumular horas gastas
      grupos[chave].totalHorasGastas += chamado.HORAS_GASTAS || 0;

      grupos[chave].quantidadeChamados += 1;

      const statusUpper = chamado.STATUS_CHAMADO?.toUpperCase().trim() || '';

      if (STATUS_ABERTO.includes(statusUpper)) {
         grupos[chave].chamadosAbertos += 1;
      } else if (STATUS_FECHADO.includes(statusUpper)) {
         grupos[chave].chamadosFechados += 1;
      } else if (STATUS_PENDENTE.includes(statusUpper)) {
         grupos[chave].chamadosPendentes += 1;
      }

      grupos[chave].detalhes.push(buildDetalheChamado(chamado, agruparPor));
   });

   // Calcular média de tempo de atendimento para cada grupo
   // Calcular média de tempo de atendimento para cada grupo
   Object.values(grupos).forEach(grupo => {
      const tempos = grupo.detalhes
         .map(d => d.tempoAtendimentoDias)
         .filter((t): t is number => t !== null);

      if (tempos.length > 0) {
         const soma = tempos.reduce((acc, t) => acc + t, 0);
         grupo.mediaTempoAtendimento =
            Math.round((soma / tempos.length) * 100) / 100;
      }

      // ⬇️ ADICIONE ESTE BLOCO
      // NOVO: Média de horas por chamado
      if (grupo.quantidadeChamados > 0) {
         grupo.mediaHorasPorChamado =
            Math.round(
               (grupo.totalHorasGastas / grupo.quantidadeChamados) * 100
            ) / 100;
      }
   });

   return Object.values(grupos);
}

function getGrupoKey(
   chamado: ProcessedChamado,
   agruparPor: AgrupamentoTipo
): { chave: string; nomeGrupo: string; extraData: Partial<GrupoRelatorio> } {
   switch (agruparPor) {
      case 'cliente':
         return {
            chave: `${chamado.COD_CLIENTE || 'SEM_CLIENTE'}`,
            nomeGrupo: chamado.NOME_CLIENTE || 'Sem Cliente',
            extraData: { codCliente: chamado.COD_CLIENTE || undefined },
         };

      case 'recurso':
         return {
            chave: `${chamado.COD_RECURSO || 'SEM_RECURSO'}`,
            nomeGrupo: chamado.NOME_RECURSO || 'Sem Recurso',
            extraData: { codRecurso: chamado.COD_RECURSO || undefined },
         };

      case 'projeto':
         return {
            chave: `${chamado.COD_PROJETO || 'SEM_PROJETO'}`,
            nomeGrupo: chamado.PROJETO_COMPLETO || 'Sem Projeto',
            extraData: { codProjeto: chamado.COD_PROJETO || undefined },
         };

      case 'status':
         return {
            chave: chamado.STATUS_CHAMADO || 'SEM_STATUS',
            nomeGrupo: chamado.STATUS_CHAMADO || 'Sem Status',
            extraData: { status: chamado.STATUS_CHAMADO || undefined },
         };

      case 'classificacao':
         return {
            chave: `${chamado.COD_CLASSIFICACAO || 'SEM_CLASSIFICACAO'}`,
            nomeGrupo: chamado.NOME_CLASSIFICACAO || 'Sem Classificação',
            extraData: {
               codClassificacao: chamado.COD_CLASSIFICACAO || undefined,
            },
         };

      case 'prioridade':
         return {
            chave: `${chamado.PRIOR_CHAMADO ?? 'SEM_PRIORIDADE'}`,
            nomeGrupo: getPrioridadeNome(chamado.PRIOR_CHAMADO),
            extraData: {},
         };

      case 'mes':
         if (chamado.DATA_CHAMADO) {
            const data = new Date(chamado.DATA_CHAMADO);
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
            chave: `${chamado.COD_CLIENTE || 'SEM_CLIENTE'}-${chamado.COD_RECURSO || 'SEM_RECURSO'}`,
            nomeGrupo: `${chamado.NOME_CLIENTE || 'Sem Cliente'} - ${chamado.NOME_RECURSO || 'Sem Recurso'}`,
            extraData: {
               codCliente: chamado.COD_CLIENTE || undefined,
               codRecurso: chamado.COD_RECURSO || undefined,
            },
         };

      default:
         return {
            chave: `${chamado.COD_CLIENTE || 'SEM_CLIENTE'}`,
            nomeGrupo: chamado.NOME_CLIENTE || 'Sem Cliente',
            extraData: { codCliente: chamado.COD_CLIENTE || undefined },
         };
   }
}

function buildDetalheChamado(
   chamado: ProcessedChamado,
   agruparPor: AgrupamentoTipo
): DetalheChamado {
   const detalhe: DetalheChamado = {
      codChamado: chamado.COD_CHAMADO,
      data: chamado.DATA_CHAMADO,
      hora: chamado.HORA_CHAMADO,
      assunto: chamado.ASSUNTO_CHAMADO,
      status: chamado.STATUS_CHAMADO,
      prioridade: chamado.PRIOR_CHAMADO,
      dataEnvio: chamado.DTENVIO_CHAMADO,
      diasEmAberto: chamado.DIAS_EM_ABERTO,
      tempoAtendimentoDias: chamado.TEMPO_ATENDIMENTO_DIAS,
      horasGastas: chamado.HORAS_GASTAS, // ⬅️ ADICIONE ESTA LINHA
   };

   if (agruparPor !== 'cliente') {
      detalhe.cliente = chamado.NOME_CLIENTE;
      detalhe.codCliente = chamado.COD_CLIENTE;
   }

   if (agruparPor !== 'recurso') {
      detalhe.recurso = chamado.NOME_RECURSO;
      detalhe.codRecurso = chamado.COD_RECURSO;
   }

   if (agruparPor !== 'projeto') {
      detalhe.projeto = chamado.PROJETO_COMPLETO;
      detalhe.codProjeto = chamado.COD_PROJETO;
   }

   if (agruparPor !== 'classificacao') {
      detalhe.classificacao = chamado.NOME_CLASSIFICACAO;
      detalhe.codClassificacao = chamado.COD_CLASSIFICACAO;
   }

   detalhe.tarefa = chamado.TAREFA_COMPLETA;
   detalhe.codTarefa = chamado.CODTRF_CHAMADO;

   return detalhe;
}

function calculateTotalizadores(grupos: GrupoRelatorio[]): Totalizadores {
   const totalChamados = grupos.reduce(
      (acc, g) => acc + g.quantidadeChamados,
      0
   );
   const totalAbertos = grupos.reduce((acc, g) => acc + g.chamadosAbertos, 0);
   const totalFechados = grupos.reduce((acc, g) => acc + g.chamadosFechados, 0);
   const totalPendentes = grupos.reduce(
      (acc, g) => acc + g.chamadosPendentes,
      0
   );

   const mediasValidas = grupos
      .map(g => g.mediaTempoAtendimento)
      .filter((m): m is number => m !== null);

   let mediaGeralTempoAtendimento: number | null = null;
   if (mediasValidas.length > 0) {
      const somaMedias = mediasValidas.reduce((acc, m) => acc + m, 0);
      mediaGeralTempoAtendimento =
         Math.round((somaMedias / mediasValidas.length) * 100) / 100;
   }

   // NOVO: Total e média de horas gastas
   const totalHorasGastas = grupos.reduce(
      (acc, g) => acc + g.totalHorasGastas,
      0
   );

   let mediaHorasPorChamado: number | null = null;
   if (totalChamados > 0) {
      mediaHorasPorChamado =
         Math.round((totalHorasGastas / totalChamados) * 100) / 100;
   }

   return {
      totalChamados,
      totalAbertos,
      totalFechados,
      totalPendentes,
      mediaGeralTempoAtendimento,
      quantidadeGrupos: grupos.length,
      totalHorasGastas: Math.round(totalHorasGastas * 100) / 100, // ⬅️ ADICIONE
      mediaHorasPorChamado, // ⬅️ ADICIONE
   };
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

      if (anoIni === anoFim && mesIni === mesFim && diaIni === diaFim) {
         conditions.push(
            'EXTRACT(YEAR FROM Chamado.DATA_CHAMADO) = ? AND EXTRACT(MONTH FROM Chamado.DATA_CHAMADO) = ? AND EXTRACT(DAY FROM Chamado.DATA_CHAMADO) = ?'
         );
         params.push(anoIni, mesIni, diaIni);
      } else {
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
         'EXTRACT(YEAR FROM Chamado.DATA_CHAMADO) = ? AND EXTRACT(MONTH FROM Chamado.DATA_CHAMADO) = ?'
      );
      params.push(ano, mes);
   } else if (anoParam) {
      const ano = Number(anoParam);
      if (isNaN(ano)) {
         throw new ApiError(400, 'Ano inválido');
      }
      conditions.push('EXTRACT(YEAR FROM Chamado.DATA_CHAMADO) = ?');
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
      conditions.push('Chamado.COD_RECURSO = ?');
      params.push(Number(codRecurso));
   } else if (isAdmin && codRecursoFilter) {
      conditions.push('Chamado.COD_RECURSO = ?');
      params.push(Number(codRecursoFilter));
   }

   // Filtro de cliente
   const codClienteFilter = getCleanParam(searchParams.get('codCliente'));
   if (codClienteFilter) {
      conditions.push('Chamado.COD_CLIENTE = ?');
      params.push(Number(codClienteFilter));
   }

   // Filtro de projeto
   const codProjetoFilter = getCleanParam(searchParams.get('codProjeto'));
   if (codProjetoFilter) {
      conditions.push('Projeto.COD_PROJETO = ?');
      params.push(Number(codProjetoFilter));
   }

   // Filtro de status
   const statusFilter = getCleanParam(searchParams.get('status'));
   if (statusFilter) {
      conditions.push('TRIM(UPPER(Chamado.STATUS_CHAMADO)) = ?');
      params.push(statusFilter.toUpperCase().trim());
   }

   // Filtro de prioridade
   const prioridadeFilter = getCleanParam(searchParams.get('prioridade'));
   if (prioridadeFilter) {
      conditions.push('Chamado.PRIOR_CHAMADO = ?');
      params.push(Number(prioridadeFilter));
   }

   // Filtro de classificação
   const codClassificacaoFilter = getCleanParam(
      searchParams.get('codClassificacao')
   );
   if (codClassificacaoFilter) {
      conditions.push('Chamado.COD_CLASSIFICACAO = ?');
      params.push(Number(codClassificacaoFilter));
   }

   return { conditions, params };
}

function buildQuery(whereConditions: string[]): string {
   return `
      SELECT
         Chamado.COD_CHAMADO,
         Chamado.DATA_CHAMADO,
         Chamado.HORA_CHAMADO,
         Chamado.SOLICITACAO_CHAMADO,
         Chamado.CONCLUSAO_CHAMADO,
         Chamado.STATUS_CHAMADO,
         Chamado.DTENVIO_CHAMADO,
         Chamado.COD_RECURSO,
         Chamado.COD_CLIENTE,
         Chamado.CODTRF_CHAMADO,
         Chamado.ASSUNTO_CHAMADO,
         Chamado.EMAIL_CHAMADO,
         Chamado.PRIOR_CHAMADO,
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

// ==================== CSV GENERATION ====================
function generateCSV(
   dadosAgrupados: GrupoRelatorio[],
   totalizadores: Totalizadores,
   agruparPor: AgrupamentoTipo
): string {
   const csvLines: string[] = [];

   // Cabeçalho
   csvLines.push(
      'Agrupamento;Nome;Código;Quantidade Chamados;Abertos;Fechados;Pendentes;Média Tempo Atendimento (dias);Total Horas Gastas;Média Horas/Chamado'
   );

   // Dados
   dadosAgrupados.forEach(grupo => {
      const codigo =
         grupo.codCliente ||
         grupo.codRecurso ||
         grupo.codProjeto ||
         grupo.codClassificacao ||
         '';
      const mediaTempoAtendimento =
         grupo.mediaTempoAtendimento !== null
            ? grupo.mediaTempoAtendimento.toString()
            : 'N/A';

      const mediaHoras = // ⬅️ ADICIONE ESTA LINHA
         grupo.mediaHorasPorChamado !== null
            ? grupo.mediaHorasPorChamado.toString()
            : 'N/A';

      csvLines.push(
         `${agruparPor};${grupo.nome};${codigo};${grupo.quantidadeChamados};${grupo.chamadosAbertos};${grupo.chamadosFechados};${grupo.chamadosPendentes};${mediaTempoAtendimento};${grupo.totalHorasGastas};${mediaHoras}`
      );
   });

   // Totalizador
   csvLines.push('');
   const mediaGeralAtendimento =
      totalizadores.mediaGeralTempoAtendimento !== null
         ? totalizadores.mediaGeralTempoAtendimento.toString()
         : 'N/A';

   csvLines.push(
      `TOTAL GERAL;;${totalizadores.totalChamados};${totalizadores.totalAbertos};${totalizadores.totalFechados};${totalizadores.totalPendentes};${mediaGeralAtendimento}`
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
      const processedData = await Promise.all(
         (rawData || []).map(record => processRecord(record))
      );

      // Agrupamento de dados
      let dadosAgrupados = agruparDados(processedData, agruparPor);

      // Calcular totalizadores
      const totalizadores = calculateTotalizadores(dadosAgrupados);

      // Ordenar por quantidade de chamados (decrescente)
      dadosAgrupados.sort(
         (a, b) => b.quantidadeChamados - a.quantidadeChamados
      );

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
               'Content-Disposition': `attachment; filename="relatorio_chamados_${agruparPor}_${dataAtual}.csv"`,
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
                  status: getCleanParam(searchParams.get('status')),
                  prioridade: getCleanParam(searchParams.get('prioridade')),
                  classificacao: getCleanParam(
                     searchParams.get('codClassificacao')
                  ),
               },
               totalizadores,
               grupos: dadosAgrupados,
            },
         },
         { status: 200 }
      );
   } catch (error) {
      console.error('Erro ao gerar relatório de chamados:', error);

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
         { error: 'Erro ao gerar relatório de chamados' },
         { status: 500 }
      );
   }
}
