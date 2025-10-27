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
   FiltrosHeaderTabelaProjeto,
} from './Filtros_Header_Tabela_Projeto';
import { IsError } from '../../../../components/IsError';
import { IsLoading } from '../../../../components/IsLoading';
import { colunasTabelaProjeto } from './Colunas_Tabela_Projeto';

// FORMATERS
import { formatarCodNumber } from '../../../../utils/formatters';

// HOOKS
import { useAuth } from '../../../../hooks/useAuth';

// TYPES
import { TabelaProjetoProps } from '../../../../types/types';

// ICONS
import { IoClose } from 'react-icons/io5';
import { FaFilterCircleXmark } from 'react-icons/fa6';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { ModalVisualizarProjeto } from './Modal_Visualizar_Projeto';
import { FaExclamationTriangle, FaProjectDiagram } from 'react-icons/fa';

// ================================================================================
// CONSTANTES
// ================================================================================
const MODAL_MAX_HEIGHT = 'calc(100vh - 500px)';
const DEBOUNCE_DELAY = 800;
const ANIMATION_DURATION = 100;
const CACHE_TIME = 1000 * 60 * 5;
const PAGE_SIZE_OPTIONS = [20, 50, 100];

const COLUMN_WIDTHS: Record<string, string> = {
   PROJETO_COMPLETO: '28%',
   NOME_CLIENTE: '12%',
   RESPCLI_PROJETO: '12%',
   NOME_RECURSO: '12%',
   QTDHORAS_PROJETO: '12%',
   QTD_HRS_GASTAS: '12%',
   STATUS_PROJETO: '7%',
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
   data: TabelaProjetoProps[];
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
         Nenhum Projeto foi encontrado no momento
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
export function TabelaProjeto({ isOpen, onClose }: Props) {
   // ================================================================================
   // HOOKS E CONTEXTOS
   // ================================================================================
   const { user } = useAuth();
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   const [selectedProjeto, setSelectedProjeto] =
      useState<TabelaProjetoProps | null>(null);
   const [openModalVisualizarProjeto, setOpenModalVisualizarProjeto] =
      useState(false);

   // ================================================================================
   // ESTADOS - FILTROS (INPUTS SEM DEBOUNCE)
   // ================================================================================
   const [inputFilterPROJETO_COMPLETO, setInputFilterPROJETO_COMPLETO] =
      useState('');
   const [inputFilterNOME_CLIENTE, setInputFilterNOME_CLIENTE] = useState('');
   const [inputFilterCODCLI_PROJETO, setInputFilterCODCLI_PROJETO] =
      useState('');
   const [inputFilterNOME_RECURSO, setInputFilterNOME_RECURSO] = useState('');
   const [inputFilterSTATUS_PROJETO, setInputFilterSTATUS_PROJETO] =
      useState('');

   // ESTADOS - FILTROS (COM DEBOUNCE)
   const filterPROJETO_COMPLETO = useDebouncedValue(
      inputFilterPROJETO_COMPLETO
   );
   const filterNOME_CLIENTE = useDebouncedValue(inputFilterNOME_CLIENTE);
   const filterCODCLI_PROJETO = useDebouncedValue(inputFilterCODCLI_PROJETO);
   const filterNOME_RECURSO = useDebouncedValue(inputFilterNOME_RECURSO);
   const filterSTATUS_PROJETO = useDebouncedValue(inputFilterSTATUS_PROJETO);

   // ================================================================================
   // MAPEAMENTO DE FILTROS
   // ================================================================================
   const FILTER_MAP = useMemo(
      () => ({
         PROJETO_COMPLETO: {
            state: inputFilterPROJETO_COMPLETO,
            setter: setInputFilterPROJETO_COMPLETO,
         },
         NOME_CLIENTE: {
            state: inputFilterNOME_CLIENTE,
            setter: setInputFilterNOME_CLIENTE,
         },
         RESPCLI_PROJETO: {
            state: inputFilterCODCLI_PROJETO,
            setter: setInputFilterCODCLI_PROJETO,
         },
         NOME_RECURSO: {
            state: inputFilterNOME_RECURSO,
            setter: setInputFilterNOME_RECURSO,
         },
         STATUS_PROJETO: {
            state: inputFilterSTATUS_PROJETO,
            setter: setInputFilterSTATUS_PROJETO,
         },
      }),
      [
         inputFilterPROJETO_COMPLETO,
         inputFilterNOME_CLIENTE,
         inputFilterCODCLI_PROJETO,
         inputFilterNOME_RECURSO,
         inputFilterSTATUS_PROJETO,
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
      { id: 'PROJETO_COMPLETO', desc: true },
   ]);
   const [showFilters, setShowFilters] = useState(false);
   const [isClosing, setIsClosing] = useState(false);

   // ================================================================================
   // COMPUTED VALUES - FILTROS
   // ================================================================================
   const totalActiveFilters = useMemo(() => {
      const filters = [
         filterPROJETO_COMPLETO,
         filterNOME_CLIENTE,
         filterCODCLI_PROJETO,
         filterNOME_RECURSO,
         filterSTATUS_PROJETO,
      ];
      return filters.filter(f => f?.trim()).length;
   }, [
      filterPROJETO_COMPLETO,
      filterNOME_CLIENTE,
      filterCODCLI_PROJETO,
      filterNOME_RECURSO,
      filterSTATUS_PROJETO,
   ]);

   // ================================================================================
   // QUERY PARAMS E API
   // ================================================================================
   const enabled = useMemo(() => {
      return !!(token && user);
   }, [token, user]);

   const queryParams = useMemo(() => {
      if (!user) return new URLSearchParams();

      const params = new URLSearchParams({
         page: String(currentPage),
         limit: String(pageSize),
      });

      // Filtros de coluna
      const filterMappings = [
         { filter: filterPROJETO_COMPLETO, param: 'filter_NOME_PROJETO' },
         { filter: filterNOME_CLIENTE, param: 'filter_NOME_CLIENTE' },
         {
            filter: filterCODCLI_PROJETO,
            param: 'filter_RESPCLI_PROJETO',
         },
         { filter: filterNOME_RECURSO, param: 'filter_NOME_RECURSO' },
         { filter: filterSTATUS_PROJETO, param: 'filter_STATUS_PROJETO' },
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
      filterPROJETO_COMPLETO,
      filterNOME_CLIENTE,
      filterCODCLI_PROJETO,
      filterNOME_RECURSO,
      filterSTATUS_PROJETO,
   ]);

   async function fetchProjeto(
      params: URLSearchParams,
      token: string
   ): Promise<ApiResponse> {
      const res = await fetch(`/api/projeto/tabela?${params}`, {
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
      queryKey: ['projetoData', queryParams.toString(), token],
      queryFn: () => fetchProjeto(queryParams, token!),
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
      filterPROJETO_COMPLETO,
      filterNOME_CLIENTE,
      filterCODCLI_PROJETO,
      filterNOME_RECURSO,
      filterSTATUS_PROJETO,
   ]);

   // ================================================================================
   // HANDLERS - FILTROS
   // ================================================================================
   const clearFilters = useCallback(() => {
      setInputFilterPROJETO_COMPLETO('');
      setInputFilterNOME_CLIENTE('');
      setInputFilterCODCLI_PROJETO('');
      setInputFilterNOME_RECURSO('');
      setInputFilterSTATUS_PROJETO('');
      setCurrentPage(1);
   }, []);

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
   const handleCloseTabelaProjeto = useCallback(() => {
      setIsClosing(true);
      setTimeout(() => {
         setIsClosing(false);
         onClose();
      }, ANIMATION_DURATION);
   }, [onClose]);

   const handleOpenModalVisualizarProjeto = useCallback(
      (codProjeto: number) => {
         const projeto = data.find(
            projeto => projeto.COD_PROJETO === codProjeto
         );
         if (projeto) {
            setSelectedProjeto(projeto);
            setOpenModalVisualizarProjeto(true);
         }
      },
      [data]
   );

   const handleCloseModalVisualizarProjeto = useCallback(() => {
      setOpenModalVisualizarProjeto(false);
      setSelectedProjeto(null);
   }, []);

   // ================================================================================
   // CONFIGURAÇÃO DA TABELA
   // ================================================================================
   const colunas = useMemo(
      () =>
         colunasTabelaProjeto({
            onVisualizarProjeto: handleOpenModalVisualizarProjeto,
         }),
      [handleOpenModalVisualizarProjeto]
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
         <IsLoading
            isLoading={true}
            title="Aguarde... Buscando Projetos no sistema"
         />
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
                        <FaProjectDiagram className="text-black" size={28} />
                     </div>
                     <h1 className="text-4xl font-extrabold tracking-widest text-black uppercase select-none">
                        Projetos
                     </h1>
                  </div>

                  <button
                     onClick={handleCloseTabelaProjeto}
                     aria-label="Fechar modal de projetos"
                     className={`group cursor-pointer rounded-full bg-red-500/50 p-3 text-white transition-all hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95 ${
                        isClosing ? 'animate-spin' : ''
                     }`}
                  >
                     <IoClose size={24} />
                  </button>
               </div>

               {/* FILTROS HEADER */}
               <div className="flex items-center">
                  <FilterControls
                     showFilters={showFilters}
                     setShowFilters={setShowFilters}
                     totalActiveFilters={totalActiveFilters}
                     clearFilters={clearFilters}
                     dataLength={paginationInfo?.totalRecords || 0}
                  />
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
                                       <FiltrosHeaderTabelaProjeto
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
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={!paginationInfo.hasPrevPage}
                              aria-label="Página anterior"
                              className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-md shadow-black transition-all hover:bg-white/460 focus:ring-2 focus:ring-pink-600 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
                                 {formatarCodNumber(paginationInfo.totalPages)}
                              </span>
                           </div>

                           <button
                              onClick={() => handlePageChange(currentPage + 1)}
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

            {/* ===== MENSAGEM QUANDO NÃO HÁ RESULTADOS ===== */}
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

         {/* MODAL VISUALIZAR PROJETO */}
         {openModalVisualizarProjeto && selectedProjeto && (
            <ModalVisualizarProjeto
               isOpen={openModalVisualizarProjeto}
               onClose={handleCloseModalVisualizarProjeto}
               projeto={selectedProjeto}
            />
         )}
      </div>
   );
}
