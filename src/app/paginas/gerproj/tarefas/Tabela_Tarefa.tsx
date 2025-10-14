'use client';
// ================================================================================
import { debounce } from 'lodash';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { TabelaTarefaProps } from '../../../../types/types';
import { InputGlobalFilterProps } from '../../../../types/types';
import { InputFilterTableHeaderProps } from '../../../../types/types';
// ================================================================================
import { useAuth } from '../../../../hooks/useAuth';
import { colunasTabelaTarefa } from './Colunas_Tabela_Tarefa';
// ================================================================================
import { IsError } from '../components/IsError';
import { IsLoading } from '../components/IsLoading';
// ================================================================================
import { BsEraserFill } from 'react-icons/bs';
import { RiArrowUpDownLine } from 'react-icons/ri';
import { LuFilter, LuFilterX } from 'react-icons/lu';
import { FaFilterCircleXmark } from 'react-icons/fa6';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { IoArrowDown, IoArrowUp, IoClose } from 'react-icons/io5';
import { FaExclamationTriangle, FaTasks, FaSearch } from 'react-icons/fa';
import { useFiltersTabelaTarefa } from '../../../../contexts/Filters_Context_Tabela_Tarefa';
import { FiltrosTabelaTarefa } from './Filtros_Tabela_Tarefa';
import {
   FilterControls,
   FiltrosHeaderTabelaTarefa,
} from './Filtros_Header_Tabela_Tarefa';

// ================================================================================
// INTERFACES E TIPOS
// ================================================================================

interface PaginationInfo {
   currentPage: number;
   totalPages: number;
   totalRecords: number;
   recordsPerPage: number;
   hasNextPage: boolean;
   hasPrevPage: boolean;
}

interface ApiResponse {
   data: TabelaTarefaProps[];
   pagination: PaginationInfo;
}

interface Props {
   isOpen: boolean;
   onClose: () => void;
}

// ================================================================================
// FUNÇÕES UTILITÁRIAS
// ================================================================================
function getColumnWidth(columnId: string): string {
   const widthMap: Record<string, string> = {
      COD_TAREFA: '15%',
      NOME_TAREFA: '46%',
      CODPRO_TAREFA: '12%',
      DTSOL_TAREFA: '12%',
      DTAPROV_TAREFA: '12%',
      DTPREVENT_TAREFA: '12%',
      HREST_TAREFA: '12%',
      STATUS_TAREFA: '12%',
      DTINC_TAREFA: '12%',
      FATURA_TAREFA: '12%',
      PROJETO_COMPLETO: '12%',
      actions: '15%',
   };

   return widthMap[columnId] || 'auto';
}
// ==================

function useDebouncedValue<T>(value: T, delay: number = 800): T {
   const [debouncedValue, setDebouncedValue] = useState<T>(value);

   useEffect(() => {
      const timer = setTimeout(() => {
         setDebouncedValue(value);
      }, delay);

      return () => clearTimeout(timer);
   }, [value, delay]);

   return debouncedValue;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export function TabelaTarefas({ isOpen, onClose }: Props) {
   // ================================================================================
   // HOOKS E CONTEXTOS
   // ================================================================================
   const { user } = useAuth();
   const queryClient = useQueryClient();
   const { filters, setFilters } = useFiltersTabelaTarefa();
   const { ano, mes, dia } = filters;
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   // ================================================================================
   // ESTADOS - FILTROS (INPUTS SEM DEBOUNCE)
   // ================================================================================

   const [inputFilterCodTarefa, setInputFilterCodTarefa] = useState('');
   const [inputFilterNomeTarefa, setInputFilterNomeTarefa] = useState('');
   const [inputFilterCodProTarefa, setInputFilterCodProTarefa] = useState('');
   const [inputFilterDtSolTarefa, setInputFilterDtSolTarefa] = useState('');
   const [inputFilterDtAprovTarefa, setInputFilterDtAprovTarefa] = useState('');
   const [inputFilterDtPreventTarefa, setInputFilterDtPreventTarefa] =
      useState('');
   const [inputFilterHrEstTarefa, setInputFilterHrEstTarefa] = useState('');
   const [inputFilterStatusTarefa, setInputFilterStatusTarefa] = useState('');
   const [inputFilterDtIncTarefa, setInputFilterDtIncTarefa] = useState('');
   const [inputFilterFaturaTarefa, setInputFilterFaturaTarefa] = useState('');
   const [inputFilterProjetoCompleto, setInputFilterProjetoCompleto] =
      useState('');

   // ESTADOS - FILTROS (COM DEBOUNCE)
   const filterCodTarefa = useDebouncedValue(inputFilterCodTarefa, 800);
   const filterNomeTarefa = useDebouncedValue(inputFilterNomeTarefa, 800);
   const filterCodProTarefa = useDebouncedValue(inputFilterCodProTarefa, 800);
   const filterDtSolTarefa = useDebouncedValue(inputFilterDtSolTarefa, 800);
   const filterDtAprovTarefa = useDebouncedValue(inputFilterDtAprovTarefa, 800);
   const filterDtPreventTarefa = useDebouncedValue(
      inputFilterDtPreventTarefa,
      800
   );
   const filterHrEstTarefa = useDebouncedValue(inputFilterHrEstTarefa, 800);
   const filterStatusTarefa = useDebouncedValue(inputFilterStatusTarefa, 800);
   const filterDtIncTarefa = useDebouncedValue(inputFilterDtIncTarefa, 800);
   const filterFaturaTarefa = useDebouncedValue(inputFilterFaturaTarefa, 800);
   const filterProjetoCompleto = useDebouncedValue(
      inputFilterProjetoCompleto,
      800
   );

   // ================================================================================
   // ESTADOS - PAGINAÇÃO
   // ================================================================================
   const [currentPage, setCurrentPage] = useState(1);
   const [pageSize, setPageSize] = useState(20);

   // ================================================================================
   // ESTADOS - TABELA
   // ================================================================================
   const [sorting, setSorting] = useState<SortingState>([
      { id: 'COD_TAREFA', desc: true },
   ]);
   const [showFilters, setShowFilters] = useState(false);

   // ================================================================================
   // COMPUTED VALUES - FILTROS
   // ================================================================================
   const totalActiveFilters = useMemo(() => {
      let count = 0;
      if (filterCodTarefa && filterCodTarefa.trim()) count += 1;
      if (filterNomeTarefa && filterNomeTarefa.trim()) count += 1;
      if (filterCodProTarefa && filterCodProTarefa.trim()) count += 1;
      if (filterDtSolTarefa && filterDtSolTarefa.trim()) count += 1;
      if (filterDtAprovTarefa && filterDtAprovTarefa.trim()) count += 1;
      if (filterDtPreventTarefa && filterDtPreventTarefa.trim()) count += 1;
      if (filterHrEstTarefa && filterHrEstTarefa.trim()) count += 1;
      if (filterStatusTarefa && filterStatusTarefa.trim()) count += 1;
      if (filterDtIncTarefa && filterDtIncTarefa.trim()) count += 1;
      if (filterFaturaTarefa && filterFaturaTarefa.trim()) count += 1;
      if (filterProjetoCompleto && filterProjetoCompleto.trim()) count += 1;
      return count;
   }, [
      filterCodTarefa,
      filterNomeTarefa,
      filterCodProTarefa,
      filterDtSolTarefa,
      filterDtAprovTarefa,
      filterDtPreventTarefa,
      filterHrEstTarefa,
      filterStatusTarefa,
      filterDtIncTarefa,
      filterFaturaTarefa,
      filterProjetoCompleto,
   ]);

   // ================================================================================
   // QUERY PARAMS E API
   // ================================================================================
   const enabled = !!ano && !!mes && !!dia && !!token && !!user;

   const queryParams = useMemo(() => {
      if (!user) return new URLSearchParams();
      const params = new URLSearchParams({
         ano: String(ano),
         mes: String(mes),
         dia: String(dia),
         page: String(currentPage),
         limit: String(pageSize),
      });

      if (filterCodTarefa && filterCodTarefa.trim()) {
         params.append('filter_COD_TAREFA', filterCodTarefa.trim());
      }
      if (filterNomeTarefa && filterNomeTarefa.trim()) {
         params.append('filter_NOME_TAREFA', filterNomeTarefa.trim());
      }
      if (filterCodProTarefa && filterCodProTarefa.trim()) {
         params.append('filter_COD_PRO_TAREFA', filterCodProTarefa.trim());
      }
      if (filterDtSolTarefa && filterDtSolTarefa.trim()) {
         params.append('filter_DT_SOL_TAREFA', filterDtSolTarefa.trim());
      }
      if (filterDtAprovTarefa && filterDtAprovTarefa.trim()) {
         params.append('filter_DT_APROV_TAREFA', filterDtAprovTarefa.trim());
      }
      if (filterDtPreventTarefa && filterDtPreventTarefa.trim()) {
         params.append(
            'filter_DT_PREVENT_TAREFA',
            filterDtPreventTarefa.trim()
         );
      }
      if (filterHrEstTarefa && filterHrEstTarefa.trim()) {
         params.append('filter_HR_EST_TAREFA', filterHrEstTarefa.trim());
      }
      if (filterStatusTarefa && filterStatusTarefa.trim()) {
         params.append('filter_STATUS_TAREFA', filterStatusTarefa.trim());
      }
      if (filterDtIncTarefa && filterDtIncTarefa.trim()) {
         params.append('filter_DT_INC_TAREFA', filterDtIncTarefa.trim());
      }
      if (filterFaturaTarefa && filterFaturaTarefa.trim()) {
         params.append('filter_NOME_TAREFA', filterFaturaTarefa.trim());
      }
      if (filterProjetoCompleto && filterProjetoCompleto.trim()) {
         params.append('filter_NOME_PROJETO', filterProjetoCompleto.trim());
      }

      return params;
   }, [
      ano,
      mes,
      dia,
      user,
      currentPage,
      pageSize,
      filterCodTarefa,
      filterNomeTarefa,
      filterCodProTarefa,
      filterDtSolTarefa,
      filterDtAprovTarefa,
      filterDtPreventTarefa,
      filterHrEstTarefa,
      filterStatusTarefa,
      filterDtIncTarefa,
      filterFaturaTarefa,
      filterProjetoCompleto,
   ]);

   async function fetchOS(
      params: URLSearchParams,
      token: string
   ): Promise<ApiResponse> {
      const res = await fetch(`/api/tarefas?${params}`, {
         headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
         },
      });

      if (!res.ok) {
         const errorData = await res.json();
         throw new Error(errorData.error || 'Erro ao buscar OS');
      }

      const responseData = await res.json();

      return {
         data: responseData.data || [],
         pagination: responseData.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalRecords: 0,
            recordsPerPage: pageSize,
            hasNextPage: false,
            hasPrevPage: false,
         },
      };
   }

   const {
      data: apiResponse,
      isLoading,
      isError,
      error,
   } = useQuery({
      queryKey: ['tarefaData', queryParams.toString(), token],
      queryFn: () => fetchOS(queryParams, token!),
      enabled,
      staleTime: 1000 * 60 * 5,
      retry: 2,
   });

   const data = useMemo(() => apiResponse?.data || [], [apiResponse]);
   const paginationInfo = apiResponse?.pagination;

   // ================================================================================
   // EFFECTS - FILTROS
   // ================================================================================
   useEffect(() => {
      setCurrentPage(1);
   }, [
      filterCodTarefa,
      filterNomeTarefa,
      filterCodProTarefa,
      filterDtSolTarefa,
      filterDtAprovTarefa,
      filterDtPreventTarefa,
      filterHrEstTarefa,
      filterStatusTarefa,
      filterDtIncTarefa,
      filterFaturaTarefa,
      filterProjetoCompleto,
   ]);

   // ================================================================================
   // HANDLERS - FILTROS
   // ================================================================================
   const clearFilters = useCallback(() => {
      setInputFilterCodTarefa('');
      setInputFilterNomeTarefa('');
      setInputFilterCodProTarefa('');
      setInputFilterDtSolTarefa('');
      setInputFilterDtAprovTarefa('');
      setInputFilterDtPreventTarefa('');
      setInputFilterHrEstTarefa('');
      setInputFilterStatusTarefa('');
      setInputFilterDtIncTarefa('');
      setInputFilterFaturaTarefa('');
      setInputFilterProjetoCompleto('');
      setCurrentPage(1);
   }, []);

   const handleFiltersChange = useCallback(
      (newFilters: {
         ano: number | 'todos';
         mes: number | 'todos';
         dia: number | 'todos';
      }) => {
         setFilters(prevFilters => ({
            ...prevFilters,
            ...newFilters,
         }));
      },
      [setFilters]
   );

   // ================================================================================
   // HANDLERS - PAGINAÇÃO
   // ================================================================================
   const handlePageChange = useCallback((newPage: number) => {
      setCurrentPage(newPage);
   }, []);

   const handlePageSizeChange = useCallback((newSize: number) => {
      setPageSize(newSize);
      setCurrentPage(1);
   }, []);

   // ================================================================================
   // CONFIGURAÇÃO DA TABELA
   // ================================================================================
   const colunas = useMemo(() => colunasTabelaTarefa({}), []);

   const table = useReactTable({
      data: data ?? [],
      columns: colunas,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: setSorting,
      state: {
         sorting,
      },
      manualPagination: true,
      manualFiltering: true,
   });

   // ================================================================================
   // VALIDAÇÕES E ESTADOS DE CARREGAMENTO
   // ================================================================================

   if (!isOpen) return null;

   if (isError) return <IsError error={error as Error} />;

   // Função para fechar a tabela de tarefas
   const handleCloseTabelaTarefa = () => {
      setTimeout(() => {
         onClose();
      }, 300);
   };

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
         {/* OVERLAY */}
         <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

         {/* MODAL */}
         <div className="animate-in slide-in-from-bottom-4 z-10 max-h-[100vh] w-full max-w-[95vw] overflow-hidden rounded-2xl shadow-md shadow-black transition-all duration-500 ease-out">
            {/* HEADER */}
            <header className="flex flex-col gap-6 bg-white/50 p-6">
               {/* HEADER */}
               <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center justify-center gap-6">
                     <div className="flex items-center justify-center rounded-lg bg-white/30 p-4 shadow-md shadow-black">
                        <FaTasks className="text-black" size={28} />
                     </div>
                     <h1 className="text-4xl font-extrabold tracking-widest text-black uppercase select-none">
                        Tarefas
                     </h1>
                  </div>
                  {/* ==================== */}

                  <button
                     onClick={handleCloseTabelaTarefa}
                     className="group cursor-pointer rounded-full bg-red-500/50 p-3 text-white shadow-md shadow-black transition-all select-none hover:scale-125 hover:bg-red-500 active:scale-95"
                  >
                     <IoClose size={24} />
                  </button>
               </div>
               {/* ========== */}

               {/* FILTROS HEADER */}
               <div className="flex items-center gap-6">
                  <div className="flex w-[800px] items-center">
                     <FiltrosTabelaTarefa
                        onFiltersChange={handleFiltersChange}
                     />
                  </div>
                  <div className="flex items-center">
                     <FilterControls
                        showFilters={showFilters}
                        setShowFilters={setShowFilters}
                        totalActiveFilters={totalActiveFilters}
                        clearFilters={clearFilters}
                        dataLength={paginationInfo?.totalRecords || 0}
                     />
                  </div>
               </div>
            </header>

            {/* ===== TABELA ===== */}
            <main className="h-full w-full overflow-hidden bg-black">
               <div
                  className="h-full overflow-y-auto"
                  style={{ maxHeight: 'calc(100vh - 500px)' }}
               >
                  <table className="w-full table-fixed border-collapse">
                     {/* CABEÇALHO DA TABELA */}
                     <thead className="sticky top-0 z-20">
                        {table.getHeaderGroups().map(headerGroup => (
                           <tr key={headerGroup.id}>
                              {headerGroup.headers.map(header => (
                                 <th
                                    key={header.id}
                                    className="bg-teal-800 py-6 font-extrabold tracking-wider text-white uppercase select-none"
                                    style={{
                                       width: getColumnWidth(header.column.id),
                                    }}
                                 >
                                    {header.isPlaceholder
                                       ? null
                                       : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
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
                                    className="bg-teal-800 px-3 pb-6"
                                    style={{
                                       width: getColumnWidth(column.id),
                                    }}
                                 >
                                    {column.id === 'COD_TAREFA' && (
                                       <FiltrosHeaderTabelaTarefa
                                          value={inputFilterCodTarefa}
                                          onChange={value =>
                                             setInputFilterCodTarefa(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}

                                    {column.id === 'NOME_TAREFA' && (
                                       <FiltrosHeaderTabelaTarefa
                                          value={inputFilterCodTarefa}
                                          onChange={value =>
                                             setInputFilterCodTarefa(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}

                                    {column.id === 'CODPRO_TAREFA' && (
                                       <FiltrosHeaderTabelaTarefa
                                          value={inputFilterCodTarefa}
                                          onChange={value =>
                                             setInputFilterCodTarefa(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}
                                    {column.id === 'DTSOL_TAREFA' && (
                                       <FiltrosHeaderTabelaTarefa
                                          value={inputFilterCodTarefa}
                                          onChange={value =>
                                             setInputFilterCodTarefa(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}
                                    {column.id === 'DTAPROV_TAREFA' && (
                                       <FiltrosHeaderTabelaTarefa
                                          value={inputFilterCodTarefa}
                                          onChange={value =>
                                             setInputFilterCodTarefa(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}
                                    {column.id === 'DTPREVENT_TAREFA' && (
                                       <FiltrosHeaderTabelaTarefa
                                          value={inputFilterCodTarefa}
                                          onChange={value =>
                                             setInputFilterCodTarefa(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}
                                    {column.id === 'HREST_TAREFA' && (
                                       <FiltrosHeaderTabelaTarefa
                                          value={inputFilterCodTarefa}
                                          onChange={value =>
                                             setInputFilterCodTarefa(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}
                                    {column.id === 'STATUS_TAREFA' && (
                                       <FiltrosHeaderTabelaTarefa
                                          value={inputFilterCodTarefa}
                                          onChange={value =>
                                             setInputFilterCodTarefa(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}
                                    {column.id === 'DTINC_TAREFA' && (
                                       <FiltrosHeaderTabelaTarefa
                                          value={inputFilterCodTarefa}
                                          onChange={value =>
                                             setInputFilterCodTarefa(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}
                                    {column.id === 'FATURA_TAREFA' && (
                                       <FiltrosHeaderTabelaTarefa
                                          value={inputFilterCodTarefa}
                                          onChange={value =>
                                             setInputFilterCodTarefa(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}
                                    {column.id === 'NOME_PROJETO' && (
                                       <FiltrosHeaderTabelaTarefa
                                          value={inputFilterCodTarefa}
                                          onChange={value =>
                                             setInputFilterCodTarefa(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}
                                 </th>
                              ))}
                           </tr>
                        )}
                     </thead>
                     {/* ===== */}

                     {/* CORPO DA TABELA */}
                     <tbody>
                        {table.getRowModel().rows.length > 0 &&
                           !isLoading &&
                           table.getRowModel().rows.map((row, rowIndex) => (
                              <tr
                                 key={row.id}
                                 className={`group transition-all ${
                                    rowIndex % 2 === 0
                                       ? 'bg-slate-800'
                                       : 'bg-slate-800'
                                 }`}
                              >
                                 {row.getVisibleCells().map(cell => (
                                    <td
                                       key={cell.id}
                                       className="border border-white/30 bg-black p-2 text-sm font-semibold tracking-widest text-white select-none group-hover:bg-white/50 group-hover:text-black"
                                       style={{
                                          width: getColumnWidth(cell.column.id),
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
            {/* PAGINAÇÃO DA API */}
            {paginationInfo && paginationInfo.totalRecords > 0 && (
               <div className="bg-white/70 px-12 py-4">
                  <div className="flex items-center justify-between">
                     {/* Informações da página */}
                     <section className="flex items-center gap-4">
                        <span className="text-lg font-extrabold tracking-widest text-black italic select-none">
                           {table.getFilteredRowModel().rows.length} registro
                           {table.getFilteredRowModel().rows.length !== 1
                              ? 's'
                              : ''}{' '}
                           na página atual,
                        </span>
                        <span className="text-lg font-extrabold tracking-widest text-black italic select-none">
                           {paginationInfo.totalRecords > 1
                              ? `de ${paginationInfo.totalRecords} encontrados no total.`
                              : `de 1 encontrado no total.`}
                        </span>
                     </section>

                     {/* Controles de paginação */}
                     <section className="flex items-center gap-3">
                        {/* Seletor de itens por página */}
                        <div className="flex items-center gap-2">
                           <span className="text-base font-semibold tracking-widest text-black italic select-none">
                              Itens por página:
                           </span>
                           <select
                              value={pageSize}
                              onChange={e =>
                                 handlePageSizeChange(Number(e.target.value))
                              }
                              className="cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 text-base font-semibold tracking-widest text-black italic shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-600 focus:outline-none"
                           >
                              {[20, 50, 100].map(size => (
                                 <option
                                    key={size}
                                    value={size}
                                    className="bg-white text-base font-semibold tracking-widest text-black italic select-none"
                                 >
                                    {size}
                                 </option>
                              ))}
                           </select>
                        </div>

                        {/* Botões de navegação */}
                        <div className="flex items-center gap-3">
                           <button
                              onClick={() => handlePageChange(1)}
                              disabled={!paginationInfo.hasPrevPage}
                              className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              <FiChevronsLeft
                                 className="text-black group-disabled:text-red-500"
                                 size={24}
                              />
                           </button>

                           <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={!paginationInfo.hasPrevPage}
                              className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              <MdChevronLeft
                                 className="text-black group-disabled:text-red-500"
                                 size={24}
                              />
                           </button>

                           <div className="flex items-center justify-center gap-2">
                              <span className="text-base font-semibold tracking-widest text-black italic select-none">
                                 Página{' '}
                                 <select
                                    value={currentPage}
                                    onChange={e =>
                                       handlePageChange(Number(e.target.value))
                                    }
                                    className="cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 text-base font-semibold tracking-widest text-black italic shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-600 focus:outline-none"
                                 >
                                    {Array.from(
                                       { length: paginationInfo.totalPages },
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
                                 de {paginationInfo.totalPages}
                              </span>
                           </div>

                           <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={!paginationInfo.hasNextPage}
                              className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              <MdChevronRight
                                 className="text-black group-disabled:text-red-500"
                                 size={24}
                              />
                           </button>

                           <button
                              onClick={() =>
                                 handlePageChange(paginationInfo.totalPages)
                              }
                              disabled={!paginationInfo.hasNextPage}
                              className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              <FiChevronsRight
                                 className="group-disabled:text-red-5 00 text-black"
                                 size={24}
                              />
                           </button>
                        </div>
                     </section>
                  </div>
               </div>
            )}

            {/* ===== MENSAGEM QUANDO NÃO HÁ TAREFAS ===== */}
            {data && data.length === 0 && !isLoading && (
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

            {/* MENSAGEM QUANDO OS FILTROS NÃO RETORNAM RESULTADOS */}
            {paginationInfo &&
               paginationInfo.totalRecords > 0 &&
               table.getFilteredRowModel().rows.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-4 bg-slate-900 py-64 text-center">
                     <FaFilterCircleXmark
                        className="mx-auto text-red-600"
                        size={100}
                     />
                     <h3 className="text-3xl font-extrabold tracking-wider text-white italic select-none">
                        Nenhum registro encontrado para os filtros aplicados.
                     </h3>
                     <p className="text-base font-semibold tracking-wider text-white italic select-none">
                        Tente ajustar os filtros ou limpe-os para visualizar
                        registros.
                     </p>
                     {totalActiveFilters > 0 && (
                        <button
                           onClick={clearFilters}
                           className="cursor-pointer rounded-sm border-none bg-red-500 px-6 py-2 text-lg font-extrabold tracking-wider text-white shadow-sm shadow-black transition-all hover:scale-105 hover:bg-red-800 active:scale-95"
                        >
                           Limpar Filtros
                        </button>
                     )}
                  </div>
               )}
         </div>
         <IsLoading
            isLoading={isLoading}
            title={`Buscando OS's para o período: ${mes.toString().padStart(2, '0')}/${ano}`}
         />
      </div>
   );
}
