import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
   X,
   User,
   AlertTriangle,
   CheckCircle,
   Clock,
   Target,
   Zap,
   Award,
   TrendingUp,
   Activity,
   Loader2,
   Star,
   AlertCircle,
   Users,
   Calendar,
   Flag,
   Mail,
   MessageSquare,
} from 'lucide-react';

// Interfaces para tipagem
interface ChamadoProps {
   COD_CHAMADO: number;
   DATA_CHAMADO: string;
   ASSUNTO_CHAMADO: string;
   STATUS_CHAMADO: string;
   EMAIL_CHAMADO: string;
   PRIOR_CHAMADO: string;
   COD_CLIENTE: number;
   NOME_CLIENTE: string;
   COD_RECURSO?: number;
   NOME_RECURSO?: string;
}

interface SugestaoRecurso {
   COD_RECURSO: number;
   NOME_RECURSO: string;
   EMAIL_RECURSO: string;
   SCORE_ADEQUACAO: number;
   ADEQUACAO: 'EXCELENTE' | 'BOM' | 'MODERADO' | 'BAIXO' | 'INADEQUADO';
   RECOMENDACAO: string;
   VANTAGENS: string[];
   DESVANTAGENS: string[];
   CHAMADOS_ATIVOS: number;
   CHAMADOS_CRITICOS: number;
   ALTA_PRIORIDADE: number;
   HISTORICO_CLIENTE?: {
      CHAMADOS_CLIENTE: number;
      TEMPO_MEDIO_RESOLUCAO: number;
      CONCLUIDOS: number;
   };
}

interface ModalAtribuicaoInteligenteProps {
   isOpen: boolean;
   onClose: () => void;
   chamado: ChamadoProps | null;
   onAtribuicaoSuccess?: () => void;
}

const ModalAtribuicaoInteligente: React.FC<ModalAtribuicaoInteligenteProps> = ({
   isOpen,
   onClose,
   chamado,
   onAtribuicaoSuccess,
}) => {
   const [selectedRecurso, setSelectedRecurso] = useState<number | null>(null);
   const [justificativa, setJustificativa] = useState('');
   const [showDetails, setShowDetails] = useState<number | null>(null);
   const queryClient = useQueryClient();

   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   // Reset estados quando modal abre/fecha
   useEffect(() => {
      if (isOpen) {
         setSelectedRecurso(null);
         setJustificativa('');
         setShowDetails(null);
      }
   }, [isOpen]);

   // Query para buscar sugestões de recursos
   const {
      data: sugestaoData,
      isLoading: loadingSugestao,
      error,
   } = useQuery({
      queryKey: ['sugestao-recurso', chamado?.COD_CHAMADO],
      queryFn: async () => {
         if (!chamado) return null;

         const response = await fetch('/api/dashboard/recursos/sugestao', {
            method: 'POST',
            headers: {
               Authorization: `Bearer ${token}`,
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               prioridade: parseInt(chamado.PRIOR_CHAMADO) || 100,
               codCliente: chamado.COD_CLIENTE,
               codClassificacao: null,
               assunto: chamado.ASSUNTO_CHAMADO,
            }),
         });

         if (!response.ok) throw new Error('Erro ao buscar sugestões');
         return response.json();
      },
      enabled: !!chamado && !!token && isOpen,
   });

   // Mutation para atribuir chamado
   const atribuirMutation = useMutation({
      mutationFn: async ({
         codRecurso,
         justificativa,
      }: {
         codRecurso: number;
         justificativa: string;
      }) => {
         const response = await fetch(
            `/api/chamados/${chamado?.COD_CHAMADO}/atribuir`,
            {
               method: 'POST',
               headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                  codRecurso,
                  justificativa,
               }),
            }
         );

         if (!response.ok) throw new Error('Erro ao atribuir chamado');
         return response.json();
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['chamadosAbertos'] });
         queryClient.invalidateQueries({ queryKey: ['dashboard-recursos'] });
         onAtribuicaoSuccess?.();
         onClose();
      },
      onError: error => {
         console.error('Erro ao atribuir:', error);
      },
   });

   // Função para obter cor baseada na adequação
   const getAdequacaoColor = (adequacao: string) => {
      const colors = {
         EXCELENTE: 'bg-green-500',
         BOM: 'bg-blue-500',
         MODERADO: 'bg-yellow-500',
         BAIXO: 'bg-orange-500',
         INADEQUADO: 'bg-red-500',
      };
      return colors[adequacao as keyof typeof colors] || 'bg-gray-500';
   };

   // Função para obter ícone baseado na adequação
   const getAdequacaoIcon = (adequacao: string) => {
      const icons = {
         EXCELENTE: Star,
         BOM: CheckCircle,
         MODERADO: Clock,
         BAIXO: AlertTriangle,
         INADEQUADO: AlertCircle,
      };
      const Icon = icons[adequacao as keyof typeof icons] || Activity;
      return <Icon size={16} />;
   };

   // Função para obter prioridade visual
   const getPrioridadeInfo = (prioridade: string) => {
      const prio = parseInt(prioridade) || 100;
      if (prio <= 50)
         return { label: 'ALTA', color: 'text-red-500', bgColor: 'bg-red-100' };
      if (prio <= 100)
         return {
            label: 'MÉDIA',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
         };
      return {
         label: 'BAIXA',
         color: 'text-green-600',
         bgColor: 'bg-green-100',
      };
   };

   const handleAtribuir = () => {
      if (!selectedRecurso) return;

      atribuirMutation.mutate({
         codRecurso: selectedRecurso,
         justificativa,
      });
   };

   if (!isOpen || !chamado) return null;

   const prioridadeInfo = getPrioridadeInfo(chamado.PRIOR_CHAMADO);

   return (
      <AnimatePresence>
         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}
         >
            <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-gray-700 bg-gray-900"
            >
               {/* Header */}
               <div className="border-b border-gray-700 bg-gray-800 p-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-4">
                        <div className="rounded-lg bg-blue-600 p-2">
                           <Target size={24} className="text-white" />
                        </div>
                        <div>
                           <h2 className="text-xl font-bold text-white">
                              Atribuição Inteligente
                           </h2>
                           <p className="text-gray-400">
                              Chamado #{chamado.COD_CHAMADO}
                           </p>
                        </div>
                     </div>
                     <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
                     >
                        <X size={24} />
                     </button>
                  </div>

                  {/* Info do Chamado */}
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                     <div className="rounded-lg bg-gray-700 p-3">
                        <div className="flex items-center space-x-2">
                           <Flag className="text-gray-400" size={16} />
                           <span className="text-sm text-gray-400">
                              Prioridade
                           </span>
                        </div>
                        <div
                           className={`mt-1 inline-flex items-center rounded-full px-2 py-1 text-sm font-medium ${prioridadeInfo.bgColor} ${prioridadeInfo.color}`}
                        >
                           {prioridadeInfo.label} ({chamado.PRIOR_CHAMADO})
                        </div>
                     </div>

                     <div className="rounded-lg bg-gray-700 p-3">
                        <div className="flex items-center space-x-2">
                           <User className="text-gray-400" size={16} />
                           <span className="text-sm text-gray-400">
                              Cliente
                           </span>
                        </div>
                        <p className="mt-1 font-medium text-white">
                           {chamado.NOME_CLIENTE}
                        </p>
                     </div>

                     <div className="rounded-lg bg-gray-700 p-3">
                        <div className="flex items-center space-x-2">
                           <Calendar className="text-gray-400" size={16} />
                           <span className="text-sm text-gray-400">Data</span>
                        </div>
                        <p className="mt-1 font-medium text-white">
                           {new Date(chamado.DATA_CHAMADO).toLocaleDateString(
                              'pt-BR'
                           )}
                        </p>
                     </div>
                  </div>

                  <div className="mt-4 rounded-lg bg-gray-700 p-3">
                     <div className="mb-2 flex items-center space-x-2">
                        <MessageSquare className="text-gray-400" size={16} />
                        <span className="text-sm text-gray-400">Assunto</span>
                     </div>
                     <p className="text-white">{chamado.ASSUNTO_CHAMADO}</p>
                  </div>
               </div>

               {/* Content */}
               <div className="flex flex-1 overflow-hidden">
                  {/* Lista de Recursos */}
                  <div className="w-1/2 overflow-y-auto border-r border-gray-700 p-6">
                     <h3 className="mb-4 flex items-center text-lg font-semibold text-white">
                        <Users className="mr-2" size={20} />
                        Recursos Sugeridos
                     </h3>

                     {loadingSugestao && (
                        <div className="flex items-center justify-center py-12">
                           <Loader2
                              className="animate-spin text-blue-500"
                              size={32}
                           />
                           <span className="ml-3 text-gray-400">
                              Analisando recursos...
                           </span>
                        </div>
                     )}

                     {error && (
                        <div className="rounded-lg border border-red-600 bg-red-900 p-4">
                           <p className="text-red-200">
                              Erro ao buscar sugestões de recursos
                           </p>
                        </div>
                     )}

                     {sugestaoData?.todosRecursos && (
                        <div className="space-y-3">
                           {sugestaoData.todosRecursos
                              .slice(0, 8)
                              .map((recurso: SugestaoRecurso) => (
                                 <motion.div
                                    key={recurso.COD_RECURSO}
                                    className={`cursor-pointer rounded-lg border bg-gray-800 p-4 transition-all ${
                                       selectedRecurso === recurso.COD_RECURSO
                                          ? 'border-blue-500 ring-2 ring-blue-500/50'
                                          : 'border-gray-600 hover:border-gray-500'
                                    }`}
                                    onClick={() =>
                                       setSelectedRecurso(recurso.COD_RECURSO)
                                    }
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                 >
                                    <div className="flex items-start justify-between">
                                       <div className="flex-1">
                                          <div className="flex items-center space-x-3">
                                             <User
                                                size={18}
                                                className="text-gray-400"
                                             />
                                             <h4 className="font-semibold text-white">
                                                {recurso.NOME_RECURSO}
                                             </h4>
                                          </div>

                                          <div className="mt-2 flex items-center space-x-2">
                                             <div
                                                className={`flex items-center rounded-full px-2 py-1 text-xs font-medium text-white ${getAdequacaoColor(recurso.ADEQUACAO)}`}
                                             >
                                                {getAdequacaoIcon(
                                                   recurso.ADEQUACAO
                                                )}
                                                <span className="ml-1">
                                                   {recurso.ADEQUACAO}
                                                </span>
                                             </div>
                                             <div className="rounded-full bg-gray-700 px-2 py-1 text-xs font-medium text-white">
                                                Score: {recurso.SCORE_ADEQUACAO}
                                             </div>
                                          </div>

                                          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                                             <div className="text-center">
                                                <p className="text-gray-400">
                                                   Ativos
                                                </p>
                                                <p className="font-semibold text-blue-400">
                                                   {recurso.CHAMADOS_ATIVOS}
                                                </p>
                                             </div>
                                             <div className="text-center">
                                                <p className="text-gray-400">
                                                   Alta Prio.
                                                </p>
                                                <p className="font-semibold text-yellow-400">
                                                   {recurso.ALTA_PRIORIDADE}
                                                </p>
                                             </div>
                                             <div className="text-center">
                                                <p className="text-gray-400">
                                                   Críticos
                                                </p>
                                                <p className="font-semibold text-red-400">
                                                   {recurso.CHAMADOS_CRITICOS}
                                                </p>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 </motion.div>
                              ))}
                        </div>
                     )}
                  </div>

                  {/* Detalhes do Recurso Selecionado */}
                  <div className="w-1/2 overflow-y-auto p-6">
                     {selectedRecurso ? (
                        <div>
                           {(() => {
                              const recurso = sugestaoData?.todosRecursos?.find(
                                 (r: SugestaoRecurso) =>
                                    r.COD_RECURSO === selectedRecurso
                              );
                              if (!recurso) return null;

                              return (
                                 <div className="space-y-6">
                                    <div>
                                       <h3 className="mb-2 text-lg font-semibold text-white">
                                          {recurso.NOME_RECURSO}
                                       </h3>
                                       <p className="text-sm text-gray-400">
                                          {recurso.EMAIL_RECURSO}
                                       </p>
                                    </div>

                                    {/* Análise de Adequação */}
                                    <div className="rounded-lg bg-gray-800 p-4">
                                       <h4 className="mb-3 flex items-center font-semibold text-white">
                                          <Award className="mr-2" size={18} />
                                          Análise de Adequação
                                       </h4>
                                       <div className="space-y-3">
                                          <div className="flex items-center justify-between">
                                             <span className="text-gray-400">
                                                Score de Adequação
                                             </span>
                                             <div className="flex items-center space-x-2">
                                                <div className="h-2 w-20 rounded-full bg-gray-700">
                                                   <div
                                                      className={`h-2 rounded-full ${getAdequacaoColor(recurso.ADEQUACAO)}`}
                                                      style={{
                                                         width: `${Math.min(recurso.SCORE_ADEQUACAO, 100)}%`,
                                                      }}
                                                   />
                                                </div>
                                                <span className="font-semibold text-white">
                                                   {recurso.SCORE_ADEQUACAO}
                                                </span>
                                             </div>
                                          </div>
                                          <div className="flex items-center justify-between">
                                             <span className="text-gray-400">
                                                Classificação
                                             </span>
                                             <span
                                                className={`rounded-full px-2 py-1 text-xs font-medium text-white ${getAdequacaoColor(recurso.ADEQUACAO)}`}
                                             >
                                                {recurso.ADEQUACAO}
                                             </span>
                                          </div>
                                          <div>
                                             <span className="text-sm text-gray-400">
                                                Recomendação
                                             </span>
                                             <p className="mt-1 text-sm text-white">
                                                {recurso.RECOMENDACAO}
                                             </p>
                                          </div>
                                       </div>
                                    </div>

                                    {/* Vantagens */}
                                    {recurso.VANTAGENS?.length > 0 && (
                                       <div className="rounded-lg border border-green-700 bg-green-900/30 p-4">
                                          <h4 className="mb-2 flex items-center font-semibold text-green-200">
                                             <CheckCircle
                                                className="mr-2"
                                                size={18}
                                             />
                                             Vantagens
                                          </h4>
                                          <ul className="space-y-1">
                                             {recurso.VANTAGENS.map(
                                                (
                                                   vantagem: string,
                                                   index: number
                                                ) => (
                                                   <li
                                                      key={index}
                                                      className="flex items-start text-sm text-green-100"
                                                   >
                                                      <span className="mr-2 text-green-400">
                                                         •
                                                      </span>
                                                      {vantagem}
                                                   </li>
                                                )
                                             )}
                                          </ul>
                                       </div>
                                    )}

                                    {/* Desvantagens */}
                                    {recurso.DESVANTAGENS?.length > 0 && (
                                       <div className="rounded-lg border border-red-700 bg-red-900/30 p-4">
                                          <h4 className="mb-2 flex items-center font-semibold text-red-200">
                                             <AlertTriangle
                                                className="mr-2"
                                                size={18}
                                             />
                                             Pontos de Atenção
                                          </h4>
                                          <ul className="space-y-1">
                                             {recurso.DESVANTAGENS.map(
                                                (
                                                   desvantagem: string,
                                                   index: number
                                                ) => (
                                                   <li
                                                      key={index}
                                                      className="flex items-start text-sm text-red-100"
                                                   >
                                                      <span className="mr-2 text-red-400">
                                                         •
                                                      </span>
                                                      {desvantagem}
                                                   </li>
                                                )
                                             )}
                                          </ul>
                                       </div>
                                    )}

                                    {/* Histórico com Cliente */}
                                    {recurso.HISTORICO_CLIENTE && (
                                       <div className="rounded-lg border border-blue-700 bg-blue-900/30 p-4">
                                          <h4 className="mb-2 flex items-center font-semibold text-blue-200">
                                             <TrendingUp
                                                className="mr-2"
                                                size={18}
                                             />
                                             Histórico com Cliente
                                          </h4>
                                          <div className="grid grid-cols-2 gap-4 text-sm">
                                             <div>
                                                <p className="text-blue-300">
                                                   Chamados Atendidos
                                                </p>
                                                <p className="font-semibold text-white">
                                                   {
                                                      recurso.HISTORICO_CLIENTE
                                                         .CHAMADOS_CLIENTE
                                                   }
                                                </p>
                                             </div>
                                             <div>
                                                <p className="text-blue-300">
                                                   Taxa de Conclusão
                                                </p>
                                                <p className="font-semibold text-white">
                                                   {Math.round(
                                                      (recurso.HISTORICO_CLIENTE
                                                         .CONCLUIDOS /
                                                         recurso
                                                            .HISTORICO_CLIENTE
                                                            .CHAMADOS_CLIENTE) *
                                                         100
                                                   )}
                                                   %
                                                </p>
                                             </div>
                                             <div className="col-span-2">
                                                <p className="text-blue-300">
                                                   Tempo Médio de Resolução
                                                </p>
                                                <p className="font-semibold text-white">
                                                   {recurso.HISTORICO_CLIENTE.TEMPO_MEDIO_RESOLUCAO?.toFixed(
                                                      1
                                                   )}{' '}
                                                   dias
                                                </p>
                                             </div>
                                          </div>
                                       </div>
                                    )}

                                    {/* Justificativa */}
                                    <div>
                                       <label className="mb-2 block text-sm font-medium text-gray-300">
                                          Justificativa da Atribuição (opcional)
                                       </label>
                                       <textarea
                                          value={justificativa}
                                          onChange={e =>
                                             setJustificativa(e.target.value)
                                          }
                                          placeholder="Descreva o motivo da escolha deste recurso..."
                                          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                                          rows={3}
                                       />
                                    </div>
                                 </div>
                              );
                           })()}
                        </div>
                     ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                           <div className="text-center">
                              <Users size={48} className="mx-auto mb-4" />
                              <p>Selecione um recurso para ver detalhes</p>
                           </div>
                        </div>
                     )}
                  </div>
               </div>

               {/* Footer */}
               <div className="border-t border-gray-700 bg-gray-800 p-6">
                  <div className="flex items-center justify-between">
                     <div className="text-sm text-gray-400">
                        {sugestaoData?.sugestao?.recursoRecomendado && (
                           <div className="flex items-center">
                              <Award className="mr-1" size={16} />
                              Melhor opção:{' '}
                              <span className="ml-1 font-medium text-green-400">
                                 {
                                    sugestaoData.sugestao.recursoRecomendado
                                       .NOME_RECURSO
                                 }
                              </span>
                           </div>
                        )}
                     </div>

                     <div className="flex items-center space-x-3">
                        <button
                           onClick={onClose}
                           className="px-4 py-2 text-gray-400 transition-colors hover:text-white"
                        >
                           Cancelar
                        </button>
                        <button
                           onClick={handleAtribuir}
                           disabled={
                              !selectedRecurso || atribuirMutation.isPending
                           }
                           className="flex items-center space-x-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-600"
                        >
                           {atribuirMutation.isPending && (
                              <Loader2 className="animate-spin" size={16} />
                           )}
                           <span>
                              {atribuirMutation.isPending
                                 ? 'Atribuindo...'
                                 : 'Atribuir Chamado'}
                           </span>
                        </button>
                     </div>
                  </div>

                  {/* Recomendações Gerais */}
                  {sugestaoData?.recomendacoesGerais?.length > 0 && (
                     <div className="mt-4 rounded-lg border border-yellow-700 bg-yellow-900/30 p-3">
                        <h5 className="mb-2 text-sm font-semibold text-yellow-200">
                           Recomendações do Sistema:
                        </h5>
                        <ul className="space-y-1">
                           {sugestaoData.recomendacoesGerais.map(
                              (rec: string, index: number) => (
                                 <li
                                    key={index}
                                    className="flex items-start text-xs text-yellow-100"
                                 >
                                    <span className="mr-2 text-yellow-400">
                                       •
                                    </span>
                                    {rec}
                                 </li>
                              )
                           )}
                        </ul>
                     </div>
                  )}
               </div>
            </motion.div>
         </motion.div>
      </AnimatePresence>
   );
};

export default ModalAtribuicaoInteligente;
