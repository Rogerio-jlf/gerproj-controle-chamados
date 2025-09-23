'use client';
// ================================================================================
import { z } from 'zod';
import { toast } from 'sonner';
import { useState, useRef, useEffect, useCallback } from 'react';
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '../../../../../components/ui/tooltip';
// ================================================================================
import { TabelaTarefaProps } from '../../../../../types/types';
// ================================================================================
import { useAuth } from '../../../../../hooks/useAuth';
import { getStylesStatus } from '../../../../../utils/formatters';
import { ToastCustom } from '../../../../../components/Toast_Custom';
import { TabelaClassificacaoProps } from '../../../../../types/types';
import {
   canUseBackdatedAppointments,
   ModalPermitirRetroativo,
   getCurrentUserId,
   isUserAdmin,
} from './Modal_Permitir_Retroativo';
// ================================================================================
import { Loader2 } from 'lucide-react';
import { FaArrowRightLong } from 'react-icons/fa6';
import { BsFillXOctagonFill } from 'react-icons/bs';
import { IoMdClock, IoIosSave } from 'react-icons/io';
import { IoClose, IoDocumentText } from 'react-icons/io5';
import {
   FaExclamationTriangle,
   FaEdit,
   FaSync,
   FaCalendarAlt,
   FaUserClock,
   FaUserCog,
} from 'react-icons/fa';

// ================================================================================
// INTERFACES E TIPOS
// ================================================================================

interface Props {
   status: string;
   codChamado: number;
   nomeCliente?: string;
   onUpdateSuccess?: () => void;
}

// Modal Component
interface ModalStatusApontamentoChamadoProps {
   isOpen: boolean;
   onClose: () => void;
   children: React.ReactNode;
   needsApontamento?: boolean;
}

const Modal = ({
   isOpen,
   onClose,
   children,
   needsApontamento = false,
}: ModalStatusApontamentoChamadoProps) => {
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
            className={`relative max-h-[100vh] ${needsApontamento ? 'w-[1500px]' : 'w-[750px]'} overflow-hidden`}
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
         }, 'Data não pode ser maior que hoje')
         .refine(dateString => {
            const selectedDate = new Date(dateString);
            const today = new Date();

            // Verificar se a data selecionada está no mês atual ou posterior
            const selectedYear = selectedDate.getFullYear();
            const selectedMonth = selectedDate.getMonth();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth();

            // Se o ano for menor que o atual, é retroativo
            if (selectedYear < currentYear) return false;

            // Se o ano for igual mas o mês for menor, é retroativo
            if (selectedYear === currentYear && selectedMonth < currentMonth)
               return false;

            return true;
         }, 'Não é possível selecionar datas de meses anteriores ao atual'),

      horaInicioOS: z
         .string()
         .min(1, 'Hora Início é obrigatória')
         .regex(
            /^([01]?\d|2[0-3]):(00|15|30|45)$/,
            'A hora deve ser em intervalos de 15 minutos'
         ),

      horaFimOS: z
         .string()
         .min(1, 'Hora Fim é obrigatória')
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
         message: 'Hora Fim deve ser maior que hora Início',
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
// ====================

// Função para exibir o nome do status (pode ser expandida para mapeamentos futuros)
const getStatusDisplayName = (statusValue: string) => {
   return statusValue;
};
// ====================

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
// ====================

// Função utilitária para extrair o primeiro nome
const getPrimeiroNome = (nomeCompleto: string): string => {
   return nomeCompleto.trim().split(' ')[0];
};
// ====================

// Função utilitária para remover acentos, mantendo espaços
const removerAcentos = (texto: string): string => {
   return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export default function StatusApontamentoChamado({
   status: initialStatus,
   codChamado,
   onUpdateSuccess,
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
   const [classificacoes, setClassificacoes] = useState<
      TabelaClassificacaoProps[]
   >([]);
   const [tarefas, setTarefas] = useState<TabelaTarefaProps[]>([]);
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

   const [showBackdatedModal, setShowBackdatedModal] = useState(false);

   // ================================================================================
   // REFS
   // ================================================================================
   const selectRef = useRef<HTMLSelectElement>(null);
   const dateInputRef = useRef<HTMLInputElement>(null);

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

   const currentUserId = getCurrentUserId(user);
   const isAdmin = isUserAdmin(user);
   const canUseBackdatedDates = canUseBackdatedAppointments(
      currentUserId,
      codChamado.toString()
   );

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
   // ====================

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
   // ====================

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

      if (newStatus === 'EM ATENDIMENTO') {
         await fetchTarefas();
      } else {
         await fetchClassificacoes();
      }
   };
   // ====================

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

      // Atualizar o estado primeiro
      setApontamentoData(prev => ({
         ...prev,
         [name]: newValue,
      }));

      // ✅ VALIDAÇÃO EM TEMPO REAL PARA DATA (mantém como está)
      if (name === 'dataInicioOS' && newValue) {
         const selectedDate = new Date(newValue);
         const today = new Date();
         today.setHours(0, 0, 0, 0);

         if (selectedDate > today) {
            setApontamentoErrors((prev: ApontamentoFormErrors) => ({
               ...prev,
               dataInicioOS: 'Data não pode ser maior que hoje',
            }));
         } else if (isDateFromPreviousMonth(newValue)) {
            setApontamentoErrors((prev: ApontamentoFormErrors) => ({
               ...prev,
               dataInicioOS: canUseBackdatedDates
                  ? undefined
                  : 'Não é possível selecionar datas de meses anteriores ao atual',
            }));
         } else {
            setApontamentoErrors((prev: ApontamentoFormErrors) => ({
               ...prev,
               dataInicioOS: undefined,
            }));
         }
      }

      // ✅ VALIDAÇÃO EM TEMPO REAL PARA HORÁRIOS
      if (name === 'horaInicioOS' || name === 'horaFimOS') {
         // Validação individual do campo
         if (!newValue || newValue.trim() === '') {
            setApontamentoErrors((prev: ApontamentoFormErrors) => ({
               ...prev,
               [name]:
                  name === 'horaInicioOS'
                     ? 'Hora Início é obrigatória'
                     : 'Hora Fim é obrigatória',
            }));
         } else {
            // Verificar formato (intervalos de 15 minutos)
            const regex = /^([01]?\d|2[0-3]):(00|15|30|45)$/;
            if (!regex.test(newValue)) {
               setApontamentoErrors((prev: ApontamentoFormErrors) => ({
                  ...prev,
                  [name]: 'A hora deve ser em intervalos de 15 minutos',
               }));
            } else {
               // Campo individual válido, limpar seu erro
               setApontamentoErrors((prev: ApontamentoFormErrors) => ({
                  ...prev,
                  [name]: undefined,
               }));

               // Validar relação entre horários apenas se ambos estão preenchidos
               setTimeout(() => {
                  const updatedData = { ...apontamentoData, [name]: newValue };
                  if (updatedData.horaInicioOS && updatedData.horaFimOS) {
                     validateTimeRelationRealTime(updatedData);
                  }
               }, 0);
            }
         }
      }

      // ✅ VALIDAÇÃO EM TEMPO REAL PARA OBSERVAÇÃO
      if (name === 'observacaoOS') {
         if (newValue.trim().length === 0) {
            // Campo vazio - não mostrar erro ainda (só no blur)
            setApontamentoErrors((prev: ApontamentoFormErrors) => ({
               ...prev,
               observacaoOS: undefined,
            }));
         } else if (newValue.trim().length < 10) {
            setApontamentoErrors((prev: ApontamentoFormErrors) => ({
               ...prev,
               observacaoOS: 'Observação deve ter pelo menos 10 caracteres',
            }));
         } else if (newValue.length > 200) {
            setApontamentoErrors((prev: ApontamentoFormErrors) => ({
               ...prev,
               observacaoOS: 'Observação deve ter no máximo 200 caracteres',
            }));
         } else {
            setApontamentoErrors((prev: ApontamentoFormErrors) => ({
               ...prev,
               observacaoOS: undefined,
            }));
         }
      }
   };
   // ====================

   const validateTimeRelationRealTime = (data: ApontamentoFormData) => {
      const [startHours, startMinutes] = data.horaInicioOS
         .split(':')
         .map(Number);
      const [endHours, endMinutes] = data.horaFimOS.split(':').map(Number);

      const startTimeInMinutes = startHours * 60 + startMinutes;
      const endTimeInMinutes = endHours * 60 + endMinutes;

      if (endTimeInMinutes <= startTimeInMinutes) {
         setApontamentoErrors((prev: ApontamentoFormErrors) => ({
            ...prev,
            horaFimOS: 'Hora Fim deve ser maior que hora Início',
         }));
      } else if (endTimeInMinutes - startTimeInMinutes < 15) {
         setApontamentoErrors((prev: ApontamentoFormErrors) => ({
            ...prev,
            horaFimOS: 'Diferença mínima entre horários deve ser de 15 minutos',
         }));
      } else {
         // Relação válida - limpar apenas erros relacionais, manter outros
         setApontamentoErrors((prev: ApontamentoFormErrors) => {
            const newErrors = { ...prev };
            if (
               newErrors.horaFimOS ===
                  'Hora Fim deve ser maior que hora Início' ||
               newErrors.horaFimOS ===
                  'Diferença mínima entre horários deve ser de 15 minutos'
            ) {
               newErrors.horaFimOS = undefined;
            }
            return newErrors;
         });
      }
   };
   // ====================

   // Função para verificar se uma data é de um mês anterior ao atual
   const isDateFromPreviousMonth = useCallback(
      (dateString: string): boolean => {
         // Se o usuário tem permissão especial, sempre permitir
         if (canUseBackdatedDates) {
            return false; // Sempre permitir para usuários com permissão especial
         }

         // Lógica original para usuários normais
         const [year, month, day] = dateString.split('-').map(Number);
         const today = new Date();
         const currentYear = today.getFullYear();
         const currentMonth = today.getMonth() + 1;

         if (year < currentYear) return true;
         if (year === currentYear && month < currentMonth) return true;

         return false;
      },
      [canUseBackdatedDates]
   );
   // ====================

   // Função para abrir o calendário ao clicar no input
   const handleDateClick = () => {
      if (dateInputRef.current) {
         dateInputRef.current.focus();
         // Tentar abrir o picker se disponível
         if (
            'showPicker' in dateInputRef.current &&
            typeof dateInputRef.current.showPicker === 'function'
         ) {
            try {
               dateInputRef.current.showPicker();
            } catch (e) {
               console.log('showPicker não suportado neste browser');
            }
         }
      }
   };
   // ====================

   // Função simplificada para mudanças na data
   const handleDateChangeNew = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleApontamentoInputChange(e);
   };
   // ====================

   // Função para prevenir digitação manual
   const handleDateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Permitir apenas teclas de navegação e controle
      const allowedKeys = [
         'Tab',
         'Shift',
         'Escape',
         'Enter',
         'ArrowLeft',
         'ArrowRight',
         'ArrowUp',
         'ArrowDown',
         'Home',
         'End',
         'Delete',
         'Backspace',
      ];

      // Permitir Ctrl+combinações
      if (e.ctrlKey) return;

      // Bloquear números e letras
      if (!allowedKeys.includes(e.key)) {
         e.preventDefault();
      }
   };
   // ====================

   // Handler para blur nos campos de hora
   const handleTimeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (name !== 'horaInicioOS' && name !== 'horaFimOS') return;

      // Ajustar para intervalo mais próximo
      const ajustado = ajustaParaIntervalo(value);
      if (ajustado !== value) {
         setApontamentoData(prev => ({ ...prev, [name]: ajustado }));

         // Após ajustar, re-validar
         const event = {
            target: { name, value: ajustado },
         } as React.ChangeEvent<HTMLInputElement>;

         setTimeout(() => {
            handleApontamentoInputChange(event);
         }, 0);
      }

      // Se o campo está vazio no blur, mostrar erro obrigatório
      if (!ajustado || ajustado.trim() === '') {
         setApontamentoErrors((prev: ApontamentoFormErrors) => ({
            ...prev,
            [name]:
               name === 'horaInicioOS'
                  ? 'Hora Início é obrigatória'
                  : 'Hora Fim é obrigatória',
         }));
      }
   };
   // ====================

   // Handler para blur nos outros campos - NOVA FUNÇÃO
   const handleFieldBlur = (
      e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
   ) => {
      const { name, value } = e.target;

      // Para observação, validar se está vazio no blur
      if (name === 'observacaoOS') {
         if (value.trim().length === 0) {
            // No blur, se estiver vazio, não é obrigatório ainda
            // Mas se tiver conteúdo, deve ter pelo menos 10 caracteres
            setApontamentoErrors((prev: ApontamentoFormErrors) => ({
               ...prev,
               observacaoOS: undefined,
            }));
         } else if (value.trim().length < 10) {
            setApontamentoErrors((prev: ApontamentoFormErrors) => ({
               ...prev,
               observacaoOS: 'Observação deve ter pelo menos 10 caracteres',
            }));
         }
      }
   };
   // ====================

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
               if (path) {
                  newErrors[path] = err.message;
               }
            });
            setApontamentoErrors(newErrors);
         }
         return false;
      }
   };
   // ====================

   // Handler para confirmar a mudança (UNIFICADO) - CORRIGIDO
   const handleSubmitSave = async () => {
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

         const response = await fetch(
            `/api/status-apontamento-chamado/${codChamado}`,
            {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(payload),
            }
         );

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
   // ====================

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
   // ====================

   // Handler para fechar o modal
   const handleCloseModal = () => {
      if (!isUpdating) {
         handleCancelChange();
      }
   };
   // ====================

   // Handler para clique na célula de status
   const handleStatusCellClick = () => {
      if (!isStatusEditable || isUpdating) {
         return;
      }
      setEditing(true);
   };
   // ====================

   // Para melhorar a UX, você pode também definir o atributo 'min' no input de data:
   const getCurrentMonthFirstDay = (): string => {
      if (canUseBackdatedDates) {
         // Permitir datas de até 3 meses atrás para usuários com permissão especial
         const threeMonthsAgo = new Date();
         threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
         return threeMonthsAgo.toISOString().split('T')[0];
      }

      // Lógica original
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      return new Date(year, month, 1).toISOString().split('T')[0];
   };
   // ====================

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
   // ====================

   // useEffect para validar horários sempre que mudarem
   // useEffect(() => {
   //    if (!needsApontamento) return;

   //    // Validar horários quando ambos estão preenchidos
   //    if (apontamentoData.horaInicioOS && apontamentoData.horaFimOS) {
   //       const [startHours, startMinutes] = apontamentoData.horaInicioOS
   //          .split(':')
   //          .map(Number);
   //       const [endHours, endMinutes] = apontamentoData.horaFimOS
   //          .split(':')
   //          .map(Number);

   //       const startTimeInMinutes = startHours * 60 + startMinutes;
   //       const endTimeInMinutes = endHours * 60 + endMinutes;

   //       if (endTimeInMinutes <= startTimeInMinutes) {
   //          setApontamentoErrors((prev: ApontamentoFormErrors) => ({
   //             ...prev,
   //             horaFimOS: 'Hora de fim deve ser maior que hora de início',
   //          }));
   //       } else if (endTimeInMinutes - startTimeInMinutes < 15) {
   //          setApontamentoErrors((prev: ApontamentoFormErrors) => ({
   //             ...prev,
   //             horaFimOS:
   //                'Diferença mínima entre horários deve ser de 15 minutos',
   //          }));
   //       } else {
   //          // Limpar erros de horário se estiver válido
   //          setApontamentoErrors((prev: ApontamentoFormErrors) => ({
   //             ...prev,
   //             horaInicioOS: undefined,
   //             horaFimOS: undefined,
   //          }));
   //       }
   //    }
   // }, [
   //    apontamentoData.horaInicioOS,
   //    apontamentoData.horaFimOS,
   //    needsApontamento,
   // ]);
   // ====================

   // useEffect para validar data sempre que mudar
   useEffect(() => {
      if (!needsApontamento) return;

      if (apontamentoData.dataInicioOS) {
         const selectedDate = new Date(apontamentoData.dataInicioOS);
         const today = new Date();
         today.setHours(0, 0, 0, 0);

         // Primeira validação: data não pode ser maior que hoje
         if (selectedDate > today) {
            setApontamentoErrors((prev: ApontamentoFormErrors) => ({
               ...prev,
               dataInicioOS: 'Data não pode ser maior que hoje',
            }));
         }
         // Segunda validação: data não pode ser de mês anterior
         else if (isDateFromPreviousMonth(apontamentoData.dataInicioOS)) {
            setApontamentoErrors((prev: ApontamentoFormErrors) => ({
               ...prev,
               dataInicioOS:
                  'Não é possível selecionar datas de meses anteriores ao atual',
            }));
         }
         // Se passou em todas as validações, limpar erro
         else {
            setApontamentoErrors((prev: ApontamentoFormErrors) => ({
               ...prev,
               dataInicioOS: undefined,
            }));
         }
      }
   }, [
      apontamentoData.dataInicioOS,
      isDateFromPreviousMonth,
      needsApontamento,
   ]);
   // ====================

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
   // ====================

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
                             ? 'Esse chamado só pode ser "ATRIBUIDO", via Atribuir Chamado'
                             : status === 'ATRIBUIDO'
                               ? 'Clique para colocar "EM ATENDIMENTO"'
                               : 'Clique para alterar o Status'}
                     </div>
                  </TooltipContent>
               </Tooltip>
            )}
         </div>
         {/* ============================== */}

         {/* ===== MODAL UNIFICADO ===== */}
         <Modal
            isOpen={showUnifiedModal}
            onClose={handleCloseModal}
            needsApontamento={!!needsApontamento}
         >
            <div
               className={`animate-in slide-in-from-bottom-4 ${needsApontamento ? 'w-[1500px]' : 'w-[750px]'} relative z-10 max-h-[100vh] overflow-hidden rounded-2xl border-0 bg-white shadow-xl shadow-black transition-all duration-500 ease-out`}
            >
               {/* ===== OVERLAY LOADING ===== */}
               {(loadingClassificacoes || loadingTarefas) && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-lg">
                     <div className="flex flex-col items-center gap-4">
                        <Loader2
                           className="animate-spin text-white"
                           size={40}
                        />
                        {/* ===== */}
                        <span className="text-2xl font-extrabold tracking-widest text-white italic select-none">
                           Carregando dados...
                        </span>
                     </div>
                  </div>
               )}
               {/* ============================== */}

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
                     {/* ========== */}
                     <div className="flex flex-col">
                        <h1 className="text-3xl font-extrabold tracking-wider text-black select-none">
                           {needsApontamento
                              ? 'Alterar Status / Realizar Apontamento '
                              : 'Alterar Status'}
                        </h1>
                        {/* ===== */}
                        <p className="text-xl font-bold tracking-widest text-black italic select-none">
                           Chamado - #{codChamado}
                        </p>
                     </div>
                  </div>
                  {/* ========== */}

                  <div className="flex items-center justify-center gap-6">
                     {/* Botão Permitir Apontamento Retroativo */}
                     {isAdmin && pendingStatus !== 'EM ATENDIMENTO' && (
                        <Tooltip>
                           <TooltipTrigger asChild>
                              <button
                                 onClick={() => setShowBackdatedModal(true)}
                                 className="group cursor-pointer rounded-full bg-blue-500/50 p-3 text-white shadow-md shadow-black transition-all select-none hover:scale-125 hover:bg-blue-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                 title="Gerenciar Permissões de Apontamento Retroativo"
                              >
                                 <FaUserCog size={24} />
                              </button>
                           </TooltipTrigger>
                           <TooltipContent
                              side="top"
                              align="center"
                              sideOffset={8}
                              className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black select-none"
                           >
                              Permitir Apontamento Retroativo
                           </TooltipContent>
                        </Tooltip>
                     )}
                     {/* ========== */}

                     {/* Botão Fechar Modal */}
                     <Tooltip>
                        <TooltipTrigger asChild>
                           <button
                              onClick={handleCloseModal}
                              disabled={isUpdating}
                              className="group cursor-pointer rounded-full bg-red-500/50 p-3 text-white shadow-md shadow-black transition-all select-none hover:scale-125 hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              <IoClose size={24} />
                           </button>
                        </TooltipTrigger>
                        <TooltipContent
                           side="top"
                           align="center"
                           sideOffset={8}
                           className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black select-none"
                        >
                           Sair
                        </TooltipContent>
                     </Tooltip>
                  </div>
               </header>
               {/* ============================== */}

               {/* ===== CONTEÚDO ===== */}
               <main className="flex flex-col gap-6 p-6">
                  <div
                     className={
                        needsApontamento
                           ? 'relative grid grid-cols-2 gap-6'
                           : 'flex flex-col gap-20'
                     }
                  >
                     {needsApontamento && (
                        <div className="absolute top-8 bottom-8 left-1/2 z-10 w-px -translate-x-1/2 transform bg-black"></div>
                     )}
                     {/* ===== COLUNA STATUS ===== */}
                     <div className="flex flex-col gap-4 rounded-xl border-t-2 border-slate-300 bg-white p-6 shadow-md shadow-black">
                        <h2 className="text-2xl font-extrabold tracking-wider text-black select-none">
                           Alteração de Status
                        </h2>
                        {/* ========== */}
                        <section className="flex flex-col gap-16">
                           {/* ===== CARD STATUS ATUAL E PENDENTE ===== */}
                           <div className="flex flex-col items-center justify-center gap-6 rounded-lg border-l-8 border-blue-600 bg-white p-6 text-center shadow-sm shadow-black">
                              <div className="flex flex-col items-center justify-center">
                                 {/* ===== */}
                                 <p className="text-3xl font-extrabold tracking-widest text-black italic select-none">
                                    Chamado - #{codChamado}
                                 </p>
                              </div>
                              {/* ========== */}

                              <div className="flex items-center justify-center gap-8">
                                 <div className="flex flex-col items-center gap-1">
                                    <p className="text-xs font-bold tracking-widest text-black uppercase italic select-none">
                                       Status Atual
                                    </p>
                                    {/* ===== */}
                                    <div
                                       className={`inline-block rounded-md px-6 py-2 text-lg font-extrabold tracking-widest select-none ${getStylesStatus(status)}`}
                                    >
                                       {getStatusDisplayName(status)}
                                    </div>
                                 </div>
                                 {/* ========== */}

                                 <div className="mt-6 flex items-center justify-center">
                                    <FaArrowRightLong
                                       className="text-black"
                                       size={24}
                                    />
                                 </div>
                                 {/* ========== */}

                                 <div className="flex flex-col items-center gap-1">
                                    <p className="text-xs font-bold tracking-widest text-black uppercase italic select-none">
                                       Novo Status
                                    </p>
                                    {/* ===== */}
                                    <div
                                       className={`inline-block rounded-md border-none px-6 py-2 text-lg font-extrabold tracking-widest select-none ${getStylesStatus(pendingStatus || '')}`}
                                    >
                                       {pendingStatus
                                          ? getStatusDisplayName(pendingStatus)
                                          : ''}
                                    </div>
                                 </div>
                              </div>
                           </div>
                           {/* ========== */}

                           {/* ===== SELECT DE CLASSIFICAÇÃO ===== */}
                           {shouldShowClassificacao && (
                              <FormSection
                                 title="Classificação do Chamado"
                                 icon={
                                    <FaSync className="text-white" size={20} />
                                 }
                                 error={
                                    !selectedClassificacao
                                       ? 'Campo obrigatório'
                                       : undefined
                                 }
                              >
                                 {!loadingClassificacoes && (
                                    <div className="flex flex-col gap-6">
                                       <select
                                          value={selectedClassificacao || ''}
                                          onChange={e =>
                                             setSelectedClassificacao(
                                                Number(e.target.value) || null
                                             )
                                          }
                                          className="w-full cursor-pointer rounded-md border-t-0 border-slate-300 bg-white px-4 py-2 text-lg font-extrabold tracking-wider text-black italic shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                          required
                                          disabled={isUpdating}
                                       >
                                          <option
                                             value=""
                                             className="bg-white text-base font-semibold tracking-widest text-black italic select-none"
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
                                                className="p-4 text-lg font-semibold tracking-wider text-black italic select-none"
                                             >
                                                {
                                                   classificacao.NOME_CLASSIFICACAO
                                                }
                                             </option>
                                          ))}
                                       </select>
                                       {!selectedClassificacao && (
                                          <div className="flex items-center gap-2">
                                             <div className="h-2 w-2 rounded-full bg-red-700"></div>
                                             <span className="text-sm font-semibold tracking-widest text-red-700 italic select-none">
                                                Campo obrigatório
                                             </span>
                                          </div>
                                       )}
                                       {selectedClassificacao && (
                                          <div className="flex items-center gap-2">
                                             <div className="h-2 w-2 rounded-full bg-green-700"></div>
                                             <span className="text-sm font-semibold tracking-widest text-green-700 italic select-none">
                                                Classificação selecionada
                                             </span>
                                          </div>
                                       )}
                                    </div>
                                 )}
                              </FormSection>
                           )}
                           {/* ========== */}

                           {/* ===== SELECT DE TAREFA ===== */}
                           {shouldShowTarefa && (
                              <FormSection
                                 title="Tarefa do Chamado"
                                 icon={
                                    <FaSync className="text-white" size={20} />
                                 }
                                 error={
                                    !selectedTarefa
                                       ? 'Campo obrigatório'
                                       : undefined
                                 }
                              >
                                 {!loadingTarefas && (
                                    <div className="flex flex-col gap-6">
                                       <select
                                          value={selectedTarefa || ''}
                                          onChange={e =>
                                             setSelectedTarefa(
                                                Number(e.target.value) || null
                                             )
                                          }
                                          className="w-full cursor-pointer rounded-md border-t-0 border-slate-300 bg-white px-4 py-2 text-lg font-extrabold tracking-wider text-black italic shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                          required
                                          disabled={isUpdating}
                                       >
                                          <option
                                             value=""
                                             className="bg-white text-base font-semibold tracking-widest text-black italic select-none"
                                          >
                                             Selecione uma tarefa...
                                          </option>
                                          {tarefas.map(tarefa => (
                                             <option
                                                key={tarefa.COD_TAREFA}
                                                value={tarefa.COD_TAREFA}
                                                className="p-4 text-lg font-semibold tracking-wider text-black italic select-none"
                                             >
                                                {tarefa.NOME_TAREFA}
                                             </option>
                                          ))}
                                       </select>
                                       {!selectedTarefa && (
                                          <div className="flex items-center gap-2">
                                             <div className="h-2 w-2 rounded-full bg-red-700"></div>
                                             <span className="text-sm font-semibold tracking-widest text-red-700 italic select-none">
                                                Campo obrigatório
                                             </span>
                                          </div>
                                       )}
                                       {selectedTarefa && (
                                          <div className="flex items-center gap-2">
                                             <div className="h-2 w-2 rounded-full bg-green-700"></div>
                                             <span className="text-sm font-semibold tracking-widest text-green-700 italic select-none">
                                                Tarefa selecionada
                                             </span>
                                          </div>
                                       )}
                                    </div>
                                 )}
                              </FormSection>
                           )}
                           {/* ========== */}

                           {/* ===== AVISO DE CONFIRMAÇÃO ===== */}
                           {(selectedClassificacao || selectedTarefa) && (
                              <div className="rounded-lg border-l-8 border-yellow-500 bg-slate-900 px-6 py-3 shadow-sm shadow-black">
                                 <div className="flex items-center gap-6">
                                    <FaExclamationTriangle
                                       className="text-yellow-500"
                                       size={40}
                                    />
                                    <div className="flex flex-col gap-1">
                                       <div className="flex items-center gap-2">
                                          <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                                          <p className="text-sm font-semibold tracking-widest text-yellow-500 italic select-none">
                                             Essa alteração será salva
                                             permanentemente no sistema.
                                          </p>
                                       </div>
                                       <div className="flex items-center gap-2">
                                          {needsApontamento && (
                                             <>
                                                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                                                <p className="mt-1 text-sm font-semibold tracking-widest text-yellow-500 italic select-none">
                                                   Uma OS será criada com os
                                                   dados do apontamento.
                                                </p>
                                             </>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           )}
                           {/* ========== */}
                        </section>
                     </div>
                     {/* ==================== */}

                     {/* ===== COLUNA APONTAMENTO ===== */}
                     {needsApontamento && (
                        <section className="flex flex-col gap-4 rounded-xl border-t-2 border-slate-300 bg-white p-6 shadow-md shadow-black">
                           <h2 className="text-2xl font-extrabold tracking-wider text-black select-none">
                              Dados do Apontamento
                           </h2>
                           {/* ========== */}

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
                              isEmpty={false} // Data sempre tem valor inicial
                           >
                              <input
                                 ref={dateInputRef}
                                 type="date"
                                 name="dataInicioOS"
                                 value={apontamentoData.dataInicioOS}
                                 onChange={handleDateChangeNew} // ✅ MUDANÇA
                                 onBlur={handleFieldBlur}
                                 onKeyDown={handleDateKeyDown}
                                 onClick={handleDateClick} // ✅ NOVA FUNÇÃO
                                 min={getCurrentMonthFirstDay()}
                                 max={new Date().toISOString().split('T')[0]}
                                 disabled={isUpdating}
                                 className={`w-full cursor-pointer rounded-md border-t-0 border-slate-300 bg-white px-4 py-1 text-lg font-extrabold tracking-wider text-black italic shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
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
                           {/* ========== */}

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
                              isEmpty={
                                 !apontamentoData.horaInicioOS &&
                                 !apontamentoData.horaFimOS
                              } // ← LÓGICA AQUI
                           >
                              <div className="grid grid-cols-2 gap-4">
                                 {/* inputs de hora com classes condicionais */}
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
                                       className={`w-full cursor-pointer rounded-md border-t-0 border-slate-300 px-4 py-1 text-lg font-extrabold tracking-wider text-black italic shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                                          apontamentoErrors.horaInicioOS
                                             ? 'border-red-500 bg-red-50 ring-2 ring-red-600'
                                             : !apontamentoData.horaInicioOS
                                               ? 'border-gray-300 bg-white'
                                               : 'border-green-500 bg-green-50 ring-2 ring-green-600'
                                       }`}
                                    />

                                    {/* Mensagens de erro */}
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

                                    {/* Mensagem de sucesso */}
                                    {!apontamentoErrors.horaInicioOS &&
                                       apontamentoData.horaInicioOS && (
                                          <div className="mt-2 flex items-center gap-2">
                                             <div className="h-2 w-2 rounded-full bg-green-600"></div>
                                             <span className="text-sm font-semibold tracking-widest text-green-600 italic select-none">
                                                Hora início válida
                                             </span>
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
                                       className={`w-full cursor-pointer rounded-md border-t-0 border-slate-300 px-4 py-1 text-lg font-extrabold tracking-wider text-black italic shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                                          apontamentoErrors.horaFimOS
                                             ? 'border-red-500 bg-red-50 ring-2 ring-red-600'
                                             : !apontamentoData.horaFimOS
                                               ? 'border-gray-300 bg-white'
                                               : 'border-green-500 bg-green-50 ring-2 ring-green-600'
                                       }`}
                                    />

                                    {/* Mensagens de erro */}
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

                                    {/* Mensagem de sucesso */}
                                    {!apontamentoErrors.horaFimOS &&
                                       apontamentoData.horaFimOS && (
                                          <div className="mt-2 flex items-center gap-2">
                                             <div className="h-2 w-2 rounded-full bg-green-600"></div>
                                             <span className="text-sm font-semibold tracking-widest text-green-600 italic select-none">
                                                Hora fim válida
                                             </span>
                                          </div>
                                       )}
                                 </div>
                              </div>
                           </FormSection>
                           {/* ========== */}

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
                              isEmpty={!apontamentoData.observacaoOS.trim()}
                           >
                              <textarea
                                 name="observacaoOS"
                                 value={apontamentoData.observacaoOS}
                                 onChange={handleApontamentoInputChange}
                                 onBlur={handleFieldBlur}
                                 disabled={isUpdating}
                                 rows={4}
                                 maxLength={200}
                                 placeholder="Descreva detalhadamente o serviço realizado..."
                                 className={`w-full cursor-pointer resize-none rounded-md border-t-0 border-slate-300 px-4 pt-3 text-base font-extrabold tracking-wider text-black italic shadow-sm shadow-black transition-all placeholder:text-sm hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                                    apontamentoErrors.observacaoOS
                                       ? 'border-red-500 bg-red-50 ring-2 ring-red-600'
                                       : !apontamentoData.observacaoOS.trim()
                                         ? 'border-gray-300 bg-white'
                                         : 'border-green-500 bg-green-50 ring-2 ring-green-600'
                                 }`}
                              />
                              {/* ========== */}

                              {/* Mensagens de erro */}
                              {apontamentoErrors.observacaoOS && (
                                 <div className="mt-2 flex items-center gap-2">
                                    <BsFillXOctagonFill
                                       className="text-red-700"
                                       size={16}
                                    />
                                    <p className="text-sm font-semibold tracking-widest text-red-700 italic select-none">
                                       {apontamentoErrors.observacaoOS}
                                    </p>
                                 </div>
                              )}
                              {/* ========== */}

                              {/* Mensagem de sucesso */}
                              {!apontamentoErrors.observacaoOS &&
                                 apontamentoData.observacaoOS.trim() && (
                                    <div className="mt-2 flex items-center gap-2">
                                       <div className="h-2 w-2 rounded-full bg-green-600"></div>
                                       <span className="text-sm font-semibold tracking-widest text-green-600 italic select-none">
                                          Observação válida
                                       </span>
                                    </div>
                                 )}
                              {/* ========== */}

                              {/* Contador de caracteres */}
                              <div className="mt-2 flex w-full items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <div
                                       className={`h-2 w-2 rounded-full ${
                                          apontamentoData.observacaoOS
                                             .length === 0
                                             ? 'bg-black'
                                             : apontamentoData.observacaoOS
                                                    .length > 180
                                               ? 'bg-red-600'
                                               : apontamentoData.observacaoOS
                                                      .length > 150
                                                 ? 'bg-amber-600'
                                                 : 'bg-green-600'
                                       }`}
                                    ></div>
                                    <span
                                       className={`text-sm font-semibold tracking-widest italic select-none ${
                                          apontamentoData.observacaoOS
                                             .length === 0
                                             ? 'text-black'
                                             : apontamentoData.observacaoOS
                                                    .length > 180
                                               ? 'text-red-600'
                                               : apontamentoData.observacaoOS
                                                      .length > 150
                                                 ? 'text-amber-600'
                                                 : 'text-green-600'
                                       } `}
                                    >
                                       Máximo de 200 caracteres.
                                    </span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <div
                                       className={`h-2 w-2 rounded-full ${
                                          apontamentoData.observacaoOS
                                             .length === 0
                                             ? 'bg-black'
                                             : apontamentoData.observacaoOS
                                                    .length > 180
                                               ? 'bg-red-600'
                                               : apontamentoData.observacaoOS
                                                      .length > 150
                                                 ? 'bg-amber-600'
                                                 : 'bg-green-600'
                                       }`}
                                    ></div>
                                    <span
                                       className={`text-sm font-semibold tracking-widest italic select-none ${
                                          apontamentoData.observacaoOS
                                             .length === 0
                                             ? 'text-black'
                                             : apontamentoData.observacaoOS
                                                    .length > 180
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
                              {/* ========== */}
                           </FormSection>
                           {/* ========== */}
                        </section>
                     )}
                  </div>
                  {/* ==================== */}
               </main>
               {/* ============================== */}

               {/* ===== FOOTER ===== */}
               <footer className="relative flex justify-end gap-6 pr-6 pb-6">
                  <button
                     onClick={handleCancelChange}
                     disabled={isUpdating}
                     className="cursor-pointer rounded-xl border-none bg-red-500 px-6 py-2 text-lg font-extrabold tracking-wider text-white shadow-sm shadow-black transition-all select-none hover:scale-105 hover:bg-red-900 hover:shadow-md hover:shadow-black active:scale-95"
                  >
                     Cancelar
                  </button>
                  {/* ===== */}

                  <button
                     onClick={handleSubmitSave}
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
                           {/* ===== */}
                           <span>
                              {needsApontamento
                                 ? 'Processando...'
                                 : 'Atualizando...'}
                           </span>
                        </div>
                     ) : (
                        <div className="flex items-center gap-2">
                           <IoIosSave className="mr-1" size={20} />
                           {/* ===== */}
                           <span>
                              {needsApontamento
                                 ? 'Atualizar / Apontar'
                                 : 'Atualizar'}
                           </span>
                        </div>
                     )}
                  </button>
               </footer>
               {/* ============================== */}
            </div>
         </Modal>

         {isAdmin && (
            <ModalPermitirRetroativo
               isOpen={showBackdatedModal}
               onClose={() => setShowBackdatedModal(false)}
               currentUserId={currentUserId}
               chamadoId={codChamado.toString()}
            />
         )}
      </>
   );
}

// ===== COMPONENTE FORMSECTION =====
const FormSection = ({
   title,
   icon,
   children,
   error,
   isEmpty, // ← NOVA PROP
}: {
   title: string;
   icon: React.ReactNode;
   children: React.ReactNode;
   error?: string;
   isEmpty?: boolean; // ← NOVA PROP
}) => {
   // Determinar estado baseado em erro e se está vazio
   const getState = () => {
      if (error) return 'error'; // Tem erro = vermelho
      if (isEmpty) return 'empty'; // Vazio = cinza
      return 'valid'; // Preenchido e sem erro = verde
   };

   const state = getState();

   // Cores para cada estado
   const colors = {
      error: {
         header: 'bg-red-600',
         border: 'ring-1 ring-red-600',
      },
      empty: {
         header: 'bg-black',
         border: 'ring-1 ring-black',
      },
      valid: {
         header: 'bg-green-600',
         border: 'ring-1 ring-green-600',
      },
   };

   return (
      <div
         className={`overflow-hidden rounded-md bg-white ${colors[state].border}`}
      >
         <div className={`px-4 py-2 ${colors[state].header}`}>
            <h3 className="flex items-center gap-3 text-lg font-bold tracking-wider text-white select-none">
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
};
