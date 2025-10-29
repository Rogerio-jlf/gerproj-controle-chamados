'use client';

// IMPORTS
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

// COMPONENTS
import {
   FiltrosHeaderTabelaChamado,
   FilterControls,
} from './filtros/Filtros_Header_Tabela_Chamado';
import { IsError } from '../../../../components/IsError';
import { IsLoading } from '../../../../components/IsLoading';
import { SessionExpired } from '../../../../components/IsExpired';
import { ModalRelatorioOS } from '../os/relatorios/modal/Modal_Relatorio_OS';
import { colunasTabelaChamados } from './Colunas_Tabela_Chamado';
import { DropdownMenuTabelaChamado } from './Dropdown_Menu_Tabela_Chamado';
import { FiltrosTabelaChamado } from './filtros/Filtros_Tabela_Chamado';
import { TabelaOS } from '../os/tabelas/tabela/Tabela_OS';
import { TabelaTarefas } from '../tarefas/Tabela_Tarefa';
import { TabelaProjeto } from '../projeto/Tabela_Projeto';
import { ModalExcluirChamado } from './modais/Modal_Deletar_Chamado';
import { ModalAtribuirChamado } from './modais/Modal_Atribuir_Chamado';
import { ModalVisualizarChamado } from './modais/Modal_Visualizar_Chamado';
import { ModalPermitirRetroativoOsChamado } from './modais/Modal_Permitir_OS_Retroativa_Chamado';

// HOOKS
import { useAuth } from '../../../../hooks/useAuth';

// CONTEXTS
import { useFiltersTabelaChamado } from '../../../../contexts/Filters_Context_Tabela_Chamado';

// TYPES
import { TabelaChamadoProps } from '../../../../types/types';

// FORMATTERS
import { formatarCodNumber } from '../../../../utils/formatters';

// ICONS
import { IoCall } from 'react-icons/io5';
import { FaFilterCircleXmark } from 'react-icons/fa6';
import { FaExclamationTriangle } from 'react-icons/fa';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

// ================================================================================
// CONSTANTES
// ================================================================================
const MODAL_MAX_HEIGHT = 'calc(100vh - 486px)';
const DEBOUNCE_DELAY = 500;
const CACHE_TIME = 1000 * 60 * 5;
const PAGE_SIZE_OPTIONS = [20, 50, 100];

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
   <section className="bg-black py-72 text-center">
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

// ================================================================================
// FUNÇÕES UTILITÁRIAS
// ================================================================================
function getColumnWidth(columnId: string): string {
   return COLUMN_WIDTHS[columnId] || 'auto';
}
// ==========

function useDebouncedValue<T>(value: T, delay: number = DEBOUNCE_DELAY): T {
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
   const queryClient = useQueryClient();
   const { user, loading: isAuthLoading, isTokenExpired } = useAuth();
   const { filters, setFilters } = useFiltersTabelaChamado();
   const { ano, mes, dia } = filters;
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   // ================================================================================
   // ESTADOS - FILTROS (INPUTS SEM DEBOUNCE)
   // ================================================================================
   const [inputFilterCOD_CHAMADO, setInputFilterCOD_CHAMADO] = useState('');
   const [inputFilterDATA_CHAMADO, setInputFilterDATA_CHAMADO] = useState('');
   const [inputFilterASSUNTO_CHAMADO, setInputFilterASSUNTO_CHAMADO] =
      useState('');
   const [inputFilterSTATUS_CHAMADO, setInputFilterSTATUS_CHAMADO] =
      useState('');
   const [inputFilterDTENVIO_CHAMADO, setInputFilterDTENVIO_CHAMADO] =
      useState('');
   const [inputFilterNOME_RECURSO, setInputFilterNOME_RECURSO] = useState('');
   const [inputFilterNOME_CLIENTE, setInputFilterNOME_CLIENTE] = useState('');
   const [inputFilterEMAIL_CHAMADO, setInputFilterEMAIL_CHAMADO] = useState('');

   // ESTADOS - FILTROS (COM DEBOUNCE)
   const filterCOD_CHAMADO = useDebouncedValue(inputFilterCOD_CHAMADO);
   const filterDATA_CHAMADO = useDebouncedValue(inputFilterDATA_CHAMADO);
   const filterASSUNTO_CHAMADO = useDebouncedValue(inputFilterASSUNTO_CHAMADO);
   const filterSTATUS_CHAMADO = useDebouncedValue(inputFilterSTATUS_CHAMADO);
   const filterDTENVIO_CHAMADO = useDebouncedValue(inputFilterDTENVIO_CHAMADO);
   const filterNOME_RECURSO = useDebouncedValue(inputFilterNOME_RECURSO);
   const filterNOME_CLIENTE = useDebouncedValue(inputFilterNOME_CLIENTE);
   const filterEMAIL_CHAMADO = useDebouncedValue(inputFilterEMAIL_CHAMADO);

   // ================================================================================
   // MAPEAMENTO DE FILTROS
   // ================================================================================
   const FILTER_MAP = useMemo(
      () => ({
         COD_CHAMADO: {
            state: inputFilterCOD_CHAMADO,
            setter: setInputFilterCOD_CHAMADO,
         },
         DATA_CHAMADO: {
            state: inputFilterDATA_CHAMADO,
            setter: setInputFilterDATA_CHAMADO,
         },
         ASSUNTO_CHAMADO: {
            state: inputFilterASSUNTO_CHAMADO,
            setter: setInputFilterASSUNTO_CHAMADO,
         },
         STATUS_CHAMADO: {
            state: inputFilterSTATUS_CHAMADO,
            setter: setInputFilterSTATUS_CHAMADO,
         },
         DTENVIO_CHAMADO: {
            state: inputFilterDTENVIO_CHAMADO,
            setter: setInputFilterDTENVIO_CHAMADO,
         },
         NOME_RECURSO: {
            state: inputFilterNOME_RECURSO,
            setter: setInputFilterNOME_RECURSO,
         },
         NOME_CLIENTE: {
            state: inputFilterNOME_CLIENTE,
            setter: setInputFilterNOME_CLIENTE,
         },
         EMAIL_CHAMADO: {
            state: inputFilterEMAIL_CHAMADO,
            setter: setInputFilterEMAIL_CHAMADO,
         },
      }),
      [
         inputFilterCOD_CHAMADO,
         inputFilterDATA_CHAMADO,
         inputFilterASSUNTO_CHAMADO,
         inputFilterSTATUS_CHAMADO,
         inputFilterDTENVIO_CHAMADO,
         inputFilterNOME_RECURSO,
         inputFilterNOME_CLIENTE,
         inputFilterEMAIL_CHAMADO,
      ]
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
      { id: 'COD_CHAMADO', desc: true },
   ]);
   const [showFilters, setShowFilters] = useState(false);

   // ================================================================================
   // ESTADOS - MODAIS E VIEWS
   // ================================================================================
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

   // ================================================================================
   // COMPUTED VALUES - FILTROS
   // ================================================================================
   const totalActiveFilters = useMemo(() => {
      const filters = [
         filterCOD_CHAMADO,
         filterDATA_CHAMADO,
         filterASSUNTO_CHAMADO,
         filterSTATUS_CHAMADO,
         filterDTENVIO_CHAMADO,
         filterNOME_RECURSO,
         filterNOME_CLIENTE,
         filterEMAIL_CHAMADO,
      ];
      return filters.filter(f => f?.trim()).length;
   }, [
      filterCOD_CHAMADO,
      filterDATA_CHAMADO,
      filterASSUNTO_CHAMADO,
      filterSTATUS_CHAMADO,
      filterDTENVIO_CHAMADO,
      filterNOME_RECURSO,
      filterNOME_CLIENTE,
      filterEMAIL_CHAMADO,
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

      // Filtros de data
      params.append('ano', ano === 'todos' ? 'todos' : String(ano));
      params.append('mes', mes === 'todos' ? 'todos' : String(mes));
      params.append('dia', dia === 'todos' ? 'todos' : String(dia));

      // Filtros de coluna
      const filterMappings = [
         { filter: filterCOD_CHAMADO, param: 'filter_COD_CHAMADO' },
         { filter: filterDATA_CHAMADO, param: 'filter_DATA_CHAMADO' },
         { filter: filterASSUNTO_CHAMADO, param: 'filter_ASSUNTO_CHAMADO' },
         { filter: filterSTATUS_CHAMADO, param: 'filter_STATUS_CHAMADO' },
         { filter: filterDTENVIO_CHAMADO, param: 'filter_DTENVIO_CHAMADO' },
         { filter: filterNOME_RECURSO, param: 'filter_NOME_RECURSO' },
         { filter: filterNOME_CLIENTE, param: 'filter_NOME_CLIENTE' },
         { filter: filterEMAIL_CHAMADO, param: 'filter_EMAIL_CHAMADO' },
      ];

      filterMappings.forEach(({ filter, param }) => {
         if (filter && filter.trim()) {
            params.append(param, filter.trim());
         }
      });

      return params;
   }, [
      user,
      currentPage,
      pageSize,
      ano,
      mes,
      dia,
      filterCOD_CHAMADO,
      filterDATA_CHAMADO,
      filterASSUNTO_CHAMADO,
      filterSTATUS_CHAMADO,
      filterDTENVIO_CHAMADO,
      filterNOME_RECURSO,
      filterNOME_CLIENTE,
      filterEMAIL_CHAMADO,
   ]);

   async function fetchChamados(
      params: URLSearchParams,
      token: string
   ): Promise<ApiResponse> {
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
      staleTime: CACHE_TIME,
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
      filterCOD_CHAMADO,
      filterDATA_CHAMADO,
      filterASSUNTO_CHAMADO,
      filterSTATUS_CHAMADO,
      filterDTENVIO_CHAMADO,
      filterNOME_RECURSO,
      filterNOME_CLIENTE,
      filterEMAIL_CHAMADO,
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
      setInputFilterCOD_CHAMADO('');
      setInputFilterDATA_CHAMADO('');
      setInputFilterASSUNTO_CHAMADO('');
      setInputFilterSTATUS_CHAMADO('');
      setInputFilterDTENVIO_CHAMADO('');
      setInputFilterNOME_RECURSO('');
      setInputFilterNOME_CLIENTE('');
      setInputFilterEMAIL_CHAMADO('');
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
   // HANDLERS - MODAIS (VISUALIZAR)
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

   const handleCloseModalVisualizarChamado = useCallback(() => {
      setOpenModalVizualizarChamado(false);
      setSelectedChamado(null);
   }, []);

   // ================================================================================
   // HANDLERS - MODAIS (ATRIBUIR)
   // ================================================================================
   const handleOpenModalAtribuirChamado = useCallback(
      (chamado: TabelaChamadoProps) => {
         setSelectedChamadoParaAtribuir(chamado);
         setOpenModalAtribuirChamado(true);
      },
      []
   );

   // ================================================================================
   // HANDLERS - MODAIS (RETROATIVA)
   // ================================================================================
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
   // CONFIGURAÇÃO DA TABELA
   // ================================================================================
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

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <div className="flex items-center justify-center">
         {/* VIEW DE CHAMADOS */}
         {(!activeView || activeView === 'chamados') && (
            <div className="animate-in slide-in-from-bottom-4 max-h-[100vh] w-full max-w-[95vw] overflow-hidden rounded-2xl transition-all duration-500 ease-out">
               {/* HEADER */}
               <header className="flex flex-col gap-6 bg-white/50 p-6">
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
                     style={{ maxHeight: MODAL_MAX_HEIGHT }}
                  >
                     <table className="w-full table-fixed border-collapse">
                        {/* CABEÇALHO DA TABELA */}
                        <thead className="sticky top-0 z-20">
                           {table.getHeaderGroups().map(headerGroup => (
                              <tr key={headerGroup.id}>
                                 {headerGroup.headers.map(header => (
                                    <th
                                       key={header.id}
                                       className="bg-teal-800 py-6 font-extrabold tracking-wider text-white select-none"
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
                                       {column.id in FILTER_MAP && (
                                          <FiltrosHeaderTabelaChamado
                                             value={
                                                FILTER_MAP[
                                                   column.id as keyof typeof FILTER_MAP
                                                ].state
                                             }
                                             onChange={value =>
                                                FILTER_MAP[
                                                   column.id as keyof typeof FILTER_MAP
                                                ].setter(String(value))
                                             }
                                             columnId={column.id}
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
                                          : 'bg-slate-700'
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
                           {/* CÉLULAS VAZIAS PARA PREENCHER O ESPAÇO */}
                           {!isLoading &&
                              table.getRowModel().rows.length > 0 &&
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
                                             width: getColumnWidth(column.id),
                                             height: '54px', // Altura aproximada de uma linha
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
                                 ? `de ${formatarCodNumber(paginationInfo.totalRecords)} encontrados no total`
                                 : `de 1 encontrado no total`}
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
                                 className="cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 text-base font-semibold tracking-widest text-black italic shadow-md shadow-black transition-all hover:bg-white/60 focus:ring-2 focus:ring-pink-600 focus:outline-none active:scale-95"
                              >
                                 {PAGE_SIZE_OPTIONS.map(size => (
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
                                 aria-label="Ir para primeira página"
                                 className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-md shadow-black transition-all hover:bg-white/60 focus:ring-2 focus:ring-pink-600 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
                                 aria-label="Página anterior"
                                 className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-md shadow-black transition-all hover:bg-white/60 focus:ring-2 focus:ring-pink-600 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
                                       aria-label="Selecionar página"
                                       className="cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 text-base font-semibold tracking-widest text-black italic shadow-md shadow-black transition-all hover:bg-white/60 focus:ring-2 focus:ring-pink-600 focus:outline-none active:scale-95"
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
                                 aria-label="Próxima página"
                                 className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-md shadow-black transition-all hover:bg-white/60 focus:ring-2 focus:ring-pink-600 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
                                 aria-label="Ir para última página"
                                 className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-md shadow-black transition-all hover:bg-white/60 focus:ring-2 focus:ring-pink-600 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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

               {/* ===== MENSAGEM QUANDO NÃO HÁ CHAMADOS ===== */}
               {data && data.length === 0 && !isLoading && (
                  <EmptyState ano={ano} mes={mes} dia={dia} />
               )}

               {/* MENSAGEM QUANDO OS FILTROS NÃO RETORNAM RESULTADOS */}
               {paginationInfo &&
                  paginationInfo.totalRecords > 0 &&
                  table.getFilteredRowModel().rows.length === 0 && (
                     <NoResultsState
                        totalActiveFilters={totalActiveFilters}
                        clearFilters={clearFilters}
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
               onClose={() => setOpenModalAtribuirChamado(false)}
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
               onClose={() => setOpenModalPermitirOsRetroativa(false)}
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
