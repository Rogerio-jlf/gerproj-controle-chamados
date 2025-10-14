'use client';
// ================================================================================
// IMPORTS
// ================================================================================
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback } from 'react';

// Components
import { IsError } from '../components/IsError';
import { IsLoading } from '../components/IsLoading';
import ExcelButtonRelatorioOS from '../../../../components/botoes/Button_Excel';
import PDFButtonRelatorioOS from '../../../../components/botoes/Button_PDF';

// Hooks & Types
import { useAuth } from '../../../../hooks/useAuth';

// Icons
import { HiDocumentReport } from 'react-icons/hi';
import { IoClose } from 'react-icons/io5';
import {
   FaExclamationTriangle,
   FaChevronDown,
   FaChevronRight,
} from 'react-icons/fa';
import { MdFilterList } from 'react-icons/md';
import {
   formatarHora,
   formatarCodNumber,
   formatarHorasTotaisHorasDecimais,
   formatarCodString,
   formatarDataParaBR,
} from '../../../../utils/formatters';

import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

import { FiRefreshCcw } from 'react-icons/fi';
import { BsEraserFill } from 'react-icons/bs';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';

// ================================================================================
// TIPOS E INTERFACES
// ================================================================================
interface DetalheOS {
   codOs: number;
   data: string;
   chamado: string;
   horaInicio: string;
   horaFim: string;
   horas: number;
   faturado: string;
   validado: string;
   competencia: string;
   cliente?: string;
   codCliente?: number;
   recurso?: string;
   codRecurso?: number;
   projeto?: string;
   codProjeto?: number;
   tarefa?: string;
   codTarefa?: number;
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

interface Totalizadores {
   totalGeralHoras: number;
   totalGeralOS: number;
   totalOSFaturadas: number;
   totalOSValidadas: number;
   quantidadeGrupos: number;
}

interface RelatorioResponse {
   relatorio: {
      tipoAgrupamento: string;
      periodo: {
         dataInicio: string | null;
         dataFim: string | null;
         mes: string | null;
         ano: string | null;
      };
      filtros: {
         cliente: string | null;
         recurso: string | null;
         projeto: string | null;
         faturado: string | null;
         validado: string | null;
      };
      totalizadores: Totalizadores;
      grupos: GrupoRelatorio[];
   };
}

interface Props {
   isOpen?: boolean;
   onClose: () => void;
   // ================================================================================
}

const agruparOptions = [
   { name: 'Cliente', code: 'cliente' },
   { name: 'Recurso', code: 'recurso' },
   { name: 'Projeto', code: 'projeto' },
   { name: 'Tarefa', code: 'tarefa' },
   // { name: 'Mês', code: 'mes' },
   { name: 'Cliente + Recurso', code: 'cliente-recurso' },
];

const optionsAgruparPorSimNao = [
   { name: 'Todos', code: 'todos' },
   { name: 'Sim', code: 'sim' },
   { name: 'Nao', code: 'nao' },
];

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export function RelatorioOS({ isOpen = true, onClose }: Props) {
   // ================================================================================
   // HOOKS E CONTEXTOS
   // ================================================================================
   const { user } = useAuth();
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   // ================================================================================
   // ESTADOS - FILTROS
   // ================================================================================
   const [agruparPor, setAgruparPor] = useState<string>('cliente');
   const [mesAno, setMesAno] = useState<string>('');
   const [dataInicio, setDataInicio] = useState<string>('');
   const [dataFim, setDataFim] = useState<string>('');
   const [faturadoOS, setFaturadoOS] = useState<string>('');
   const [validOS, setValidOS] = useState<string>('');
   const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

   // ================================================================================
   // QUERY PARAMS E API
   // ================================================================================
   const enabled = !!token && !!user;

   const queryParams = useMemo(() => {
      if (!user) return new URLSearchParams();

      const params = new URLSearchParams({
         agruparPor: agruparPor,
      });

      // Período por mês/ano
      if (mesAno) {
         const [ano, mes] = mesAno.split('-');
         params.append('ano', ano);
         params.append('mes', mes);
      }

      // Período por intervalo de datas
      if (dataInicio) params.append('dataInicio', dataInicio);
      if (dataFim) params.append('dataFim', dataFim);

      // Filtros adicionais
      if (faturadoOS) params.append('faturado', faturadoOS);
      if (validOS) params.append('validado', validOS);

      return params;
   }, [user, agruparPor, mesAno, dataInicio, dataFim, faturadoOS, validOS]);

   async function fetchRelatorio(
      params: URLSearchParams,
      token: string
   ): Promise<RelatorioResponse> {
      const res = await fetch(`/api/OS/relatorio?${params}`, {
         headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
         },
      });

      if (!res.ok) {
         const errorData = await res.json();
         throw new Error(errorData.error || 'Erro ao buscar relatório');
      }

      return await res.json();
   }

   const {
      data: relatorioData,
      isLoading,
      isError,
      error,
      refetch,
   } = useQuery({
      queryKey: ['relatorioOS', queryParams.toString(), token],
      queryFn: () => fetchRelatorio(queryParams, token!),
      enabled,
      staleTime: 1000 * 60 * 5,
      retry: 2,
   });

   const filtrosAplicados = useMemo(() => {
      const filtros: any = {};

      if (dataInicio) filtros.dataInicio = dataInicio;
      if (dataFim) filtros.dataFim = dataFim;

      if (mesAno) {
         const [ano, mes] = mesAno.split('-');
         filtros.ano = ano;
         filtros.mes = mes;
      }

      if (faturadoOS && faturadoOS !== 'todos') filtros.faturado = faturadoOS;
      if (validOS && validOS !== 'todos') filtros.validado = validOS;

      // Se você tiver outros filtros como cliente, recurso, projeto
      // filtros.cliente = nomeCliente;
      // filtros.recurso = nomeRecurso;
      // filtros.projeto = nomeProjeto;

      return filtros;
   }, [dataInicio, dataFim, mesAno, faturadoOS, validOS]);

   // ================================================================================
   // HANDLERS
   // ================================================================================
   const toggleGroup = useCallback((chave: string) => {
      setExpandedGroups(prev => {
         const newSet = new Set(prev);
         if (newSet.has(chave)) {
            newSet.delete(chave);
         } else {
            newSet.add(chave);
         }
         return newSet;
      });
   }, []);

   const handleLimparFiltros = useCallback(() => {
      setMesAno('');
      setDataInicio('');
      setDataFim('');
      setFaturadoOS('');
      setValidOS('');
   }, []);

   const handleCloseRelatorio = () => {
      setTimeout(() => {
         onClose();
      }, 300);
   };

   // Converte string 'yyyy-mm-dd' para Date sem deslocamento
   function parseDate(dateStr: string) {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
   }

   // Converte Date para string 'yyyy-mm-dd'
   function formatDate(date: Date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
   }

   // ================================================================================
   // VALIDAÇÕES E ESTADOS DE CARREGAMENTO
   // ================================================================================

   if (!isOpen) return null;

   if (isLoading) {
      return (
         <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl" />
            <div className="relative z-10">
               <IsLoading title="Gerando relatório de OS" isLoading={false} />
            </div>
         </div>
      );
   }

   if (isError) {
      return (
         <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl" />
            <div className="relative z-10">
               <IsError error={error as Error} />
            </div>
         </div>
      );
   }

   const totalizadores = relatorioData?.relatorio.totalizadores;
   const grupos = relatorioData?.relatorio.grupos || [];

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
         {/* OVERLAY */}
         <div className="absolute inset-0 bg-black/10 backdrop-blur-3xl" />

         {/* MODAL */}
         <div className="animate-in slide-in-from-bottom-4 relative z-10 mx-4 max-h-[100vh] w-full max-w-[95vw] overflow-hidden rounded-2xl shadow-md shadow-black transition-all duration-500 ease-out">
            {/* ===== HEADER ===== */}
            <header className="flex flex-col gap-6 bg-white/50 p-6">
               {/* HEADER */}
               <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center justify-center gap-6">
                     <div className="flex items-center justify-center rounded-lg bg-white/30 p-4 shadow-md shadow-black">
                        <HiDocumentReport className="text-black" size={28} />
                     </div>
                     <h1 className="text-4xl font-extrabold tracking-widest text-black uppercase select-none">
                        Relatório de OS
                     </h1>
                  </div>
                  {/* ===== */}

                  <button
                     onClick={handleCloseRelatorio}
                     className="group cursor-pointer rounded-full bg-red-500/50 p-3 text-white shadow-md shadow-black transition-all hover:scale-125 hover:bg-red-500 active:scale-95"
                  >
                     <IoClose size={24} />
                  </button>
               </div>
               {/* ========== */}

               {/* FILTROS & CARDS */}
               <div className="flex items-center justify-between gap-6">
                  {/* FILTROS */}
                  <div className="flex w-[1600px] flex-col gap-4 p-6">
                     {/* Header Filtros */}
                     <div className="flex items-center gap-4">
                        <MdFilterList className="text-black" size={28} />
                        <h2 className="text-xl font-bold tracking-widest text-black uppercase select-none">
                           Filtros
                        </h2>
                     </div>
                     {/* ========== */}

                     {/* Filtros */}
                     <div className="grid grid-cols-4 gap-4">
                        {/* Agrupar por */}
                        <div className="flex flex-col gap-1">
                           <label className="text-base font-semibold tracking-widest text-black italic select-none">
                              Agrupar por:
                           </label>

                           <Dropdown
                              value={agruparPor}
                              options={agruparOptions}
                              optionLabel="name"
                              optionValue="code"
                              onChange={e => setAgruparPor(e.value)}
                              className="shadow-md shadow-black"
                              appendTo="self"
                           />
                        </div>
                        {/* ===== */}

                        {/* Mês/Ano */}
                        <div className="flex flex-col gap-1">
                           <label className="text-base font-semibold tracking-widest text-black italic select-none">
                              Mês/Ano:
                           </label>

                           <div className="relative">
                              <Calendar
                                 view="month"
                                 dateFormat="mm/yy"
                                 value={
                                    mesAno ? new Date(mesAno + '-01') : null
                                 }
                                 onChange={e => {
                                    if (e.value) {
                                       const ano = e.value.getFullYear();
                                       const mes = (e.value.getMonth() + 1)
                                          .toString()
                                          .padStart(2, '0');
                                       setMesAno(`${ano}-${mes}`);
                                    } else {
                                       setMesAno('');
                                    }
                                 }}
                                 showIcon
                                 placeholder="Mês/Ano"
                                 className="w-full shadow-md shadow-black"
                                 appendTo="self"
                              />
                           </div>
                        </div>
                        {/* ===== */}

                        {/* Data Início */}
                        <div className="flex flex-col gap-1">
                           <label className="text-base font-semibold tracking-widest text-black italic select-none">
                              Data Início:
                           </label>
                           <Calendar
                              value={dataInicio ? parseDate(dataInicio) : null}
                              onChange={e =>
                                 setDataInicio(
                                    e.value ? formatDate(e.value) : ''
                                 )
                              }
                              showIcon
                              dateFormat="dd/mm/yy" // força formato brasileiro
                              placeholder="Data inicial"
                              className="w-full rounded-md shadow-md shadow-black"
                              appendTo="self"
                           />
                        </div>

                        {/* Data Fim */}
                        <div className="flex flex-col gap-1">
                           <label className="text-base font-semibold tracking-widest text-black italic select-none">
                              Data Fim:
                           </label>
                           <Calendar
                              value={dataFim ? parseDate(dataFim) : null}
                              onChange={e =>
                                 setDataFim(e.value ? formatDate(e.value) : '')
                              }
                              showIcon
                              dateFormat="dd/mm/yy" // força formato brasileiro
                              placeholder="Data final"
                              className="w-full rounded-md shadow-md shadow-black"
                              appendTo="self"
                           />
                        </div>

                        {/* Faturado */}
                        <div className="flex flex-col gap-1">
                           <label className="text-base font-semibold tracking-widest text-black italic select-none">
                              Faturado:
                           </label>
                           <Dropdown
                              value={faturadoOS}
                              options={optionsAgruparPorSimNao}
                              optionLabel="name"
                              optionValue="code"
                              onChange={e => setFaturadoOS(e.value)}
                              placeholder="Selecione uma opção"
                              className="w-full shadow-md shadow-black"
                              appendTo="self"
                           />
                        </div>
                        {/* ===== */}

                        {/* Validado */}
                        <div className="flex flex-col gap-1">
                           <label className="text-base font-semibold tracking-widest text-black italic select-none">
                              Validado:
                           </label>
                           <Dropdown
                              value={validOS}
                              options={optionsAgruparPorSimNao}
                              optionLabel="name"
                              optionValue="code"
                              onChange={e => setValidOS(e.value)}
                              placeholder="Selecione uma opção"
                              className="w-full shadow-md shadow-black"
                              appendTo="self"
                           />
                        </div>
                        {/* ===== */}

                        {/* Botões Atualizar & Limpar Filtros */}
                        <div className="col-span-2 flex items-end gap-4">
                           {/* Botão Atualizar */}
                           <Button
                              onClick={() => refetch()}
                              className="!flex !flex-1 !items-center !justify-center !gap-4 !text-base !font-extrabold !tracking-widest !text-black !italic shadow-md shadow-black transition-all active:scale-95"
                              severity="success"
                           >
                              <FiRefreshCcw size={24} className="" />
                              ATUALIZAR
                           </Button>
                           {/* ===== */}

                           {/* Botão Limpar Filtros */}
                           <Button
                              onClick={handleLimparFiltros}
                              className="!flex !flex-1 !items-center !justify-center !gap-4 !text-base !font-extrabold !tracking-widest !text-black !italic shadow-md shadow-black transition-all active:scale-95"
                              severity="info"
                           >
                              <BsEraserFill size={24} className="" />
                              LIMPAR FILTROS
                           </Button>
                        </div>
                     </div>
                  </div>
                  {/* ========== */}

                  {/* CARDS */}
                  {totalizadores && (
                     <div className="grid flex-1 grid-cols-2 gap-4">
                        {/* Card Total de Horas */}
                        <div className="flex flex-col gap-1 rounded-tr-4xl rounded-bl-4xl border-[1px] border-teal-600 bg-gradient-to-br from-teal-500 to-teal-600 p-6 shadow-md shadow-black">
                           <div className="text-sm font-extrabold tracking-widest text-white uppercase italic select-none">
                              Total de Horas
                           </div>
                           <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                              {formatarHorasTotaisHorasDecimais(
                                 totalizadores.totalGeralHoras
                              )}
                              h
                           </div>
                        </div>
                        {/* ===== */}

                        {/* Card Total de OS's */}
                        <div className="flex flex-col gap-1 rounded-tl-4xl rounded-br-4xl border-[1px] border-purple-600 bg-gradient-to-br from-purple-500 to-purple-600 p-6 shadow-md shadow-black">
                           <div className="text-sm font-extrabold tracking-widest text-white italic select-none">
                              TOTAL DE OS's
                           </div>
                           <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                              {formatarCodNumber(totalizadores.totalGeralOS)}
                           </div>
                        </div>
                        {/* ===== */}

                        {/* Card Total de OS's Faturadas */}
                        <div className="flex flex-col gap-1 rounded-tl-4xl rounded-br-4xl border-[1px] border-blue-600 bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-md shadow-black">
                           <div className="text-sm font-extrabold tracking-widest text-white italic select-none">
                              TOTAL DE OS's FATURADAS
                           </div>
                           <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                              {formatarCodNumber(
                                 totalizadores.totalOSFaturadas
                              )}
                           </div>
                        </div>
                        {/* ===== */}

                        {/* Card Total de OS's Validadas */}
                        <div className="flex flex-col gap-1 rounded-tr-4xl rounded-bl-4xl border-[1px] border-green-600 bg-gradient-to-br from-green-500 to-green-600 p-6 shadow-md shadow-black">
                           <div className="text-sm font-extrabold tracking-widest text-white italic select-none">
                              TOTAL DE OS's VALIDADAS
                           </div>
                           <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                              {formatarCodNumber(
                                 totalizadores.totalOSValidadas
                              )}
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </header>
            {/* ==================== */}

            {/* CONTEÚDO */}
            <main className="h-full w-full overflow-hidden bg-black">
               <div
                  className="h-full overflow-y-auto p-6"
                  style={{ maxHeight: 'calc(100vh - 600px)' }}
               >
                  {grupos.length === 0 ? (
                     <div className="flex flex-col items-center justify-center gap-4 py-20">
                        <FaExclamationTriangle
                           className="text-amber-500"
                           size={60}
                        />
                        <p className="text-xl font-bold text-white">
                           Nenhum dado encontrado para os filtros selecionados
                        </p>
                     </div>
                  ) : (
                     <div className="flex flex-col gap-4">
                        {grupos.map(grupo => (
                           <div
                              key={grupo.chave}
                              className="overflow-hidden rounded-lg bg-white/10 shadow-md shadow-black"
                           >
                              {/* CABEÇALHO DO GRUPO */}
                              <div className="group flex cursor-pointer items-center justify-between bg-teal-700 px-6 py-1.5 transition-all hover:bg-teal-500">
                                 <div
                                    onClick={() => toggleGroup(grupo.chave)}
                                    className="flex flex-1 items-center gap-4"
                                 >
                                    {expandedGroups.has(grupo.chave) ? (
                                       <FaChevronDown
                                          className="text-white group-hover:text-black"
                                          size={20}
                                       />
                                    ) : (
                                       <FaChevronRight
                                          className="text-white group-hover:text-black"
                                          size={20}
                                       />
                                    )}
                                    <div className="flex flex-col gap-1">
                                       <h3 className="text-xl font-extrabold tracking-widest text-white uppercase select-none group-hover:text-black">
                                          {grupo.nome}
                                       </h3>
                                       <p className="text-sm font-semibold tracking-widest text-white italic select-none group-hover:text-black">
                                          {formatarCodNumber(
                                             grupo.quantidadeOS
                                          )}{' '}
                                          OS's -{' '}
                                          {formatarHorasTotaisHorasDecimais(
                                             grupo.totalHoras
                                          )}{' '}
                                          horas
                                       </p>
                                    </div>
                                 </div>
                                 {/* ===== */}

                                 {/* BOTÕES DE EXPORTAÇÃO & INFORMAÇÕES DO GRUPO */}
                                 <div className="flex w-1/4 items-center justify-between gap-4">
                                    {/* Botão exporta Excel */}
                                    <div className="flex h-full items-center justify-center gap-4">
                                       <ExcelButtonRelatorioOS
                                          grupo={grupo}
                                          tipoAgrupamento={agruparPor}
                                          filtros={filtrosAplicados}
                                       />
                                       {/* ===== */}

                                       {/* Botão exporta PDF */}
                                       <PDFButtonRelatorioOS
                                          grupo={grupo}
                                          tipoAgrupamento={agruparPor}
                                          filtros={filtrosAplicados}
                                       />
                                    </div>
                                    {/* ===== */}

                                    {/* Informações do grupo */}
                                    <div className="flex h-full flex-col items-center justify-center gap-2">
                                       <div className="text-sm font-semibold tracking-widest text-white italic select-none group-hover:text-black">
                                          Faturadas:{' '}
                                          {formatarCodNumber(grupo.osFaturadas)}
                                       </div>
                                       <div className="text-sm font-semibold tracking-widest text-white italic select-none group-hover:text-black">
                                          Validadas:{' '}
                                          {formatarCodNumber(grupo.osValidadas)}
                                       </div>
                                    </div>
                                    {/* ===== */}

                                    {/* Total horas */}
                                    <div className="flex h-full items-center justify-center">
                                       <div className="text-3xl font-semibold tracking-widest text-white italic select-none group-hover:text-black">
                                          {formatarHorasTotaisHorasDecimais(
                                             grupo.totalHoras
                                          )}
                                          h
                                       </div>
                                    </div>
                                    {/* ===== */}
                                 </div>
                              </div>
                              {/* ========== */}

                              {/* ===== DETALHES DO GRUPO ===== */}
                              {expandedGroups.has(grupo.chave) && (
                                 <div className="border-[1px] border-white/20 bg-white/10 px-6 py-1">
                                    {/* ===== TABELA ===== */}
                                    <table className="w-full">
                                       <thead>
                                          <tr className="border-b-4 border-white/30">
                                             {/* OS */}
                                             <th className="p-2 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                                                OS
                                             </th>
                                             {/* ===== */}

                                             {/* Data */}
                                             <th className="p-2 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                                                Data
                                             </th>
                                             {/* ===== */}

                                             {/* Chamado */}
                                             <th className="p-2 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                                                Chamado
                                             </th>
                                             {/* ===== */}

                                             {/* Hora Início */}
                                             <th className="p-2 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                                                Hora Início
                                             </th>
                                             {/* ===== */}

                                             {/* Hora Fim */}
                                             <th className="p-2 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                                                Hora Fim
                                             </th>
                                             {/* ===== */}

                                             {/* Total Horas */}
                                             <th className="p-2 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                                                Horas
                                             </th>
                                             {/* ===== */}

                                             {/* Cliente */}
                                             {agruparPor !== 'cliente' && (
                                                <th className="p-2 text-left text-base font-bold tracking-widest text-white uppercase italic select-none">
                                                   Cliente
                                                </th>
                                             )}
                                             {/* ===== */}

                                             {/* Recurso */}
                                             {agruparPor !== 'recurso' && (
                                                <th className="p-2 text-left text-base font-bold tracking-widest text-white uppercase italic select-none">
                                                   Recurso
                                                </th>
                                             )}
                                             {/* ===== */}

                                             {/* Faturado */}
                                             <th className="p-2 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                                                Faturado
                                             </th>
                                             {/* ===== */}

                                             {/* Validado */}
                                             <th className="p-2 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                                                Validado
                                             </th>
                                          </tr>
                                       </thead>
                                       {/* ===== */}
                                       <tbody>
                                          {grupo.detalhes.map(
                                             (detalhe, idx) => (
                                                <tr
                                                   key={idx}
                                                   className="border-b border-white/20 transition-all hover:bg-white/20"
                                                >
                                                   {/* OS */}
                                                   <td className="p-2 text-center text-sm font-semibold tracking-widest text-white select-none">
                                                      {formatarCodNumber(
                                                         detalhe.codOs
                                                      )}
                                                   </td>
                                                   {/* ===== */}

                                                   {/* Data */}
                                                   <td className="p-2 text-center text-sm font-semibold tracking-widest text-white select-none">
                                                      {formatarDataParaBR(
                                                         detalhe.data
                                                      )}
                                                   </td>
                                                   {/* ===== */}

                                                   {/* Chamado */}
                                                   <td className="p-2 text-center text-sm font-semibold tracking-widest text-white select-none">
                                                      {formatarCodString(
                                                         detalhe.chamado
                                                      )}
                                                   </td>
                                                   {/* ===== */}

                                                   {/* Hora Início */}
                                                   <td className="p-2 text-center text-sm font-semibold tracking-widest text-white select-none">
                                                      {formatarHora(
                                                         detalhe.horaInicio
                                                      )}
                                                   </td>
                                                   {/* ===== */}

                                                   {/* Hora Fim */}
                                                   <td className="p-2 text-center text-sm font-semibold tracking-widest text-white select-none">
                                                      {formatarHora(
                                                         detalhe.horaFim
                                                      )}
                                                   </td>
                                                   {/* ===== */}

                                                   {/* Horas */}
                                                   <td className="p-2 text-center text-sm font-extrabold tracking-widest text-amber-500 select-none">
                                                      {formatarHorasTotaisHorasDecimais(
                                                         detalhe.horas
                                                      )}
                                                   </td>
                                                   {/* ===== */}

                                                   {/* Cliente */}
                                                   {agruparPor !==
                                                      'cliente' && (
                                                      <td className="p-2 text-sm font-semibold tracking-widest text-white select-none">
                                                         {detalhe.cliente ||
                                                            '----------'}
                                                      </td>
                                                   )}
                                                   {/* ===== */}

                                                   {/* Recurso */}
                                                   {agruparPor !==
                                                      'recurso' && (
                                                      <td className="p-2 text-sm font-semibold tracking-widest text-white select-none">
                                                         {corrigirTextoCorrompido(
                                                            detalhe.recurso ??
                                                               ''
                                                         ) || '----------'}
                                                      </td>
                                                   )}

                                                   {/* Faturado */}
                                                   {/* ===== */}
                                                   <td className="p-2 text-center">
                                                      <span
                                                         className={`inline-block rounded px-2 py-1 text-sm font-extrabold tracking-widest select-none ${
                                                            detalhe.faturado ===
                                                            'SIM'
                                                               ? 'bg-blue-600 text-white'
                                                               : 'bg-red-600 text-white'
                                                         }`}
                                                      >
                                                         {detalhe.faturado}
                                                      </span>
                                                   </td>
                                                   {/* ===== */}

                                                   {/* Validado */}
                                                   <td className="p-2 text-center">
                                                      <span
                                                         className={`inline-block rounded px-2 py-1 text-sm font-extrabold tracking-widest select-none ${
                                                            detalhe.validado ===
                                                            'SIM'
                                                               ? 'bg-blue-600 text-white'
                                                               : 'bg-red-600 text-white'
                                                         }`}
                                                      >
                                                         {detalhe.validado}
                                                      </span>
                                                   </td>
                                                </tr>
                                             )
                                          )}
                                       </tbody>
                                       {/* ===== */}
                                    </table>
                                 </div>
                              )}
                              {/* ========== */}
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </main>
         </div>
      </div>
   );
}
