'use client';
// IMPORTS
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback, useEffect } from 'react';

// COMPONENTS
import { IsError } from '../../../../../components/IsError';
import { IsLoading } from '../../../../../components/IsLoading';
import ExcelButtonRelatorioOS from '../../../../../components/Button_Excel';
import PDFButtonRelatorioOS from '../../../../../components/Button_PDF';
import { SelectDataInicio, SelectDataFim } from './SelectData';

// HOOKS
import { useAuth } from '../../../../../hooks/useAuth';

// ICONS
import { HiDocumentReport } from 'react-icons/hi';
import { IoClose } from 'react-icons/io5';
import {
   FaClock,
   FaExclamationTriangle,
   FaEye,
   FaSearch,
} from 'react-icons/fa';
import { MdFilterList } from 'react-icons/md';
import { FiRefreshCcw } from 'react-icons/fi';
import { BsEraserFill } from 'react-icons/bs';
import { FaFilterCircleXmark } from 'react-icons/fa6';

// FORMATTERS
import {
   formatarHora,
   formatarCodNumber,
   formatarHorasTotaisHorasDecimais,
   formatarCodString,
   formatarDataParaBR,
   normalizeDate,
} from '../../../../../utils/formatters';

// PRIMEREACT
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// UTILS
import { corrigirTextoCorrompido } from '../../../../../lib/corrigirTextoCorrompido';

import { SelectSimNaoTabelaOS } from '../filtros/Select_Sim_Nao_Tabela_OS';
import { InputFilterTableHeaderProps } from '../../../../../types/types';
import { debounce } from 'lodash';

// ================================================================================
// CONSTANTES
// ================================================================================
const MODAL_MAX_HEIGHT = 'calc(100vh - 600px)';
const ANIMATION_DURATION = 100;
const CACHE_TIME = 1000 * 60 * 5;

const AGRUPAR_OPTIONS = [
   { name: 'Cliente', code: 'cliente' },
   { name: 'Recurso', code: 'recurso' },
   { name: 'Projeto', code: 'projeto' },
   { name: 'Tarefa', code: 'tarefa' },
   { name: 'Cliente + Recurso', code: 'cliente-recurso' },
];

const OPTIONS_SIM_NAO = [
   { name: 'Todos', code: 'todos' },
   { name: 'Sim', code: 'sim' },
   { name: 'Nao', code: 'nao' },
];

/*
 * Colunas e limites utilizados pelo InputFilterWithDebounce.
 * Ajuste as chaves e valores conforme as colunas reais do seu sistema.
 */
const COLUMN_MAX_LENGTH: Record<string, number> = {
   // Exemplo de limites por coluna — adicione/remova conforme necessário
   OS: 10,
   codOs: 10,
   DATA: 10,
   data: 10,
   CHAMADO: 50,
   cliente: 100,
   recurso: 100,
   FATURADO_OS: 5,
   VALID_OS: 5,
};

const NUMERIC_ONLY_COLUMNS: string[] = [
   // Colunas que aceitam apenas dígitos
   'OS',
   'codOs',
   'COD_OS',
   'CODIGO',
];

const DATE_COLUMNS: string[] = [
   // Colunas que representam datas (para validação de entrada)
   'DATA',
   'data',
   'DATA_INICIO',
   'DATA_FIM',
];

// ================================================================================
// INTERFACES
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
}

// ================================================================================
// COMPONENTE FILTRO MODAL
// ================================================================================

const InputFilterWithDebounce = ({
   value,
   onChange,
   type = 'text',
   columnId,
}: ExtendedInputFilterProps) => {
   const [localValue, setLocalValue] = useState(value);

   // Obter o limite máximo para a coluna específica
   const maxLength = columnId ? COLUMN_MAX_LENGTH[columnId] : undefined;

   // Verificar se a coluna aceita apenas números
   const isNumericOnly = columnId
      ? NUMERIC_ONLY_COLUMNS.includes(columnId as any)
      : false;

   // Sincroniza valor local com prop externa
   useEffect(() => {
      setLocalValue(value);
   }, [value]);

   // Debounce otimizado com cleanup
   const debouncedOnChange = useMemo(
      () =>
         debounce((newValue: string) => {
            onChange(newValue.trim());
         }, DEBOUNCE_DELAY),
      [onChange]
   );

   // Cleanup do debounce
   useEffect(() => {
      return () => {
         debouncedOnChange.cancel();
      };
   }, [debouncedOnChange]);

   // Handlers
   const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
         let inputValue = e.target.value;

         // Validar apenas números se for coluna numérica
         if (isNumericOnly && inputValue && !/^\d*$/.test(inputValue)) {
            return; // Não permite caracteres não numéricos
         }

         // Validação especial para campos de data - apenas números e /
         if (columnId && DATE_COLUMNS.includes(columnId as any)) {
            // Remove qualquer caractere que não seja número ou /
            inputValue = inputValue.replace(/[^\d/]/g, '');
         }

         // Validar o limite de caracteres se definido
         if (maxLength && inputValue.length > maxLength) {
            return; // Não permite digitar além do limite
         }

         setLocalValue(inputValue);
         debouncedOnChange(inputValue);
      },
      [debouncedOnChange, maxLength, isNumericOnly, columnId]
   );

   const handleClear = useCallback(() => {
      setLocalValue('');
      onChange('');
      debouncedOnChange.cancel();
   }, [onChange, debouncedOnChange]);

   // Atalho de teclado para limpar (Escape)
   const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
         if (e.key === 'Escape' && localValue) {
            e.preventDefault();
            handleClear();
         }
      },
      [localValue, handleClear]
   );

   // Calcular se está próximo do limite (>80%)
   const isNearLimit =
      maxLength && localValue ? localValue.length / maxLength > 0.8 : false;

   return (
      <div className="group relative w-full">
         <input
            type={type}
            value={localValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={maxLength}
            inputMode={isNumericOnly ? 'numeric' : 'text'}
            pattern={isNumericOnly ? '[0-9]*' : undefined}
            className={`w-full rounded-md border border-teal-950 bg-teal-900 px-4 py-2 pr-10 text-base text-white transition-all select-none hover:bg-teal-950 focus:ring-2 focus:outline-none ${
               isNearLimit
                  ? 'ring-2 ring-yellow-500/50 focus:ring-yellow-500'
                  : 'focus:ring-pink-500'
            }`}
         />

         {localValue && (
            <button
               onClick={handleClear}
               aria-label="Limpar filtro"
               title="Limpar (Esc)"
               className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-white transition-all hover:scale-150 hover:text-red-500 active:scale-95"
               type="button"
            >
               <IoClose size={20} />
            </button>
         )}
      </div>
   );
};

const FiltroModalDetalhes = ({
   value,
   onChange,
   placeholder,
}: {
   value: string;
   onChange: (value: string) => void;
   placeholder: string;
}) => {
   return (
      <div className="relative w-full">
         <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-md border border-teal-950 bg-teal-900 px-4 py-2 pr-10 text-base text-white transition-all select-none hover:bg-teal-950 focus:ring-2 focus:ring-pink-500 focus:outline-none"
         />
         {value && (
            <button
               onClick={() => onChange('')}
               className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-white transition-all hover:scale-150 hover:text-red-500 active:scale-95"
               type="button"
            >
               <IoClose size={20} />
            </button>
         )}
      </div>
   );
};

const DEBOUNCE_DELAY = 400;

const DROPDOWN_SIM_NAO_COLUMNS = ['FATURADO_OS', 'VALID_OS'] as const;

interface ExtendedInputFilterProps extends InputFilterTableHeaderProps {
   columnId?: string;
}

export const FiltrosHeaderTabelaOs = ({
   value,
   onChange,
   type = 'text',
   columnId,
}: ExtendedInputFilterProps) => {
   // Verificar se a coluna usa dropdown SIM/NÃO
   const isDropdownSimNao = columnId
      ? DROPDOWN_SIM_NAO_COLUMNS.includes(columnId as any)
      : false;

   // Se for dropdown SIM/NÃO, renderizar o componente específico
   if (isDropdownSimNao) {
      return <SelectSimNaoTabelaOS value={value} onChange={onChange} />;
   }

   // Caso contrário, renderizar o input normal
   return (
      <InputFilterWithDebounce
         value={value}
         onChange={onChange}
         type={type}
         columnId={columnId}
      />
   );
};

// ================================================================================
// COMPONENTE MODAL DE DETALHES
// ================================================================================
const ModalDetalhes = ({
   grupo,
   agruparPor,
   filtrosAplicados,
   onClose,
}: {
   grupo: GrupoRelatorio;
   agruparPor: string;
   filtrosAplicados: any;
   onClose: () => void;
}) => {
   const [isClosing, setIsClosing] = useState(false);

   // Estados dos filtros do modal
   const [filtroOS, setFiltroOS] = useState('');
   const [filtroData, setFiltroData] = useState('');
   const [filtroChamado, setFiltroChamado] = useState('');
   const [filtroCliente, setFiltroCliente] = useState('');
   const [filtroRecurso, setFiltroRecurso] = useState('');
   const [filtroFaturado, setFiltroFaturado] = useState('');
   const [filtroValidado, setFiltroValidado] = useState('');

   const handleClose = useCallback(() => {
      setIsClosing(true);
      setTimeout(() => {
         onClose();
      }, ANIMATION_DURATION);
   }, [onClose]);

   // Função para limpar todos os filtros
   const limparFiltros = useCallback(() => {
      setFiltroOS('');
      setFiltroData('');
      setFiltroChamado('');
      setFiltroCliente('');
      setFiltroRecurso('');
      setFiltroFaturado('');
      setFiltroValidado('');
   }, []);

   // Contar filtros ativos
   const filtrosAtivos = useMemo(() => {
      return [
         filtroOS,
         filtroData,
         filtroChamado,
         filtroCliente,
         filtroRecurso,
         filtroFaturado,
         filtroValidado,
      ].filter(f => f.trim()).length;
   }, [
      filtroOS,
      filtroData,
      filtroChamado,
      filtroCliente,
      filtroRecurso,
      filtroFaturado,
      filtroValidado,
   ]);

   // Filtrar detalhes baseado nos filtros
   const detalhesFiltrados = useMemo(() => {
      return grupo.detalhes.filter(detalhe => {
         // Filtro OS
         if (filtroOS && !String(detalhe.codOs).includes(filtroOS)) {
            return false;
         }

         // Filtro Data
         if (filtroData) {
            const dateFormats = normalizeDate(detalhe.data);
            const match = dateFormats.some(dateFormat =>
               dateFormat.toLowerCase().includes(filtroData.toLowerCase())
            );
            if (!match) return false;
         }

         // Filtro Chamado
         if (
            filtroChamado &&
            !String(detalhe.chamado).includes(filtroChamado)
         ) {
            return false;
         }

         // Filtro Cliente
         if (
            filtroCliente &&
            !detalhe.cliente
               ?.toLowerCase()
               .includes(filtroCliente.toLowerCase())
         ) {
            return false;
         }

         // Filtro Recurso
         if (filtroRecurso) {
            const recursoNormalizado = corrigirTextoCorrompido(
               detalhe.recurso ?? ''
            );
            if (
               !recursoNormalizado
                  .toLowerCase()
                  .includes(filtroRecurso.toLowerCase())
            ) {
               return false;
            }
         }

         // Filtro Faturado
         if (filtroFaturado && filtroFaturado !== 'todos') {
            if (filtroFaturado === 'sim' && detalhe.faturado !== 'SIM')
               return false;
            if (filtroFaturado === 'nao' && detalhe.faturado !== 'NAO')
               return false;
         }

         // Filtro Validado
         if (filtroValidado && filtroValidado !== 'todos') {
            if (filtroValidado === 'sim' && detalhe.validado !== 'SIM')
               return false;
            if (filtroValidado === 'nao' && detalhe.validado !== 'NAO')
               return false;
         }

         return true;
      });
   }, [
      grupo.detalhes,
      filtroOS,
      filtroData,
      filtroChamado,
      filtroCliente,
      filtroRecurso,
      filtroFaturado,
      filtroValidado,
   ]);

   return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
         {/* OVERLAY */}
         <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
         />

         {/* MODAL CONTAINER */}
         <div
            className={`animate-in slide-in-from-bottom-4 z-10 max-h-[100vh] w-full max-w-[95vw] overflow-hidden rounded-2xl shadow-xl shadow-black transition-all duration-500 ease-out ${
               isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            }`}
         >
            {/* HEADER DO MODAL */}
            <header className="flex flex-col gap-6 bg-white/50 p-6">
               <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center justify-center gap-6">
                     <div className="flex items-center justify-center rounded-lg bg-white/30 p-4 shadow-md shadow-black">
                        <HiDocumentReport className="text-black" size={28} />
                     </div>
                     <h2 className="text-2xl font-extrabold tracking-widest text-black uppercase select-none">
                        {grupo.nome}
                     </h2>
                  </div>

                  {/* Informações do grupo */}
                  <div className="flex h-full items-center justify-center gap-6">
                     <div className="flex w-[300px] flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-teal-600 bg-gradient-to-br from-teal-500 to-teal-600 px-6 py-2 shadow-md shadow-black">
                        <div className="text-sm font-extrabold tracking-widest text-white uppercase italic select-none">
                           Total de Horas
                        </div>
                        <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                           {formatarHorasTotaisHorasDecimais(grupo.totalHoras)}h
                        </div>
                     </div>

                     <div className="flex w-[300px] flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-purple-600 bg-gradient-to-br from-purple-500 to-purple-600 px-6 py-2 shadow-md shadow-black">
                        <div className="text-sm font-extrabold tracking-widest text-white italic select-none">
                           TOTAL DE OS's
                        </div>
                        <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                           {formatarCodNumber(grupo.quantidadeOS)}
                        </div>
                     </div>

                     <div className="flex w-[300px] flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-blue-600 bg-gradient-to-br from-blue-500 to-blue-600 px-6 py-2 shadow-md shadow-black">
                        <div className="text-sm font-extrabold tracking-widest text-white italic select-none">
                           TOTAL DE OS's FATURADAS
                        </div>
                        <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                           {formatarCodNumber(grupo.osFaturadas)}
                        </div>
                     </div>

                     <div className="flex w-[300px] flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-green-600 bg-gradient-to-br from-green-500 to-green-600 px-6 py-2 shadow-md shadow-black">
                        <div className="text-sm font-extrabold tracking-widest text-white italic select-none">
                           TOTAL DE OS's VALIDADAS
                        </div>
                        <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                           {formatarCodNumber(grupo.osValidadas)}
                        </div>
                     </div>

                     {/* Botões de Exportação */}
                     <div className="flex items-center gap-4">
                        <ExcelButtonRelatorioOS
                           grupo={grupo}
                           tipoAgrupamento={agruparPor}
                           filtros={filtrosAplicados}
                        />
                        <PDFButtonRelatorioOS
                           grupo={grupo}
                           tipoAgrupamento={agruparPor}
                           filtros={filtrosAplicados}
                        />
                     </div>

                     <button
                        onClick={handleClose}
                        aria-label="Fechar relatório de OS"
                        className={`group cursor-pointer rounded-full bg-red-500/50 p-3 text-white transition-all hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95 ${
                           isClosing ? 'animate-spin' : ''
                        }`}
                     >
                        <IoClose size={24} />
                     </button>
                  </div>
               </div>
            </header>

            {/* SEÇÃO DE FILTROS DO MODAL */}
            <div className="flex flex-col gap-4 bg-white/50 p-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     {filtrosAtivos > 0 && (
                        <span className="rounded-full bg-pink-600 px-3 py-1 text-sm font-bold text-white">
                           {filtrosAtivos}
                        </span>
                     )}
                  </div>
                  {filtrosAtivos > 0 && (
                     <button
                        onClick={limparFiltros}
                        className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-extrabold tracking-widest text-white transition-all hover:bg-red-800 active:scale-95"
                     >
                        Limpar Filtros
                     </button>
                  )}
               </div>

               <div className="grid grid-cols-7 gap-4">
                  <div className="flex flex-col gap-1">
                     <label className="text-sm font-semibold tracking-widest text-black select-none">
                        OS:
                     </label>
                     <FiltroModalDetalhes
                        value={filtroOS}
                        onChange={setFiltroOS}
                        placeholder="Filtrar por OS"
                     />
                  </div>

                  <div className="flex flex-col gap-1">
                     <label className="text-sm font-semibold tracking-widest text-black select-none">
                        Data:
                     </label>
                     <FiltroModalDetalhes
                        value={filtroData}
                        onChange={setFiltroData}
                        placeholder="Filtrar por Data"
                     />
                  </div>

                  <div className="flex flex-col gap-1">
                     <label className="text-sm font-semibold tracking-widest text-black select-none">
                        Chamado:
                     </label>
                     <FiltroModalDetalhes
                        value={filtroChamado}
                        onChange={setFiltroChamado}
                        placeholder="Filtrar por Chamado"
                     />
                  </div>

                  {agruparPor !== 'cliente' && (
                     <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold tracking-widest text-black select-none">
                           Cliente:
                        </label>
                        <FiltroModalDetalhes
                           value={filtroCliente}
                           onChange={setFiltroCliente}
                           placeholder="Filtrar por Cliente"
                        />
                     </div>
                  )}

                  {agruparPor !== 'recurso' && (
                     <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold tracking-widest text-black select-none">
                           Recurso:
                        </label>
                        <FiltroModalDetalhes
                           value={filtroRecurso}
                           onChange={setFiltroRecurso}
                           placeholder="Filtrar por Recurso"
                        />
                     </div>
                  )}

                  <div className="flex flex-col gap-1">
                     <label className="text-sm font-semibold tracking-widest text-black select-none">
                        Faturado:
                     </label>
                     <SelectSimNaoTabelaOS
                        value={filtroFaturado}
                        onChange={setFiltroFaturado}
                     />
                  </div>

                  <div className="flex flex-col gap-1">
                     <label className="text-sm font-semibold tracking-widest text-black select-none">
                        Validado:
                     </label>
                     <SelectSimNaoTabelaOS
                        value={filtroValidado}
                        onChange={setFiltroValidado}
                     />
                  </div>
               </div>
            </div>

            <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
               {detalhesFiltrados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-4 bg-slate-900 py-32 text-center">
                     <FaFilterCircleXmark className="text-red-600" size={80} />
                     <h3 className="text-2xl font-extrabold tracking-wider text-white italic select-none">
                        Nenhum registro encontrado para os filtros aplicados
                     </h3>
                  </div>
               ) : (
                  <table className="w-full">
                     <thead className="sticky top-0 z-10 bg-teal-800">
                        <tr className="bg-teal-800 py-6 font-extrabold tracking-wider text-white select-none">
                           <th className="p-3 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                              OS
                           </th>
                           <th className="p-3 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                              Data
                           </th>
                           <th className="p-3 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                              Chamado
                           </th>
                           <th className="p-3 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                              Hora Início
                           </th>
                           <th className="p-3 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                              Hora Fim
                           </th>
                           <th className="p-3 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                              Horas
                           </th>
                           {agruparPor !== 'cliente' && (
                              <th className="p-3 text-left text-base font-bold tracking-widest text-white uppercase italic select-none">
                                 Cliente
                              </th>
                           )}
                           {agruparPor !== 'recurso' && (
                              <th className="p-3 text-left text-base font-bold tracking-widest text-white uppercase italic select-none">
                                 Recurso
                              </th>
                           )}
                           <th className="p-3 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                              Faturado
                           </th>
                           <th className="p-3 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                              Validado
                           </th>
                        </tr>
                     </thead>
                     <tbody>
                        {detalhesFiltrados.map((detalhe, idx) => (
                           <tr
                              key={idx}
                              className="border-b border-white/10 transition-all hover:bg-white/10"
                           >
                              <td className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none">
                                 {formatarCodNumber(detalhe.codOs)}
                              </td>
                              <td className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none">
                                 {formatarDataParaBR(detalhe.data)}
                              </td>
                              <td className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none">
                                 {formatarCodString(detalhe.chamado)}
                              </td>
                              <td className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none">
                                 {formatarHora(detalhe.horaInicio)}
                              </td>
                              <td className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none">
                                 {formatarHora(detalhe.horaFim)}
                              </td>
                              <td className="p-3 text-center text-sm font-extrabold tracking-widest text-amber-500 select-none">
                                 {formatarHorasTotaisHorasDecimais(
                                    detalhe.horas
                                 )}
                              </td>
                              {agruparPor !== 'cliente' && (
                                 <td className="p-3 text-sm font-semibold tracking-widest text-white select-none">
                                    {detalhe.cliente || '----------'}
                                 </td>
                              )}
                              {agruparPor !== 'recurso' && (
                                 <td className="p-3 text-sm font-semibold tracking-widest text-white select-none">
                                    {corrigirTextoCorrompido(
                                       detalhe.recurso ?? ''
                                    ) || '----------'}
                                 </td>
                              )}
                              <td className="p-3 text-center">
                                 <span
                                    className={`inline-block rounded px-3 py-1.5 text-sm font-extrabold tracking-widest select-none ${
                                       detalhe.faturado === 'SIM'
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-red-600 text-white'
                                    }`}
                                 >
                                    {detalhe.faturado}
                                 </span>
                              </td>
                              <td className="p-3 text-center">
                                 <span
                                    className={`inline-block rounded px-3 py-1.5 text-sm font-extrabold tracking-widest select-none ${
                                       detalhe.validado === 'SIM'
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-red-600 text-white'
                                    }`}
                                 >
                                    {detalhe.validado}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               )}
            </div>
         </div>
      </div>
   );
};

// ================================================================================
// COMPONENTES AUXILIARES
// ================================================================================
const EmptyState = () => (
   <section className="bg-black py-72 text-center">
      <FaExclamationTriangle
         className="mx-auto mb-6 text-yellow-500"
         size={80}
      />
      <h3 className="text-2xl font-bold tracking-widest text-white italic select-none">
         Nenhuma OS foi encontrada no momento
      </h3>
   </section>
);

const NoResultsState = ({
   totalActiveFilters,
   clearFilters,
}: {
   totalActiveFilters: number;
   clearFilters: () => void;
}) => (
   <div className="flex flex-col items-center justify-center gap-4 bg-slate-900 py-72 text-center">
      <FaFilterCircleXmark className="mx-auto text-red-600" size={100} />
      <h3 className="text-3xl font-extrabold tracking-wider text-white italic select-none">
         Nenhum registro encontrado para os filtros aplicados
      </h3>
      <p className="text-base font-semibold tracking-wider text-white italic select-none">
         Tente ajustar os filtros ou limpe-os para visualizar registros
      </p>
      {totalActiveFilters > 0 && (
         <button
            onClick={clearFilters}
            className="w-[200px] cursor-pointer rounded-md border-none bg-red-500 px-6 py-2 text-lg font-extrabold tracking-widest text-white shadow-md shadow-black transition-all hover:bg-red-800 active:scale-95"
         >
            Limpar Filtros
         </button>
      )}
   </div>
);

// ================================================================================
// FUNÇÕES UTILITÁRIAS
// ================================================================================
function parseDate(dateStr: string): Date {
   const [year, month, day] = dateStr.split('-').map(Number);
   return new Date(year, month - 1, day);
}

function formatDate(date: Date): string {
   const y = date.getFullYear();
   const m = String(date.getMonth() + 1).padStart(2, '0');
   const d = String(date.getDate()).padStart(2, '0');
   return `${y}-${m}-${d}`;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export function RelatorioOS({ isOpen = true, onClose }: Props) {
   const { user } = useAuth();
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   // Estados - Filtros
   const [agruparPor, setAgruparPor] = useState<string>('cliente');
   const [mesAno, setMesAno] = useState<string>('');
   const [dataInicio, setDataInicio] = useState<string>('');
   const [dataFim, setDataFim] = useState<string>('');
   const [faturadoOS, setFaturadoOS] = useState<string>('');
   const [validOS, setValidOS] = useState<string>('');

   // Estados - UI
   const [selectedGrupo, setSelectedGrupo] = useState<GrupoRelatorio | null>(
      null
   );
   const [isClosing, setIsClosing] = useState(false);

   // Computed Values - Filtros
   const totalActiveFilters = useMemo(() => {
      const filters = [
         mesAno,
         dataInicio,
         dataFim,
         faturadoOS && faturadoOS !== 'todos' ? faturadoOS : '',
         validOS && validOS !== 'todos' ? validOS : '',
      ];
      return filters.filter(f => f?.trim()).length;
   }, [mesAno, dataInicio, dataFim, faturadoOS, validOS]);

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

      return filtros;
   }, [dataInicio, dataFim, mesAno, faturadoOS, validOS]);

   // Query Params e API
   const enabled = useMemo(() => {
      return !!(token && user);
   }, [token, user]);

   const queryParams = useMemo(() => {
      if (!user) return new URLSearchParams();

      const params = new URLSearchParams({
         agruparPor: agruparPor,
      });

      if (mesAno) {
         const [ano, mes] = mesAno.split('-');
         params.append('ano', ano);
         params.append('mes', mes);
      }

      if (dataInicio) params.append('dataInicio', dataInicio);
      if (dataFim) params.append('dataFim', dataFim);

      if (faturadoOS) params.append('faturado', faturadoOS);
      if (validOS) params.append('validado', validOS);

      return params;
   }, [user, agruparPor, mesAno, dataInicio, dataFim, faturadoOS, validOS]);

   async function fetchRelatorio(
      params: URLSearchParams,
      token: string
   ): Promise<RelatorioResponse> {
      const res = await fetch(`/api/os/relatorio?${params}`, {
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
      staleTime: CACHE_TIME,
      retry: 2,
   });

   const totalizadores = relatorioData?.relatorio.totalizadores;
   const grupos = useMemo(
      () => relatorioData?.relatorio.grupos || [],
      [relatorioData]
   );

   // Handlers - Filtros
   const clearFilters = useCallback(() => {
      setMesAno('');
      setDataInicio('');
      setDataFim('');
      setFaturadoOS('');
      setValidOS('');
   }, []);

   // Handlers - UI
   const handleCloseRelatorio = useCallback(() => {
      setIsClosing(true);
      setTimeout(() => {
         setIsClosing(false);
         onClose();
      }, ANIMATION_DURATION);
   }, [onClose]);

   // Exemplo de datas disponíveis (próximos 30 dias)
   const datasDisponiveis = Array.from({ length: 30 }, (_, i) => {
      const data = new Date();
      data.setDate(data.getDate() + i);
      return data;
   });

   // Validações e Estados de Carregamento
   if (!isOpen) return null;

   if (!user || !token) {
      return <IsError error={new Error('Usuário não autenticado.')} />;
   }

   if (isError) {
      return <IsError error={error as Error} />;
   }

   if (isLoading) {
      return (
         <IsLoading
            isLoading={true}
            title="Aguarde... Buscando OS's no sistema"
         />
      );
   }

   // Renderização
   return (
      <>
         <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* OVERLAY */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* CONTAINER */}
            <div
               className={`animate-in slide-in-from-bottom-4 z-10 max-h-[100vh] w-full max-w-[95vw] overflow-hidden rounded-2xl shadow-xl shadow-black transition-all duration-500 ease-out ${
                  isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
               }`}
            >
               {/* HEADER */}
               <header className="flex flex-col gap-6 bg-white/50 p-6">
                  {/* TÍTULO E BOTÃO FECHAR */}
                  <div className="flex items-center justify-between gap-8">
                     <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center justify-center rounded-lg bg-white/30 p-4 shadow-md shadow-black">
                           <HiDocumentReport className="text-black" size={28} />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-widest text-black uppercase select-none">
                           Relatório de OS
                        </h1>
                     </div>

                     <button
                        onClick={handleCloseRelatorio}
                        aria-label="Fechar relatório de OS"
                        className={`group cursor-pointer rounded-full bg-red-500/50 p-3 text-white transition-all hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95 ${
                           isClosing ? 'animate-spin' : ''
                        }`}
                     >
                        <IoClose size={24} />
                     </button>
                  </div>

                  {/* FILTROS & CARDS */}
                  <div className="flex items-center justify-between gap-6">
                     {/* SEÇÃO DE FILTROS */}
                     <div className="flex w-[1600px] flex-col gap-4 p-6">
                        <div className="flex items-center gap-4">
                           <MdFilterList className="text-black" size={28} />
                           <h2 className="text-xl font-bold tracking-widest text-black uppercase select-none">
                              Filtros
                           </h2>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                           <div className="flex flex-col gap-1">
                              <label className="text-base font-semibold tracking-widest text-black italic select-none">
                                 Agrupar por:
                              </label>
                              <Dropdown
                                 value={agruparPor}
                                 options={AGRUPAR_OPTIONS}
                                 optionLabel="name"
                                 optionValue="code"
                                 onChange={e => setAgruparPor(e.value)}
                                 className="shadow-md shadow-black"
                                 appendTo="self"
                              />
                           </div>

                           <div className="flex flex-col gap-1">
                              <label className="text-base font-semibold tracking-widest text-black italic select-none">
                                 Mês/Ano:
                              </label>
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

                           <div className="flex flex-col gap-1">
                              <label className="text-base font-semibold tracking-widest text-black italic select-none">
                                 Data Início:
                              </label>
                              <Calendar
                                 value={
                                    dataInicio ? parseDate(dataInicio) : null
                                 }
                                 onChange={e =>
                                    setDataInicio(
                                       e.value ? formatDate(e.value) : ''
                                    )
                                 }
                                 showIcon
                                 dateFormat="dd/mm/yy"
                                 placeholder="Data inicial"
                                 className="w-full rounded-md shadow-md shadow-black"
                                 appendTo="self"
                              />
                           </div>

                           <div className="flex flex-col gap-1">
                              <label className="text-base font-semibold tracking-widest text-black italic select-none">
                                 Data Fim:
                              </label>
                              <Calendar
                                 value={dataFim ? parseDate(dataFim) : null}
                                 onChange={e =>
                                    setDataFim(
                                       e.value ? formatDate(e.value) : ''
                                    )
                                 }
                                 showIcon
                                 dateFormat="dd/mm/yy"
                                 placeholder="Data final"
                                 className="w-full rounded-md shadow-md shadow-black"
                                 appendTo="self"
                              />
                           </div>

                           <div className="flex flex-col gap-1">
                              <label className="text-base font-semibold tracking-widest text-black italic select-none">
                                 Faturado:
                              </label>
                              <Dropdown
                                 value={faturadoOS}
                                 options={OPTIONS_SIM_NAO}
                                 optionLabel="name"
                                 optionValue="code"
                                 onChange={e => setFaturadoOS(e.value)}
                                 placeholder="Selecione uma opção"
                                 className="w-full shadow-md shadow-black"
                                 appendTo="self"
                              />
                           </div>

                           <div className="flex flex-col gap-1">
                              <label className="text-base font-semibold tracking-widest text-black italic select-none">
                                 Validado:
                              </label>
                              <Dropdown
                                 value={validOS}
                                 options={OPTIONS_SIM_NAO}
                                 optionLabel="name"
                                 optionValue="code"
                                 onChange={e => setValidOS(e.value)}
                                 placeholder="Selecione uma opção"
                                 className="w-full shadow-md shadow-black"
                                 appendTo="self"
                              />
                           </div>

                           <div className="col-span-2 flex items-end gap-4">
                              <Button
                                 onClick={() => refetch()}
                                 className="!flex !flex-1 !items-center !justify-center !gap-4 !text-base !font-extrabold !tracking-widest !text-black !italic shadow-md shadow-black transition-all active:scale-95"
                                 severity="success"
                              >
                                 <FiRefreshCcw size={24} />
                                 ATUALIZAR
                              </Button>

                              <Button
                                 onClick={clearFilters}
                                 className="!flex !flex-1 !items-center !justify-center !gap-4 !text-base !font-extrabold !tracking-widest !text-black !italic shadow-md shadow-black transition-all active:scale-95"
                                 severity="info"
                              >
                                 <BsEraserFill size={24} />
                                 LIMPAR FILTROS
                              </Button>
                           </div>
                        </div>
                     </div>

                     {/* CARDS DE TOTALIZADORES */}
                     {totalizadores && (
                        <div className="grid flex-1 grid-cols-2 gap-4">
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

                           <div className="flex flex-col gap-1 rounded-tl-4xl rounded-br-4xl border-[1px] border-purple-600 bg-gradient-to-br from-purple-500 to-purple-600 p-6 shadow-md shadow-black">
                              <div className="text-sm font-extrabold tracking-widest text-white italic select-none">
                                 TOTAL DE OS's
                              </div>
                              <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                                 {formatarCodNumber(totalizadores.totalGeralOS)}
                              </div>
                           </div>

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

               {/* CONTEÚDO PRINCIPAL */}
               <main className="h-full w-full overflow-hidden bg-black">
                  <div
                     className="h-full overflow-y-auto"
                     style={{ maxHeight: MODAL_MAX_HEIGHT }}
                  >
                     {grupos.length === 0 ? (
                        totalActiveFilters > 0 ? (
                           <NoResultsState
                              totalActiveFilters={totalActiveFilters}
                              clearFilters={clearFilters}
                           />
                        ) : (
                           <EmptyState />
                        )
                     ) : (
                        <div className="flex flex-col gap-4 p-6">
                           {grupos.map(grupo => (
                              <div
                                 key={grupo.chave}
                                 className="overflow-hidden rounded-lg bg-white/10 shadow-md shadow-black"
                              >
                                 {/* CABEÇALHO DO GRUPO */}
                                 <div className="group flex cursor-pointer items-center justify-between bg-teal-700 px-6 py-1.5 transition-all hover:bg-teal-500">
                                    <div className="flex flex-1 items-center gap-4">
                                       <div className="flex flex-col gap-1">
                                          <h3 className="text-xl font-extrabold tracking-widest text-white uppercase select-none group-hover:text-black">
                                             {grupo.nome}
                                          </h3>
                                          <p className="pl-4 text-base font-semibold tracking-widest text-white italic select-none group-hover:text-black">
                                             {formatarCodNumber(
                                                grupo.quantidadeOS
                                             )}{' '}
                                             - OS's
                                          </p>
                                       </div>
                                    </div>

                                    {/* BOTÃO VER DETALHES */}
                                    <button
                                       onClick={() => setSelectedGrupo(grupo)}
                                       className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-white transition-all hover:scale-105 hover:bg-white/30 active:scale-95"
                                    >
                                       <FaEye size={20} />
                                       <span className="text-sm font-bold tracking-widest uppercase">
                                          Ver Detalhes
                                       </span>
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </main>
            </div>
         </div>

         {/* MODAL DE DETALHES */}
         {selectedGrupo && (
            <ModalDetalhes
               grupo={selectedGrupo}
               agruparPor={agruparPor}
               filtrosAplicados={filtrosAplicados}
               onClose={() => setSelectedGrupo(null)}
            />
         )}
      </>
   );
}
