'use client';

import { useState } from 'react';
// ================================================================================
import { useClientes } from '../../../../hooks/useClientes';
import { useEmailAtribuirCahamados } from '../../../../hooks/useEmailAtribuirChamados';
import { useRecursos } from '../../../../hooks/useRecursos';
import { useAuth } from '../../../../contexts/Auth_Context';
import { ChamadosProps } from './Colunas_Tabela_Chamados';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
// ================================================================================
import {
   FaCalendarAlt,
   FaUser,
   FaClock,
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
// ================================================================================

interface ModalChamadoProps {
   isOpen: boolean;
   onClose: () => void;
   chamado: ChamadosProps | null;
}

interface FormularioData {
   cliente: string;
   recurso: string;
   enviarEmailCliente: boolean;
   enviarEmailRecurso: boolean;
}
// ================================================================================

export default function ModalAtribuirChamado({
   isOpen,
   onClose,
   chamado,
}: ModalChamadoProps) {
   const [isLoading, setIsLoading] = useState(false);
   const [showForm, setShowForm] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState(false);
   const [formData, setFormData] = useState<FormularioData>({
      cliente: '',
      recurso: '',
      enviarEmailCliente: false,
      enviarEmailRecurso: false,
   });
   // ================================================================================

   const { isAdmin } = useAuth();
   const { data: clientes = [], isLoading: loadingClientes } = useClientes();
   const { data: recursos = [], isLoading: loadingRecursos } = useRecursos();
   const { mutate, isPending } = useEmailAtribuirCahamados();
   // ================================================================================

   // ================================================================================
   const handleClose = () => {
      if (!isLoading) {
         setShowForm(false);
         resetForm();
         setError(null);
         setSuccess(false);
         onClose();
      }
   };
   // ================================================================================

   // ================================================================================
   const handleSubmitForm = async () => {
      if (!chamado) return;

      setIsLoading(true);
      setError(null);

      try {
         // Validações básicas
         if (!formData.cliente) {
            throw new Error('Cliente é obrigatório');
         }
         if (!formData.recurso) {
            throw new Error('Recurso é obrigatório');
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
                  console.log('Notificação configurada com sucesso');
                  setSuccess(true);
                  setTimeout(() => {
                     setShowForm(false);
                     resetForm();
                     setSuccess(false);
                     onClose();
                  }, 2000);
               },
               onError: err => {
                  console.error('Erro ao configurar notificação:', err);
                  setError('Erro ao enviar notificação');
               },
            }
         );
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Erro desconhecido');
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
      setError(null);
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

                     {/* Alerta de erro */}
                     {error && (
                        <div className="mb-6 rounded-full border border-red-200 bg-red-600 px-6 py-2">
                           <div className="flex items-center gap-3">
                              <FaExclamationTriangle
                                 className="text-red-500"
                                 size={20}
                              />
                              <p className="text-base font-semibold tracking-wider text-white select-none">
                                 {error}
                              </p>
                           </div>
                        </div>
                     )}
                     {/* ===== */}

                     {/* Cards de informação em grid moderno */}
                     <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Card Data e Horário */}
                        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                           <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
                              <div className="flex items-center gap-3 text-white">
                                 <FaCalendarAlt size={20} />
                                 <h3 className="text-lg font-bold">
                                    Data & Horário
                                 </h3>
                              </div>
                           </div>

                           <div className="p-6">
                              <div className="space-y-3">
                                 <div className="flex flex-col">
                                    <span className="text-sm text-gray-600">
                                       Data:
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                       {formateDateISO(chamado.DATA_CHAMADO)}
                                    </span>
                                 </div>

                                 <div className="flex flex-col">
                                    <span className="text-sm text-gray-600">
                                       Horário:
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                       {chamado.HORA_CHAMADO !== undefined &&
                                       chamado.HORA_CHAMADO !== null
                                          ? formateTime(chamado.HORA_CHAMADO)
                                          : '-'}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Card Status */}
                        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                           <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4">
                              <div className="flex items-center gap-3 text-white">
                                 <IoTime size={20} />
                                 <h3 className="text-lg font-bold">Status</h3>
                              </div>
                           </div>
                           <div className="p-6">
                              <div
                                 className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-bold ${getStyleStatus(chamado.STATUS_CHAMADO)}`}
                              >
                                 <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-white"></div>
                                 {chamado.STATUS_CHAMADO !== undefined &&
                                 chamado.STATUS_CHAMADO !== null
                                    ? String(chamado.STATUS_CHAMADO)
                                    : 'Status não definido'}
                              </div>
                              <div className="mt-4">
                                 <span className="text-sm text-gray-600">
                                    Prioridade:
                                 </span>
                                 <div className="mt-1">
                                    <span
                                       className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getPriorityStyle(chamado.PRIOR_CHAMADO)}`}
                                    >
                                       {chamado.PRIOR_CHAMADO !== undefined &&
                                       chamado.PRIOR_CHAMADO !== null
                                          ? String(chamado.PRIOR_CHAMADO)
                                          : 'Não definida'}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Card Identificação */}
                        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                           <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4">
                              <div className="flex items-center gap-3 text-white">
                                 <FaTags size={20} />
                                 <h3 className="text-lg font-bold">
                                    Identificação
                                 </h3>
                              </div>
                           </div>
                           <div className="space-y-3 p-6">
                              <div>
                                 <span className="text-sm text-gray-600">
                                    Cód. Tarefa:
                                 </span>
                                 <p className="font-mono font-bold text-emerald-600">
                                    {chamado.CODTRF_CHAMADO !== undefined &&
                                    chamado.CODTRF_CHAMADO !== null
                                       ? String(chamado.CODTRF_CHAMADO)
                                       : '-'}
                                 </p>
                              </div>
                              <div>
                                 <span className="text-sm text-gray-600">
                                    Classificação:
                                 </span>
                                 <p className="font-mono font-bold text-emerald-600">
                                    {chamado.COD_CLASSIFICACAO !== undefined &&
                                    chamado.COD_CLASSIFICACAO !== null
                                       ? String(chamado.COD_CLASSIFICACAO)
                                       : '-'}
                                 </p>
                              </div>
                           </div>
                        </div>

                        {/* Card Cliente */}
                        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                           <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
                              <div className="flex items-center gap-3 text-white">
                                 <IoPersonCircle size={20} />
                                 <h3 className="text-lg font-bold">Cliente</h3>
                              </div>
                           </div>
                           <div className="space-y-3 p-6">
                              <div>
                                 <span className="text-sm text-gray-600">
                                    Nome:
                                 </span>
                                 <p className="font-semibold text-gray-900">
                                    {chamado.NOME_CLIENTE !== undefined &&
                                    chamado.NOME_CLIENTE !== null
                                       ? String(chamado.NOME_CLIENTE)
                                       : '-'}
                                 </p>
                              </div>
                              <div>
                                 <span className="text-sm text-gray-600">
                                    Email:
                                 </span>
                                 <p className="font-mono text-sm text-blue-600">
                                    {chamado.EMAIL_CHAMADO !== undefined &&
                                    chamado.EMAIL_CHAMADO !== null
                                       ? String(chamado.EMAIL_CHAMADO)
                                       : '-'}
                                 </p>
                              </div>
                           </div>
                        </div>

                        {/* Card Recurso */}
                        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                           <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-4">
                              <div className="flex items-center gap-3 text-white">
                                 <FaUser size={20} />
                                 <h3 className="text-lg font-bold">Recurso</h3>
                              </div>
                           </div>
                           <div className="p-6">
                              <div>
                                 <span className="text-sm text-gray-600">
                                    Responsável:
                                 </span>
                                 <p className="font-semibold text-gray-900">
                                    {chamado.NOME_RECURSO !== undefined &&
                                    chamado.NOME_RECURSO !== null &&
                                    chamado.NOME_RECURSO !== ''
                                       ? String(chamado.NOME_RECURSO)
                                       : 'Não atribuído'}
                                 </p>
                              </div>
                              {(!chamado.NOME_RECURSO ||
                                 chamado.NOME_RECURSO === '') && (
                                 <div className="mt-3">
                                    <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                                       <div className="mr-2 h-2 w-2 rounded-full bg-amber-500"></div>
                                       Pendente atribuição
                                    </span>
                                 </div>
                              )}
                           </div>
                        </div>

                        {/* Card Assunto - Full width */}
                        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:col-span-2 lg:col-span-1">
                           <div className="bg-gradient-to-r from-slate-500 to-gray-600 p-4">
                              <div className="flex items-center gap-3 text-white">
                                 <IoDocumentText size={20} />
                                 <h3 className="text-lg font-bold">
                                    Descrição
                                 </h3>
                              </div>
                           </div>
                           <div className="p-6">
                              <p className="leading-relaxed text-gray-900">
                                 {chamado.ASSUNTO_CHAMADO !== undefined &&
                                 chamado.ASSUNTO_CHAMADO !== null
                                    ? String(chamado.ASSUNTO_CHAMADO)
                                    : 'Assunto não especificado'}
                              </p>
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
                                       setFormData({
                                          ...formData,
                                          cliente: e.target.value,
                                       })
                                    }
                                    disabled={loadingClientes || isLoading}
                                    required
                                    className="w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-gray-800 shadow-sm shadow-black transition-all focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
                                       setFormData({
                                          ...formData,
                                          recurso: e.target.value,
                                       })
                                    }
                                    disabled={loadingRecursos || isLoading}
                                    required
                                    className="w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-gray-800 shadow-sm shadow-black transition-all focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
                                    setFormData({
                                       ...formData,
                                       enviarEmailCliente: checked,
                                    })
                                 }
                                 label="Enviar email para o cliente"
                                 description="O cliente receberá uma notificação sobre a atribuição"
                              />

                              <CheckboxItem
                                 checked={formData.enviarEmailRecurso}
                                 onChange={checked =>
                                    setFormData({
                                       ...formData,
                                       enviarEmailRecurso: checked,
                                    })
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
                                 isLoading ||
                                 isPending ||
                                 !formData.cliente ||
                                 !formData.recurso
                              }
                              className="flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-lg font-extrabold text-white transition-all select-none hover:scale-105 hover:bg-blue-900 hover:shadow-lg hover:shadow-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
}: {
   title: string;
   icon: React.ReactNode;
   children: React.ReactNode;
}) => (
   <div className="mb-6 overflow-hidden rounded-md bg-white shadow-sm shadow-black">
      <div className="border-b border-gray-300 bg-slate-900 px-4 py-2">
         <h3 className="flex items-center gap-3 text-lg font-bold tracking-wider text-white select-none">
            {icon}
            {title}
         </h3>
      </div>
      <div className="p-6">{children}</div>
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
