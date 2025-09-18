'use client';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from '../../../../../components/ui/tooltip';
// ================================================================================
import { getStylesStatus } from '../../../../../utils/formatters';
import { ToastCustom } from '../../../../../components/Toast_Custom';
import { useAuth } from '../../../../../hooks/useAuth';
// ================================================================================
import {
   FaExclamationTriangle,
   FaEdit,
   FaSync,
   FaCalendarAlt,
   FaCheckCircle,
   FaUserClock,
} from 'react-icons/fa';
import { FaArrowRightLong } from 'react-icons/fa6';
import { IoClose, IoDocumentText } from 'react-icons/io5';
import { IoMdClock } from 'react-icons/io';
import { IoIosSave } from 'react-icons/io';
import { BsFillXOctagonFill } from 'react-icons/bs';
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
   nomeCliente?: string;
   onUpdateSuccess?: () => void;
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
            className="relative max-h-[100vh] w-[1500px] overflow-hidden"
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

// Schema de validação com Zod para apontamentos
const apontamentoSchema = z
   .object({
      dataInicioOS: z
         .string()
         .min(1, 'Data é obrigatória')
         .refine(dateString => {
            const date = new Date(dateString);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date <= today;
         }, 'Data não pode ser maior que hoje'),

      horaInicioOS: z
         .string()
         .min(1, 'Hora de início é obrigatória')
         .regex(
            /^([01]?\d|2[0-3]):(00|15|30|45)$/,
            'A hora deve ser em intervalos de 15 minutos'
         ),

      horaFimOS: z
         .string()
         .min(1, 'Hora de fim é obrigatória')
         .regex(
            /^([01]?\d|2[0-3]):(00|15|30|45)$/,
            'A hora deve ser em intervalos de 15 minutos'
         ),

      observacaoOS: z
         .string()
         .min(10, 'Observação deve ter pelo menos 10 caracteres')
         .max(200, 'Observação deve ter no máximo 200 caracteres')
         .refine(
            val => val.trim().length > 0,
            'Observação não pode ser apenas espaços'
         ),
   })
   .refine(
      data => {
         if (!data.horaInicioOS || !data.horaFimOS) return true;

         const [startHours, startMinutes] = data.horaInicioOS
            .split(':')
            .map(Number);
         const [endHours, endMinutes] = data.horaFimOS.split(':').map(Number);

         const startTimeInMinutes = startHours * 60 + startMinutes;
         const endTimeInMinutes = endHours * 60 + endMinutes;

         return endTimeInMinutes > startTimeInMinutes;
      },
      {
         message: 'Hora de fim deve ser maior que hora de início',
         path: ['horaFimOS'],
      }
   )
   .refine(
      data => {
         if (!data.horaInicioOS || !data.horaFimOS) return true;

         const [startHours, startMinutes] = data.horaInicioOS
            .split(':')
            .map(Number);
         const [endHours, endMinutes] = data.horaFimOS.split(':').map(Number);

         const startTimeInMinutes = startHours * 60 + startMinutes;
         const endTimeInMinutes = endHours * 60 + endMinutes;
         const diffInMinutes = endTimeInMinutes - startTimeInMinutes;

         return diffInMinutes >= 15;
      },
      {
         message: 'Diferença mínima entre horários deve ser de 15 minutos',
         path: ['horaFimOS'],
      }
   );

type ApontamentoFormData = z.infer<typeof apontamentoSchema>;
type ApontamentoFormErrors = Partial<
   Record<keyof ApontamentoFormData | 'root', string>
>;

// ================================================================================
// UTILITÁRIOS E HELPERS
// ================================================================================

// Função para filtrar as opções baseado no status atual
const getAvailableStatusOptions = (currentStatus: string) => {
   if (currentStatus === 'ATRIBUIDO') {
      return ['EM ATENDIMENTO'];
   } else {
      return statusOptions.filter(
         option => option !== 'ATRIBUIDO' && option !== 'NAO INICIADO'
      );
   }
};

const getStatusDisplayName = (statusValue: string) => {
   return statusValue;
};

// Função para ajustar hora para o intervalo de 15 minutos mais próximo
const ajustaParaIntervalo = (value: string) => {
   if (!/^\d{1,2}:\d{2}$/.test(value)) return value;
   const [h, m] = value.split(':').map(Number);
   if (Number.isNaN(h) || Number.isNaN(m)) return value;

   const totalMinutes = h * 60 + m;
   let rounded = Math.round(totalMinutes / 15) * 15;

   const cap = 23 * 60 + 45;
   if (rounded > cap) rounded = cap;

   const finalH = Math.floor(rounded / 60);
   const finalM = rounded % 60;

   return `${String(finalH).padStart(2, '0')}:${String(finalM).padStart(2, '0')}`;
};

// Função utilitária para extrair o primeiro nome
const getPrimeiroNome = (nomeCompleto: string): string => {
   return nomeCompleto.trim().split(' ')[0];
};

// Função utilitária para remover acentos, mantendo espaços
const removerAcentos = (texto: string): string => {
   return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================

export default function StatusCellUnified({
   status: initialStatus,
   codChamado,
   onUpdateSuccess,
   nomeCliente,
}: Props) {
   const { user } = useAuth();

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
   const [showUnifiedModal, setShowUnifiedModal] = useState(false);

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
   // ESTADOS - APONTAMENTO
   // ================================================================================
   const [apontamentoData, setApontamentoData] = useState<ApontamentoFormData>({
      observacaoOS: '',
      dataInicioOS: new Date().toISOString().split('T')[0],
      horaInicioOS: '',
      horaFimOS: '',
   });
   const [apontamentoErrors, setApontamentoErrors] =
      useState<ApontamentoFormErrors>({});

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
   const isStatusEditable = status !== 'NAO INICIADO';

   // Para status diferente de "EM ATENDIMENTO", sempre precisa de apontamento
   const needsApontamento = pendingStatus && pendingStatus !== 'EM ATENDIMENTO';

   // ================================================================================
   // API E FUNÇÕES DE DADOS
   // ================================================================================

   // Função API para buscar classificações
   const fetchClassificacoes = async () => {
      setLoadingClassificacoes(true);
      try {
         const response = await fetch('/api/atribuir-classificacao');
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
      setShowUnifiedModal(true);

      // ✅ CORRIGIDO: Só carregar tarefas para EM ATENDIMENTO
      if (newStatus === 'EM ATENDIMENTO') {
         await fetchTarefas();
      } else {
         // Para outros status, só carregar classificações
         await fetchClassificacoes();
      }
   };

   // Handler para mudanças nos inputs de apontamento
   const handleApontamentoInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
   ) => {
      const { name, value } = e.target;

      let newValue = value;

      if (name === 'observacaoOS') {
         newValue = newValue.trimStart();
         if (newValue.length > 0) {
            newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
         }
      }

      setApontamentoData(prev => ({
         ...prev,
         [name]: newValue,
      }));

      if (apontamentoErrors[name as keyof ApontamentoFormData]) {
         setApontamentoErrors(prev => ({ ...prev, [name]: undefined }));
      }
   };

   // Handler para blur nos campos de hora
   const handleTimeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (name !== 'horaInicioOS' && name !== 'horaFimOS') return;

      const ajustado = ajustaParaIntervalo(value);
      if (ajustado !== value) {
         setApontamentoData(prev => ({ ...prev, [name]: ajustado }));
      }
   };

   // Validação do formulário de apontamento
   const validateApontamentoForm = (): boolean => {
      if (!needsApontamento) return true;

      try {
         apontamentoSchema.parse(apontamentoData);
         setApontamentoErrors({});
         return true;
      } catch (error) {
         if (error instanceof z.ZodError) {
            const newErrors: ApontamentoFormErrors = {};
            error.issues.forEach(err => {
               const path = err.path[0] as keyof ApontamentoFormData;
               newErrors[path] = err.message;
            });
            setApontamentoErrors(newErrors);
         }
         return false;
      }
   };

   // Handler para confirmar a mudança (UNIFICADO) - CORRIGIDO
   const handleUnifiedSubmit = async () => {
      if (!pendingStatus) return;

      // Validações básicas
      if (pendingStatus === 'EM ATENDIMENTO' && !selectedTarefa) {
         toast.custom(t => (
            <ToastCustom
               type="error"
               title="Erro"
               description="Por favor, selecione uma tarefa."
            />
         ));
         return;
      }

      if (pendingStatus !== 'EM ATENDIMENTO' && !selectedClassificacao) {
         toast.custom(t => (
            <ToastCustom
               type="error"
               title="Erro"
               description="Por favor, selecione uma classificação."
            />
         ));
         return;
      }

      // Validar apontamento se necessário
      if (needsApontamento && !validateApontamentoForm()) {
         return;
      }

      if (needsApontamento && !user?.recurso?.id) {
         toast.custom(t => (
            <ToastCustom
               type="error"
               title="Erro"
               description="Usuário sem recurso definido para apontamento."
            />
         ));
         return;
      }

      setIsUpdating(true);

      try {
         // ✅ PAYLOAD SIMPLIFICADO - A API usará CODTRF_CHAMADO automaticamente
         const payload: any = {
            statusChamado: pendingStatus,
         };

         // Adicionar classificação quando necessário
         if (pendingStatus !== 'EM ATENDIMENTO' && selectedClassificacao) {
            payload.codClassificacao = selectedClassificacao;
         }

         // Adicionar tarefa apenas para EM ATENDIMENTO
         if (pendingStatus === 'EM ATENDIMENTO' && selectedTarefa) {
            payload.codTarefa = selectedTarefa;
         }

         // ✅ DADOS DE OS SIMPLIFICADOS - API usará CODTRF_CHAMADO
         if (needsApontamento) {
            payload.criarOS = true;
            payload.dadosOS = {
               dataInicioOS: apontamentoData.dataInicioOS,
               horaInicioOS: apontamentoData.horaInicioOS,
               horaFimOS: apontamentoData.horaFimOS,
               observacaoOS: apontamentoData.observacaoOS.trim(),
               recurso: user?.recurso?.id?.toString() || '',
            };
            // ❌ REMOVER: payload.codTarefa = selectedClassificacao;
         }

         console.log('Payload enviado:', JSON.stringify(payload, null, 2));

         const start = Date.now();

         const response = await fetch(`/api/unified-status-os/${codChamado}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });

         const responseData = await response.json();

         console.log('Resposta da API:', responseData);

         if (!response.ok) {
            throw new Error(
               responseData.error || 'Erro ao processar solicitação'
            );
         }

         const elapsed = Date.now() - start;
         if (elapsed < 800) {
            await new Promise(res => setTimeout(res, 800 - elapsed));
         }

         setStatus(pendingStatus);

         // Mensagem de sucesso
         let successMessage = `Status do Chamado #${codChamado} atualizado com sucesso.`;
         if (responseData.os) {
            successMessage += ` OS #${responseData.os.NUM_OS} criada e associada ao chamado.`;
         }
         if (responseData.warning) {
            successMessage += ` Atenção: ${responseData.warning}`;
         }

         toast.custom(t => (
            <ToastCustom
               type="success"
               title="Operação realizada com sucesso!"
               description={successMessage}
            />
         ));

         handleCloseModal();

         if (onUpdateSuccess) {
            onUpdateSuccess();
         }
      } catch (error) {
         console.error('Erro na operação unificada:', error);

         toast.custom(t => (
            <ToastCustom
               type="error"
               title="Erro ao processar solicitação"
               description={
                  error instanceof Error
                     ? error.message
                     : 'Tente novamente em instantes.'
               }
            />
         ));
      } finally {
         setIsUpdating(false);
      }
   };

   // Handler para cancelar a mudança
   const handleCancelChange = () => {
      setPendingStatus(null);
      setSelectedClassificacao(null);
      setSelectedTarefa(null);
      setApontamentoData({
         observacaoOS: '',
         dataInicioOS: new Date().toISOString().split('T')[0],
         horaInicioOS: '',
         horaFimOS: '',
      });
      setApontamentoErrors({});
      setShowUnifiedModal(false);
   };

   // Handler para fechar o modal
   const handleCloseModal = () => {
      if (!isUpdating) {
         handleCancelChange();
      }
   };

   // Handler para clique na célula de status
   const handleStatusCellClick = () => {
      if (!isStatusEditable || isUpdating) {
         return;
      }
      setEditing(true);
   };

   // ================================================================================
   // EFFECTS
   // ================================================================================

   // Abre automaticamente o select quando entra em modo de edição
   useEffect(() => {
      if (editing && selectRef.current && isStatusEditable) {
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
   }, [editing, isStatusEditable, status]);

   // ================================================================================
   // FUNÇÕES DE VERIFICAÇÃO
   // ================================================================================

   const isFormValid = () => {
      // Verificar seleções obrigatórias
      if (shouldShowClassificacao && !selectedClassificacao) return false;
      if (shouldShowTarefa && !selectedTarefa) return false;

      // Se precisa de apontamento, validar também o formulário
      if (needsApontamento) {
         try {
            apontamentoSchema.parse(apontamentoData);
            return true;
         } catch {
            return false;
         }
      }

      return true;
   };

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
                  onBlur={() => setTimeout(() => setEditing(false), 100)}
                  onChange={handleSelectChange}
                  onClick={e => {
                     e.preventDefault();
                     e.stopPropagation();
                     setEditing(false);
                  }}
                  onKeyDown={e => {
                     if (e.key === 'Escape') {
                        setEditing(false);
                     }
                  }}
                  className={`w-[300px] min-w-[160px] rounded-md px-6 py-2 font-semibold ${getStylesStatus(status)}`}
                  disabled={isUpdating}
               >
                  {!availableStatusOptions.includes(status) && (
                     <option
                        key={status}
                        value={status}
                        className="bg-white text-black"
                     >
                        {getStatusDisplayName(status)}
                     </option>
                  )}
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

         {/* ===== MODAL UNIFICADO ===== */}
         <Modal isOpen={showUnifiedModal} onClose={handleCloseModal}>
            <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-[1500px] overflow-y-auto rounded-2xl border-0 bg-white transition-all duration-500 ease-out">
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

               {/* ===== HEADER ===== */}
               <header className="relative flex items-center justify-between bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 p-6 shadow-md shadow-black">
                  <div className="flex items-center justify-center gap-6">
                     <div className="rounded-md border-none bg-white/10 p-3 shadow-md shadow-black">
                        {needsApontamento ? (
                           <FaUserClock className="text-black" size={36} />
                        ) : (
                           <FaSync className="text-black" size={36} />
                        )}
                     </div>
                     <div className="flex flex-col">
                        <h1 className="text-3xl font-extrabold tracking-wider text-black select-none">
                           {needsApontamento
                              ? 'Alterar Status + Apontamento'
                              : 'Alterar Status Chamado'}
                        </h1>
                        <p className="text-xl font-bold tracking-widest text-black italic select-none">
                           Chamado - #{codChamado}
                        </p>
                     </div>
                  </div>

                  <button
                     onClick={handleCloseModal}
                     disabled={isUpdating}
                     className="group cursor-pointer rounded-full bg-red-500/50 p-2 text-white transition-all select-none hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                     <IoClose size={24} />
                  </button>
               </header>

               {/* ===== INDICADOR DE STATUS ===== */}
               {isUpdating && (
                  <div className="border-l-4 border-blue-500 bg-blue-100 p-4">
                     <div className="flex items-center">
                        <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                        <p className="font-semibold text-blue-700">
                           {needsApontamento
                              ? 'Processando mudança de status e criação de OS...'
                              : 'Processando mudança de status...'}{' '}
                           Por favor, aguarde.
                        </p>
                     </div>
                  </div>
               )}

               {/* ===== CONTEÚDO ===== */}
               <main className="flex flex-col gap-6 p-6">
                  {/* ===== CARD DE VISUALIZAÇÃO ===== */}

                  {/* Layout responsivo: lado a lado quando há apontamento, empilhado quando não há */}
                  <div
                     className={
                        needsApontamento
                           ? 'grid grid-cols-2 gap-6'
                           : 'flex flex-col gap-20'
                     }
                  >
                     <div className="flex flex-col gap-6">
                        <section className="flex flex-col items-center justify-center gap-6 rounded-md border-l-8 border-blue-600 bg-slate-50 p-6 text-center shadow-sm shadow-black">
                           <div className="flex flex-col items-center justify-center">
                              <div className="flex items-center justify-center gap-3">
                                 <FaSync className="text-black" size={20} />
                                 <h4 className="text-xl font-extrabold tracking-wider text-black select-none">
                                    {needsApontamento
                                       ? 'Alteração de Status + Apontamento'
                                       : 'Alteração de Status'}
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
                                 <FaArrowRightLong
                                    className="text-black"
                                    size={24}
                                 />
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

                        {/* ===== COLUNA DE SELEÇÕES ===== */}
                        {/* ===== SELECT DE CLASSIFICAÇÃO ===== */}
                        {shouldShowClassificacao && (
                           <FormSection
                              title="Classificação do Chamado"
                              icon={<FaSync className="text-white" size={20} />}
                              error={
                                 !selectedClassificacao
                                    ? 'Campo obrigatório'
                                    : undefined
                              }
                           >
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
                                       disabled={isUpdating}
                                    >
                                       <option
                                          value=""
                                          className="cursor-pointer bg-white font-bold tracking-wider text-black italic select-none"
                                       >
                                          Selecione uma classificação...
                                       </option>
                                       {classificacoes.map(classificacao => (
                                          <option
                                             key={
                                                classificacao.COD_CLASSIFICACAO
                                             }
                                             value={
                                                classificacao.COD_CLASSIFICACAO
                                             }
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
                                             Classificação selecionada
                                          </span>
                                       </div>
                                    )}
                                 </div>
                              )}
                           </FormSection>
                        )}

                        {/* ===== SELECT DE TAREFA ===== */}
                        {shouldShowTarefa && (
                           <FormSection
                              title="Tarefa do Chamado"
                              icon={<FaSync className="text-white" size={20} />}
                              error={
                                 !selectedTarefa
                                    ? 'Campo obrigatório'
                                    : undefined
                              }
                           >
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
                                       disabled={isUpdating}
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
                           </FormSection>
                        )}
                     </div>

                     {/* ===== COLUNA DE APONTAMENTO (QUANDO NECESSÁRIO) ===== */}
                     {needsApontamento && (
                        <div className="flex flex-col gap-6">
                           {/* Data */}
                           <FormSection
                              title="Data do Apontamento"
                              icon={
                                 <FaCalendarAlt
                                    className="text-white"
                                    size={20}
                                 />
                              }
                              error={apontamentoErrors.dataInicioOS}
                           >
                              <input
                                 type="date"
                                 name="dataInicioOS"
                                 value={apontamentoData.dataInicioOS}
                                 onChange={handleApontamentoInputChange}
                                 disabled={isUpdating}
                                 className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-black shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 hover:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                                    apontamentoErrors.dataInicioOS
                                       ? 'border-red-500 ring-2 ring-red-600'
                                       : ''
                                 } ${isUpdating ? 'cursor-not-allowed opacity-50' : ''}`}
                              />
                              {apontamentoErrors.dataInicioOS && (
                                 <div className="mt-2 flex items-center gap-2">
                                    <BsFillXOctagonFill
                                       className="text-red-600"
                                       size={16}
                                    />
                                    <p className="text-sm font-semibold tracking-widest text-red-600 italic select-none">
                                       {apontamentoErrors.dataInicioOS}
                                    </p>
                                 </div>
                              )}
                           </FormSection>

                           {/* Horários */}
                           <FormSection
                              title="Horários do Apontamento"
                              icon={
                                 <IoMdClock className="text-white" size={20} />
                              }
                              error={
                                 apontamentoErrors.horaInicioOS ||
                                 apontamentoErrors.horaFimOS
                              }
                           >
                              <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <label className="mb-1 block text-base font-semibold tracking-wider text-black select-none">
                                       Hora Início
                                    </label>
                                    <input
                                       type="time"
                                       name="horaInicioOS"
                                       value={apontamentoData.horaInicioOS}
                                       onChange={handleApontamentoInputChange}
                                       onBlur={handleTimeBlur}
                                       disabled={isUpdating}
                                       className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-black shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 hover:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                                          apontamentoErrors.horaInicioOS
                                             ? 'border-red-500 ring-2 ring-red-600'
                                             : ''
                                       } ${isUpdating ? 'cursor-not-allowed opacity-50' : ''}`}
                                    />
                                    {apontamentoErrors.horaInicioOS && (
                                       <div className="mt-2 flex items-center gap-2">
                                          <BsFillXOctagonFill
                                             className="text-red-600"
                                             size={16}
                                          />
                                          <p className="text-sm font-semibold tracking-widest text-red-600 italic select-none">
                                             {apontamentoErrors.horaInicioOS}
                                          </p>
                                       </div>
                                    )}
                                 </div>

                                 <div>
                                    <label className="mb-1 block text-base font-semibold tracking-wider text-black select-none">
                                       Hora Fim
                                    </label>
                                    <input
                                       type="time"
                                       name="horaFimOS"
                                       value={apontamentoData.horaFimOS}
                                       onChange={handleApontamentoInputChange}
                                       onBlur={handleTimeBlur}
                                       disabled={isUpdating}
                                       className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-black shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 hover:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                                          apontamentoErrors.horaFimOS
                                             ? 'border-red-500 ring-2 ring-red-600'
                                             : ''
                                       } ${isUpdating ? 'cursor-not-allowed opacity-50' : ''}`}
                                    />
                                    {apontamentoErrors.horaFimOS && (
                                       <div className="mt-2 flex items-center gap-2">
                                          <BsFillXOctagonFill
                                             className="text-red-600"
                                             size={16}
                                          />
                                          <p className="text-sm font-semibold tracking-widest text-red-600 italic select-none">
                                             {apontamentoErrors.horaFimOS}
                                          </p>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </FormSection>

                           {/* Observação */}
                           <FormSection
                              title="Observação do Apontamento"
                              icon={
                                 <IoDocumentText
                                    className="text-white"
                                    size={20}
                                 />
                              }
                              error={apontamentoErrors.observacaoOS}
                           >
                              <textarea
                                 name="observacaoOS"
                                 value={apontamentoData.observacaoOS}
                                 onChange={handleApontamentoInputChange}
                                 disabled={isUpdating}
                                 rows={4}
                                 maxLength={200}
                                 placeholder="Descreva detalhadamente o serviço realizado, procedimentos executados, materiais utilizados e resultados obtidos..."
                                 className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-black shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 hover:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                                    apontamentoErrors.observacaoOS
                                       ? 'border-red-500 ring-2 ring-red-600'
                                       : ''
                                 } ${isUpdating ? 'cursor-not-allowed opacity-50' : ''}`}
                              />
                              {apontamentoErrors.observacaoOS && (
                                 <div className="mt-2 flex items-center gap-2">
                                    <BsFillXOctagonFill
                                       className="text-red-600"
                                       size={16}
                                    />
                                    <p className="text-sm font-semibold tracking-widest text-red-600 italic select-none">
                                       {apontamentoErrors.observacaoOS}
                                    </p>
                                 </div>
                              )}

                              {/* Contador de caracteres */}
                              <div className="mt-2 flex w-full items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-black"></div>
                                    <span className="text-sm font-semibold tracking-widest text-black italic select-none">
                                       Máximo de 200 caracteres.
                                    </span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <div
                                       className={`h-2 w-2 rounded-full ${
                                          apontamentoData.observacaoOS.length >
                                          180
                                             ? 'bg-red-600'
                                             : apontamentoData.observacaoOS
                                                    .length > 150
                                               ? 'bg-amber-600'
                                               : 'bg-green-600'
                                       }`}
                                    ></div>
                                    <span
                                       className={`text-sm font-semibold tracking-widest italic select-none ${
                                          apontamentoData.observacaoOS.length >
                                          180
                                             ? 'text-red-600'
                                             : apontamentoData.observacaoOS
                                                    .length > 150
                                               ? 'text-amber-600'
                                               : 'text-green-600'
                                       }`}
                                    >
                                       {apontamentoData.observacaoOS.length}/200
                                    </span>
                                 </div>
                              </div>
                           </FormSection>
                        </div>
                     )}
                  </div>

                  {/* ===== AVISO DE CONFIRMAÇÃO ===== */}
                  {(selectedClassificacao || selectedTarefa) && (
                     <div className="rounded-lg border-l-4 border-red-600 bg-amber-200 p-4 shadow-sm shadow-black">
                        <div className="flex items-start gap-3">
                           <FaExclamationTriangle
                              className="mt-0.5 text-red-600"
                              size={16}
                           />
                           <div>
                              <p className="text-sm font-semibold tracking-widest text-black italic select-none">
                                 Essa alteração será salva permanentemente no
                                 sistema.
                              </p>
                              {needsApontamento && (
                                 <p className="mt-1 text-sm font-semibold tracking-widest text-black italic select-none">
                                    Uma OS será criada automaticamente com os
                                    dados do apontamento.
                                 </p>
                              )}
                           </div>
                        </div>
                     </div>
                  )}
               </main>

               {/* ===== FOOTER ===== */}
               <footer className="relative flex justify-end gap-4 border-t-4 border-red-600 p-6">
                  <button
                     onClick={handleCancelChange}
                     disabled={isUpdating}
                     className="cursor-pointer rounded-xl border-none bg-red-500 px-6 py-2 text-lg font-extrabold text-white shadow-sm shadow-black transition-all select-none hover:scale-105 hover:bg-red-900 hover:shadow-md hover:shadow-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                     Cancelar
                  </button>

                  <button
                     onClick={handleUnifiedSubmit}
                     disabled={isUpdating || !isFormValid()}
                     className={`cursor-pointer rounded-xl border-none bg-blue-500 px-6 py-2 text-lg font-extrabold text-white shadow-sm shadow-black select-none ${
                        isUpdating || !isFormValid()
                           ? 'disabled:cursor-not-allowed disabled:opacity-50'
                           : 'transition-all hover:scale-105 hover:bg-blue-900 hover:shadow-md hover:shadow-black active:scale-95'
                     }`}
                  >
                     {isUpdating ? (
                        <div className="flex items-center gap-2">
                           <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                           <span>
                              {needsApontamento
                                 ? 'Processando...'
                                 : 'Atualizando...'}
                           </span>
                        </div>
                     ) : (
                        <div className="flex items-center gap-2">
                           <IoIosSave className="mr-1" size={20} />
                           <span>
                              {needsApontamento
                                 ? 'Atualizar + Criar OS'
                                 : 'Atualizar Status'}
                           </span>
                        </div>
                     )}
                  </button>
               </footer>
            </div>
         </Modal>
      </>
   );
}

// ===== COMPONENTE FORMSECTION =====
const FormSection = ({
   title,
   icon,
   children,
   error,
}: {
   title: string;
   icon: React.ReactNode;
   children: React.ReactNode;
   error?: string;
}) => (
   <div
      className={`overflow-hidden rounded-md bg-white shadow-md shadow-black ${
         error ? 'ring-2 ring-red-600' : ''
      }`}
   >
      <div className={`px-4 py-2 ${error ? 'bg-red-600' : 'bg-black'}`}>
         <h3 className="flex items-center gap-2 text-lg font-bold tracking-wider text-white select-none">
            {icon}
            {title}
            {error && (
               <span className="ml-auto text-sm">
                  <FaExclamationTriangle className="text-white" size={20} />
               </span>
            )}
         </h3>
      </div>

      <div className="p-6">{children}</div>
   </div>
);
