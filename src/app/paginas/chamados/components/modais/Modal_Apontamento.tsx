import React, { useState } from 'react';
import { z } from 'zod';
// ====================
import { useAuth } from '../../../../../hooks/useAuth';
import { DBTarefaProps } from '../../../../../types/types';
// ====================
import {
   FaCalendarAlt,
   FaCheckCircle,
   FaExclamationTriangle,
} from 'react-icons/fa';
import { IoMdClock } from 'react-icons/io';
import { FaUserClock } from 'react-icons/fa';
import { IoClose, IoDocumentText } from 'react-icons/io5';
import { BsFillXOctagonFill } from 'react-icons/bs';
import { toast } from 'sonner';
import { ToastCustom } from '../../../../../components/Toast_Custom';
import { IoIosSave } from 'react-icons/io';
// ================================================================================

export interface Props {
   isOpen: boolean;
   onClose: () => void;
   tarefa: DBTarefaProps | null;
   nomeCliente?: string;
   onSuccess?: () => void;
   codChamado?: number; // NOVO PROP PARA EXIBIR O CÓDIGO DO CHAMADO
}
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
// ====================

// Schema de validação com Zod
const formSchema = z
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

type FormData = z.infer<typeof formSchema>;
type FormErrors = Partial<Record<keyof FormData | 'root', string>>;
// ================================================================================

export default function ModalApontamento({
   isOpen,
   onClose,
   tarefa,
   nomeCliente,
   onSuccess,
   codChamado, // Adicionado para disponibilizar o prop
}: Props) {
   const { user } = useAuth();

   const [formData, setFormData] = useState<FormData>({
      observacaoOS: '',
      dataInicioOS: new Date().toISOString().split('T')[0],
      horaInicioOS: '',
      horaFimOS: '',
   });
   // ===== ESTADOS =====
   const [errors, setErrors] = useState<FormErrors>({});
   const [isLoading, setIsLoading] = useState(false);
   const [apontamentoSalvo, setApontamentoSalvo] = useState(false); // NOVO ESTADO

   // Validação em tempo real (opcional)
   // Validação em tempo real
   const validateField = (name: keyof FormData, value: string) => {
      try {
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
   // ====================

   // Função para lidar com o evento onBlur dos campos de hora
   const handleTimeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (name !== 'horaInicioOS' && name !== 'horaFimOS') return;

      const ajustado = ajustaParaIntervalo(value);
      if (ajustado !== value) {
         setFormData(prev => ({ ...prev, [name]: ajustado }));
      }

      try {
         const fieldSchema = (formSchema as any).shape[name];
         fieldSchema.parse(ajustado);
         setErrors(prev => ({ ...prev, [name]: undefined }));
      } catch (err) {
         if (err instanceof z.ZodError) {
            setErrors(prev => ({ ...prev, [name]: err.issues[0]?.message }));
         }
      }
   };
   // ====================

   // Função para lidar com mudanças nos inputs
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

      setFormData(prev => ({
         ...prev,
         [name]: newValue,
      }));

      if (errors[name as keyof FormData]) {
         setErrors(prev => ({ ...prev, [name]: undefined }));
      }

      if (newValue.length > 0) {
         setTimeout(() => validateField(name as keyof FormData, newValue), 500);
      }
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
   // ====================

   const validateForm = (): boolean => {
      try {
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
   // ====================

   // ===== ENVIO DO FORMULÁRIO =====
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

         // NOVO PAYLOAD SIMPLIFICADO - Alinhado com a nova API
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

         // MARCAR COMO SALVO COM SUCESSO
         setApontamentoSalvo(true);

         toast.custom(t => (
            <ToastCustom
               type="success"
               title="Operação realizada com sucesso!"
               description={`Apontamento realizado com sucesso! OS #${responseData.data?.COD_OS} criada e associada ao Chamado #${responseData.data?.codChamado}.`}
            />
         ));

         // ===== CHAMAR onSuccess E onClose APÓS SUCESSO =====
         if (onSuccess) {
            onSuccess();
         }

         // Resetar o formulário e fechar o modal
         resetForm();
         onClose(); // AGORA SÓ FECHA APÓS SUCESSO
      } catch (error) {
         console.error('Erro ao realizar Apontamento:', error);

         toast.custom(t => (
            <ToastCustom
               type="error"
               title="Erro ao tentar realizar Apontamento"
               description="Tente novamente em instantes."
            />
         ));
      } finally {
         setIsLoading(false);
      }
   };
   // ====================

   // Função para resetar o formulário
   const resetForm = () => {
      setFormData({
         observacaoOS: '',
         dataInicioOS: new Date().toISOString().split('T')[0],
         horaInicioOS: '',
         horaFimOS: '',
      });
      setErrors({});
      setApontamentoSalvo(false); // RESETAR O ESTADO
   };
   // ====================

   // MODIFICADO: Função para fechar o modal (só fecha se apontamento foi salvo)
   const handleClose = () => {
      if (isLoading) {
         // Se está carregando, não permitir fechar
         toast.custom(t => (
            <ToastCustom
               type="warning"
               title="Aguarde!"
               description="O apontamento está sendo processado. Aguarde a conclusão."
            />
         ));
         return;
      }

      if (apontamentoSalvo) {
         // Se foi salvo, pode fechar normalmente
         resetForm();
         onClose();
         return;
      }

      // Se não foi salvo, NÃO PERMITIR FECHAR - apenas mostrar aviso
      toast.custom(t => (
         <ToastCustom
            type="warning"
            title="Apontamento obrigatório!"
            description="Você deve realizar o apontamento antes de fechar esta janela."
         />
      ));
   };
   // ====================

   // MODIFICADO: Prevenir fechamento do modal ao clicar no overlay
   const handleOverlayClick = (e: React.MouseEvent) => {
      // Se clicou no overlay (fundo), chamar handleClose que tem as validações
      if (e.target === e.currentTarget) {
         handleClose();
      }
   };
   // ====================

   // Função para verificar se o formulário é válido
   const isFormValid = () => {
      try {
         formSchema.parse(formData);
         return true;
      } catch {
         return false;
      }
   };
   // ====================

   if (!isOpen || !tarefa) return null;

   // ================================================================================
   // RENDERIZAÇÃO PRINCIPAL
   // ================================================================================

   return (
      <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center p-4 duration-300">
         {/* ===== OVERLAY ===== */}
         <div className="absolute inset-0 bg-black/50 backdrop-blur-xl" />
         {/* ========== */}

         <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-4xl overflow-hidden rounded-2xl border-0 bg-white transition-all duration-500 ease-out">
            {/* ===== HEADER ===== */}
            <header className="relative flex items-center justify-between bg-gradient-to-r from-green-500 via-green-600 to-green-700 p-6 shadow-md shadow-black">
               {/* Título do modal */}
               <div className="flex items-center justify-center gap-6">
                  <div className="rounded-md border-none bg-white/10 p-3 shadow-md shadow-black">
                     <FaUserClock className="text-black" size={36} />
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-wider text-black select-none">
                     Apontamento de horas
                  </h1>
                  <div className="flex flex-col gap-1 text-sm text-white">
                     <p>Tarefa: {tarefa?.COD_TAREFA}</p>
                     <p>Chamado: {codChamado}</p>{' '}
                     {/* Use o codChamado do apontamentoData */}
                  </div>
               </div>
               {/* ========== */}

               {/* REMOVIDO: Botão fechar modal - só mostra após salvar */}
               {apontamentoSalvo && (
                  <button
                     onClick={() => {
                        resetForm();
                        onClose();
                     }}
                     className="group cursor-pointer rounded-full bg-green-500/50 p-2 text-white transition-all select-none hover:scale-125 hover:rotate-180 hover:bg-green-500 active:scale-95"
                  >
                     <IoClose size={24} />
                  </button>
               )}
            </header>
            {/* ==================== */}

            {/* ===== INDICADOR DE STATUS ===== */}
            {isLoading && (
               <div className="border-l-4 border-blue-500 bg-blue-100 p-4">
                  <div className="flex items-center">
                     <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                     <p className="font-semibold text-blue-700">
                        Processando apontamento... Por favor, não feche esta
                        janela.
                     </p>
                  </div>
               </div>
            )}

            {apontamentoSalvo && (
               <div className="border-l-4 border-green-500 bg-green-100 p-4">
                  <div className="flex items-center">
                     <FaCheckCircle className="mr-3 text-green-500" size={20} />
                     <p className="font-semibold text-green-700">
                        Apontamento realizado com sucesso! Você pode fechar esta
                        janela.
                     </p>
                  </div>
               </div>
            )}
            {/* ==================== */}

            {/* ===== CONTEÚDO ===== */}
            <main className="p-6">
               {/* ===== FORMULÁRIO ===== */}
               <div className="flex flex-col gap-6">
                  {/* Data */}
                  <FormSection
                     title="Data"
                     icon={<FaCalendarAlt className="text-white" size={20} />}
                     error={errors.dataInicioOS}
                  >
                     <input
                        type="date"
                        name="dataInicioOS"
                        value={formData.dataInicioOS}
                        onChange={handleInputChange}
                        disabled={isLoading || apontamentoSalvo} // MODIFICADO
                        className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-black shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 hover:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                           errors.dataInicioOS
                              ? 'border-red-500 ring-2 ring-red-600'
                              : ''
                        } ${
                           isLoading || apontamentoSalvo
                              ? 'cursor-not-allowed opacity-50'
                              : ''
                        }`}
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
                  {/* ========== */}

                  {/* Horário */}
                  <FormSection
                     title="Horário"
                     icon={<IoMdClock className="text-white" size={20} />}
                     error={errors.horaInicioOS || errors.horaFimOS}
                  >
                     <div className="grid grid-cols-2 gap-6">
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
                              disabled={isLoading || apontamentoSalvo} // MODIFICADO
                              className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-black shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 hover:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                                 errors.horaInicioOS
                                    ? 'border-red-500 ring-2 ring-red-600'
                                    : ''
                              } ${
                                 isLoading || apontamentoSalvo
                                    ? 'cursor-not-allowed opacity-50'
                                    : ''
                              }`}
                           />
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
                        </div>

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
                              disabled={isLoading || apontamentoSalvo} // MODIFICADO
                              className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-black shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 hover:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                                 errors.horaFimOS
                                    ? 'border-red-500 ring-2 ring-red-600'
                                    : ''
                              } ${
                                 isLoading || apontamentoSalvo
                                    ? 'cursor-not-allowed opacity-50'
                                    : ''
                              }`}
                           />
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
                        </div>
                     </div>
                  </FormSection>
                  {/* ========== */}

                  {/* Observação */}
                  <FormSection
                     title="Observação"
                     icon={<IoDocumentText className="text-white" size={20} />}
                     error={errors.observacaoOS}
                  >
                     <textarea
                        name="observacaoOS"
                        value={formData.observacaoOS}
                        onChange={handleInputChange}
                        disabled={isLoading || apontamentoSalvo} // MODIFICADO
                        rows={4}
                        maxLength={200}
                        placeholder="Descreva detalhadamente o serviço realizado, procedimentos executados, materiais utilizados e resultados obtidos..."
                        className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-black shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 hover:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                           errors.observacaoOS
                              ? 'border-red-500 ring-2 ring-red-600'
                              : ''
                        } ${
                           isLoading || apontamentoSalvo
                              ? 'cursor-not-allowed opacity-50'
                              : ''
                        }`}
                     />
                     {errors.observacaoOS && (
                        <div className="mt-2 flex items-center gap-2">
                           <BsFillXOctagonFill
                              className="text-red-600"
                              size={16}
                           />
                           <p className="text-sm font-semibold tracking-widest text-red-600 italic select-none">
                              {errors.observacaoOS}
                           </p>
                        </div>
                     )}

                     {/* Contador de caracteres */}
                     <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-black"></div>
                           <span className="text-sm font-semibold tracking-widest text-black italic select-none">
                              Máximo de 200 caracteres.
                           </span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div
                              className={`h-2 w-2 rounded-full ${
                                 formData.observacaoOS.length > 180
                                    ? 'bg-red-600'
                                    : formData.observacaoOS.length > 150
                                      ? 'bg-amber-600'
                                      : 'bg-green-600'
                              }`}
                           ></div>
                           <span
                              className={`text-sm font-semibold tracking-widest italic select-none ${
                                 formData.observacaoOS.length > 180
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
                  {/* ==================== */}
               </div>
            </main>
            {/* ==================== */}

            {/* ===== FOOTER ===== */}
            <footer className="relative flex justify-center gap-4 border-t-4 border-red-600 p-6">
               {/* REMOVIDO: Botão cancelar */}

               {/* SÓ MOSTRAR BOTÃO DE APONTAR SE NÃO FOI SALVO */}
               {!apontamentoSalvo && (
                  <button
                     onClick={handleSubmitForm}
                     disabled={isLoading || !isFormValid()}
                     className={`cursor-pointer rounded-xl border-none bg-blue-500 px-8 py-3 text-lg font-extrabold tracking-wider text-white shadow-sm shadow-black select-none ${
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
                           <span>Realizar Apontamento</span>
                        </div>
                     )}
                  </button>
               )}

               {/* MOSTRAR BOTÃO FECHAR APENAS APÓS SALVAR */}
               {apontamentoSalvo && (
                  <button
                     onClick={() => {
                        resetForm();
                        onClose();
                     }}
                     className="cursor-pointer rounded-xl border-none bg-green-500 px-8 py-3 text-lg font-extrabold tracking-wider text-white shadow-sm shadow-black transition-all select-none hover:scale-105 hover:bg-green-900 hover:shadow-md hover:shadow-black active:scale-95"
                  >
                     <div className="flex items-center gap-2">
                        <FaCheckCircle
                           className="mr-2 inline-block"
                           size={20}
                        />
                        <span>Fechar</span>
                     </div>
                  </button>
               )}
            </footer>
         </div>
      </div>
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
