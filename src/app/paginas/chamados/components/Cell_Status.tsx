'use client';
import { useState, useRef, useEffect } from 'react';
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from '@/components/ui/tooltip';
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from '@/components/ui/alert-dialog';
// ================================================================================
import { getStylesStatus } from './Colunas_Tabela_Chamados';
// ================================================================================
import { FaExclamationTriangle, FaEdit, FaSync, FaTasks } from 'react-icons/fa';
import { FaArrowRightLong } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';
import { MdCategory } from 'react-icons/md';
// ================================================================================

interface Classificacao {
   COD_CLASSIFICACAO: number;
   NOME_CLASSIFICACAO: string;
}

interface Tarefa {
   COD_TAREFA: number;
   NOME_TAREFA: string;
}

interface Props {
   status: string;
   codChamado: number;
   onUpdateStatus: (
      codChamado: number,
      newStatus: string,
      codClassificacao?: number,
      codTarefa?: number
   ) => Promise<void>;
}
// ================================================================================

const statusOptions = [
   'NAO FINALIZADO',
   'EM ATENDIMENTO',
   'FINALIZADO',
   'NAO INICIADO',
   'STANDBY',
   'ATRIBUIDO',
   'AGUARDANDO VALIDACAO',
];
// ================================================================================

export default function StatusCellClicavel({
   status: initialStatus,
   codChamado,
   onUpdateStatus,
}: Props) {
   const [editing, setEditing] = useState(false);
   const [status, setStatus] = useState(initialStatus);
   const [pendingStatus, setPendingStatus] = useState<string | null>(null);
   const [showConfirmDialog, setShowConfirmDialog] = useState(false);
   const [isUpdating, setIsUpdating] = useState(false);
   const [classificacoes, setClassificacoes] = useState<Classificacao[]>([]);
   const [tarefas, setTarefas] = useState<Tarefa[]>([]);
   const [selectedClassificacao, setSelectedClassificacao] = useState<
      number | null
   >(null);
   const [selectedTarefa, setSelectedTarefa] = useState<number | null>(null);
   const [loadingClassificacoes, setLoadingClassificacoes] = useState(false);
   const [loadingTarefas, setLoadingTarefas] = useState(false);
   const selectRef = useRef<HTMLSelectElement>(null);
   // ================================================================================

   // Função para buscar classificações
   const fetchClassificacoes = async () => {
      setLoadingClassificacoes(true);
      try {
         const response = await fetch('/api/classificacao');
         if (response.ok) {
            const data = await response.json();
            setClassificacoes(data);
         } else {
            console.error('Erro ao buscar classificações');
         }
      } catch (error) {
         console.error('Erro ao buscar classificações:', error);
      } finally {
         setLoadingClassificacoes(false);
      }
   };

   // Função para buscar tarefas
   const fetchTarefas = async () => {
      setLoadingTarefas(true);
      try {
         const response = await fetch(`/api/atribuir-tarefa/${codChamado}`);
         if (response.ok) {
            const data = await response.json();
            setTarefas(data);
         } else {
            console.error('Erro ao buscar tarefas');
         }
      } catch (error) {
         console.error('Erro ao buscar tarefas:', error);
      } finally {
         setLoadingTarefas(false);
      }
   };

   // Abre automaticamente o select quando entra em modo de edição
   useEffect(() => {
      if (editing && selectRef.current) {
         setTimeout(() => {
            const select = selectRef.current;
            if (select) {
               select.focus();
               if ('showPicker' in select) {
                  (select as any).showPicker();
               } else {
                  (select as HTMLSelectElement).click();
               }
            }
         }, 10);
      }
   }, [editing]);

   const handleSelectChange = async (
      e: React.ChangeEvent<HTMLSelectElement>
   ) => {
      const newStatus = e.target.value;

      // Se selecionou o mesmo status, apenas fecha a edição
      if (newStatus === status) {
         setEditing(false);
         return;
      }

      // Armazena o novo status pendente
      setPendingStatus(newStatus);
      setEditing(false);

      // Buscar dados necessários baseado no status
      if (newStatus === 'EM ATENDIMENTO') {
         await fetchTarefas();
      } else {
         await fetchClassificacoes();
      }

      setShowConfirmDialog(true);
   };

   // Nova função para lidar com cliques no select
   const handleSelectClick = (e: React.MouseEvent<HTMLSelectElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setEditing(false);
   };

   const handleConfirmChange = async () => {
      if (!pendingStatus) return;

      // Validações específicas por status
      if (pendingStatus === 'EM ATENDIMENTO' && !selectedTarefa) {
         alert('Por favor, selecione uma tarefa.');
         return;
      }

      if (pendingStatus !== 'EM ATENDIMENTO' && !selectedClassificacao) {
         alert('Por favor, selecione uma classificação.');
         return;
      }

      setIsUpdating(true);
      try {
         await onUpdateStatus(
            codChamado,
            pendingStatus,
            pendingStatus !== 'EM ATENDIMENTO'
               ? selectedClassificacao!
               : undefined,
            pendingStatus === 'EM ATENDIMENTO' ? selectedTarefa! : undefined
         );
         setStatus(pendingStatus);
      } catch (error) {
         console.error('Erro ao atualizar status:', error);
      } finally {
         setIsUpdating(false);
         setPendingStatus(null);
         setSelectedClassificacao(null);
         setSelectedTarefa(null);
         setShowConfirmDialog(false);
      }
   };

   const handleCancelChange = () => {
      setPendingStatus(null);
      setSelectedClassificacao(null);
      setSelectedTarefa(null);
      setShowConfirmDialog(false);
   };

   const handleKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
      if (e.key === 'Escape') {
         setEditing(false);
      }
   };

   // Função para lidar com blur - só fecha se não foi um clique
   const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      // Pequeno delay para permitir que o clique seja processado primeiro
      setTimeout(() => {
         setEditing(false);
      }, 100);
   };

   const handleCloseModal = () => {
      setTimeout(() => {
         setShowConfirmDialog(false);
         setPendingStatus(null);
         setSelectedClassificacao(null);
         setSelectedTarefa(null);
      }, 300);
   };

   const getStatusDisplayName = (statusValue: string) => {
      return statusValue;
   };

   // Verificar se precisa mostrar select de classificação ou tarefa
   const shouldShowClassificacao =
      pendingStatus && pendingStatus !== 'EM ATENDIMENTO';
   const shouldShowTarefa = pendingStatus === 'EM ATENDIMENTO';
   // ================================================================================

   return (
      <>
         <div className="text-center">
            {editing ? (
               <select
                  ref={selectRef}
                  autoFocus
                  value={status}
                  onBlur={handleBlur}
                  onChange={handleSelectChange}
                  onClick={handleSelectClick}
                  onKeyDown={handleKeyDown}
                  className={`min-w-[120px] rounded-md px-6 py-2 font-semibold ${getStylesStatus(status)}`}
                  disabled={isUpdating}
               >
                  {statusOptions.map(opt => (
                     <option
                        key={opt}
                        value={opt}
                        className="bg-white text-gray-900"
                     >
                        {getStatusDisplayName(opt)}
                     </option>
                  ))}
               </select>
            ) : (
               <TooltipProvider>
                  <Tooltip>
                     <TooltipTrigger asChild>
                        <div
                           className={`group relative cursor-pointer rounded-md p-2 transition-all hover:scale-105 hover:shadow-lg hover:shadow-black ${getStylesStatus(status)} ${
                              isUpdating ? 'cursor-wait opacity-50' : ''
                           }`}
                           onClick={() => !isUpdating && setEditing(true)}
                        >
                           <div className="flex items-center justify-center gap-4">
                              {isUpdating ? (
                                 <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                    <span className="font-semibold">
                                       Atualizando...
                                    </span>
                                 </>
                              ) : (
                                 <>
                                    <span className="font-semibold">
                                       {status ?? 'Sem status'}
                                    </span>
                                    <FaEdit
                                       className="opacity-0 transition-opacity group-hover:opacity-100"
                                       size={16}
                                    />
                                 </>
                              )}
                           </div>
                        </div>
                     </TooltipTrigger>
                     <TooltipContent
                        side="right"
                        align="start"
                        sideOffset={8}
                        className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
                     >
                        <div>
                           <div className="break-words">
                              Status atual: {status}
                           </div>
                           <div className="mt-1 text-xs font-semibold tracking-wider text-gray-700 italic select-none">
                              {isUpdating
                                 ? 'Aguarde...'
                                 : 'Clique para alterar o status'}
                           </div>
                        </div>
                     </TooltipContent>
                  </Tooltip>
               </TooltipProvider>
            )}
         </div>

         {/* Dialog de Confirmação */}
         <AlertDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}
         >
            <AlertDialogContent className="max-w-2xl overflow-hidden rounded-2xl border-0 bg-white/95 p-0 shadow-2xl backdrop-blur-md">
               <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <AlertDialogHeader className="space-y-0">
                     <AlertDialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm">
                              <FaSync className="text-white" size={20} />
                           </div>
                           <div>
                              <h3 className="text-xl font-bold">
                                 Alterar Status
                              </h3>
                              <p className="text-sm font-medium text-blue-100">
                                 Chamado #{codChamado}
                              </p>
                           </div>
                        </div>
                        <button
                           onClick={handleCloseModal}
                           className="group rounded-xl bg-white/10 p-2 transition-all duration-200 hover:rotate-90 hover:bg-white/20"
                        >
                           <IoClose size={20} />
                        </button>
                     </AlertDialogTitle>
                  </AlertDialogHeader>
               </div>

               <div className="space-y-6 p-6">
                  {/* Visualização da Mudança */}
                  <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                     <div className="flex items-center justify-center gap-8">
                        <div className="space-y-2 text-center">
                           <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                              Status Atual
                           </p>
                           <div
                              className={`inline-block rounded-xl px-4 py-2 text-sm font-semibold shadow-lg ${getStylesStatus(status)}`}
                           >
                              {getStatusDisplayName(status)}
                           </div>
                        </div>

                        <div className="flex items-center">
                           <FaArrowRightLong
                              className="animate-pulse text-slate-400"
                              size={24}
                           />
                        </div>

                        <div className="space-y-2 text-center">
                           <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                              Novo Status
                           </p>
                           <div
                              className={`inline-block rounded-xl px-4 py-2 text-sm font-semibold shadow-lg ${getStylesStatus(pendingStatus || '')}`}
                           >
                              {pendingStatus
                                 ? getStatusDisplayName(pendingStatus)
                                 : ''}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Select de Classificação */}
                  {shouldShowClassificacao && (
                     <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-700">
                           <div className="rounded-lg bg-blue-100 p-2">
                              <MdCategory className="text-blue-600" size={18} />
                           </div>
                           <h5 className="text-lg font-bold">
                              Selecione uma Classificação
                           </h5>
                        </div>

                        {loadingClassificacoes ? (
                           <div className="flex items-center justify-center gap-3 py-8 text-slate-600">
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                              <span className="font-medium">
                                 Carregando classificações...
                              </span>
                           </div>
                        ) : (
                           <div className="space-y-2">
                              <select
                                 value={selectedClassificacao || ''}
                                 onChange={e =>
                                    setSelectedClassificacao(
                                       Number(e.target.value) || null
                                    )
                                 }
                                 className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 font-medium text-slate-900 transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none"
                                 required
                              >
                                 <option value="">
                                    Selecione uma classificação...
                                 </option>
                                 {classificacoes.map(classificacao => (
                                    <option
                                       key={classificacao.COD_CLASSIFICACAO}
                                       value={classificacao.COD_CLASSIFICACAO}
                                    >
                                       {classificacao.NOME_CLASSIFICACAO}
                                    </option>
                                 ))}
                              </select>
                              <p className="px-1 text-xs text-slate-500 italic">
                                 * Campo obrigatório
                              </p>
                           </div>
                        )}
                     </div>
                  )}

                  {/* Select de Tarefa */}
                  {shouldShowTarefa && (
                     <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-700">
                           <div className="rounded-lg bg-green-100 p-2">
                              <FaTasks className="text-green-600" size={18} />
                           </div>
                           <h5 className="text-lg font-bold">
                              Selecione uma Tarefa
                           </h5>
                        </div>

                        {loadingTarefas ? (
                           <div className="flex items-center justify-center gap-3 py-8 text-slate-600">
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
                              <span className="font-medium">
                                 Carregando tarefas...
                              </span>
                           </div>
                        ) : (
                           <div className="space-y-2">
                              <select
                                 value={selectedTarefa || ''}
                                 onChange={e =>
                                    setSelectedTarefa(
                                       Number(e.target.value) || null
                                    )
                                 }
                                 className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 font-medium text-slate-900 transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 focus:outline-none"
                                 required
                              >
                                 <option value="">
                                    Selecione uma tarefa...
                                 </option>
                                 {tarefas.map(tarefa => (
                                    <option
                                       key={tarefa.COD_TAREFA}
                                       value={tarefa.COD_TAREFA}
                                    >
                                       {tarefa.NOME_TAREFA}
                                    </option>
                                 ))}
                              </select>
                              <p className="px-1 text-xs text-slate-500 italic">
                                 * Campo obrigatório
                              </p>
                           </div>
                        )}
                     </div>
                  )}

                  <AlertDialogDescription asChild>
                     <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                           <FaExclamationTriangle
                              className="mt-0.5 flex-shrink-0 text-amber-600"
                              size={16}
                           />
                           <p className="text-sm font-medium text-amber-800">
                              Esta alteração será salva permanentemente no
                              sistema.
                           </p>
                        </div>
                     </div>
                  </AlertDialogDescription>
               </div>

               <AlertDialogFooter className="gap-3 bg-slate-50 px-6 py-4">
                  <AlertDialogCancel
                     onClick={handleCancelChange}
                     className="rounded-xl border-2 border-slate-200 bg-white px-6 py-2.5 font-semibold text-slate-700 transition-all duration-200 hover:scale-105 hover:border-slate-300 hover:bg-slate-50 active:scale-95"
                  >
                     Cancelar
                  </AlertDialogCancel>

                  <AlertDialogAction
                     onClick={handleConfirmChange}
                     disabled={
                        isUpdating ||
                        (shouldShowClassificacao && !selectedClassificacao) ||
                        (shouldShowTarefa && !selectedTarefa)
                     }
                     className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                     {isUpdating ? (
                        <div className="flex items-center gap-2">
                           <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                           <span>Salvando...</span>
                        </div>
                     ) : (
                        <div className="flex items-center gap-2">
                           <FaSync size={14} />
                           <span>Confirmar</span>
                        </div>
                     )}
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </>
   );
}
