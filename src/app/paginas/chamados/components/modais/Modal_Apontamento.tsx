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
   const [success, setSuccess] = useState(false);

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
            // codChamado não é mais necessário - a API busca automaticamente
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
               description={`O Apontamento #${responseData.data?.COD_APONTAMENTO} foi realizado com sucesso!`}
            />
         ));
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
      setSuccess(false);
   };
   // ====================

   // Função para fechar o modal
   const handleClose = () => {
      if (!isLoading) {
         resetForm();
         onClose();
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
         <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xl"
            onClick={handleClose}
         />
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
                     Realizar Apontamento
                  </h1>
               </div>
               {/* ========== */}

               {/* Botão fechar modal */}
               <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="group cursor-pointer rounded-full bg-red-500/50 p-2 text-white transition-all select-none hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  <IoClose size={24} />
               </button>
            </header>
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
                        disabled={isLoading}
                        className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-black shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 hover:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                           errors.dataInicioOS
                              ? 'border-red-500 ring-2 ring-red-600'
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
                              disabled={isLoading}
                              className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-black shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 hover:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                                 errors.horaInicioOS
                                    ? 'border-red-500 ring-2 ring-red-600'
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
                              disabled={isLoading}
                              className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-black shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 hover:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                                 errors.horaFimOS
                                    ? 'border-red-500 ring-2 ring-red-600'
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
                        disabled={isLoading}
                        rows={4}
                        maxLength={200}
                        placeholder="Descreva detalhadamente o serviço realizado, procedimentos executados, materiais utilizados e resultados obtidos..."
                        className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-black shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 hover:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                           errors.observacaoOS
                              ? 'border-red-500 ring-2 ring-red-600'
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
            <footer className="relative flex justify-end gap-4 border-t-4 border-red-600 p-6">
               {/* Botão cancelar */}
               <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="cursor-pointer rounded-xl border-none bg-red-500 px-6 py-2 text-lg font-extrabold tracking-wider text-white shadow-sm shadow-black transition-all select-none hover:scale-105 hover:bg-red-900 hover:shadow-md hover:shadow-black active:scale-95"
               >
                  Cancelar
               </button>
               {/* ===== */}

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
