import { z } from 'zod';
import { toast } from 'sonner';
import React, { useState, useRef, useEffect, useCallback } from 'react';
// ================================================================================
import { useAuth } from '../../../../../hooks/useAuth';
import { ToastCustom } from '../../../../../components/Toast_Custom';
import { TabelaTarefaProps } from '../../../../../types/types';
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '../../../../../components/ui/tooltip';
import {
   canUseBackdatedAppointmentsTarefa,
   ModalPermitirRetroativoTarefa,
   getCurrentUserIdTarefa,
   isUserAdminTarefa,
} from './Modal_Permitir_Retroativo_Tarefa'; // ou o caminho correto//
//  ================================================================================
import { BsFillXOctagonFill } from 'react-icons/bs';
import { IoMdClock, IoIosSave } from 'react-icons/io';
import { IoClose, IoDocumentText } from 'react-icons/io5';
import {
   FaUserClock,
   FaCalendarAlt,
   FaExclamationTriangle,
   FaUserCog,
} from 'react-icons/fa';

// ================================================================================
// INTERFACES E TIPOS
// ================================================================================
export interface ModalApontamentoProps {
   isOpen: boolean;
   onClose: () => void;
   tarefa: TabelaTarefaProps | null;
   nomeCliente?: string;
   onSuccess?: () => void;
   codTarefa?: number; // MUDANÇA: codChamado -> codTarefa
}
// ================================================================================
// FUNÇÕES UTILITÁRIAS
// ================================================================================

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
// SCHEMA DE VALIDAÇÃO COM ZOD - ATUALIZADO
// ================================================================================

// Schema de validação com Zod - ATUALIZADO para considerar permissões
const createFormSchema = (canUseBackdated: boolean) =>
   z
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
               // Se tem permissão especial, pular validação de mês anterior
               if (canUseBackdated) return true;

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
            const [endHours, endMinutes] = data.horaFimOS
               .split(':')
               .map(Number);

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
            const [endHours, endMinutes] = data.horaFimOS
               .split(':')
               .map(Number);

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

type FormData = {
   dataInicioOS: string;
   horaInicioOS: string;
   horaFimOS: string;
   observacaoOS: string;
};

type FormErrors = Partial<Record<keyof FormData | 'root', string>>;

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================

export default function ModalApontamentoOSTarefa({
   isOpen,
   onClose,
   tarefa,
   nomeCliente,
   onSuccess,
   codTarefa, // MUDANÇA: codChamado -> codTarefa
}: ModalApontamentoProps) {
   const { user } = useAuth();

   // ================================================================================
   // ESTADOS PRINCIPAIS
   // ================================================================================
   const [formData, setFormData] = useState<FormData>({
      observacaoOS: '',
      dataInicioOS: new Date().toISOString().split('T')[0],
      horaInicioOS: '',
      horaFimOS: '',
   });
   const [errors, setErrors] = useState<FormErrors>({});
   const [isLoading, setIsLoading] = useState(false);

   // ================================================================================
   // ESTADOS PARA SISTEMA DE PERMISSÕES
   // ================================================================================
   const [showBackdatedModal, setShowBackdatedModal] = useState(false);

   // ================================================================================
   // VARIÁVEIS COMPUTADAS PARA PERMISSÕES
   // ================================================================================
   const currentUserId = getCurrentUserIdTarefa(user);
   const isAdmin = isUserAdminTarefa(user);
   const canUseBackdatedDates = canUseBackdatedAppointmentsTarefa(
      currentUserId,
      codTarefa?.toString() || ''
   );
   // ================================================================================
   // REFS
   // ================================================================================
   const dateInputRef = useRef<HTMLInputElement>(null);

   // ================================================================================
   // FUNÇÕES DE VALIDAÇÃO
   // ================================================================================

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

   // Validação em tempo real de campos individuais
   const validateField = (name: keyof FormData, value: string) => {
      try {
         const formSchema = createFormSchema(canUseBackdatedDates);
         const fieldSchema = formSchema.shape[name];
         if (fieldSchema) {
            fieldSchema.parse(value);
            setErrors(prev => ({ ...prev, [name]: undefined }));
         }
      } catch (error) {
         if (error instanceof z.ZodError) {
            setErrors(prev => ({
               ...prev,
               [name]: error.issues[0]?.message,
            }));
         }
      }
   };

   // Validação completa do formulário
   const validateForm = (): boolean => {
      try {
         const formSchema = createFormSchema(canUseBackdatedDates);
         formSchema.parse(formData);
         setErrors({});
         return true;
      } catch (error) {
         if (error instanceof z.ZodError) {
            const newErrors: FormErrors = {};
            error.issues.forEach(err => {
               const path = err.path[0] as keyof FormData;
               newErrors[path] = err.message;
            });
            setErrors(newErrors);
         }
         return false;
      }
   };

   // Validação de relação entre horários em tempo real
   const validateTimeRelationRealTime = (data: FormData) => {
      const [startHours, startMinutes] = data.horaInicioOS
         .split(':')
         .map(Number);
      const [endHours, endMinutes] = data.horaFimOS.split(':').map(Number);

      const startTimeInMinutes = startHours * 60 + startMinutes;
      const endTimeInMinutes = endHours * 60 + endMinutes;

      if (endTimeInMinutes <= startTimeInMinutes) {
         setErrors((prev: FormErrors) => ({
            ...prev,
            horaFimOS: 'Hora de fim deve ser maior que hora de início',
         }));
      } else if (endTimeInMinutes - startTimeInMinutes < 15) {
         setErrors((prev: FormErrors) => ({
            ...prev,
            horaFimOS: 'Diferença mínima entre horários deve ser de 15 minutos',
         }));
      } else {
         // Relação válida - limpar apenas erros relacionais, manter outros
         setErrors((prev: FormErrors) => {
            const newErrors = { ...prev };
            if (
               newErrors.horaFimOS ===
                  'Hora de fim deve ser maior que hora de início' ||
               newErrors.horaFimOS ===
                  'Diferença mínima entre horários deve ser de 15 minutos'
            ) {
               newErrors.horaFimOS = undefined;
            }
            return newErrors;
         });
      }
   };

   // ================================================================================
   // HANDLERS DE EVENTOS
   // ================================================================================

   // Handler para mudanças nos inputs
   const handleInputChange = (
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
      setFormData(prev => ({
         ...prev,
         [name]: newValue,
      }));

      // VALIDAÇÃO EM TEMPO REAL PARA DATA
      if (name === 'dataInicioOS' && newValue) {
         const selectedDate = new Date(newValue);
         const today = new Date();
         today.setHours(0, 0, 0, 0);

         if (selectedDate > today) {
            setErrors((prev: FormErrors) => ({
               ...prev,
               dataInicioOS: 'Data não pode ser maior que hoje',
            }));
         } else if (isDateFromPreviousMonth(newValue)) {
            setErrors((prev: FormErrors) => ({
               ...prev,
               dataInicioOS: canUseBackdatedDates
                  ? undefined
                  : 'Não é possível selecionar datas de meses anteriores ao atual',
            }));
         } else {
            setErrors((prev: FormErrors) => ({
               ...prev,
               dataInicioOS: undefined,
            }));
         }
      }

      // VALIDAÇÃO EM TEMPO REAL PARA HORÁRIOS
      if (name === 'horaInicioOS' || name === 'horaFimOS') {
         // Validação individual do campo
         if (!newValue || newValue.trim() === '') {
            setErrors((prev: FormErrors) => ({
               ...prev,
               [name]:
                  name === 'horaInicioOS'
                     ? 'Hora de início é obrigatória'
                     : 'Hora de fim é obrigatória',
            }));
         } else {
            // Verificar formato (intervalos de 15 minutos)
            const regex = /^([01]?\d|2[0-3]):(00|15|30|45)$/;
            if (!regex.test(newValue)) {
               setErrors((prev: FormErrors) => ({
                  ...prev,
                  [name]: 'A hora deve ser em intervalos de 15 minutos',
               }));
            } else {
               // Campo individual válido, limpar seu erro
               setErrors((prev: FormErrors) => ({
                  ...prev,
                  [name]: undefined,
               }));

               // Validar relação entre horários apenas se ambos estão preenchidos
               setTimeout(() => {
                  const updatedData = { ...formData, [name]: newValue };
                  if (updatedData.horaInicioOS && updatedData.horaFimOS) {
                     validateTimeRelationRealTime(updatedData);
                  }
               }, 0);
            }
         }
      }

      // VALIDAÇÃO EM TEMPO REAL PARA OBSERVAÇÃO
      if (name === 'observacaoOS') {
         if (newValue.trim().length === 0) {
            setErrors((prev: FormErrors) => ({
               ...prev,
               observacaoOS: undefined,
            }));
         } else if (newValue.trim().length < 10) {
            setErrors((prev: FormErrors) => ({
               ...prev,
               observacaoOS: 'Observação deve ter pelo menos 10 caracteres',
            }));
         } else if (newValue.length > 200) {
            setErrors((prev: FormErrors) => ({
               ...prev,
               observacaoOS: 'Observação deve ter no máximo 200 caracteres',
            }));
         } else {
            setErrors((prev: FormErrors) => ({
               ...prev,
               observacaoOS: undefined,
            }));
         }
      }
   };

   // Handler para blur nos campos de hora
   const handleTimeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (name !== 'horaInicioOS' && name !== 'horaFimOS') return;

      // Ajustar para intervalo mais próximo
      const ajustado = ajustaParaIntervalo(value);
      if (ajustado !== value) {
         setFormData(prev => ({ ...prev, [name]: ajustado }));

         // Após ajustar, re-validar
         const event = {
            target: { name, value: ajustado },
         } as React.ChangeEvent<HTMLInputElement>;

         setTimeout(() => {
            handleInputChange(event);
         }, 0);
      }

      // Se o campo está vazio no blur, mostrar erro obrigatório
      if (!ajustado || ajustado.trim() === '') {
         setErrors((prev: FormErrors) => ({
            ...prev,
            [name]:
               name === 'horaInicioOS'
                  ? 'Hora de início é obrigatória'
                  : 'Hora de fim é obrigatória',
         }));
      }
   };

   // Handler para blur nos outros campos
   const handleFieldBlur = (
      e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
   ) => {
      const { name, value } = e.target;

      // Para observação, validar se está vazio no blur
      if (name === 'observacaoOS') {
         if (value.trim().length === 0) {
            setErrors((prev: FormErrors) => ({
               ...prev,
               observacaoOS: undefined,
            }));
         } else if (value.trim().length < 10) {
            setErrors((prev: FormErrors) => ({
               ...prev,
               observacaoOS: 'Observação deve ter pelo menos 10 caracteres',
            }));
         }
      }
   };

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

   // ================================================================================
   // FUNÇÕES DE SUBMISSÃO E CONTROLE
   // ================================================================================

   // Envio do formulário
   const handleSubmitForm = async () => {
      setIsLoading(true);
      setErrors({});

      try {
         if (!validateForm()) {
            setIsLoading(false);
            return;
         }

         // FORMATAR A OBSERVAÇÃO COM O NOME DO CLIENTE
         const primeiroNome = nomeCliente ? getPrimeiroNome(nomeCliente) : '';
         const observacaoSemAcentos = removerAcentos(
            formData.observacaoOS.trim()
         );
         const observacaoFormatada = primeiroNome
            ? `[${primeiroNome}] - ${observacaoSemAcentos}`
            : observacaoSemAcentos;

         // Validações de negócio
         if (!tarefa) {
            throw new Error('Tarefa não selecionada');
         }
         if (!user?.recurso?.id) {
            throw new Error('Usuário sem recurso definido');
         }

         // PAYLOAD SIMPLIFICADO - Alinhado com a API
         const payload = {
            os: {
               COD_TAREFA: tarefa.COD_TAREFA,
               NOME_TAREFA: tarefa.NOME_TAREFA,
               FATURA_TAREFA: 'SIM',
            },
            dataInicioOS: formData.dataInicioOS,
            horaInicioOS: formData.horaInicioOS,
            horaFimOS: formData.horaFimOS,
            recurso: user.recurso.id.toString(),
            observacaoOS: observacaoFormatada,
         };

         const token = localStorage.getItem('token');
         if (!token) {
            throw new Error('Token não encontrado');
         }

         const response = await fetch('/api/apontamentos/create', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
         });

         const responseData = await response.json();

         if (!response.ok) {
            throw new Error(responseData.error || `Erro ${response.status}`);
         }

         toast.custom(t => (
            <ToastCustom
               type="success"
               title="Operação realizada com sucesso!"
               description={`Apontamento realizado com sucesso! OS #${responseData.data?.NUM_OS} criada.`}
            />
         ));

         // Resetar formulário e fechar modal
         resetForm();
         onClose();

         // Chamar callback de sucesso se fornecido
         if (onSuccess) {
            onSuccess();
         }
      } catch (error) {
         console.error('Erro ao realizar Apontamento:', error);

         toast.custom(t => (
            <ToastCustom
               type="error"
               title="Erro ao tentar realizar Apontamento"
               description={
                  error instanceof Error
                     ? error.message
                     : 'Tente novamente em instantes.'
               }
            />
         ));
      } finally {
         setIsLoading(false);
      }
   };

   // Função para resetar o formulário
   const resetForm = () => {
      setFormData({
         observacaoOS: '',
         dataInicioOS: new Date().toISOString().split('T')[0],
         horaInicioOS: '',
         horaFimOS: '',
      });
      setErrors({});
      setShowBackdatedModal(false); // <- ADICIONAR ESTA LINHA
   };

   // Função para fechar o modal
   const handleClose = () => {
      if (!isLoading) {
         resetForm();
         onClose();
      }
   };

   // Função para verificar se o formulário é válido
   const isFormValid = () => {
      try {
         const formSchema = createFormSchema(canUseBackdatedDates);
         formSchema.parse(formData);
         return true;
      } catch {
         return false;
      }
   };

   // Para melhorar a UX, definir o atributo 'min' no input de data:
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

   // ================================================================================
   // EFFECTS
   // ================================================================================

   // useEffect para validar data sempre que mudar ou permissões mudarem
   useEffect(() => {
      if (formData.dataInicioOS) {
         const selectedDate = new Date(formData.dataInicioOS);
         const today = new Date();
         today.setHours(0, 0, 0, 0);

         // Primeira validação: data não pode ser maior que hoje
         if (selectedDate > today) {
            setErrors((prev: FormErrors) => ({
               ...prev,
               dataInicioOS: 'Data não pode ser maior que hoje',
            }));
         }
         // Segunda validação: data não pode ser de mês anterior (a menos que tenha permissão)
         else if (isDateFromPreviousMonth(formData.dataInicioOS)) {
            setErrors((prev: FormErrors) => ({
               ...prev,
               dataInicioOS:
                  'Não é possível selecionar datas de meses anteriores ao atual',
            }));
         }
         // Se passou em todas as validações, limpar erro
         else {
            setErrors((prev: FormErrors) => ({
               ...prev,
               dataInicioOS: undefined,
            }));
         }
      }
   }, [formData.dataInicioOS, isDateFromPreviousMonth]);

   useEffect(() => {
      if (!isOpen) {
         // Quando o modal principal fechar, garantir que o modal de permissões também feche
         setShowBackdatedModal(false);
      }
   }, [isOpen]);

   if (!isOpen || !tarefa) return null;

   // ================================================================================
   // RENDERIZAÇÃO PRINCIPAL
   // ================================================================================

   return (
      <>
         <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-4 duration-300">
            {/* ===== OVERLAY ===== */}
            <div
               className="absolute inset-0 bg-black/50 backdrop-blur-xl"
               onClick={handleClose}
            />

            <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-4xl overflow-hidden rounded-2xl border-0 bg-white shadow-xl shadow-black transition-all duration-500 ease-out">
               {/* ===== HEADER ===== */}
               <header className="relative flex items-center justify-between bg-gradient-to-r from-green-500 via-green-600 to-green-700 p-6 shadow-md shadow-black">
                  {/* Título do modal */}
                  <div className="flex items-center justify-center gap-6">
                     <div className="rounded-md border-none bg-white/10 p-3 shadow-md shadow-black">
                        <FaUserClock className="text-black" size={36} />
                     </div>
                     <div className="flex flex-col">
                        <h1 className="text-3xl font-extrabold tracking-wider text-black select-none">
                           Apontamento Tarefa
                        </h1>
                        <p className="text-xl font-extrabold tracking-widest text-black select-none">
                           Tarefa #{tarefa.COD_TAREFA}
                        </p>
                     </div>
                  </div>

                  <div className="flex items-center justify-center gap-6">
                     {/* Botão Permitir Apontamento Retroativo - APENAS PARA ADMINS */}
                     {isAdmin && tarefa.COD_TAREFA && (
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

                     {/* Botão fechar modal */}
                     <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="group cursor-pointer rounded-full bg-red-500/50 p-3 text-white shadow-md shadow-black transition-all select-none hover:scale-125 hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                     >
                        <IoClose size={24} />
                     </button>
                  </div>
               </header>

               {/* ===== CONTEÚDO ===== */}
               <main className="p-6">
                  {/* ===== AVISO SOBRE PERMISSÕES ESPECIAIS ===== */}
                  {canUseBackdatedDates && (
                     <div className="mb-6 flex flex-col gap-2 rounded-lg border border-l-8 border-blue-500 bg-blue-100 p-4">
                        <div className="flex items-center gap-3">
                           <FaUserCog className="text-blue-800" size={20} />
                           <span className="text-base font-extrabold tracking-wider text-blue-800 uppercase select-none">
                              Permissão Especial Ativa
                           </span>
                        </div>
                        <p className="text-sm text-blue-700">
                           Você tem permissão para criar apontamentos em datas
                           de meses anteriores ao atual para esta tarefa.
                        </p>
                     </div>
                  )}

                  {/* ===== FORMULÁRIO ===== */}
                  <div className="flex flex-col gap-6">
                     {/* Data */}
                     <FormSection
                        title="Data do Apontamento"
                        icon={
                           <FaCalendarAlt className="text-white" size={20} />
                        }
                        error={errors.dataInicioOS}
                        isEmpty={false} // Data sempre tem valor inicial
                     >
                        <input
                           ref={dateInputRef}
                           type="date"
                           name="dataInicioOS"
                           value={formData.dataInicioOS}
                           onChange={handleInputChange}
                           onBlur={handleFieldBlur}
                           onKeyDown={handleDateKeyDown}
                           onClick={handleDateClick}
                           min={getCurrentMonthFirstDay()}
                           max={new Date().toISOString().split('T')[0]}
                           disabled={isLoading}
                           className={`w-full cursor-pointer rounded-md border-t-0 border-slate-300 bg-white px-4 py-2 text-lg font-extrabold tracking-wider text-black italic shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                              errors.dataInicioOS
                                 ? 'border-red-500 ring-2 ring-red-600'
                                 : ''
                           } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                        />
                        {errors.dataInicioOS && (
                           <div className="mt-2 flex items-center gap-2">
                              <BsFillXOctagonFill
                                 className="text-red-600"
                                 size={16}
                              />
                              <p className="text-sm font-semibold tracking-widest text-red-600 italic select-none">
                                 {errors.dataInicioOS}
                              </p>
                           </div>
                        )}
                     </FormSection>

                     {/* Horários */}
                     <FormSection
                        title="Horários do Apontamento"
                        icon={<IoMdClock className="text-white" size={20} />}
                        error={errors.horaInicioOS || errors.horaFimOS}
                        isEmpty={!formData.horaInicioOS && !formData.horaFimOS}
                     >
                        <div className="grid grid-cols-2 gap-4">
                           {/* Hora Início */}
                           <div>
                              <label className="mb-1 block text-base font-semibold tracking-wider text-black select-none">
                                 Hora Início
                              </label>
                              <input
                                 type="time"
                                 name="horaInicioOS"
                                 value={formData.horaInicioOS}
                                 onChange={handleInputChange}
                                 onBlur={handleTimeBlur}
                                 disabled={isLoading}
                                 className={`w-full cursor-pointer rounded-md border-t-0 border-slate-300 px-4 py-1 text-lg font-extrabold tracking-wider text-black italic shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                                    errors.horaInicioOS
                                       ? 'border-red-500 bg-red-50 ring-2 ring-red-600'
                                       : !formData.horaInicioOS
                                         ? 'border-gray-300 bg-white'
                                         : 'border-green-500 bg-green-50 ring-2 ring-green-600'
                                 }`}
                              />

                              {/* Mensagens de erro */}
                              {errors.horaInicioOS && (
                                 <div className="mt-2 flex items-center gap-2">
                                    <BsFillXOctagonFill
                                       className="text-red-600"
                                       size={16}
                                    />
                                    <p className="text-sm font-semibold tracking-widest text-red-600 italic select-none">
                                       {errors.horaInicioOS}
                                    </p>
                                 </div>
                              )}

                              {/* Mensagem de sucesso */}
                              {!errors.horaInicioOS &&
                                 formData.horaInicioOS && (
                                    <div className="mt-2 flex items-center gap-2">
                                       <div className="h-2 w-2 rounded-full bg-green-600"></div>
                                       <span className="text-sm font-semibold tracking-widest text-green-600 italic select-none">
                                          Hora início válida
                                       </span>
                                    </div>
                                 )}
                           </div>

                           {/* Hora Fim */}
                           <div>
                              <label className="mb-1 block text-base font-semibold tracking-wider text-black select-none">
                                 Hora Fim
                              </label>
                              <input
                                 type="time"
                                 name="horaFimOS"
                                 value={formData.horaFimOS}
                                 onChange={handleInputChange}
                                 onBlur={handleTimeBlur}
                                 disabled={isLoading}
                                 className={`w-full cursor-pointer rounded-md border-t-0 border-slate-300 px-4 py-1 text-lg font-extrabold tracking-wider text-black italic shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                                    errors.horaFimOS
                                       ? 'border-red-500 bg-red-50 ring-2 ring-red-600'
                                       : !formData.horaFimOS
                                         ? 'border-gray-300 bg-white'
                                         : 'border-green-500 bg-green-50 ring-2 ring-green-600'
                                 }`}
                              />

                              {/* Mensagens de erro */}
                              {errors.horaFimOS && (
                                 <div className="mt-2 flex items-center gap-2">
                                    <BsFillXOctagonFill
                                       className="text-red-600"
                                       size={16}
                                    />
                                    <p className="text-sm font-semibold tracking-widest text-red-600 italic select-none">
                                       {errors.horaFimOS}
                                    </p>
                                 </div>
                              )}

                              {/* Mensagem de sucesso */}
                              {!errors.horaFimOS && formData.horaFimOS && (
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

                     {/* Observação */}
                     <FormSection
                        title="Observação do Apontamento"
                        icon={
                           <IoDocumentText className="text-white" size={20} />
                        }
                        error={errors.observacaoOS}
                        isEmpty={!formData.observacaoOS.trim()}
                     >
                        <textarea
                           name="observacaoOS"
                           value={formData.observacaoOS}
                           onChange={handleInputChange}
                           onBlur={handleFieldBlur}
                           disabled={isLoading}
                           rows={4}
                           maxLength={200}
                           placeholder="Descreva detalhadamente o serviço realizado, procedimentos executados, materiais utilizados e resultados obtidos..."
                           className={`w-full cursor-pointer resize-none rounded-md border-t-0 border-slate-300 px-4 pt-3 text-base font-extrabold tracking-wider text-black italic shadow-sm shadow-black transition-all placeholder:text-sm hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                              errors.observacaoOS
                                 ? 'border-red-500 bg-red-50 ring-2 ring-red-600'
                                 : !formData.observacaoOS.trim()
                                   ? 'border-gray-300 bg-white'
                                   : 'border-green-500 bg-green-50 ring-2 ring-green-600'
                           }`}
                        />

                        {/* Mensagens de erro */}
                        {errors.observacaoOS && (
                           <div className="mt-2 flex items-center gap-2">
                              <BsFillXOctagonFill
                                 className="text-red-700"
                                 size={16}
                              />
                              <p className="text-sm font-semibold tracking-widest text-red-700 italic select-none">
                                 {errors.observacaoOS}
                              </p>
                           </div>
                        )}

                        {/* Mensagem de sucesso */}
                        {!errors.observacaoOS &&
                           formData.observacaoOS.trim() && (
                              <div className="mt-2 flex items-center gap-2">
                                 <div className="h-2 w-2 rounded-full bg-green-600"></div>
                                 <span className="text-sm font-semibold tracking-widest text-green-600 italic select-none">
                                    Observação válida
                                 </span>
                              </div>
                           )}

                        {/* Contador de caracteres */}
                        <div className="mt-2 flex w-full items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div
                                 className={`h-2 w-2 rounded-full ${
                                    formData.observacaoOS.length === 0
                                       ? 'bg-black'
                                       : formData.observacaoOS.length > 180
                                         ? 'bg-red-600'
                                         : formData.observacaoOS.length > 150
                                           ? 'bg-amber-600'
                                           : 'bg-green-600'
                                 }`}
                              ></div>
                              <span
                                 className={`text-sm font-semibold tracking-widest italic select-none ${
                                    formData.observacaoOS.length === 0
                                       ? 'text-black'
                                       : formData.observacaoOS.length > 180
                                         ? 'text-red-600'
                                         : formData.observacaoOS.length > 150
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
                                    formData.observacaoOS.length === 0
                                       ? 'bg-black'
                                       : formData.observacaoOS.length > 180
                                         ? 'bg-red-600'
                                         : formData.observacaoOS.length > 150
                                           ? 'bg-amber-600'
                                           : 'bg-green-600'
                                 }`}
                              ></div>
                              <span
                                 className={`text-sm font-semibold tracking-widest italic select-none ${
                                    formData.observacaoOS.length === 0
                                       ? 'text-black'
                                       : formData.observacaoOS.length > 180
                                         ? 'text-red-600'
                                         : formData.observacaoOS.length > 150
                                           ? 'text-amber-600'
                                           : 'text-green-600'
                                 }`}
                              >
                                 {formData.observacaoOS.length}/200
                              </span>
                           </div>
                        </div>
                     </FormSection>
                  </div>
               </main>

               {/* ===== FOOTER ===== */}
               <footer className="relative flex justify-end gap-4 border-t-4 border-red-600 p-6">
                  {/* Botão cancelar */}
                  <button
                     onClick={handleClose}
                     disabled={isLoading}
                     className="cursor-pointer rounded-xl border-none bg-red-500 px-6 py-2 text-lg font-extrabold tracking-wider text-white shadow-sm shadow-black transition-all select-none hover:scale-105 hover:bg-red-900 hover:shadow-md hover:shadow-black active:scale-95"
                  >
                     Cancelar
                  </button>

                  {/* Botão de atualizar/salvar */}
                  <button
                     onClick={handleSubmitForm}
                     disabled={isLoading || !isFormValid()}
                     className={`cursor-pointer rounded-xl border-none bg-blue-500 px-6 py-2 text-lg font-extrabold tracking-wider text-white shadow-sm shadow-black select-none ${
                        isLoading || !isFormValid()
                           ? 'disabled:cursor-not-allowed disabled:opacity-50'
                           : 'transition-all hover:scale-105 hover:bg-blue-900 hover:shadow-md hover:shadow-black active:scale-95'
                     }`}
                  >
                     {isLoading ? (
                        <div className="flex items-center gap-2">
                           <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                           <span>Apontando...</span>
                        </div>
                     ) : (
                        <div className="flex items-center gap-1">
                           <IoIosSave className="mr-2 inline-block" size={20} />
                           <span>Apontar</span>
                        </div>
                     )}
                  </button>
               </footer>
            </div>
         </div>
         {/* ===== MODAL DE PERMISSÕES RETROATIVAS ===== */}
         {isAdmin && showBackdatedModal && tarefa && (
            <ModalPermitirRetroativoTarefa
               isOpen={showBackdatedModal}
               onClose={() => setShowBackdatedModal(false)}
               currentUserId={currentUserId}
               tarefaId={tarefa.COD_TAREFA.toString()}
            />
         )}{' '}
      </>
   );
}

// ===== COMPONENTE FORMSECTION =====
const FormSection = ({
   title,
   icon,
   children,
   error,
   isEmpty,
}: {
   title: string;
   icon: React.ReactNode;
   children: React.ReactNode;
   error?: string;
   isEmpty?: boolean;
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
