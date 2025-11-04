'use client';

import {
   flexRender,
   getCoreRowModel,
   useReactTable,
   getSortedRowModel,
   SortingState,
} from '@tanstack/react-table';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { FiltrosHeaderTabelaChamado } from './Filtro_Header_Tabela';
import { IsError } from '../../../../components/IsError';
import { IsLoading } from '../../../../components/IsLoading';
import { SessionExpired } from '../../../../components/IsExpired';
import { colunasTabelaChamados } from './Coluna_Tabela';
import { FiltrosTabelaChamado } from './Filtro_Tabela';
import { DropdownMenuTabelaChamado } from './Dropdown_Menu';
import { ModalVisualizarChamado } from './modais/Modal_Visualizar_Chamado';
import { ModalAtribuirChamado } from './modais/Modal_Atribuir_Chamado';
import { ModalExcluirChamado } from './modais/Modal_Deletar_Chamado';
import { ModalPermitirRetroativoOsChamado } from './modais/Modal_Permitir_OS_Retroativa_Chamado';
import { TabelaOS } from '../os/tabelas/tabela/Tabela_OS';
import { TabelaTarefas } from '../tarefas/Tabela_Tarefa';
import { TabelaProjeto } from '../projeto/Tabela_Projeto';
import { ModalRelatorioOS } from '../os/relatorios/modal/Modal_Relatorio_OS';
import { formatarCodNumber } from '../../../../utils/formatters';
import { useAuth } from '../../../../hooks/useAuth';
import { useFiltersTabelaChamado } from '../../../../contexts/Filters_Context_Tabela_Chamado';
import { TabelaChamadoProps } from '../../../../types/types';

import { IoCall } from 'react-icons/io5';
import { FaFilterCircleXmark } from 'react-icons/fa6';
import { FaEraser, FaExclamationTriangle } from 'react-icons/fa';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

// ================================================================================
// CONSTANTES
// ================================================================================
const CONFIG = {
   MODAL_MAX_HEIGHT: 'calc(100vh - 524px)',
   DEBOUNCE_DELAY: 600,
   ANIMATION_DURATION: 100,
   CACHE_TIME: 1000 * 60 * 5,
   PAGE_SIZE_OPTIONS: [20, 50, 100],
   DEFAULT_PAGE_SIZE: 20,
} as const;

const COLUMN_WIDTHS: Record<string, string> = {
   COD_CHAMADO: '6%',
   DATA_CHAMADO: '10%',
   HORA_CHAMADO: '6%',
   ASSUNTO_CHAMADO: '20%',
   STATUS_CHAMADO: '12%',
   DTENVIO_CHAMADO: '10%',
   NOME_RECURSO: '10%',
   NOME_CLIENTE: '10%',
   EMAIL_CHAMADO: '11%',
   actions: '5%',
};

const FILTER_KEYS = [
   'COD_CHAMADO',
   'DATA_CHAMADO',
   'ASSUNTO_CHAMADO',
   'STATUS_CHAMADO',
   'DTENVIO_CHAMADO',
   'NOME_RECURSO',
   'NOME_CLIENTE',
   'EMAIL_CHAMADO',
] as const;

type FilterKey = (typeof FILTER_KEYS)[number];

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
// HOOKS CUSTOMIZADOS
// ================================================================================
function useDebouncedValue<T>(
   value: T,
   delay: number = CONFIG.DEBOUNCE_DELAY
): T {
   const [debouncedValue, setDebouncedValue] = useState<T>(value);

   useEffect(() => {
      const timer = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(timer);
   }, [value, delay]);

   return debouncedValue;
}

function useFilters() {
   const [filters, setFilters] = useState<Record<FilterKey, string>>(
      Object.fromEntries(FILTER_KEYS.map(key => [key, ''])) as Record<
         FilterKey,
         string
      >
   );

   // Debounce cada filtro individualmente
   const debouncedCOD_CHAMADO = useDebouncedValue(filters.COD_CHAMADO);
   const debouncedDATA_CHAMADO = useDebouncedValue(filters.DATA_CHAMADO);
   const debouncedASSUNTO_CHAMADO = useDebouncedValue(filters.ASSUNTO_CHAMADO);
   const debouncedSTATUS_CHAMADO = useDebouncedValue(filters.STATUS_CHAMADO);
   const debouncedDTENVIO_CHAMADO = useDebouncedValue(filters.DTENVIO_CHAMADO);
   const debouncedNOME_RECURSO = useDebouncedValue(filters.NOME_RECURSO);
   const debouncedNOME_CLIENTE = useDebouncedValue(filters.NOME_CLIENTE);
   const debouncedEMAIL_CHAMADO = useDebouncedValue(filters.EMAIL_CHAMADO);

   const debouncedFilters = useMemo(
      () => ({
         COD_CHAMADO: debouncedCOD_CHAMADO,
         DATA_CHAMADO: debouncedDATA_CHAMADO,
         ASSUNTO_CHAMADO: debouncedASSUNTO_CHAMADO,
         STATUS_CHAMADO: debouncedSTATUS_CHAMADO,
         DTENVIO_CHAMADO: debouncedDTENVIO_CHAMADO,
         NOME_RECURSO: debouncedNOME_RECURSO,
         NOME_CLIENTE: debouncedNOME_CLIENTE,
         EMAIL_CHAMADO: debouncedEMAIL_CHAMADO,
      }),
      [
         debouncedCOD_CHAMADO,
         debouncedDATA_CHAMADO,
         debouncedASSUNTO_CHAMADO,
         debouncedSTATUS_CHAMADO,
         debouncedDTENVIO_CHAMADO,
         debouncedNOME_RECURSO,
         debouncedNOME_CLIENTE,
         debouncedEMAIL_CHAMADO,
      ]
   );

   const setFilter = useCallback((key: FilterKey, value: string) => {
      setFilters(prev => ({ ...prev, [key]: value }));
   }, []);

   const clearAllFilters = useCallback(() => {
      setFilters(
         Object.fromEntries(FILTER_KEYS.map(key => [key, ''])) as Record<
            FilterKey,
            string
         >
      );
   }, []);

   const activeFilterCount = useMemo(
      () => Object.values(debouncedFilters).filter(f => f?.trim()).length,
      [debouncedFilters]
   );

   return {
      filters,
      debouncedFilters,
      setFilter,
      clearAllFilters,
      activeFilterCount,
   };
}

// ================================================================================
// COMPONENTES AUXILIARES
// ================================================================================
const EmptyState = ({
   ano,
   mes,
   dia,
}: {
   ano: number | 'todos';
   mes: number | 'todos';
   dia: number | 'todos';
}) => (
   <section className="bg-black py-56 text-center">
      <FaExclamationTriangle
         className="mx-auto mb-6 text-yellow-500"
         size={80}
      />
      <h3 className="text-2xl font-bold tracking-widest text-white italic select-none">
         {`Nenhum Chamado foi encontrado para o período: ${[
            dia === 'todos' ? '' : String(dia).padStart(2, '0'),
            mes === 'todos' ? '' : String(mes).padStart(2, '0'),
            ano === 'todos' ? '' : String(ano),
         ]
            .filter(part => part !== '')
            .join('/')}`}
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

const PaginationControls = ({
   paginationInfo,
   currentPage,
   pageSize,
   onPageChange,
   onPageSizeChange,
   totalRows,
}: {
   paginationInfo: PaginationInfo;
   currentPage: number;
   pageSize: number;
   onPageChange: (page: number) => void;
   onPageSizeChange: (size: number) => void;
   totalRows: number;
}) => (
   <div className="bg-white/70 px-12 py-4">
      <div className="flex items-center justify-between">
         <section className="flex items-center gap-4">
            <span className="text-lg font-extrabold tracking-widest text-black italic select-none">
               {totalRows} registro{totalRows !== 1 ? 's' : ''} na página atual,
            </span>
            <span className="text-lg font-extrabold tracking-widest text-black italic select-none">
               {paginationInfo.totalRecords > 1
                  ? `de ${formatarCodNumber(paginationInfo.totalRecords)} encontrados no total`
                  : 'de 1 encontrado no total'}
            </span>
         </section>

         <section className="flex items-center gap-3">
            <div className="flex items-center gap-2">
               <span className="text-lg font-semibold tracking-widest text-black italic select-none">
                  Itens por página:
               </span>
               <select
                  value={pageSize}
                  onChange={e => onPageSizeChange(Number(e.target.value))}
                  title="Selecionar quantidade registros"
                  className="cursor-pointer rounded-md border-t border-slate-400 px-4 py-1 text-base font-semibold tracking-widest text-black italic shadow-md shadow-black transition-all hover:shadow-xl hover:shadow-black focus:ring-4 focus:ring-pink-600 focus:outline-none active:scale-95"
               >
                  {CONFIG.PAGE_SIZE_OPTIONS.map(size => (
                     <option
                        key={size}
                        value={size}
                        className="bg-white font-semibold tracking-widest"
                     >
                        {size}
                     </option>
                  ))}
               </select>
            </div>

            <div className="flex items-center gap-3">
               <button
                  onClick={() => onPageChange(1)}
                  title="Primeira página"
                  disabled={!paginationInfo.hasPrevPage}
                  aria-label="Ir para primeira página"
                  className="group cursor-pointer rounded-md border-t border-slate-400 px-4 py-1 shadow-md shadow-black transition-all hover:shadow-xl hover:shadow-black focus:ring-4 focus:ring-pink-600 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  <FiChevronsLeft
                     className="text-black group-disabled:text-red-500"
                     size={24}
                  />
               </button>

               <button
                  onClick={() => onPageChange(currentPage - 1)}
                  title="Página anterior"
                  disabled={!paginationInfo.hasPrevPage}
                  aria-label="Página anterior"
                  className="group cursor-pointer rounded-md border-t border-slate-400 px-4 py-1 shadow-md shadow-black transition-all hover:shadow-xl hover:shadow-black focus:ring-4 focus:ring-pink-600 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  <MdChevronLeft
                     className="text-black group-disabled:text-red-500"
                     size={24}
                  />
               </button>

               <div className="flex items-center justify-center gap-2">
                  <span className="text-lg font-semibold tracking-widest text-black italic select-none">
                     Página{' '}
                     <select
                        value={currentPage}
                        onChange={e => onPageChange(Number(e.target.value))}
                        title="Selecionar página"
                        aria-label="Selecionar página"
                        className="cursor-pointer rounded-md border-t border-slate-400 px-4 py-1 text-base font-semibold tracking-widest text-black italic shadow-md shadow-black transition-all hover:shadow-xl hover:shadow-black focus:ring-4 focus:ring-pink-600 focus:outline-none active:scale-95"
                     >
                        {Array.from(
                           { length: paginationInfo.totalPages },
                           (_, i) => (
                              <option
                                 key={i + 1}
                                 value={i + 1}
                                 className="bg-white font-semibold tracking-widest"
                              >
                                 {i + 1}
                              </option>
                           )
                        )}
                     </select>
                  </span>
                  <span className="text-lg font-semibold tracking-widest text-black italic select-none">
                     de {formatarCodNumber(paginationInfo.totalPages)}
                  </span>
               </div>

               <button
                  onClick={() => onPageChange(currentPage + 1)}
                  title="Próxima página"
                  disabled={!paginationInfo.hasNextPage}
                  aria-label="Próxima página"
                  className="group cursor-pointer rounded-md border-t border-slate-400 px-4 py-1 shadow-md shadow-black transition-all hover:shadow-xl hover:shadow-black focus:ring-4 focus:ring-pink-600 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  <MdChevronRight
                     className="text-black group-disabled:text-red-500"
                     size={24}
                  />
               </button>

               <button
                  onClick={() => onPageChange(paginationInfo.totalPages)}
                  title="Última página"
                  disabled={!paginationInfo.hasNextPage}
                  aria-label="Ir para última página"
                  className="group cursor-pointer rounded-md border-t border-slate-400 px-4 py-1 shadow-md shadow-black transition-all hover:shadow-xl hover:shadow-black focus:ring-4 focus:ring-pink-600 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
);

// ================================================================================
// COMPONENTE INTERNO
// ================================================================================
function TabelaChamadoContent() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const queryClient = useQueryClient();
   const { user, loading: isAuthLoading, isTokenExpired } = useAuth();
   const { filters: dateFilters, setFilters: setDateFilters } =
      useFiltersTabelaChamado();
   const { ano, mes, dia } = dateFilters;

   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   const [currentPage, setCurrentPage] = useState<number>(1);
   const [pageSize, setPageSize] = useState<number>(CONFIG.DEFAULT_PAGE_SIZE);
   const [sorting, setSorting] = useState<SortingState>([
      { id: 'COD_CHAMADO', desc: true },
   ]);
   const [showFilters, setShowFilters] = useState<boolean>(false);

   const activeView = searchParams.get('modal') as
      | 'chamados'
      | 'os'
      | 'tarefas'
      | 'relatorio'
      | 'projetos'
      | null;

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

   const {
      filters,
      debouncedFilters,
      setFilter,
      clearAllFilters,
      activeFilterCount,
   } = useFilters();

   // Reset page quando filtros mudarem
   useEffect(() => {
      setCurrentPage(1);
   }, [debouncedFilters]);

   // Query params
   const queryParams = useMemo(() => {
      if (!user) return new URLSearchParams();

      const params = new URLSearchParams({
         page: String(currentPage),
         limit: String(pageSize),
      });

      // Filtros de data
      params.append('ano', ano === 'todos' ? 'todos' : String(ano));
      params.append('mes', mes === 'todos' ? 'todos' : String(mes));
      params.append('dia', dia === 'todos' ? 'todos' : String(dia));

      const filterMappings: Record<FilterKey, string> = {
         COD_CHAMADO: 'filter_COD_CHAMADO',
         DATA_CHAMADO: 'filter_DATA_CHAMADO',
         ASSUNTO_CHAMADO: 'filter_ASSUNTO_CHAMADO',
         STATUS_CHAMADO: 'filter_STATUS_CHAMADO',
         DTENVIO_CHAMADO: 'filter_DTENVIO_CHAMADO',
         NOME_RECURSO: 'filter_NOME_RECURSO',
         NOME_CLIENTE: 'filter_NOME_CLIENTE',
         EMAIL_CHAMADO: 'filter_EMAIL_CHAMADO',
      };

      Object.entries(debouncedFilters).forEach(([key, value]) => {
         if (value?.trim()) {
            params.append(filterMappings[key as FilterKey], value.trim());
         }
      });

      return params;
   }, [user, currentPage, pageSize, ano, mes, dia, debouncedFilters]);

   // API fetch
   const fetchChamados = useCallback(
      async (params: URLSearchParams, token: string): Promise<ApiResponse> => {
         const res = await fetch(`/api/chamado/tabela?${params}`, {
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
      },
      [pageSize]
   );

   const enabled = useMemo(() => {
      return !!(
         (ano === 'todos' || typeof ano === 'number') &&
         (mes === 'todos' || typeof mes === 'number') &&
         (dia === 'todos' || typeof dia === 'number') &&
         token &&
         user
      );
   }, [ano, mes, dia, token, user]);

   const {
      data: apiResponse,
      isLoading,
      isError,
      error,
   } = useQuery({
      queryKey: ['chamadosAbertos', queryParams.toString(), token],
      queryFn: () => fetchChamados(queryParams, token!),
      enabled,
      staleTime: CONFIG.CACHE_TIME,
      retry: 2,
   });

   const data = useMemo(() => apiResponse?.data || [], [apiResponse]);
   const paginationInfo = apiResponse?.pagination;

   // Handlers - Navegação
   const handleOpenView = useCallback(
      (view: 'os' | 'tarefas' | 'relatorio' | 'projetos') => {
         router.push(`?modal=${view}`, { scroll: false });
      },
      [router]
   );

   const handleCloseView = useCallback(() => {
      router.push('?', { scroll: false });
   }, [router]);

   // Handlers - Paginação
   const handlePageChange = useCallback(
      (newPage: number) => setCurrentPage(newPage),
      []
   );

   const handlePageSizeChange = useCallback((newSize: number) => {
      setPageSize(newSize);
      setCurrentPage(1);
   }, []);

   // Handlers - Filtros de Data
   const handleFiltersChange = useCallback(
      (newFilters: {
         ano: number | 'todos';
         mes: number | 'todos';
         dia: number | 'todos';
      }) => {
         setDateFilters(prevFilters => ({
            ...prevFilters,
            ...newFilters,
         }));
      },
      [setDateFilters]
   );

   // Handlers - Modal Visualizar
   const handleOpenModalVisualizarChamado = useCallback(
      (codChamado: number) => {
         const chamado = data.find(c => c.COD_CHAMADO === codChamado);
         if (chamado) {
            setSelectedChamado(chamado);
            setOpenModalVizualizarChamado(true);
         }
      },
      [data]
   );

   const handleCloseModalVisualizarChamado = useCallback(() => {
      setOpenModalVizualizarChamado(false);
      setSelectedChamado(null);
   }, []);

   // Handlers - Modal Atribuir
   const handleOpenModalAtribuirChamado = useCallback(
      (chamado: TabelaChamadoProps) => {
         setSelectedChamadoParaAtribuir(chamado);
         setOpenModalAtribuirChamado(true);
      },
      []
   );

   const handleCloseModalAtribuirChamado = useCallback(() => {
      setOpenModalAtribuirChamado(false);
      setSelectedChamadoParaAtribuir(null);
   }, []);

   // Handlers - Modal Retroativa
   const handleOpenModalPermitirOsRetroativa = useCallback(
      (codChamado: number) => {
         const chamado = data.find(c => c.COD_CHAMADO === codChamado);
         if (chamado) {
            setSelectedChamadoParaRetroativa(chamado);
            setOpenModalPermitirOsRetroativa(true);
         }
      },
      [data]
   );

   const handleCloseModalPermitirOsRetroativa = useCallback(() => {
      setOpenModalPermitirOsRetroativa(false);
      setSelectedChamadoParaRetroativa(null);
   }, []);

   // Handlers - Modal Excluir
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

   // Tabela config
   const colunas = useMemo(
      () =>
         colunasTabelaChamados({
            onTabelaOS: () => handleOpenView('os'),
            onTabelaTarefa: () => handleOpenView('tarefas'),
            onTabelaProjeto: () => handleOpenView('projetos'),
            onVisualizarChamado: handleOpenModalVisualizarChamado,
            onAtribuirChamado: handleOpenModalAtribuirChamado,
            onExcluirChamado: handleOpenModalExcluirChamado,
            onPermitirRetroativa: handleOpenModalPermitirOsRetroativa,
         }),
      [
         handleOpenView,
         handleOpenModalVisualizarChamado,
         handleOpenModalAtribuirChamado,
         handleOpenModalExcluirChamado,
         handleOpenModalPermitirOsRetroativa,
      ]
   );

   const table = useReactTable({
      data,
      columns: colunas,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: setSorting,
      state: { sorting },
      manualPagination: true,
      manualFiltering: true,
   });

   // Validações
   if (isAuthLoading) {
      return <IsLoading isLoading={true} title="Verificando autenticação..." />;
   }

   if (isTokenExpired) {
      return <SessionExpired isTokenExpired={isTokenExpired} />;
   }

   if (!user || !token) {
      return <IsError error={new Error('Usuário não autenticado')} />;
   }

   if (isError) {
      return <IsError error={error as Error} />;
   }

   const shouldShowNoResults =
      paginationInfo &&
      paginationInfo.totalRecords > 0 &&
      table.getFilteredRowModel().rows.length === 0;

   return (
      <div className="flex items-center justify-center">
         {/* VIEW DE CHAMADOS */}
         {(!activeView || activeView === 'chamados') && (
            <div
               className="animate-in slide-in-from-bottom-4 max-h-[90vh] w-full max-w-[95vw] overflow-hidden rounded-2xl transition-all duration-500 ease-out"
               style={{ animationDuration: `${CONFIG.ANIMATION_DURATION}ms` }}
            >
               {/* HEADER */}
               <header className="flex flex-col gap-14 bg-white/50 p-6">
                  <div className="flex items-center justify-between gap-8">
                     <div className="flex items-center justify-center gap-6">
                        <IoCall className="text-black" size={72} />
                        <h1 className="text-5xl font-extrabold tracking-widest text-black select-none">
                           CHAMADOS
                        </h1>
                     </div>

                     {user && user.tipo === 'ADM' && (
                        <div className="flex items-center gap-4">
                           <DropdownMenuTabelaChamado
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
                     <div className="flex w-[1000px] items-center">
                        <FiltrosTabelaChamado
                           onFiltersChange={handleFiltersChange}
                        />
                     </div>
                  </div>
               </header>

               {/* TABELA */}
               <main className="h-full w-full overflow-hidden bg-black">
                  <div
                     className="h-full overflow-y-auto"
                     style={{ maxHeight: CONFIG.MODAL_MAX_HEIGHT }}
                  >
                     <table className="w-full table-fixed border-collapse">
                        <thead
                           style={{
                              position: 'sticky',
                              top: 0,
                              zIndex: 30,
                              backgroundColor: '#0f766e',
                           }}
                        >
                           {/* Títulos */}
                           {table.getHeaderGroups().map(headerGroup => (
                              <tr key={headerGroup.id} className="bg-teal-800">
                                 {headerGroup.headers.map((header, idx) => (
                                    <th
                                       key={`header-${idx}-${header.id}`}
                                       className="bg-teal-800 py-6 text-base font-extrabold tracking-wider text-white select-none"
                                       style={{
                                          width:
                                             COLUMN_WIDTHS[header.column.id] ||
                                             'auto',
                                       }}
                                    >
                                       {flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                       )}
                                    </th>
                                 ))}
                              </tr>
                           ))}

                           {/* Filtros */}
                           <tr className="bg-teal-800">
                              {table.getAllColumns().map((column, idx) => (
                                 <th
                                    key={`filter-${idx}-${column.id}`}
                                    className="bg-teal-800 px-3 pb-6"
                                    style={{
                                       width:
                                          COLUMN_WIDTHS[column.id] || 'auto',
                                    }}
                                 >
                                    {column.id === 'acoes' &&
                                    activeFilterCount > 0 ? (
                                       <button
                                          onClick={clearAllFilters}
                                          title="Limpar Filtros"
                                          className="group cursor-pointer rounded-full border-none bg-gradient-to-b from-red-600 to-red-700 px-6 py-2.5 shadow-md shadow-black transition-all hover:shadow-xl hover:shadow-black active:scale-95"
                                       >
                                          <FaEraser
                                             size={24}
                                             className="text-white group-hover:scale-110"
                                          />
                                       </button>
                                    ) : column.id !== 'HORA_CHAMADO' &&
                                      column.id !== 'acoes' &&
                                      FILTER_KEYS.includes(
                                         column.id as FilterKey
                                      ) ? (
                                       <FiltrosHeaderTabelaChamado
                                          value={
                                             filters[column.id as FilterKey]
                                          }
                                          onChange={value =>
                                             setFilter(
                                                column.id as FilterKey,
                                                String(value)
                                             )
                                          }
                                          columnId={column.id}
                                       />
                                    ) : null}
                                 </th>
                              ))}
                           </tr>
                        </thead>

                        {/* CORPO */}
                        <tbody>
                           {table.getRowModel().rows.map((row, rowIndex) => (
                              <tr
                                 key={row.id}
                                 className={`group transition-all ${
                                    rowIndex % 2 === 0
                                       ? 'bg-slate-800'
                                       : 'bg-slate-700'
                                 }`}
                              >
                                 {row.getVisibleCells().map(cell => (
                                    <td
                                       key={cell.id}
                                       className="border border-white/30 bg-black p-2 text-sm font-semibold tracking-widest text-white select-none group-hover:bg-white/50 group-hover:text-black"
                                       style={{
                                          width:
                                             COLUMN_WIDTHS[cell.column.id] ||
                                             'auto',
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

                           {/* Células vazias */}
                           {table.getRowModel().rows.length > 0 &&
                              Array.from({
                                 length: Math.max(
                                    0,
                                    pageSize - table.getRowModel().rows.length
                                 ),
                              }).map((_, index) => (
                                 <tr
                                    key={`empty-${index}`}
                                    className={`${
                                       (table.getRowModel().rows.length +
                                          index) %
                                          2 ===
                                       0
                                          ? 'bg-slate-800'
                                          : 'bg-slate-700'
                                    }`}
                                 >
                                    {table.getAllColumns().map(column => (
                                       <td
                                          key={column.id}
                                          className="border border-white/30 bg-black p-2"
                                          style={{
                                             width:
                                                COLUMN_WIDTHS[column.id] ||
                                                'auto',
                                             height: '54px',
                                          }}
                                       >
                                          &nbsp;
                                       </td>
                                    ))}
                                 </tr>
                              ))}
                        </tbody>
                     </table>
                  </div>
               </main>

               {/* PAGINAÇÃO */}
               {paginationInfo && paginationInfo.totalRecords > 0 && (
                  <PaginationControls
                     paginationInfo={paginationInfo}
                     currentPage={currentPage}
                     pageSize={pageSize}
                     onPageChange={handlePageChange}
                     onPageSizeChange={handlePageSizeChange}
                     totalRows={table.getFilteredRowModel().rows.length}
                  />
               )}

               {/* ESTADOS VAZIOS */}
               {data.length === 0 && !isLoading && (
                  <EmptyState ano={ano} mes={mes} dia={dia} />
               )}
               {shouldShowNoResults && (
                  <NoResultsState
                     totalActiveFilters={activeFilterCount}
                     clearFilters={clearAllFilters}
                  />
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
            <ModalRelatorioOS isOpen={true} onClose={handleCloseView} />
         )}

         {/* VIEW DROPDOWN DA TABELA DE PROJETOS */}
         {activeView === 'projetos' && (
            <TabelaProjeto isOpen={true} onClose={handleCloseView} />
         )}

         {/* MODAL VISUALIZAR CHAMADO */}
         {OpenModalVizualizarChamado && selectedChamado && (
            <ModalVisualizarChamado
               isOpen={OpenModalVizualizarChamado}
               onClose={handleCloseModalVisualizarChamado}
               chamado={selectedChamado}
            />
         )}

         {/* MODAL ATRIBUIR CHAMADO */}
         {openModalAtribuirChamado && selectedChamadoParaAtribuir && (
            <ModalAtribuirChamado
               isOpen={openModalAtribuirChamado}
               onClose={handleCloseModalAtribuirChamado}
               chamado={selectedChamadoParaAtribuir}
            />
         )}

         {/* MODAL EXCLUIR CHAMADO */}
         {selectedCodChamadoParaExcluir && (
            <ModalExcluirChamado
               isOpen={!!selectedCodChamadoParaExcluir}
               onClose={handleCloseModalExcluirChamado}
               codChamado={selectedCodChamadoParaExcluir}
               onSuccess={handleExcluirChamadoSuccess}
            />
         )}

         {/* MODAL PERMITIR OS RETROATIVA */}
         {openModalPermitirOsRetroativa && selectedChamadoParaRetroativa && (
            <ModalPermitirRetroativoOsChamado
               isOpen={openModalPermitirOsRetroativa}
               onClose={handleCloseModalPermitirOsRetroativa}
               chamadoId={String(selectedChamadoParaRetroativa.COD_CHAMADO)}
               currentUserId={''}
            />
         )}

         {/* LOADING */}
         <IsLoading
            isLoading={isLoading}
            title={`Aguarde... Buscando chamados para o período: ${[
               dia === 'todos' ? '' : String(dia).padStart(2, '0'),
               mes === 'todos' ? '' : String(mes).padStart(2, '0'),
               ano === 'todos' ? '' : String(ano),
            ]
               .filter(part => part !== '')
               .join('/')}`}
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
