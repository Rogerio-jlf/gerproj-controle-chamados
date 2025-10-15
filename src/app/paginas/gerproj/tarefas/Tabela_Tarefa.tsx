'use client';
// ================================================================================
// IMPORTS
// ================================================================================
import {
   flexRender,
   getCoreRowModel,
   useReactTable,
   getSortedRowModel,
   SortingState,
} from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback, useEffect } from 'react';

// Components
import {
   FilterControls,
   FiltrosHeaderTabelaTarefa,
} from './filtros/Filtros_Header_Tabela_Tarefa';
import { IsError } from '../components/IsError';
import { IsLoading } from '../components/IsLoading';
import { colunasTabelaTarefa } from './Colunas_Tabela_Tarefa';
import { formatarCodNumber } from '../../../../utils/formatters';
import { FiltrosTabelaTarefa } from './filtros/Filtros_Tabela_Tarefa';

// Hooks & Types
import { useAuth } from '../../../../hooks/useAuth';
import { TabelaTarefaProps } from '../../../../types/types';
import { useFiltersTabelaTarefa } from '../../../../contexts/Filters_Context_Tabela_Tarefa';

// Icons
import { IoClose } from 'react-icons/io5';
import { FaFilterCircleXmark } from 'react-icons/fa6';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { FaExclamationTriangle, FaTasks } from 'react-icons/fa';

// ================================================================================
// INTERFACES
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
      TAREFA_COMPLETA: '19',
      PROJETO_COMPLETO: '19',
      NOME_RECURSO: '11%',
      NOME_CLIENTE: '11%',
      DTSOL_TAREFA: '6%',
      DTAPROV_TAREFA: '6%',
      DTPREVENT_TAREFA: '6%',
      HREST_TAREFA: '6%',
      STATUS_TAREFA: '5%',
      DTINC_TAREFA: '6%',
      FATURA_TAREFA: '5%',
      // actions: '15%',
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
   const { filters, setFilters } = useFiltersTabelaTarefa();
   const { ano, mes, dia } = filters;
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   // ================================================================================
   // ESTADOS - FILTROS (INPUTS SEM DEBOUNCE)
   // ================================================================================

   const [inputFilterTarefaCompleta, setInputFilterTarefaCompleta] =
      useState('');
   const [inputFilterProjetoCompleto, setInputFilterProjetoCompleto] =
      useState('');
   const [inputFilterNomeRecurso, setInputFilterNomeRecurso] = useState('');
   const [inputFilterNomeCliente, setInputFilterNomeCliente] = useState('');
   const [inputFilterDtSolTarefa, setInputFilterDtSolTarefa] = useState('');
   const [inputFilterDtAprovTarefa, setInputFilterDtAprovTarefa] = useState('');
   const [inputFilterDtPreventTarefa, setInputFilterDtPreventTarefa] =
      useState('');
   const [inputFilterHrEstTarefa, setInputFilterHrEstTarefa] = useState('');
   const [inputFilterStatusTarefa, setInputFilterStatusTarefa] = useState('');
   const [inputFilterDtIncTarefa, setInputFilterDtIncTarefa] = useState('');
   const [inputFilterFaturaTarefa, setInputFilterFaturaTarefa] = useState('');

   // ESTADOS - FILTROS (COM DEBOUNCE)
   const filterTarefaCompleta = useDebouncedValue(
      inputFilterTarefaCompleta,
      800
   );
   const filterProjetoCompleto = useDebouncedValue(
      inputFilterProjetoCompleto,
      800
   );

   const filterNomeRecurso = useDebouncedValue(inputFilterNomeRecurso, 800);
   const filterNomeCliente = useDebouncedValue(inputFilterNomeCliente, 800);
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
      if (filterTarefaCompleta && filterTarefaCompleta.trim()) count += 1;
      if (filterProjetoCompleto && filterProjetoCompleto.trim()) count += 1;
      if (filterNomeRecurso && filterNomeRecurso.trim()) count += 1;
      if (filterNomeCliente && filterNomeCliente.trim()) count += 1;
      if (filterDtSolTarefa && filterDtSolTarefa.trim()) count += 1;
      if (filterDtAprovTarefa && filterDtAprovTarefa.trim()) count += 1;
      if (filterDtPreventTarefa && filterDtPreventTarefa.trim()) count += 1;
      if (filterHrEstTarefa && filterHrEstTarefa.trim()) count += 1;
      if (filterStatusTarefa && filterStatusTarefa.trim()) count += 1;
      if (filterDtIncTarefa && filterDtIncTarefa.trim()) count += 1;
      if (filterFaturaTarefa && filterFaturaTarefa.trim()) count += 1;
      return count;
   }, [
      filterTarefaCompleta,
      filterProjetoCompleto,
      filterNomeRecurso,
      filterNomeCliente,
      filterDtSolTarefa,
      filterDtAprovTarefa,
      filterDtPreventTarefa,
      filterHrEstTarefa,
      filterStatusTarefa,
      filterDtIncTarefa,
      filterFaturaTarefa,
   ]);

   // ================================================================================
   // QUERY PARAMS E API
   // ================================================================================
   const enabled = useMemo(() => {
      return !!(
         (ano === 'todos' || typeof ano === 'number') &&
         (mes === 'todos' || typeof mes === 'number') &&
         (dia === 'todos' || typeof dia === 'number') &&
         token &&
         user
      );
   }, [ano, mes, dia, token, user]);

   const queryParams = useMemo(() => {
      if (!user) return new URLSearchParams();

      const params = new URLSearchParams({
         page: String(currentPage),
         limit: String(pageSize),
      });

      // ✅ Só adiciona ano se não for 'todos'
      if (ano !== 'todos') {
         params.append('ano', String(ano));
      } else {
         params.append('ano', 'todos');
      }

      // ✅ Só adiciona mes se não for 'todos'
      if (mes !== 'todos') {
         params.append('mes', String(mes));
      } else {
         params.append('mes', 'todos');
      }

      // ✅ Só adiciona dia se não for 'todos'
      if (dia !== 'todos') {
         params.append('dia', String(dia));
      } else {
         params.append('dia', 'todos');
      }

      // Filtros de coluna
      if (filterTarefaCompleta && filterTarefaCompleta.trim()) {
         params.append('filter_COD_TAREFA', filterTarefaCompleta.trim());
      }
      if (filterProjetoCompleto && filterProjetoCompleto.trim()) {
         params.append('filter_NOME_PROJETO', filterProjetoCompleto.trim());
      }
      if (filterNomeRecurso && filterNomeRecurso.trim()) {
         params.append('filter_NOME_RECURSO', filterNomeRecurso.trim());
      }
      if (filterNomeCliente && filterNomeCliente.trim()) {
         params.append('filter_NOME_CLIENTE', filterNomeCliente.trim());
      }
      if (filterDtSolTarefa && filterDtSolTarefa.trim()) {
         params.append('filter_DTSOL_TAREFA', filterDtSolTarefa.trim()); // ✅ CORRIGIDO
      }
      if (filterDtAprovTarefa && filterDtAprovTarefa.trim()) {
         params.append('filter_DTAPROV_TAREFA', filterDtAprovTarefa.trim()); // ✅ CORRIGIDO
      }
      if (filterDtPreventTarefa && filterDtPreventTarefa.trim()) {
         params.append('filter_DTPREVENT_TAREFA', filterDtPreventTarefa.trim()); // ✅ CORRIGIDO
      }
      if (filterHrEstTarefa && filterHrEstTarefa.trim()) {
         params.append('filter_HREST_TAREFA', filterHrEstTarefa.trim()); // ✅ CORRIGIDO
      }
      if (filterStatusTarefa && filterStatusTarefa.trim()) {
         params.append('filter_STATUS_TAREFA', filterStatusTarefa.trim());
      }
      if (filterDtIncTarefa && filterDtIncTarefa.trim()) {
         params.append('filter_DTINC_TAREFA', filterDtIncTarefa.trim()); // ✅ CORRIGIDO
      }
      if (filterFaturaTarefa && filterFaturaTarefa.trim()) {
         params.append('filter_FATURA_TAREFA', filterFaturaTarefa.trim()); // ✅ CORRIGIDO
      }

      return params;
   }, [
      ano,
      mes,
      dia,
      user,
      currentPage,
      pageSize,
      filterTarefaCompleta,
      filterProjetoCompleto,
      filterNomeRecurso,
      filterNomeCliente,
      filterDtSolTarefa,
      filterDtAprovTarefa,
      filterDtPreventTarefa,
      filterHrEstTarefa,
      filterStatusTarefa,
      filterDtIncTarefa,
      filterFaturaTarefa,
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
      filterTarefaCompleta,
      filterProjetoCompleto,
      filterNomeRecurso,
      filterNomeCliente,
      filterDtSolTarefa,
      filterDtAprovTarefa,
      filterDtPreventTarefa,
      filterHrEstTarefa,
      filterStatusTarefa,
      filterDtIncTarefa,
      filterFaturaTarefa,
   ]);

   // ================================================================================
   // HANDLERS - FILTROS
   // ================================================================================
   const clearFilters = useCallback(() => {
      setInputFilterTarefaCompleta('');
      setInputFilterProjetoCompleto('');
      setInputFilterNomeRecurso('');
      setInputFilterNomeCliente('');
      setInputFilterDtSolTarefa('');
      setInputFilterDtAprovTarefa('');
      setInputFilterDtPreventTarefa('');
      setInputFilterHrEstTarefa('');
      setInputFilterStatusTarefa('');
      setInputFilterDtIncTarefa('');
      setInputFilterFaturaTarefa('');
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
                                    {column.id === 'TAREFA_COMPLETA' && (
                                       <FiltrosHeaderTabelaTarefa
                                          value={inputFilterTarefaCompleta}
                                          onChange={value =>
                                             setInputFilterTarefaCompleta(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}

                                    {column.id === 'PROJETO_COMPLETO' && (
                                       <FiltrosHeaderTabelaTarefa
                                          value={inputFilterProjetoCompleto}
                                          onChange={value =>
                                             setInputFilterProjetoCompleto(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}

                                    {column.id === 'NOME_RECURSO' && (
                                       <FiltrosHeaderTabelaTarefa
                                          value={inputFilterNomeRecurso}
                                          onChange={value =>
                                             setInputFilterNomeRecurso(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}

                                    {column.id === 'NOME_CLIENTE' && (
                                       <FiltrosHeaderTabelaTarefa
                                          value={inputFilterNomeCliente}
                                          onChange={value =>
                                             setInputFilterNomeCliente(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}

                                    {column.id === 'DTSOL_TAREFA' && (
                                       <FiltrosHeaderTabelaTarefa
                                          value={inputFilterDtSolTarefa}
                                          onChange={value =>
                                             setInputFilterDtSolTarefa(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}
                                    {column.id === 'DTAPROV_TAREFA' && (
                                       <FiltrosHeaderTabelaTarefa
                                          value={inputFilterDtAprovTarefa}
                                          onChange={value =>
                                             setInputFilterDtAprovTarefa(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}
                                    {column.id === 'DTPREVENT_TAREFA' && (
                                       <FiltrosHeaderTabelaTarefa
                                          value={inputFilterDtPreventTarefa}
                                          onChange={value =>
                                             setInputFilterDtPreventTarefa(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}
                                    {column.id === 'HREST_TAREFA' && (
                                       <FiltrosHeaderTabelaTarefa
                                          value={inputFilterHrEstTarefa}
                                          onChange={value =>
                                             setInputFilterHrEstTarefa(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}
                                    {column.id === 'STATUS_TAREFA' && (
                                       <FiltrosHeaderTabelaTarefa
                                          value={inputFilterStatusTarefa}
                                          onChange={value =>
                                             setInputFilterStatusTarefa(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}
                                    {column.id === 'DTINC_TAREFA' && (
                                       <FiltrosHeaderTabelaTarefa
                                          value={inputFilterDtIncTarefa}
                                          onChange={value =>
                                             setInputFilterDtIncTarefa(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}
                                    {column.id === 'FATURA_TAREFA' && (
                                       <FiltrosHeaderTabelaTarefa
                                          value={inputFilterFaturaTarefa}
                                          onChange={value =>
                                             setInputFilterFaturaTarefa(
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
            {/* ==================== */}

            {/* PAGINAÇÃO */}
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
                              ? `de ${formatarCodNumber(paginationInfo.totalRecords)} encontrados no total.`
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
                                 de{' '}
                                 {formatarCodNumber(paginationInfo.totalPages)}
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
                                 className="text-black group-disabled:text-red-500"
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
               <section className="bg-black py-72 text-center">
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
                  <div className="flex flex-col items-center justify-center gap-4 bg-slate-900 py-72 text-center">
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
            title={`Buscando Tarefas para o período: ${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${ano}`}
         />
      </div>
   );
}
