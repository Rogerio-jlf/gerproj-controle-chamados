'use client';

import {
   flexRender,
   getCoreRowModel,
   useReactTable,
   getSortedRowModel,
   SortingState,
} from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback, useEffect } from 'react';

import { FiltrosHeaderTabelaTarefa } from './Filtros_Header_Tabela_Tarefa';
import { IsError } from '../../../../components/IsError';
import { IsLoading } from '../../../../components/IsLoading';
import { colunasTabelaTarefa } from './Colunas_Tabela_Tarefa';
import { ModalVisualizarTarefa } from './Modal_Visualizar_Tarefa';
import { formatarCodNumber } from '../../../../utils/formatters';
import { useAuth } from '../../../../hooks/useAuth';
import { TabelaTarefaProps } from '../../../../types/types';

import { IoClose } from 'react-icons/io5';
import { FaFilterCircleXmark, FaEraser } from 'react-icons/fa6';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { FaExclamationTriangle, FaTasks } from 'react-icons/fa';

// ================================================================================
// CONSTANTES
// ================================================================================
const CONFIG = {
   MODAL_MAX_HEIGHT: 'calc(100vh - 470px)',
   DEBOUNCE_DELAY: 800,
   ANIMATION_DURATION: 100,
   CACHE_TIME: 1000 * 60 * 5,
   PAGE_SIZE_OPTIONS: [20, 50, 100],
   DEFAULT_PAGE_SIZE: 20,
} as const;

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

const FILTER_KEYS = [
   'TAREFA_COMPLETA',
   'PROJETO_COMPLETO',
   'NOME_CLIENTE',
   'NOME_RECURSO',
   'DTSOL_TAREFA',
   'DTAPROV_TAREFA',
   'DTPREVENT_TAREFA',
   'STATUS_TAREFA',
   'TIPO_TAREFA_COMPLETO',
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
   data: TabelaTarefaProps[];
   pagination: PaginationInfo;
}

interface Props {
   isOpen: boolean;
   onClose: () => void;
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
   const debouncedTAREFA_COMPLETA = useDebouncedValue(filters.TAREFA_COMPLETA);
   const debouncedPROJETO_COMPLETO = useDebouncedValue(
      filters.PROJETO_COMPLETO
   );
   const debouncedNOME_CLIENTE = useDebouncedValue(filters.NOME_CLIENTE);
   const debouncedNOME_RECURSO = useDebouncedValue(filters.NOME_RECURSO);
   const debouncedDTSOL_TAREFA = useDebouncedValue(filters.DTSOL_TAREFA);
   const debouncedDTAPROV_TAREFA = useDebouncedValue(filters.DTAPROV_TAREFA);
   const debouncedDTPREVENT_TAREFA = useDebouncedValue(
      filters.DTPREVENT_TAREFA
   );
   const debouncedSTATUS_TAREFA = useDebouncedValue(filters.STATUS_TAREFA);
   const debouncedTIPO_TAREFA_COMPLETO = useDebouncedValue(
      filters.TIPO_TAREFA_COMPLETO
   );

   const debouncedFilters = useMemo(
      () => ({
         TAREFA_COMPLETA: debouncedTAREFA_COMPLETA,
         PROJETO_COMPLETO: debouncedPROJETO_COMPLETO,
         NOME_CLIENTE: debouncedNOME_CLIENTE,
         NOME_RECURSO: debouncedNOME_RECURSO,
         DTSOL_TAREFA: debouncedDTSOL_TAREFA,
         DTAPROV_TAREFA: debouncedDTAPROV_TAREFA,
         DTPREVENT_TAREFA: debouncedDTPREVENT_TAREFA,
         STATUS_TAREFA: debouncedSTATUS_TAREFA,
         TIPO_TAREFA_COMPLETO: debouncedTIPO_TAREFA_COMPLETO,
      }),
      [
         debouncedTAREFA_COMPLETA,
         debouncedPROJETO_COMPLETO,
         debouncedNOME_CLIENTE,
         debouncedNOME_RECURSO,
         debouncedDTSOL_TAREFA,
         debouncedDTAPROV_TAREFA,
         debouncedDTPREVENT_TAREFA,
         debouncedSTATUS_TAREFA,
         debouncedTIPO_TAREFA_COMPLETO,
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
const EmptyState = () => (
   <section className="bg-black py-72 text-center">
      <FaExclamationTriangle
         className="mx-auto mb-6 text-yellow-500"
         size={80}
      />
      <h3 className="text-2xl font-bold tracking-widest text-white italic select-none">
         Nenhuma Tarefa foi encontrada no momento
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
                  className="cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 text-base font-semibold tracking-widest text-black italic shadow-md shadow-black transition-all hover:scale-90 focus:ring-2 focus:ring-pink-600 focus:outline-none"
               >
                  {CONFIG.PAGE_SIZE_OPTIONS.map(size => (
                     <option key={size} value={size} className="bg-white">
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
                  className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-md shadow-black transition-all hover:scale-90 focus:ring-2 focus:ring-pink-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-md shadow-black transition-all hover:scale-90 focus:ring-2 focus:ring-pink-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
                        className="cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 text-base font-semibold tracking-widest text-black italic shadow-md shadow-black transition-all hover:scale-90 focus:ring-2 focus:ring-pink-600 focus:outline-none"
                     >
                        {Array.from(
                           { length: paginationInfo.totalPages },
                           (_, i) => (
                              <option
                                 key={i + 1}
                                 value={i + 1}
                                 className="bg-white"
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
                  className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-md shadow-black transition-all hover:scale-90 focus:ring-2 focus:ring-pink-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-md shadow-black transition-all hover:scale-90 focus:ring-2 focus:ring-pink-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
// COMPONENTE PRINCIPAL
// ================================================================================
export function TabelaTarefas({ isOpen, onClose }: Props) {
   const { user } = useAuth();
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   const [selectedTarefa, setSelectedTarefa] =
      useState<TabelaTarefaProps | null>(null);
   const [openModalVisualizarTarefa, setOpenModalVisualizarTarefa] =
      useState(false);
   const [currentPage, setCurrentPage] = useState<number>(1);
   const [pageSize, setPageSize] = useState<number>(CONFIG.DEFAULT_PAGE_SIZE);
   const [sorting, setSorting] = useState<SortingState>([
      { id: 'TAREFA_COMPLETA', desc: true },
   ]);
   const [isClosing, setIsClosing] = useState<boolean>(false);

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

      const filterMappings: Record<FilterKey, string> = {
         TAREFA_COMPLETA: 'filter_NOME_TAREFA',
         PROJETO_COMPLETO: 'filter_NOME_PROJETO',
         NOME_CLIENTE: 'filter_NOME_CLIENTE',
         NOME_RECURSO: 'filter_NOME_RECURSO',
         DTSOL_TAREFA: 'filter_DTSOL_TAREFA',
         DTAPROV_TAREFA: 'filter_DTAPROV_TAREFA',
         DTPREVENT_TAREFA: 'filter_DTPREVENT_TAREFA',
         STATUS_TAREFA: 'filter_STATUS_TAREFA',
         TIPO_TAREFA_COMPLETO: 'filter_TIPO_TAREFA_COMPLETO',
      };

      Object.entries(debouncedFilters).forEach(([key, value]) => {
         if (value?.trim()) {
            params.append(filterMappings[key as FilterKey], value.trim());
         }
      });

      return params;
   }, [user, currentPage, pageSize, debouncedFilters]);

   // API fetch
   const fetchTarefa = useCallback(
      async (params: URLSearchParams, token: string): Promise<ApiResponse> => {
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
      },
      [pageSize]
   );

   const {
      data: apiResponse,
      isLoading,
      isError,
      error,
   } = useQuery({
      queryKey: ['tarefaData', queryParams.toString(), token],
      queryFn: () => fetchTarefa(queryParams, token!),
      enabled: !!(token && user),
      staleTime: CONFIG.CACHE_TIME,
      retry: 2,
   });

   const data = useMemo(() => apiResponse?.data || [], [apiResponse]);
   const paginationInfo = apiResponse?.pagination;

   // Handlers
   const handlePageChange = useCallback(
      (newPage: number) => setCurrentPage(newPage),
      []
   );

   const handlePageSizeChange = useCallback((newSize: number) => {
      setPageSize(newSize);
      setCurrentPage(1);
   }, []);

   const handleCloseTabelaTarefa = useCallback(() => {
      setIsClosing(true);
      setTimeout(() => {
         setIsClosing(false);
         onClose();
      }, CONFIG.ANIMATION_DURATION);
   }, [onClose]);

   const handleOpenModalVisualizarTarefa = useCallback(
      (codTarefa: number) => {
         const tarefa = data.find(t => t.COD_TAREFA === codTarefa);
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

   // Tabela config
   const colunas = useMemo(
      () =>
         colunasTabelaTarefa({
            onVisualizarTarefa: handleOpenModalVisualizarTarefa,
         }),
      [handleOpenModalVisualizarTarefa]
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
   if (!isOpen) return null;
   if (!user || !token)
      return <IsError error={new Error('Usuário não autenticado.')} />;
   if (isError) return <IsError error={error as Error} />;
   if (isLoading)
      return (
         <IsLoading
            isLoading
            title="Aguarde... Buscando informações no sistema"
         />
      );

   const shouldShowNoResults =
      paginationInfo &&
      paginationInfo.totalRecords > 0 &&
      table.getFilteredRowModel().rows.length === 0;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
         <div className="absolute inset-0 bg-teal-900" />

         <div
            className={`animate-in slide-in-from-bottom-4 z-10 max-h-[90vh] w-full max-w-[95vw] overflow-hidden rounded-2xl transition-all duration-500 ease-out ${
               isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            }`}
            style={{ animationDuration: `${CONFIG.ANIMATION_DURATION}ms` }}
         >
            {/* HEADER */}
            <header className="flex flex-col gap-14 bg-white/50 p-6 pb-24">
               <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center justify-center gap-6">
                     <FaTasks className="text-black" size={72} />
                     <h1 className="text-5xl font-extrabold tracking-widest text-black uppercase select-none">
                        Tarefas
                     </h1>
                  </div>

                  <button
                     onClick={handleCloseTabelaTarefa}
                     className="group cursor-pointer rounded-full bg-red-500/50 p-3 transition-all hover:scale-110 hover:rotate-180 hover:bg-red-500 active:scale-95"
                  >
                     <IoClose
                        className="text-white group-hover:scale-125"
                        size={24}
                     />
                  </button>
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
                                    width: COLUMN_WIDTHS[column.id] || 'auto',
                                 }}
                              >
                                 {column.id === 'acoes' &&
                                 activeFilterCount > 0 ? (
                                    <button
                                       onClick={clearAllFilters}
                                       title="Limpar Filtros"
                                       className="group cursor-pointer rounded-full border-none bg-gradient-to-br from-red-600 to-red-700 px-6 py-2.5 text-lg font-extrabold tracking-widest text-white shadow-md shadow-black transition-all hover:scale-110 active:scale-95"
                                    >
                                       <FaEraser
                                          size={20}
                                          className="text-white group-hover:scale-110"
                                       />
                                    </button>
                                 ) : column.id !== 'HREST_TAREFA' &&
                                   column.id !== 'QTD_HRS_GASTAS' &&
                                   column.id !== 'acoes' &&
                                   FILTER_KEYS.includes(
                                      column.id as FilterKey
                                   ) ? (
                                    <FiltrosHeaderTabelaTarefa
                                       value={filters[column.id as FilterKey]}
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
                                    (table.getRowModel().rows.length + index) %
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
                                             COLUMN_WIDTHS[column.id] || 'auto',
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
            {data.length === 0 && !isLoading && <EmptyState />}
            {shouldShowNoResults && (
               <NoResultsState
                  totalActiveFilters={activeFilterCount}
                  clearFilters={clearAllFilters}
               />
            )}
         </div>

         {/* MODAL */}
         {openModalVisualizarTarefa && selectedTarefa && (
            <ModalVisualizarTarefa
               isOpen={openModalVisualizarTarefa}
               onClose={handleCloseModalVisualizarTarefa}
               tarefa={selectedTarefa}
            />
         )}
      </div>
   );
}
