/* eslint-disable react-hooks/exhaustive-deps */
// IMPORTS
import { z } from 'zod';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect, useMemo, useCallback } from 'react';

// COMPONENTS
import {
   DropdownRecomendacao,
   DropdownCliente,
} from '../Dropdown_Recomendacao_Cliente';
import { LoadingButton } from '../../../../../components/Loading';
import { ToastCustom } from '../../../../../components/Toast_Custom';

// HOOKS
import { useEnviarEmailWhatsapp } from '../../../../../hooks/useEnviarEmailWhatsapp';

// TYPES
import { TabelaChamadoProps } from '../../../../../types/types';

// HELPERS
import { corrigirTextoCorrompido } from '../../../../../lib/corrigirTextoCorrompido';

// FORMATTERS
import { formatarCodNumber } from '../../../../../utils/formatters';

// ICONS
import { Loader2 } from 'lucide-react';
import { IoClose } from 'react-icons/io5';
import { MdAddCall } from 'react-icons/md';
import { BsFillSendFill } from 'react-icons/bs';
import { IoIosSave, IoIosSearch } from 'react-icons/io';
import {
   FaDatabase,
   FaExclamationTriangle,
   FaUser,
   FaUsers,
} from 'react-icons/fa';
import { RiFilterOffFill } from 'react-icons/ri';
import { BiSolidSearchAlt2 } from 'react-icons/bi';

// ================================================================================
// INTERFACES
// ================================================================================
interface RecursoStats {
   COD_RECURSO: number;
   NOME_RECURSO: string;
   TOTAL_CHAMADOS_ATIVOS: number;
   CHAMADOS_ALTA_PRIORIDADE: number;
   CHAMADOS_CRITICOS: number;
   SCORE_CARGA_TRABALHO: number;
   RECOMENDACAO: 'DISPONÍVEL' | 'MODERADO' | 'SOBRECARREGADO' | 'CRÍTICO';
   PERCENTUAL_ALTA_PRIORIDADE: number;
   TEMPO_MEDIO_RESOLUCAO: number | null;
}

interface ModalAtribuirChamadoProps {
   isOpen: boolean;
   onClose: () => void;
   chamado: TabelaChamadoProps | null;
}

// ================================================================================
// SCHEMAS ZOD
// ================================================================================
const formSchema = z
   .object({
      cliente: z
         .string()
         .min(1, 'Cliente é obrigatório')
         .refine(
            val => !isNaN(Number(val)) && Number(val) > 0,
            'Selecione um cliente válido'
         ),
      enviarEmailCliente: z.boolean().optional().default(false),
      enviarEmailRecurso: z.boolean().optional().default(false),
   })
   .refine(data => data.enviarEmailCliente || data.enviarEmailRecurso, {
      message: 'Pelo menos um método de notificação deve ser selecionado',
      path: ['root'],
   });

type FormData = z.infer<typeof formSchema>;
type FormErrors = Partial<Record<keyof FormData | 'root', string>>;

// ================================================================================
// COMPONENTES UTILITÁRIOS
// ================================================================================
const getRecomendacaoColor = (recomendacao: string) => {
   const colors = {
      DISPONÍVEL: 'bg-green-500 text-black',
      MODERADO: 'bg-yellow-500 text-black',
      SOBRECARREGADO: 'bg-orange-500 text-white',
      CRÍTICO: 'bg-red-500 text-white',
   };
   return (
      colors[recomendacao as keyof typeof colors] ||
      'bg-gradient-to-r from-slate-500 to-slate-600'
   );
};

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export const ModalAtribuirChamado: React.FC<ModalAtribuirChamadoProps> = ({
   isOpen,
   onClose,
   chamado,
}) => {
   // ================================================================================
   // ESTADOS
   // ================================================================================
   const [selectedRecurso, setSelectedRecurso] = useState<number | null>(null);
   const [formData, setFormData] = useState<FormData>({
      cliente: '',
      enviarEmailCliente: false,
      enviarEmailRecurso: false,
   });
   const [errors, setErrors] = useState<FormErrors>({});
   const [searchTerm, setSearchTerm] = useState('');
   const [filtroRecomendacao, setFiltroRecomendacao] =
      useState<string>('TODOS');

   // ================================================================================
   // HOOKS
   // ================================================================================
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
   const atribuirMutation = useEnviarEmailWhatsapp();

   // ================================================================================
   // QUERIES
   // ================================================================================
   const {
      data: recursosData,
      isLoading: loadingRecursos,
      refetch: refetchRecursos,
      error: errorRecursos,
   } = useQuery({
      queryKey: ['dashboard-recursos'],
      queryFn: async () => {
         try {
            const response = await fetch(
               '/api/chamado/atribuir-chamado/recursos',
               {
                  headers: { Authorization: `Bearer ${token}` },
               }
            );
            if (!response.ok) throw new Error('Erro ao buscar recursos');
            return response.json();
         } catch (error) {
            console.error('Erro ao buscar recursos:', error);
            throw error;
         }
      },
      enabled: !!token,
      refetchInterval: 30000,
   });

   const { data: clientes = [], isLoading: loadingClientes } = useQuery({
      queryKey: ['clientes'],
      queryFn: async () => {
         const response = await fetch('/api/cliente', {
            headers: { Authorization: `Bearer ${token}` },
         });
         if (!response.ok) throw new Error('Erro ao buscar clientes');
         return response.json();
      },
      enabled: !!token && isOpen,
   });

   // ================================================================================
   // MEMOIZED VALUES
   // ================================================================================
   const recursosFiltrados = useMemo(() => {
      if (!recursosData?.recursos) return [];
      return recursosData.recursos.filter((recurso: RecursoStats) => {
         const matchesSearch = recurso.NOME_RECURSO.toLowerCase().includes(
            searchTerm.toLowerCase()
         );
         const matchesFilter =
            filtroRecomendacao === 'TODOS' ||
            recurso.RECOMENDACAO === filtroRecomendacao;
         return matchesSearch && matchesFilter;
      });
   }, [recursosData?.recursos, searchTerm, filtroRecomendacao]);

   const recursoSelecionadoNome = useMemo(() => {
      if (!selectedRecurso || !recursosFiltrados) return null;
      const recurso = recursosFiltrados.find(
         (r: RecursoStats) => r.COD_RECURSO === selectedRecurso
      );
      return recurso ? corrigirTextoCorrompido(recurso.NOME_RECURSO) : null;
   }, [selectedRecurso, recursosFiltrados]);

   // ================================================================================
   // EFFECTS
   // ================================================================================
   useEffect(() => {
      if (isOpen) {
         setSelectedRecurso(null);
         setFormData({
            cliente: chamado?.COD_CLIENTE?.toString() || '',
            enviarEmailCliente: false,
            enviarEmailRecurso: false,
         });
         setErrors({});
      }
   }, [isOpen, chamado]);

   useEffect(() => {
      if (atribuirMutation.isSuccess) {
         toast.custom(t => (
            <ToastCustom
               type="success"
               title="Operação realizada com sucesso!"
               description={`Chamado #${formatarCodNumber(chamado?.COD_CHAMADO)} atribuído${
                  recursoSelecionadoNome
                     ? ` para ${recursoSelecionadoNome}`
                     : ''
               } com sucesso.`}
            />
         ));
         handleLimparFormulario();
         setTimeout(() => onClose(), 500);
         atribuirMutation.reset();
      }
   }, [atribuirMutation.isSuccess]);

   useEffect(() => {
      if (atribuirMutation.isError) {
         toast.custom(t => (
            <ToastCustom
               type="error"
               title="Erro ao tentar realizar Apontamento"
               description={
                  atribuirMutation.error?.message || 'Tente novamente.'
               }
            />
         ));
      }
   }, [atribuirMutation.isError, atribuirMutation.error?.message]);

   // ================================================================================
   // HANDLERS
   // ================================================================================
   const handleLimparFormulario = useCallback(() => {
      setFormData({
         cliente: chamado?.COD_CLIENTE?.toString() || '',
         enviarEmailCliente: false,
         enviarEmailRecurso: false,
      });
      setErrors({});
      setSelectedRecurso(null);
      setSearchTerm('');
      setFiltroRecomendacao('TODOS');
   }, [chamado]);

   const handleLimparFiltros = () => {
      setSearchTerm('');
      setFiltroRecomendacao('TODOS');
   };

   const validateField = (name: keyof FormData, value: string | boolean) => {
      try {
         const fieldSchema = formSchema.shape[name];
         if (fieldSchema) {
            fieldSchema.parse(value);
            setErrors(prev => ({ ...prev, [name]: undefined }));
         }
      } catch (error) {
         if (error instanceof z.ZodError) {
            setErrors(prev => ({ ...prev, [name]: error.issues[0]?.message }));
         }
      }
   };

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

   const isFormValid = () => {
      const realErrors = Object.fromEntries(
         Object.entries(errors).filter(([key, value]) => value !== undefined)
      );
      const hasNoErrors = Object.keys(realErrors).length === 0;
      const hasCliente = formData.cliente !== '' && formData.cliente !== null;
      const hasRecursoSelected = selectedRecurso !== null;
      const hasEmailSelected =
         formData.enviarEmailCliente || formData.enviarEmailRecurso;
      return (
         hasNoErrors && hasCliente && hasRecursoSelected && hasEmailSelected
      );
   };

   const handleInputChange = (
      name: keyof FormData,
      value: string | boolean
   ) => {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
         setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
         });
      }
      if (typeof value === 'string' && value.length > 0) {
         setTimeout(() => validateField(name, value), 300);
      } else if (typeof value === 'boolean') {
         validateField(name, value);
      }
   };

   const handleSelectRecurso = (recursoId: number) => {
      setSelectedRecurso(recursoId);
   };

   const handleAtribuir = () => {
      if (!selectedRecurso || !validateForm() || !chamado) return;
      atribuirMutation.mutate({
         codChamado: chamado.COD_CHAMADO,
         codRecurso: selectedRecurso,
         codCliente: Number(formData.cliente),
         enviarEmailCliente: formData.enviarEmailCliente,
         enviarEmailRecurso: formData.enviarEmailRecurso,
      });
   };

   // ================================================================================
   // RENDER
   // ================================================================================
   if (!isOpen || !chamado) return null;

   return (
      <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center p-4 duration-300">
         {/* ===== OVERLAY ===== */}
         <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
         {/* ========== */}

         {/* Container Principal */}
         <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[90vh] w-full max-w-[80vw] overflow-hidden rounded-2xl border border-teal-900 bg-black transition-all duration-500 ease-out">
            {/* ===== HEADER ===== */}
            <header className="relative flex items-center justify-between bg-teal-700 p-6 shadow-sm shadow-black">
               <div className="flex items-center justify-center gap-6">
                  <MdAddCall
                     className="text-gray-300 drop-shadow-lg"
                     size={72}
                  />
                  <div className="flex flex-col">
                     <h1 className="text-4xl font-extrabold tracking-widest text-gray-300 select-none">
                        ATRIBUIR CHAMADO
                     </h1>
                     <p className="text-xl font-bold tracking-widest text-gray-300 italic select-none">
                        CÓDIGO {formatarCodNumber(chamado.COD_CHAMADO)}
                     </p>
                  </div>
               </div>
               {/* ========== */}

               <button
                  onClick={() => {
                     handleLimparFormulario();
                     onClose();
                  }}
                  disabled={atribuirMutation.isPending}
                  className="group cursor-pointer rounded-full bg-white/20 p-3 transition-all hover:scale-110 hover:rotate-180 hover:bg-red-500 active:scale-95"
               >
                  <IoClose
                     className="text-white group-hover:scale-110"
                     size={24}
                  />
               </button>
            </header>
            {/* ==================== */}

            {/* Conteúdo Principal */}
            <div className="flex h-[calc(95vh-190px)] gap-8 overflow-hidden p-6">
               {/* Coluna Esquerda - Lista de Consultores */}
               <section className="flex flex-[0_0_58%] flex-col gap-6 overflow-hidden rounded-2xl bg-white">
                  {/* Header da Seção */}
                  <div className="bg-teal-500 p-6 shadow-sm shadow-black">
                     <div className="flex items-center gap-6">
                        <div className="rounded-md bg-gradient-to-r from-teal-600 to-teal-700 p-3 shadow-md shadow-black">
                           <FaUsers className="text-white" size={28} />
                        </div>
                        <div className="flex flex-col">
                           <h2 className="text-4xl font-extrabold tracking-widest text-black select-none">
                              CONSULTORES
                           </h2>
                           <p className="text-xl font-bold tracking-widest text-black uppercase italic select-none">
                              {recursosFiltrados.length}{' '}
                              {recursosFiltrados.length === 1
                                 ? 'Consultor disponível'
                                 : 'Consultores disponíveis'}
                           </p>
                        </div>
                     </div>
                  </div>
                  {/* ==================== */}

                  {/* Filtros */}
                  <div className="flex items-center gap-4 px-6">
                     {/* Campo de Busca */}
                     <div className="group relative flex-1">
                        <BiSolidSearchAlt2
                           className={`absolute top-1/2 left-4 -translate-y-1/2 transition-colors ${
                              searchTerm
                                 ? 'text-black'
                                 : 'text-slate-400 group-focus-within:text-black'
                           }`}
                           size={24}
                        />
                        <input
                           type="text"
                           value={searchTerm}
                           onChange={e => setSearchTerm(e.target.value)}
                           placeholder="Buscar consultor..."
                           disabled={loadingRecursos}
                           className={`w-full rounded-md border bg-white py-3.5 pl-12 text-base font-semibold tracking-widest text-black italic shadow-sm shadow-black transition-all outline-none select-none placeholder:font-normal placeholder:text-slate-400 placeholder:italic hover:shadow-lg hover:shadow-black focus:outline-none active:scale-98 disabled:opacity-50 ${
                              searchTerm
                                 ? 'ring-2 ring-blue-600'
                                 : 'focus:ring-2 focus:ring-blue-600'
                           }`}
                        />
                        {searchTerm && (
                           <button
                              onClick={() => setSearchTerm('')}
                              className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-black transition-all hover:scale-150 hover:rotate-180 hover:text-red-500"
                           >
                              <IoClose size={24} />
                           </button>
                        )}
                     </div>
                     {/* ===== */}

                     {/* Filtro de Recomendação */}
                     <div className="flex-shrink-0">
                        <DropdownRecomendacao
                           value={filtroRecomendacao}
                           onChange={setFiltroRecomendacao}
                        />
                     </div>
                  </div>
                  {/* ==================== */}

                  {/* Lista de Recursos */}
                  <div className="flex flex-col gap-4 overflow-y-auto px-6 pb-6">
                     {/* LOADING DE CARREGAMENTO */}
                     {loadingRecursos ? (
                        <div className="flex h-full flex-col items-center justify-center gap-6 py-52">
                           <div className="relative">
                              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-200 via-blue-400 to-blue-600 opacity-20 blur-xl"></div>

                              <div className="relative flex items-center justify-center">
                                 <Loader2
                                    className="animate-spin text-blue-600"
                                    size={120}
                                 />

                                 <div className="absolute inset-0 flex items-center justify-center">
                                    <FaDatabase
                                       className="text-blue-600"
                                       size={40}
                                    />
                                 </div>
                              </div>
                           </div>
                           <div className="flex flex-col items-center justify-center gap-2">
                              <p className="text-2xl font-extrabold tracking-widest text-black select-none">
                                 Aguarde... Buscando Consultores...
                              </p>
                              <p className="text-base font-bold tracking-widest text-black select-none">
                                 Carregando
                                 <div className="inline-flex gap-1">
                                    <span className="h-2 w-2 animate-[bounce_1s_ease-in-out_infinite] rounded-full bg-blue-600"></span>
                                    <span className="h-2 w-2 animate-[bounce_1s_ease-in-out_0.2s_infinite] rounded-full bg-blue-600"></span>
                                    <span className="h-2 w-2 animate-[bounce_1s_ease-in-out_0.4s_infinite] rounded-full bg-blue-600"></span>
                                 </div>
                              </p>
                           </div>
                        </div>
                     ) : // ERRO NO CARREGAMENTO
                     errorRecursos ? (
                        <div className="flex h-full flex-col items-center justify-center gap-6 py-52">
                           <FaExclamationTriangle
                              className="text-red-600"
                              size={80}
                           />
                           <div className="flex flex-col items-center justify-center gap-2">
                              <p className="text-2xl font-extrabold tracking-widest text-black select-none">
                                 Erro no carregamento
                              </p>
                              <p className="text-base font-bold tracking-widest text-black select-none">
                                 Não foi possível carregar os consultores
                              </p>
                           </div>
                        </div>
                     ) : // FILTRO SEM RESULTADOS
                     recursosFiltrados.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center gap-6 py-52">
                           <RiFilterOffFill className="text-black" size={80} />
                           <div className="mb-10 flex items-center justify-center">
                              <p className="text-2xl font-extrabold tracking-widest text-black select-none">
                                 Nenhum resultado encontrado para:
                              </p>
                              <span className="ml-2 text-2xl font-bold text-black italic select-none">
                                 {filtroRecomendacao !== 'TODOS' && (
                                    <p>
                                       <span
                                          className={`rounded-md px-6 py-1 text-lg font-bold tracking-widest italic select-none ${getRecomendacaoColor(filtroRecomendacao)}`}
                                       >
                                          {filtroRecomendacao}
                                       </span>
                                    </p>
                                 )}
                                 {searchTerm && (
                                    <p className="mt-2">
                                       Busca:{' '}
                                       <span className="font-bold tracking-widest italic select-none">
                                          "{searchTerm}"
                                       </span>
                                    </p>
                                 )}
                              </span>
                           </div>
                           <button
                              onClick={handleLimparFiltros}
                              className="w-[200px] cursor-pointer rounded-md border-none bg-gradient-to-r from-red-600 to-red-700 px-6 py-2 text-lg font-extrabold tracking-widest text-white shadow-md shadow-black transition-all hover:scale-105 hover:bg-gradient-to-r hover:from-red-900 hover:to-red-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              Limpar Filtros
                           </button>
                        </div>
                     ) : (
                        // CARD DE RECURSOS
                        recursosFiltrados.map((recurso: RecursoStats) => (
                           <div
                              key={recurso.COD_RECURSO}
                              onClick={() =>
                                 handleSelectRecurso(recurso.COD_RECURSO)
                              }
                              className={`group relative mt-6 cursor-pointer rounded-md border bg-white px-4 py-6 shadow-sm shadow-black transition-all active:scale-98 ${
                                 selectedRecurso === recurso.COD_RECURSO
                                    ? 'scale-[1.02] ring-2 ring-blue-600'
                                    : 'border hover:shadow-lg hover:shadow-black'
                              }`}
                           >
                              {/* Badge de Seleção */}
                              {selectedRecurso === recurso.COD_RECURSO && (
                                 <div className="absolute -top-4 -right-3 rounded-md bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-1 text-xs font-bold tracking-widest text-white italic shadow-md shadow-black select-none">
                                    SELECIONADO
                                 </div>
                              )}

                              {/* Header do Card */}
                              <div className="mb-4 flex items-center gap-4">
                                 <div
                                    className={`rounded-md px-4 py-2 transition-all ${
                                       selectedRecurso === recurso.COD_RECURSO
                                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-md shadow-black'
                                          : ''
                                    }`}
                                 >
                                    <FaUser
                                       className={
                                          selectedRecurso ===
                                          recurso.COD_RECURSO
                                             ? 'text-white'
                                             : 'text-black'
                                       }
                                       size={24}
                                    />
                                 </div>
                                 <div className="flex-1">
                                    <h3 className="text-xl font-bold tracking-widest text-black italic select-none">
                                       {corrigirTextoCorrompido(
                                          recurso.NOME_RECURSO
                                       )}
                                    </h3>
                                 </div>
                                 <div
                                    className={`rounded-md px-6 py-1 text-sm font-bold tracking-widest italic shadow-md shadow-black select-none ${getRecomendacaoColor(recurso.RECOMENDACAO)}`}
                                 >
                                    {recurso.RECOMENDACAO}
                                 </div>
                              </div>

                              {/* Métricas */}
                              <div className="grid grid-cols-3 gap-4">
                                 {[
                                    {
                                       label: 'Ativos',
                                       value: recurso.TOTAL_CHAMADOS_ATIVOS,
                                       gradient: 'from-blue-600 to-blue-700',
                                    },
                                    {
                                       label: 'Alta Prioridade',
                                       value: recurso.CHAMADOS_ALTA_PRIORIDADE,
                                       gradient:
                                          'from-yellow-500 to-yellow-600',
                                    },
                                    {
                                       label: 'Críticos',
                                       value: recurso.CHAMADOS_CRITICOS,
                                       gradient: 'from-red-600 to-red-700',
                                    },
                                 ].map((metric, idx) => (
                                    <div
                                       key={idx}
                                       className={`bg-gradient-to-br ${metric.gradient} rounded-md p-1 text-center shadow-md shadow-black`}
                                    >
                                       <p className="text-sm font-semibold tracking-widest text-white select-none">
                                          {metric.label}
                                       </p>
                                       <p className="mt-1 text-2xl font-semibold tracking-widest text-white italic select-none">
                                          {metric.value}
                                       </p>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </section>

               {/* Coluna Direita - Formulário */}
               <section className="flex flex-[0_0_40.5%] flex-col gap-6 overflow-hidden rounded-2xl bg-white">
                  {/* Header da Seção */}
                  <div className="bg-teal-500 p-6 shadow-sm shadow-black">
                     <div className="flex items-center gap-6">
                        <div className="rounded-md bg-gradient-to-r from-teal-600 to-teal-700 p-3 shadow-md shadow-black">
                           <BsFillSendFill className="text-white" size={28} />
                        </div>
                        <div className="flex flex-col">
                           <h2 className="text-4xl font-extrabold tracking-widest text-black select-none">
                              ATRIBUIÇÃO
                           </h2>
                           <p className="text-xl font-bold tracking-widest text-black uppercase italic select-none">
                              Configure a atribuição
                           </p>
                        </div>
                     </div>
                  </div>
                  {/* ==================== */}

                  {/* Formulário */}
                  <div className="flex flex-1 flex-col gap-10 overflow-y-auto p-6">
                     {/* Consultor Selecionado */}
                     <div className="flex flex-col gap-1">
                        <label className="text-sm font-extrabold tracking-widest text-black select-none">
                           {selectedRecurso
                              ? 'CONSULTOR SELECIONADO'
                              : 'CONSULTOR'}
                        </label>
                        {/* ===== */}
                        <div
                           className={`rounded-md border px-4 py-5 shadow-sm shadow-black transition-all ${
                              selectedRecurso
                                 ? 'ring-2 ring-blue-600'
                                 : 'focus:ring-2 focus:ring-blue-600'
                           }`}
                        >
                           {selectedRecurso ? (
                              <div className="flex items-center gap-4">
                                 <div className="rounded-md bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 shadow-md shadow-black">
                                    <FaUser className="text-white" size={24} />
                                 </div>
                                 <span className="text-lg font-extrabold tracking-widest text-black italic select-none">
                                    {corrigirTextoCorrompido(
                                       recursosFiltrados.find(
                                          (r: RecursoStats) =>
                                             r.COD_RECURSO === selectedRecurso
                                       )?.NOME_RECURSO || 'Recurso selecionado'
                                    )}
                                 </span>
                              </div>
                           ) : (
                              <p className="flex items-center gap-4 text-base font-normal tracking-widest text-slate-400 italic select-none">
                                 <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                                 Selecione um consultor na lista
                              </p>
                           )}
                        </div>
                     </div>

                     {/* Cliente */}
                     <div className="flex flex-col gap-1">
                        <label className="text-sm font-extrabold tracking-widest text-black select-none">
                           {formData.cliente
                              ? 'CLIENTE SELECIONADO'
                              : 'CLIENTE'}
                        </label>
                        <DropdownCliente
                           value={formData.cliente}
                           onChange={value =>
                              handleInputChange('cliente', value)
                           }
                           clientes={clientes}
                           placeholder="Selecione um cliente"
                           error={errors.cliente}
                           corrigirTextoCorrompido={corrigirTextoCorrompido}
                        />
                     </div>

                     {/* Notificações */}
                     <div className="flex flex-col gap-1">
                        <label className="text-sm font-extrabold tracking-widest text-black select-none">
                           NOTIFICAÇÕES
                        </label>
                        <div className="flex flex-col gap-10 rounded-md border bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-sm shadow-black">
                           <label className="group flex cursor-pointer items-start gap-4">
                              <input
                                 type="checkbox"
                                 checked={formData.enviarEmailCliente}
                                 onChange={e =>
                                    handleInputChange(
                                       'enviarEmailCliente',
                                       e.target.checked
                                    )
                                 }
                                 className="mt-1 h-6 w-6 cursor-pointer rounded-md border shadow-sm shadow-black hover:shadow-lg hover:shadow-black focus:ring-2 focus:ring-blue-600 focus:outline-none active:scale-80"
                              />
                              <div className="flex flex-1 flex-col">
                                 <p className="font-bold tracking-widest text-black select-none">
                                    Enviar email para o Cliente
                                 </p>
                                 <p className="mt-1 text-sm font-semibold tracking-widest text-slate-500 italic select-none">
                                    O cliente receberá uma notificação sobre a
                                    atribuição
                                 </p>
                              </div>
                           </label>

                           <label className="group flex cursor-pointer items-start gap-4">
                              <input
                                 type="checkbox"
                                 checked={formData.enviarEmailRecurso}
                                 onChange={e =>
                                    handleInputChange(
                                       'enviarEmailRecurso',
                                       e.target.checked
                                    )
                                 }
                                 className="mt-1 h-6 w-6 cursor-pointer rounded-md border shadow-sm shadow-black hover:shadow-lg hover:shadow-black focus:ring-2 focus:ring-blue-600 focus:outline-none active:scale-80"
                              />
                              <div className="flex flex-1 flex-col">
                                 <p className="font-bold tracking-widest text-black select-none">
                                    Enviar email para o Consultor
                                 </p>
                                 <p className="mt-1 text-sm font-semibold tracking-widest text-slate-500 italic select-none">
                                    O consultor receberá uma notificação sobre a
                                    atribuição
                                 </p>
                              </div>
                           </label>
                        </div>
                     </div>
                  </div>

                  {/* Footer - Botões */}
                  <div className="border-t-4 border-red-600 px-6 py-10">
                     <div className="flex items-center justify-end gap-8">
                        {/* Botão Limpar */}
                        <button
                           onClick={handleLimparFormulario}
                           disabled={atribuirMutation.isPending}
                           className="w-[200px] cursor-pointer rounded-md border-none bg-gradient-to-r from-red-600 to-red-700 px-6 py-2 text-lg font-extrabold tracking-widest text-white shadow-md shadow-black transition-all hover:shadow-xl hover:shadow-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                           Limpar
                        </button>

                        {/* Botão Atribuir */}
                        <button
                           onClick={handleAtribuir}
                           disabled={
                              !isFormValid() || atribuirMutation.isPending
                           }
                           className="w-[200px] cursor-pointer rounded-md border-none bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2 text-lg font-extrabold tracking-widest text-white shadow-md shadow-black transition-all hover:shadow-xl hover:shadow-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                           {atribuirMutation.isPending ? (
                              <span className="flex items-center justify-center gap-3">
                                 <LoadingButton size={24} />
                                 Atribuindo...
                              </span>
                           ) : (
                              <span className="flex items-center justify-center gap-3">
                                 <IoIosSave size={24} />
                                 Atribuir
                              </span>
                           )}
                        </button>
                     </div>
                  </div>
               </section>
            </div>
         </div>
      </div>
   );
};
