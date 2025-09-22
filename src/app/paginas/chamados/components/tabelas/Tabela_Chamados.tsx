'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import {
   flexRender,
   getCoreRowModel,
   useReactTable,
   getFilteredRowModel,
   getPaginationRowModel,
   getSortedRowModel,
   ColumnFiltersState,
   SortingState,
} from '@tanstack/react-table';
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '../../../../../components/ui/tooltip';
// ================================================================================
import { useAuth } from '../../../../../hooks/useAuth';
import { useFiltersTabelaChamados } from '../../../../../contexts/Filters_Context';
import { colunasTabela } from '../colunas/Colunas_Tabela_Chamados';
import { TabelaChamadosProps } from '../../../../../types/types';
import { normalizeDate } from '../../../../../utils/formatters';
import ModalApontamento from '../modais/Modal_Apontamento';
import TabelaTarefas from './Tabela_Tarefas';
import TabelaOS from './Tabela_OS';
import ModalVisualizarChamado from '../modais/Modal_Visualizar_Chamado';
import ModalAtribuicaoInteligente from '../modais/Modal_Atribuir_Chamado';
import IsLoading from '../Loading';
import IsError from '../Error';
// ================================================================================
import { FaExclamationTriangle, FaSearch } from 'react-icons/fa';
import { IoArrowUp, IoArrowDown, IoCall } from 'react-icons/io5';
import { BsEraserFill } from 'react-icons/bs';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { RiArrowUpDownLine } from 'react-icons/ri';
import { FaFilterCircleXmark } from 'react-icons/fa6';
import { LuFilter, LuFilterX } from 'react-icons/lu';

// ================================================================================
// INTERFACES E TIPOS
// ================================================================================
interface InputGlobalFilter {
   value: string;
   onChange: (value: string) => void;
   placeholder?: string;
   onClear: () => void;
}
// ==========

interface InputFilterTableHeaderProps {
   value: string;
   onChange: (value: string) => void;
   placeholder?: string;
   type?: string;
   onClear?: () => void;
}
// =========

// ================================================================================
// COMPONENTES DE FILTRO
// ================================================================================
const InputGlobalFilter = ({
   value,
   onChange,
   placeholder = 'Buscar em todas as colunas...',
}: InputGlobalFilter) => {
   const [localValue, setLocalValue] = useState(value);
   const inputRef = useRef<HTMLInputElement>(null);
   const [isFocused, setIsFocused] = useState(false);

   useEffect(() => {
      setLocalValue(value);
   }, [value]);

   const debouncedOnChange = useMemo(
      () =>
         debounce((newValue: string) => {
            onChange(newValue.trim());
         }, 300),
      [onChange]
   );

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setLocalValue(inputValue);
      debouncedOnChange(inputValue);
   };

   return (
      <div className="group relative transition-all hover:-translate-y-1 hover:scale-102">
         <FaSearch
            className="absolute top-1/2 left-4 -translate-y-1/2 text-black"
            size={20}
         />
         <input
            type="text"
            value={localValue}
            onChange={handleChange}
            placeholder={isFocused ? '' : placeholder}
            className="w-full rounded-md border-none bg-white/30 py-2 pl-14 text-base font-semibold tracking-wider text-black placeholder-black shadow-sm shadow-black select-none placeholder:text-base placeholder:font-semibold focus:ring-2 focus:ring-black focus:outline-none"
            ref={inputRef}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
         />
      </div>
   );
};
// ====================

const FilterInputTableHeaderDebounce = ({
   value,
   onChange,
   placeholder,
   type = 'text',
}: InputFilterTableHeaderProps) => {
   const [localValue, setLocalValue] = useState(value);
   const [isFocused, setIsFocused] = useState(false);

   useEffect(() => {
      setLocalValue(value);
   }, [value]);

   const debouncedOnChange = useMemo(
      () =>
         debounce((newValue: string) => {
            onChange(newValue.trim());
         }, 200),
      [onChange]
   );

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setLocalValue(inputValue);
      debouncedOnChange(inputValue);
   };

   return (
      <input
         type={type}
         value={localValue}
         onChange={handleChange}
         placeholder={isFocused ? '' : placeholder}
         className="w-full rounded-md bg-teal-950 px-4 py-2 text-base text-white placeholder-slate-400 shadow-sm shadow-white transition-all select-none hover:-translate-y-1 hover:scale-105 focus:ring-2 focus:ring-amber-500 focus:outline-none"
         onFocus={() => setIsFocused(true)}
         onBlur={() => setIsFocused(false)}
      />
   );
};
// ====================

const IndicatorFilter = ({
   columnFilters,
   globalFilter,
   totalFilters,
}: {
   columnFilters: ColumnFiltersState;
   globalFilter: string;
   totalFilters: number;
}) => {
   if (totalFilters === 0) return null;

   return (
      <div className="flex items-center gap-4">
         <div className="rounded-md border border-blue-800 bg-blue-600 px-6 py-2 text-base font-semibold tracking-wider text-white italic select-none">
            {totalFilters} filtro{totalFilters > 1 ? 's' : ''} ativo
            {totalFilters > 1 ? 's' : ''}
         </div>

         {globalFilter && (
            <div className="rounded-md border border-green-800 bg-green-600 px-6 py-2 text-base font-semibold tracking-wider text-white italic select-none">
               Busca global: "{globalFilter}"
            </div>
         )}

         {columnFilters.map(filter => (
            <div
               key={filter.id}
               className="rounded-md border border-purple-800 bg-purple-600 px-6 py-2 text-base font-semibold tracking-wider text-white italic select-none"
            >
               {getColumnDisplayName(filter.id)}: "{String(filter.value)}"
            </div>
         ))}
      </div>
   );
};
// ==================

const OrderTableHeader = ({
   column,
   children,
}: {
   column: any;
   children: React.ReactNode;
}) => {
   const sorted = column.getIsSorted();

   return (
      <Tooltip>
         <TooltipTrigger asChild>
            <div
               className="flex cursor-pointer items-center justify-center gap-4 rounded-md py-2 transition-all hover:bg-teal-900 active:scale-95"
               onClick={column.getToggleSortingHandler()}
            >
               {children}
               <div className="flex flex-col">
                  {sorted === 'asc' && <IoArrowUp size={20} />}
                  {sorted === 'desc' && <IoArrowDown size={20} />}
                  {!sorted && (
                     <RiArrowUpDownLine size={20} className="text-white" />
                  )}
               </div>
            </div>
         </TooltipTrigger>
         <TooltipContent
            side="top"
            align="center"
            sideOffset={8}
            className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black shadow-lg shadow-black select-none"
         >
            Clique para ordenar{' '}
            {sorted === 'asc'
               ? '(ascendente)'
               : sorted === 'desc'
                 ? '(descendente)'
                 : ''}
         </TooltipContent>
      </Tooltip>
   );
};
// ====================

// ================================================================================
// UTILITÁRIOS
// ================================================================================

const getColumnDisplayName = (columnId: string): string => {
   const displayNames: Record<string, string> = {
      COD_CHAMADO: 'Código',
      DATA_CHAMADO: 'Data',
      ASSUNTO_CHAMADO: 'Assunto',
      STATUS_CHAMADO: 'Status',
      NOME_RECURSO: 'Recurso',
      EMAIL_CHAMADO: 'Email',
   };
   return displayNames[columnId] || columnId;
};
// ====================

function getColumnWidth(columnId: string, userType?: string): string {
   if (userType === 'ADM') {
      const widthMapAdmin: Record<string, string> = {
         COD_CHAMADO: '10%',
         DATA_CHAMADO: '10%',
         ASSUNTO_CHAMADO: '30%',
         STATUS_CHAMADO: '18%',
         NOME_RECURSO: '13%',
         EMAIL_CHAMADO: '12%',
         actions: '7%',
      };
      return widthMapAdmin[columnId] || 'auto';
   }

   const widthMap: Record<string, string> = {
      COD_CHAMADO: '10%',
      DATA_CHAMADO: '10%',
      ASSUNTO_CHAMADO: '33%',
      STATUS_CHAMADO: '20%',
      EMAIL_CHAMADO: '20%',
      actions: '7%',
   };

   return widthMap[columnId] || 'auto';
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================

export default function TabelaChamados() {
   // ================================================================================
   // HOOKS E CONTEXTOS
   // ================================================================================
   const { filters } = useFiltersTabelaChamados();
   const { user } = useAuth();
   const queryClient = useQueryClient();
   const { ano, mes } = filters;
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   // ================================================================================
   // ESTADOS - MODAIS E COMPONENTES
   // ================================================================================
   const [modalChamadosOpen, setModalChamadosOpen] = useState(false);
   const [selectedChamado, setSelectedChamado] =
      useState<TabelaChamadosProps | null>(null);
   const [tabelaOSOpen, setTabelaOSOpen] = useState(false);
   const [selectedCodChamado, setSelectedCodChamado] = useState<number | null>(
      null
   );
   const [tabelaTarefasOpen, setTabelaTarefasOpen] = useState(false);
   const [dashboardOpen, setDashboardOpen] = useState(false);
   const [modalAtribuicaoOpen, setModalAtribuicaoOpen] = useState(false);
   const [chamadoParaAtribuir, setChamadoParaAtribuir] =
      useState<TabelaChamadosProps | null>(null);

   const [modalApontamentosOpen, setModalApontamentosOpen] = useState(false);
   const [apontamentoData, setApontamentoData] = useState<{
      codChamado: number;
      status: string;
      tarefa?: any;
      nomeCliente?: string;
   } | null>(null);

   // ================================================================================
   // ESTADOS - FILTROS E ORDENAÇÃO
   // ================================================================================
   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
   const [globalFilter, setGlobalFilter] = useState('');
   const [sorting, setSorting] = useState<SortingState>([
      { id: 'COD_CHAMADO', desc: true },
   ]);
   const [filterValues, setFilterValues] = useState({
      COD_CHAMADO: '',
      DATA_CHAMADO: '',
      ASSUNTO_CHAMADO: '',
      STATUS_CHAMADO: '',
      EMAIL_CHAMADO: '',
      NOME_RECURSO: '',
      global: '',
   });
   const [showFilters, setShowFilters] = useState(false);

   // ================================================================================
   // FUNÇÕES DE FILTRO
   // ================================================================================
   const globalFilterFn = useCallback(
      (row: any, columnId: string, filterValue: string) => {
         if (!filterValue) return true;

         const searchValue = filterValue.toLowerCase().trim();
         const searchableColumns = [
            'COD_CHAMADO',
            'DATA_CHAMADO',
            'ASSUNTO_CHAMADO',
            'STATUS_CHAMADO',
            'NOME_RECURSO',
            'EMAIL_CHAMADO',
         ];

         return searchableColumns.some(colId => {
            const cellValue = row.getValue(colId);

            // Para campos de data, usar normalização
            if (colId === 'DATA_CHAMADO') {
               const dateFormats = normalizeDate(cellValue);
               return dateFormats.some(dateFormat =>
                  dateFormat.toLowerCase().includes(searchValue)
               );
            }

            // Para outros campos, busca normal
            const cellString = String(cellValue || '').toLowerCase();
            return cellString.includes(searchValue);
         });
      },
      []
   );
   // ===================

   const columnFilterFn = useCallback(
      (row: any, columnId: string, filterValue: string) => {
         if (!filterValue || filterValue === '') return true;

         const cellValue = row.getValue(columnId);
         const filterString = String(filterValue).toLowerCase().trim();

         // Tratamento especial para campos de data
         if (columnId === 'DATA_CHAMADO') {
            const dateFormats = normalizeDate(cellValue);
            return dateFormats.some(dateFormat =>
               dateFormat.toLowerCase().includes(filterString)
            );
         }

         // Para campos numéricos (como código do chamado)
         if (columnId === 'COD_CHAMADO') {
            const cellString = String(cellValue || '');
            return cellString.includes(filterString);
         }

         // Para outros campos de texto
         const cellString = String(cellValue || '').toLowerCase();
         return cellString.includes(filterString);
      },
      []
   );
   // ===================

   const totalActiveFilters = useMemo(() => {
      let count = columnFilters.length;
      if (globalFilter && globalFilter.trim()) count += 1;
      return count;
   }, [columnFilters.length, globalFilter]);

   const clearFilters = () => {
      setColumnFilters([]);
      setGlobalFilter('');
      setFilterValues({
         COD_CHAMADO: '',
         DATA_CHAMADO: '',
         ASSUNTO_CHAMADO: '',
         STATUS_CHAMADO: '',
         NOME_RECURSO: '',
         EMAIL_CHAMADO: '',
         global: '',
      });
      table.getAllColumns().forEach(column => {
         column.setFilterValue('');
      });
   };
   // ==================

   // Atualiza os valores locais quando os filtros mudam
   useEffect(() => {
      const newFilterValues = {
         COD_CHAMADO: '',
         DATA_CHAMADO: '',
         ASSUNTO_CHAMADO: '',
         STATUS_CHAMADO: '',
         EMAIL_CHAMADO: '',
         NOME_RECURSO: '',
         global: globalFilter || '',
      };

      columnFilters.forEach(filter => {
         if (filter.id in newFilterValues) {
            newFilterValues[filter.id as keyof typeof newFilterValues] = String(
               filter.value || ''
            );
         }
      });

      setFilterValues(prev => {
         const hasChanged = Object.keys(newFilterValues).some(
            key =>
               prev[key as keyof typeof prev] !==
               newFilterValues[key as keyof typeof newFilterValues]
         );
         return hasChanged ? newFilterValues : prev;
      });
   }, [columnFilters, globalFilter]);

   // ================================================================================
   // API E DADOS
   // ================================================================================
   const enabled = !!ano && !!mes && !!token && !!user;

   const queryParams = useMemo(() => {
      if (!user) return new URLSearchParams();
      const params = new URLSearchParams({
         ano: String(ano),
         mes: String(mes),
      });
      return params;
   }, [ano, mes, user]);
   // ====================

   async function fetchChamados(
      params: URLSearchParams,
      token: string
   ): Promise<TabelaChamadosProps[]> {
      const res = await fetch(`/api/chamados?${params}`, {
         headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
         },
      });

      if (!res.ok) {
         const errorData = await res.json();
         throw new Error(errorData.error || 'Erro ao buscar chamados');
      }

      const data = await res.json();
      return Array.isArray(data) ? data : data.chamados || [];
   }
   // ====================

   const updateAssunto = useCallback(
      async (codChamado: number, novoAssunto: string) => {
         try {
            const response = await fetch(
               `/api/atualizar-assunto-chamado/${codChamado}`,
               {
                  method: 'POST',
                  headers: {
                     Authorization: `Bearer ${token}`,
                     'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                     assuntoChamado: novoAssunto,
                     codChamado: codChamado.toString(),
                  }),
               }
            );

            if (!response.ok) {
               const errorData = await response.json();
               throw new Error(errorData.error || 'Erro ao atualizar assunto');
            }

            queryClient.setQueryData(
               ['chamadosAbertos', queryParams.toString(), token],
               (oldData: TabelaChamadosProps[] | undefined) => {
                  if (!oldData) return oldData;

                  return oldData.map(chamado =>
                     chamado.COD_CHAMADO === codChamado
                        ? { ...chamado, ASSUNTO_CHAMADO: novoAssunto }
                        : chamado
                  );
               }
            );

            return response.json();
         } catch (error) {
            console.error('Erro ao atualizar assunto:', error);
            throw error;
         }
      },
      [token, queryClient, queryParams]
   );
   // ====================

   // Query principal para buscar os chamados
   const { data, isLoading, isError, error } = useQuery({
      queryKey: ['chamadosAbertos', queryParams.toString(), token],
      queryFn: () => fetchChamados(queryParams, token!),
      enabled,
      staleTime: 1000 * 60 * 5,
      retry: 2,
   });

   // ================================================================================
   // HANDLERS E CALLBACKS
   // ================================================================================
   const handleCloseModalChamados = () => {
      setModalChamadosOpen(false);
      setSelectedChamado(null);
   };
   // ====================

   const handleCloseTabelaOS = () => {
      setTabelaOSOpen(false);
      setSelectedCodChamado(null);
   };
   // ====================

   const handleVisualizarChamado = useCallback(
      (codChamado: number) => {
         const chamado = data?.find(c => c.COD_CHAMADO === codChamado);
         if (chamado) {
            setSelectedChamado(chamado);
            setModalChamadosOpen(true);
         }
      },
      [data]
   );
   // ====================

   const handleVisualizarOS = useCallback((codChamado: number) => {
      setSelectedCodChamado(codChamado);
      setTabelaOSOpen(true);
   }, []);
   // ====================

   const handleAbrirAtribuicaoInteligente = useCallback(
      (chamado: TabelaChamadosProps) => {
         setChamadoParaAtribuir(chamado);
         setModalAtribuicaoOpen(true);
      },
      []
   );
   // ====================

   const handleAbrirDashboard = () => setDashboardOpen(true);
   // ====================

   const handleFecharDashboard = () => setDashboardOpen(false);
   // ====================

   const handleAtribuicaoSuccess = () => {
      queryClient.invalidateQueries({ queryKey: ['chamadosAbertos'] });
      setModalAtribuicaoOpen(false);
      setChamadoParaAtribuir(null);
   };

   const handleOpenApontamentos = useCallback(
      async (codChamado: number, newStatus: string) => {
         try {
            // Buscar dados do chamado para pegar informações do cliente
            const chamado = data?.find(c => c.COD_CHAMADO === codChamado);

            // Buscar a tarefa atribuída para este chamado
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/atribuir-tarefa/${codChamado}`, {
               headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
               },
            });

            if (response.ok) {
               const tarefas = await response.json();
               const tarefaSelecionada = tarefas[0]; // Pega a primeira tarefa ou a lógica que você usar

               setApontamentoData({
                  codChamado,
                  status: newStatus,
                  tarefa: tarefaSelecionada,
                  nomeCliente: chamado?.EMAIL_CHAMADO || 'Cliente', // ou outro campo que tenha o nome
               });
               setModalApontamentosOpen(true);
            }
         } catch (error) {
            console.error('Erro ao buscar dados para apontamento:', error);
         }
      },
      [data]
   );

   const handleCloseApontamentos = useCallback(() => {
      setModalApontamentosOpen(false);
      setApontamentoData(null);
   }, []);

   const handleApontamentoSuccess = useCallback(() => {
      // Invalidar queries para atualizar dados
      queryClient.invalidateQueries({ queryKey: ['chamadosAbertos'] });
      setModalApontamentosOpen(false);
      setApontamentoData(null);
   }, [queryClient]);

   const updateStatus = useCallback(
      async (
         codChamado: number,
         newStatus: string,
         codClassificacao?: number,
         codTarefa?: number
      ) => {
         try {
            const response = await fetch(
               `/api/atualizar-status-chamado/${codChamado}`,
               {
                  method: 'POST',
                  headers: {
                     Authorization: `Bearer ${token}`,
                     'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                     status: newStatus,
                     codClassificacao,
                     codTarefa,
                  }),
               }
            );

            if (!response.ok) {
               const errorData = await response.json();
               throw new Error(errorData.error || 'Erro ao atualizar status');
            }

            // Atualizar dados locais
            queryClient.setQueryData(
               ['chamadosAbertos', queryParams.toString(), token],
               (oldData: TabelaChamadosProps[] | undefined) => {
                  if (!oldData) return oldData;

                  return oldData.map(chamado =>
                     chamado.COD_CHAMADO === codChamado
                        ? { ...chamado, STATUS_CHAMADO: newStatus }
                        : chamado
                  );
               }
            );

            return response.json();
         } catch (error) {
            console.error('Erro ao atualizar status:', error);
            throw error;
         }
      },
      [token, queryClient, queryParams]
   );

   // ================================================================================
   // CONFIGURAÇÃO DA TABELA
   // ================================================================================
   const colunas = useMemo(
      () =>
         colunasTabela(
            {
               onVisualizarChamado: handleVisualizarChamado,
               onVisualizarOS: handleVisualizarOS,
               onVisualizarTarefas: () => setTabelaTarefasOpen(true),
               onAtribuicaoInteligente: handleAbrirAtribuicaoInteligente,
               onUpdateAssunto: updateAssunto,
               onUpdateStatus: updateStatus, // Você precisa criar esta função
               onOpenApontamentos: handleOpenApontamentos, // NOVA PROP
               userType: user?.tipo,
            },
            user?.tipo
         ),
      [
         handleVisualizarChamado,
         handleVisualizarOS,
         handleAbrirAtribuicaoInteligente,
         updateAssunto,
         handleOpenApontamentos, // ADICIONAR DEPENDÊNCIA
         updateStatus,
         user?.tipo,
      ]
   );

   const table = useReactTable({
      data: data ?? [],
      columns: colunas,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      onColumnFiltersChange: setColumnFilters,
      onGlobalFilterChange: setGlobalFilter,
      onSortingChange: setSorting,
      globalFilterFn,
      state: {
         columnFilters,
         globalFilter,
         sorting,
      },
      initialState: {
         pagination: {
            pageSize: 20,
         },
      },
      filterFns: {
         customColumnFilter: columnFilterFn,
      },
      defaultColumn: {
         filterFn: columnFilterFn,
      },
   });

   // ================================================================================
   // ESTADOS DE CARREGAMENTO E VALIDAÇÃO
   // ================================================================================
   if (!user || !token) {
      return (
         <div className="flex flex-col items-center justify-center gap-6 py-40">
            <FaExclamationTriangle
               className="animate-pulse text-red-600"
               size={120}
            />

            <div className="flex flex-col items-center justify-center gap-4">
               <h3 className="text-3xl font-extrabold tracking-wider text-red-600 select-none">
                  Acesso restrito!
               </h3>
               <p className="text-lg font-semibold tracking-wider text-red-500 italic select-none">
                  Sua sessão expirou. Você precisa estar logado para acessar o
                  sistema.
               </p>
               <p className="text-lg font-semibold tracking-wider text-red-500 italic select-none">
                  Por medida de segurança, você será redirecionado para a página
                  de login.
               </p>

               <div className="flex items-center justify-center gap-1">
                  <span className="text-base font-semibold tracking-wider text-red-600 italic select-none">
                     Aguarde
                  </span>

                  <div className="flex gap-1">
                     <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-red-600"></div>
                     <div
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-red-600"
                        style={{ animationDelay: '0.1s' }}
                     ></div>
                     <div
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-red-600"
                        style={{ animationDelay: '0.2s' }}
                     ></div>
                  </div>
               </div>
            </div>
         </div>
      );
   }
   // ====================

   if (isLoading)
      return <IsLoading title="Carregando os dados da tabela Chamado" />;
   // ====================

   if (isError) return <IsError error={error as Error} />;

   // ================================================================================
   // RENDERIZAÇÃO PRINCIPAL
   // ================================================================================
   return (
      <>
         <div className="overflow-hidden rounded-2xl bg-black shadow-xl shadow-black">
            {/* ===== HEADER ===== */}
            <header className="flex flex-col gap-4 bg-white/70 p-6">
               <section className="flex items-center justify-between gap-8">
                  <div className="flex items-center justify-center gap-6">
                     <div className="flex items-center justify-center rounded-md bg-white/30 p-4 shadow-sm shadow-black">
                        <IoCall className="text-black" size={28} />
                     </div>
                     {/* ========== */}

                     <h1 className="text-4xl font-extrabold tracking-widest text-black uppercase select-none">
                        Chamados
                     </h1>
                  </div>
                  {/* ==================== */}

                  <div className="flex items-center gap-6">
                     {/* Botão mostrar filtros */}
                     <button
                        onClick={() => setShowFilters(!showFilters)}
                        disabled={!data || data.length <= 1}
                        className={`flex cursor-pointer items-center gap-4 rounded-md px-6 py-2 text-lg font-extrabold tracking-wider italic transition-all select-none ${
                           showFilters
                              ? 'border-none bg-blue-600 text-white shadow-sm shadow-black hover:bg-blue-800'
                              : 'border-none bg-white/30 text-black shadow-sm shadow-black hover:bg-white/10'
                        } ${
                           !data || data.length <= 1
                              ? 'disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-gray-500'
                              : 'hover:-translate-y-1 hover:scale-102 active:scale-95'
                        }`}
                     >
                        {showFilters ? (
                           <LuFilterX size={24} />
                        ) : (
                           <LuFilter size={24} />
                        )}
                        {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                     </button>
                     {/* ========== */}

                     {/* Botão limpar filtros */}
                     {totalActiveFilters > 0 && (
                        <button
                           onClick={clearFilters}
                           className="flex cursor-pointer items-center gap-4 rounded-md border-none bg-red-600 px-6 py-2 text-lg font-extrabold tracking-wider text-white italic shadow-sm shadow-black transition-all select-none hover:-translate-y-1 hover:scale-102 hover:bg-red-800 active:scale-95"
                        >
                           <BsEraserFill className="text-white" size={24} />
                           Limpar Filtros
                        </button>
                     )}
                     {/* ========== */}
                  </div>
               </section>
               {/* ==================== */}

               {/* ===== FILTRO GLOBAL ===== */}
               {data && data.length > 0 && (
                  <div className="flex items-center justify-between gap-6">
                     {/* Input busca global */}
                     <div className="max-w-md flex-1 font-semibold tracking-wider select-none placeholder:tracking-wider placeholder:text-black placeholder:italic placeholder:select-none">
                        <InputGlobalFilter
                           value={globalFilter ?? ''}
                           onChange={value => setGlobalFilter(String(value))}
                           placeholder="Buscar em todas as colunas..."
                           onClear={function (): void {
                              throw new Error('Function not implemented.');
                           }}
                        />
                     </div>
                     {/* ========== */}

                     {/* Indicador filtros ativos */}
                     <IndicatorFilter
                        columnFilters={columnFilters}
                        globalFilter={globalFilter}
                        totalFilters={totalActiveFilters}
                     />
                  </div>
               )}
            </header>
            {/* ============================== */}
            {/* ===== CONTEÚDO DA TABELA ===== */}
            <main className="h-full w-full overflow-hidden bg-black">
               <div
                  className="h-full overflow-y-auto"
                  style={{ maxHeight: 'calc(100vh - 450px)' }}
               >
                  {/* ===== TABELA ===== */}
                  <table className="w-full table-fixed border-collapse">
                     {/* ===== CABEÇALHO DA TABELA ===== */}
                     <thead className="sticky top-0 z-20">
                        {table.getHeaderGroups().map(headerGroup => (
                           // linha do cabeçalho
                           <tr key={headerGroup.id}>
                              {headerGroup.headers.map(header => (
                                 // células do cabeçalho
                                 <th
                                    key={header.id}
                                    className="bg-teal-700 py-6 font-extrabold tracking-wider text-white uppercase select-none"
                                    style={{
                                       width: getColumnWidth(
                                          header.column.id,
                                          user?.tipo
                                       ),
                                    }}
                                 >
                                    {header.isPlaceholder ? null : header.column
                                         .id === 'COD_CHAMADO' ||
                                      header.column.id === 'DATA_CHAMADO' ||
                                      header.column.id === 'ASSUNTO_CHAMADO' ||
                                      header.column.id === 'STATUS_CHAMADO' ||
                                      header.column.id === 'NOME_RECURSO' ? (
                                       <OrderTableHeader column={header.column}>
                                          {flexRender(
                                             header.column.columnDef.header,
                                             header.getContext()
                                          )}
                                       </OrderTableHeader>
                                    ) : (
                                       flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                       )
                                    )}
                                 </th>
                              ))}
                           </tr>
                        ))}
                        {/* ========== */}

                        {/* ===== FILTROS DA TABELA ===== */}
                        {showFilters && (
                           <tr>
                              {table.getAllColumns().map(column => (
                                 <th
                                    key={column.id}
                                    className="bg-teal-700 px-3 pb-6"
                                    style={{
                                       width: getColumnWidth(
                                          column.id,
                                          user?.tipo
                                       ),
                                    }}
                                 >
                                    {column.id === 'COD_CHAMADO' && (
                                       <FilterInputTableHeaderDebounce
                                          value={
                                             (column.getFilterValue() as string) ??
                                             ''
                                          }
                                          onChange={value =>
                                             column.setFilterValue(value)
                                          }
                                          onClear={() =>
                                             column.setFilterValue('')
                                          }
                                          placeholder="Código..."
                                          type="text"
                                       />
                                    )}
                                    {/* ===== */}
                                    {column.id === 'DATA_CHAMADO' && (
                                       <FilterInputTableHeaderDebounce
                                          value={
                                             (column.getFilterValue() as string) ??
                                             ''
                                          }
                                          onChange={value =>
                                             column.setFilterValue(value)
                                          }
                                          onClear={() =>
                                             column.setFilterValue('')
                                          }
                                          placeholder="dd/mm/aaaa"
                                          type="text"
                                       />
                                    )}
                                    {/* ===== */}
                                    {column.id === 'ASSUNTO_CHAMADO' && (
                                       <FilterInputTableHeaderDebounce
                                          value={
                                             (column.getFilterValue() as string) ??
                                             ''
                                          }
                                          onChange={value =>
                                             column.setFilterValue(value)
                                          }
                                          onClear={() =>
                                             column.setFilterValue('')
                                          }
                                          placeholder="Assunto..."
                                       />
                                    )}
                                    {/* ===== */}
                                    {column.id === 'STATUS_CHAMADO' && (
                                       <FilterInputTableHeaderDebounce
                                          value={
                                             (column.getFilterValue() as string) ??
                                             ''
                                          }
                                          onChange={value =>
                                             column.setFilterValue(value)
                                          }
                                          onClear={() =>
                                             column.setFilterValue('')
                                          }
                                          placeholder="Status..."
                                       />
                                    )}
                                    {/* ===== */}
                                    {column.id === 'NOME_RECURSO' && (
                                       <FilterInputTableHeaderDebounce
                                          value={
                                             (column.getFilterValue() as string) ??
                                             ''
                                          }
                                          onChange={value =>
                                             column.setFilterValue(value)
                                          }
                                          onClear={() =>
                                             column.setFilterValue('')
                                          }
                                          placeholder="Recurso..."
                                       />
                                    )}
                                 </th>
                              ))}
                           </tr>
                        )}
                     </thead>
                     {/* ==================== */}

                     {/* ===== CORPO DA TABELA ===== */}
                     <tbody>
                        {table.getRowModel().rows.length > 0 &&
                           !isLoading &&
                           table.getRowModel().rows.map((row, rowIndex) => (
                              // linhas do corpo da tabela
                              <tr
                                 key={row.id}
                                 className={`group border-b border-gray-600 transition-all hover:bg-amber-200 ${
                                    rowIndex % 2 === 0
                                       ? 'bg-stone-600'
                                       : 'bg-stone-500'
                                 }`}
                              >
                                 {row.getVisibleCells().map(cell => (
                                    // células do corpo da tabela
                                    <td
                                       key={cell.id}
                                       className="p-2 text-sm font-semibold tracking-wider text-white select-none group-hover:text-black"
                                       style={{
                                          width: getColumnWidth(
                                             cell.column.id,
                                             user?.tipo
                                          ),
                                       }}
                                    >
                                       <div className="overflow-hidden">
                                          {flexRender(
                                             cell.column.columnDef.cell,
                                             cell.getContext()
                                          )}
                                       </div>
                                    </td>
                                 ))}
                              </tr>
                           ))}
                     </tbody>
                  </table>
               </div>
            </main>
            {/* ============================== */}
            {/* ===== PAGINAÇÃO DA TABELA ===== */}
            {Array.isArray(data) && data.length > 0 && (
               <div className="bg-white/70 px-12 py-4">
                  <div className="flex items-center justify-between">
                     {/* Informações da página */}
                     <section className="flex items-center gap-4">
                        <span className="text-lg font-extrabold tracking-widest text-black italic select-none">
                           {table.getFilteredRowModel().rows.length} registro
                           {table.getFilteredRowModel().rows.length !== 1
                              ? 's'
                              : ''}{' '}
                           encontrado
                           {table.getFilteredRowModel().rows.length !== 1
                              ? 's'
                              : ''}
                        </span>

                        {/* Total de registros (sem filtros) */}
                        {totalActiveFilters > 0 && (
                           <span className="text-lg font-extrabold tracking-widest text-black italic select-none">
                              de um total de {data.length}
                           </span>
                        )}
                     </section>

                     {/* Controles de paginação */}
                     <section className="flex items-center gap-3">
                        {/* Seletor de itens por página */}
                        <div className="flex items-center gap-2">
                           <span className="text-base font-semibold tracking-widest text-black italic select-none">
                              Itens por página:
                           </span>
                           <select
                              value={table.getState().pagination.pageSize}
                              onChange={e =>
                                 table.setPageSize(Number(e.target.value))
                              }
                              className="cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 text-base font-semibold tracking-widest text-black italic shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                           >
                              {[50, 100, 200, 300, 400, 500].map(pageSize => (
                                 <option
                                    key={pageSize}
                                    value={pageSize}
                                    className="bg-white text-base font-semibold tracking-widest text-black italic select-none"
                                 >
                                    {pageSize}
                                 </option>
                              ))}
                           </select>
                        </div>

                        {/* Botões de navegação */}
                        <div className="flex items-center gap-3">
                           <button
                              onClick={() => table.setPageIndex(0)}
                              disabled={!table.getCanPreviousPage()}
                              className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              <FiChevronsLeft
                                 className="text-black group-disabled:text-white"
                                 size={24}
                              />
                           </button>

                           <button
                              onClick={() => table.previousPage()}
                              disabled={!table.getCanPreviousPage()}
                              className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              <MdChevronLeft
                                 className="text-black group-disabled:text-white"
                                 size={24}
                              />
                           </button>

                           <div className="flex items-center justify-center gap-2">
                              <span className="text-base font-semibold tracking-widest text-black italic select-none">
                                 Página{' '}
                                 <select
                                    value={
                                       table.getState().pagination.pageIndex + 1
                                    }
                                    onChange={e => {
                                       const page = Number(e.target.value) - 1;
                                       table.setPageIndex(page);
                                    }}
                                    className="cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 text-base font-semibold tracking-widest text-black italic shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                 >
                                    {Array.from(
                                       {
                                          length: table.getPageCount(),
                                       },
                                       (_, i) => (
                                          <option
                                             key={i + 1}
                                             value={i + 1}
                                             className="bg-white text-base font-semibold tracking-widest text-black italic select-none"
                                          >
                                             {i + 1}
                                          </option>
                                       )
                                    )}
                                 </select>
                              </span>
                              <span className="text-base font-semibold tracking-widest text-black italic select-none">
                                 {' '}
                                 de {table.getPageCount()}
                              </span>
                           </div>

                           <button
                              onClick={() => table.nextPage()}
                              disabled={!table.getCanNextPage()}
                              className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              <MdChevronRight
                                 className="text-black group-disabled:text-white"
                                 size={24}
                              />
                           </button>

                           <button
                              onClick={() =>
                                 table.setPageIndex(table.getPageCount() - 1)
                              }
                              disabled={!table.getCanNextPage()}
                              className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              <FiChevronsRight
                                 className="text-black group-disabled:text-white"
                                 size={24}
                              />
                           </button>
                        </div>
                     </section>
                  </div>
               </div>
            )}
            {/* ==================== */}
            {/* ===== MENSAGEM QUANDO NÃO HÁ CHAMADOS ===== */}
            {data && data.length === 0 && !isLoading && (
               <div className="flex flex-col items-center justify-center gap-4 bg-slate-900 py-20 text-center">
                  <FaExclamationTriangle
                     className="mx-auto text-yellow-600"
                     size={80}
                  />

                  <h3 className="text-2xl font-bold tracking-wider text-white select-none">
                     {user?.tipo === 'ADM'
                        ? `Nenhum Chamado foi encontrado para o Período ${mes.toString().padStart(2, '0')}/${ano}.`
                        : `Nenhum Chamado (excluindo finalizados) foi encontrado para o Período ${mes.toString().padStart(2, '0')}/${ano}.`}
                  </h3>

                  {user?.tipo !== 'ADM' && (
                     <p className="text-base font-semibold tracking-wider text-white italic select-none">
                        Chamados com status "FINALIZADO" não são exibidos para
                        seu perfil.
                     </p>
                  )}
               </div>
            )}{' '}
            {/* ==================== */}
            {/* ===== MENSAGEM QUANDO OS FILTROS NÃO RETORNAM RESULTADOS ===== */}
            {data &&
               data.length > 0 &&
               table.getFilteredRowModel().rows.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-4 bg-slate-900 py-20 text-center">
                     <FaFilterCircleXmark
                        className="mx-auto text-red-600"
                        size={80}
                     />
                     {/* ===== */}
                     <h3 className="text-2xl font-bold tracking-wider text-white select-none">
                        Nenhum Registro encontrado para os Filtros aplicados.
                     </h3>
                     {/* ===== */}
                     <p className="text-base font-semibold tracking-wider text-white italic select-none">
                        Tente ajustar os Filtros ou limpe-os para visualizar
                        Registros.
                     </p>
                     {/* ========== */}

                     {/* Botão para limpar filtros */}
                     {totalActiveFilters > 0 && (
                        <button
                           onClick={clearFilters}
                           className="flex cursor-pointer items-center gap-4 rounded-md border-none bg-red-600 px-6 py-2 text-lg font-extrabold tracking-wider text-white italic shadow-sm shadow-black transition-all select-none hover:-translate-y-1 hover:scale-102 hover:bg-red-800 active:scale-95"
                        >
                           <BsEraserFill className="text-white" size={24} />
                           Limpar Filtros
                        </button>
                     )}
                  </div>
               )}
         </div>
         {/* ============================== */}

         {/* ===== MODAL CHAMADO ===== */}
         <ModalVisualizarChamado
            isOpen={modalChamadosOpen}
            onClose={handleCloseModalChamados}
            chamado={selectedChamado}
         />
         {/* ============================== */}

         {/* ===== TABELA OS ===== */}
         <TabelaOS
            isOpen={tabelaOSOpen}
            onClose={handleCloseTabelaOS}
            codChamado={selectedCodChamado}
            onSuccess={() => setTabelaOSOpen(false)}
         />
         {/* ============================== */}

         {/* ===== TABELA TAREFAS ===== */}
         <TabelaTarefas
            isOpen={tabelaTarefasOpen}
            onClose={() => setTabelaTarefasOpen(false)}
            codChamado={selectedCodChamado}
         />
         {/* ============================== */}

         {/* ===== DASHBOARD RECURSOS ===== */}
         {/* {dashboardOpen && user?.tipo === 'ADM' && (
            <div className="fixed inset-0 z-50 bg-black">
               <div className="relative h-full">
                  <div className="absolute inset-0 bg-black opacity-50" />
                  <Tooltip>
                     <TooltipTrigger asChild>
                        <button
                           onClick={handleFecharDashboard}
                           className="absolute top-6 right-35 z-10 cursor-pointer rounded-full bg-red-600/50 p-3 shadow-md shadow-white transition-all hover:scale-125 hover:rotate-180 hover:bg-red-500 hover:shadow-lg hover:shadow-white active:scale-95"
                        >
                           <IoClose size={28} className="text-white" />
                        </button>
                     </TooltipTrigger>
                     <TooltipContent
                        side="bottom"
                        align="center"
                        sideOffset={8}
                        className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black shadow-lg shadow-black select-none"
                     >
                        Sair
                     </TooltipContent>
                  </Tooltip>
                  <DashboardRecursos />
               </div>
            </div>
         )} */}
         {/* ============================== */}

         {/* ===== MODAL ATRIBUIÇÃO INTELIGENTE ===== */}
         <ModalAtribuicaoInteligente
            isOpen={modalAtribuicaoOpen}
            onClose={() => setModalAtribuicaoOpen(false)}
            chamado={chamadoParaAtribuir}
            onAtribuicaoSuccess={handleAtribuicaoSuccess}
         />

         {/* ===== MODAL APONTAMENTO ===== */}
         <ModalApontamento
            isOpen={modalApontamentosOpen}
            onClose={handleCloseApontamentos}
            tarefa={apontamentoData?.tarefa}
            nomeCliente={apontamentoData?.nomeCliente}
            codChamado={apontamentoData?.codChamado}
            onSuccess={handleApontamentoSuccess}
         />
      </>
   );
}
