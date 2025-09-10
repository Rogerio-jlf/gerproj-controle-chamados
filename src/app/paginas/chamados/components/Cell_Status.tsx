'use client';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from '../../../../components/ui/tooltip';
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from '../../../../components/ui/alert-dialog';
// ================================================================================
import { getStylesStatus } from '../../../../utils/formatters';
import { ToastCustom } from '../../../../components/Toast_Custom';
// ================================================================================
import { FaExclamationTriangle, FaEdit, FaSync } from 'react-icons/fa';
import { FaArrowRightLong } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';

// ================================================================================
// INTERFACES E TIPOS
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
// CONSTANTES E CONFIGURAÇÕES
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
// UTILITÁRIOS E HELPERS
// ================================================================================

// Função para filtrar as opções baseado no status atual
const getAvailableStatusOptions = (currentStatus: string) => {
   if (currentStatus === 'ATRIBUIDO') {
      // Se o status atual é ATRIBUIDO, só pode ir para EM ATENDIMENTO
      return ['EM ATENDIMENTO'];
   } else {
      // Para todos os outros status, todas as opções exceto ATRIBUIDO
      return statusOptions.filter(option => option !== 'ATRIBUIDO');
   }
};

const getStatusDisplayName = (statusValue: string) => {
   return statusValue;
};

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================

export default function StatusCell({
   status: initialStatus,
   codChamado,
   onUpdateStatus,
}: Props) {
   // ================================================================================
   // ESTADOS - CONTROLES DE EDIÇÃO
   // ================================================================================
   const [editing, setEditing] = useState(false);
   const [status, setStatus] = useState(initialStatus);
   const [pendingStatus, setPendingStatus] = useState<string | null>(null);
   const [isUpdating, setIsUpdating] = useState(false);

   // ================================================================================
   // ESTADOS - MODAIS E DIÁLOGOS
   // ================================================================================
   const [showConfirmDialog, setShowConfirmDialog] = useState(false);

   // ================================================================================
   // ESTADOS - DADOS E CARREGAMENTO
   // ================================================================================
   const [classificacoes, setClassificacoes] = useState<Classificacao[]>([]);
   const [tarefas, setTarefas] = useState<Tarefa[]>([]);
   const [selectedClassificacao, setSelectedClassificacao] = useState<
      number | null
   >(null);
   const [selectedTarefa, setSelectedTarefa] = useState<number | null>(null);
   const [loadingClassificacoes, setLoadingClassificacoes] = useState(false);
   const [loadingTarefas, setLoadingTarefas] = useState(false);

   // ================================================================================
   // REFS
   // ================================================================================
   const selectRef = useRef<HTMLSelectElement>(null);

   // ================================================================================
   // VARIÁVEIS COMPUTADAS
   // ================================================================================
   const availableStatusOptions = getAvailableStatusOptions(status);
   const shouldShowClassificacao =
      pendingStatus && pendingStatus !== 'EM ATENDIMENTO';
   const shouldShowTarefa = pendingStatus === 'EM ATENDIMENTO';

   // ================================================================================
   // API E FUNÇÕES DE DADOS
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

   // ================================================================================
   // HANDLERS E CALLBACKS
   // ================================================================================

   const handleSelectChange = async (
      e: React.ChangeEvent<HTMLSelectElement>
   ) => {
      const newStatus = e.target.value;

      if (newStatus === status) {
         setEditing(false);
         return;
      }

      setPendingStatus(newStatus);
      setEditing(false);
      setShowConfirmDialog(true);

      if (newStatus === 'EM ATENDIMENTO') {
         await fetchTarefas();
      } else {
         await fetchClassificacoes();
      }
   };

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

         // Toast de sucesso
         toast.custom(t => (
            <ToastCustom
               type="success"
               title="Status atualizado com sucesso!"
               description={`Chamado #${codChamado}`}
            />
         ));
      } catch (error) {
         console.error('Erro ao atualizar status:', error);

         toast.custom(t => (
            <ToastCustom
               type="error"
               title="Erro ao tentar atualizar o status"
               description="Tente novamente em instantes."
            />
         ));
      }

      // Delay para mostrar o resultado antes de fechar
      setTimeout(() => {
         setIsUpdating(false);
         setPendingStatus(null);
         setSelectedClassificacao(null);
         setSelectedTarefa(null);
         setShowConfirmDialog(false);
      }, 2000);
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

   // ================================================================================
   // EFFECTS
   // ================================================================================

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

   // ================================================================================
   // RENDERIZAÇÃO PRINCIPAL
   // ================================================================================

   return (
      <>
         {/* ===== CÉLULA DE STATUS ===== */}
         <div className="text-center">
            {editing ? (
               // ===== MODO DE EDIÇÃO - SELECT =====
               <select
                  ref={selectRef}
                  autoFocus
                  value={status}
                  onBlur={handleBlur}
                  onChange={handleSelectChange}
                  onClick={handleSelectClick}
                  onKeyDown={handleKeyDown}
                  className={`w-[300px] min-w-[160px] rounded-md px-6 py-2 font-semibold ${getStylesStatus(status)}`}
                  disabled={isUpdating}
               >
                  {/* Incluir o status atual como primeira opção para manter o valor selecionado */}
                  {!availableStatusOptions.includes(status) && (
                     <option
                        key={status}
                        value={status}
                        className="bg-white text-gray-900"
                     >
                        {getStatusDisplayName(status)}
                     </option>
                  )}
                  {/* Usar as opções filtradas ao invés de todas as opções */}
                  {availableStatusOptions.map(opt => (
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
               // ===== MODO DE VISUALIZAÇÃO - TOOLTIP =====
               <TooltipProvider>
                  <Tooltip>
                     <TooltipTrigger asChild>
                        <div
                           className={`group relative cursor-pointer rounded-md px-6 py-2 font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-black ${getStylesStatus(status)} ${
                              isUpdating ? 'cursor-wait opacity-50' : ''
                           }`}
                           onClick={() => !isUpdating && setEditing(true)}
                        >
                           <div className="flex items-center justify-center gap-4">
                              <span className="font-semibold">
                                 {status ?? 'Sem status'}
                              </span>
                              <FaEdit
                                 className="opacity-0 transition-opacity group-hover:opacity-100"
                                 size={16}
                              />
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
                                 : status === 'ATRIBUIDO'
                                   ? 'Clique para colocar em atendimento'
                                   : 'Clique para alterar o status'}
                           </div>
                        </div>
                     </TooltipContent>
                  </Tooltip>
               </TooltipProvider>
            )}
         </div>

         {/* ===== MODAL DE CONFIRMAÇÃO ===== */}
         <AlertDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}
         >
            <AlertDialogContent className="max-w-3xl overflow-hidden rounded-2xl border-none bg-slate-50 p-0">
               {/* ===== OVERLAY DE LOADING - ATUALIZAÇÃO ===== */}
               {isUpdating && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                     <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        <span className="text-lg font-bold tracking-wider text-slate-800 select-none">
                           Atualizando status...
                        </span>
                        <span className="text-sm font-semibold tracking-wider text-slate-600 italic select-none">
                           Chamado #{codChamado}
                        </span>
                     </div>
                  </div>
               )}

               {/* ===== OVERLAY DE LOADING - BUSCAR DADOS ===== */}
               {(loadingClassificacoes || loadingTarefas) && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
                     <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        <span className="text-base font-semibold tracking-wider text-slate-800 select-none">
                           Carregando dados...
                        </span>
                     </div>
                  </div>
               )}

               {/* ===== HEADER DO MODAL ===== */}
               <header className="bg-blue-600 p-6 text-white">
                  <AlertDialogHeader className="space-y-0">
                     <AlertDialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="rounded-md bg-white/10 p-4 shadow-md shadow-black">
                              <FaSync className="text-white" size={24} />
                           </div>
                           <div>
                              <h3 className="text-2xl font-extrabold tracking-wider text-white select-none">
                                 Alterar Status
                              </h3>
                              <p className="text-base font-semibold tracking-widest text-gray-200 italic select-none">
                                 Chamado #{codChamado}
                              </p>
                           </div>
                        </div>
                        <button
                           onClick={handleCloseModal}
                           className="group cursor-pointer rounded-full bg-red-600/50 p-2 transition-all hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95"
                        >
                           <IoClose size={20} />
                        </button>
                     </AlertDialogTitle>
                  </AlertDialogHeader>
               </header>

               {/* ===== CONTEÚDO DO MODAL ===== */}
               <main className="space-y-6 p-6">
                  {/* ===== VISUALIZAÇÃO DA MUDANÇA ===== */}
                  <section className="rounded-md bg-white p-6 shadow-sm shadow-black">
                     <div className="flex items-center justify-center gap-8">
                        <div className="space-y-2 text-center">
                           <p className="text-xs font-semibold tracking-wide text-slate-800 uppercase select-none">
                              Status Atual
                           </p>
                           <div
                              className={`inline-block rounded-md border-none px-6 py-2 text-sm font-semibold tracking-wider select-none ${getStylesStatus(status)}`}
                           >
                              {getStatusDisplayName(status)}
                           </div>
                        </div>

                        <div className="flex items-center">
                           <FaArrowRightLong className="text-black" size={24} />
                        </div>

                        <div className="space-y-2 text-center">
                           <p className="text-xs font-semibold tracking-wide text-slate-800 uppercase select-none">
                              Novo Status
                           </p>
                           <div
                              className={`inline-block rounded-md border-none px-6 py-2 text-sm font-semibold tracking-wider select-none ${getStylesStatus(pendingStatus || '')}`}
                           >
                              {pendingStatus
                                 ? getStatusDisplayName(pendingStatus)
                                 : ''}
                           </div>
                        </div>
                     </div>
                  </section>

                  {/* ===== SELECT DE CLASSIFICAÇÃO ===== */}
                  {shouldShowClassificacao && (
                     <section className="space-y-4">
                        {!loadingClassificacoes && (
                           <div className="space-y-2">
                              <select
                                 value={selectedClassificacao || ''}
                                 onChange={e =>
                                    setSelectedClassificacao(
                                       Number(e.target.value) || null
                                    )
                                 }
                                 className="w-full cursor-pointer rounded-md border-none bg-white px-4 py-2 font-semibold text-slate-900 shadow-sm shadow-black transition-all hover:scale-105 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                                 required
                              >
                                 <option
                                    value=""
                                    className="cursor-pointer font-semibold tracking-wider text-black select-none"
                                 >
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
                              <div className="flex items-center gap-2">
                                 <div className="h-2 w-2 rounded-full bg-slate-800"></div>
                                 <span className="text-xs font-semibold tracking-wider text-slate-800 italic select-none">
                                    Campo obrigatório
                                 </span>
                              </div>
                           </div>
                        )}
                     </section>
                  )}

                  {/* ===== SELECT DE TAREFA ===== */}
                  {shouldShowTarefa && (
                     <section className="space-y-4">
                        {!loadingTarefas && (
                           <div className="space-y-2">
                              <select
                                 value={selectedTarefa || ''}
                                 onChange={e =>
                                    setSelectedTarefa(
                                       Number(e.target.value) || null
                                    )
                                 }
                                 className="w-full cursor-pointer rounded-md border-none bg-slate-50 px-4 py-2 font-semibold text-slate-900 shadow-sm shadow-black transition-all hover:scale-105 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                                 required
                              >
                                 <option value="">
                                    Selecione uma tarefa...
                                 </option>
                                 {tarefas.map(tarefa => (
                                    <option
                                       key={tarefa.COD_TAREFA}
                                       value={tarefa.COD_TAREFA}
                                       className="cursor-pointer font-semibold tracking-wider text-black select-none"
                                    >
                                       {tarefa.NOME_TAREFA}
                                    </option>
                                 ))}
                              </select>
                              <div className="flex items-center gap-2">
                                 <div className="h-2 w-2 rounded-full bg-slate-800"></div>
                                 <span className="text-xs font-semibold tracking-wider text-slate-800 italic select-none">
                                    Campo obrigatório
                                 </span>
                              </div>
                           </div>
                        )}
                     </section>
                  )}

                  {/* ===== AVISO DE CONFIRMAÇÃO ===== */}
                  {(selectedClassificacao || selectedTarefa) && (
                     <AlertDialogDescription asChild>
                        <section className="rounded-lg border-l-4 border-amber-500 bg-amber-100 p-4 shadow-sm shadow-black">
                           <div className="flex items-start gap-3">
                              <FaExclamationTriangle
                                 className="mt-0.5 text-amber-600"
                                 size={16}
                              />
                              <p className="text-sm font-semibold tracking-wider text-amber-600 italic select-none">
                                 Esta alteração será salva permanentemente.
                              </p>
                           </div>
                        </section>
                     </AlertDialogDescription>
                  )}
               </main>

               {/* ===== FOOTER DO MODAL ===== */}
               <AlertDialogFooter className="gap-3 border-t border-red-600 bg-slate-50 p-6">
                  <AlertDialogCancel
                     onClick={handleCancelChange}
                     className="cursor-pointer rounded-xl border-none bg-red-600 px-6 py-2 text-lg font-bold tracking-wider text-white transition-all select-none hover:scale-110 hover:bg-red-900 hover:shadow-md hover:shadow-black active:scale-95"
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
                     className={`rounded-xl border-none bg-blue-600 px-6 py-2 text-lg font-bold tracking-wider text-white transition-all select-none hover:scale-110 hover:bg-blue-900 hover:shadow-md hover:shadow-black active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-900 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-slate-900 disabled:hover:shadow-none`}
                  >
                     {isUpdating ? (
                        <div className="flex items-center gap-2">
                           <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                           <span>Atualizando...</span>
                        </div>
                     ) : (
                        <span>Atualizar</span>
                     )}
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </>
   );
}
