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
} from '@tanstack/react-table';
// ================================================================================
import {
   InputGlobalFilter,
   FilterInputTableHeaderDebounce,
   FilterControls,
   useTableFilters,
} from '../components/TableFilters';
// ================================================================================
import { TabelaChamadoProps } from '../../../../types/types';
// ================================================================================
import IsError from '../components/Error';
import IsLoading from '../components/Loading';
import TabelaOS from '../components/tabelas/Tabela_OS';
import TabelaTarefas from '../components/tabelas/Tabela_Tarefas';
import TabelaOSChamado from '../components/tabelas/Tabela_OS_Chamado';
import { useAuth } from '../../../../hooks/useAuth';
import ModalApontamento from '../components/modais/Modal_Apontamento_OS_Tarefa';
import { ModalAtribuirChamado } from './Modal_Atribuir_Chamado';
import { colunasTabelaChamados } from './Colunas_Tabela_Chamado';
import { useFiltersTabelaChamados } from '../../../../contexts/Filters_Context';
import { ModalVisualizarDadosChamado } from './Modal_Visualizar_Chamado';
import DropdownHeader from './Dropdown_Tabela_Chamado';
// ================================================================================
import { IoCall } from 'react-icons/io5';
import { BsEraserFill } from 'react-icons/bs';
import { FaFilterCircleXmark } from 'react-icons/fa6';
import { FaExclamationTriangle } from 'react-icons/fa';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { ModalExcluirChamado } from './Modal_Deletar_Chamado';

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
   data: TabelaChamadoProps[];
   pagination: PaginationInfo;
}

// ================================================================================
// UTILITÁRIOS
// ================================================================================
function getColumnWidth(columnId: string, userType?: string): string {
   if (userType === 'ADM') {
      const widthMapAdmin: Record<string, string> = {
         COD_CHAMADO: '10%',
         DATA_CHAMADO: '10%',
         ASSUNTO_CHAMADO: '24%',
         STATUS_CHAMADO: '18%',
         DTENVIO_CHAMADO: '10%',
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
      DTENVIO_CHAMADO: '15%',
      NOME_RECURSO: '15%',
      EMAIL_CHAMADO: '20%',
      actions: '7%',
   };

   return widthMap[columnId] || 'auto';
}

// Logo após os imports, antes do componente principal
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
   const [tabelaOsOpen, setTabelaOsOpen] = useState(false);
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
   const [chamadoParaExcluir, setChamadoParaExcluir] = useState<number | null>(
      null
   );

   // ================================================================================
   // ESTADOS - FILTROS E ORDENAÇÃO
   // ================================================================================
   // const [filterCodChamado, setFilterCodChamado] = useState('');
   // const [filterDataChamado, setFilterDataChamado] = useState('');
   // const [filterAssunto, setFilterAssunto] = useState('');
   // const [filterStatus, setFilterStatus] = useState('');
   // const [filterNomeRecurso, setFilterNomeRecurso] = useState('');

   // Estados para valores digitados (sem delay)
   const [inputCodChamado, setInputCodChamado] = useState('');
   const [inputDataChamado, setInputDataChamado] = useState('');
   const [inputAssunto, setInputAssunto] = useState('');
   const [inputStatus, setInputStatus] = useState('');
   const [inputNomeRecurso, setInputNomeRecurso] = useState('');

   // Estados debouncados (com delay de 500ms)
   const filterCodChamado = useDebouncedValue(inputCodChamado, 500);
   const filterDataChamado = useDebouncedValue(inputDataChamado, 500);
   const filterAssunto = useDebouncedValue(inputAssunto, 500);
   const filterStatus = useDebouncedValue(inputStatus, 500);
   const filterNomeRecurso = useDebouncedValue(inputNomeRecurso, 500);

   const [globalFilter, setGlobalFilter] = useState('');
   const [sorting, setSorting] = useState<SortingState>([
      { id: 'COD_CHAMADO', desc: true },
   ]);
   const [filterValues, setFilterValues] = useState({
      COD_CHAMADO: '',
      DATA_CHAMADO: '',
      ASSUNTO_CHAMADO: '',
      STATUS_CHAMADO: '',
      DTENVIO_CHAMADO: '',
      EMAIL_CHAMADO: '',
      NOME_RECURSO: '',
      global: '',
   });
   const [showFilters, setShowFilters] = useState(false);

   // ================================================================================
   // ESTADOS - PAGINAÇÃO API
   // ================================================================================
   const [currentPage, setCurrentPage] = useState(1);
   const [pageSize, setPageSize] = useState(20);
   const [codChamadoFilter, setCodChamadoFilter] = useState('');

   const [activeView, setActiveView] = useState<'chamados' | 'os' | 'tarefas'>(
      'chamados'
   );

   // ================================================================================
   // FUNÇÕES DE FILTRO
   // ================================================================================
   const totalActiveFilters = useMemo(() => {
      let count = 0;
      if (globalFilter && globalFilter.trim()) count += 1;
      if (filterCodChamado && filterCodChamado.trim()) count += 1;
      if (filterDataChamado && filterDataChamado.trim()) count += 1;
      if (filterAssunto && filterAssunto.trim()) count += 1;
      if (filterStatus && filterStatus.trim()) count += 1;
      if (filterNomeRecurso && filterNomeRecurso.trim()) count += 1;
      if (codChamadoFilter && codChamadoFilter.trim()) count += 1;
      return count;
   }, [
      globalFilter,
      filterCodChamado,
      filterDataChamado,
      filterAssunto,
      filterStatus,
      filterNomeRecurso,
      codChamadoFilter,
   ]);

   const clearFilters = () => {
      setGlobalFilter('');
      setInputCodChamado('');
      setInputDataChamado('');
      setInputAssunto('');
      setInputStatus('');
      setInputNomeRecurso('');
      setCodChamadoFilter('');
      setCurrentPage(1);
   };

   // Atualiza os valores locais quando os filtros mudam
   useEffect(() => {
      setCurrentPage(1);
   }, [
      filterCodChamado,
      filterDataChamado,
      filterAssunto,
      filterStatus,
      filterNomeRecurso,
      globalFilter,
   ]);

   // ================================================================================
   // API E DADOS
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
      if (filterNomeRecurso && filterNomeRecurso.trim()) {
         params.append('filter_NOME_RECURSO', filterNomeRecurso.trim());
      }

      if (codChamadoFilter && codChamadoFilter.trim()) {
         params.append('codChamado', codChamadoFilter.trim());
      }

      return params;
   }, [
      ano,
      mes,
      user,
      currentPage,
      pageSize,
      globalFilter,
      filterCodChamado,
      filterDataChamado,
      filterAssunto,
      filterStatus,
      filterNomeRecurso,
      codChamadoFilter,
   ]);

   async function fetchChamados(
      params: URLSearchParams,
      token: string
   ): Promise<ApiResponse> {
      const res = await fetch(`/api/chamados/tabela-chamado?${params}`, {
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

   // Query principal para buscar os chamados
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

   // Extrai dados e paginação da resposta da API
   const data = useMemo(() => apiResponse?.data || [], [apiResponse]);
   const paginationInfo = apiResponse?.pagination;

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
         setModalAtribuicaoOpen(true); // ✅ ADICIONE ESTA LINHA
      },
      []
   );

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
   // HANDLERS DE PAGINAÇÃO
   // ================================================================================
   const handlePageChange = (newPage: number) => {
      setCurrentPage(newPage);
   };

   const handlePageSizeChange = (newSize: number) => {
      setPageSize(newSize);
      setCurrentPage(1);
   };

   const handleOpenModalExcluirChamado = (codChamado: number) => {
      setChamadoParaExcluir(codChamado);
   };

   const handleCloseModalExcluirChamado = () => {
      setChamadoParaExcluir(null);
   };

   // ================================================================================
   // CONFIGURAÇÃO DA TABELA
   // ================================================================================
   const colunas = useMemo(
      () =>
         colunasTabelaChamados(
            {
               onVisualizarChamado: handleVisualizarChamado,
               onVisualizarOSChamado: handleVisualizarOS,
               onVisualizarTarefas: () => setTabelaTarefasOpen(true),
               onVisualizarOS: () => {
                  setTabelaOsOpen(true);
               },
               onAtribuicaoInteligente: handleAbrirAtribuicaoInteligente,
               onUpdateStatus: updateStatus,
               onOpenApontamentos: handleOpenApontamentos,
               onExcluirChamado: handleOpenModalExcluirChamado,
               userType: user?.tipo,
            },
            user?.tipo
         ),
      [
         handleVisualizarChamado,
         handleVisualizarOS,
         handleAbrirAtribuicaoInteligente,
         handleOpenApontamentos,
         updateStatus,
         user?.tipo,
      ]
   );

   // Tabela agora usa apenas os dados da API sem paginação local
   const table = useReactTable({
      data: data ?? [],
      columns: colunas,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      // ❌ REMOVA getFilteredRowModel()
      // ❌ REMOVA onColumnFiltersChange
      onGlobalFilterChange: setGlobalFilter, // Manter apenas global
      onSortingChange: setSorting,
      state: {
         // ❌ REMOVA columnFilters
         globalFilter,
         sorting,
      },
      manualPagination: true,
      manualFiltering: true, // ✅ ADICIONE
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
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <>
         {/* BOTÃO PARA VOLTAR AOS CHAMADOS (quando em outras views) */}
         {activeView !== 'chamados' && (
            <div className="mb-4">
               <button
                  onClick={() => setActiveView('chamados')}
                  className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
               >
                  <IoCall size={20} />
                  Voltar aos Chamados
               </button>
            </div>
         )}

         {/* VIEW DE CHAMADOS - TODO O CONTEÚDO ATUAL DA TABELA */}
         {activeView === 'chamados' && (
            <div className="overflow-hidden rounded-2xl bg-black shadow-xl shadow-black">
               {/* ===== HEADER COM DROPDOWN ===== */}
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

                     {/* DROPDOWN DE MÓDULOS */}
                     {user.tipo === 'ADM' && (
                        <div className="flex items-center gap-4">
                           <DropdownHeader
                              onOpenTabelaOS={() => setActiveView('os')}
                              onOpenTabelaTarefas={() =>
                                 setActiveView('tarefas')
                              }
                           />
                        </div>
                     )}
                  </section>

                  {/* ===== FILTROS GLOBAIS ===== */}
                  <div className="flex items-center gap-8">
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
                                       {column.id === 'COD_CHAMADO' && (
                                          <FilterInputTableHeaderDebounce
                                             value={inputCodChamado}
                                             onChange={value =>
                                                setInputCodChamado(
                                                   String(value)
                                                )
                                             }
                                          />
                                       )}
                                       {column.id === 'DATA_CHAMADO' && (
                                          <FilterInputTableHeaderDebounce
                                             value={inputDataChamado}
                                             onChange={value =>
                                                setInputDataChamado(
                                                   String(value)
                                                )
                                             }
                                             type="text"
                                          />
                                       )}
                                       {column.id === 'ASSUNTO_CHAMADO' && (
                                          <FilterInputTableHeaderDebounce
                                             value={inputAssunto}
                                             onChange={value =>
                                                setInputAssunto(String(value))
                                             }
                                          />
                                       )}
                                       {column.id === 'STATUS_CHAMADO' && (
                                          <FilterInputTableHeaderDebounce
                                             value={inputStatus}
                                             onChange={value =>
                                                setInputStatus(String(value))
                                             }
                                          />
                                       )}
                                       {column.id === 'NOME_RECURSO' && (
                                          <FilterInputTableHeaderDebounce
                                             value={inputNomeRecurso}
                                             onChange={value =>
                                                setInputNomeRecurso(
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

               {/* ===== MENSAGEM QUANDO NÃO HÁ CHAMADOS ===== */}
               {(!paginationInfo || paginationInfo.totalRecords === 0) &&
                  !isLoading && (
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
                              Chamados com status "FINALIZADO" não são exibidos
                              para seu perfil.
                           </p>
                        )}
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
         )}

         {/* VIEW DA TABELA DE OS */}
         {activeView === 'os' && (
            <TabelaOS isOpen={true} onClose={() => setActiveView('chamados')} />
         )}

         {/* VIEW DA TABELA DE TAREFAS */}
         {activeView === 'tarefas' && (
            <TabelaTarefas
               isOpen={true}
               onClose={() => setActiveView('chamados')}
            />
         )}

         <TabelaOS
            isOpen={tabelaOsOpen}
            onClose={() => setTabelaOsOpen(false)}
         />

         {/* ===== MODAL CHAMADO ===== */}
         <ModalVisualizarDadosChamado
            isOpen={modalChamadosOpen}
            onClose={handleCloseModalChamados}
            chamado={selectedChamado}
         />

         {/* ===== TABELA OS ===== */}
         <TabelaOSChamado
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

         <ModalExcluirChamado
            isOpen={!!chamadoParaExcluir}
            onClose={handleCloseModalExcluirChamado}
            codChamado={chamadoParaExcluir}
         />
      </>
   );
}
