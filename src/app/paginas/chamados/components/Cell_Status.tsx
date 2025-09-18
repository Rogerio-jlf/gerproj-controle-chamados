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
// ================================================================================
import { getStylesStatus } from '../../../../utils/formatters';
import { ToastCustom } from '../../../../components/Toast_Custom';
// ================================================================================
import { FaExclamationTriangle, FaEdit, FaSync } from 'react-icons/fa';
import { FaArrowRightLong } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';
import { Loader2 } from 'lucide-react';

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
   // Nova prop para controlar o modal de apontamentos
   onOpenApontamentos?: (codChamado: number, newStatus: string) => void;
}

// Modal Component
interface ModalProps {
   isOpen: boolean;
   onClose: () => void;
   children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
   useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
         if (e.key === 'Escape') {
            onClose();
         }
      };

      if (isOpen) {
         document.addEventListener('keydown', handleEscape);
         document.body.style.overflow = 'hidden';
      }

      return () => {
         document.removeEventListener('keydown', handleEscape);
         document.body.style.overflow = 'unset';
      };
   }, [isOpen, onClose]);

   if (!isOpen) return null;

   return (
      <div
         className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl"
         onClick={onClose}
      >
         <div
            className="relative max-h-[100vh] w-full max-w-4xl overflow-hidden"
            onClick={e => e.stopPropagation()}
         >
            {children}
         </div>
      </div>
   );
};

// ================================================================================
// CONSTANTES E CONFIGURAÇÕES
// ================================================================================

const statusOptions = [
   'NAO FINALIZADO',
   'EM ATENDIMENTO',
   'FINALIZADO',
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
      return statusOptions.filter(
         option => option !== 'ATRIBUIDO' && option !== 'NAO INICIADO'
      );
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
   onOpenApontamentos, // Nova prop
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

   // ===== NOVA VARIÁVEL: VERIFICAR SE STATUS PERMITE EDIÇÃO =====
   const isStatusEditable = status !== 'NAO INICIADO';

   // ================================================================================
   // API E FUNÇÕES DE DADOS
   // ================================================================================

   // Função API para buscar classificações
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

   // Função API para buscar tarefas
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

   // Handler para mudança de status
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
   // ==========

   // Handler para clique no select - previne propagação
   const handleSelectClick = (e: React.MouseEvent<HTMLSelectElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setEditing(false);
   };
   // ==========

   // Handler para confirmar a mudança de status
   const handleSubmitUpdate = async () => {
      if (!pendingStatus) return;

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
         const start = Date.now();
         await onUpdateStatus(
            codChamado,
            pendingStatus,
            pendingStatus !== 'EM ATENDIMENTO'
               ? selectedClassificacao!
               : undefined,
            pendingStatus === 'EM ATENDIMENTO' ? selectedTarefa! : undefined
         );

         const elapsed = Date.now() - start;
         if (elapsed < 800) {
            await new Promise(res => setTimeout(res, 800 - elapsed));
         }

         setStatus(pendingStatus);

         toast.custom(t => (
            <ToastCustom
               type="success"
               title="Sucesso!!!"
               description={`O Chamado #${codChamado} foi atualizado com sucesso.`}
               information="Aguarde... O Modal para apontamento, será aberto."
            />
         ));

         setShowConfirmDialog(false);

         // ===== NOVA FUNCIONALIDADE: ABRIR MODAL DE APONTAMENTOS =====
         // Após o sucesso da atualização do status, abrir o modal de apontamentos
         if (onOpenApontamentos) {
            // Pequeno delay para garantir que o modal de status feche completamente
            setTimeout(() => {
               onOpenApontamentos(codChamado, pendingStatus);
            }, 300);
         }
         // ==========================================
      } catch (error) {
         console.error('Erro ao atualizar status:', error);

         toast.custom(t => (
            <ToastCustom
               type="error"
               title="Erro ao tentar atualizar o status"
               description="Tente novamente em instantes."
            />
         ));
      } finally {
         setIsUpdating(false);
         setPendingStatus(null);
         setSelectedClassificacao(null);
         setSelectedTarefa(null);
      }
   };
   // ==========

   // Handler para cancelar a mudança de status
   const handleCancelChange = () => {
      setPendingStatus(null);
      setSelectedClassificacao(null);
      setSelectedTarefa(null);
      setShowConfirmDialog(false);
   };
   // ==========

   // Handler para teclado - fechar edição com ESC
   const handleKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
      if (e.key === 'Escape') {
         setEditing(false);
      }
   };
   // ==========

   // Handler para blur - fechar edição ao perder foco
   const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      // Pequeno delay para permitir que o clique seja processado primeiro
      setTimeout(() => {
         setEditing(false);
      }, 100);
   };
   // ==========

   // Handler para fechar o modal
   const handleCloseModal = () => {
      if (!isUpdating) {
         setTimeout(() => {
            setShowConfirmDialog(false);
            setPendingStatus(null);
            setSelectedClassificacao(null);
            setSelectedTarefa(null);
         }, 300);
      }
   };
   // ==========

   // Handler para clique na célula de status
   const handleStatusCellClick = () => {
      // Se o status não é editável (NAO INICIADO), não faz nada
      if (!isStatusEditable) {
         return;
      }

      // Se não está atualizando, permite editar
      if (!isUpdating) {
         setEditing(true);
      }
   };

   // ================================================================================
   // EFFECTS
   // ================================================================================

   // Abre automaticamente o select quando entra em modo de edição
   useEffect(() => {
      const canEdit = status !== 'NAO INICIADO';
      if (editing && selectRef.current && canEdit) {
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
   }, [editing, status]);

   // ================================================================================
   // RENDERIZAÇÃO PRINCIPAL
   // ================================================================================
   return (
      <>
         {/* ===== CÉLULA DE STATUS ===== */}
         <div className="text-center">
            {editing && isStatusEditable ? (
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
                        className="bg-white text-black"
                     >
                        {getStatusDisplayName(status)}
                     </option>
                  )}
                  {/* Usar as opções filtradas ao invés de todas as opções */}
                  {availableStatusOptions.map(opt => (
                     <option
                        key={opt}
                        value={opt}
                        className="bg-white text-black"
                     >
                        {getStatusDisplayName(opt)}
                     </option>
                  ))}
               </select>
            ) : (
               // ===== TOOLTIP =====
               <TooltipProvider>
                  <Tooltip>
                     <TooltipTrigger asChild>
                        <div
                           className={`group relative rounded-md px-6 py-2 font-semibold transition-all ${
                              isStatusEditable
                                 ? 'cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-black'
                                 : 'cursor-not-allowed opacity-75'
                           } ${getStylesStatus(status)} ${
                              isUpdating ? 'cursor-wait opacity-50' : ''
                           }`}
                           onClick={handleStatusCellClick}
                        >
                           <div className="flex items-center justify-center gap-4">
                              <span className="font-semibold">
                                 {status ?? 'Sem status'}
                              </span>
                              {isStatusEditable && (
                                 <FaEdit
                                    className="opacity-0 transition-opacity group-hover:opacity-100"
                                    size={16}
                                 />
                              )}
                           </div>
                        </div>
                     </TooltipTrigger>
                     <TooltipContent
                        side="right"
                        align="start"
                        sideOffset={8}
                        className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black shadow-lg shadow-black select-none"
                     >
                        <div className="text-sm font-semibold tracking-wider text-black italic select-none">
                           {isUpdating
                              ? 'Aguarde...'
                              : !isStatusEditable
                                ? 'Esse chamado, só pode ser "ATRIBUIDO", via Atribuir Chamado'
                                : status === 'ATRIBUIDO'
                                  ? 'Clique para colocar "EM ATENDIMENTO"'
                                  : 'Clique para alterar o Status'}
                        </div>
                     </TooltipContent>
                  </Tooltip>
               </TooltipProvider>
            )}
         </div>
         {/* ==================== */}

         {/* ===== MODAL DE CONFIRMAÇÃO ===== */}
         <Modal isOpen={showConfirmDialog} onClose={handleCloseModal}>
            {/* ===== OVERLAY DO MODAL ===== */}
            <div
               className="absolute inset-0 bg-black/50 backdrop-blur-xl"
               // onClick={handleCloseModal}
            />
            {/* ========== */}
            {/* ===== CONTAINER ===== */}
            <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-4xl overflow-hidden rounded-2xl border-0 bg-white transition-all duration-500 ease-out">
               {/* ===== OVERLAY DO LOADING ===== */}
               {(loadingClassificacoes || loadingTarefas) && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-lg">
                     <div className="flex flex-col items-center gap-4">
                        <Loader2
                           className="animate-spin text-white"
                           size={40}
                        />
                        <span className="text-xl font-extrabold tracking-widest text-white italic select-none">
                           Carregando dados...
                        </span>
                     </div>
                  </div>
               )}
               {/* ==================== */}

               {/* ===== HEADER ===== */}
               <header className="relative flex items-center justify-between bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 p-6 shadow-md shadow-black">
                  <div className="flex items-center justify-center gap-6">
                     <div className="rounded-md border-none bg-white/10 p-3 shadow-md shadow-black">
                        <FaSync className="text-black" size={36} />
                     </div>
                     {/* ===== */}
                     <div className="flex flex-col">
                        <h1 className="text-3xl font-extrabold tracking-wider text-black select-none">
                           Alterar Status Chamado
                        </h1>
                        <p className="text-xl font-bold tracking-widest text-black italic select-none">
                           Chamado - #{codChamado}
                        </p>
                     </div>
                  </div>
                  {/* ========== */}

                  <button
                     onClick={handleCloseModal}
                     disabled={isUpdating}
                     className="group cursor-pointer rounded-full bg-red-500/50 p-2 text-white transition-all select-none hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                     <IoClose size={24} />
                  </button>
               </header>
               {/* ==================== */}

               {/* ===== CONTEÚDO ===== */}
               <main className="flex flex-col gap-12 p-6">
                  {/* ===== CARD DE VISUALIZAÇÃO ===== */}
                  <section className="flex flex-col items-center justify-center gap-10 rounded-md border-l-8 border-blue-600 bg-slate-50 p-6 text-center shadow-sm shadow-black">
                     <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center justify-center gap-3">
                           <FaSync className="text-black" size={20} />
                           <h4 className="text-xl font-extrabold tracking-wider text-black select-none">
                              Alteração de Status
                           </h4>
                        </div>
                        <p className="text-2xl font-extrabold tracking-widest text-black italic select-none">
                           Chamado - #{codChamado}
                        </p>
                     </div>

                     <div className="flex items-center justify-center gap-8">
                        <div className="flex flex-col items-center gap-1">
                           <p className="text-xs font-bold tracking-widest text-black uppercase italic select-none">
                              Status Atual
                           </p>
                           <div
                              className={`inline-block rounded-md px-6 py-2 text-lg font-extrabold tracking-widest select-none ${getStylesStatus(status)}`}
                           >
                              {getStatusDisplayName(status)}
                           </div>
                        </div>

                        <div className="mt-6 flex items-center justify-center">
                           <FaArrowRightLong className="text-black" size={24} />
                        </div>

                        <div className="flex flex-col items-center gap-1">
                           <p className="text-xs font-bold tracking-widest text-black uppercase italic select-none">
                              Novo Status
                           </p>
                           <div
                              className={`inline-block rounded-md border-none px-6 py-2 text-lg font-extrabold tracking-widest select-none ${getStylesStatus(pendingStatus || '')}`}
                           >
                              {pendingStatus
                                 ? getStatusDisplayName(pendingStatus)
                                 : ''}
                           </div>
                        </div>
                     </div>
                  </section>
                  {/* ==================== */}

                  {/* ===== SELECT DE CLASSIFICAÇÃO ===== */}
                  {shouldShowClassificacao && (
                     <section className="flex flex-col gap-1">
                        <label className="text-lg font-extrabold tracking-wider text-black select-none">
                           Classificação do Chamado
                        </label>

                        {!loadingClassificacoes && (
                           <div className="space-y-2">
                              <select
                                 value={selectedClassificacao || ''}
                                 onChange={e =>
                                    setSelectedClassificacao(
                                       Number(e.target.value) || null
                                    )
                                 }
                                 className="w-full cursor-pointer rounded-md border-none bg-slate-50 px-4 py-3 font-bold text-black shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 hover:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                                 required
                              >
                                 <option
                                    value=""
                                    className="cursor-pointer bg-white font-bold tracking-wider text-black italic select-none"
                                 >
                                    Selecione uma classificação...
                                 </option>
                                 {classificacoes.map(classificacao => (
                                    <option
                                       key={classificacao.COD_CLASSIFICACAO}
                                       value={classificacao.COD_CLASSIFICACAO}
                                       className="cursor-pointer bg-white font-bold tracking-wider text-black italic select-none"
                                    >
                                       {classificacao.NOME_CLASSIFICACAO}
                                    </option>
                                 ))}
                              </select>
                              {!selectedClassificacao && (
                                 <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-red-600"></div>
                                    <span className="text-sm font-semibold tracking-wider text-red-600 italic select-none">
                                       Campo obrigatório
                                    </span>
                                 </div>
                              )}
                              {selectedClassificacao && (
                                 <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-600"></div>
                                    <span className="text-sm font-semibold tracking-wider text-green-600 italic select-none">
                                       Classificação selecionada, pronto para
                                       salvar.
                                    </span>
                                 </div>
                              )}
                           </div>
                        )}
                     </section>
                  )}
                  {/* ==================== */}

                  {/* ===== SELECT DE TAREFA ===== */}
                  {shouldShowTarefa && (
                     <section className="space-y-4">
                        <label className="text-lg font-extrabold tracking-wider text-black select-none">
                           Tarefa do Chamado
                        </label>

                        {!loadingTarefas && (
                           <div className="space-y-2">
                              <select
                                 value={selectedTarefa || ''}
                                 onChange={e =>
                                    setSelectedTarefa(
                                       Number(e.target.value) || null
                                    )
                                 }
                                 className="w-full cursor-pointer rounded-md border-none bg-slate-50 px-4 py-3 font-bold text-black shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 hover:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                                 required
                              >
                                 <option
                                    value=""
                                    className="cursor-pointer bg-white font-bold tracking-wider text-black italic select-none"
                                 >
                                    Selecione uma tarefa...
                                 </option>
                                 {tarefas.map(tarefa => (
                                    <option
                                       key={tarefa.COD_TAREFA}
                                       value={tarefa.COD_TAREFA}
                                       className="cursor-pointer bg-white font-bold tracking-wider text-black italic select-none"
                                    >
                                       {tarefa.NOME_TAREFA}
                                    </option>
                                 ))}
                              </select>
                              {!selectedTarefa && (
                                 <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-red-600"></div>
                                    <span className="text-sm font-semibold tracking-wider text-red-600 italic select-none">
                                       Campo obrigatório
                                    </span>
                                 </div>
                              )}
                              {selectedTarefa && (
                                 <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-600"></div>
                                    <span className="text-sm font-semibold tracking-wider text-green-600 italic select-none">
                                       Tarefa selecionada
                                    </span>
                                 </div>
                              )}
                           </div>
                        )}
                     </section>
                  )}
                  {/* ==================== */}

                  {/* ===== AVISO DE CONFIRMAÇÃO ===== */}
                  {(selectedClassificacao || selectedTarefa) && (
                     <div className="rounded-lg border-l-4 border-red-600 bg-amber-200 p-4 shadow-sm shadow-black">
                        <div className="flex items-start gap-3">
                           <FaExclamationTriangle
                              className="mt-0.5 text-red-600"
                              size={16}
                           />
                           <p className="text-sm font-semibold tracking-widest text-black italic select-none">
                              Essa alteração será salva, permanentemente no
                              sistema.
                           </p>
                        </div>
                     </div>
                  )}
                  {/* ========== */}
               </main>
               {/* ==================== */}

               {/* ===== FOOTER ===== */}
               <footer className="relative flex justify-end gap-4 border-t-4 border-red-600 p-6">
                  <button
                     onClick={handleCancelChange}
                     disabled={isUpdating}
                     className="cursor-pointer rounded-xl border-none bg-red-500 px-6 py-2 text-lg font-extrabold text-white shadow-sm shadow-black transition-all select-none hover:scale-105 hover:bg-red-900 hover:shadow-md hover:shadow-black active:scale-95"
                  >
                     Cancelar
                  </button>
                  {/* ===== */}

                  <button
                     onClick={handleSubmitUpdate}
                     disabled={
                        isUpdating ||
                        (shouldShowClassificacao && !selectedClassificacao) ||
                        (shouldShowTarefa && !selectedTarefa)
                     }
                     className={`cursor-pointer rounded-xl border-none bg-blue-500 px-6 py-2 text-lg font-extrabold text-white shadow-sm shadow-black select-none ${
                        isUpdating ||
                        (shouldShowClassificacao && !selectedClassificacao) ||
                        (shouldShowTarefa && !selectedTarefa)
                           ? 'disabled:cursor-not-allowed disabled:opacity-50'
                           : 'transition-all hover:scale-105 hover:bg-blue-900 hover:shadow-md hover:shadow-black active:scale-95'
                     }`}
                  >
                     {isUpdating ? (
                        <div className="flex items-center gap-2">
                           <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                           <span>Atualizando...</span>
                        </div>
                     ) : (
                        <>Atualizar</>
                     )}
                  </button>
               </footer>
            </div>
         </Modal>
      </>
   );
}
