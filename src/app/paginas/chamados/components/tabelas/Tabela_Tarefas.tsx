'use client';
// ================================================================================
import { debounce } from 'lodash';
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
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '@/components/ui/tooltip';
// ================================================================================
import { TabelaTarefaProps } from '../../../../../types/types';
import { InputGlobalFilterProps } from '../../../../../types/types';
import { InputFilterTableHeaderProps } from '../../../../../types/types';
// ================================================================================
import { useAuth } from '../../../../../hooks/useAuth';
import { colunasTabelaTarefa } from '../colunas/Colunas_Tabela_Tarefas';
// ================================================================================
import IsError from '../Error';
import IsLoading from '../Loading';
import TabelaOSTarefa from './Tabela_OS_Tarefa';
import ModalApontamentoOSTarefa from '../modais/Modal_Apontamento';
import TabelaChamadosTarefa from './Tabela_Chamados_Tarefa';
// ================================================================================
import { BsEraserFill } from 'react-icons/bs';
import { RiArrowUpDownLine } from 'react-icons/ri';
import { LuFilter, LuFilterX } from 'react-icons/lu';
import { FaFilterCircleXmark } from 'react-icons/fa6';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { IoArrowDown, IoArrowUp, IoClose } from 'react-icons/io5';
import { FaExclamationTriangle, FaTasks, FaSearch } from 'react-icons/fa';

// ================================================================================
// INTERFACES E TIPOS
// ================================================================================
interface Props {
   isOpen: boolean;
   onClose: () => void;
}

// ================================================================================
// FILTROS
// ================================================================================
const InputGlobalFilter = ({
   value,
   onChange,
   placeholder = 'Buscar em todas as colunas...',
}: InputGlobalFilterProps) => {
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
// ====================

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
// ================================================================================

// Função para largura fixa das colunas
function getColumnWidth(columnId: string): string {
   const widthMap: Record<string, string> = {
      COD_TAREFA: '15%',
      NOME_TAREFA: '46%',
      DTSOL_TAREFA: '12%',
      HREST_TAREFA: '12%',
      actions: '15%',
   };

   return widthMap[columnId] || 'auto';
}
// ==================

// Função auxiliar para nomear as colunas ordenáveis
const getColumnDisplayName = (columnId: string): string => {
   const displayNames: Record<string, string> = {
      COD_TAREFA: 'Código Tarefa',
      NOME_TAREFA: 'Nome Tarefa',
      DTSOL_TAREFA: 'Data Solicitação',
   };
   return displayNames[columnId] || columnId;
};

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export default function TabelaTarefas({ isOpen, onClose }: Props) {
   const { user } = useAuth();
   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
   const [globalFilter, setGlobalFilter] = useState('');
   const [sorting, setSorting] = useState<SortingState>([
      { id: 'COD_TAREFA', desc: false },
   ]);
   // ==================
   const [isOpenTabelaOSTarefa, setIsOpenTabelaOSTarefa] = useState(false);
   const [isOpenTabelaChamadosTarefa, setIsOpenTabelaChamadosTarefa] =
      useState(false);
   const [isOpenApontamentoOSTarefa, setIsOpenApontamentoOSTarefa] =
      useState(false);
   // ==================
   const [selectedTarefaChamado, setSelectedTarefaChamado] = useState<
      number | null
   >(null);
   const [selectedTarefaOS, setSelectedTarefaOS] = useState<number | null>(
      null
   );
   const [selectedTarefaApontamentoOS, setSelectedTarefaApontamentoOS] =
      useState<TabelaTarefaProps | null>(null);
   // ==================
   const [showFilters, setShowFilters] = useState(false);

   // Estados para os valores dos inputs de filtro
   const [filterValues, setFilterValues] = useState({
      COD_TAREFA: '',
      NOME_TAREFA: '',
      DTSOL_TAREFA: '',
      global: '',
   });
   // ================================================================================

   // Pega o token do localStorage com verificação para SSR
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
   // ====================

   // Função para buscar as tarefas do banco de dados
   async function fetchTarefas(token: string): Promise<TabelaTarefaProps[]> {
      const res = await fetch('/api/tarefas', {
         headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
         },
      });

      if (!res.ok) {
         const errorData = await res.json();
         throw new Error(errorData.error || 'Erro ao buscar tarefas');
      }

      const data = await res.json();
      return Array.isArray(data) ? data : [];
   }
   // ==================

   // useQuery para gerir os estados de busca das tarefas
   const {
      data: dataTarefas, // dados retornados pelo fetch
      isLoading, // estado de loading
      isError, // estado de erro
      error, // detalhes do erro
   } = useQuery({
      queryKey: ['tarefas', token],
      queryFn: () => fetchTarefas(token!),
      enabled: isOpen && !!token && !!user,
      staleTime: 1000 * 60 * 5,
      retry: 2,
   });
   // ================================================================================

   // Função para abrir a tabela de OS vinculadas à tarefa
   const handleOpenTabelaOSTarefa = (codTarefa: number) => {
      setSelectedTarefaOS(codTarefa);
      setIsOpenTabelaOSTarefa(true);
   };
   // ==========

   // Função para fechar a tabela de OS vinculadas à tarefa
   const handleCloseTabelaOSTarefa = () => {
      setIsOpenTabelaOSTarefa(false);
      setSelectedTarefaOS(null);
   };
   // ================================================================================

   // Função para abrir a tabela de chamados vinculados à tarefa
   const handleOpenTabelaChamadosTarefa = (codTarefa: number) => {
      setSelectedTarefaChamado(codTarefa);
      setIsOpenTabelaChamadosTarefa(true);
   };
   // ==========

   // Função para fechar a tabela de chamados vinculados à tarefa
   const handleCloseTabelaChamadosTarefa = () => {
      setIsOpenTabelaChamadosTarefa(false);
      setSelectedTarefaChamado(null);
   };
   // ================================================================================

   // Função para abrir o modal de apontamento vinculada à tarefa
   const handleOpenModalApontamentoOSTarefa = (tarefa: TabelaTarefaProps) => {
      setSelectedTarefaApontamentoOS(tarefa);
      setIsOpenApontamentoOSTarefa(true);
   };
   // ==========

   // Função para fechar o modal de apontamento vinculada à tarefa
   const handleCloseModalApontamentoOSTarefa = () => {
      setIsOpenApontamentoOSTarefa(false);
      setSelectedTarefaApontamentoOS(null);
   };
   // ================================================================================

   // Função para fechar a tabela de tarefas
   const handleCloseTabelaTarefa = () => {
      setTimeout(() => {
         onClose();
      }, 300);
   };
   // ====================

   // Função de filtro global otimizada
   const globalFilterFn = useCallback(
      (row: any, columnId: string, filterValue: string) => {
         if (!filterValue) return true;

         const searchValue = filterValue.toLowerCase();

         // Busca em todas as colunas principais da tarefa
         const searchableColumns = [
            'COD_TAREFA',
            'NOME_TAREFA',
            'DTSOL_TAREFA',
         ];

         return searchableColumns.some(colId => {
            const cellValue = row.getValue(colId);

            // Para data, formata antes de comparar
            if (colId === 'DTSOL_TAREFA' && cellValue) {
               try {
                  const date = new Date(cellValue as string);
                  const formattedDate = date.toLocaleDateString('pt-BR');
                  return formattedDate.includes(searchValue);
               } catch {
                  return String(cellValue || '')
                     .toLowerCase()
                     .includes(searchValue);
               }
            }

            const cellString = String(cellValue || '').toLowerCase();
            return cellString.includes(searchValue);
         });
      },
      []
   );
   // ====================

   // Função de filtro por coluna otimizada
   const columnFilterFn = useCallback(
      (row: any, columnId: string, filterValue: string) => {
         if (!filterValue || filterValue === '') return true;

         const cellValue = row.getValue(columnId);
         const cellString = String(cellValue || '').toLowerCase();
         const filterString = String(filterValue).toLowerCase();

         // Filtro específico por tipo de coluna
         switch (columnId) {
            case 'COD_TAREFA':
               // Para códigos, permite busca parcial em números
               return cellString.includes(filterString);

            case 'DTSOL_TAREFA':
               // Para data, formata antes de comparar
               if (!cellValue) return false;
               try {
                  const date = new Date(cellValue as string);
                  const formattedDate = date.toLocaleDateString('pt-BR');
                  return formattedDate.includes(filterString);
               } catch {
                  return cellString.includes(filterString);
               }

            case 'NOME_TAREFA':
            default:
               // Para texto, busca parcial case-insensitive
               return cellString.includes(filterString);
         }
      },
      []
   );
   // ====================

   //  Define as colunas da tabela com useMemo para otimização
   const colunas = useMemo(
      () =>
         colunasTabelaTarefa({
            openTabelaOSTarefa: handleOpenTabelaOSTarefa,
            openTabelaChamadosTarefa: handleOpenTabelaChamadosTarefa,
            openModalApontamentoOSTarefa: handleOpenModalApontamentoOSTarefa,
         }),
      []
   );
   // ===================

   // Inicializa a tabela com useReactTable
   const table = useReactTable({
      data: (dataTarefas ?? []) as TabelaTarefaProps[],
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
            pageSize: 10,
         },
      },

      // Função de filtro personalizada para colunas
      filterFns: {
         customColumnFilter: columnFilterFn,
      },

      // Aplica o filtro customizado para todas as colunas
      defaultColumn: {
         filterFn: columnFilterFn,
      },
   });
   // ====================

   // Calcula o total de filtros ativos
   const totalActiveFilters = useMemo(() => {
      let count = columnFilters.length;
      if (globalFilter && globalFilter.trim()) count += 1;
      return count;
   }, [columnFilters.length, globalFilter]);
   // ====================

   // Função para limpar todos os filtros e inputs
   const clearFilters = () => {
      setColumnFilters([]);
      setGlobalFilter('');

      // Limpa os valores dos inputs
      setFilterValues({
         COD_TAREFA: '',
         NOME_TAREFA: '',
         DTSOL_TAREFA: '',
         global: '',
      });

      // Limpa os filtros da tabela
      table.getAllColumns().forEach(column => {
         column.setFilterValue('');
      });
   };
   // ====================

   // Atualiza os valores locais quando os filtros da tabela mudam
   useEffect(() => {
      // Cria um novo objeto de valores baseado nos filtros atuais
      const newFilterValues = {
         COD_TAREFA: '',
         NOME_TAREFA: '',
         DTSOL_TAREFA: '',
         global: globalFilter || '',
      };

      // Preenche os valores dos filtros de coluna
      columnFilters.forEach(filter => {
         if (filter.id in newFilterValues) {
            newFilterValues[filter.id as keyof typeof newFilterValues] = String(
               filter.value || ''
            );
         }
      });

      // Atualiza apenas se houver mudanças reais para evitar loops
      setFilterValues(prev => {
         // Verifica se os valores realmente mudaram
         const hasChanged = Object.keys(newFilterValues).some(
            key =>
               prev[key as keyof typeof prev] !==
               newFilterValues[key as keyof typeof newFilterValues]
         );

         return hasChanged ? newFilterValues : prev;
      });
   }, [columnFilters, globalFilter]);
   // ====================

   if (!isOpen) return null;
   // ===================

   if (isLoading) {
      return (
         <>
            {/* Loading overlay centralizado - Z-INDEX MAIS ALTO */}
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl">
               <IsLoading title="Carregando os dados da tabela Tarefa" />
            </div>
         </>
      );
   }
   // ==================

   if (isError) {
      return (
         <>
            {/* Error overlay centralizado - Z-INDEX MAIS ALTO */}
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl">
               <IsError error={error as Error} />
            </div>
         </>
      );
   }

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <>
         <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* ===== OVERLAY ===== */}
            <div
               className="absolute inset-0 bg-black/50 backdrop-blur-xl"
               onClick={onClose}
            />
            {/* ==================== */}

            {/* ===== MODAL ===== */}
            <div className="relative z-10 mx-4 max-h-[100vh] w-full max-w-[100vw] overflow-hidden rounded-2xl shadow-xl shadow-black">
               {/* ===== HEADER ===== */}
               <header className="flex flex-col gap-4 bg-white/70 p-6">
                  <section className="flex items-center justify-between gap-8">
                     <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center justify-center rounded-md bg-white/30 p-4 shadow-sm shadow-black">
                           <FaTasks className="text-black" size={28} />
                        </div>
                        {/* ========== */}

                        <h1 className="text-4xl font-extrabold tracking-widest text-black uppercase select-none">
                           Tarefas
                        </h1>
                     </div>
                     {/* ==================== */}

                     <div className="flex items-center gap-6">
                        {/* Botão mostrar filtros */}
                        <button
                           onClick={() => setShowFilters(!showFilters)}
                           disabled={!dataTarefas || dataTarefas.length <= 1}
                           className={`flex cursor-pointer items-center gap-4 rounded-md px-6 py-2 text-lg font-extrabold tracking-wider italic transition-all select-none ${
                              showFilters
                                 ? 'border-none bg-blue-600 text-white shadow-sm shadow-black hover:bg-blue-800'
                                 : 'border-none bg-white/30 text-black shadow-sm shadow-black hover:bg-white/10'
                           } ${
                              !dataTarefas || dataTarefas.length <= 1
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

                        {/* Botão fechar tabela */}
                        <button
                           onClick={handleCloseTabelaTarefa}
                           className="group cursor-pointer rounded-full bg-red-500/50 p-3 text-white shadow-md shadow-black transition-all select-none hover:scale-125 hover:bg-red-500 active:scale-95"
                        >
                           <IoClose size={24} />
                        </button>
                     </div>
                  </section>
                  {/* ==================== */}

                  {/* ===== FILTRO GLOBAL ===== */}
                  {dataTarefas && dataTarefas.length > 0 && (
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

               {/* ===== CONTEÚDO ===== */}
               <main className="overflow-hidden bg-black">
                  {/* ===== TABELA ===== */}
                  {dataTarefas && dataTarefas.length > 0 && (
                     <section className="h-full w-full overflow-hidden bg-black">
                        <div
                           className="h-full overflow-y-auto"
                           style={{ maxHeight: 'calc(100vh - 420px)' }}
                        >
                           {/* =====TABELA ===== */}
                           <table className="w-full table-fixed border-collapse">
                              {/* ===== CABEÇALHO DA TABELA ===== */}
                              <thead className="sticky top-0 z-20">
                                 {table.getHeaderGroups().map(headerGroup => (
                                    // Linha do cabeçalho da tabela
                                    <tr key={headerGroup.id}>
                                       {headerGroup.headers.map(header => (
                                          // Células do cabeçalho da tabela
                                          <th
                                             key={header.id}
                                             className="bg-teal-700 py-6 font-extrabold tracking-wider text-white uppercase select-none"
                                             style={{
                                                width: getColumnWidth(
                                                   header.column.id
                                                ),
                                             }}
                                          >
                                             {header.isPlaceholder ? null : header
                                                  .column.id === 'COD_TAREFA' ||
                                               header.column.id ===
                                                  'NOME_TAREFA' ||
                                               header.column.id ===
                                                  'DTSOL_TAREFA' ? (
                                                <OrderTableHeader
                                                   column={header.column}
                                                >
                                                   {flexRender(
                                                      header.column.columnDef
                                                         .header,
                                                      header.getContext()
                                                   )}
                                                </OrderTableHeader>
                                             ) : (
                                                flexRender(
                                                   header.column.columnDef
                                                      .header,
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
                                                   column.id
                                                ),
                                             }}
                                          >
                                             {column.id === 'COD_TAREFA' && (
                                                <FilterInputTableHeaderDebounce
                                                   value={
                                                      (column.getFilterValue() as string) ??
                                                      ''
                                                   }
                                                   onChange={value =>
                                                      column.setFilterValue(
                                                         value
                                                      )
                                                   }
                                                   onClear={() =>
                                                      column.setFilterValue('')
                                                   }
                                                   placeholder="Código..."
                                                   type="text"
                                                />
                                             )}

                                             {column.id === 'NOME_TAREFA' && (
                                                <FilterInputTableHeaderDebounce
                                                   value={
                                                      (column.getFilterValue() as string) ??
                                                      ''
                                                   }
                                                   onChange={value =>
                                                      column.setFilterValue(
                                                         value
                                                      )
                                                   }
                                                   onClear={() =>
                                                      column.setFilterValue('')
                                                   }
                                                   placeholder="Nome da tarefa..."
                                                />
                                             )}

                                             {column.id === 'DTSOL_TAREFA' && (
                                                <FilterInputTableHeaderDebounce
                                                   value={
                                                      (column.getFilterValue() as string) ??
                                                      ''
                                                   }
                                                   onChange={value =>
                                                      column.setFilterValue(
                                                         value
                                                      )
                                                   }
                                                   onClear={() =>
                                                      column.setFilterValue('')
                                                   }
                                                   placeholder="dd/mm/aaaa"
                                                   type="text"
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
                                    table
                                       .getRowModel()
                                       .rows.map((row, rowIndex) => (
                                          // Linha do corpo da tabela
                                          <tr
                                             key={row.id}
                                             className={`group border-b border-gray-600 transition-all hover:bg-amber-200 ${
                                                rowIndex % 2 === 0
                                                   ? 'bg-stone-600'
                                                   : 'bg-stone-500'
                                             }`}
                                          >
                                             {row
                                                .getVisibleCells()
                                                .map(cell => (
                                                   // Células da tabela
                                                   <td
                                                      key={cell.id}
                                                      className="p-3 text-sm font-semibold tracking-wider text-white select-none group-hover:text-black"
                                                      style={{
                                                         width: getColumnWidth(
                                                            cell.column.id
                                                         ),
                                                      }}
                                                   >
                                                      <div className="overflow-hidden">
                                                         {flexRender(
                                                            cell.column
                                                               .columnDef.cell,
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

                        {/* ===== PAGINAÇÃO DA TABELA ===== */}
                        <div className="bg-white/70 px-12 py-4">
                           <div className="flex items-center justify-between">
                              {/* Informações da página */}
                              <section className="flex items-center gap-4">
                                 <span className="text-lg font-extrabold tracking-widest text-black italic select-none">
                                    {table.getFilteredRowModel().rows.length}{' '}
                                    registro
                                    {table.getFilteredRowModel().rows.length !==
                                    1
                                       ? 's'
                                       : ''}{' '}
                                    encontrado
                                    {table.getFilteredRowModel().rows.length !==
                                    1
                                       ? 's'
                                       : ''}
                                 </span>

                                 {/* Total de registros (sem filtros) */}
                                 {totalActiveFilters > 0 && (
                                    <span className="text-lg font-extrabold tracking-widest text-black italic select-none">
                                       de um total de {dataTarefas.length}
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
                                       value={
                                          table.getState().pagination.pageSize
                                       }
                                       onChange={e =>
                                          table.setPageSize(
                                             Number(e.target.value)
                                          )
                                       }
                                       className="cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 text-base font-semibold tracking-widest text-black italic shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                    >
                                       {[50, 100, 200, 300, 400, 500].map(
                                          pageSize => (
                                             <option
                                                key={pageSize}
                                                value={pageSize}
                                                className="bg-white text-base font-semibold tracking-widest text-black italic select-none"
                                             >
                                                {pageSize}
                                             </option>
                                          )
                                       )}
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
                                                table.getState().pagination
                                                   .pageIndex + 1
                                             }
                                             onChange={e => {
                                                const page =
                                                   Number(e.target.value) - 1;
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
                                          table.setPageIndex(
                                             table.getPageCount() - 1
                                          )
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
                     </section>
                  )}
                  {/* ===== */}

                  {/* ===== MENSAGEM QUANDO NÃO HÁ TAREFAS ===== */}
                  {dataTarefas && dataTarefas.length === 0 && !isLoading && (
                     <section className="bg-black py-40 text-center">
                        {/* ícone */}
                        <FaExclamationTriangle
                           className="mx-auto mb-6 text-yellow-500"
                           size={80}
                        />
                        {/* título */}
                        <h3 className="text-2xl font-bold tracking-widest text-white italic select-none">
                           Nenhuma Tarefa foi encontrada no momento.
                        </h3>
                     </section>
                  )}
                  {/* ===== */}

                  {/* ===== MENSAGEM QUANDO OS FILTROS NÃO RETORNAM RESULTADOS ===== */}
                  {dataTarefas &&
                     dataTarefas.length > 0 &&
                     table.getFilteredRowModel().rows.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-4 bg-slate-900 py-20 text-center">
                           <FaFilterCircleXmark
                              className="mx-auto text-red-600"
                              size={80}
                           />
                           {/* ===== */}
                           <h3 className="text-2xl font-bold tracking-wider text-white select-none">
                              Nenhum Registro encontrado para os Filtros
                              aplicados.
                           </h3>
                           {/* ===== */}
                           <p className="text-base font-semibold tracking-wider text-white italic select-none">
                              Tente ajustar os Filtros ou limpe-os para
                              visualizar Registros.
                           </p>
                           {/* ========== */}

                           {/* Botão para limpar filtros */}
                           {totalActiveFilters > 0 && (
                              <button
                                 onClick={clearFilters}
                                 className="flex cursor-pointer items-center gap-4 rounded-md border-none bg-red-600 px-6 py-2 text-lg font-extrabold tracking-wider text-white italic shadow-sm shadow-black transition-all select-none hover:-translate-y-1 hover:scale-102 hover:bg-red-800 active:scale-95"
                              >
                                 <BsEraserFill
                                    className="text-white"
                                    size={24}
                                 />
                                 Limpar Filtros
                              </button>
                           )}
                        </div>
                     )}
               </main>
            </div>
         </div>
         {/* ===== */}

         {/* ===== TABELA OS TAREFA ===== */}
         <TabelaOSTarefa
            isOpen={isOpenTabelaOSTarefa}
            onClose={handleCloseTabelaOSTarefa}
            codTarefa={selectedTarefaOS}
            codChamado={null}
         />
         {/* ========== */}

         {/* ===== TABELA CHAMADOS TAREFA ===== */}
         <TabelaChamadosTarefa
            isOpen={isOpenTabelaChamadosTarefa}
            onClose={handleCloseTabelaChamadosTarefa}
            codTarefa={selectedTarefaChamado}
            codChamado={null}
         />
         {/* ========== */}

         {/* ===== MODAL APONTAMENTO OS TAREFA ===== */}
         <ModalApontamentoOSTarefa
            isOpen={isOpenApontamentoOSTarefa}
            onClose={handleCloseModalApontamentoOSTarefa}
            tarefa={selectedTarefaApontamentoOS}
         />
      </>
   );
}
// ================================================================================
