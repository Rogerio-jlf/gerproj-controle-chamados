'use client';

import { debounce } from 'lodash';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
   flexRender,
   SortingState,
   useReactTable,
   getCoreRowModel,
   getSortedRowModel,
   ColumnFiltersState,
   getFilteredRowModel,
   getPaginationRowModel,
} from '@tanstack/react-table';
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '../../../../../components/ui/tooltip';
// ================================================================================
import { TabelaOSProps } from '../../../../../types/types';
import { InputGlobalFilterProps } from '../../../../../types/types';
import { InputFilterTableHeaderProps } from '../../../../../types/types';
// ================================================================================
import ModalEditarOS from '../modais/Modal_Editar_OS';
import { ModalExcluirOS } from '../modais/Modal_Deletar_OS';
import {
   colunasTabelaOSChamado,
   OSTarefaProps,
} from '../colunas/Colunas_Tabela_OS_Chamado';
// ================================================================================
import IsError from '../Error';
import IsLoading from '../Loading';
// ================================================================================
import { GrServices } from 'react-icons/gr';
import { BsEraserFill } from 'react-icons/bs';
import { RiArrowUpDownLine } from 'react-icons/ri';
import { LuFilter, LuFilterX } from 'react-icons/lu';
import { FaFilterCircleXmark } from 'react-icons/fa6';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FaExclamationTriangle, FaSearch } from 'react-icons/fa';
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { IoArrowUp, IoArrowDown, IoClose } from 'react-icons/io5';

// ================================================================================
// COMPONENTES DE FILTRO
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
      COD_OS: 'Código OS',
      NOME_CLIENTE: 'Cliente',
      CODTRF_OS: 'Código Tarefa',
      OBS_OS: 'Observação',
      DTINI_OS: 'Data Início',
   };
   return displayNames[columnId] || columnId;
};
// ====================

function getColumnWidth(columnId: string): string {
   const widthMap: Record<string, string> = {
      COD_OS: '8.5%',
      NOME_CLIENTE: '15%',
      CODTRF_OS: '7%',
      OBS_OS: '29%',
      DTINI_OS: '10%',
      HRINI_OS: '8%',
      HRFIM_OS: '8%',
      QTD_HR_OS: '8%',
      actions: '6.5%',
   };

   return widthMap[columnId] || 'auto';
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================

export default function TabelaOSChamado({
   isOpen,
   onClose,
   onSuccess,
   codChamado,
}: OSTarefaProps) {
   // ================================================================================
   // ESTADOS - MODAIS E COMPONENTES
   // ================================================================================
   const [modalEditarOSOpen, setModalEditarOSOpen] = useState(false);
   const [selectedOS, setSelectedOS] = useState<number | null>(null);
   const [osParaExcluir, setOsParaExcluir] = useState<number | null>(null);

   // ================================================================================
   // ESTADOS - FILTROS E ORDENAÇÃO
   // ================================================================================
   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
   const [globalFilter, setGlobalFilter] = useState('');
   const [sorting, setSorting] = useState<SortingState>([
      { id: 'COD_OS', desc: false },
   ]);
   const [filterValues, setFilterValues] = useState({
      COD_CHAMADO: '',
      DATA_CHAMADO: '',
      ASSUNTO_CHAMADO: '',
      STATUS_CHAMADO: '',
      EMAIL_CHAMADO: '',
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
            'COD_OS',
            'NOME_CLIENTE',
            'CODTRF_OS',
            'OBS_OS',
            'DTINI_OS',
         ];

         return searchableColumns.some(colId => {
            const cellValue = row.getValue(colId);

            if (colId === 'DTINI_OS' && cellValue) {
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

   const columnFilterFn = useCallback(
      (row: any, columnId: string, filterValue: string) => {
         if (!filterValue || filterValue === '') return true;

         const cellValue = row.getValue(columnId);
         const cellString = String(cellValue || '').toLowerCase();
         const filterString = String(filterValue).toLowerCase();

         switch (columnId) {
            case 'COD_OS':
            case 'CODTRF_OS':
               return cellString.includes(filterString);

            case 'DTINI_OS':
               if (!cellValue) return false;
               try {
                  const date = new Date(cellValue as string);
                  const formattedDate = date.toLocaleDateString('pt-BR');
                  return formattedDate.includes(filterString);
               } catch {
                  return cellString.includes(filterString);
               }

            case 'NOME_CLIENTE':
            case 'OBS_OS':
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
   const fetchDataOS = async (codChamado: number) => {
      const response = await fetch(`/api/OS-chamado/${codChamado}`);

      if (!response.ok) throw new Error(`Erro: ${response.status}`);

      const data = await response.json();
      return Array.isArray(data) ? data : [data];
   };

   const {
      data: dataOS,
      isLoading,
      isError,
      error,
      refetch,
   } = useQuery({
      queryKey: ['dataOS', codChamado],
      queryFn: () => fetchDataOS(codChamado!),
      enabled: isOpen && !!codChamado,
      staleTime: 1000 * 60 * 1,
   });

   // ================================================================================
   // HANDLERS E CALLBACKS
   // ================================================================================
   const handleClose = () => {
      setTimeout(() => {
         onClose();
      }, 300);
   };
   // ====================

   const handleOpenEditarOS = (codOS: number) => {
      setSelectedOS(codOS);
      setModalEditarOSOpen(true);
   };

   const handleCloseEditarOS = () => {
      setModalEditarOSOpen(false);
      setSelectedOS(null);
   };
   // ====================

   const handleAbrirModalExclusao = (codOS: number) => {
      setOsParaExcluir(codOS);
   };

   const handleFecharModalExclusao = () => {
      setOsParaExcluir(null);
   };

   const handleEditarOSSuccess = () => {
      handleCloseEditarOS();
      onSuccess?.();
   };

   const handleExclusaoSuccess = () => {
      handleFecharModalExclusao();
      refetch();
   };

   // ================================================================================
   // CONFIGURAÇÃO DA TABELA
   // ================================================================================
   const colunas = colunasTabelaOSChamado({
      onEditarOS: handleOpenEditarOS,
      onExcluirOS: handleAbrirModalExclusao,
   });

   const table = useReactTable({
      data: (dataOS ?? []) as TabelaOSProps[],
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
      filterFns: {
         customColumnFilter: columnFilterFn,
      },
      defaultColumn: {
         filterFn: columnFilterFn,
      },
   });

   // ================================================================================
   // EFEITOS
   // ================================================================================
   useEffect(() => {
      if (isOpen && codChamado) {
         refetch();
      }
   }, [isOpen, codChamado, refetch]);

   // ================================================================================
   // ESTADOS DE CARREGAMENTO E VALIDAÇÃO
   // ================================================================================
   if (!isOpen) return null;

   if (isLoading) {
      return (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl">
            <IsLoading title={`Carregando as OS's do Chamado #${codChamado}`} />
         </div>
      );
   }

   if (isError) {
      return (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl">
            <IsError error={error as Error} />
         </div>
      );
   }

   // ================================================================================
   // RENDERIZAÇÃO PRINCIPAL
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
                           <GrServices className="text-black" size={28} />
                        </div>
                        {/* ========== */}

                        <div className="flex flex-col items-start justify-center">
                           <h1 className="text-4xl font-extrabold tracking-widest text-black uppercase select-none">
                              Ordens de serviço
                           </h1>
                           {/* ===== */}
                           <span className="text-2xl font-extrabold tracking-widest text-pink-600 uppercase italic select-none">
                              Chamado - #{codChamado}
                           </span>
                        </div>
                     </div>
                     {/* ==================== */}

                     <div className="flex items-center gap-6">
                        {/* Botão mostrar filtros */}
                        <button
                           onClick={() => setShowFilters(!showFilters)}
                           disabled={!dataOS || dataOS.length <= 1}
                           className={`flex cursor-pointer items-center gap-4 rounded-md px-6 py-2 text-lg font-extrabold tracking-wider italic transition-all select-none ${
                              showFilters
                                 ? 'border-none bg-blue-600 text-white shadow-sm shadow-black hover:bg-blue-800'
                                 : 'border-none bg-white/30 text-black shadow-sm shadow-black hover:bg-white/10'
                           } ${
                              !dataOS || dataOS.length <= 1
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
                           onClick={handleClose}
                           className="group cursor-pointer rounded-full bg-red-500/50 p-3 text-white shadow-md shadow-black transition-all select-none hover:scale-125 hover:bg-red-500 active:scale-95"
                        >
                           <IoClose size={24} />
                        </button>
                     </div>
                  </section>
                  {/* ==================== */}

                  {/* ===== FILTRO GLOBAL ===== */}
                  {dataOS && dataOS.length > 0 && (
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

               {/* ===== CONTEÚDO PRINCIPAL ===== */}
               <main className="overflow-hidden bg-black">
                  {/* ===== TABELA ===== */}
                  {dataOS && dataOS.length > 0 && (
                     <section className="h-full w-full overflow-hidden bg-black">
                        <div
                           className="h-full overflow-y-auto"
                           style={{ maxHeight: 'calc(100vh - 420px)' }}
                        >
                           {/* ===== TABELA ===== */}
                           <table className="w-full table-fixed border-collapse">
                              {/* ===== CABEÇALHO DA TABELA ===== */}
                              <thead className="sticky top-0 z-20">
                                 {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                       {headerGroup.headers.map(header => (
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
                                                  .column.id === 'COD_OS' ||
                                               header.column.id ===
                                                  'NOME_CLIENTE' ||
                                               header.column.id ===
                                                  'CODTRF_OS' ||
                                               header.column.id ===
                                                  'DTINI_OS' ||
                                               header.column.id === 'OBS_OS' ? (
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
                                             {column.id === 'COD_OS' && (
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
                                             {column.id === 'NOME_CLIENTE' && (
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
                                                   placeholder="Cliente..."
                                                />
                                             )}
                                             {column.id === 'CODTRF_OS' && (
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
                                                />
                                             )}
                                             {column.id === 'OBS_OS' && (
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
                                                   placeholder="Observação..."
                                                />
                                             )}
                                             {column.id === 'DTINI_OS' && (
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

                              {/* ===== CORPO DA TABELA ===== */}
                              <tbody>
                                 {table.getRowModel().rows.length > 0 &&
                                    !isLoading &&
                                    table
                                       .getRowModel()
                                       .rows.map((row, rowIndex) => (
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
                                       de um total de {dataOS.length}
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

                  {/* ===== MENSAGEM QUANDO NÃO HÁ OS ===== */}
                  {dataOS && dataOS.length === 0 && !isLoading && (
                     <section className="bg-black py-40 text-center">
                        <FaExclamationTriangle
                           className="mx-auto mb-6 text-yellow-500"
                           size={80}
                        />
                        <h3 className="text-2xl font-bold tracking-widest text-white italic select-none">
                           Nenhuma Ordem de Serviço foi encontrada para o
                           chamado #{codChamado}.
                        </h3>
                     </section>
                  )}

                  {/* ===== MENSAGEM QUANDO OS FILTROS NÃO RETORNAM RESULTADOS ===== */}
                  {dataOS &&
                     dataOS.length > 0 &&
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

         {/* ===== MODAL EDIÇÃO DE OS ===== */}
         {modalEditarOSOpen && selectedOS !== null && (
            <ModalEditarOS
               isOpen={modalEditarOSOpen}
               onClose={handleCloseEditarOS}
               codChamado={codChamado ?? null}
               codOS={selectedOS}
               nomeCliente={
                  dataOS?.find(os => os.COD_OS === selectedOS)?.NOME_CLIENTE
               }
               onSuccess={handleEditarOSSuccess}
            />
         )}

         {/* ===== MODAL EXCLUSÃO DE OS ===== */}
         <ModalExcluirOS
            isOpen={!!osParaExcluir}
            onClose={handleFecharModalExclusao}
            codOS={osParaExcluir}
            onSuccess={handleExclusaoSuccess}
         />
      </>
   );
}
