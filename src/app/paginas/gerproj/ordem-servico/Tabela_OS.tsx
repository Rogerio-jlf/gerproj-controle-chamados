'use client';
// ================================================================================
// IMPORTS
// ================================================================================
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback, useEffect } from 'react';
import {
   flexRender,
   SortingState,
   useReactTable,
   getCoreRowModel,
   getSortedRowModel,
} from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';

// Components
import {
   FiltrosHeaderTabelaOs,
   FilterControls,
} from './Filtros_Header_Tabela_OS';
import { IsError } from '../components/IsError';
import { IsLoading } from '../components/IsLoading';
import { FiltrosTabelaOS } from './Filtros_Tabela_OS';
import { colunasTabelaOS } from './Colunas_Tabela_OS';

// Hooks & Types
import { useAuth } from '../../../../hooks/useAuth';
import { TabelaOSProps } from '../../../../types/types';
import { useFiltersTabelaOs } from '../../../../contexts/Filters_Context_Dia';

// Icons
import { GrServices } from 'react-icons/gr';
import { FaExclamationTriangle } from 'react-icons/fa';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';
import {
   MensagemFiltroNaoEncontrado,
   MensagemDadosSemPeriodo,
} from './Mensagens_Filtros';
import { RelatorioOS } from './Relatorio_OS';
import { HiDocumentReport } from 'react-icons/hi';

// ================================================================================
// TIPOS E INTERFACES
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
   data: TabelaOSProps[];
   pagination: PaginationInfo;
}

interface Props {
   isOpen?: boolean;
   onClose: () => void;
}

// ================================================================================
// FUNÇÕES UTILITÁRIAS
// ================================================================================
function getColumnWidth(columnId: string, userType?: string): string {
   if (userType === 'ADM') {
      const widthMapAdmin: Record<string, string> = {
         CHAMADO_OS: '5%',
         COD_OS: '5%',
         DTINI_OS: '6%',
         HRINI_OS: '4%',
         HRFIM_OS: '4%',
         QTD_HR_OS: '4%',
         DTINC_OS: '8%',
         COMP_OS: '5%',
         NOME_CLIENTE: '10%',
         FATURADO_OS: '4%',
         NOME_RECURSO: '11%',
         VALID_OS: '4%',
         TAREFA_COMPLETA: '15%',
         PROJETO_COMPLETO: '15%',
      };
      return widthMapAdmin[columnId] || 'auto';
   }

   const widthMap: Record<string, string> = {
      COD_OS: '10%',
      DTINI_OS: '12%',
      HRINI_OS: '10%',
      HRFIM_OS: '10%',
      NOME_RECURSO: '20%',
      DTINC_OS: '12%',
      FATURADO_OS: '12%',
      COMP_OS: '10%',
      VALID_OS: '10%',
      CHAMADO_OS: '12%',
      actions: '8%',
   };

   return widthMap[columnId] || 'auto';
}

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
export function TabelaOS({ isOpen = true, onClose }: Props) {
   // ================================================================================
   // HOOKS E CONTEXTOS
   // ================================================================================
   const { user } = useAuth();
   const queryClient = useQueryClient();
   const { filters, setFilters } = useFiltersTabelaOs();
   const { ano, mes, dia } = filters;
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   // ================================================================================
   // ESTADOS - FILTROS (INPUTS SEM DEBOUNCE)
   // ================================================================================
   const [inputFilterChamadoOs, setInputFilterChamadoOs] = useState('');
   const [inputFilterCodOs, setInputFilterCodOs] = useState('');
   const [inputFilterDtiniOs, setInputFilterDtiniOs] = useState('');
   const [inputFilterDtincOs, setInputFilterDtincOs] = useState('');
   const [inputFilterCompOs, setInputFilterCompOs] = useState('');
   const [inputFilterNomeCliente, setInputFilterNomeCliente] = useState('');
   const [inputFilterFaturadoOs, setInputFilterFaturadoOs] = useState('');
   const [inputFilterNomeRecurso, setInputFilterNomeRecurso] = useState('');
   const [inputFilterValidOs, setInputFilterValidOs] = useState('');
   const [inputFilterTarefaCompleta, setInputFilterTarefaCompleta] =
      useState('');
   const [inputFilterProjetoCompleto, setInputFilterProjetoCompleto] =
      useState('');

   // ESTADOS - FILTROS (COM DEBOUNCE)
   const filterChamadoOs = useDebouncedValue(inputFilterChamadoOs, 800);
   const filterCodOs = useDebouncedValue(inputFilterCodOs, 800);
   const filterDtiniOs = useDebouncedValue(inputFilterDtiniOs, 800);
   const filterDtincOs = useDebouncedValue(inputFilterDtincOs, 800);
   const filterCompOs = useDebouncedValue(inputFilterCompOs, 800);
   const filterNomeCliente = useDebouncedValue(inputFilterNomeCliente, 800);
   const filterFaturadoOs = useDebouncedValue(inputFilterFaturadoOs, 800);
   const filterNomeRecurso = useDebouncedValue(inputFilterNomeRecurso, 800);
   const filterValidOs = useDebouncedValue(inputFilterValidOs, 800);
   const filterTarefaCompleta = useDebouncedValue(
      inputFilterTarefaCompleta,
      800
   );
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
      { id: 'COD_OS', desc: true },
   ]);
   const [showFilters, setShowFilters] = useState(false);

   const [showRelatorio, setShowRelatorio] = useState(false);

   // ================================================================================
   // COMPUTED VALUES - FILTROS
   // ================================================================================
   const totalActiveFilters = useMemo(() => {
      let count = 0;
      if (filterChamadoOs && filterChamadoOs.trim()) count += 1;
      if (filterCodOs && filterCodOs.trim()) count += 1;
      if (filterDtiniOs && filterDtiniOs.trim()) count += 1;
      if (filterDtincOs && filterDtincOs.trim()) count += 1;
      if (filterCompOs && filterCompOs.trim()) count += 1;
      if (filterNomeCliente && filterNomeCliente.trim()) count += 1;
      if (filterFaturadoOs && filterFaturadoOs.trim()) count += 1;
      if (filterNomeRecurso && filterNomeRecurso.trim()) count += 1;
      if (filterValidOs && filterValidOs.trim()) count += 1;
      if (filterTarefaCompleta && filterTarefaCompleta.trim()) count += 1;
      if (filterProjetoCompleto && filterProjetoCompleto.trim()) count += 1;
      return count;
   }, [
      filterChamadoOs,
      filterCodOs,
      filterDtiniOs,
      filterDtincOs,
      filterCompOs,
      filterNomeCliente,
      filterFaturadoOs,
      filterNomeRecurso,
      filterValidOs,
      filterTarefaCompleta,
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

      if (filterChamadoOs && filterChamadoOs.trim()) {
         params.append('filter_CHAMADO_OS', filterChamadoOs.trim());
      }
      if (filterCodOs && filterCodOs.trim()) {
         params.append('filter_COD_OS', filterCodOs.trim());
      }
      if (filterDtiniOs && filterDtiniOs.trim()) {
         params.append('filter_DTINI_OS', filterDtiniOs.trim());
      }
      if (filterDtincOs && filterDtincOs.trim()) {
         params.append('filter_DTINC_OS', filterDtincOs.trim());
      }
      if (filterCompOs && filterCompOs.trim()) {
         params.append('filter_COMP_OS', filterCompOs.trim());
      }
      if (filterNomeCliente && filterNomeCliente.trim()) {
         params.append('filter_NOME_CLIENTE', filterNomeCliente.trim());
      }
      if (filterFaturadoOs && filterFaturadoOs.trim()) {
         params.append('filter_FATURADO_OS', filterFaturadoOs.trim());
      }
      if (filterNomeRecurso && filterNomeRecurso.trim()) {
         params.append('filter_NOME_RECURSO', filterNomeRecurso.trim());
      }
      if (filterValidOs && filterValidOs.trim()) {
         params.append('filter_VALID_OS', filterValidOs.trim());
      }
      if (filterTarefaCompleta && filterTarefaCompleta.trim()) {
         params.append('filter_NOME_TAREFA', filterTarefaCompleta.trim());
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
      filterChamadoOs,
      filterCodOs,
      filterDtiniOs,
      filterDtincOs,
      filterCompOs,
      filterNomeCliente,
      filterFaturadoOs,
      filterNomeRecurso,
      filterValidOs,
      filterTarefaCompleta,
      filterProjetoCompleto,
   ]);

   async function fetchOS(
      params: URLSearchParams,
      token: string
   ): Promise<ApiResponse> {
      const res = await fetch(`/api/OS?${params}`, {
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
      queryKey: ['osData', queryParams.toString(), token],
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
      filterChamadoOs,
      filterCodOs,
      filterDtiniOs,
      filterDtincOs,
      filterCompOs,
      filterNomeCliente,
      filterFaturadoOs,
      filterNomeRecurso,
      filterValidOs,
      filterTarefaCompleta,
      filterProjetoCompleto,
   ]);

   // ================================================================================
   // HANDLERS - FILTROS
   // ================================================================================
   const clearFilters = useCallback(() => {
      setInputFilterChamadoOs('');
      setInputFilterCodOs('');
      setInputFilterDtiniOs('');
      setInputFilterDtincOs('');
      setInputFilterCompOs('');
      setInputFilterNomeCliente('');
      setInputFilterFaturadoOs('');
      setInputFilterNomeRecurso('');
      setInputFilterValidOs('');
      setInputFilterTarefaCompleta('');
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

   const handleUpdateField = useCallback(
      async (codOs: number, field: string, value: any) => {
         if (!token) {
            throw new Error('Token não disponível');
         }

         const response = await fetch('/api/OS/update', {
            method: 'PATCH',
            headers: {
               Authorization: `Bearer ${token}`,
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               codOs,
               field,
               value,
            }),
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao atualizar campo');
         }

         // Invalida o cache para recarregar os dados
         queryClient.invalidateQueries({ queryKey: ['osData'] });

         return response.json();
      },
      [token, queryClient]
   );

   const handleOpenRelatorioOS = useCallback(() => {
      setShowRelatorio(true);
   }, []);

   const handleCloseRelatorioOS = useCallback(() => {
      setShowRelatorio(false);
   }, []);

   // ================================================================================
   // CONFIGURAÇÃO DA TABELA
   // ================================================================================
   const colunas = useMemo(
      () => colunasTabelaOS({ handleUpdateField }),
      [handleUpdateField]
   );

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

   if (!isOpen) return null;

   if (isError) return <IsError error={error as Error} />;

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
         <div className="absolute inset-0 bg-black/10 backdrop-blur-3xl" />

         {/* MODAL */}
         <div className="animate-in slide-in-from-bottom-4 relative z-10 mx-4 max-h-[100vh] w-full max-w-[95vw] overflow-hidden rounded-2xl shadow-md shadow-black transition-all duration-500 ease-out">
            {/* ===== HEADER ===== */}
            <header className="flex flex-col gap-6 bg-white/50 p-6">
               {/* HEADER */}
               <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center justify-center gap-6">
                     <div className="flex items-center justify-center rounded-lg bg-white/30 p-4 shadow-md shadow-black">
                        <GrServices className="text-black" size={28} />
                     </div>
                     <h1 className="text-4xl font-extrabold tracking-widest text-black uppercase select-none">
                        Ordens de Serviço
                     </h1>
                  </div>

                  <button
                     onClick={handleCloseTabelaTarefa}
                     className="group cursor-pointer rounded-full bg-red-500/50 p-3 text-white shadow-md shadow-black transition-all select-none hover:scale-125 hover:bg-red-500 active:scale-95"
                  >
                     <IoClose size={24} />
                  </button>
               </div>
               {/* FILTROS HEADER */}
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                     <div className="flex w-[800px] items-center">
                        <FiltrosTabelaOS
                           onFiltersChange={handleFiltersChange}
                        />
                     </div>
                     <div className="flex items-center gap-3">
                        <FilterControls
                           showFilters={showFilters}
                           setShowFilters={setShowFilters}
                           totalActiveFilters={totalActiveFilters}
                           clearFilters={clearFilters}
                           dataLength={paginationInfo?.totalRecords || 0}
                        />
                     </div>
                  </div>
                  {/* BOTÃO PARA ABRIR O RELATÓRIO */}
                  <button
                     onClick={handleOpenRelatorioOS}
                     className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3 shadow-md shadow-black transition-all hover:scale-105 hover:from-purple-700 hover:to-purple-800 active:scale-95"
                  >
                     <HiDocumentReport className="text-white" size={24} />
                     <span className="text-base font-bold tracking-wider text-white uppercase select-none">
                        Relatório
                     </span>
                  </button>
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
                                    className="bg-teal-700 py-6 font-extrabold tracking-wider text-white uppercase select-none"
                                    style={{
                                       width: getColumnWidth(
                                          header.column.id,
                                          user?.tipo
                                       ),
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

                        {/* FILTROS TABELA */}
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
                                    {column.id === 'CHAMADO_OS' && (
                                       <FiltrosHeaderTabelaOs
                                          value={inputFilterChamadoOs}
                                          onChange={value =>
                                             setInputFilterChamadoOs(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}
                                    {/* ===== */}
                                    {column.id === 'COD_OS' && (
                                       <FiltrosHeaderTabelaOs
                                          value={inputFilterCodOs}
                                          onChange={value =>
                                             setInputFilterCodOs(String(value))
                                          }
                                       />
                                    )}
                                    {/* ===== */}
                                    {column.id === 'DTINI_OS' && (
                                       <FiltrosHeaderTabelaOs
                                          value={inputFilterDtiniOs}
                                          onChange={value =>
                                             setInputFilterDtiniOs(
                                                String(value)
                                             )
                                          }
                                          type="text"
                                       />
                                    )}
                                    {/* ===== */}
                                    {column.id === 'DTINC_OS' && (
                                       <FiltrosHeaderTabelaOs
                                          value={inputFilterDtincOs}
                                          onChange={value =>
                                             setInputFilterDtincOs(
                                                String(value)
                                             )
                                          }
                                          type="text"
                                       />
                                    )}
                                    {/* ===== */}
                                    {column.id === 'COMP_OS' && (
                                       <FiltrosHeaderTabelaOs
                                          value={inputFilterCompOs}
                                          onChange={value =>
                                             setInputFilterCompOs(String(value))
                                          }
                                       />
                                    )}
                                    {/* ===== */}
                                    {column.id === 'NOME_CLIENTE' && (
                                       <FiltrosHeaderTabelaOs
                                          value={inputFilterNomeCliente}
                                          onChange={value =>
                                             setInputFilterNomeCliente(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}
                                    {/* ===== */}
                                    {column.id === 'FATURADO_OS' && (
                                       <FiltrosHeaderTabelaOs
                                          value={inputFilterFaturadoOs}
                                          onChange={value =>
                                             setInputFilterFaturadoOs(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}
                                    {/* ===== */}
                                    {column.id === 'NOME_RECURSO' && (
                                       <FiltrosHeaderTabelaOs
                                          value={inputFilterNomeRecurso}
                                          onChange={value =>
                                             setInputFilterNomeRecurso(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}
                                    {/* ===== */}
                                    {column.id === 'VALID_OS' && (
                                       <FiltrosHeaderTabelaOs
                                          value={inputFilterValidOs}
                                          onChange={value =>
                                             setInputFilterValidOs(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}
                                    {/* ===== */}
                                    {column.id === 'TAREFA_COMPLETA' && (
                                       <FiltrosHeaderTabelaOs
                                          value={inputFilterTarefaCompleta}
                                          onChange={value =>
                                             setInputFilterTarefaCompleta(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}
                                    {/* ===== */}
                                    {column.id === 'PROJETO_COMPLETO' && (
                                       <FiltrosHeaderTabelaOs
                                          value={inputFilterProjetoCompleto}
                                          onChange={value =>
                                             setInputFilterProjetoCompleto(
                                                String(value)
                                             )
                                          }
                                       />
                                    )}
                                    {/* ===== */}
                                 </th>
                              ))}
                           </tr>
                        )}
                     </thead>

                     {/* CORPO DA TABELA */}
                     <tbody>
                        {table.getRowModel().rows.length > 0 &&
                           !isLoading &&
                           table.getRowModel().rows.map((row, rowIndex) => (
                              <tr
                                 key={row.id}
                                 className={`group border-b border-slate-500 transition-all hover:bg-amber-200 ${
                                    rowIndex % 2 === 0
                                       ? 'bg-white/10'
                                       : 'bg-white/10'
                                 }`}
                              >
                                 {row.getVisibleCells().map(cell => (
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
                              className="cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 text-base font-semibold tracking-widest text-black italic shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none"
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
                              className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              <FiChevronsLeft
                                 className="text-black group-disabled:text-red-400"
                                 size={24}
                              />
                           </button>

                           <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={!paginationInfo.hasPrevPage}
                              className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              <MdChevronLeft
                                 className="text-black group-disabled:text-red-400"
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
                                    className="cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 text-base font-semibold tracking-widest text-black italic shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none"
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
                              className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              <MdChevronRight
                                 className="text-black group-disabled:text-red-400"
                                 size={24}
                              />
                           </button>

                           <button
                              onClick={() =>
                                 handlePageChange(paginationInfo.totalPages)
                              }
                              disabled={!paginationInfo.hasNextPage}
                              className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              <FiChevronsRight
                                 className="text-black group-disabled:text-red-400"
                                 size={24}
                              />
                           </button>
                        </div>
                     </section>
                  </div>
               </div>
            )}
            {/* MENSAGEM QUANDO NÃO HÁ OS NO PERÍODO (sem filtros de tabela) */}
            {(!paginationInfo || paginationInfo.totalRecords === 0) &&
               !isLoading &&
               totalActiveFilters === 0 && (
                  <MensagemDadosSemPeriodo ano={ano} mes={mes} dia={dia} />
               )}
            {/* MENSAGEM QUANDO OS FILTROS DA TABELA NÃO RETORNAM RESULTADOS */}
            {paginationInfo &&
               paginationInfo.totalRecords === 0 &&
               !isLoading &&
               totalActiveFilters > 0 && (
                  <MensagemFiltroNaoEncontrado
                     filters={{
                        filterChamadoOs,
                        filterCodOs,
                        filterDtiniOs,
                        filterDtincOs,
                        filterCompOs,
                        filterNomeCliente,
                        filterFaturadoOs,
                        filterNomeRecurso,
                        filterValidOs,
                        filterTarefaCompleta,
                        filterProjetoCompleto,
                     }}
                     clearFilters={clearFilters}
                     ano={ano}
                     mes={mes}
                     dia={dia}
                  />
               )}{' '}
         </div>

         {/* MODAL DO RELATÓRIO */}
         {showRelatorio && (
            <RelatorioOS
               isOpen={showRelatorio}
               onClose={handleCloseRelatorioOS}
            />
         )}

         <IsLoading
            isLoading={isLoading}
            title="Carregando todos os dados dos Chamados"
         />
      </div>
   );
}
