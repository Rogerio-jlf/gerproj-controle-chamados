'use client';
// ================================================================================
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback, useEffect } from 'react';
import {
   flexRender,
   SortingState,
   useReactTable,
   getCoreRowModel,
   getSortedRowModel,
   ColumnFiltersState,
   getFilteredRowModel,
} from '@tanstack/react-table';
// ================================================================================
import {
   InputGlobalFilter,
   FilterInputTableHeaderDebounce,
   // OrderTableHeader,
   FilterControls,
   useTableFilters,
} from '../TableFilters';
// ================================================================================
import { TabelaOSProps } from '../../../../../types/types';
// ================================================================================
import IsError from '../Error';
import IsLoading from '../Loading';
import Filtros from '../Filtros_Completo';
import { useAuth } from '../../../../../hooks/useAuth';
import { colunasTabelaOS } from '../colunas/Colunas_Tabela_OS';
import { useFiltersTabelaOs } from '../../../../../contexts/Filters_Context_Dia';
// ================================================================================
import { GrServices } from 'react-icons/gr';
import { BsEraserFill } from 'react-icons/bs';
import { FaFilterCircleXmark } from 'react-icons/fa6';
import { FaExclamationTriangle } from 'react-icons/fa';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';

// ================================================================================
// TIPOS
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
// UTILITÁRIOS
// ================================================================================
function getColumnWidth(columnId: string, userType?: string): string {
   if (userType === 'ADM') {
      const widthMapAdmin: Record<string, string> = {
         COD_OS: '4%',
         TAREFA_COMPLETA: '17%',
         DTINI_OS: '6%',
         HRINI_OS: '3%',
         HRFIM_OS: '3%',
         QTD_HR_OS: '3%',
         DTINC_OS: '6%',
         FATURADO_OS: '3%',
         COMP_OS: '5%',
         VALID_OS: '3%',
         NOME_RECURSO: '11%',
         NOME_CLIENTE: '10%',
         PROJETO_COMPLETO: '17%',
         CHAMADO_OS: '4%',
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

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export default function TabelaOS({ isOpen = true, onClose }: Props) {
   // ================================================================================
   // HOOKS E CONTEXTOS
   // ================================================================================
   const { filters } = useFiltersTabelaOs();
   const { setFilters } = useFiltersTabelaOs();

   const { user } = useAuth();
   const { globalFilterFn, columnFilterFn } = useTableFilters();
   const { ano, mes, dia } = filters;
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   // ================================================================================
   // ESTADOS - FILTROS E ORDENAÇÃO
   // ================================================================================
   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
   const [globalFilter, setGlobalFilter] = useState('');
   const [sorting, setSorting] = useState<SortingState>([
      { id: 'COD_OS', desc: true },
   ]);
   const [filterValues, setFilterValues] = useState({
      COD_OS: '',
      DTINI_OS: '',
      NOME_RECURSO: '',
      CHAMADO_OS: '',
      global: '',
   });
   const [showFilters, setShowFilters] = useState(false);

   const handleFiltersChange = useCallback(
      (newFilters: { ano: number | 'todos'; mes: number | 'todos' }) => {
         setFilters(prevFilters => ({
            ...prevFilters,
            ...newFilters,
         }));
      },
      [setFilters]
   );

   // ================================================================================
   // ESTADOS - PAGINAÇÃO API
   // ================================================================================
   const [currentPage, setCurrentPage] = useState(1);
   const [pageSize, setPageSize] = useState(20);
   const [codOsFilter, setCodOsFilter] = useState('');

   // ================================================================================
   // FUNÇÕES DE FILTRO
   // ================================================================================
   const totalActiveFilters = useMemo(() => {
      let count = columnFilters.length;
      if (globalFilter && globalFilter.trim()) count += 1;
      if (codOsFilter && codOsFilter.trim()) count += 1;
      return count;
   }, [columnFilters.length, globalFilter, codOsFilter]);

   const clearFilters = () => {
      setColumnFilters([]);
      setGlobalFilter('');
      setCodOsFilter('');
      setCurrentPage(1);
      setFilterValues({
         COD_OS: '',
         DTINI_OS: '',
         NOME_RECURSO: '',
         CHAMADO_OS: '',
         global: '',
      });
      table.getAllColumns().forEach(column => {
         column.setFilterValue('');
      });
   };

   // Atualiza os valores locais quando os filtros mudam
   useEffect(() => {
      const newFilterValues = {
         COD_OS: codOsFilter,
         DTINI_OS: '',
         NOME_RECURSO: '',
         CHAMADO_OS: '',
         global: globalFilter || '',
      };

      columnFilters.forEach(filter => {
         if (filter.id in newFilterValues && filter.id !== 'COD_OS') {
            newFilterValues[filter.id as keyof typeof newFilterValues] = String(
               filter.value || ''
            );
         }
      });

      setFilterValues(prev => {
         const hasChanged = Object.keys(newFilterValues).some(
            key =>
               prev[key as keyof typeof prev] !==
               newFilterValues[key as keyof typeof newFilterValues]
         );
         return hasChanged ? newFilterValues : prev;
      });
   }, [columnFilters, globalFilter, codOsFilter]);

   // ================================================================================
   // API E DADOS
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

      if (codOsFilter && codOsFilter.trim()) {
         params.append('codOs', codOsFilter.trim());
      }

      return params;
   }, [ano, mes, dia, user, currentPage, pageSize, codOsFilter]);

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

   // Query principal para buscar as OS
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

   // Extrai dados e paginação da resposta da API
   const data = useMemo(() => apiResponse?.data || [], [apiResponse]);
   const paginationInfo = apiResponse?.pagination;

   // ================================================================================
   // HANDLERS DE PAGINAÇÃO
   // ================================================================================
   const handlePageChange = (newPage: number) => {
      setCurrentPage(newPage);
   };

   const handlePageSizeChange = (newSize: number) => {
      setPageSize(newSize);
      setCurrentPage(1);
   };

   // ================================================================================
   // CONFIGURAÇÃO DA TABELA
   // ================================================================================
   const colunas = useMemo(() => colunasTabelaOS(), []);

   // Tabela usa dados da API sem paginação local
   const table = useReactTable({
      data: data ?? [],
      columns: colunas,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getSortedRowModel: getSortedRowModel(),
      onColumnFiltersChange: setColumnFilters,
      onGlobalFilterChange: setGlobalFilter,
      onSortingChange: setSorting,
      globalFilterFn,
      state: {
         columnFilters,
         globalFilter,
         sorting,
      },
      filterFns: {
         customColumnFilter: columnFilterFn,
      },
      defaultColumn: {
         filterFn: columnFilterFn,
      },
      manualPagination: true,
   });

   // ================================================================================
   // ESTADOS DE CARREGAMENTO E VALIDAÇÃO
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

   if (!isOpen) {
      return null;
   }

   if (isLoading) return <IsLoading title="Carregando os dados da tabela OS" />;

   if (isError) return <IsError error={error as Error} />;

   const handleCloseTabelaTarefa = () => {
      setTimeout(() => {
         onClose();
      }, 300);
   };

   // ================================================================================
   // RENDERIZAÇÃO PRINCIPAL
   // ================================================================================
   return (
      <>
         <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* ===== OVERLAY ===== */}
            <div
               className="absolute inset-0 bg-black/50 backdrop-blur-xl"
               // onClick={handleCloseTabelaTarefa}
            />
            {/* ==================== */}

            {/* ===== MODAL ===== */}
            <div className="relative z-10 mx-4 max-h-[100vh] w-full max-w-[98vw] overflow-hidden rounded-2xl shadow-xl shadow-black">
               {/* ===== HEADER ===== */}
               <header className="flex flex-col gap-4 bg-white/70 p-6">
                  <section className="flex flex-col items-start gap-4">
                     <div className="mb-4 flex w-full items-center justify-between">
                        <div className="flex items-center gap-6">
                           <div className="flex items-center justify-center rounded-md bg-white/30 p-4 shadow-sm shadow-black">
                              <GrServices className="text-black" size={28} />
                           </div>

                           <h1 className="text-4xl font-extrabold tracking-widest text-black uppercase select-none">
                              Ordens de Serviço
                           </h1>
                        </div>

                        {/* Botão fechar tabela */}
                        <button
                           onClick={handleCloseTabelaTarefa}
                           className="group cursor-pointer rounded-full bg-red-500/50 p-3 text-white shadow-md shadow-black transition-all select-none hover:scale-125 hover:bg-red-500 active:scale-95"
                        >
                           <IoClose size={24} />
                        </button>
                     </div>
                     {/* ========== */}
                     <div className="flex items-center">
                        <Filtros onFiltersChange={handleFiltersChange} />
                     </div>
                     {/* ========== */}
                     <div className="flex items-center gap-6">
                        <InputGlobalFilter
                           value={globalFilter ?? ''}
                           onChange={value => setGlobalFilter(String(value))}
                           placeholder="Buscar em todas as colunas..."
                           onClear={() => setGlobalFilter('')}
                        />

                        <FilterControls
                           showFilters={showFilters}
                           setShowFilters={setShowFilters}
                           totalActiveFilters={totalActiveFilters}
                           clearFilters={clearFilters}
                           dataLength={paginationInfo?.totalRecords || 0}
                        />
                     </div>
                  </section>
               </header>

               {/* ===== CONTEÚDO ===== */}
               <main className="h-full w-full overflow-hidden bg-black">
                  <div
                     className="h-full overflow-y-auto"
                     style={{ maxHeight: 'calc(100vh - 500px)' }}
                  >
                     {/* ===== TABELA ===== */}
                     <table className="w-full table-fixed border-collapse">
                        {/* ===== CABEÇALHO DA TABELA ===== */}
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

                           {/* ===== FILTROS DA TABELA ===== */}
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
                                       {column.id === 'COD_OS' && (
                                          <FilterInputTableHeaderDebounce
                                             value={
                                                (column.getFilterValue() as string) ??
                                                ''
                                             }
                                             onChange={value =>
                                                column.setFilterValue(value)
                                             }
                                             placeholder="Código OS..."
                                          />
                                       )}
                                       {column.id === 'DTINI_OS' && (
                                          <FilterInputTableHeaderDebounce
                                             value={
                                                (column.getFilterValue() as string) ??
                                                ''
                                             }
                                             onChange={value =>
                                                column.setFilterValue(value)
                                             }
                                             placeholder="dd/mm/aaaa"
                                             type="text"
                                          />
                                       )}
                                       {column.id === 'NOME_RECURSO' && (
                                          <FilterInputTableHeaderDebounce
                                             value={
                                                (column.getFilterValue() as string) ??
                                                ''
                                             }
                                             onChange={value =>
                                                column.setFilterValue(value)
                                             }
                                             placeholder="Recurso..."
                                          />
                                       )}
                                       {column.id === 'CHAMADO_OS' && (
                                          <FilterInputTableHeaderDebounce
                                             value={
                                                (column.getFilterValue() as string) ??
                                                ''
                                             }
                                             onChange={value =>
                                                column.setFilterValue(value)
                                             }
                                             placeholder="Chamado..."
                                          />
                                       )}
                                    </th>
                                 ))}
                              </tr>
                           )}
                        </thead>

                        {/* ===== CORPO DA TABELA ===== */}
                        <tbody>
                           {table.getRowModel().rows.length > 0 &&
                              !isLoading &&
                              table.getRowModel().rows.map((row, rowIndex) => (
                                 <tr
                                    key={row.id}
                                    className={`group border-b border-gray-600 transition-all hover:bg-amber-200 ${
                                       rowIndex % 2 === 0
                                          ? 'bg-black'
                                          : 'bg-black'
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

               {/* ===== PAGINAÇÃO DA API ===== */}
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
                              na página atual
                           </span>

                           <span className="text-lg font-extrabold tracking-widest text-black italic select-none">
                              de {paginationInfo.totalRecords} total
                              {paginationInfo.totalRecords !== 1 ? '' : ''}
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
                                    className="text-black group-disabled:text-white"
                                    size={24}
                                 />
                              </button>

                              <button
                                 onClick={() =>
                                    handlePageChange(currentPage - 1)
                                 }
                                 disabled={!paginationInfo.hasPrevPage}
                                 className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                 <MdChevronLeft
                                    className="text-black group-disabled:text-white"
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
                                 onClick={() =>
                                    handlePageChange(currentPage + 1)
                                 }
                                 disabled={!paginationInfo.hasNextPage}
                                 className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                 <MdChevronRight
                                    className="text-black group-disabled:text-white"
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
                                    className="text-black group-disabled:text-white"
                                    size={24}
                                 />
                              </button>
                           </div>
                        </section>
                     </div>
                  </div>
               )}

               {/* ===== MENSAGEM QUANDO NÃO HÁ OS ===== */}
               {(!paginationInfo || paginationInfo.totalRecords === 0) &&
                  !isLoading && (
                     <div className="flex flex-col items-center justify-center gap-4 bg-slate-900 py-20 text-center">
                        <FaExclamationTriangle
                           className="mx-auto text-yellow-600"
                           size={80}
                        />

                        <h3 className="text-2xl font-bold tracking-wider text-white select-none">
                           Nenhuma OS foi encontrada para o período selecionado.
                        </h3>

                        <p className="text-base font-semibold tracking-wider text-white italic select-none">
                           Tente ajustar os filtros de data ou período.
                        </p>
                     </div>
                  )}

               {/* ===== MENSAGEM QUANDO OS FILTROS NÃO RETORNAM RESULTADOS ===== */}
               {paginationInfo &&
                  paginationInfo.totalRecords > 0 &&
                  table.getFilteredRowModel().rows.length === 0 && (
                     <div className="flex flex-col items-center justify-center gap-4 bg-slate-900 py-20 text-center">
                        <FaFilterCircleXmark
                           className="mx-auto text-red-600"
                           size={80}
                        />
                        <h3 className="text-2xl font-bold tracking-wider text-white select-none">
                           Nenhum Registro encontrado para os Filtros aplicados.
                        </h3>
                        <p className="text-base font-semibold tracking-wider text-white italic select-none">
                           Tente ajustar os Filtros ou limpe-os para visualizar
                           Registros.
                        </p>

                        {/* Botão para limpar filtros */}
                        {totalActiveFilters > 0 && (
                           <button
                              onClick={clearFilters}
                              className="flex cursor-pointer items-center gap-4 rounded-md border-none bg-red-600 px-6 py-2 text-lg font-extrabold tracking-wider text-white italic shadow-sm shadow-black transition-all select-none hover:-translate-y-1 hover:scale-102 hover:bg-red-800 active:scale-95"
                           >
                              <BsEraserFill className="text-white" size={24} />
                              Limpar Filtros
                           </button>
                        )}
                     </div>
                  )}
            </div>
         </div>
      </>
   );
}
