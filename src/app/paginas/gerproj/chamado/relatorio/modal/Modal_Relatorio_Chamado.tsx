'use client';
// IMPORTS
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback, useEffect } from 'react';

// COMPONENTS
import { DropdownClientes } from '../modal/Dropdown_Clientes_Recursos';
import { DropdownRecursos } from '../modal/Dropdown_Clientes_Recursos';
import { IsError } from '../../../../../../components/IsError';
import { IsLoading } from '../../../../../../components/IsLoading';
import { FiltrosModalRelatorioChamados } from '../modal/Filtros_Modal_Relatorio_Chamado';
import { TabelaDetalhesRelatorioChamados } from '../tabela/Tabela_Detalhes_Relatorio_Chamado';

// HOOKS
import { useAuth } from '../../../../../../hooks/useAuth';

// ICONS
import { HiDocumentReport } from 'react-icons/hi';
import { IoClose } from 'react-icons/io5';
import { FaEraser, FaExclamationTriangle } from 'react-icons/fa';
import { FaFilterCircleXmark } from 'react-icons/fa6';

// FORMATTERS
import { formatarCodNumber } from '../../../../../../utils/formatters';

// ================================================================================
// CONSTANTES
// ================================================================================
const MODAL_MAX_HEIGHT = 'calc(100vh - 470px)';
const ANIMATION_DURATION = 100;
const CACHE_TIME = 1000 * 60 * 5;

// ================================================================================
// INTERFACES
// ================================================================================
interface DetalheChamado {
   codChamado: number;
   data: string | null;
   hora: string | null;
   assunto: string | null;
   status: string | null;
   prioridade: number | null;
   dataEnvio: string | null;
   diasEmAberto: number | null;
   tempoAtendimentoDias: number | null;
   cliente?: string | null;
   codCliente?: number | null;
   recurso?: string | null;
   codRecurso?: number | null;
   projeto?: string | null;
   codProjeto?: number | null;
   tarefa?: string | null;
   codTarefa?: number | null;
   classificacao?: string | null;
   codClassificacao?: number | null;
}

interface GrupoRelatorio {
   chave: string;
   nome: string;
   quantidadeChamados: number;
   chamadosAbertos: number;
   chamadosFechados: number;
   chamadosPendentes: number;
   mediaTempoAtendimento: number | null;
   detalhes: DetalheChamado[];
   codCliente?: number;
   codRecurso?: number;
   codProjeto?: number;
   codClassificacao?: number;
   status?: string;
}

interface Totalizadores {
   totalChamados: number;
   totalAbertos: number;
   totalFechados: number;
   totalPendentes: number;
   mediaGeralTempoAtendimento: number | null;
   quantidadeGrupos: number;
}

interface RelatorioResponse {
   relatorio: {
      tipoAgrupamento: string;
      periodo: {
         dataInicio: string | null;
         dataFim: string | null;
         mes: string | null;
         ano: string | null;
      };
      filtros: {
         cliente: string | null;
         recurso: string | null;
         projeto: string | null;
         status: string | null;
         prioridade: string | null;
         classificacao: string | null;
      };
      totalizadores: Totalizadores;
      grupos: GrupoRelatorio[];
   };
}

interface Props {
   isOpen?: boolean;
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
         Nenhum chamado foi encontrado no momento
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
// HELPER FUNCTIONS
// ================================================================================
function obterSufixoChamados(quantidade: number): string {
   return quantidade === 1 ? 'Chamado' : 'Chamados';
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export function ModalRelatorioChamados({ isOpen = true, onClose }: Props) {
   const { user } = useAuth();
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   // Estados - Filtros de Data
   const [filtrosData, setFiltrosData] = useState({
      ano: new Date().getFullYear() as number | 'todos',
      mes: (new Date().getMonth() + 1) as number | 'todos',
      diaInicio: 'todos' as number | 'todos',
      diaFim: 'todos' as number | 'todos',
   });

   // Estados - Outros Filtros
   const [clienteSelecionado, setClienteSelecionado] = useState<
      number | 'todos'
   >('todos');
   const [recursoSelecionado, setRecursoSelecionado] = useState<
      number | 'todos'
   >('todos');

   // Estados - UI
   const [selectedGrupo, setSelectedGrupo] = useState<GrupoRelatorio | null>(
      null
   );
   const [isClosing, setIsClosing] = useState(false);

   // Callback para receber os filtros do componente filho
   const handleFiltersChange = useCallback(
      (filters: {
         ano: number | 'todos';
         mes: number | 'todos';
         diaInicio: number | 'todos';
         diaFim: number | 'todos';
      }) => {
         setFiltrosData({
            ano: filters.ano,
            mes: filters.mes,
            diaInicio: filters.diaInicio,
            diaFim: filters.diaFim,
         });
      },
      []
   );

   // Computed Values - Construir datas completas
   const dataInicioCompleta = useMemo(() => {
      if (
         filtrosData.ano === 'todos' ||
         filtrosData.mes === 'todos' ||
         filtrosData.diaInicio === 'todos'
      ) {
         return '';
      }
      const ano = filtrosData.ano;
      const mes = String(filtrosData.mes).padStart(2, '0');
      const dia = String(filtrosData.diaInicio).padStart(2, '0');
      return `${ano}-${mes}-${dia}`;
   }, [filtrosData.ano, filtrosData.mes, filtrosData.diaInicio]);

   const dataFimCompleta = useMemo(() => {
      if (
         filtrosData.ano === 'todos' ||
         filtrosData.mes === 'todos' ||
         filtrosData.diaFim === 'todos'
      ) {
         return '';
      }
      const ano = filtrosData.ano;
      const mes = String(filtrosData.mes).padStart(2, '0');
      const dia = String(filtrosData.diaFim).padStart(2, '0');
      return `${ano}-${mes}-${dia}`;
   }, [filtrosData.ano, filtrosData.mes, filtrosData.diaFim]);

   // Computed Values - Filtros
   const totalActiveFilters = useMemo(() => {
      const filters = [
         filtrosData.ano !== 'todos' ? 'ano' : '',
         filtrosData.mes !== 'todos' ? 'mes' : '',
         filtrosData.diaInicio !== 'todos' ? 'diaInicio' : '',
         filtrosData.diaFim !== 'todos' ? 'diaFim' : '',
         clienteSelecionado !== 'todos' ? 'cliente' : '',
         recursoSelecionado !== 'todos' ? 'recurso' : '',
      ];
      return filters.filter(f => f?.trim()).length;
   }, [
      filtrosData.ano,
      filtrosData.mes,
      filtrosData.diaInicio,
      filtrosData.diaFim,
      clienteSelecionado,
      recursoSelecionado,
   ]);

   const filtrosAplicados = useMemo(() => {
      const filtros: any = {};

      if (dataInicioCompleta) filtros.dataInicio = dataInicioCompleta;
      if (dataFimCompleta) filtros.dataFim = dataFimCompleta;

      if (filtrosData.ano !== 'todos' && filtrosData.mes !== 'todos') {
         filtros.ano = String(filtrosData.ano);
         filtros.mes = String(filtrosData.mes).padStart(2, '0');
      }

      if (clienteSelecionado !== 'todos')
         filtros.codCliente = String(clienteSelecionado);
      if (recursoSelecionado !== 'todos')
         filtros.codRecurso = String(recursoSelecionado);

      return filtros;
   }, [
      dataInicioCompleta,
      dataFimCompleta,
      filtrosData.ano,
      filtrosData.mes,
      clienteSelecionado,
      recursoSelecionado,
   ]);

   // Query Params e API
   const enabled = useMemo(() => {
      return !!(token && user);
   }, [token, user]);

   const queryParams = useMemo(() => {
      if (!user) return new URLSearchParams();

      const params = new URLSearchParams({
         agruparPor: 'cliente',
      });

      if (filtrosData.ano !== 'todos' && filtrosData.mes !== 'todos') {
         params.append('ano', String(filtrosData.ano));
         params.append('mes', String(filtrosData.mes).padStart(2, '0'));
      }

      if (dataInicioCompleta) params.append('dataInicio', dataInicioCompleta);
      if (dataFimCompleta) params.append('dataFim', dataFimCompleta);

      if (clienteSelecionado !== 'todos')
         params.append('codCliente', String(clienteSelecionado));
      if (recursoSelecionado !== 'todos')
         params.append('codRecurso', String(recursoSelecionado));

      return params;
   }, [
      user,
      filtrosData.ano,
      filtrosData.mes,
      dataInicioCompleta,
      dataFimCompleta,
      clienteSelecionado,
      recursoSelecionado,
   ]);

   // Função para buscar o relatório
   async function fetchRelatorio(
      params: URLSearchParams,
      token: string
   ): Promise<RelatorioResponse> {
      const res = await fetch(`/api/chamado/relatorio?${params}`, {
         headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
         },
      });

      if (!res.ok) {
         const errorData = await res.json();
         throw new Error(errorData.error || 'Erro ao buscar relatório');
      }

      return await res.json();
   }

   // React Query - Buscar Relatório
   const {
      data: relatorioData,
      isLoading,
      isError,
      error,
   } = useQuery({
      queryKey: ['relatorioChamados', queryParams.toString(), token],
      queryFn: () => fetchRelatorio(queryParams, token!),
      enabled,
      staleTime: CACHE_TIME,
      retry: 2,
   });

   // Computed Values - Totalizadores e Grupos
   const totalizadores = relatorioData?.relatorio.totalizadores;
   const grupos = useMemo(
      () => relatorioData?.relatorio.grupos || [],
      [relatorioData]
   );

   // Handlers - Filtros
   const clearFilters = useCallback(() => {
      const hoje = new Date();
      setFiltrosData({
         ano: hoje.getFullYear(),
         mes: hoje.getMonth() + 1,
         diaInicio: 'todos',
         diaFim: 'todos',
      });
      setClienteSelecionado('todos');
      setRecursoSelecionado('todos');
   }, []);

   // Handlers - UI
   const handleCloseRelatorio = useCallback(() => {
      setIsClosing(true);
      setTimeout(() => {
         setIsClosing(false);
         onClose();
      }, ANIMATION_DURATION);
   }, [onClose]);

   // Query de Clientes
   const { data: clientes = [], isLoading: loadingClientes } = useQuery({
      queryKey: [
         'clientes',
         filtrosData.ano,
         filtrosData.mes,
         dataInicioCompleta,
         dataFimCompleta,
      ],
      queryFn: async () => {
         const url = new URL('/api/cliente', window.location.origin);

         if (filtrosData.ano !== 'todos' && filtrosData.mes !== 'todos') {
            url.searchParams.append('ano', String(filtrosData.ano));
            url.searchParams.append(
               'mes',
               String(filtrosData.mes).padStart(2, '0')
            );
         }

         if (dataInicioCompleta && dataInicioCompleta.trim()) {
            url.searchParams.append('dataInicio', dataInicioCompleta);
         }

         if (dataFimCompleta && dataFimCompleta.trim()) {
            url.searchParams.append('dataFim', dataFimCompleta);
         }

         const response = await fetch(url.toString(), {
            headers: { Authorization: `Bearer ${token}` },
         });

         if (!response.ok) throw new Error('Erro ao buscar clientes');
         return response.json();
      },
      enabled: !!token && isOpen,
   });

   // Reset cliente quando filtros de data mudam
   useEffect(() => {
      setClienteSelecionado('todos');
   }, [filtrosData.ano, filtrosData.mes, dataInicioCompleta, dataFimCompleta]);

   // Reset recurso quando cliente muda
   useEffect(() => {
      setRecursoSelecionado('todos');
   }, [clienteSelecionado]);

   // Query de Recursos
   const { data: recursos = [], isLoading: loadingRecursos } = useQuery({
      queryKey: [
         'recursos',
         clienteSelecionado,
         filtrosData.ano,
         filtrosData.mes,
         dataInicioCompleta,
         dataFimCompleta,
      ],
      queryFn: async () => {
         const url = new URL('/api/recurso', window.location.origin);

         if (clienteSelecionado !== 'todos') {
            url.searchParams.append('codCliente', String(clienteSelecionado));
         }

         if (filtrosData.ano !== 'todos' && filtrosData.mes !== 'todos') {
            url.searchParams.append('ano', String(filtrosData.ano));
            url.searchParams.append(
               'mes',
               String(filtrosData.mes).padStart(2, '0')
            );
         }

         if (dataInicioCompleta && dataInicioCompleta.trim()) {
            url.searchParams.append('dataInicio', dataInicioCompleta);
         }

         if (dataFimCompleta && dataFimCompleta.trim()) {
            url.searchParams.append('dataFim', dataFimCompleta);
         }

         const response = await fetch(url.toString(), {
            headers: { Authorization: `Bearer ${token}` },
         });

         if (!response.ok) throw new Error('Erro ao buscar recursos');
         return response.json();
      },
      enabled: !!token && isOpen,
      staleTime: CACHE_TIME,
   });

   // Validações e Estados de Carregamento
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
            title="Aguarde... Buscando informações no sistema, para geração do relatório"
         />
      );
   }

   // Renderização
   return (
      <>
         <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* OVERLAY */}
            <div className="absolute inset-0 bg-teal-900" />

            {/* CONTAINER */}
            <div
               className={`animate-in slide-in-from-bottom-4 z-10 flex max-h-[90vh] w-full max-w-[95vw] flex-col overflow-hidden rounded-2xl transition-all duration-500 ease-out ${
                  isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
               }`}
               style={{
                  animationDuration: `${ANIMATION_DURATION}ms`,
               }}
            >
               {/* HEADER */}
               <header className="flex flex-col gap-4 bg-white/50 p-6">
                  <div className="flex items-center justify-between gap-8">
                     <div className="flex items-center justify-center gap-6">
                        <HiDocumentReport className="text-black" size={72} />
                        <h1 className="text-4xl font-extrabold tracking-widest text-black uppercase select-none">
                           Relatório / Chamados
                        </h1>
                     </div>

                     <button
                        onClick={handleCloseRelatorio}
                        className="group cursor-pointer rounded-full bg-red-500/50 p-3 transition-all hover:scale-110 hover:rotate-180 hover:bg-red-500 active:scale-95"
                     >
                        <IoClose
                           className="text-white group-hover:scale-125"
                           size={24}
                        />
                     </button>
                  </div>

                  {/* FILTROS & CARDS */}
                  <div className="flex items-center justify-between gap-6">
                     {/* SEÇÃO DE FILTROS */}
                     <div className="flex w-[1600px] flex-col gap-4">
                        <div className="flex items-center justify-between">
                           <FiltrosModalRelatorioChamados
                              onFiltersChange={handleFiltersChange}
                              initialAno={filtrosData.ano}
                              initialMes={filtrosData.mes}
                              initialDiaInicio={filtrosData.diaInicio}
                              initialDiaFim={filtrosData.diaFim}
                           />

                           <button
                              onClick={clearFilters}
                              title="Limpar Filtros"
                              className="mt-7 cursor-pointer rounded-full border-none bg-gradient-to-br from-red-600 to-red-700 px-6 py-2.5 text-lg font-extrabold tracking-widest text-white shadow-md shadow-black transition-all hover:scale-110 active:scale-95"
                           >
                              <FaEraser
                                 size={20}
                                 className="text-white group-hover:scale-110"
                              />
                           </button>
                        </div>

                        {/* LINHA 2: CLIENTE E RECURSO */}
                        <div className="grid grid-cols-2 gap-6">
                           <DropdownClientes
                              value={clienteSelecionado}
                              onChange={setClienteSelecionado}
                              placeholder="Selecione o Cliente"
                              clientes={clientes}
                              isLoading={loadingClientes}
                           />

                           <DropdownRecursos
                              value={recursoSelecionado}
                              onChange={setRecursoSelecionado}
                              placeholder="Selecione o Recurso"
                              recursos={recursos}
                              isLoading={loadingRecursos}
                           />
                        </div>
                     </div>

                     {/* CARDS DE TOTALIZADORES */}
                     {totalizadores && (
                        <div className="grid flex-1 grid-cols-2 gap-4">
                           <div className="flex flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-purple-600 bg-gradient-to-br from-purple-600 to-purple-700 p-6 shadow-md shadow-black">
                              <div className="text-sm font-extrabold tracking-widest text-white italic select-none">
                                 TOTAL DE CHAMADOS
                              </div>
                              <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                                 {formatarCodNumber(
                                    totalizadores.totalChamados
                                 )}
                              </div>
                           </div>

                           <div className="flex flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-green-600 bg-gradient-to-br from-green-600 to-green-700 p-6 shadow-md shadow-black">
                              <div className="text-sm font-extrabold tracking-widest text-white italic select-none">
                                 CHAMADOS FECHADOS
                              </div>
                              <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                                 {formatarCodNumber(
                                    totalizadores.totalFechados
                                 )}
                              </div>
                           </div>

                           <div className="flex flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-blue-600 bg-gradient-to-br from-blue-600 to-blue-700 p-6 shadow-md shadow-black">
                              <div className="text-sm font-extrabold tracking-widest text-white uppercase italic select-none">
                                 CHAMADOS ABERTOS
                              </div>
                              <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                                 {formatarCodNumber(totalizadores.totalAbertos)}
                              </div>
                           </div>

                           <div className="flex flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-yellow-600 bg-gradient-to-br from-yellow-600 to-yellow-700 p-6 shadow-md shadow-black">
                              <div className="text-sm font-extrabold tracking-widest text-white italic select-none">
                                 CHAMADOS PENDENTES
                              </div>
                              <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                                 {formatarCodNumber(
                                    totalizadores.totalPendentes
                                 )}
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               </header>

               {/* CONTEÚDO PRINCIPAL */}
               <main className="h-full w-full overflow-hidden bg-black">
                  <div
                     className="h-full overflow-y-auto"
                     style={{ maxHeight: MODAL_MAX_HEIGHT }}
                  >
                     {grupos.length === 0 ? (
                        totalActiveFilters > 0 ? (
                           <NoResultsState
                              totalActiveFilters={totalActiveFilters}
                              clearFilters={clearFilters}
                           />
                        ) : (
                           <EmptyState />
                        )
                     ) : (
                        <div className="flex flex-col gap-5 p-6">
                           {grupos.map(grupo => (
                              <div
                                 key={grupo.chave}
                                 onClick={() => setSelectedGrupo(grupo)}
                                 title="Clique para visualizar os detalhes"
                                 className="cursor-pointer overflow-hidden rounded-lg bg-amber-500 shadow-md shadow-black transition-all hover:shadow-lg hover:shadow-black"
                              >
                                 {/* CABEÇALHO DO GRUPO */}
                                 <div className="group flex items-center justify-between bg-gradient-to-br from-teal-600 to-teal-700 px-6 py-1 transition-all hover:scale-[0.97] hover:from-teal-800 hover:to-teal-900">
                                    <div className="flex flex-1 items-center gap-4">
                                       <div className="flex flex-col gap-1">
                                          <h3 className="text-xl font-extrabold tracking-widest text-white uppercase transition-colors select-none">
                                             {grupo.nome}
                                          </h3>
                                          <p className="pl-4 text-sm font-semibold tracking-widest text-white italic transition-colors select-none">
                                             {formatarCodNumber(
                                                grupo.quantidadeChamados
                                             )}{' '}
                                             {obterSufixoChamados(
                                                grupo.quantidadeChamados
                                             )}
                                             {' | Abertos: '}
                                             {formatarCodNumber(
                                                grupo.chamadosAbertos
                                             )}
                                             {' | Fechados: '}
                                             {formatarCodNumber(
                                                grupo.chamadosFechados
                                             )}
                                             {' | Pendentes: '}
                                             {formatarCodNumber(
                                                grupo.chamadosPendentes
                                             )}
                                          </p>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </main>
            </div>
         </div>

         {/* MODAL DE DETALHES */}
         {selectedGrupo && (
            <TabelaDetalhesRelatorioChamados
               grupo={selectedGrupo}
               agruparPor="cliente"
               filtrosAplicados={filtrosAplicados}
               onClose={() => setSelectedGrupo(null)}
            />
         )}
      </>
   );
}
