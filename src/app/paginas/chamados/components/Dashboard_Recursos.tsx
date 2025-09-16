import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
// ================================================================================
import {
   FaUserLock,
   FaSearch,
   FaUser,
   FaCheckCircle,
   FaExclamationTriangle,
   FaFilter,
} from 'react-icons/fa';
import { FaShield, FaClock } from 'react-icons/fa6';
import { IoBarChart, IoAlertCircle } from 'react-icons/io5';
import { SiTarget } from 'react-icons/si';
import { ImUsers } from 'react-icons/im';
import { BsAwardFill } from 'react-icons/bs';
import { BiSolidZap } from 'react-icons/bi';
import { HiTrendingUp } from 'react-icons/hi';
import { FiActivity } from 'react-icons/fi';
import { LuRefreshCw } from 'react-icons/lu';
// ================================================================================
import { Loader2 } from 'lucide-react';
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '../../../../components/ui/tooltip';
// ================================================================================

// Tipos para as APIs
interface RecursoStats {
   COD_RECURSO: number;
   NOME_RECURSO: string;
   TOTAL_CHAMADOS_ATIVOS: number;
   CHAMADOS_ALTA_PRIORIDADE: number;
   CHAMADOS_CRITICOS: number;
   SCORE_CARGA_TRABALHO: number;
   RECOMENDACAO: 'DISPONÍVEL' | 'MODERADO' | 'SOBRECARREGADO' | 'CRÍTICO';
   PERCENTUAL_ALTA_PRIORIDADE: number;
   TEMPO_MEDIO_RESOLUCAO: number | null;
}

// Componente principal do Dashboard
const DashboardRecursos = () => {
   const [selectedRecurso, setSelectedRecurso] = useState<number | null>(null);
   const [showSugestao, setShowSugestao] = useState(false);
   const [novoChamado, setNovoChamado] = useState({
      prioridade: 100,
      codCliente: '',
      assunto: '',
   });
   const [filtroRecomendacao, setFiltroRecomendacao] =
      useState<string>('TODOS');
   const [searchTerm, setSearchTerm] = useState('');
   const [showOverlay, setShowOverlay] = useState(false);
   const [overlayContent, setOverlayContent] = useState<{
      title: string;
      message: string;
      type: 'info' | 'warning' | 'error' | 'success';
   } | null>(null);

   // Token de autenticação
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   // Função para mostrar overlay
   const showOverlayMessage = (
      title: string,
      message: string,
      type: 'info' | 'warning' | 'error' | 'success' = 'info'
   ) => {
      setOverlayContent({ title, message, type });
      setShowOverlay(true);
   };

   // Query para buscar recursos gerais
   const {
      data: recursosData,
      isLoading: loadingRecursos,
      refetch: refetchRecursos,
      error: errorRecursos,
   } = useQuery({
      queryKey: ['dashboard-recursos'],
      queryFn: async () => {
         try {
            const response = await fetch('/api/atribuir-chamado/recursos', {
               headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Erro ao buscar recursos');
            return response.json();
         } catch (error) {
            showOverlayMessage(
               'Erro de Conexão',
               'Não foi possível carregar os recursos. Verifique sua conexão e tente novamente.',
               'error'
            );
            throw error;
         }
      },
      enabled: !!token,
      refetchInterval: 30000,
   });

   // Query para buscar detalhes de um recurso específico
   const {
      data: recursoDetalhado,
      isLoading: loadingDetalhe,
      error: errorDetalhe,
   } = useQuery({
      queryKey: ['dashboard-recurso', selectedRecurso],
      queryFn: async () => {
         try {
            const response = await fetch(
               `/api/atribuir-chamado/recurso/${selectedRecurso}`,
               {
                  headers: { Authorization: `Bearer ${token}` },
               }
            );
            if (!response.ok)
               throw new Error('Erro ao buscar detalhes do recurso');
            return response.json();
         } catch (error) {
            showOverlayMessage(
               'Erro ao Carregar',
               'Não foi possível carregar os detalhes do recurso selecionado.',
               'error'
            );
            throw error;
         }
      },
      enabled: !!selectedRecurso && !!token,
   });

   // Query para sugestão de recurso
   const { data: sugestaoData, isLoading: loadingSugestao } = useQuery({
      queryKey: ['sugestao-recurso', novoChamado],
      queryFn: async () => {
         const response = await fetch(
            '/api/atribuir-chamado/sugestao-recurso',
            {
               method: 'POST',
               headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify(novoChamado),
            }
         );
         if (!response.ok) throw new Error('Erro ao buscar sugestão');
         return response.json();
      },
      enabled: showSugestao && !!token && novoChamado.prioridade > 0,
   });

   // Filtrar recursos
   const recursosFiltrados = useMemo(() => {
      if (!recursosData?.recursos) return [];

      return recursosData.recursos.filter((recurso: RecursoStats) => {
         const matchesSearch = recurso.NOME_RECURSO.toLowerCase().includes(
            searchTerm.toLowerCase()
         );
         const matchesFilter =
            filtroRecomendacao === 'TODOS' ||
            recurso.RECOMENDACAO === filtroRecomendacao;
         return matchesSearch && matchesFilter;
      });
   }, [recursosData?.recursos, searchTerm, filtroRecomendacao]);

   // Função para obter cor da recomendação
   const getRecomendacaoColor = (recomendacao: string) => {
      const colors = {
         DISPONÍVEL: 'green-600',
         MODERADO: 'yellow-500',
         SOBRECARREGADO: 'orange-600',
         CRÍTICO: 'red-600',
      };
      return (
         colors[recomendacao as keyof typeof colors] ||
         'from-slate-500 to-slate-600'
      );
   };

   // Função para obter ícone da recomendação
   const getRecomendacaoIcon = (recomendacao: string) => {
      const icons = {
         DISPONÍVEL: FaCheckCircle,
         MODERADO: FaClock,
         SOBRECARREGADO: FaExclamationTriangle,
         CRÍTICO: IoAlertCircle,
      };
      const Icon = icons[recomendacao as keyof typeof icons] || FiActivity;
      return <Icon size={16} />;
   };

   // Função para selecionar recurso
   const handleSelectRecurso = (recursoId: number) => {
      setSelectedRecurso(recursoId);
      setShowSugestao(false);
   };

   // ================================================================================
   // ESTADOS DE CARREGAMENTO E VALIDAÇÃO
   // ================================================================================
   if (loadingRecursos) {
      return (
         <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="space-y-8 text-center">
               <div className="relative flex items-center justify-center">
                  <div className="relative">
                     <Loader2
                        className="animate-spin text-cyan-400 drop-shadow-2xl"
                        size={80}
                     />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <FaUserLock className="text-violet-400" size={32} />
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-3xl font-bold text-transparent">
                     Autenticando usuário
                  </h3>
                  <div className="flex items-center justify-center space-x-2">
                     <span className="text-lg text-slate-400">Carregando</span>
                     <div className="flex space-x-1">
                        {[0, 1, 2].map(i => (
                           <div
                              key={i}
                              className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-400"
                           />
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   // ================================================================================
   // RENDERIZAÇÃO PRINCIPAL
   // ================================================================================
   return (
      <div className="h-screen overflow-y-auto bg-slate-950 text-white">
         <div className="relative mx-auto max-w-7xl space-y-4 p-6">
            {/* ===== HEADER ===== */}
            <div className="relative overflow-hidden rounded-md border border-slate-600 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
               <div className="relative flex items-center justify-between p-6">
                  <div className="flex items-center gap-6">
                     <div className="rounded-md bg-blue-600 p-4 shadow-sm shadow-white">
                        <ImUsers size={32} className="text-white" />
                     </div>
                     <div>
                        <h1 className="text-4xl font-extrabold tracking-wider text-white select-none">
                           Dashboard de Recursos
                        </h1>
                        <p className="text-lg font-semibold tracking-widest text-slate-300 italic select-none">
                           Gestão inteligente de atribuição de chamados
                        </p>
                     </div>
                  </div>
                  <Tooltip>
                     <TooltipTrigger asChild>
                        <button
                           onClick={() => refetchRecursos()}
                           className="flex cursor-pointer items-center gap-3 rounded-md bg-blue-600 px-6 py-2 text-lg font-bold tracking-wider text-white shadow-sm shadow-white transition-all select-none hover:scale-110 hover:bg-blue-900 hover:shadow-md hover:shadow-white active:scale-95"
                        >
                           <LuRefreshCw size={20} />
                           <span>Atualizar</span>
                        </button>
                     </TooltipTrigger>
                     <TooltipContent
                        side="top"
                        align="center"
                        sideOffset={8}
                        className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
                     >
                        Atualizar Dashboard
                     </TooltipContent>
                  </Tooltip>
               </div>
            </div>

            {/* ===== CARDS ===== */}
            {recursosData?.resumoGeral && (
               <div className="grid grid-cols-4 gap-4">
                  {[
                     {
                        title: 'Chamados Ativos',
                        value: recursosData.resumoGeral.totalChamadosAtivos,
                        icon: FiActivity,
                        gradient: 'blue-500',
                        bgGradient: 'blue-600',
                     },
                     {
                        title: 'Chamados Críticos',
                        value: recursosData.resumoGeral.totalChamadosCriticos,
                        icon: IoAlertCircle,
                        gradient: 'red-500',
                        bgGradient: 'red-600',
                     },
                     {
                        title: 'Recursos Disponíveis',
                        value: recursosData.resumoGeral.recursosDisponiveis,
                        icon: FaCheckCircle,
                        gradient: 'green-500',
                        bgGradient: 'green-600',
                     },
                     {
                        title: 'Sobrecarregados',
                        value: recursosData.resumoGeral.recursosSobrecarregados,
                        icon: HiTrendingUp,
                        gradient: 'orange-500',
                        bgGradient: 'orange-600',
                     },
                  ].map((stat, index) => (
                     <div
                        key={index}
                        className={`relative overflow-hidden rounded-md bg-${stat.bgGradient} p-6`}
                     >
                        <div className="flex items-center justify-between">
                           <div className="space-y-2">
                              <p className="text-sm font-semibold tracking-wider text-white select-none">
                                 {stat.title}
                              </p>
                              <p className="text-3xl font-extrabold tracking-wider text-white select-none">
                                 {stat.value}
                              </p>
                           </div>
                           <div
                              className={`rounded-md bg-${stat.gradient} p-3 shadow-md shadow-black`}
                           >
                              <stat.icon size={24} className="text-white" />
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}

            {/* ===== ALERTAS ===== */}
            {recursosData?.alertas && recursosData.alertas.length > 0 && (
               <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6 backdrop-blur-xl">
                  <div className="mb-4 flex items-center space-x-3">
                     <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2">
                        <FaExclamationTriangle
                           className="text-white drop-shadow-sm"
                           size={20}
                        />
                     </div>
                     <h3 className="text-lg font-bold text-amber-200">
                        Alertas do Sistema
                     </h3>
                  </div>
                  <div className="space-y-2">
                     {recursosData.alertas.map(
                        (alerta: string, index: number) => (
                           <p
                              key={index}
                              className="flex items-center space-x-2 text-amber-100"
                           >
                              <div className="h-1.5 w-1.5 rounded-full bg-amber-400"></div>
                              <span>{alerta}</span>
                           </p>
                        )
                     )}
                  </div>
               </div>
            )}

            {/* ===== LISTA DE RECURSOS E DETALHES ===== */}
            <div className="grid grid-cols-3 gap-6">
               {/* ===== RECURSOS ===== */}
               <div className="col-span-2 overflow-hidden rounded-md border border-slate-600 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                  <div className="border-b border-slate-600 p-6">
                     <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-extrabold tracking-wider text-white select-none">
                           Recursos do Sistema
                        </h2>
                        <Tooltip>
                           <TooltipTrigger asChild>
                              <button
                                 onClick={() => setShowSugestao(!showSugestao)}
                                 className="cursor-pointer rounded-md bg-green-600 p-3 shadow-sm shadow-white transition-all hover:scale-110 hover:bg-green-800 hover:shadow-md hover:shadow-white active:scale-95"
                              >
                                 <SiTarget size={20} className="text-white" />
                              </button>
                           </TooltipTrigger>
                           <TooltipContent
                              side="top"
                              align="center"
                              sideOffset={8}
                              className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
                           >
                              Sugerir Recurso
                           </TooltipContent>
                        </Tooltip>
                     </div>

                     {/* Filtros */}
                     <div className="flex flex-col gap-6 sm:flex-row">
                        <div className="group relative flex-1 transition-all hover:scale-105">
                           <FaSearch
                              className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-300"
                              size={20}
                           />

                           <input
                              type="text"
                              placeholder="Buscar recurso..."
                              value={searchTerm}
                              onChange={e => setSearchTerm(e.target.value)}
                              className="w-full rounded-md border border-slate-600 bg-white/10 py-3 pr-4 pl-12 text-white placeholder-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                           />
                        </div>

                        <div className="group relative transition-all hover:scale-105">
                           <FaFilter
                              className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-300"
                              size={16}
                           />
                           <select
                              value={filtroRecomendacao}
                              onChange={e =>
                                 setFiltroRecomendacao(e.target.value)
                              }
                              className="cursor-pointer rounded-md border border-slate-600 bg-white/10 py-3 pr-4 pl-12 text-slate-300 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                           >
                              <option className="text-black" value="TODOS">
                                 Todos
                              </option>
                              <option className="text-black" value="DISPONÍVEL">
                                 Disponível
                              </option>
                              <option className="text-black" value="MODERADO">
                                 Moderado
                              </option>
                              <option
                                 className="text-black"
                                 value="SOBRECARREGADO"
                              >
                                 Sobrecarregado
                              </option>
                              <option className="text-black" value="CRÍTICO">
                                 Crítico
                              </option>
                           </select>
                        </div>
                     </div>
                  </div>

                  <div className="scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 max-h-[560px] space-y-4 overflow-y-auto p-6">
                     {recursosFiltrados.map((recurso: RecursoStats) => (
                        <Tooltip key={recurso.COD_RECURSO}>
                           <TooltipTrigger asChild>
                              <div
                                 className={`cursor-pointer rounded-md bg-gradient-to-r from-slate-700/30 to-slate-800/30 p-4 shadow-sm shadow-white transition-all hover:-translate-y-1 hover:scale-101 ${
                                    selectedRecurso === recurso.COD_RECURSO
                                       ? 'border-cyan-500 ring-2 ring-cyan-500'
                                       : 'hover:border-2 hover:border-slate-600'
                                 }`}
                                 onClick={() =>
                                    handleSelectRecurso(recurso.COD_RECURSO)
                                 }
                              >
                                 <div className="mb-4 flex items-center gap-4">
                                    <div className="rounded-xl bg-white/10 p-3 shadow-sm shadow-white">
                                       <FaUser
                                          size={20}
                                          className="text-white"
                                       />
                                    </div>
                                    <div className="flex w-full items-center justify-between">
                                       <h3 className="text-lg font-bold text-white">
                                          {recurso.NOME_RECURSO}
                                       </h3>

                                       <div
                                          className={`inline-flex items-center space-x-2 rounded-xl bg-${getRecomendacaoColor(recurso.RECOMENDACAO)} px-3 py-1 text-sm font-semibold tracking-wider text-black italic shadow-sm shadow-white select-none`}
                                       >
                                          {getRecomendacaoIcon(
                                             recurso.RECOMENDACAO
                                          )}
                                          <span>{recurso.RECOMENDACAO}</span>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-4 gap-4">
                                    {[
                                       {
                                          label: 'Ativos',
                                          value: recurso.TOTAL_CHAMADOS_ATIVOS,
                                          color: 'text-cyan-400',
                                       },
                                       {
                                          label: 'Alta Prioridade',
                                          value: recurso.CHAMADOS_ALTA_PRIORIDADE,
                                          color: 'text-amber-400',
                                       },
                                       {
                                          label: 'Críticos',
                                          value: recurso.CHAMADOS_CRITICOS,
                                          color: 'text-red-400',
                                       },
                                       {
                                          label: 'Score',
                                          value: recurso.SCORE_CARGA_TRABALHO,
                                          color: 'text-violet-400',
                                       },
                                    ].map((metric, idx) => (
                                       <div
                                          key={idx}
                                          className="rounded-md border border-slate-600 bg-white/10 p-2 text-center"
                                       >
                                          <p className="mb-1 text-sm font-semibold tracking-wider text-slate-400 italic select-none">
                                             {metric.label}
                                          </p>
                                          <p
                                             className={`text-lg font-extrabold tracking-wider select-none ${metric.color}`}
                                          >
                                             {metric.value}
                                          </p>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </TooltipTrigger>
                           <TooltipContent
                              side="top"
                              align="center"
                              sideOffset={8}
                              className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
                           >
                              Clique para ver os detalhes do{' '}
                              {recurso.NOME_RECURSO}
                           </TooltipContent>
                        </Tooltip>
                     ))}
                  </div>
               </div>
               {/* ==================== */}

               {/* Painel de Detalhes/Sugestão */}
               <div className="overflow-hidden rounded-md border border-slate-600 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                  {showSugestao ? (
                     <div className="p-6">
                        <div className="mb-6 flex items-center gap-3">
                           <div className="rounded-md bg-green-600 p-3 shadow-md shadow-black">
                              <SiTarget className="text-white" size={20} />
                           </div>
                           <h3 className="text-xl font-extrabold tracking-wider text-white select-none">
                              Sugestão de Recurso
                           </h3>
                        </div>

                        <div className="space-y-6">
                           <div>
                              <label className="mb-2 block text-sm font-semibold tracking-wider text-slate-300 select-none">
                                 Prioridade do Chamado
                              </label>
                              <input
                                 type="text"
                                 min="1"
                                 max="999"
                                 value={novoChamado.prioridade}
                                 onChange={e =>
                                    setNovoChamado(prev => ({
                                       ...prev,
                                       prioridade: Number(e.target.value),
                                    }))
                                 }
                                 className="w-full rounded-md border border-slate-600 bg-slate-700/50 p-3 font-semibold tracking-wider text-white select-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                              />
                           </div>

                           <div>
                              <label className="mb-2 block text-sm font-semibold tracking-wider text-slate-300 select-none">
                                 Código do Cliente (opcional)
                              </label>
                              <input
                                 type="text"
                                 value={novoChamado.codCliente}
                                 onChange={e =>
                                    setNovoChamado(prev => ({
                                       ...prev,
                                       codCliente: e.target.value,
                                    }))
                                 }
                                 className="w-full rounded-md border border-slate-600 bg-slate-700/50 p-3 font-semibold tracking-wider text-white select-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                              />
                           </div>
                        </div>

                        {loadingSugestao && (
                           <div className="flex items-center justify-center py-12">
                              <div className="relative">
                                 <Loader2
                                    className="animate-spin text-white"
                                    size={40}
                                 />
                              </div>
                           </div>
                        )}

                        {sugestaoData?.sugestao?.recursoRecomendado && (
                           <div className="mt-8 rounded-md border border-green-600/30 bg-green-600/20 p-4">
                              <div className="mb-4 flex items-center gap-3">
                                 <div className="rounded-md bg-green-600 p-3 shadow-sm shadow-black">
                                    <BsAwardFill
                                       className="text-white"
                                       size={20}
                                    />
                                 </div>
                                 <h4 className="text-lg font-extrabold tracking-wider text-white select-none">
                                    Melhor Opção
                                 </h4>
                              </div>

                              <div className="space-y-4">
                                 <div>
                                    <p className="text-center text-lg font-bold tracking-wider text-white select-none">
                                       {
                                          sugestaoData.sugestao
                                             .recursoRecomendado.NOME_RECURSO
                                       }
                                    </p>
                                    <div className="mt-2 flex items-center justify-center gap-4">
                                       <span className="rounded-xl bg-green-500 px-6 py-1 text-sm font-semibold tracking-wider text-black select-none">
                                          Score:{' '}
                                          {
                                             sugestaoData.sugestao
                                                .recursoRecomendado
                                                .SCORE_ADEQUACAO
                                          }
                                       </span>
                                       <span className="text-base font-extrabold tracking-wider text-white italic select-none">
                                          {
                                             sugestaoData.sugestao
                                                .recursoRecomendado.ADEQUACAO
                                          }
                                       </span>
                                    </div>
                                 </div>

                                 <div className="rounded-xl bg-white/10 p-4">
                                    <p className="text-center text-sm font-semibold tracking-wider text-white italic select-none">
                                       {
                                          sugestaoData.sugestao
                                             .recursoRecomendado.RECOMENDACAO
                                       }
                                    </p>
                                 </div>

                                 {sugestaoData.sugestao.recursoRecomendado
                                    .VANTAGENS?.length > 0 && (
                                    <div className="space-y-2">
                                       <p className="text-base font-bold tracking-wider text-white select-none">
                                          Vantagens:
                                       </p>
                                       <div className="space-y-1">
                                          {sugestaoData.sugestao.recursoRecomendado.VANTAGENS.map(
                                             (
                                                vantagem: string,
                                                index: number
                                             ) => (
                                                <div
                                                   key={index}
                                                   className="flex items-start space-x-2"
                                                >
                                                   <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white"></div>
                                                   <p className="text-sm font-semibold tracking-wider text-white italic select-none">
                                                      {vantagem}
                                                   </p>
                                                </div>
                                             )
                                          )}
                                       </div>
                                    </div>
                                 )}
                              </div>
                           </div>
                        )}

                        {sugestaoData?.recomendacoesGerais?.length > 0 && (
                           <div className="mt-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6 backdrop-blur-xl">
                              <div className="mb-3 flex items-center space-x-3">
                                 <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2">
                                    <BiSolidZap
                                       className="text-white"
                                       size={16}
                                    />
                                 </div>
                                 <h4 className="font-bold text-amber-200">
                                    Recomendações Gerais
                                 </h4>
                              </div>
                              <div className="space-y-2">
                                 {sugestaoData.recomendacoesGerais.map(
                                    (rec: string, index: number) => (
                                       <div
                                          key={index}
                                          className="flex items-start space-x-2"
                                       >
                                          <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400"></div>
                                          <p className="text-sm text-amber-100">
                                             {rec}
                                          </p>
                                       </div>
                                    )
                                 )}
                              </div>
                           </div>
                        )}
                     </div>
                  ) : selectedRecurso ? (
                     <div className="p-4">
                        <div className="mb-6 flex items-center gap-3">
                           <div className="rounded-md bg-blue-600 p-3 shadow-sm shadow-white">
                              <FaUser className="text-white" size={20} />
                           </div>
                           <h3 className="text-xl font-extrabold tracking-wider text-white select-none">
                              Detalhes do Recurso
                           </h3>
                        </div>

                        {loadingDetalhe ? (
                           <div className="flex flex-col items-center justify-center space-y-4 py-16">
                              <div className="relative">
                                 <Loader2
                                    className="animate-spin text-cyan-400"
                                    size={48}
                                 />
                              </div>
                              <p className="text-center font-semibold tracking-wider text-slate-400 select-none">
                                 Carregando detalhes...
                              </p>
                           </div>
                        ) : errorDetalhe ? (
                           <div className="space-y-6 rounded-md border border-red-500/50 bg-red-500/20 p-8 text-center">
                              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md bg-red-600 p-4 shadow-sm shadow-white">
                                 <FaExclamationTriangle
                                    className="text-white"
                                    size={28}
                                 />
                              </div>
                              <div className="mb-6 space-y-2">
                                 <p className="font-semibold tracking-wider text-white select-none">
                                    Erro ao carregar detalhes
                                 </p>
                                 <p className="text-sm tracking-wider text-slate-300 select-none">
                                    Não foi possível carregar as informações do
                                    recurso
                                 </p>
                              </div>
                              <button
                                 onClick={() => refetchRecursos()}
                                 className="rounded-md bg-red-600 px-6 py-2 text-base font-semibold tracking-wider text-white shadow-md shadow-black transition-all select-none hover:bg-red-900 hover:shadow-lg hover:shadow-black active:scale-95"
                              >
                                 Tentar novamente
                              </button>
                           </div>
                        ) : recursoDetalhado ? (
                           <div className="space-y-6">
                              <div className="flex flex-col">
                                 <h4 className="text-2xl font-bold tracking-wider text-white italic select-none">
                                    {recursoDetalhado.recurso.NOME_RECURSO}
                                 </h4>
                                 <p className="font-semibold tracking-wider text-slate-400 select-none">
                                    {recursoDetalhado.recurso.EMAIL_RECURSO}
                                 </p>
                              </div>

                              <div className="space-y-4 rounded-md bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 shadow-sm shadow-white">
                                 <div className="flex items-center gap-3">
                                    <div className="rounded-md bg-purple-600 p-3 shadow-sm shadow-white">
                                       <IoBarChart
                                          className="text-white"
                                          size={20}
                                       />
                                    </div>
                                    <h5 className="text-lg font-extrabold tracking-wider text-white select-none">
                                       Resumo da Carga
                                    </h5>
                                 </div>

                                 <div className="grid grid-cols-2 gap-4">
                                    {[
                                       {
                                          label: 'Chamados Ativos',
                                          value: recursoDetalhado.resumo
                                             .totalChamadosAtivos,
                                          color: 'text-cyan-400',
                                          bg: 'white/10',
                                       },
                                       {
                                          label: 'Críticos',
                                          value: recursoDetalhado.resumo
                                             .chamadosCriticos,
                                          color: 'text-red-400',
                                          bg: 'white/10',
                                       },
                                       {
                                          label: 'Atrasados',
                                          value: recursoDetalhado.resumo
                                             .chamadosAtrasados,
                                          color: 'text-amber-400',
                                          bg: 'white/10',
                                       },
                                       {
                                          label: 'Status',
                                          value: recursoDetalhado.resumo
                                             .statusCarga,
                                          color:
                                             recursoDetalhado.resumo
                                                .statusCarga === 'LEVE'
                                                ? 'text-emerald-400'
                                                : recursoDetalhado.resumo
                                                       .statusCarga ===
                                                    'MODERADA'
                                                  ? 'text-amber-400'
                                                  : recursoDetalhado.resumo
                                                         .statusCarga ===
                                                      'PESADA'
                                                    ? 'text-orange-400'
                                                    : 'text-red-400',
                                          bg: 'white/10',
                                       },
                                    ].map((metric, idx) => (
                                       <div
                                          key={idx}
                                          className={`rounded-md bg-${metric.bg} border border-slate-600 p-2 text-center`}
                                       >
                                          <p className="mb-1 text-sm font-semibold tracking-wider text-slate-300 select-none">
                                             {metric.label}
                                          </p>
                                          <p
                                             className={`text-lg font-bold tracking-wider select-none ${metric.color}`}
                                          >
                                             {metric.value}
                                          </p>
                                       </div>
                                    ))}
                                 </div>
                              </div>

                              <div className="rounded-md bg-blue-600/20 p-4 shadow-sm shadow-white">
                                 <div className="flex items-center gap-3">
                                    <div className="rounded-sm bg-blue-600 p-1 shadow-sm shadow-white">
                                       <FaShield
                                          className="text-white"
                                          size={16}
                                       />
                                    </div>
                                    <h5 className="text-base font-extrabold tracking-wider text-white select-none">
                                       Recomendação
                                    </h5>
                                 </div>
                                 <div className="mt-4 flex items-center gap-3">
                                    <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white"></div>

                                    <p className="text-sm font-semibold tracking-wider text-slate-300 italic select-none">
                                       {recursoDetalhado.resumo.recomendacao}
                                    </p>
                                 </div>
                              </div>

                              {recursoDetalhado.alertas?.length > 0 && (
                                 <div className="rounded bg-red-600/20 p-4 shadow-sm shadow-white">
                                    <div className="flex items-center gap-3">
                                       <div className="rounded-md bg-red-600 p-1 shadow-sm shadow-white">
                                          <FaExclamationTriangle
                                             className="text-white"
                                             size={16}
                                          />
                                       </div>
                                       <h5 className="text-base font-extrabold tracking-wider text-white select-none">
                                          Alertas
                                       </h5>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                       {recursoDetalhado.alertas.map(
                                          (alerta: string, index: number) => (
                                             <div
                                                key={index}
                                                className="flex items-start space-x-2"
                                             >
                                                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white"></div>
                                                <p className="text-sm font-semibold tracking-wider text-slate-300 italic select-none">
                                                   {alerta}
                                                </p>
                                             </div>
                                          )
                                       )}
                                    </div>
                                 </div>
                              )}
                           </div>
                        ) : null}
                     </div>
                  ) : (
                     <div className="p-6 text-center">
                        <div className="space-y-6 py-16">
                           <div className="relative mx-auto h-20 w-20">
                              <ImUsers size={60} className="text-white" />
                           </div>
                           <div className="space-y-3">
                              <p className="text-lg font-extrabold tracking-wider text-white select-none">
                                 Selecione um recurso
                              </p>
                              <p className="text-sm font-semibold tracking-wider text-slate-300 italic select-none">
                                 Clique em um recurso para ver detalhes ou no
                                 ícone de alvo para sugestões
                              </p>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
               {/* ==================== */}
            </div>
         </div>
      </div>
   );
};

export default DashboardRecursos;
