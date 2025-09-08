import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
   Users,
   AlertTriangle,
   CheckCircle,
   Clock,
   TrendingUp,
   Target,
   Zap,
   Shield,
   Activity,
   BarChart3,
   RefreshCw,
   Filter,
   Search,
   ChevronDown,
   ChevronUp,
   User,
   Calendar,
   AlertCircle,
   Star,
   Award,
   Loader2,
} from 'lucide-react';

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

interface SugestaoRecurso {
   COD_RECURSO: number;
   NOME_RECURSO: string;
   SCORE_ADEQUACAO: number;
   ADEQUACAO: 'EXCELENTE' | 'BOM' | 'MODERADO' | 'BAIXO' | 'INADEQUADO';
   RECOMENDACAO: string;
   VANTAGENS: string[];
   DESVANTAGENS: string[];
   CHAMADOS_ATIVOS: number;
   CHAMADOS_CRITICOS: number;
}

interface RecursoDetalhado {
   recurso: {
      COD_RECURSO: number;
      NOME_RECURSO: string;
      EMAIL_RECURSO: string;
      ATIVO: string;
   };
   resumo: {
      totalChamadosAtivos: number;
      chamadosCriticos: number;
      chamadosAtrasados: number;
      statusCarga: 'LEVE' | 'MODERADA' | 'PESADA' | 'CRÍTICA';
      recomendacao: string;
   };
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

   // Token de autenticação
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   // Query para buscar recursos gerais
   const {
      data: recursosData,
      isLoading: loadingRecursos,
      refetch: refetchRecursos,
   } = useQuery({
      queryKey: ['dashboard-recursos'],
      queryFn: async () => {
         const response = await fetch('/api/dashboard/recursos', {
            headers: { Authorization: `Bearer ${token}` },
         });
         if (!response.ok) throw new Error('Erro ao buscar recursos');
         return response.json();
      },
      enabled: !!token,
      refetchInterval: 30000, // Atualiza a cada 30 segundos
   });

   // Query para buscar detalhes de um recurso específico
   const { data: recursoDetalhado, isLoading: loadingDetalhe } = useQuery({
      queryKey: ['dashboard-recurso', selectedRecurso],
      queryFn: async () => {
         const response = await fetch(
            `/api/dashboard/recurso/${selectedRecurso}`,
            {
               headers: { Authorization: `Bearer ${token}` },
            }
         );
         if (!response.ok)
            throw new Error('Erro ao buscar detalhes do recurso');
         return response.json();
      },
      enabled: !!selectedRecurso && !!token,
   });

   // Query para sugestão de recurso
   const { data: sugestaoData, isLoading: loadingSugestao } = useQuery({
      queryKey: ['sugestao-recurso', novoChamado],
      queryFn: async () => {
         const response = await fetch('/api/dashboard/sugestao-recurso', {
            method: 'POST',
            headers: {
               Authorization: `Bearer ${token}`,
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(novoChamado),
         });
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
         DISPONÍVEL: 'bg-green-500 text-white',
         MODERADO: 'bg-yellow-500 text-black',
         SOBRECARREGADO: 'bg-orange-500 text-white',
         CRÍTICO: 'bg-red-500 text-white',
      };
      return (
         colors[recomendacao as keyof typeof colors] || 'bg-gray-500 text-white'
      );
   };

   // Função para obter ícone da recomendação
   const getRecomendacaoIcon = (recomendacao: string) => {
      const icons = {
         DISPONÍVEL: CheckCircle,
         MODERADO: Clock,
         SOBRECARREGADO: AlertTriangle,
         CRÍTICO: AlertCircle,
      };
      const Icon = icons[recomendacao as keyof typeof icons] || Activity;
      return <Icon size={20} />;
   };

   if (loadingRecursos) {
      return (
         <div className="flex min-h-screen items-center justify-center bg-gray-900">
            <div className="flex flex-col items-center space-y-4">
               <Loader2 className="animate-spin text-blue-500" size={48} />
               <p className="text-lg text-white">
                  Carregando dashboard de recursos...
               </p>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-900 p-6 text-white">
         <div className="mx-auto max-w-7xl space-y-6">
            {/* Header do Dashboard */}
            <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                     <div className="rounded-lg bg-blue-600 p-3">
                        <Users size={32} />
                     </div>
                     <div>
                        <h1 className="text-3xl font-bold">
                           Dashboard de Recursos
                        </h1>
                        <p className="text-gray-400">
                           Gestão inteligente de atribuição de chamados
                        </p>
                     </div>
                  </div>
                  <button
                     onClick={() => refetchRecursos()}
                     className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 transition-colors hover:bg-blue-700"
                  >
                     <RefreshCw size={20} />
                     <span>Atualizar</span>
                  </button>
               </div>
            </div>

            {/* Resumo Geral */}
            {recursosData?.resumoGeral && (
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-blue-600 p-6">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-blue-100">Chamados Ativos</p>
                           <p className="text-2xl font-bold">
                              {recursosData.resumoGeral.totalChamadosAtivos}
                           </p>
                        </div>
                        <Activity size={32} className="text-blue-200" />
                     </div>
                  </div>

                  <div className="rounded-xl bg-red-600 p-6">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-red-100">Chamados Críticos</p>
                           <p className="text-2xl font-bold">
                              {recursosData.resumoGeral.totalChamadosCriticos}
                           </p>
                        </div>
                        <AlertCircle size={32} className="text-red-200" />
                     </div>
                  </div>

                  <div className="rounded-xl bg-green-600 p-6">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-green-100">
                              Recursos Disponíveis
                           </p>
                           <p className="text-2xl font-bold">
                              {recursosData.resumoGeral.recursosDisponiveis}
                           </p>
                        </div>
                        <CheckCircle size={32} className="text-green-200" />
                     </div>
                  </div>

                  <div className="rounded-xl bg-orange-600 p-6">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-orange-100">Sobrecarregados</p>
                           <p className="text-2xl font-bold">
                              {recursosData.resumoGeral.recursosSobrecarregados}
                           </p>
                        </div>
                        <TrendingUp size={32} className="text-orange-200" />
                     </div>
                  </div>
               </div>
            )}

            {/* Alertas do Sistema */}
            {recursosData?.alertas && recursosData.alertas.length > 0 && (
               <div className="rounded-xl border border-yellow-600 bg-yellow-900 p-4">
                  <div className="mb-2 flex items-center space-x-2">
                     <AlertTriangle className="text-yellow-400" size={20} />
                     <h3 className="font-semibold text-yellow-200">
                        Alertas do Sistema
                     </h3>
                  </div>
                  <div className="space-y-1">
                     {recursosData.alertas.map(
                        (alerta: string, index: number) => (
                           <p key={index} className="text-yellow-100">
                              • {alerta}
                           </p>
                        )
                     )}
                  </div>
               </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
               {/* Lista de Recursos */}
               <div className="rounded-xl border border-gray-700 bg-gray-800 lg:col-span-2">
                  <div className="border-b border-gray-700 p-6">
                     <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                           Recursos do Sistema
                        </h2>
                        <button
                           onClick={() => setShowSugestao(!showSugestao)}
                           className="rounded-lg bg-green-600 px-4 py-2 transition-colors hover:bg-green-700"
                        >
                           <Target size={20} />
                        </button>
                     </div>

                     {/* Filtros */}
                     <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="flex-1">
                           <div className="relative">
                              <Search
                                 className="absolute top-3 left-3 text-gray-400"
                                 size={20}
                              />
                              <input
                                 type="text"
                                 placeholder="Buscar recurso..."
                                 value={searchTerm}
                                 onChange={e => setSearchTerm(e.target.value)}
                                 className="w-full rounded-lg border border-gray-600 bg-gray-700 py-2 pr-4 pl-10 focus:border-blue-500 focus:outline-none"
                              />
                           </div>
                        </div>
                        <select
                           value={filtroRecomendacao}
                           onChange={e => setFiltroRecomendacao(e.target.value)}
                           className="rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 focus:border-blue-500 focus:outline-none"
                        >
                           <option value="TODOS">Todos os Status</option>
                           <option value="DISPONÍVEL">Disponível</option>
                           <option value="MODERADO">Moderado</option>
                           <option value="SOBRECARREGADO">
                              Sobrecarregado
                           </option>
                           <option value="CRÍTICO">Crítico</option>
                        </select>
                     </div>
                  </div>

                  <div className="max-h-96 space-y-4 overflow-y-auto p-6">
                     {recursosFiltrados.map((recurso: RecursoStats) => (
                        <motion.div
                           key={recurso.COD_RECURSO}
                           layout
                           className={`cursor-pointer rounded-lg border bg-gray-700 p-4 transition-all hover:bg-gray-600 ${
                              selectedRecurso === recurso.COD_RECURSO
                                 ? 'border-blue-500 ring-2 ring-blue-500/50'
                                 : 'border-gray-600'
                           }`}
                           onClick={() =>
                              setSelectedRecurso(recurso.COD_RECURSO)
                           }
                        >
                           <div className="flex items-center justify-between">
                              <div className="flex-1">
                                 <div className="flex items-center space-x-3">
                                    <User size={20} className="text-gray-400" />
                                    <h3 className="font-semibold">
                                       {recurso.NOME_RECURSO}
                                    </h3>
                                    <span
                                       className={`rounded-full px-2 py-1 text-xs font-medium ${getRecomendacaoColor(recurso.RECOMENDACAO)}`}
                                    >
                                       {getRecomendacaoIcon(
                                          recurso.RECOMENDACAO
                                       )}
                                       <span className="ml-1">
                                          {recurso.RECOMENDACAO}
                                       </span>
                                    </span>
                                 </div>

                                 <div className="mt-2 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                                    <div className="text-center">
                                       <p className="text-gray-400">Ativos</p>
                                       <p className="font-semibold">
                                          {recurso.TOTAL_CHAMADOS_ATIVOS}
                                       </p>
                                    </div>
                                    <div className="text-center">
                                       <p className="text-gray-400">
                                          Alta Prioridade
                                       </p>
                                       <p className="font-semibold text-red-400">
                                          {recurso.CHAMADOS_ALTA_PRIORIDADE}
                                       </p>
                                    </div>
                                    <div className="text-center">
                                       <p className="text-gray-400">Críticos</p>
                                       <p className="font-semibold text-red-500">
                                          {recurso.CHAMADOS_CRITICOS}
                                       </p>
                                    </div>
                                    <div className="text-center">
                                       <p className="text-gray-400">Score</p>
                                       <p className="font-semibold">
                                          {recurso.SCORE_CARGA_TRABALHO}
                                       </p>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                     ))}
                  </div>
               </div>

               {/* Painel de Detalhes/Sugestão */}
               <div className="rounded-xl border border-gray-700 bg-gray-800">
                  <AnimatePresence mode="wait">
                     {showSugestao ? (
                        <motion.div
                           key="sugestao"
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: -20 }}
                           className="p-6"
                        >
                           <h3 className="mb-4 flex items-center text-lg font-semibold">
                              <Target className="mr-2" size={20} />
                              Sugestão de Recurso
                           </h3>

                           <div className="space-y-4">
                              <div>
                                 <label className="mb-1 block text-sm text-gray-400">
                                    Prioridade do Chamado
                                 </label>
                                 <input
                                    type="number"
                                    min="1"
                                    max="999"
                                    value={novoChamado.prioridade}
                                    onChange={e =>
                                       setNovoChamado(prev => ({
                                          ...prev,
                                          prioridade: Number(e.target.value),
                                       }))
                                    }
                                    className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2"
                                 />
                              </div>

                              <div>
                                 <label className="mb-1 block text-sm text-gray-400">
                                    Código do Cliente (opcional)
                                 </label>
                                 <input
                                    type="number"
                                    value={novoChamado.codCliente}
                                    onChange={e =>
                                       setNovoChamado(prev => ({
                                          ...prev,
                                          codCliente: e.target.value,
                                       }))
                                    }
                                    className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2"
                                 />
                              </div>
                           </div>

                           {loadingSugestao && (
                              <div className="flex items-center justify-center py-8">
                                 <Loader2
                                    className="animate-spin text-blue-500"
                                    size={32}
                                 />
                              </div>
                           )}

                           {sugestaoData?.sugestao?.recursoRecomendado && (
                              <motion.div
                                 initial={{ opacity: 0, y: 20 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 className="mt-6 rounded-lg border border-green-600 bg-green-900 p-4"
                              >
                                 <div className="mb-2 flex items-center">
                                    <Award
                                       className="mr-2 text-green-400"
                                       size={20}
                                    />
                                    <h4 className="font-semibold text-green-200">
                                       Melhor Opção
                                    </h4>
                                 </div>

                                 <div className="space-y-2">
                                    <p className="font-medium">
                                       {
                                          sugestaoData.sugestao
                                             .recursoRecomendado.NOME_RECURSO
                                       }
                                    </p>
                                    <div className="flex items-center space-x-4 text-sm">
                                       <span className="rounded bg-green-600 px-2 py-1">
                                          Score:{' '}
                                          {
                                             sugestaoData.sugestao
                                                .recursoRecomendado
                                                .SCORE_ADEQUACAO
                                          }
                                       </span>
                                       <span className="text-green-300">
                                          {
                                             sugestaoData.sugestao
                                                .recursoRecomendado.ADEQUACAO
                                          }
                                       </span>
                                    </div>
                                    <p className="text-sm text-green-200">
                                       {
                                          sugestaoData.sugestao
                                             .recursoRecomendado.RECOMENDACAO
                                       }
                                    </p>
                                 </div>

                                 {sugestaoData.sugestao.recursoRecomendado
                                    .VANTAGENS?.length > 0 && (
                                    <div className="mt-3">
                                       <p className="text-sm font-medium text-green-200">
                                          Vantagens:
                                       </p>
                                       <ul className="mt-1 space-y-1 text-xs text-green-100">
                                          {sugestaoData.sugestao.recursoRecomendado.VANTAGENS.map(
                                             (
                                                vantagem: string,
                                                index: number
                                             ) => (
                                                <li key={index}>
                                                   • {vantagem}
                                                </li>
                                             )
                                          )}
                                       </ul>
                                    </div>
                                 )}
                              </motion.div>
                           )}

                           {sugestaoData?.recomendacoesGerais?.length > 0 && (
                              <div className="mt-4 rounded-lg border border-yellow-600 bg-yellow-900 p-4">
                                 <h4 className="mb-2 font-semibold text-yellow-200">
                                    Recomendações Gerais:
                                 </h4>
                                 <ul className="space-y-1 text-sm text-yellow-100">
                                    {sugestaoData.recomendacoesGerais.map(
                                       (rec: string, index: number) => (
                                          <li key={index}>• {rec}</li>
                                       )
                                    )}
                                 </ul>
                              </div>
                           )}
                        </motion.div>
                     ) : selectedRecurso && recursoDetalhado ? (
                        <motion.div
                           key="detalhes"
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: -20 }}
                           className="p-6"
                        >
                           <h3 className="mb-4 flex items-center text-lg font-semibold">
                              <User className="mr-2" size={20} />
                              Detalhes do Recurso
                           </h3>

                           <div className="space-y-4">
                              <div>
                                 <h4 className="text-lg font-medium">
                                    {recursoDetalhado.recurso.NOME_RECURSO}
                                 </h4>
                                 <p className="text-sm text-gray-400">
                                    {recursoDetalhado.recurso.EMAIL_RECURSO}
                                 </p>
                              </div>

                              <div className="rounded-lg bg-gray-700 p-4">
                                 <h5 className="mb-3 font-semibold">
                                    Resumo da Carga
                                 </h5>
                                 <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                       <p className="text-gray-400">
                                          Chamados Ativos
                                       </p>
                                       <p className="font-semibold text-blue-400">
                                          {
                                             recursoDetalhado.resumo
                                                .totalChamadosAtivos
                                          }
                                       </p>
                                    </div>
                                    <div>
                                       <p className="text-gray-400">Críticos</p>
                                       <p className="font-semibold text-red-400">
                                          {
                                             recursoDetalhado.resumo
                                                .chamadosCriticos
                                          }
                                       </p>
                                    </div>
                                    <div>
                                       <p className="text-gray-400">
                                          Atrasados
                                       </p>
                                       <p className="font-semibold text-orange-400">
                                          {
                                             recursoDetalhado.resumo
                                                .chamadosAtrasados
                                          }
                                       </p>
                                    </div>
                                    <div>
                                       <p className="text-gray-400">Status</p>
                                       <p
                                          className={`font-semibold ${
                                             recursoDetalhado.resumo
                                                .statusCarga === 'LEVE'
                                                ? 'text-green-400'
                                                : recursoDetalhado.resumo
                                                       .statusCarga ===
                                                    'MODERADA'
                                                  ? 'text-yellow-400'
                                                  : recursoDetalhado.resumo
                                                         .statusCarga ===
                                                      'PESADA'
                                                    ? 'text-orange-400'
                                                    : 'text-red-400'
                                          }`}
                                       >
                                          {recursoDetalhado.resumo.statusCarga}
                                       </p>
                                    </div>
                                 </div>
                              </div>

                              <div className="rounded-lg border border-blue-600 bg-blue-900 p-4">
                                 <h5 className="mb-2 font-semibold text-blue-200">
                                    Recomendação
                                 </h5>
                                 <p className="text-sm text-blue-100">
                                    {recursoDetalhado.resumo.recomendacao}
                                 </p>
                              </div>

                              {recursoDetalhado.alertas?.length > 0 && (
                                 <div className="rounded-lg border border-red-600 bg-red-900 p-4">
                                    <h5 className="mb-2 font-semibold text-red-200">
                                       Alertas
                                    </h5>
                                    <ul className="space-y-1 text-sm text-red-100">
                                       {recursoDetalhado.alertas.map(
                                          (alerta: string, index: number) => (
                                             <li key={index}>• {alerta}</li>
                                          )
                                       )}
                                    </ul>
                                 </div>
                              )}
                           </div>
                        </motion.div>
                     ) : (
                        <motion.div
                           key="placeholder"
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           exit={{ opacity: 0 }}
                           className="p-6 text-center text-gray-400"
                        >
                           <div className="py-12">
                              <Users size={48} className="mx-auto mb-4" />
                              <p>Selecione um recurso para ver detalhes</p>
                              <p className="mt-2 text-sm">
                                 ou clique no ícone de alvo para sugestões
                              </p>
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
            </div>
         </div>
      </div>
   );
};

export default DashboardRecursos;
