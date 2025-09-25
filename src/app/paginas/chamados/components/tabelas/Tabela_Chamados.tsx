'use client';
// ================================================================================
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, useCallback, useEffect } from 'react';
import {
   flexRender,
   SortingState,
   useReactTable,
   getCoreRowModel,
   getSortedRowModel,
   ColumnFiltersState,
   getFilteredRowModel,
   getPaginationRowModel,
} from '@tanstack/react-table';
// ================================================================================
import {
   InputGlobalFilter,
   FilterInputTableHeaderDebounce,
   IndicatorFilter,
   OrderTableHeader,
   FilterControls,
   useTableFilters,
   getDefaultColumnDisplayName,
} from '../TableFilters';
// ================================================================================
import { TabelaChamadoProps } from '../../../../../types/types';
// ================================================================================
import { useAuth } from '../../../../../hooks/useAuth';
import { colunasTabelaChamados } from '../colunas/Colunas_Tabela_Chamados';
import { useFiltersTabelaChamados } from '../../../../../contexts/Filters_Context';
import TabelaOS from './Tabela_OS';
import TabelaTarefas from './Tabela_Tarefas';
import ModalApontamento from '../modais/Modal_Apontamento_OS_Tarefa';
import { ModalVisualizarDadosChamado } from '../modais/Modal_Visualizar_Dados_Chamado';
import { ModalAtribuirChamado } from '../modais/Modal_Atribuir_Chamado';
// ================================================================================
import IsError from '../Error';
import IsLoading from '../Loading';
// ================================================================================
import { BsEraserFill } from 'react-icons/bs';
import { FaFilterCircleXmark } from 'react-icons/fa6';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FaExclamationTriangle } from 'react-icons/fa';
import { IoCall } from 'react-icons/io5';
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

// ================================================================================
// UTILITÁRIOS
// ================================================================================
function getColumnWidth(columnId: string, userType?: string): string {
   if (userType === 'ADM') {
      const widthMapAdmin: Record<string, string> = {
         COD_CHAMADO: '10%',
         DATA_CHAMADO: '10%',
         ASSUNTO_CHAMADO: '30%',
         STATUS_CHAMADO: '18%',
         NOME_RECURSO: '13%',
         EMAIL_CHAMADO: '12%',
         actions: '7%',
      };
      return widthMapAdmin[columnId] || 'auto';
   }

   const widthMap: Record<string, string> = {
      COD_CHAMADO: '10%',
      DATA_CHAMADO: '10%',
      ASSUNTO_CHAMADO: '33%',
      STATUS_CHAMADO: '20%',
      EMAIL_CHAMADO: '20%',
      actions: '7%',
   };

   return widthMap[columnId] || 'auto';
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export default function TabelaChamados() {
   // ================================================================================
   // HOOKS E CONTEXTOS
   // ================================================================================
   const { filters } = useFiltersTabelaChamados();
   const { user } = useAuth();
   const queryClient = useQueryClient();
   const { globalFilterFn, columnFilterFn } = useTableFilters();
   const { ano, mes } = filters;
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   // ================================================================================
   // ESTADOS - MODAIS E COMPONENTES
   // ================================================================================
   const [modalChamadosOpen, setModalChamadosOpen] = useState(false);
   const [selectedChamado, setSelectedChamado] =
      useState<TabelaChamadoProps | null>(null);
   const [tabelaOSOpen, setTabelaOSOpen] = useState(false);
   const [selectedCodChamado, setSelectedCodChamado] = useState<number | null>(
      null
   );
   const [tabelaTarefasOpen, setTabelaTarefasOpen] = useState(false);
   const [dashboardOpen, setDashboardOpen] = useState(false);
   const [modalAtribuicaoOpen, setModalAtribuicaoOpen] = useState(false);
   const [chamadoParaAtribuir, setChamadoParaAtribuir] =
      useState<TabelaChamadoProps | null>(null);

   const [modalApontamentosOpen, setModalApontamentosOpen] = useState(false);
   const [apontamentoData, setApontamentoData] = useState<{
      codChamado: number;
      status: string;
      tarefa?: any;
      nomeCliente?: string;
   } | null>(null);

   // ================================================================================
   // ESTADOS - FILTROS E ORDENAÇÃO
   // ================================================================================
   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
   const [globalFilter, setGlobalFilter] = useState('');
   const [sorting, setSorting] = useState<SortingState>([
      { id: 'COD_CHAMADO', desc: true },
   ]);
   const [filterValues, setFilterValues] = useState({
      COD_CHAMADO: '',
      DATA_CHAMADO: '',
      ASSUNTO_CHAMADO: '',
      STATUS_CHAMADO: '',
      EMAIL_CHAMADO: '',
      NOME_RECURSO: '',
      global: '',
   });
   const [showFilters, setShowFilters] = useState(false);

   // ================================================================================
   // FUNÇÕES DE FILTRO
   // ================================================================================
   const totalActiveFilters = useMemo(() => {
      let count = columnFilters.length;
      if (globalFilter && globalFilter.trim()) count += 1;
      return count;
   }, [columnFilters.length, globalFilter]);

   const clearFilters = () => {
      setColumnFilters([]);
      setGlobalFilter('');
      setFilterValues({
         COD_CHAMADO: '',
         DATA_CHAMADO: '',
         ASSUNTO_CHAMADO: '',
         STATUS_CHAMADO: '',
         NOME_RECURSO: '',
         EMAIL_CHAMADO: '',
         global: '',
      });
      table.getAllColumns().forEach(column => {
         column.setFilterValue('');
      });
   };

   // Atualiza os valores locais quando os filtros mudam
   useEffect(() => {
      const newFilterValues = {
         COD_CHAMADO: '',
         DATA_CHAMADO: '',
         ASSUNTO_CHAMADO: '',
         STATUS_CHAMADO: '',
         EMAIL_CHAMADO: '',
         NOME_RECURSO: '',
         global: globalFilter || '',
      };

      columnFilters.forEach(filter => {
         if (filter.id in newFilterValues) {
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
   }, [columnFilters, globalFilter]);

   // ================================================================================
   // API E DADOS
   // ================================================================================
   const enabled = !!ano && !!mes && !!token && !!user;

   const queryParams = useMemo(() => {
      if (!user) return new URLSearchParams();
      const params = new URLSearchParams({
         ano: String(ano),
         mes: String(mes),
      });
      return params;
   }, [ano, mes, user]);

   async function fetchChamados(
      params: URLSearchParams,
      token: string
   ): Promise<TabelaChamadoProps[]> {
      const res = await fetch(`/api/chamados?${params}`, {
         headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
         },
      });

      if (!res.ok) {
         const errorData = await res.json();
         throw new Error(errorData.error || 'Erro ao buscar chamados');
      }

      const data = await res.json();
      return Array.isArray(data) ? data : data.chamados || [];
   }

   const updateAssunto = useCallback(
      async (codChamado: number, novoAssunto: string) => {
         try {
            const response = await fetch(
               `/api/atualizar-assunto-chamado/${codChamado}`,
               {
                  method: 'POST',
                  headers: {
                     Authorization: `Bearer ${token}`,
                     'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                     assuntoChamado: novoAssunto,
                     codChamado: codChamado.toString(),
                  }),
               }
            );

            if (!response.ok) {
               const errorData = await response.json();
               throw new Error(errorData.error || 'Erro ao atualizar assunto');
            }

            queryClient.setQueryData(
               ['chamadosAbertos', queryParams.toString(), token],
               (oldData: TabelaChamadoProps[] | undefined) => {
                  if (!oldData) return oldData;

                  return oldData.map(chamado =>
                     chamado.COD_CHAMADO === codChamado
                        ? { ...chamado, ASSUNTO_CHAMADO: novoAssunto }
                        : chamado
                  );
               }
            );

            return response.json();
         } catch (error) {
            console.error('Erro ao atualizar assunto:', error);
            throw error;
         }
      },
      [token, queryClient, queryParams]
   );

   // Query principal para buscar os chamados
   const { data, isLoading, isError, error } = useQuery({
      queryKey: ['chamadosAbertos', queryParams.toString(), token],
      queryFn: () => fetchChamados(queryParams, token!),
      enabled,
      staleTime: 1000 * 60 * 5,
      retry: 2,
   });

   // ================================================================================
   // HANDLERS E CALLBACKS
   // ================================================================================
   const handleCloseModalChamados = () => {
      setModalChamadosOpen(false);
      setSelectedChamado(null);
   };

   const handleCloseTabelaOS = () => {
      setTabelaOSOpen(false);
      setSelectedCodChamado(null);
   };

   const handleVisualizarChamado = useCallback(
      (codChamado: number) => {
         const chamado = data?.find(c => c.COD_CHAMADO === codChamado);
         if (chamado) {
            setSelectedChamado(chamado);
            setModalChamadosOpen(true);
         }
      },
      [data]
   );

   const handleVisualizarOS = useCallback((codChamado: number) => {
      setSelectedCodChamado(codChamado);
      setTabelaOSOpen(true);
   }, []);

   const handleAbrirAtribuicaoInteligente = useCallback(
      (chamado: TabelaChamadoProps) => {
         setChamadoParaAtribuir(chamado);
         setModalAtribuicaoOpen(true);
      },
      []
   );

   const handleAbrirDashboard = () => setDashboardOpen(true);

   const handleFecharDashboard = () => setDashboardOpen(false);

   const handleAtribuicaoSuccess = () => {
      queryClient.invalidateQueries({ queryKey: ['chamadosAbertos'] });
      setModalAtribuicaoOpen(false);
      setChamadoParaAtribuir(null);
   };

   const handleOpenApontamentos = useCallback(
      async (codChamado: number, newStatus: string) => {
         try {
            const chamado = data?.find(c => c.COD_CHAMADO === codChamado);
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/atribuir-tarefa/${codChamado}`, {
               headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
               },
            });

            if (response.ok) {
               const tarefas = await response.json();
               const tarefaSelecionada = tarefas[0];

               setApontamentoData({
                  codChamado,
                  status: newStatus,
                  tarefa: tarefaSelecionada,
                  nomeCliente: chamado?.EMAIL_CHAMADO || 'Cliente',
               });
               setModalApontamentosOpen(true);
            }
         } catch (error) {
            console.error('Erro ao buscar dados para apontamento:', error);
         }
      },
      [data]
   );

   const handleCloseApontamentos = useCallback(() => {
      setModalApontamentosOpen(false);
      setApontamentoData(null);
   }, []);

   const handleApontamentoSuccess = useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['chamadosAbertos'] });
      setModalApontamentosOpen(false);
      setApontamentoData(null);
   }, [queryClient]);

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

            queryClient.setQueryData(
               ['chamadosAbertos', queryParams.toString(), token],
               (oldData: TabelaChamadoProps[] | undefined) => {
                  if (!oldData) return oldData;

                  return oldData.map(chamado =>
                     chamado.COD_CHAMADO === codChamado
                        ? { ...chamado, STATUS_CHAMADO: newStatus }
                        : chamado
                  );
               }
            );

            return response.json();
         } catch (error) {
            console.error('Erro ao atualizar status:', error);
            throw error;
         }
      },
      [token, queryClient, queryParams]
   );

   // ================================================================================
   // CONFIGURAÇÃO DA TABELA
   // ================================================================================
   const colunas = useMemo(
      () =>
         colunasTabelaChamados(
            {
               onVisualizarChamado: handleVisualizarChamado,
               onVisualizarOS: handleVisualizarOS,
               onVisualizarTarefas: () => setTabelaTarefasOpen(true),
               onAtribuicaoInteligente: handleAbrirAtribuicaoInteligente,
               onUpdateAssunto: updateAssunto,
               onUpdateStatus: updateStatus,
               onOpenApontamentos: handleOpenApontamentos,
               userType: user?.tipo,
            },
            user?.tipo
         ),
      [
         handleVisualizarChamado,
         handleVisualizarOS,
         handleAbrirAtribuicaoInteligente,
         updateAssunto,
         handleOpenApontamentos,
         updateStatus,
         user?.tipo,
      ]
   );

   const table = useReactTable({
      data: data ?? [],
      columns: colunas,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
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
      initialState: {
         pagination: {
            pageSize: 20,
         },
      },
      filterFns: {
         customColumnFilter: columnFilterFn,
      },
      defaultColumn: {
         filterFn: columnFilterFn,
      },
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

   if (isLoading)
      return <IsLoading title="Carregando os dados da tabela Chamado" />;

   if (isError) return <IsError error={error as Error} />;

   // ================================================================================
   // RENDERIZAÇÃO PRINCIPAL
   // ================================================================================
   return (
      <>
         <div className="overflow-hidden rounded-2xl bg-black shadow-xl shadow-black">
            {/* ===== HEADER ===== */}
            <header className="flex flex-col gap-4 bg-white/70 p-6">
               <section className="flex items-center justify-between gap-8">
                  <div className="flex items-center justify-center gap-6">
                     <div className="flex items-center justify-center rounded-md bg-white/30 p-4 shadow-sm shadow-black">
                        <IoCall className="text-black" size={28} />
                     </div>

                     <h1 className="text-4xl font-extrabold tracking-widest text-black uppercase select-none">
                        Chamados
                     </h1>
                  </div>

                  <FilterControls
                     showFilters={showFilters}
                     setShowFilters={setShowFilters}
                     totalActiveFilters={totalActiveFilters}
                     clearFilters={clearFilters}
                     dataLength={data?.length || 0}
                  />
               </section>

               {/* ===== FILTRO GLOBAL ===== */}
               {data && data.length > 0 && (
                  <div className="flex items-center justify-between gap-6">
                     {/* Input busca global */}
                     <div className="max-w-md flex-1 font-semibold tracking-wider select-none placeholder:tracking-wider placeholder:text-black placeholder:italic placeholder:select-none">
                        <InputGlobalFilter
                           value={globalFilter ?? ''}
                           onChange={value => setGlobalFilter(String(value))}
                           placeholder="Buscar em todas as colunas..."
                           onClear={clearFilters}
                        />
                     </div>

                     {/* Indicador filtros ativos */}
                     <IndicatorFilter
                        columnFilters={columnFilters}
                        globalFilter={globalFilter}
                        totalFilters={totalActiveFilters}
                        getColumnDisplayName={getDefaultColumnDisplayName}
                     />
                  </div>
               )}
            </header>

            {/* ===== CONTEÚDO DA TABELA ===== */}
            <main className="h-full w-full overflow-hidden bg-black">
               <div
                  className="h-full overflow-y-auto"
                  style={{ maxHeight: 'calc(100vh - 450px)' }}
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
                                    {header.isPlaceholder ? null : header.column
                                         .id === 'COD_CHAMADO' ||
                                      header.column.id === 'DATA_CHAMADO' ||
                                      header.column.id === 'ASSUNTO_CHAMADO' ||
                                      header.column.id === 'STATUS_CHAMADO' ||
                                      header.column.id === 'NOME_RECURSO' ? (
                                       <OrderTableHeader column={header.column}>
                                          {flexRender(
                                             header.column.columnDef.header,
                                             header.getContext()
                                          )}
                                       </OrderTableHeader>
                                    ) : (
                                       flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                       )
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
                                    {column.id === 'COD_CHAMADO' && (
                                       <FilterInputTableHeaderDebounce
                                          value={
                                             (column.getFilterValue() as string) ??
                                             ''
                                          }
                                          onChange={value =>
                                             column.setFilterValue(value)
                                          }
                                          placeholder="Código..."
                                          type="text"
                                       />
                                    )}
                                    {column.id === 'DATA_CHAMADO' && (
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
                                    {column.id === 'ASSUNTO_CHAMADO' && (
                                       <FilterInputTableHeaderDebounce
                                          value={
                                             (column.getFilterValue() as string) ??
                                             ''
                                          }
                                          onChange={value =>
                                             column.setFilterValue(value)
                                          }
                                          placeholder="Assunto..."
                                       />
                                    )}
                                    {column.id === 'STATUS_CHAMADO' && (
                                       <FilterInputTableHeaderDebounce
                                          value={
                                             (column.getFilterValue() as string) ??
                                             ''
                                          }
                                          onChange={value =>
                                             column.setFilterValue(value)
                                          }
                                          placeholder="Status..."
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
                                       ? 'bg-stone-600'
                                       : 'bg-stone-500'
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

            {/* ===== PAGINAÇÃO DA TABELA ===== */}
            {Array.isArray(data) && data.length > 0 && (
               <div className="bg-white/70 px-12 py-4">
                  <div className="flex items-center justify-between">
                     {/* Informações da página */}
                     <section className="flex items-center gap-4">
                        <span className="text-lg font-extrabold tracking-widest text-black italic select-none">
                           {table.getFilteredRowModel().rows.length} registro
                           {table.getFilteredRowModel().rows.length !== 1
                              ? 's'
                              : ''}{' '}
                           encontrado
                           {table.getFilteredRowModel().rows.length !== 1
                              ? 's'
                              : ''}
                        </span>

                        {/* Total de registros (sem filtros) */}
                        {totalActiveFilters > 0 && (
                           <span className="text-lg font-extrabold tracking-widest text-black italic select-none">
                              de um total de {data.length}
                           </span>
                        )}
                     </section>

                     {/* Controles de paginação */}
                     <section className="flex items-center gap-3">
                        {/* Seletor de itens por página */}
                        <div className="flex items-center gap-2">
                           <span className="text-base font-semibold tracking-widest text-black italic select-none">
                              Itens por página:
                           </span>
                           <select
                              value={table.getState().pagination.pageSize}
                              onChange={e =>
                                 table.setPageSize(Number(e.target.value))
                              }
                              className="cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 text-base font-semibold tracking-widest text-black italic shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                           >
                              {[50, 100, 200, 300, 400, 500].map(pageSize => (
                                 <option
                                    key={pageSize}
                                    value={pageSize}
                                    className="bg-white text-base font-semibold tracking-widest text-black italic select-none"
                                 >
                                    {pageSize}
                                 </option>
                              ))}
                           </select>
                        </div>

                        {/* Botões de navegação */}
                        <div className="flex items-center gap-3">
                           <button
                              onClick={() => table.setPageIndex(0)}
                              disabled={!table.getCanPreviousPage()}
                              className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              <FiChevronsLeft
                                 className="text-black group-disabled:text-white"
                                 size={24}
                              />
                           </button>

                           <button
                              onClick={() => table.previousPage()}
                              disabled={!table.getCanPreviousPage()}
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
                                    value={
                                       table.getState().pagination.pageIndex + 1
                                    }
                                    onChange={e => {
                                       const page = Number(e.target.value) - 1;
                                       table.setPageIndex(page);
                                    }}
                                    className="cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 text-base font-semibold tracking-widest text-black italic shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                 >
                                    {Array.from(
                                       {
                                          length: table.getPageCount(),
                                       },
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
                                 de {table.getPageCount()}
                              </span>
                           </div>

                           <button
                              onClick={() => table.nextPage()}
                              disabled={!table.getCanNextPage()}
                              className="group cursor-pointer rounded-md border-t-1 border-slate-400 px-4 py-1 shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              <MdChevronRight
                                 className="text-black group-disabled:text-white"
                                 size={24}
                              />
                           </button>

                           <button
                              onClick={() =>
                                 table.setPageIndex(table.getPageCount() - 1)
                              }
                              disabled={!table.getCanNextPage()}
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

            {/* ===== MENSAGEM QUANDO NÃO HÁ CHAMADOS ===== */}
            {data && data.length === 0 && !isLoading && (
               <div className="flex flex-col items-center justify-center gap-4 bg-slate-900 py-20 text-center">
                  <FaExclamationTriangle
                     className="mx-auto text-yellow-600"
                     size={80}
                  />

                  <h3 className="text-2xl font-bold tracking-wider text-white select-none">
                     {user?.tipo === 'ADM'
                        ? `Nenhum Chamado foi encontrado para o Período ${mes.toString().padStart(2, '0')}/${ano}.`
                        : `Nenhum Chamado (excluindo finalizados) foi encontrado para o Período ${mes.toString().padStart(2, '0')}/${ano}.`}
                  </h3>

                  {user?.tipo !== 'ADM' && (
                     <p className="text-base font-semibold tracking-wider text-white italic select-none">
                        Chamados com status "FINALIZADO" não são exibidos para
                        seu perfil.
                     </p>
                  )}
               </div>
            )}

            {/* ===== MENSAGEM QUANDO OS FILTROS NÃO RETORNAM RESULTADOS ===== */}
            {data &&
               data.length > 0 &&
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

         {/* ===== MODAL CHAMADO ===== */}
         <ModalVisualizarDadosChamado
            isOpen={modalChamadosOpen}
            onClose={handleCloseModalChamados}
            chamado={selectedChamado}
         />

         {/* ===== TABELA OS ===== */}
         <TabelaOS
            isOpen={tabelaOSOpen}
            onClose={handleCloseTabelaOS}
            codChamado={selectedCodChamado}
            onSuccess={() => setTabelaOSOpen(false)}
         />

         {/* ===== TABELA TAREFAS ===== */}
         <TabelaTarefas
            isOpen={tabelaTarefasOpen}
            onClose={() => setTabelaTarefasOpen(false)}
         />

         {/* ===== MODAL ATRIBUIÇÃO INTELIGENTE ===== */}
         <ModalAtribuirChamado
            isOpen={modalAtribuicaoOpen}
            onClose={() => setModalAtribuicaoOpen(false)}
            chamado={chamadoParaAtribuir}
         />

         {/* ===== MODAL APONTAMENTO ===== */}
         <ModalApontamento
            isOpen={modalApontamentosOpen}
            onClose={handleCloseApontamentos}
            tarefa={apontamentoData?.tarefa}
            nomeCliente={apontamentoData?.nomeCliente}
            onSuccess={handleApontamentoSuccess}
         />
      </>
   );
}
