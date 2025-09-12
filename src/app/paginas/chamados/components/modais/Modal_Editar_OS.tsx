import React, { useState } from 'react';
import { z } from 'zod';
// ====================
import { IoClose } from 'react-icons/io5';
import { FaCalendarAlt } from 'react-icons/fa';
import { IoMdClock } from 'react-icons/io';
import { IoDocumentText } from 'react-icons/io5';
import { FaExclamationTriangle } from 'react-icons/fa';
import { FaCheckCircle } from 'react-icons/fa';
import { BsFillXOctagonFill } from 'react-icons/bs';
// ================================================================================

interface Props {
   isOpen: boolean;
   onClose: () => void;
   codChamado: number | null;
   codOS: string | null;
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

// Esquema de validação com Zod
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

// ===== COMPONENTE PRINCIPAL =====
export default function ModalEditarOS({
   isOpen,
   onClose,
   codOS,
   onSuccess,
   nomeCliente,
}: Props) {
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

   // Validação completa do formulário antes do envio
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
   const handleSubmit = async () => {
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

         const payload = {
            codOS: codOS,
            dataInicioOS: formData.dataInicioOS,
            horaInicioOS: formData.horaInicioOS,
            horaFimOS: formData.horaFimOS,
            observacaoOS: observacaoFormatada,
         };

         const response = await fetch('/api/apontamentos/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });

         const responseData = await response.json();

         if (!response.ok) {
            throw new Error(responseData.error || `Erro ${response.status}`);
         }

         setSuccess(true);

         setTimeout(() => {
            resetForm();
            onClose();
            onSuccess?.();
         }, 2000);
      } catch (err) {
         const errorMessage =
            err instanceof Error ? err.message : 'Erro desconhecido';
         setErrors({ root: errorMessage });
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

   if (!isOpen) return null;
   // ================================================================================

   // ===== RENDERIZAÇÃO DO COMPONENTE =====
   return (
      <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center p-4 duration-300">
         {/* ===== OVERLAY ===== */}
         <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xl"
            onClick={handleClose}
         />
         {/* ========== */}

         {/* ===== CONTAINER ===== */}
         <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-4xl overflow-hidden rounded-2xl border-0 bg-white transition-all duration-500 ease-out">
            {/* ===== HEADER ===== */}
            <header className="relative bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 p-6 shadow-sm shadow-black">
               <section className="flex items-center justify-between">
                  <div className="flex items-center justify-between gap-6">
                     <div className="rounded-md border-none bg-white/10 p-3 shadow-md shadow-black">
                        <IoMdClock className="text-black" size={36} />
                     </div>

                     <div className="flex flex-col items-center justify-center">
                        <h1 className="text-2xl font-extrabold tracking-wider text-black select-none">
                           Editar OS
                        </h1>

                        <div className="rounded-full bg-black px-6 py-1">
                           <p className="text-center text-base font-extrabold tracking-widest text-white italic select-none">
                              OS - #{codOS}
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Botão fechar modal */}
                  <button
                     onClick={handleClose}
                     disabled={isLoading}
                     className="group cursor-pointer rounded-full bg-red-500/50 p-2 text-white transition-all select-none hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                     <IoClose size={24} />
                  </button>
               </section>
            </header>
            {/* ==================== */}

            {/* ===== CONTEÚDO ===== */}
            <main className="max-h-[calc(95vh-140px)] overflow-y-auto bg-gray-50 p-6">
               {/* Alerta de sucesso */}
               {success && (
                  <div className="mb-6 rounded-full border border-green-200 bg-green-600 px-6 py-2">
                     <div className="flex items-center gap-3">
                        <FaCheckCircle className="text-green-500" size={20} />

                        <p className="text-base font-semibold tracking-wider text-white select-none">
                           OS atualizada com sucesso!
                        </p>
                     </div>
                  </div>
               )}

               {/* Alerta de erro geral */}
               {errors.root && (
                  <div className="mb-6 rounded-full border border-red-200 bg-red-600 px-6 py-2">
                     <div className="flex items-center gap-3">
                        <FaExclamationTriangle
                           className="text-red-500"
                           size={20}
                        />

                        <p className="text-base font-semibold tracking-wider text-white select-none">
                           {errors.root}
                        </p>
                     </div>
                  </div>
               )}

               {/* ===== FORMULÁRIO ===== */}
               <section className="space-y-6">
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
                        className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-black shadow-sm shadow-black transition-all focus:border-blue-500 focus:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
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
                           <p className="text-sm font-semibold text-red-600">
                              {errors.dataInicioOS}
                           </p>
                        </div>
                     )}
                  </FormSection>

                  {/* Horários */}
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
                              className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-black shadow-sm shadow-black transition-all focus:border-blue-500 focus:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
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
                                 <p className="text-sm font-semibold text-red-600">
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
                              className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-black shadow-sm shadow-black transition-all focus:border-blue-500 focus:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
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
                                 <p className="text-sm font-semibold text-red-600">
                                    {errors.horaFimOS}
                                 </p>
                              </div>
                           )}
                        </div>
                     </div>
                  </FormSection>

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
                        className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-black shadow-sm shadow-black transition-all focus:border-blue-500 focus:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
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
                           <p className="text-sm font-semibold text-red-600">
                              {errors.observacaoOS}
                           </p>
                        </div>
                     )}
                     <div className="mt-1 flex items-center justify-between">
                        <p className="text-xs font-extrabold tracking-widest text-black italic select-none">
                           *Mínimo de 10 caracteres e máximo de 200.
                        </p>
                        <p
                           className={`text-xs font-extrabold tracking-widest italic select-none ${
                              formData.observacaoOS.length > 200
                                 ? 'text-red-600'
                                 : 'text-black'
                           }`}
                        >
                           {formData.observacaoOS.length}/200
                        </p>
                     </div>
                  </FormSection>
                  {/* ==================== */}

                  {/* ===== BOTÕES DE AÇÃO ===== */}
                  <section className="flex items-center justify-end gap-6">
                     {/* Botão cancelar */}
                     <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="cursor-pointer rounded-xl border-none bg-red-500 px-6 py-2 text-lg font-extrabold text-white shadow-md shadow-black transition-all select-none hover:scale-105 hover:bg-red-900 hover:shadow-md hover:shadow-black active:scale-95"
                     >
                        Cancelar
                     </button>

                     {/* Botão de atualizar */}
                     <button
                        onClick={handleSubmit}
                        disabled={isLoading || !isFormValid()}
                        className={`cursor-pointer rounded-xl border-none bg-blue-500 px-6 py-2 text-lg font-extrabold text-white transition-all select-none active:scale-95 ${
                           isLoading || !isFormValid()
                              ? 'disabled:cursor-not-allowed disabled:opacity-50'
                              : 'hover:scale-105 hover:bg-blue-900 hover:shadow-md hover:shadow-black'
                        }`}
                     >
                        {isLoading ? (
                           <>
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              <span>Salvando...</span>
                           </>
                        ) : (
                           <>Atualizar</>
                        )}
                     </button>
                  </section>
               </section>
            </main>
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
