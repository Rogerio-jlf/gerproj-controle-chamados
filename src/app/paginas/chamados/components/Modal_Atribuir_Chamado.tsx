'use client';

import { useState } from 'react';
import { z } from 'zod';
// ================================================================================
import { useClientes } from '../../../../hooks/useClientes';
import { useEmailAtribuirChamados } from '../../../../hooks/useEmailAtribuirChamados';
import { useRecursos } from '../../../../hooks/useRecursos';
import { useAuth } from '../../../../contexts/Auth_Context';
import { TabelaChamadosProps } from '../../../../types/types';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
// ================================================================================
import {
   FaCalendarAlt,
   FaUser,
   FaExclamationTriangle,
   FaCheckCircle,
   FaFileAlt,
   FaTags,
} from 'react-icons/fa';
import {
   IoDocumentText,
   IoMail,
   IoClose,
   IoSend,
   IoTime,
   IoPersonCircle,
} from 'react-icons/io5';
// ================================================================================

// Schema de validação com Zod
const formSchema = z
   .object({
      cliente: z
         .string()
         .min(1, 'Cliente é obrigatório')
         .refine(
            val => !isNaN(Number(val)) && Number(val) > 0,
            'Selecione um cliente válido'
         ),

      recurso: z
         .string()
         .min(1, 'Recurso é obrigatório')
         .refine(
            val => !isNaN(Number(val)) && Number(val) > 0,
            'Selecione um recurso válido'
         ),

      enviarEmailCliente: z.boolean().optional().default(false),
      enviarEmailRecurso: z.boolean().optional().default(false),
   })
   .refine(
      data => data.enviarEmailCliente || data.enviarEmailRecurso, // Permite não selecionar emails, mas pelo menos um campo deve estar correto
      {
         message: 'Pelo menos um método de notificação deve ser selecionado',
         path: ['root'], // Erro geral
      }
   );

type FormData = z.infer<typeof formSchema>;
type FormErrors = Partial<Record<keyof FormData | 'root', string>>;
// ================================================================================

interface ModalChamadoProps {
   isOpen: boolean;
   onClose: () => void;
   chamado: TabelaChamadosProps | null;
}
// ================================================================================

export default function ModalAtribuirChamado({
   isOpen,
   onClose,
   chamado,
}: ModalChamadoProps) {
   const [isLoading, setIsLoading] = useState(false);
   const [showForm, setShowForm] = useState(false);
   const [errors, setErrors] = useState<FormErrors>({});
   const [success, setSuccess] = useState(false);
   const [formData, setFormData] = useState<FormData>({
      cliente: '',
      recurso: '',
      enviarEmailCliente: false,
      enviarEmailRecurso: false,
   });
   // ================================================================================

   const { isAdmin } = useAuth();
   const { data: clientes = [], isLoading: loadingClientes } = useClientes();
   const { data: recursos = [], isLoading: loadingRecursos } = useRecursos();
   const { mutate, isPending } = useEmailAtribuirChamados();
   // ================================================================================

   // Validação em tempo real
   const validateField = (name: keyof FormData, value: string | boolean) => {
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

   // Validação completa do formulário
   const validateForm = (): boolean => {
      try {
         formSchema.parse(formData);
         setErrors({});
         return true;
      } catch (error) {
         if (error instanceof z.ZodError) {
            const newErrors: FormErrors = {};
            error.issues.forEach(err => {
               const path = err.path[0] as keyof FormData | 'root';
               newErrors[path] = err.message;
            });
            setErrors(newErrors);
         }
         return false;
      }
   };

   // Função para lidar com mudanças nos inputs
   const handleInputChange = (
      name: keyof FormData,
      value: string | boolean
   ) => {
      setFormData(prev => ({
         ...prev,
         [name]: value,
      }));

      // Limpa erro do campo específico quando usuário muda o valor
      if (errors[name]) {
         setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name]; // Remove a chave em vez de definir como undefined
            return newErrors;
         });
      }

      // Validação em tempo real com delay
      if (typeof value === 'string' && value.length > 0) {
         setTimeout(() => validateField(name, value), 300);
      } else if (typeof value === 'boolean') {
         validateField(name, value);
      }
   };
   // ================================================================================

   // ================================================================================
   const handleClose = () => {
      if (!isLoading) {
         setShowForm(false);
         resetForm();
         setErrors({});
         setSuccess(false);
         onClose();
      }
   };
   // ================================================================================

   // ================================================================================
   const handleSubmitForm = async () => {
      if (!chamado) return;

      setIsLoading(true);
      setErrors({});

      try {
         // Validação com Zod
         if (!validateForm()) {
            setIsLoading(false);
            return;
         }

         mutate(
            {
               codChamado: chamado.COD_CHAMADO,
               codCliente: Number(formData.cliente),
               codRecurso: Number(formData.recurso),
               enviarEmailCliente: formData.enviarEmailCliente,
               enviarEmailRecurso: formData.enviarEmailRecurso,
            },
            {
               onSuccess: () => {
                  setSuccess(true);
                  setTimeout(() => {
                     setShowForm(false);
                     resetForm();
                     setSuccess(false);
                     onClose();
                  }, 2000);
               },
               onError: (err: unknown) => {
                  console.error('Erro ao configurar notificação:', err);
                  setErrors({ root: 'Erro ao enviar notificação' });
               },
            }
         );
      } catch (err) {
         const errorMessage =
            err instanceof Error ? err.message : 'Erro desconhecido';
         setErrors({ root: errorMessage });
      } finally {
         setIsLoading(false);
      }
   };
   // ================================================================================

   // ================================================================================
   const resetForm = () => {
      setFormData({
         cliente: '',
         recurso: '',
         enviarEmailCliente: false,
         enviarEmailRecurso: false,
      });
      setErrors({});
      setSuccess(false);
      setShowForm(false);
   };
   // ================================================================================

   // ================================================================================
   const formateDateISO = (dataISO: string | null) => {
      if (!dataISO) return '-';
      const data = new Date(dataISO);
      if (isNaN(data.getTime())) return '-';

      return data.toLocaleDateString('pt-BR');
   };
   // ================================================================================

   // ================================================================================
   const formateTime = (horario: number | string) => {
      const horarioFormatado = horario.toString().padStart(4, '0');
      const horas = horarioFormatado.slice(0, 2);
      const minutos = horarioFormatado.slice(2, 4);
      return `${horas}:${minutos}`;
   };
   // ================================================================================

   // ================================================================================
   const getStyleStatus = (status: string | undefined) => {
      switch (status?.toUpperCase()) {
         case 'NAO FINALIZADO':
            return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border border-yellow-300 shadow-yellow-500/30';

         case 'EM ATENDIMENTO':
            return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-300 shadow-blue-500/30';

         case 'FINALIZADO':
            return 'bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-300 shadow-green-500/30';

         case 'NAO INICIADO':
            return 'bg-gradient-to-r from-red-500 to-red-600 text-white border border-red-300 shadow-red-500/30';

         case 'STANDBY':
            return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border border-orange-300 shadow-orange-500/30';

         case 'ATRIBUIDO':
            return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-300 shadow-blue-500/30';

         case 'AGUARDANDO VALIDACAO':
            return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border border-purple-300 shadow-purple-500/30';

         default:
            return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border border-gray-300 shadow-gray-500/30';
      }
   };
   // ================================================================================

   const getPriorityStyle = (priority: string | number | undefined | null) => {
      if (priority === undefined || priority === null) {
         return 'bg-gray-100 text-gray-800 border border-gray-200';
      }

      const priorityStr = String(priority).toUpperCase();
      switch (priorityStr) {
         case 'ALTA':
            return 'bg-red-100 text-red-800 border border-red-200';
         case 'MÉDIA':
         case 'MEDIA':
            return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
         case 'BAIXA':
            return 'bg-green-100 text-green-800 border border-green-200';
         default:
            return 'bg-gray-100 text-gray-800 border border-gray-200';
      }
   };

   // Verifica se o formulário é válido
   const isFormValid = () => {
      // Filtra apenas erros que não são undefined
      const realErrors = Object.fromEntries(
         Object.entries(errors).filter(([key, value]) => value !== undefined)
      );

      const hasNoErrors = Object.keys(realErrors).length === 0;
      const hasCliente = formData.cliente !== '';
      const hasRecurso = formData.recurso !== '';
      const hasEmailSelected =
         formData.enviarEmailCliente || formData.enviarEmailRecurso;

      const isValid =
         hasNoErrors && hasCliente && hasRecurso && hasEmailSelected;

      return isValid;
   };

   if (!isOpen || !chamado) return null;
   // ================================================================================

   return (
      <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center p-4 duration-300">
         {/* Overlay */}
         <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xl"
            onClick={handleClose}
         />

         {/* ===== MODAL CONTAINER ===== */}
         <div
            className={`animate-in slide-in-from-bottom-4 relative z-10 max-h-[95vh] overflow-hidden rounded-2xl border border-black bg-white transition-all duration-500 ease-out ${
               showForm ? 'w-full max-w-[1600px]' : 'w-full max-w-[1000px]'
            }`}
         >
            {/* ===== HEADER ===== */}
            <header className="relative bg-yellow-600 p-6">
               <section className="flex items-center justify-between">
                  <div className="flex items-center justify-between gap-6">
                     <div className="rounded-2xl border border-black/50 bg-white/10 p-4">
                        {/* Ícone */}
                        <FaFileAlt className="text-black" size={40} />
                     </div>
                     {/* ===== */}

                     <div className="flex flex-col items-start justify-center">
                        {/* Título */}
                        <h1 className="text-2xl font-bold tracking-wider text-black select-none">
                           Dados do Chamado
                        </h1>

                        <div className="inline-block rounded-full bg-black px-8 py-1">
                           {/* Código do chamado */}
                           <p className="text-base font-extrabold tracking-widest text-white italic select-none">
                              Chamado - {chamado.COD_CHAMADO}
                           </p>
                        </div>
                     </div>
                  </div>
                  {/* ===== */}

                  <button
                     onClick={handleClose}
                     disabled={isLoading}
                     className="group cursor-pointer rounded-full bg-red-900 p-2 text-white transition-all select-none hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95"
                  >
                     <IoClose size={24} />
                  </button>
               </section>
            </header>
            {/* ===== */}

            {/* ===== CONTEÚDO ===== */}
            <main className="flex max-h-[calc(95vh-140px)] overflow-hidden">
               {/* ===== DADOS DO CHAMADO ===== */}
               <section
                  className={`overflow-y-auto bg-gray-50 transition-all ${
                     showForm ? 'w-3/5 border-r-2 border-red-500' : 'w-full'
                  }`}
               >
                  <div className="p-6">
                     {/* Alerta de sucesso */}
                     {success && (
                        <div className="mb-6 rounded-full border border-green-200 bg-green-600 px-6 py-2">
                           <div className="flex items-center gap-3">
                              <FaCheckCircle
                                 className="text-green-500"
                                 size={20}
                              />
                              <p className="text-base font-semibold tracking-wider text-white select-none">
                                 Chamado atribuído com sucesso!
                              </p>
                           </div>
                        </div>
                     )}
                     {/* ===== */}

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
                     {/* ===== */}

                     {/* ===== CARDS DADOS INFORMATIVOS ===== */}
                     <div className="mb-8 grid grid-cols-3 gap-6">
                        {/* Card Data e hora */}
                        <div className="group overflow-hidden rounded-2xl bg-white shadow-md shadow-black transition-all">
                           <div className="border-b-2 border-black/20 bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
                              <div className="flex items-center gap-3">
                                 {/* Ícone */}
                                 <FaCalendarAlt
                                    className="text-white"
                                    size={20}
                                 />
                                 {/* Título */}
                                 <h3 className="text-lg font-extrabold tracking-widest text-white select-none">
                                    Data & Hora
                                 </h3>
                              </div>
                           </div>

                           <div className="p-6">
                              <div className="space-y-3">
                                 <div className="flex flex-col">
                                    {/* Subtítulo */}
                                    <p className="text-sm font-bold tracking-widest text-black select-none">
                                       Data:
                                    </p>
                                    {/* Data */}
                                    <p className="text-lg font-extrabold tracking-widest text-black italic select-none">
                                       {formateDateISO(chamado.DATA_CHAMADO)}
                                    </p>
                                 </div>

                                 <div className="flex flex-col">
                                    {/* Subtítulo */}
                                    <p className="text-sm font-bold tracking-widest text-black select-none">
                                       Horário:
                                    </p>
                                    {/* Hora */}
                                    <p className="text-lg font-extrabold tracking-widest text-black italic select-none">
                                       {chamado.HORA_CHAMADO !== undefined &&
                                       chamado.HORA_CHAMADO !== null
                                          ? formateTime(chamado.HORA_CHAMADO)
                                          : '-'}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>
                        {/* ===== */}

                        {/* Card Status */}
                        <div className="group overflow-hidden rounded-2xl bg-white shadow-md shadow-black transition-all">
                           <div className="border-b-2 border-black/20 bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
                              <div className="flex items-center gap-3">
                                 {/* Ícone */}
                                 <IoTime className="text-white" size={20} />
                                 {/* Título */}
                                 <h3 className="text-lg font-extrabold tracking-widest text-white select-none">
                                    Status
                                 </h3>
                              </div>
                           </div>

                           <div className="p-6">
                              <div className="space-y-3">
                                 <div className="flex flex-col">
                                    {/* Subtítulo */}
                                    <p className="text-sm font-bold tracking-widest text-black select-none">
                                       Status:
                                    </p>
                                    {/* Status */}
                                    <p
                                       className={`rounded-full px-3 py-1 text-lg font-extrabold tracking-widest italic select-none ${getStyleStatus(chamado.STATUS_CHAMADO)}`}
                                    >
                                       {chamado.STATUS_CHAMADO ?? '-'}
                                    </p>
                                 </div>

                                 <div className="flex flex-col">
                                    {/* Subtítulo */}
                                    <p className="text-sm font-bold tracking-widest text-black select-none">
                                       Prioridade:
                                    </p>
                                    {/* Prioridade */}
                                    <p className="rounded-full px-4 py-2 text-lg font-extrabold tracking-widest italic select-none">
                                       {chamado.PRIOR_CHAMADO ?? '-'}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>
                        {/* ===== */}

                        {/* Card Identificação */}
                        <div className="group overflow-hidden rounded-2xl bg-white shadow-md shadow-black transition-all">
                           <div className="border-b-2 border-black/20 bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
                              <div className="flex items-center gap-3">
                                 {/* Ícone */}
                                 <FaTags className="text-white" size={20} />
                                 {/* Título */}
                                 <h3 className="text-lg font-extrabold tracking-widest text-white select-none">
                                    Identificação
                                 </h3>
                              </div>
                           </div>

                           <div className="p-6">
                              <div className="space-y-3">
                                 <div className="flex flex-col">
                                    {/* Subtítulo */}
                                    <p className="text-sm font-bold tracking-widest text-black select-none">
                                       Cód. Tarefa:
                                    </p>
                                    {/* Data */}
                                    <p className="text-lg font-extrabold tracking-widest text-black italic select-none">
                                       {chamado.CODTRF_CHAMADO ?? '-'}
                                    </p>
                                 </div>

                                 <div className="flex flex-col">
                                    {/* Subtítulo */}
                                    <p className="text-sm font-bold tracking-widest text-black select-none">
                                       Classificação:
                                    </p>
                                    {/* Hora */}
                                    <p className="text-lg font-extrabold tracking-widest text-black italic select-none">
                                       {chamado.COD_CLASSIFICACAO ?? '-'}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Card Cliente */}
                        <div className="group overflow-hidden rounded-2xl bg-white shadow-md shadow-black transition-all">
                           <div className="border-b-2 border-black/20 bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
                              <div className="flex items-center gap-3">
                                 {/* Ícone */}
                                 <IoPersonCircle
                                    className="text-white"
                                    size={20}
                                 />
                                 <h3 className="text-lg font-extrabold tracking-widest text-white select-none">
                                    Cliente
                                 </h3>
                              </div>
                           </div>

                           <div className="p-6">
                              <div className="space-y-3">
                                 <div className="flex flex-col">
                                    {/* Subtítulo */}
                                    <p className="text-sm font-bold tracking-widest text-black select-none">
                                       Nome:
                                    </p>
                                    {/* Data */}
                                    <p className="text-lg font-extrabold tracking-widest text-black italic select-none">
                                       {chamado.NOME_CLIENTE ?? '-'}
                                    </p>
                                 </div>

                                 <div className="flex flex-col">
                                    {/* Subtítulo */}
                                    <p className="text-sm font-bold tracking-widest text-black select-none">
                                       Email:
                                    </p>
                                    {/* Hora */}
                                    <p className="text-lg font-extrabold tracking-widest text-black italic select-none">
                                       {chamado.EMAIL_CHAMADO ?? '-'}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>
                        {/* ===== */}

                        {/* Card Recurso */}
                        <div className="group overflow-hidden rounded-2xl bg-white shadow-md shadow-black transition-all">
                           <div className="border-b-2 border-black/20 bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
                              <div className="flex items-center gap-3">
                                 {/* Ícone */}
                                 <FaUser className="text-white" size={20} />
                                 {/* Título */}
                                 <h3 className="text-lg font-extrabold tracking-widest text-white select-none">
                                    Recurso
                                 </h3>
                              </div>
                           </div>

                           <div className="p-6">
                              <div className="space-y-3">
                                 <div className="flex flex-col">
                                    {/* Subtítulo */}
                                    <p className="text-sm font-bold tracking-widest text-black select-none">
                                       Responsável:
                                    </p>
                                    {/* Data */}
                                    <p className="text-lg font-extrabold tracking-widest text-black italic select-none">
                                       {chamado.NOME_RECURSO ?? '-'}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Card Assunto - Full width */}
                        <div className="group overflow-hidden rounded-2xl bg-white shadow-md shadow-black transition-all">
                           <div className="border-b-2 border-black/20 bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
                              <div className="flex items-center gap-3">
                                 {/* Ícone */}
                                 <IoDocumentText size={20} />
                                 {/* Título */}
                                 <h3 className="text-lg font-extrabold tracking-widest text-white select-none">
                                    Descrição
                                 </h3>
                              </div>
                           </div>

                           <div className="p-6">
                              <div className="space-y-3">
                                 <div className="flex flex-col">
                                    {/* Subtítulo */}
                                    <p className="text-sm font-bold tracking-widest text-black select-none">
                                       Assunto:
                                    </p>
                                    {/* Data */}
                                    <p className="text-lg font-extrabold tracking-widest text-black italic select-none">
                                       {chamado.ASSUNTO_CHAMADO ?? '-'}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                     {/* ===== */}

                     {/* Botão atribuir chamado */}
                     {!showForm && isAdmin && (
                        <div className="mt-2 flex justify-end">
                           <button
                              onClick={() => setShowForm(true)}
                              className="flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-6 py-2 text-lg font-extrabold text-white transition-all select-none hover:scale-105 hover:bg-blue-900 hover:shadow-lg hover:shadow-black active:scale-95"
                           >
                              <IoSend className="text-white" size={20} />
                              Atribuir Chamado
                           </button>
                        </div>
                     )}
                  </div>
               </section>
               {/* ===== */}

               {/* ===== FORMULÁRIOS =====*/}
               {showForm && isAdmin && (
                  <section className="w-2/5 overflow-y-auto bg-gray-50">
                     <div className="p-6">
                        {/* ===== ATRIBUIR CHAMADO ===== */}
                        <FormSection
                           title="Atribuir Chamado"
                           icon={<IoSend className="text-white" size={20} />}
                           error={errors.cliente || errors.recurso}
                        >
                           <div className="space-y-6">
                              {/* Select Cliente */}
                              <div>
                                 <label className="mb-1 block text-base font-semibold tracking-wider text-gray-800 select-none">
                                    Cliente
                                 </label>
                                 {/* ===== */}
                                 <select
                                    value={formData.cliente}
                                    onChange={e =>
                                       handleInputChange(
                                          'cliente',
                                          e.target.value
                                       )
                                    }
                                    disabled={loadingClientes || isLoading}
                                    required
                                    className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-gray-800 shadow-sm shadow-black transition-all focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                                       errors.cliente
                                          ? 'border-red-500 ring-2 ring-red-200'
                                          : ''
                                    }`}
                                 >
                                    <option value="">
                                       {loadingClientes
                                          ? 'Carregando...'
                                          : 'Selecione um cliente'}
                                    </option>
                                    {clientes.map(
                                       (cliente: {
                                          cod_cliente: number;
                                          nome_cliente: string;
                                       }) => (
                                          <option
                                             key={cliente.cod_cliente}
                                             value={cliente.cod_cliente}
                                          >
                                             {corrigirTextoCorrompido(
                                                cliente.nome_cliente
                                             )}
                                          </option>
                                       )
                                    )}
                                 </select>
                                 {errors.cliente && (
                                    <p className="mt-1 text-sm font-semibold text-red-600">
                                       {errors.cliente}
                                    </p>
                                 )}
                              </div>
                              {/* ===== */}

                              {/* Select Recurso */}
                              <div>
                                 <label className="mb-1 block text-base font-semibold tracking-wider text-gray-800 select-none">
                                    Recurso
                                 </label>
                                 {/* ===== */}
                                 <select
                                    value={formData.recurso}
                                    onChange={e =>
                                       handleInputChange(
                                          'recurso',
                                          e.target.value
                                       )
                                    }
                                    disabled={loadingRecursos || isLoading}
                                    required
                                    className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-gray-800 shadow-sm shadow-black transition-all focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                                       errors.recurso
                                          ? 'border-red-500 ring-2 ring-red-200'
                                          : ''
                                    }`}
                                 >
                                    <option value="">
                                       {loadingRecursos
                                          ? 'Carregando...'
                                          : 'Selecione um recurso'}
                                    </option>
                                    {recursos.map(
                                       (recurso: {
                                          cod_recurso: number;
                                          nome_recurso: string;
                                       }) => (
                                          <option
                                             key={recurso.cod_recurso}
                                             value={recurso.cod_recurso}
                                          >
                                             {corrigirTextoCorrompido(
                                                recurso.nome_recurso
                                             )}
                                          </option>
                                       )
                                    )}
                                 </select>
                                 {errors.recurso && (
                                    <p className="mt-1 text-sm font-semibold text-red-600">
                                       {errors.recurso}
                                    </p>
                                 )}
                              </div>
                           </div>
                        </FormSection>
                        {/* ===== */}

                        {/* ===== NOTIFICAÇÃO ===== */}
                        <FormSection
                           title="Notificações por Email"
                           icon={<IoMail className="text-white" size={20} />}
                        >
                           <div className="space-y-4">
                              <CheckboxItem
                                 checked={formData.enviarEmailCliente}
                                 onChange={checked =>
                                    handleInputChange(
                                       'enviarEmailCliente',
                                       checked
                                    )
                                 }
                                 label="Enviar email para o cliente"
                                 description="O cliente receberá uma notificação sobre a atribuição"
                              />

                              <CheckboxItem
                                 checked={formData.enviarEmailRecurso}
                                 onChange={checked =>
                                    handleInputChange(
                                       'enviarEmailRecurso',
                                       checked
                                    )
                                 }
                                 label="Enviar email para o recurso"
                                 description="O recurso receberá uma notificação sobre o chamado"
                              />
                           </div>
                        </FormSection>
                        {/* ===== */}

                        {/* ===== BOTÕES DE AÇÃO ===== */}
                        <div className="flex items-center justify-end gap-6 border-t-2 border-red-500 pt-4">
                           {/* Botão cancelar */}
                           <button
                              onClick={resetForm}
                              disabled={isLoading || isPending}
                              className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-lg font-extrabold text-white transition-all select-none hover:scale-105 hover:bg-red-900 hover:shadow-lg hover:shadow-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              Cancelar
                           </button>
                           {/* ====== */}

                           {/* Botão salvar */}
                           <button
                              onClick={handleSubmitForm}
                              disabled={
                                 isLoading || isPending || !isFormValid()
                              }
                              className={`flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-lg font-extrabold text-white transition-all select-none active:scale-95 ${
                                 isLoading || isPending || !isFormValid()
                                    ? 'disabled:cursor-not-allowed disabled:opacity-50'
                                    : 'hover:scale-105 hover:bg-blue-900 hover:shadow-lg hover:shadow-black'
                              }`}
                           >
                              {isLoading || isPending ? (
                                 <>
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    <span>Atribuindo...</span>
                                 </>
                              ) : (
                                 <>
                                    <IoSend size={18} />
                                    Salvar Atribuição
                                 </>
                              )}
                           </button>
                        </div>
                     </div>
                  </section>
               )}
            </main>
         </div>
      </div>
   );
}
// ================================================================================

// ===== FORMULÁRIOS =====
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
      className={`mb-6 overflow-hidden rounded-md bg-white shadow-sm shadow-black ${
         error ? 'ring-2 ring-red-200' : ''
      }`}
   >
      <div
         className={`border-b border-gray-300 px-4 py-2 ${
            error ? 'bg-red-600' : 'bg-slate-900'
         }`}
      >
         <h3 className="flex items-center gap-3 text-lg font-bold tracking-wider text-white select-none">
            {icon}
            {title}
            {error && <span className="ml-auto text-sm">⚠️</span>}
         </h3>
      </div>
      <div className="p-6">
         {children}
         {error && (
            <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>
         )}
      </div>
   </div>
);
// ================================================================================

// ===== CHECKBOX =====
const CheckboxItem = ({
   checked,
   onChange,
   label,
   description,
}: {
   checked: boolean;
   onChange: (checked: boolean) => void;
   label: string;
   description: string;
}) => (
   <div className="overflow-hidden rounded-md bg-white shadow-sm shadow-black">
      <div className="p-4">
         <label className="flex cursor-pointer items-start gap-4">
            <input
               type="checkbox"
               checked={checked}
               onChange={e => onChange(e.target.checked)}
               className="mt-3 h-5 w-5 cursor-pointer rounded-md shadow-sm shadow-black focus:outline-none"
            />
            {/* ===== */}

            <div className="flex items-center gap-3">
               <IoMail className="text-blue-600" size={20} />

               <div>
                  <span className="block text-base font-semibold tracking-wider text-black select-none">
                     {label}
                  </span>
                  <span className="text-sm font-medium tracking-wider text-gray-700 italic select-none">
                     {description}
                  </span>
               </div>
            </div>
         </label>
      </div>
   </div>
);
// ================================================================================
