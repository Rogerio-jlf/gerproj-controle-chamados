'use client';

import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback, useEffect } from 'react';
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
   ChamadosProps,
   TarefasProps,
   colunasTabela,
} from './Colunas_Tabela_Tarefas';
import TabelaChamadosTarefa from './Tabela_Chamados_Tarefa';
import TabelaOSTarefa from './Tabela_OS_Tarefa';
// ================================================================================
import IsLoading from './Loading';
import IsError from './Error';
// ================================================================================
import { BsEraserFill } from 'react-icons/bs';
import { LuFilter, LuFilterX } from 'react-icons/lu';
import { FaExclamationTriangle, FaFileAlt } from 'react-icons/fa';
import { FaFilter } from 'react-icons/fa6';
import { FaTasks } from 'react-icons/fa';
import { MdChevronLeft } from 'react-icons/md';
import { FiChevronsLeft } from 'react-icons/fi';
import { MdChevronRight } from 'react-icons/md';
import { FiChevronsRight } from 'react-icons/fi';
import { LuArrowUpDown } from 'react-icons/lu';
import { FaArrowUpLong } from 'react-icons/fa6';
import { FaArrowDownLong } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';
import { FaSearch } from 'react-icons/fa';
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '@/components/ui/tooltip';
import { RiArrowUpDownLine } from 'react-icons/ri';
import { IoArrowDown, IoArrowUp } from 'react-icons/io5';
import { debounce } from 'lodash';
import ModalApontamento from './Modal_Apontamento';
// ================================================================================
// ================================================================================

interface ModalTarefasProps {
   isOpen: boolean;
   onClose: () => void;
   codChamado?: number | null;
}

interface FilterInputWithDebounceProps {
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
   onClear?: () => void;
}
// ================================================================================

// Função para buscar tarefas do banco de dados
async function fetchTarefas(token: string): Promise<TarefasProps[]> {
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
// ================================================================================

// Componente de input com debounce para filtros de coluna
const FilterInputWithDebounce = ({
   value,
   onChange,
   placeholder,
   type = 'text',
   onClear,
}: FilterInputWithDebounceProps) => {
   const [localValue, setLocalValue] = useState(value);

   // Atualiza o valor local quando o valor externo muda (ex: limpeza)
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

// Componente de filtro global
const GlobalFilterInput = ({
   value,
   onChange,
   placeholder = 'Buscar em todas as colunas...',
   onClear,
}: GlobalFilterInputProps) => {
   const [localValue, setLocalValue] = useState(value);

   // Atualiza o valor local quando o valor externo muda
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
      <div className="group relative transition-all focus-within:text-black hover:scale-105">
         <FaSearch
            className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-600 transition-colors duration-300 group-focus-within:text-black"
            size={18}
         />
         <input
            type="text"
            value={localValue}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full rounded-md border border-black/50 bg-white/20 py-2 pr-4 pl-12 text-base text-black placeholder-gray-600 focus:bg-white/40 focus:outline-none focus:placeholder:text-gray-400"
         />
      </div>
   );
};

// Componente para ordenação do cabeçalho da tabela
const SortableHeader = ({
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

// Componente de Indicador de Filtros Ativos
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
         <div className="rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold tracking-wider text-white italic select-none">
            {totalFilters} filtro{totalFilters > 1 ? 's' : ''} ativo
            {totalFilters > 1 ? 's' : ''}
         </div>

         {globalFilter && (
            <div className="rounded-full bg-green-600 px-3 py-1 text-sm font-semibold tracking-wider text-white italic select-none">
               Busca global: "{globalFilter}"
            </div>
         )}

         {columnFilters.map(filter => (
            <div
               key={filter.id}
               className="rounded-full bg-purple-600 px-3 py-1 text-sm font-semibold tracking-wider text-white italic select-none"
            >
               {getColumnDisplayName(filter.id)}: "{String(filter.value)}"
            </div>
         ))}
      </div>
   );
};

// Função auxiliar para nomes das colunas
const getColumnDisplayName = (columnId: string): string => {
   const displayNames: Record<string, string> = {
      COD_TAREFA: 'Código Tarefa',
      NOME_TAREFA: 'Nome Tarefa',
      DTSOL_TAREFA: 'Data Solicitação',
   };
   return displayNames[columnId] || columnId;
};
// ================================================================================

export default function TabelaTarefas({
   isOpen,
   onClose,
   codChamado,
}: ModalTarefasProps) {
   const { user } = useAuth();
   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
   const [globalFilter, setGlobalFilter] = useState('');
   const [sorting, setSorting] = useState<SortingState>([
      { id: 'COD_TAREFA', desc: false },
   ]);

   const [isTabelaChamadosOpen, setIsTabelaChamadosOpen] = useState(false);
   const [selectedTarefaParaChamados, setSelectedTarefaParaChamados] = useState<
      number | null
   >(null);

   const [selectedTarefaParaCriarOS, setSelectedTarefaParaCriarOS] =
      useState<TarefasProps | null>(null);

   const [showFilters, setShowFilters] = useState(false);

   const [isModalApontamentoOpen, setIsModalApontamentoOpen] = useState(false);

   // ESTADOS PARA O MODAL DE OS (VISUALIZAR)
   const [isModalOSOpen, setIsModalOSOpen] = useState(false);
   const [selectedTarefaCodigo, setSelectedTarefaCodigo] = useState<
      number | null
   >(null);

   // Estados para os valores dos inputs de filtro
   const [filterValues, setFilterValues] = useState({
      COD_TAREFA: '',
      NOME_TAREFA: '',
      DTSOL_TAREFA: '',
      global: '',
   });

   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   const enabled = !!token && !!user && isOpen;

   const {
      data: dataTarefas,
      isLoading,
      isError,
      error,
   } = useQuery({
      queryKey: ['tarefas', token],
      queryFn: () => fetchTarefas(token!),
      enabled,
      staleTime: 1000 * 60 * 5,
      retry: 2,
   });

   const handleClose = () => {
      setTimeout(() => {
         onClose();
      }, 300);
   };

   // Adicionar esta nova função:
   const handleAbrirChamados = (codTarefa: number) => {
      setSelectedTarefaParaChamados(codTarefa);
      setIsTabelaChamadosOpen(true);
   };

   // Adicionar esta nova função para fechar:
   const handleCloseTabelaChamados = () => {
      setIsTabelaChamadosOpen(false);
      setSelectedTarefaParaChamados(null);
   };

   // FUNÇÃO PARA ABRIR O MODAL DE VISUALIZAR OS
   const handleVisualizarOS = (codTarefa: number) => {
      setSelectedTarefaCodigo(codTarefa);
      setIsModalOSOpen(true);
   };

   // FUNÇÃO PARA FECHAR O MODAL DE VISUALIZAR OS
   const handleCloseModalOS = () => {
      setIsModalOSOpen(false);
      setSelectedTarefaCodigo(null);
   };

   const handleCriarOS = (tarefa: TarefasProps) => {
      setSelectedTarefaParaCriarOS(tarefa);
      setIsModalApontamentoOpen(true);
   };

   const handleCloseModalApontamento = () => {
      setIsModalApontamentoOpen(false);
      setSelectedTarefaParaCriarOS(null);
   };

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

   // ATUALIZADO PARA INCLUIR A NOVA FUNÇÃO onCriarOS
   const colunas = useMemo(
      () =>
         colunasTabela({
            visualizarOSTarefa: handleVisualizarOS,
            visualizarChamadosTarefa: handleAbrirChamados,
            onCriarOS: handleCriarOS,
         }),
      []
   );

   const table = useReactTable({
      data: (dataTarefas ?? []) as TarefasProps[],
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

   // Calcula o total de filtros ativos
   const totalActiveFilters = useMemo(() => {
      let count = columnFilters.length;
      if (globalFilter && globalFilter.trim()) count += 1;
      return count;
   }, [columnFilters.length, globalFilter]);

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

   if (!isOpen) return null;

   if (isLoading) {
      return (
         <>
            {/* Overlay do modal principal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center">
               <div
                  className="absolute inset-0 bg-black/50 backdrop-blur-xl"
                  onClick={onClose}
               />
               <div className="relative z-10 mx-4 max-h-[100vh] w-full max-w-[100vw] overflow-hidden rounded-2xl border border-gray-300">
                  {/* Header do modal mesmo durante loading */}
                  <header className="flex items-center justify-between gap-8 bg-white/70 p-6">
                     <section className="flex items-center justify-center gap-6">
                        <div className="flex items-center justify-center rounded-xl border border-black/30 bg-white/10 p-4">
                           <FaFileAlt
                              className="animate-pulse text-black"
                              size={44}
                           />
                        </div>
                        <div className="flex flex-col items-center justify-center">
                           <h1 className="mb-1 text-4xl font-extrabold tracking-widest text-black select-none">
                              Tarefas
                           </h1>
                        </div>
                     </section>
                     <button
                        onClick={handleClose}
                        className="group cursor-pointer rounded-full bg-red-900 p-2 text-white transition-all select-none hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95"
                     >
                        <IoClose size={24} />
                     </button>
                  </header>
                  {/* Conteúdo com loading */}
                  <main className="flex min-h-[400px] items-center justify-center overflow-hidden bg-black">
                     <div className="text-center">
                        <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-white"></div>
                        <h2 className="text-2xl font-bold tracking-widest text-white italic">
                           Carregando os dados da tabela...
                        </h2>
                     </div>
                  </main>
               </div>
            </div>

            {/* Loading overlay centralizado - Z-INDEX MAIS ALTO */}
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
               <IsLoading title="Carregando os dados da tabela" />
            </div>
         </>
      );
   }

   if (isError) {
      return (
         <>
            {/* Overlay do modal principal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center">
               <div
                  className="absolute inset-0 bg-black/50 backdrop-blur-xl"
                  onClick={onClose}
               />
               <div className="relative z-10 mx-4 max-h-[100vh] w-full max-w-[100vw] overflow-hidden rounded-2xl border border-gray-300">
                  {/* Header do modal mesmo durante erro */}
                  <header className="flex items-center justify-between gap-8 bg-white/70 p-6">
                     <section className="flex items-center justify-center gap-6">
                        <div className="flex items-center justify-center rounded-xl border border-black/30 bg-white/10 p-4">
                           <FaFileAlt
                              className="animate-pulse text-black"
                              size={44}
                           />
                        </div>
                        <div className="flex flex-col items-center justify-center">
                           <h1 className="mb-1 text-4xl font-extrabold tracking-widest text-black select-none">
                              Tarefas
                           </h1>
                        </div>
                     </section>
                     <button
                        onClick={handleClose}
                        className="group cursor-pointer rounded-full bg-red-900 p-2 text-white transition-all select-none hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95"
                     >
                        <IoClose size={24} />
                     </button>
                  </header>
                  <main className="min-h-[400px] overflow-hidden bg-black">
                     {/* Conteúdo vazio durante erro */}
                  </main>
               </div>
            </div>

            {/* Error overlay centralizado - Z-INDEX MAIS ALTO */}
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
               <IsError error={error as Error} />
            </div>
         </>
      );
   }

   return (
      <>
         <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* ===== OVERLAY ===== */}
            <div
               className="absolute inset-0 bg-black/50 backdrop-blur-xl"
               onClick={onClose}
            />
            {/* ===== */}
            {/* ===== MODAL ===== */}
            <div className="relative z-10 mx-4 max-h-[100vh] w-full max-w-[100vw] overflow-hidden rounded-2xl border border-black">
               {/* ===== HEADER ===== */}
               <header className="flex flex-col gap-4 bg-white/70 p-6">
                  {/* ===== LINHA SUPERIOR ===== */}
                  <section className="flex items-center justify-between gap-8">
                     {/* ===== ITENS DA ESQUERDA ===== */}
                     <div className="flex items-center justify-center gap-6">
                        {/* ícone */}
                        <div className="flex items-center justify-center rounded-xl border border-black/50 bg-white/10 p-4">
                           <FaTasks className="text-black" size={28} />
                        </div>
                        {/* ===== */}

                        <div className="flex items-center justify-center gap-10">
                           {/* título */}
                           <h1 className="text-4xl font-extrabold tracking-widest text-black uppercase select-none">
                              Tarefas
                           </h1>
                           {/* ===== */}
                        </div>
                     </div>
                     {/* ===== */}

                     {/* ===== ITENS DA DIREITA ===== */}
                     <div className="flex items-center gap-6">
                        {/* botão mostrar/ocultar filtros */}
                        <button
                           onClick={() => setShowFilters(!showFilters)}
                           disabled={!dataTarefas || dataTarefas.length <= 1}
                           className={`flex cursor-pointer items-center gap-4 rounded-md px-6 py-2 text-lg font-extrabold tracking-wider italic transition-all select-none ${
                              showFilters
                                 ? 'bg-blue-600 text-white hover:bg-blue-900'
                                 : 'border border-black/50 bg-white/50 text-black hover:bg-white/70'
                           } ${
                              !dataTarefas || dataTarefas.length <= 1
                                 ? 'disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-gray-500'
                                 : 'hover:scale-105 active:scale-95'
                           }`}
                        >
                           {showFilters ? (
                              <LuFilterX size={24} />
                           ) : (
                              <LuFilter size={24} />
                           )}
                           {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                        </button>

                        {/* botão limpar filtros */}
                        {totalActiveFilters > 0 && (
                           <button
                              onClick={clearFilters}
                              className="flex cursor-pointer gap-4 rounded-md border border-white/30 bg-red-600 px-6 py-2 text-lg font-extrabold tracking-wider text-white italic transition-all select-none hover:scale-105 hover:bg-red-900 active:scale-95"
                           >
                              <BsEraserFill className="text-white" size={24} />
                              Limpar Filtros
                           </button>
                        )}

                        {/* botão - fechar modal */}
                        <button
                           onClick={handleClose}
                           className="group cursor-pointer rounded-full bg-red-900 p-2 text-white transition-all select-none hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95"
                        >
                           <IoClose size={24} />
                        </button>
                     </div>
                  </section>

                  {/* ===== FILTRO GLOBAL ===== */}
                  {dataTarefas && dataTarefas.length > 0 && (
                     <section className="flex items-center justify-between gap-6">
                        {/* Campo de busca global */}
                        <div className="max-w-md flex-1 font-semibold tracking-wider select-none placeholder:tracking-wider placeholder:text-gray-600 placeholder:italic placeholder:select-none">
                           <GlobalFilterInput
                              value={globalFilter ?? ''}
                              onChange={value => setGlobalFilter(String(value))}
                              placeholder="Buscar em todas as colunas..."
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

               {/* ===== CONTEÚDO ===== */}
               <main className="overflow-hidden bg-black">
                  {/* ===== TABELA ===== */}
                  {dataTarefas && dataTarefas.length > 0 && (
                     <section className="h-full w-full overflow-hidden bg-black">
                        <div
                           className="h-full overflow-y-auto"
                           style={{ maxHeight: 'calc(100vh - 420px)' }}
                        >
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
                                                <SortableHeader
                                                   column={header.column}
                                                >
                                                   {flexRender(
                                                      header.column.columnDef
                                                         .header,
                                                      header.getContext()
                                                   )}
                                                </SortableHeader>
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
                                                <FilterInputWithDebounce
                                                   value={
                                                      (column.getFilterValue() as string) ??
                                                      ''
                                                   }
                                                   onChange={value =>
                                                      column.setFilterValue(
                                                         value
                                                      )
                                                   }
                                                   placeholder="Código..."
                                                   type="text"
                                                />
                                             )}

                                             {column.id === 'NOME_TAREFA' && (
                                                <FilterInputWithDebounce
                                                   value={
                                                      (column.getFilterValue() as string) ??
                                                      ''
                                                   }
                                                   onChange={value =>
                                                      column.setFilterValue(
                                                         value
                                                      )
                                                   }
                                                   placeholder="Nome da tarefa..."
                                                />
                                             )}

                                             {column.id === 'DTSOL_TAREFA' && (
                                                <FilterInputWithDebounce
                                                   value={
                                                      (column.getFilterValue() as string) ??
                                                      ''
                                                   }
                                                   onChange={value =>
                                                      column.setFilterValue(
                                                         value
                                                      )
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
                        <section className="bg-white/70 px-12 py-4">
                           <div className="flex items-center justify-between">
                              {/* Informações da página */}
                              <section className="flex items-center gap-4">
                                 <span className="text-lg font-extrabold tracking-widest text-black italic select-none">
                                    {table.getFilteredRowModel().rows.length}{' '}
                                    tarefa
                                    {table.getFilteredRowModel().rows.length !==
                                    1
                                       ? 's'
                                       : ''}{' '}
                                    encontrada
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
                                       className="cursor-pointer rounded-md border border-black/30 px-4 py-1 text-base font-semibold tracking-widest text-black italic hover:bg-gray-500 hover:text-white"
                                    >
                                       {[5, 10, 15, 25].map(pageSize => (
                                          <option
                                             key={pageSize}
                                             value={pageSize}
                                             className="text-base font-semibold tracking-widest text-black italic"
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
                                       className="cursor-pointer rounded-md border border-black/30 px-4 py-1 tracking-widest select-none hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                       <FiChevronsLeft
                                          className="text-white"
                                          size={24}
                                       />
                                    </button>

                                    <button
                                       onClick={() => table.previousPage()}
                                       disabled={!table.getCanPreviousPage()}
                                       className="cursor-pointer rounded-md border border-black/30 px-4 py-1 tracking-widest select-none hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                       <MdChevronLeft
                                          className="text-white"
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
                                             className="cursor-pointer rounded-md border border-black/30 px-4 py-1 text-base font-semibold tracking-widest text-black italic hover:bg-gray-500 hover:text-white"
                                          >
                                             {Array.from(
                                                {
                                                   length: table.getPageCount(),
                                                },
                                                (_, i) => (
                                                   <option
                                                      key={i + 1}
                                                      value={i + 1}
                                                      className="text-base font-semibold tracking-widest text-black italic"
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
                                       className="cursor-pointer rounded-md border border-black/30 px-4 py-1 tracking-widest select-none hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                       <MdChevronRight
                                          className="text-white"
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
                                       className="cursor-pointer rounded-md border border-black/30 px-4 py-1 tracking-widest select-none hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                       <FiChevronsRight
                                          className="text-white"
                                          size={24}
                                       />
                                    </button>
                                 </div>
                              </section>
                           </div>
                        </section>
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

                  {/* ===== MENSAGEM QUANDO FILTROS NÃO RETORNAM RESULTADOS ===== */}
                  {dataTarefas &&
                     dataTarefas.length > 0 &&
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
                              Tente ajustar os filtros ou limpe-os para
                              visualizar registros.
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
               </main>
            </div>
         </div>
         {/* ===== */}

         {/* VISUALIZAR OS DA TAREFA */}
         <TabelaOSTarefa
            isOpen={isModalOSOpen}
            onClose={handleCloseModalOS}
            codTarefa={selectedTarefaCodigo}
            codChamado={null}
         />
         {/* ===== */}

         {/* VISUALIZAR CHAMADOS DA TAREFA */}
         <TabelaChamadosTarefa
            isOpen={isTabelaChamadosOpen}
            onClose={handleCloseTabelaChamados}
            codTarefa={selectedTarefaParaChamados}
            codChamado={null}
         />
         {/* ===== */}

         {/* MODAL DE CRIAR OS */}
         <ModalApontamento
            isOpen={isModalApontamentoOpen}
            onClose={handleCloseModalApontamento}
            tarefa={selectedTarefaParaCriarOS}
         />
      </>
   );
}
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
