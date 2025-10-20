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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, useCallback, useEffect } from 'react';

// Components
import {
   FilterControls,
   FiltrosHeaderTabelaOs,
} from './filtros/Filtros_Header_Tabela_OS';
import { IsError } from '../../../../components/IsError';
import { IsLoading } from '../../../../components/IsLoading';
import { colunasTabelaOS } from './Colunas_Tabela_OS';
import { formatarCodNumber } from '../../../../utils/formatters';
import { FiltrosTabelaOS } from './filtros/Filtros_Tabela_OS';
import { ModalVisualizarOS } from './modais/Modal_Vizualizar_OS';

// Hooks & Types
import { useAuth } from '../../../../hooks/useAuth';
import { TabelaOSProps } from '../../../../types/types';
import { useFiltersTabelaOs } from '../../../../contexts/Filters_Context_Tabela_OS';

// Icons
import { IoClose } from 'react-icons/io5';
import { GrServices } from 'react-icons/gr';
import { FaFilterCircleXmark } from 'react-icons/fa6';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { FaExclamationTriangle } from 'react-icons/fa';

// ================================================================================
// CONSTANTES
// ================================================================================
const MODAL_MAX_HEIGHT = 'calc(100vh - 500px)';
const DEBOUNCE_DELAY = 800;
const ANIMATION_DURATION = 100;
const CACHE_TIME = 1000 * 60 * 5;
const PAGE_SIZE_OPTIONS = [20, 50, 100];

const COLUMN_WIDTHS: Record<string, string> = {
   COD_OS: '7%',
   CODTRF_OS: '7%',
   CHAMADO_OS: '7%',
   DTINI_OS: '7%',
   HRINI_OS: '7%',
   HRFIM_OS: '7%',
   QTD_HR_OS: '7%',
   DTINC_OS: '10%',
   NOME_RECURSO: '16%',
   VALID_OS: '10%',
   FATURADO_OS: '10%',
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
   data: TabelaOSProps[];
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
export function TabelaOS({ isOpen, onClose }: Props) {
   // ================================================================================
   // HOOKS E CONTEXTOS
   // ================================================================================
   const { user } = useAuth();
   const queryClient = useQueryClient();
   const { filters, setFilters } = useFiltersTabelaOs();
   const { ano, mes, dia } = filters;
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   const [selectedOS, setSelectedOS] = useState<TabelaOSProps | null>(null);
   const [openModalVisualizarOS, setOpenModalVisualizarOS] = useState(false);

   // ================================================================================
   // ESTADOS - FILTROS (INPUTS SEM DEBOUNCE)
   // ================================================================================
   const [inputFilterCodOs, setInputFilterCodOs] = useState('');
   const [inputFilterCodTrfOs, setInputFilterCodTrfOs] = useState('');
   const [inputFilterChamadoOs, setInputFilterChamadoOs] = useState('');
   const [inputFilterDtiniOs, setInputFilterDtiniOs] = useState('');
   const [inputFilterDtincOs, setInputFilterDtincOs] = useState('');
   const [inputFilterNomeRecurso, setInputFilterNomeRecurso] = useState('');
   const [inputFilterValidOs, setInputFilterValidOs] = useState('');
   const [inputFilterFaturadoOs, setInputFilterFaturadoOs] = useState('');
   useState('');

   // ESTADOS - FILTROS (COM DEBOUNCE)
   const filterCodOs = useDebouncedValue(inputFilterCodOs);
   const filterChamadoOs = useDebouncedValue(inputFilterChamadoOs);
   const filterCodTrfOs = useDebouncedValue(inputFilterCodTrfOs);
   const filterDtiniOs = useDebouncedValue(inputFilterDtiniOs);
   const filterDtincOs = useDebouncedValue(inputFilterDtincOs);
   const filterNomeRecurso = useDebouncedValue(inputFilterNomeRecurso);
   const filterValidOs = useDebouncedValue(inputFilterValidOs);
   const filterFaturadoOs = useDebouncedValue(inputFilterFaturadoOs);

   // ================================================================================
   // COMPONENTES AUXILIARES
   // ================================================================================
   const EmptyState = () => (
      <section className="bg-black py-72 text-center">
         <FaExclamationTriangle
            className="mx-auto mb-6 text-yellow-500"
            size={80}
         />
         <h3 className="text-3xl font-extrabold tracking-wider text-white italic select-none">
            {`Nenhum Chamado foi encontrado para o período: ${[
               dia === 'todos' ? '' : String(dia).padStart(2, '0'),
               mes === 'todos' ? '' : String(mes).padStart(2, '0'),
               ano === 'todos' ? '' : String(ano),
            ]
               .filter(part => part !== '')
               .join('/')}.`}
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
   // MAPEAMENTO DE FILTROS
   // ================================================================================
   const FILTER_MAP = useMemo(
      () => ({
         COD_OS: {
            state: inputFilterCodOs,
            setter: setInputFilterCodOs,
         },
         CODTRF_OS: {
            state: inputFilterCodTrfOs,
            setter: setInputFilterCodTrfOs,
         },
         CHAMADO_OS: {
            state: inputFilterChamadoOs,
            setter: setInputFilterChamadoOs,
         },
         DTINI_OS: {
            state: inputFilterDtiniOs,
            setter: setInputFilterDtiniOs,
         },
         DTINC_OS: {
            state: inputFilterDtincOs,
            setter: setInputFilterDtincOs,
         },
         NOME_RECURSO: {
            state: inputFilterNomeRecurso,
            setter: setInputFilterNomeRecurso,
         },
         VALID_OS: {
            state: inputFilterValidOs,
            setter: setInputFilterValidOs,
         },
         FATURADO_OS: {
            state: inputFilterFaturadoOs,
            setter: setInputFilterFaturadoOs,
         },
      }),
      [
         inputFilterCodOs,
         inputFilterChamadoOs,
         inputFilterCodTrfOs,
         inputFilterDtiniOs,
         inputFilterDtincOs,
         inputFilterNomeRecurso,
         inputFilterValidOs,
         inputFilterFaturadoOs,
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
      { id: 'COD_OS', desc: true },
   ]);
   const [showFilters, setShowFilters] = useState(false);
   const [isClosing, setIsClosing] = useState(false);

   // ================================================================================
   // COMPUTED VALUES - FILTROS
   // ================================================================================
   const totalActiveFilters = useMemo(() => {
      const filters = [
         filterCodOs,
         filterCodTrfOs,
         filterChamadoOs,
         filterDtiniOs,
         filterDtincOs,
         filterNomeRecurso,
         filterValidOs,
         filterFaturadoOs,
      ];
      return filters.filter(f => f?.trim()).length;
   }, [
      filterCodOs,
      filterCodTrfOs,
      filterChamadoOs,
      filterDtiniOs,
      filterDtincOs,
      filterNomeRecurso,
      filterValidOs,
      filterFaturadoOs,
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
         { filter: filterCodOs, param: 'filter_COD_OS' },
         { filter: filterCodTrfOs, param: 'filter_CODTRF_OS' },
         { filter: filterChamadoOs, param: 'filter_CHAMADO_OS' },
         { filter: filterDtiniOs, param: 'filter_DTINI_OS' },
         { filter: filterDtincOs, param: 'filter_DTINC_OS' },
         { filter: filterNomeRecurso, param: 'filter_NOME_RECURSO' },
         { filter: filterValidOs, param: 'filter_VALID_OS' },
         { filter: filterFaturadoOs, param: 'filter_FATURADO_OS' },
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
      filterCodOs,
      filterCodTrfOs,
      filterChamadoOs,
      filterDtiniOs,
      filterDtincOs,
      filterNomeRecurso,
      filterValidOs,
      filterFaturadoOs,
   ]);

   async function fetchOS(
      params: URLSearchParams,
      token: string
   ): Promise<ApiResponse> {
      const res = await fetch(`/api/os/tabela?${params}`, {
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
      filterCodOs,
      filterCodTrfOs,
      filterChamadoOs,
      filterDtiniOs,
      filterDtincOs,
      filterNomeRecurso,
      filterValidOs,
      filterFaturadoOs,
   ]);

   // ================================================================================
   // HANDLERS - FILTROS
   // ================================================================================
   const clearFilters = useCallback(() => {
      setInputFilterCodOs('');
      setInputFilterCodTrfOs('');
      setInputFilterChamadoOs('');
      setInputFilterDtiniOs('');
      setInputFilterDtincOs('');
      setInputFilterNomeRecurso('');
      setInputFilterValidOs('');
      setInputFilterFaturadoOs('');
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
   const handleCloseTabelaOS = useCallback(() => {
      setIsClosing(true);
      setTimeout(() => {
         setIsClosing(false);
         onClose();
      }, ANIMATION_DURATION);
   }, [onClose]);
   // =====

   const handleOpenModalVisualizarOS = useCallback(
      (codOs: number) => {
         const os = data.find(os => os.COD_OS === codOs);
         if (os) {
            setSelectedOS(os);
            setOpenModalVisualizarOS(true);
         }
      },
      [data]
   );

   const handleCloseModalVisualizarOS = useCallback(() => {
      setOpenModalVisualizarOS(false);
      setSelectedOS(null);
   }, []);

   // ================================================================================
   // HANDLERS - UPDATE FIELD
   // ================================================================================
   const handleUpdateField = useCallback(
      async (codOs: number, field: string, value: any) => {
         if (!token) {
            throw new Error('Token não disponível');
         }

         const response = await fetch('/api/os/update', {
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

         queryClient.invalidateQueries({ queryKey: ['osData'] });

         return response.json();
      },
      [token, queryClient]
   );

   // ================================================================================
   // CONFIGURAÇÃO DA TABELA
   // ================================================================================
   const colunas = useMemo(
      () =>
         colunasTabelaOS({
            handleUpdateField,
            onVisualizarOS: handleOpenModalVisualizarOS,
         }),
      [handleUpdateField, handleOpenModalVisualizarOS]
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
      return <IsLoading isLoading={true} title="Aguarde, carregando OS's..." />;
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
                        <GrServices className="text-black" size={28} />
                     </div>
                     <h1 className="text-4xl font-extrabold tracking-widest text-black uppercase select-none">
                        Ordens de Serviço
                     </h1>
                  </div>

                  <button
                     onClick={handleCloseTabelaOS}
                     aria-label="Fechar modal de ordens de serviço"
                     className={`group cursor-pointer rounded-full bg-red-500/50 p-3 text-white transition-all hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95 ${
                        isClosing ? 'animate-spin' : ''
                     }`}
                  >
                     <IoClose size={24} />
                  </button>
               </div>

               {/* FILTROS HEADER */}
               <div className="flex items-center gap-6">
                  <div className="flex w-[1000px] items-center">
                     <FiltrosTabelaOS onFiltersChange={handleFiltersChange} />
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
                                       <FiltrosHeaderTabelaOs
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

            {/* ===== MENSAGEM QUANDO NÃO HÁ OS ===== */}
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

         {/* MODAL VISUALIZAR OS */}
         {openModalVisualizarOS && selectedOS && (
            <ModalVisualizarOS
               isOpen={openModalVisualizarOS}
               onClose={handleCloseModalVisualizarOS}
               os={selectedOS}
            />
         )}

         {/* LOADING */}
         <IsLoading
            isLoading={isLoading}
            title={`Buscando OS's para o período: ${[
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
