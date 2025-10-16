'use client';
// ================================================================================
// IMPORTS
// ================================================================================
import {
   flexRender,
   SortingState,
   useReactTable,
   getCoreRowModel,
   getSortedRowModel,
} from '@tanstack/react-table';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, useCallback, useEffect, Suspense } from 'react';

// Components
import {
   FilterInputTableHeaderDebounce,
   FilterControls,
} from './filtros/Filtros_Header_Tabela_Chamado';
import { IsError } from '../../../../components/IsError';
import { IsLoading } from '../../../../components/IsLoading';
import { TabelaOS } from '../os/Tabela_OS';
import { SessionExpired } from '../../../../components/IsExpired';
import { TabelaTarefas } from '../tarefas/Tabela_Tarefa';
import { RelatorioOS } from '../os/Relatorio_OS';
import { colunasTabelaChamados } from './Colunas_Tabela_Chamado';
import { formatarCodNumber } from '../../../../utils/formatters';
import { DropdownTabelaChamado } from './Dropdown_Tabela_Chamado';
import { ModalExcluirChamado } from './modais/Modal_Deletar_Chamado';
import { ModalAtribuirChamado } from './modais/Modal_Atribuir_Chamado';
import { FiltrosTabelaChamado } from './filtros/Filtros_Tabela_Chamado';
import { ModalVisualizarChamado } from './modais/Modal_Visualizar_Chamado';

// Hooks & Types
import { useAuth } from '../../../../hooks/useAuth';
import { TabelaChamadoProps } from '../../../../types/types';
import { useFiltersTabelaChamado } from '../../../../contexts/Filters_Context_Tabela_Chamado';

// Icons
import { IoCall } from 'react-icons/io5';
import { FaFilterCircleXmark } from 'react-icons/fa6';
import { FaExclamationTriangle } from 'react-icons/fa';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { ModalPermitirRetroativoOsChamado } from './modais/Modal_Permitir_OS_Retroativa_Chamado';
import { TabelaProjeto } from '../projeto/Tabela_Projeto';

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
   data: TabelaChamadoProps[];
   pagination: PaginationInfo;
}

// ================================================================================
// FUNÇÕES UTILITÁRIAS
// ================================================================================
function getColumnWidth(columnId: string): string {
   const widthMap: Record<string, string> = {
      COD_CHAMADO: '7%',
      DATA_CHAMADO: '7%',
      ASSUNTO_CHAMADO: '24%',
      STATUS_CHAMADO: '16%',
      DTENVIO_CHAMADO: '10%',
      NOME_RECURSO: '12%',
      EMAIL_CHAMADO: '18%',
      actions: '6%',
   };
   return widthMap[columnId] || 'auto';
}

function useDebouncedValue<T>(value: T, delay: number = 500): T {
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
// COMPONENTE INTERNO COM SEARCH PARAMS
// ================================================================================
function TabelaChamadoContent() {
   // ================================================================================
   // HOOKS E CONTEXTOS
   // ================================================================================
   const router = useRouter();
   const searchParams = useSearchParams();
   const { user, loading: isAuthLoading, isTokenExpired } = useAuth();
   const queryClient = useQueryClient();
   const { filters, setFilters } = useFiltersTabelaChamado();
   const { ano, mes, dia } = filters;
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   // ================================================================================
   // ESTADOS - FILTROS (INPUTS SEM DEBOUNCE)
   // ================================================================================
   const [inputFilterCodChamado, setInputFilterCodChamado] = useState('');
   const [inputFilterDataChamado, setInputFilterDataChamado] = useState('');
   const [inputFilterAssunto, setInputFilterAssunto] = useState('');
   const [inputFilterStatus, setInputFilterStatus] = useState('');
   const [inputFilterDataEnvio, setInputFilterDataEnvio] = useState('');
   const [inputFilterNomeRecurso, setInputFilterNomeRecurso] = useState('');
   const [inputFilterEmail, setInputFilterEmail] = useState('');
   const [globalFilter, setGlobalFilter] = useState('');
   const [codChamadoFilter, setCodChamadoFilter] = useState('');

   // ESTADOS - FILTROS (COM DEBOUNCE)
   const filterCodChamado = useDebouncedValue(inputFilterCodChamado, 500);
   const filterDataChamado = useDebouncedValue(inputFilterDataChamado, 500);
   const filterAssunto = useDebouncedValue(inputFilterAssunto, 500);
   const filterStatus = useDebouncedValue(inputFilterStatus, 500);
   const filterDataEnvio = useDebouncedValue(inputFilterDataEnvio, 500);
   const filterNomeRecurso = useDebouncedValue(inputFilterNomeRecurso, 500);
   const filterEmail = useDebouncedValue(inputFilterEmail, 500);

   // ================================================================================
   // ESTADOS - PAGINAÇÃO
   // ================================================================================
   const [currentPage, setCurrentPage] = useState(1);
   const [pageSize, setPageSize] = useState(20);

   // ================================================================================
   // ESTADOS - TABELA
   // ================================================================================
   const [sorting, setSorting] = useState<SortingState>([
      { id: 'COD_CHAMADO', desc: true },
   ]);
   const [showFilters, setShowFilters] = useState(false);

   // Gerenciar activeView baseado em searchParams
   const activeView = searchParams.get('modal') as
      | 'chamados'
      | 'os'
      | 'tarefas'
      | 'relatorio'
      | 'projetos'
      | null;

   // ================================================================================
   // ESTADOS - MODAIS E COMPONENTES
   // ================================================================================
   const [openTabelaTarefa, setOpenTabelaTarefa] = useState(false);
   const [openTabelaOs, setOpenTabelaOs] = useState(false);
   const [openTabelaProjeto, setOpenTabelaProjeto] = useState(false);
   const [OpenModalVizualizarChamado, setOpenModalVizualizarChamado] =
      useState(false);
   const [openModalAtribuirChamado, setOpenModalAtribuirChamado] =
      useState(false);
   const [openModalPermitirOsRetroativa, setOpenModalPermitirOsRetroativa] =
      useState(false);
   const [selectedChamado, setSelectedChamado] =
      useState<TabelaChamadoProps | null>(null);
   const [selectedChamadoParaAtribuir, setSelectedChamadoParaAtribuir] =
      useState<TabelaChamadoProps | null>(null);
   const [selectedCodChamadoParaExcluir, setSelectedCodChamadoParaExcluir] =
      useState<number | null>(null);
   const [selectedChamadoParaRetroativa, setSelectedChamadoParaRetroativa] =
      useState<TabelaChamadoProps | null>(null);

   // ================================================================================
   // COMPUTED VALUES - FILTROS
   // ================================================================================
   const totalActiveFilters = useMemo(() => {
      let count = 0;
      if (globalFilter && globalFilter.trim()) count += 1;
      if (filterCodChamado && filterCodChamado.trim()) count += 1;
      if (filterDataChamado && filterDataChamado.trim()) count += 1;
      if (filterAssunto && filterAssunto.trim()) count += 1;
      if (filterStatus && filterStatus.trim()) count += 1;
      if (filterDataEnvio && filterDataEnvio.trim()) count += 1;
      if (filterNomeRecurso && filterNomeRecurso.trim()) count += 1;
      if (filterEmail && filterEmail.trim()) count += 1;
      if (codChamadoFilter && codChamadoFilter.trim()) count += 1;
      return count;
   }, [
      globalFilter,
      filterCodChamado,
      filterDataChamado,
      filterAssunto,
      filterStatus,
      filterDataEnvio,
      filterNomeRecurso,
      filterEmail,
      codChamadoFilter,
   ]);

   // ================================================================================
   // QUERY PARAMS E API
   // ================================================================================
   const enabled = !!ano && !!mes && !!token && !!user;

   const queryParams = useMemo(() => {
      if (!user) return new URLSearchParams();
      const params = new URLSearchParams({
         ano: String(ano),
         mes: String(mes),
         page: String(currentPage),
         limit: String(pageSize),
      });

      // ✅ ADICIONE O DIA AQUI
      if (dia !== 'todos') {
         params.append('dia', String(dia));
      }

      if (globalFilter && globalFilter.trim()) {
         params.append('globalFilter', globalFilter.trim());
      }
      if (filterCodChamado && filterCodChamado.trim()) {
         params.append('filter_COD_CHAMADO', filterCodChamado.trim());
      }
      if (filterDataChamado && filterDataChamado.trim()) {
         params.append('filter_DATA_CHAMADO', filterDataChamado.trim());
      }
      if (filterAssunto && filterAssunto.trim()) {
         params.append('filter_ASSUNTO_CHAMADO', filterAssunto.trim());
      }
      if (filterStatus && filterStatus.trim()) {
         params.append('filter_STATUS_CHAMADO', filterStatus.trim());
      }
      if (filterDataEnvio && filterDataEnvio.trim()) {
         params.append('filter_DTENVIO_CHAMADO', filterDataEnvio.trim());
      }
      if (filterNomeRecurso && filterNomeRecurso.trim()) {
         params.append('filter_NOME_RECURSO', filterNomeRecurso.trim());
      }
      if (filterEmail && filterEmail.trim()) {
         params.append('filter_EMAIL_RECURSO', filterEmail.trim());
      }
      if (codChamadoFilter && codChamadoFilter.trim()) {
         params.append('codChamado', codChamadoFilter.trim());
      }

      return params;
   }, [
      ano,
      mes,
      dia, // ✅ Adicione 'dia' aqui também
      user,
      currentPage,
      pageSize,
      globalFilter,
      filterCodChamado,
      filterDataChamado,
      filterAssunto,
      filterStatus,
      filterDataEnvio,
      filterNomeRecurso,
      filterEmail,
      codChamadoFilter,
   ]);

   async function fetchChamados(
      params: URLSearchParams,
      token: string
   ): Promise<ApiResponse> {
      const res = await fetch(`/api/chamado/tabela-chamado?${params}`, {
         headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
         },
      });

      if (!res.ok) {
         const errorData = await res.json();
         throw new Error(errorData.error || 'Erro ao buscar chamados');
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
      queryKey: ['chamadosAbertos', queryParams.toString(), token],
      queryFn: () => fetchChamados(queryParams, token!),
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
      filterCodChamado,
      filterDataChamado,
      filterAssunto,
      filterStatus,
      filterDataEnvio,
      filterNomeRecurso,
      filterEmail,
      globalFilter,
   ]);

   // ================================================================================
   // HANDLERS - NAVEGAÇÃO COM ROUTER
   // ================================================================================
   const handleOpenView = useCallback(
      (view: 'os' | 'tarefas' | 'relatorio' | 'projetos') => {
         router.push(`?modal=${view}`, { scroll: false });
      },
      [router]
   );

   const handleCloseView = useCallback(() => {
      router.push('?', { scroll: false });
   }, [router]);

   // ================================================================================
   // HANDLERS - FILTROS
   // ================================================================================
   const clearFilters = useCallback(() => {
      setGlobalFilter('');
      setInputFilterCodChamado('');
      setInputFilterDataChamado('');
      setInputFilterAssunto('');
      setInputFilterStatus('');
      setInputFilterDataEnvio('');
      setInputFilterNomeRecurso('');
      setInputFilterEmail('');
      setCodChamadoFilter('');
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
   // HANDLERS - MODAIS
   // ================================================================================
   const handleOpenModalVisualizarChamado = useCallback(
      (codChamado: number) => {
         const chamado = data?.find(c => c.COD_CHAMADO === codChamado);
         if (chamado) {
            setSelectedChamado(chamado);
            setOpenModalVizualizarChamado(true);
         }
      },
      [data]
   );
   // ==========
   const handleCloseModalVisualizarChamado = useCallback(() => {
      setOpenModalVizualizarChamado(false);
      setSelectedChamado(null);
   }, []);
   // ====================

   const handleOpenModalPermitirOsRetroativa = useCallback(
      (codChamado: number) => {
         const chamado = data?.find(c => c.COD_CHAMADO === codChamado);
         if (chamado) {
            setSelectedChamadoParaRetroativa(chamado);
            setOpenModalPermitirOsRetroativa(true);
         }
      },
      [data]
   );

   // ================================================================================
   // HANDLERS - MODAIS (ATRIBUIR CHAMADO)
   // ================================================================================
   const handleOpenModalAtribuirChamado = useCallback(
      (chamado: TabelaChamadoProps) => {
         setSelectedChamadoParaAtribuir(chamado);
         setOpenModalAtribuirChamado(true);
      },
      []
   );

   // ================================================================================
   // HANDLERS - MODAIS (EXCLUSÃO)
   // ================================================================================
   const handleOpenModalExcluirChamado = useCallback((codChamado: number) => {
      setSelectedCodChamadoParaExcluir(codChamado);
   }, []);

   const handleCloseModalExcluirChamado = useCallback(() => {
      setSelectedCodChamadoParaExcluir(null);
   }, []);

   const handleExcluirChamadoSuccess = useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['chamadosAbertos'] });

      if (currentPage > 1 && data.length === 1) {
         setCurrentPage(1);
      }

      handleCloseModalExcluirChamado();
   }, [queryClient, currentPage, data, handleCloseModalExcluirChamado]);

   // ================================================================================
   // HANDLERS - STATUS
   // ================================================================================
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

            queryClient.invalidateQueries({ queryKey: ['chamadosAbertos'] });

            return response.json();
         } catch (error) {
            console.error('Erro ao atualizar status:', error);
            throw error;
         }
      },
      [token, queryClient]
   );

   // ================================================================================
   // CONFIGURAÇÃO DA TABELA
   // ================================================================================
   const colunas = useMemo(
      () =>
         colunasTabelaChamados({
            onTabelaOS: () => setOpenTabelaOs(true),
            onTabelaTarefa: () => setOpenTabelaTarefa(true),
            onTabelaProjeto: () => setOpenTabelaProjeto(true),
            onVisualizarChamado: handleOpenModalVisualizarChamado,
            onAtribuirChamado: handleOpenModalAtribuirChamado,
            onExcluirChamado: handleOpenModalExcluirChamado,
            onPermitirRetroativa: handleOpenModalPermitirOsRetroativa,
         }),
      [
         handleOpenModalVisualizarChamado,
         handleOpenModalAtribuirChamado,
         handleOpenModalExcluirChamado,
         handleOpenModalPermitirOsRetroativa,
      ]
   );

   const table = useReactTable({
      data: data ?? [],
      columns: colunas,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      onGlobalFilterChange: setGlobalFilter,
      onSortingChange: setSorting,
      state: {
         globalFilter,
         sorting,
      },
      manualPagination: true,
      manualFiltering: true,
   });

   // ================================================================================
   // VALIDAÇÕES E ESTADOS DE CARREGAMENTO
   // ================================================================================
   if (isAuthLoading) {
      return <IsLoading isLoading={true} title="Verificando autenticação..." />;
   }

   if (isTokenExpired) {
      return <SessionExpired isTokenExpired={isTokenExpired} />;
   }

   if (isError) return <IsError error={error as Error} />;

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <div className="flex items-center justify-center">
         {/* VIEW DE CHAMADOS */}
         {(!activeView || activeView === 'chamados') && (
            <div className="animate-in slide-in-from-bottom-4 max-h-[100vh] w-full max-w-[95vw] overflow-hidden rounded-2xl shadow-md shadow-black transition-all duration-500 ease-out">
               {/* HEADER */}
               <header className="flex flex-col gap-6 bg-white/50 p-6">
                  {/* HEADER */}
                  <div className="flex items-center justify-between gap-8">
                     <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center justify-center rounded-lg bg-white/30 p-4 shadow-md shadow-black">
                           <IoCall className="text-black" size={28} />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-widest text-black uppercase select-none">
                           Chamados
                        </h1>
                     </div>

                     {user && user.tipo === 'ADM' && (
                        <div className="flex items-center gap-4">
                           <DropdownTabelaChamado
                              onOpenTabelaOS={() => handleOpenView('os')}
                              onOpenTabelaTarefa={() =>
                                 handleOpenView('tarefas')
                              }
                              onOpenTabelaProjeto={() =>
                                 handleOpenView('projetos')
                              }
                              onOpenRelatorioOS={() =>
                                 handleOpenView('relatorio')
                              }
                           />
                        </div>
                     )}
                  </div>

                  {/* FILTROS HEADER */}
                  <div className="flex items-center gap-6">
                     <div className="flex w-[800px] items-center">
                        <FiltrosTabelaChamado
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
                                          width: getColumnWidth(
                                             header.column.id
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

                           {/* FILTROS HEADER TABELA */}
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
                                       {column.id === 'COD_CHAMADO' && (
                                          <FilterInputTableHeaderDebounce
                                             value={inputFilterCodChamado}
                                             onChange={value =>
                                                setInputFilterCodChamado(
                                                   String(value)
                                                )
                                             }
                                          />
                                       )}
                                       {column.id === 'DATA_CHAMADO' && (
                                          <FilterInputTableHeaderDebounce
                                             value={inputFilterDataChamado}
                                             onChange={value =>
                                                setInputFilterDataChamado(
                                                   String(value)
                                                )
                                             }
                                             type="text"
                                          />
                                       )}
                                       {column.id === 'ASSUNTO_CHAMADO' && (
                                          <FilterInputTableHeaderDebounce
                                             value={inputFilterAssunto}
                                             onChange={value =>
                                                setInputFilterAssunto(
                                                   String(value)
                                                )
                                             }
                                          />
                                       )}
                                       {column.id === 'STATUS_CHAMADO' && (
                                          <FilterInputTableHeaderDebounce
                                             value={inputFilterStatus}
                                             onChange={value =>
                                                setInputFilterStatus(
                                                   String(value)
                                                )
                                             }
                                          />
                                       )}
                                       {column.id === 'DTENVIO_CHAMADO' && (
                                          <FilterInputTableHeaderDebounce
                                             value={inputFilterDataEnvio}
                                             onChange={value =>
                                                setInputFilterDataEnvio(
                                                   String(value)
                                                )
                                             }
                                          />
                                       )}
                                       {column.id === 'NOME_RECURSO' && (
                                          <FilterInputTableHeaderDebounce
                                             value={inputFilterNomeRecurso}
                                             onChange={value =>
                                                setInputFilterNomeRecurso(
                                                   String(value)
                                                )
                                             }
                                          />
                                       )}
                                       {column.id === 'EMAIL_CHAMADO' && (
                                          <FilterInputTableHeaderDebounce
                                             value={inputFilterEmail}
                                             onChange={value =>
                                                setInputFilterEmail(
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
                                             width: getColumnWidth(
                                                cell.column.id
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
                                 onClick={() =>
                                    handlePageChange(currentPage - 1)
                                 }
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
                                          handlePageChange(
                                             Number(e.target.value)
                                          )
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
                                    {formatarCodNumber(
                                       paginationInfo.totalPages
                                    )}
                                 </span>
                              </div>

                              <button
                                 onClick={() =>
                                    handlePageChange(currentPage + 1)
                                 }
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

               {/* MENSAGEM QUANDO NÃO HÁ CHAMADOS */}
               {(!paginationInfo || paginationInfo.totalRecords === 0) &&
                  !isLoading && (
                     <div className="flex flex-col items-center justify-center gap-4 bg-slate-900 py-64 text-center">
                        <FaExclamationTriangle
                           className="mx-auto text-yellow-500"
                           size={100}
                        />
                        <h3 className="text-3xl font-extrabold tracking-wider text-white italic select-none">
                           {`Nenhum Chamado foi encontrado para o período: ${mes.toString().padStart(2, '0')}/${ano}.`}
                        </h3>
                     </div>
                  )}

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
         )}

         {/* VIEW DROPDOWN DA TABELA DE OS */}
         {activeView === 'os' && (
            <TabelaOS isOpen={true} onClose={handleCloseView} />
         )}

         {/* VIEW DROPDOWN DA TABELA DE TAREFAS */}
         {activeView === 'tarefas' && (
            <TabelaTarefas isOpen={true} onClose={handleCloseView} />
         )}

         {/* VIEW DROPDOWN DO RELATÓRIO DE OS'S */}
         {activeView === 'relatorio' && (
            <RelatorioOS isOpen={true} onClose={handleCloseView} />
         )}

         {/* VIEW DROPDOWN DO RELATÓRIO DE PROJETOS */}
         {activeView === 'projetos' && (
            <TabelaProjeto isOpen={true} onClose={handleCloseView} />
         )}

         {/* TABELA OS */}
         <TabelaOS
            isOpen={openTabelaOs}
            onClose={() => setOpenTabelaOs(false)}
         />

         {/* TABELA TAREFAS */}
         <TabelaTarefas
            isOpen={openTabelaTarefa}
            onClose={() => setOpenTabelaTarefa(false)}
         />

         {/* TABELA PROJETOS */}
         <TabelaProjeto
            isOpen={openTabelaProjeto}
            onClose={() => setOpenTabelaProjeto(false)}
         />

         {/* MODAL VISUALIZAR CHAMADO */}
         <ModalVisualizarChamado
            isOpen={OpenModalVizualizarChamado}
            onClose={handleCloseModalVisualizarChamado}
            chamado={selectedChamado}
         />

         {/* MODAL ATRIBUIR CHAMADO */}
         <ModalAtribuirChamado
            isOpen={openModalAtribuirChamado}
            onClose={() => setOpenModalAtribuirChamado(false)}
            chamado={selectedChamadoParaAtribuir}
         />

         {/* MODAL EXCLUIR CHAMADO */}
         <ModalExcluirChamado
            isOpen={!!selectedCodChamadoParaExcluir}
            onClose={handleCloseModalExcluirChamado}
            codChamado={selectedCodChamadoParaExcluir}
            onSuccess={handleExcluirChamadoSuccess}
         />

         {/* MODAL PERMITIR OS RETROATIVA */}
         <ModalPermitirRetroativoOsChamado
            isOpen={openModalPermitirOsRetroativa}
            onClose={() => setOpenModalPermitirOsRetroativa(false)}
            chamadoId={
               selectedChamadoParaRetroativa
                  ? String(selectedChamadoParaRetroativa.COD_CHAMADO)
                  : ''
            }
            currentUserId={''}
         />

         {/* LOADING */}
         <IsLoading
            isLoading={isLoading}
            title={`Buscando Chamados para o período: ${mes.toString().padStart(2, '0')}/${ano}`}
         />
      </div>
   );
}

// ================================================================================
// COMPONENTE PRINCIPAL COM SUSPENSE
// ================================================================================
export function TabelaChamado() {
   return (
      <Suspense
         fallback={
            <IsLoading
               isLoading={true}
               title="Carregando tabela de chamados..."
            />
         }
      >
         <TabelaChamadoContent />
      </Suspense>
   );
}
