'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
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
import { debounce } from 'lodash';
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '../../../../components/ui/tooltip';
// ================================================================================
import { useAuth } from '../../../../hooks/useAuth';
import { useFiltersTabelaChamados } from '../../../../contexts/Filters_Context';
import { colunasTabela } from './colunas/Colunas_Tabela_Chamados';
import ModalAtribuirChamado from './modais/Modal_Dados_Chamado';
import TabelaTarefas from './Tabela_Tarefas';
import TabelaOS from './Tabela_OS';
import ModalAtribuicaoInteligente from './modais/Modal_Atribuir_Chamado';
import { TabelaChamadosProps } from '../../../../types/types';
import IsLoading from './Loading';
import IsError from './Error';
// ================================================================================
import { BsEraserFill } from 'react-icons/bs';
import {
   FaExclamationTriangle,
   FaDatabase,
   FaUserLock,
   FaSearch,
} from 'react-icons/fa';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { RiArrowUpDownLine } from 'react-icons/ri';
import { IoArrowUp, IoArrowDown, IoClose } from 'react-icons/io5';
import { FaFilter, FaUsers } from 'react-icons/fa6';
import { LuFilter, LuFilterX } from 'react-icons/lu';
import { Loader2 } from 'lucide-react';

// ================================================================================
// INTERFACES E TIPOS
// ================================================================================

interface FilterInputTableHeaderProps {
   value: string;
   onChange: (value: string) => void;
   placeholder?: string;
   type?: string;
   onClear?: () => void;
}

interface GlobalFilterInputProps {
   value: string;
   onChange: (value: string) => void;
   placeholder?: string;
   onClear: () => void;
}

// ================================================================================
// COMPONENTES DE FILTRO
// ================================================================================

const FilterInputTableHeaderDebounce = ({
   value,
   onChange,
   placeholder,
   type = 'text',
}: FilterInputTableHeaderProps) => {
   const [localValue, setLocalValue] = useState(value);

   useEffect(() => {
      setLocalValue(value);
   }, [value]);

   const debouncedOnChange = useMemo(
      () => debounce((newValue: string) => onChange(newValue), 300),
      [onChange]
   );

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value);
      debouncedOnChange(e.target.value);
   };

   return (
      <input
         type={type}
         value={localValue}
         onChange={handleChange}
         placeholder={placeholder}
         className="w-full rounded-md border border-white/50 bg-teal-950 px-4 py-2 text-base text-white placeholder-gray-500 hover:scale-105 focus:bg-black focus:outline-none focus:placeholder:text-gray-700"
      />
   );
};
// ====================

const GlobalFilterInput = ({
   value,
   onChange,
   placeholder = 'Buscar em todas as colunas...',
}: GlobalFilterInputProps) => {
   const [localValue, setLocalValue] = useState(value);
   const inputRef = useRef<HTMLInputElement>(null);
   const [isFocused, setIsFocused] = useState(false);

   useEffect(() => {
      setLocalValue(value);
   }, [value]);

   const debouncedOnChange = useMemo(
      () => debounce((newValue: string) => onChange(newValue), 500),
      [onChange]
   );

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value);
      debouncedOnChange(e.target.value);
   };

   return (
      <div className="group relative transition-all hover:-translate-y-1 hover:scale-102">
         <FaSearch
            className="absolute top-1/2 left-4 -translate-y-1/2 text-white"
            size={18}
         />
         <input
            type="text"
            value={localValue}
            onChange={handleChange}
            placeholder={isFocused ? '' : placeholder}
            className="w-full rounded-md border-none bg-white/30 py-3 pl-12 text-base font-semibold tracking-wider text-white placeholder-white shadow-sm shadow-white select-none hover:bg-white/20 focus:ring-2 focus:ring-pink-500 focus:outline-none"
            ref={inputRef}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
         />
      </div>
   );
};

// ================================================================================
// COMPONENTES DE UI DA TABELA
// ================================================================================

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
               className="flex cursor-pointer items-center justify-center gap-2 rounded-md py-2 transition-all hover:bg-teal-900 active:scale-95"
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
            className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
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

const FilterIndicator = ({
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
      <div className="flex items-center gap-2">
         <div className="rounded-full bg-blue-600 px-6 py-1 text-base font-semibold tracking-wider text-white italic select-none">
            {totalFilters} filtro{totalFilters > 1 ? 's' : ''} ativo
            {totalFilters > 1 ? 's' : ''}
         </div>

         {globalFilter && (
            <div className="rounded-full bg-green-600 px-6 py-1 text-base font-semibold tracking-wider text-white italic select-none">
               Busca global: "{globalFilter}"
            </div>
         )}

         {columnFilters.map(filter => (
            <div
               key={filter.id}
               className="rounded-full bg-purple-600 px-6 py-1 text-base font-semibold tracking-wider text-white italic select-none"
            >
               {getColumnDisplayName(filter.id)}: "{String(filter.value)}"
            </div>
         ))}
      </div>
   );
};

// ================================================================================
// UTILITÁRIOS
// ================================================================================

const getColumnDisplayName = (columnId: string): string => {
   const displayNames: Record<string, string> = {
      COD_CHAMADO: 'Código',
      DATA_CHAMADO: 'Data',
      ASSUNTO_CHAMADO: 'Assunto',
      STATUS_CHAMADO: 'Status',
      EMAIL_CHAMADO: 'Email',
      NOME_RECURSO: 'Recurso',
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
   const { user, loading } = useAuth();
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

         const searchValue = filterValue.toLowerCase();
         const searchableColumns = [
            'COD_CHAMADO',
            'DATA_CHAMADO',
            'ASSUNTO_CHAMADO',
            'STATUS_CHAMADO',
            'EMAIL_CHAMADO',
            'NOME_RECURSO',
         ];

         return searchableColumns.some(colId => {
            const cellValue = row.getValue(colId);
            const cellString = String(cellValue || '').toLowerCase();
            return cellString.includes(searchValue);
         });
      },
      []
   );

   const columnFilterFn = useCallback(
      (row: any, columnId: string, filterValue: string) => {
         if (!filterValue || filterValue === '') return true;

         const cellValue = row.getValue(columnId);
         const cellString = String(cellValue || '').toLowerCase();
         const filterString = String(filterValue).toLowerCase();

         switch (columnId) {
            case 'COD_CHAMADO':
            case 'DATA_CHAMADO':
            case 'ASSUNTO_CHAMADO':
            case 'STATUS_CHAMADO':
            case 'EMAIL_CHAMADO':
            case 'NOME_RECURSO':
            default:
               return cellString.includes(filterString);
         }
      },
      []
   );

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
         EMAIL_CHAMADO: '',
         NOME_RECURSO: '',
         global: '',
      });
      table.getAllColumns().forEach(column => {
         column.setFilterValue('');
      });
   };

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
   // ====================

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
               onUpdateAssunto: updateAssunto, // ADICIONE ESTA LINHA
               userType: user?.tipo,
            },
            user?.tipo
         ),
      [
         handleVisualizarChamado,
         handleVisualizarOS,
         handleAbrirAtribuicaoInteligente,
         updateAssunto,
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
   if (loading) {
      return (
         <div className="flex flex-col items-center justify-center space-y-6 py-40">
            <div className="relative">
               <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-cyan-200 via-cyan-400 to-cyan-600 opacity-20 blur-lg"></div>
               <div className="relative flex items-center justify-center">
                  <Loader2 className="animate-spin text-blue-600" size={120} />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <FaUserLock className="text-blue-600" size={60} />
                  </div>
               </div>
            </div>
            <div className="space-y-3 text-center">
               <h3 className="text-2xl font-bold tracking-wider text-blue-600 select-none">
                  Verificando autenticação do usuário
               </h3>
               <div className="flex items-center justify-center space-x-1">
                  <span className="text-base font-semibold tracking-wider text-blue-600 italic select-none">
                     Aguarde
                  </span>
                  <div className="flex space-x-1">
                     <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"></div>
                     <div
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"
                        style={{ animationDelay: '0.1s' }}
                     ></div>
                     <div
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"
                        style={{ animationDelay: '0.2s' }}
                     ></div>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   if (!user || !token) {
      return (
         <div className="flex flex-col items-center justify-center space-y-6 py-40">
            <div className="relative">
               <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-red-200 via-red-400 to-red-600 opacity-20 blur-lg"></div>
               <div className="relative flex items-center justify-center">
                  <FaExclamationTriangle
                     className="animate-pulse text-red-600"
                     size={120}
                  />
               </div>
            </div>
            <div className="space-y-3 text-center">
               <h3 className="text-2xl font-bold tracking-wider text-red-600 select-none">
                  Acesso restrito!
               </h3>
               <p className="mx-auto max-w-md text-base font-semibold tracking-wider text-red-500 italic select-none">
                  Você precisa estar logado para visualizar os chamados do
                  sistema.
               </p>
            </div>
         </div>
      );
   }

   if (!ano || !mes) {
      return (
         <div className="flex flex-col items-center justify-center space-y-6 py-40">
            <div className="relative">
               <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-blue-200 via-blue-400 to-blue-600 opacity-20 blur-lg"></div>
               <div className="relative flex items-center justify-center">
                  <FaExclamationTriangle
                     className="animate-pulse text-blue-600"
                     size={120}
                  />
               </div>
            </div>
            <div className="space-y-3 text-center">
               <h3 className="text-2xl font-bold tracking-wider text-blue-600 select-none">
                  Filtros obrigatórios
               </h3>
               <p className="mx-auto max-w-md text-base font-semibold tracking-wider text-blue-500 italic select-none">
                  Por favor, selecione o ano e mês para visualizar os chamados.
               </p>
            </div>
         </div>
      );
   }

   if (isLoading)
      return <IsLoading title="Carregando os dados da tabela Chamados" />;
   if (isError) return <IsError error={error as Error} />;

   // ================================================================================
   // RENDERIZAÇÃO PRINCIPAL
   // ================================================================================
   return (
      <>
         <div className="overflow-hidden rounded-xl border border-gray-500 bg-black">
            {/* ===== HEADER ===== */}
            <header className="flex flex-col gap-6 bg-black p-6">
               {/* ===== LINHA SUPERIOR ===== */}
               <section className="flex items-center justify-between gap-8">
                  {/* ===== ITENS DA ESQUERDA ===== */}
                  <div className="flex items-center justify-center gap-6">
                     <div className="flex items-center justify-center rounded-md bg-white/30 p-4 shadow-sm shadow-white">
                        <FaDatabase className="text-white" size={28} />
                     </div>
                     {/* ===== */}
                     <h1 className="text-4xl font-extrabold tracking-widest text-white select-none">
                        Chamados
                     </h1>
                  </div>
                  {/* ===== */}

                  {/* ===== ITENS DA DIREITA ===== */}
                  <div className="flex items-center gap-6">
                     {/* botão dashboard recursos */}
                     {/* {user?.tipo === 'ADM' && (
                        <Tooltip>
                           <TooltipTrigger asChild>
                              <button
                                 onClick={handleAbrirDashboard}
                                 className="flex cursor-pointer items-center gap-4 rounded-md border border-white/50 bg-white/40 px-6 py-2 text-lg font-extrabold tracking-wider text-white italic transition-all select-none hover:scale-105 hover:border-none hover:bg-white/70 hover:text-black active:scale-95"
                              >
                                 <FaUsers size={24} />
                                 Recursos
                              </button>
                           </TooltipTrigger>
                           <TooltipContent
                              side="top"
                              align="center"
                              sideOffset={2}
                              className="border-b-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
                           >
                              Dashboard Recursos
                           </TooltipContent>
                        </Tooltip>
                     )} */}

                     {/* botão tabela OS */}
                     {/* <TarefasButton
                        onVisualizarTarefas={() => setTabelaTarefasOpen(true)}
                     /> */}

                     {/* Botão mostrar/ocultar filtros */}
                     <button
                        onClick={() => setShowFilters(!showFilters)}
                        disabled={!data || data.length <= 1}
                        className={`flex cursor-pointer items-center gap-4 rounded-md px-6 py-2 text-lg font-extrabold tracking-wider italic transition-all select-none ${
                           showFilters
                              ? 'border-none bg-blue-600 text-white shadow-sm shadow-white hover:bg-blue-900'
                              : 'border-none bg-white/30 text-white shadow-sm shadow-white hover:bg-white/20'
                        } ${
                           !data || data.length <= 1
                              ? 'disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-gray-500'
                              : 'hover:-translate-y-1 hover:scale-105 active:scale-95'
                        }`}
                     >
                        {showFilters ? (
                           <LuFilterX size={24} />
                        ) : (
                           <LuFilter size={24} />
                        )}
                        {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                     </button>
                     {/* ===== */}

                     {/* Botão limpar filtros */}
                     {totalActiveFilters > 0 && (
                        <button
                           onClick={clearFilters}
                           className="flex cursor-pointer items-center gap-4 rounded-md border-none bg-red-600 px-6 py-2 text-lg font-extrabold tracking-wider text-white italic shadow-sm shadow-white transition-all select-none hover:-translate-y-1 hover:scale-105 hover:bg-red-900 active:scale-95"
                        >
                           <BsEraserFill className="text-white" size={24} />
                           Limpar Filtros
                        </button>
                     )}
                  </div>
               </section>

               {/* ===== FILTRO GLOBAL ===== */}
               {data && data.length > 0 && (
                  <section className="flex items-center justify-between gap-6">
                     {/* Campo de busca global */}
                     <div className="max-w-md flex-1 font-semibold tracking-wider select-none placeholder:tracking-wider placeholder:text-gray-400 placeholder:italic placeholder:select-none">
                        <GlobalFilterInput
                           value={globalFilter ?? ''}
                           onChange={value => setGlobalFilter(String(value))}
                           placeholder="Buscar em todas as colunas..."
                           onClear={function (): void {
                              setGlobalFilter('');
                           }}
                        />
                     </div>

                     {/* Indicadores de filtros ativos */}
                     <FilterIndicator
                        columnFilters={columnFilters}
                        globalFilter={globalFilter}
                        totalFilters={totalActiveFilters}
                     />
                  </section>
               )}
            </header>
            {/* ===== */}

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
                        {/* ===== */}

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
                                          placeholder="Filtrar por assunto..."
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
                                          placeholder="Filtrar por status..."
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
                                          placeholder="Filtrar por recurso..."
                                       />
                                    )}
                                    {/* ===== */}
                                    {column.id === 'EMAIL_CHAMADO' && (
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
                                          placeholder="Filtrar por email..."
                                       />
                                    )}
                                 </th>
                              ))}
                           </tr>
                        )}
                     </thead>
                     {/* ===== */}

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
                                       ? 'bg-stone-800'
                                       : 'bg-stone-700'
                                 }`}
                              >
                                 {row.getVisibleCells().map(cell => (
                                    // células do corpo da tabela
                                    <td
                                       key={cell.id}
                                       className="p-3 text-sm font-semibold tracking-wider text-white select-none group-hover:text-black"
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
                     {/* ===== */}
                  </table>
                  {/* ===== */}
               </div>
               {/* ===== */}
            </main>
            {/* ===== */}

            {/* ===== PAGINAÇÃO DA TABELA ===== */}
            {Array.isArray(data) && data.length > 0 && (
               <section className="bg-black px-12 py-4">
                  <div className="flex items-center justify-between">
                     {/* Informações da página */}
                     <div className="flex items-center gap-2">
                        <span className="text-base font-semibold tracking-widest text-white italic select-none">
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
                           <span className="text-base font-semibold tracking-widest text-white italic select-none">
                              de um total de {data.length}
                           </span>
                        )}
                     </div>

                     {/* Controles de paginação */}
                     <div className="flex items-center gap-3">
                        {/* Seletor de itens por página */}
                        <div className="flex items-center gap-2">
                           <span className="text-base font-semibold tracking-widest text-white italic select-none">
                              Itens por página:
                           </span>
                           <select
                              value={table.getState().pagination.pageSize}
                              onChange={e =>
                                 table.setPageSize(Number(e.target.value))
                              }
                              className="cursor-pointer rounded-md bg-white/30 px-4 py-1 text-base font-semibold tracking-widest text-white italic shadow-sm shadow-white transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                           >
                              {[10, 25, 50, 75, 100].map(pageSize => (
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
                        {/* ===== */}

                        {/* Botões de navegação */}
                        <div className="flex items-center gap-3">
                           <button
                              onClick={() => table.setPageIndex(0)}
                              disabled={!table.getCanPreviousPage()}
                              className="group cursor-pointer rounded-md bg-white/30 px-4 py-1 shadow-sm shadow-white transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              <FiChevronsLeft
                                 className="text-white group-disabled:text-slate-50"
                                 size={24}
                              />
                           </button>
                           {/* ===== */}

                           <button
                              onClick={() => table.previousPage()}
                              disabled={!table.getCanPreviousPage()}
                              className="group cursor-pointer rounded-md bg-white/30 px-4 py-1 shadow-sm shadow-white transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              <MdChevronLeft
                                 className="text-white group-disabled:text-slate-50"
                                 size={24}
                              />
                           </button>
                           {/* ===== */}

                           <div className="flex items-center justify-center gap-2">
                              <span className="text-base font-semibold tracking-widest text-white italic select-none">
                                 Página{' '}
                                 <select
                                    value={
                                       table.getState().pagination.pageIndex + 1
                                    }
                                    onChange={e => {
                                       const page = Number(e.target.value) - 1;
                                       table.setPageIndex(page);
                                    }}
                                    className="cursor-pointer rounded-md bg-white/30 px-4 py-1 text-base font-semibold tracking-widest text-white italic shadow-sm shadow-white transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                 >
                                    {Array.from(
                                       { length: table.getPageCount() },
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
                              <span className="text-base font-semibold tracking-widest text-white italic select-none">
                                 {' '}
                                 de {table.getPageCount()}
                              </span>
                           </div>
                           {/* ===== */}

                           <button
                              onClick={() => table.nextPage()}
                              disabled={!table.getCanNextPage()}
                              className="group cursor-pointer rounded-md bg-white/30 px-4 py-1 shadow-sm shadow-white transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              <MdChevronRight
                                 className="text-white group-disabled:text-slate-50"
                                 size={24}
                              />
                           </button>
                           {/* ===== */}

                           <button
                              onClick={() =>
                                 table.setPageIndex(table.getPageCount() - 1)
                              }
                              disabled={!table.getCanNextPage()}
                              className="group cursor-pointer rounded-md bg-white/30 px-4 py-1 shadow-sm shadow-white transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              <FiChevronsRight
                                 className="text-white group-disabled:text-slate-50"
                                 size={24}
                              />
                           </button>
                        </div>
                     </div>
                  </div>
               </section>
            )}
            {/* ===== */}

            {/* ===== MENSAGEM QUANDO NÃO HÁ CHAMADOS ===== */}
            {data && data.length === 0 && !isLoading && (
               <section className="bg-black py-40 text-center">
                  {/* ícone */}
                  <FaExclamationTriangle
                     className="mx-auto mb-6 text-yellow-500"
                     size={80}
                  />
                  {/* título */}
                  <h3 className="text-2xl font-bold tracking-widest text-white italic select-none">
                     Nenhum chamado foi encontrado para o período{' '}
                     {mes.toString().padStart(2, '0')}/{ano}.
                  </h3>
               </section>
            )}
            {/* ===== */}

            {/* ===== MENSAGEM QUANDO FILTROS NÃO RETORNAM RESULTADOS ===== */}
            {data &&
               data.length > 0 &&
               table.getFilteredRowModel().rows.length === 0 && (
                  <section className="bg-slate-900 py-20 text-center">
                     {/* ícone */}
                     <FaFilter
                        className="mx-auto mb-4 text-cyan-400"
                        size={60}
                     />
                     {/* título */}
                     <h3 className="text-xl font-bold tracking-wider text-slate-200 select-none">
                        Nenhum registro foi encontrado para os filtros
                        aplicados.
                     </h3>
                     {/* Subtítulo */}
                     <p className="mt-2 text-slate-400">
                        Tente ajustar os filtros ou limpe-os para visualizar
                        registros.
                     </p>

                     {/* Botão para limpar filtros */}
                     {totalActiveFilters > 0 && (
                        <button
                           onClick={clearFilters}
                           className="mx-auto mt-4 flex cursor-pointer items-center gap-2 rounded-md border border-cyan-400 bg-cyan-600 px-6 py-2 text-base font-semibold tracking-wider text-white transition-all select-none hover:scale-105 hover:bg-cyan-700 active:scale-95"
                        >
                           <BsEraserFill size={18} />
                           Limpar Filtros
                        </button>
                     )}
                  </section>
               )}
            {/* ===== */}
         </div>
         {/* ===== */}

         {/* ===== MODAL CHAMADO ===== */}
         <ModalAtribuirChamado
            isOpen={modalChamadosOpen}
            onClose={handleCloseModalChamados}
            chamado={selectedChamado}
         />
         {/* ===== MODAL OS ===== */}
         <TabelaOS
            isOpen={tabelaOSOpen}
            onClose={handleCloseTabelaOS}
            codChamado={selectedCodChamado}
            onSuccess={() => setTabelaOSOpen(false)} // <- fecha o modal da tabela
         />
         {/* ===== MODAL TAREFAS ===== */}
         <TabelaTarefas
            isOpen={tabelaTarefasOpen}
            onClose={() => setTabelaTarefasOpen(false)}
            codChamado={selectedCodChamado}
         />

         {/* ===== MODAL ATRIBUIÇÃO INTELIGENTE ===== */}
         <ModalAtribuicaoInteligente
            isOpen={modalAtribuicaoOpen}
            onClose={() => setModalAtribuicaoOpen(false)}
            chamado={chamadoParaAtribuir}
            onAtribuicaoSuccess={handleAtribuicaoSuccess}
         />
         {/* ===== */}
      </>
   );
}
