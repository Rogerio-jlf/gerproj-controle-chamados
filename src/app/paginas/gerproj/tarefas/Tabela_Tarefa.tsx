'use client';
// IMPORTS
import {
   flexRender,
   getCoreRowModel,
   useReactTable,
   getSortedRowModel,
   SortingState,
} from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback, useEffect } from 'react';

// COMPONENTS
import {
   FilterControls,
   FiltrosHeaderTabelaTarefa,
} from './Filtros_Header_Tabela_Tarefa';
import { colunasTabelaTarefa } from './Colunas_Tabela_Tarefa';
import { ModalVisualizarTarefa } from './Modal_Visualizar_Tarefa';
import { IsError } from '../../../../components/IsError';
import { IsLoading } from '../../../../components/IsLoading';

// FORMATERS
import { formatarCodNumber } from '../../../../utils/formatters';

// HOOKS
import { useAuth } from '../../../../hooks/useAuth';

// CONTEXTS
import { useFiltersTabelaTarefa } from '../../../../contexts/Filters_Context_Tabela_Tarefa';

// TYPES
import { TabelaTarefaProps } from '../../../../types/types';

// ICONS
import { IoClose } from 'react-icons/io5';
import { FaFilterCircleXmark } from 'react-icons/fa6';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { FaExclamationTriangle, FaTasks } from 'react-icons/fa';

// ================================================================================
// CONSTANTES
// ================================================================================
const MODAL_MAX_HEIGHT = 'calc(100vh - 500px)';
const DEBOUNCE_DELAY = 800;
const ANIMATION_DURATION = 100;
const CACHE_TIME = 1000 * 60 * 5;
const PAGE_SIZE_OPTIONS = [20, 50, 100];

const COLUMN_WIDTHS: Record<string, string> = {
   TAREFA_COMPLETA: '17%',
   PROJETO_COMPLETO: '17%',
   NOME_CLIENTE: '10%',
   NOME_RECURSO: '10%',
   DTSOL_TAREFA: '7%',
   DTAPROV_TAREFA: '7%',
   DTPREVENT_TAREFA: '6%',
   HREST_TAREFA: '6%',
   QTD_HRS_GASTAS: '6%',
   TIPO_TAREFA_COMPLETO: '9%',
   acoes: '5%',
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
   data: TabelaTarefaProps[];
   pagination: PaginationInfo;
}

interface Props {
   isOpen: boolean;
   onClose: () => void;
}

// ================================================================================
// COMPONENTES AUXILIARES
// ================================================================================
const EmptyState = () => (
   <section className="bg-black py-72 text-center">
      <FaExclamationTriangle
         className="mx-auto mb-6 text-yellow-500"
         size={80}
      />
      <h3 className="text-2xl font-bold tracking-widest text-white italic select-none">
         Nenhuma Tarefa foi encontrada no momento.
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
         Nenhum registro encontrado para os filtros aplicados.
      </h3>
      <p className="text-base font-semibold tracking-wider text-white italic select-none">
         Tente ajustar os filtros ou limpe-os para visualizar registros.
      </p>
      {totalActiveFilters > 0 && (
         <button
            onClick={clearFilters}
            className="cursor-pointer rounded-md border-none bg-red-600 px-6 py-2 text-base font-extrabold tracking-widest text-white italic shadow-md shadow-black transition-all hover:scale-105 hover:bg-red-700 active:scale-95"
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

   const [selectedTarefa, setSelectedTarefa] =
      useState<TabelaTarefaProps | null>(null);
   const [openModalVisualizarTarefa, setOpenModalVisualizarTarefa] =
      useState(false);

   // ================================================================================
   // ESTADOS - FILTROS (INPUTS SEM DEBOUNCE)
   // ================================================================================
   const [inputFilterTarefaCompleta, setInputFilterTarefaCompleta] =
      useState('');
   const [inputFilterProjetoCompleto, setInputFilterProjetoCompleto] =
      useState('');
   const [inputFilterNomeCliente, setInputFilterNomeCliente] = useState('');
   const [inputFilterNomeRecurso, setInputFilterNomeRecurso] = useState('');
   const [inputFilterDtSolTarefa, setInputFilterDtSolTarefa] = useState('');
   const [inputFilterDtAprovTarefa, setInputFilterDtAprovTarefa] = useState('');
   const [inputFilterDtPreventTarefa, setInputFilterDtPreventTarefa] =
      useState('');
   const [inputFilterHrEstTarefa, setInputFilterHrEstTarefa] = useState('');
   const [inputFilterQtdHrsGastasTarefa, setInputFilterQtdHrsGastasTarefa] =
      useState('');
   const [inputFilterStatusTarefa, setInputFilterStatusTarefa] = useState('');
   const [inputFilterTipoTarefaCompleto, setInputFilterTipoTarefaCompleto] =
      useState('');

   // ESTADOS - FILTROS (COM DEBOUNCE)
   const filterTarefaCompleta = useDebouncedValue(inputFilterTarefaCompleta);
   const filterProjetoCompleto = useDebouncedValue(inputFilterProjetoCompleto);
   const filterNomeCliente = useDebouncedValue(inputFilterNomeCliente);
   const filterNomeRecurso = useDebouncedValue(inputFilterNomeRecurso);
   const filterDtSolTarefa = useDebouncedValue(inputFilterDtSolTarefa);
   const filterDtAprovTarefa = useDebouncedValue(inputFilterDtAprovTarefa);
   const filterDtPreventTarefa = useDebouncedValue(inputFilterDtPreventTarefa);
   const filterHrEstTarefa = useDebouncedValue(inputFilterHrEstTarefa);
   const filterQtdHrsGastasTarefa = useDebouncedValue(
      inputFilterQtdHrsGastasTarefa
   );
   const filterStatusTarefa = useDebouncedValue(inputFilterStatusTarefa);
   const filterTipoTarefaCompleto = useDebouncedValue(
      inputFilterTipoTarefaCompleto
   );

   // ================================================================================
   // MAPEAMENTO DE FILTROS
   // ================================================================================
   const FILTER_MAP = useMemo(
      () => ({
         TAREFA_COMPLETA: {
            state: inputFilterTarefaCompleta,
            setter: setInputFilterTarefaCompleta,
         },
         PROJETO_COMPLETO: {
            state: inputFilterProjetoCompleto,
            setter: setInputFilterProjetoCompleto,
         },
         NOME_CLIENTE: {
            state: inputFilterNomeCliente,
            setter: setInputFilterNomeCliente,
         },
         NOME_RECURSO: {
            state: inputFilterNomeRecurso,
            setter: setInputFilterNomeRecurso,
         },
         DTSOL_TAREFA: {
            state: inputFilterDtSolTarefa,
            setter: setInputFilterDtSolTarefa,
         },
         DTAPROV_TAREFA: {
            state: inputFilterDtAprovTarefa,
            setter: setInputFilterDtAprovTarefa,
         },
         DTPREVENT_TAREFA: {
            state: inputFilterDtPreventTarefa,
            setter: setInputFilterDtPreventTarefa,
         },
         // HREST_TAREFA: {
         //    state: inputFilterHrEstTarefa,
         //    setter: setInputFilterHrEstTarefa,
         // },
         // QTD_HRS_GASTAS: {
         //    state: inputFilterQtdHrsGastasTarefa,
         //    setter: setInputFilterQtdHrsGastasTarefa,
         // },
         STATUS_TAREFA: {
            state: inputFilterStatusTarefa,
            setter: setInputFilterStatusTarefa,
         },
         TIPO_TAREFA_COMPLETO: {
            state: inputFilterTipoTarefaCompleto,
            setter: setInputFilterTipoTarefaCompleto,
         },
      }),
      [
         inputFilterTarefaCompleta,
         inputFilterProjetoCompleto,
         inputFilterNomeCliente,
         inputFilterNomeRecurso,
         inputFilterDtSolTarefa,
         inputFilterDtAprovTarefa,
         inputFilterDtPreventTarefa,
         // inputFilterHrEstTarefa,
         // inputFilterQtdHrsGastasTarefa,
         inputFilterStatusTarefa,
         inputFilterTipoTarefaCompleto,
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
      { id: 'COD_TAREFA', desc: true },
   ]);
   const [showFilters, setShowFilters] = useState(false);
   const [isClosing, setIsClosing] = useState(false);

   // ================================================================================
   // COMPUTED VALUES - FILTROS
   // ================================================================================
   const totalActiveFilters = useMemo(() => {
      const filters = [
         filterTarefaCompleta,
         filterProjetoCompleto,
         filterNomeCliente,
         filterNomeRecurso,
         filterDtSolTarefa,
         filterDtAprovTarefa,
         filterDtPreventTarefa,
         filterHrEstTarefa,
         filterQtdHrsGastasTarefa,
         filterStatusTarefa,
         filterTipoTarefaCompleto,
      ];
      return filters.filter(f => f?.trim()).length;
   }, [
      filterTarefaCompleta,
      filterProjetoCompleto,
      filterNomeCliente,
      filterNomeRecurso,
      filterDtSolTarefa,
      filterDtAprovTarefa,
      filterDtPreventTarefa,
      filterHrEstTarefa,
      filterQtdHrsGastasTarefa,
      filterStatusTarefa,
      filterTipoTarefaCompleto,
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
         { filter: filterTarefaCompleta, param: 'filter_NOME_TAREFA' },
         { filter: filterProjetoCompleto, param: 'filter_NOME_PROJETO' },
         { filter: filterNomeCliente, param: 'filter_NOME_CLIENTE' },
         { filter: filterNomeRecurso, param: 'filter_NOME_RECURSO' },
         { filter: filterDtSolTarefa, param: 'filter_DTSOL_TAREFA' },
         { filter: filterDtAprovTarefa, param: 'filter_DTAPROV_TAREFA' },
         { filter: filterDtPreventTarefa, param: 'filter_DTPREVENT_TAREFA' },
         { filter: filterHrEstTarefa, param: 'filter_HREST_TAREFA' },
         {
            filter: filterQtdHrsGastasTarefa,
            param: 'filter_QTDHRS_GASTAS_TAREFA',
         },
         { filter: filterStatusTarefa, param: 'filter_STATUS_TAREFA' },
         {
            filter: filterTipoTarefaCompleto,
            param: 'filter_TIPO_TAREFA_COMPLETO',
         },
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
      filterTarefaCompleta,
      filterProjetoCompleto,
      filterNomeCliente,
      filterNomeRecurso,
      filterDtSolTarefa,
      filterDtAprovTarefa,
      filterDtPreventTarefa,
      filterHrEstTarefa,
      filterQtdHrsGastasTarefa,
      filterStatusTarefa,
      filterTipoTarefaCompleto,
   ]);

   async function fetchOS(
      params: URLSearchParams,
      token: string
   ): Promise<ApiResponse> {
      const res = await fetch(`/api/tarefa/tabela?${params}`, {
         headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
         },
      });

      if (!res.ok) {
         const errorData = await res.json();
         throw new Error(errorData.error || 'Erro ao buscar tarefas');
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
      filterTarefaCompleta,
      filterProjetoCompleto,
      filterNomeCliente,
      filterNomeRecurso,
      filterDtSolTarefa,
      filterDtAprovTarefa,
      filterDtPreventTarefa,
      filterHrEstTarefa,
      filterQtdHrsGastasTarefa,
      filterStatusTarefa,
      filterTipoTarefaCompleto,
   ]);

   // ================================================================================
   // HANDLERS - FILTROS
   // ================================================================================
   const clearFilters = useCallback(() => {
      setInputFilterTarefaCompleta('');
      setInputFilterProjetoCompleto('');
      setInputFilterNomeCliente('');
      setInputFilterNomeRecurso('');
      setInputFilterDtSolTarefa('');
      setInputFilterDtAprovTarefa('');
      setInputFilterDtPreventTarefa('');
      setInputFilterHrEstTarefa('');
      setInputFilterQtdHrsGastasTarefa('');
      setInputFilterStatusTarefa('');
      setInputFilterTipoTarefaCompleto('');
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
   // HANDLERS - MODAL
   // ================================================================================
   const handleCloseTabelaTarefa = useCallback(() => {
      setIsClosing(true);
      setTimeout(() => {
         setIsClosing(false);
         onClose();
      }, ANIMATION_DURATION);
   }, [onClose]);

   const handleOpenModalVisualizarTarefa = useCallback(
      (codTarefa: number) => {
         const tarefa = data.find(tarefa => tarefa.COD_TAREFA === codTarefa);
         if (tarefa) {
            setSelectedTarefa(tarefa);
            setOpenModalVisualizarTarefa(true);
         }
      },
      [data]
   );

   const handleCloseModalVisualizarTarefa = useCallback(() => {
      setOpenModalVisualizarTarefa(false);
      setSelectedTarefa(null);
   }, []);

   // ================================================================================
   // CONFIGURAÇÃO DA TABELA
   // ================================================================================
   const colunas = useMemo(
      () =>
         colunasTabelaTarefa({
            onVisualizarTarefa: handleOpenModalVisualizarTarefa,
         }),
      [handleOpenModalVisualizarTarefa]
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
   if (!isOpen) return null;

   if (!user || !token) {
      return <IsError error={new Error('Usuário não autenticado.')} />;
   }

   if (isError) {
      return <IsError error={error as Error} />;
   }

   if (isLoading) {
      return (
         <IsLoading isLoading={true} title="Aguarde, carregando Tarefas..." />
      );
   }

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
         {/* OVERLAY */}
         <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

         {/* CONTAINER */}
         <div
            className={`animate-in slide-in-from-bottom-4 z-10 max-h-[100vh] w-full max-w-[95vw] overflow-hidden rounded-2xl shadow-xl shadow-black transition-all duration-500 ease-out ${
               isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            }`}
         >
            {/* HEADER */}
            <header className="flex flex-col gap-6 bg-white/50 p-6">
               <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center justify-center gap-6">
                     <div className="flex items-center justify-center rounded-lg bg-white/30 p-4 shadow-md shadow-black">
                        <FaTasks className="text-black" size={28} />
                     </div>
                     <h1 className="text-4xl font-extrabold tracking-widest text-black uppercase select-none">
                        Tarefas
                     </h1>
                  </div>

                  <button
                     onClick={handleCloseTabelaTarefa}
                     aria-label="Fechar modal de tarefas"
                     className={`group cursor-pointer rounded-full bg-red-500/50 p-3 text-white transition-all hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95 ${
                        isClosing ? 'animate-spin' : ''
                     }`}
                  >
                     <IoClose size={24} />
                  </button>
               </div>

               {/* FILTROS HEADER */}
               <div className="flex items-center gap-6">
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
                                    {column.id in FILTER_MAP && (
                                       <FiltrosHeaderTabelaTarefa
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
                              className="cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 text-base font-semibold tracking-widest text-black italic shadow-md shadow-black transition-all hover:bg-white/40 focus:ring-2 focus:ring-pink-600 focus:outline-none active:scale-95"
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
                              className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-md shadow-black transition-all hover:bg-white/40 focus:ring-2 focus:ring-pink-600 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              <FiChevronsLeft
                                 className="text-black group-disabled:text-red-500"
                                 size={24}
                              />
                           </button>

                           <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={!paginationInfo.hasPrevPage}
                              aria-label="Página anterior"
                              className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-md shadow-black transition-all hover:bg-white/40 focus:ring-2 focus:ring-pink-600 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
                                    aria-label="Selecionar página"
                                    className="cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 text-base font-semibold tracking-widest text-black italic shadow-md shadow-black transition-all hover:bg-white/40 focus:ring-2 focus:ring-pink-600 focus:outline-none active:scale-95"
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
                              aria-label="Próxima página"
                              className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-md shadow-black transition-all hover:bg-white/40 focus:ring-2 focus:ring-pink-600 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
                              className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-md shadow-black transition-all hover:bg-white/40 focus:ring-2 focus:ring-pink-600 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
            {data && data.length === 0 && !isLoading && <EmptyState />}

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

         {/* MODAL VISUALIZAR TAREFA */}
         {openModalVisualizarTarefa && selectedTarefa && (
            <ModalVisualizarTarefa
               isOpen={openModalVisualizarTarefa}
               onClose={handleCloseModalVisualizarTarefa}
               tarefa={selectedTarefa}
            />
         )}

         {/* LOADING */}
         <IsLoading
            isLoading={isLoading}
            title={`Buscando Tarefas para o período: ${[
               dia === 'todos' ? '' : String(dia).padStart(2, '0'),
               mes === 'todos' ? '' : String(mes).padStart(2, '0'),
               ano === 'todos' ? '' : String(ano),
            ]
               .filter(part => part !== '')
               .join('/')}.`}
         />
      </div>
   );
}
