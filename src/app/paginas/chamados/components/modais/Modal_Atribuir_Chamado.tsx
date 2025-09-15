import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '../../../../../components/ui/tooltip';
// ================================================================================
import { useEmailAtribuirChamados } from '../../../../../hooks/useEmailAtribuirChamados';
import { corrigirTextoCorrompido } from '../../../../../lib/corrigirTextoCorrompido';
// ================================================================================
import {
   FaCheckCircle,
   FaClock,
   FaExclamationTriangle,
   FaFilter,
   FaSearch,
   FaUser,
   FaFlag,
   FaCalendarAlt,
   FaUsers,
} from 'react-icons/fa';
import { IoAlertCircle, IoBarChart, IoClose } from 'react-icons/io5';
import { FaShield, FaMessage as FaMessage6 } from 'react-icons/fa6';
import { ImUsers, ImTarget } from 'react-icons/im';
import { FiActivity } from 'react-icons/fi';
import { BsAwardFill, BsFillSendFill } from 'react-icons/bs';
import { BiSolidZap } from 'react-icons/bi';
import { HiTrendingUp } from 'react-icons/hi';
import { MdMessage, MdEmail } from 'react-icons/md';

// ================================================================================
// SCHEMAS E TIPOS
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
// INTERFACES E TIPOS
// ================================================================================

interface ChamadoProps {
   COD_CHAMADO: number;
   DATA_CHAMADO: string;
   ASSUNTO_CHAMADO: string;
   STATUS_CHAMADO: string;
   EMAIL_CHAMADO: string;
   PRIOR_CHAMADO: string;
   COD_CLIENTE: number;
   NOME_CLIENTE: string;
   COD_RECURSO?: number;
   NOME_RECURSO?: string;
}

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

interface ModalAtribuicaoInteligenteProps {
   isOpen: boolean;
   onClose: () => void;
   chamado: ChamadoProps | null;
   onAtribuicaoSuccess?: () => void;
}

interface OverlayContent {
   title: string;
   message: string;
   type: 'info' | 'warning' | 'error' | 'success';
}

// ================================================================================
// COMPONENTES UTILITÁRIOS
// ================================================================================

const RecomendacaoIcon = ({ recomendacao }: { recomendacao: string }) => {
   const icons = {
      DISPONÍVEL: FaCheckCircle,
      MODERADO: FaClock,
      SOBRECARREGADO: FaExclamationTriangle,
      CRÍTICO: IoAlertCircle,
   };
   const Icon = icons[recomendacao as keyof typeof icons] || FiActivity;
   return <Icon size={16} />;
};

const PrioridadeTag = ({ prioridade }: { prioridade: string }) => {
   const getPrioridadeInfo = (prioridade: string) => {
      const prio = parseInt(prioridade) || 100;
      if (prio <= 50)
         return { label: 'ALTA', color: 'text-red-800', bgColor: 'bg-red-400' };
      if (prio <= 100)
         return {
            label: 'MÉDIA',
            color: 'text-yellow-800',
            bgColor: 'bg-yellow-400',
         };
      return {
         label: 'BAIXA',
         color: 'text-green-800',
         bgColor: 'bg-green-400',
      };
   };

   const prioridadeInfo = getPrioridadeInfo(prioridade);

   return (
      <div
         className={`inline-flex items-center rounded-md px-4 py-0.5 text-sm font-extrabold tracking-wider shadow-sm shadow-white select-none ${prioridadeInfo.bgColor} ${prioridadeInfo.color}`}
      >
         {prioridadeInfo.label} ({prioridade})
      </div>
   );
};

const LoadingSpinner = ({ text = 'Carregando...' }: { text?: string }) => (
   <div className="flex flex-col items-center justify-center space-y-4 py-16">
      <div className="relative">
         <Loader2 className="animate-spin text-white" size={48} />
      </div>
      <p className="text-center text-base font-semibold tracking-wider text-slate-300 select-none">
         {text}
      </p>
   </div>
);

const ErrorDisplay = ({
   onRetry,
   message = 'Não foi possível carregar as informações do recurso',
}: {
   onRetry: () => void;
   message?: string;
}) => (
   <div className="flex flex-col items-center justify-center gap-8 rounded-md border border-red-500/50 bg-red-500/20 p-6">
      <div className="rounded-md bg-red-600 p-4 shadow-sm shadow-white">
         <FaExclamationTriangle className="text-white" size={28} />
      </div>
      <div className="flex flex-col items-center justify-center gap-4">
         <p className="text-lg font-semibold tracking-wider text-white select-none">
            Erro ao carregar detalhes
         </p>
         <p className="text-center text-sm font-semibold tracking-wider text-slate-300 select-none">
            {message}
         </p>
      </div>
      <button
         onClick={onRetry}
         className="rounded-xl bg-red-600 px-6 py-2 text-lg font-bold tracking-wider text-white transition-all select-none hover:scale-110 hover:bg-red-900 hover:shadow-md hover:shadow-black active:scale-95"
      >
         Tentar novamente
      </button>
   </div>
);

// ================================================================================
// UTILITÁRIOS
// ================================================================================

const getRecomendacaoColor = (recomendacao: string) => {
   const colors = {
      DISPONÍVEL: 'bg-green-600',
      MODERADO: 'bg-yellow-500',
      SOBRECARREGADO: 'bg-orange-600',
      CRÍTICO: 'bg-red-600',
   };
   return colors[recomendacao as keyof typeof colors] || 'bg-slate-600';
};

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================

const ModalAtribuicaoInteligente: React.FC<ModalAtribuicaoInteligenteProps> = ({
   isOpen,
   onClose,
   chamado,
   onAtribuicaoSuccess,
}) => {
   // ================================================================================
   // ESTADOS - SELEÇÕES E MODAIS
   // ================================================================================
   const [selectedRecurso, setSelectedRecurso] = useState<number | null>(null);
   const [showDetails, setShowDetails] = useState<number | null>(null);
   const [showSugestao, setShowSugestao] = useState(false);

   // ================================================================================
   // ESTADOS - FORMULÁRIOS E VALIDAÇÕES
   // ================================================================================
   const [formData, setFormData] = useState<FormData>({
      cliente: '',
      enviarEmailCliente: false,
      enviarEmailRecurso: false,
   });
   const [errors, setErrors] = useState<FormErrors>({});
   const [success, setSuccess] = useState(false);

   // ================================================================================
   // ESTADOS - FILTROS E BUSCA
   // ================================================================================
   const [searchTerm, setSearchTerm] = useState('');
   const [filtroRecomendacao, setFiltroRecomendacao] =
      useState<string>('TODOS');

   // ================================================================================
   // ESTADOS - OVERLAY E NOTIFICAÇÕES
   // ================================================================================
   const [showOverlay, setShowOverlay] = useState(false);
   const [overlayContent, setOverlayContent] = useState<OverlayContent | null>(
      null
   );

   // ================================================================================
   // ESTADOS - SUGESTÃO DE RECURSO
   // ================================================================================
   const [novoChamado, setNovoChamado] = useState({
      prioridade: 100,
      codCliente: '',
      assunto: '',
   });

   // ================================================================================
   // HOOKS E CONTEXTOS
   // ================================================================================
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
   const atribuirMutation = useEmailAtribuirChamados();

   // ================================================================================
   // FUNÇÕES DE OVERLAY E NOTIFICAÇÕES
   // ================================================================================
   const showOverlayMessage = (
      title: string,
      message: string,
      type: 'info' | 'warning' | 'error' | 'success' = 'info'
   ) => {
      setOverlayContent({ title, message, type });
      setShowOverlay(true);
   };

   // ================================================================================
   // EFEITOS E RESETS
   // ================================================================================
   useEffect(() => {
      if (isOpen) {
         setSelectedRecurso(null);
         setShowDetails(null);
         setFormData({
            cliente: chamado?.COD_CLIENTE?.toString() || '',
            enviarEmailCliente: false,
            enviarEmailRecurso: false,
         });
         setErrors({});
         setSuccess(false);
      }
   }, [isOpen, chamado]);

   useEffect(() => {
      if (atribuirMutation.isSuccess) {
         setSuccess(true);
         onAtribuicaoSuccess?.();
         setTimeout(() => {
            onClose();
         }, 2000);
      }

      if (atribuirMutation.isError) {
         setErrors({ root: 'Erro ao atribuir chamado' });
      }
   }, [
      atribuirMutation.isSuccess,
      atribuirMutation.isError,
      onAtribuicaoSuccess,
      onClose,
   ]);

   // ================================================================================
   // QUERIES DE DADOS
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
            const response = await fetch('/api/atribuir-chamado/recursos', {
               headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Erro ao buscar recursos');
            return response.json();
         } catch (error) {
            showOverlayMessage(
               'Erro de Conexão',
               'Não foi possível carregar os recursos. Verifique sua conexão e tente novamente.',
               'error'
            );
            throw error;
         }
      },
      enabled: !!token,
      refetchInterval: 30000,
   });

   const { data: clientes = [], isLoading: loadingClientes } = useQuery({
      queryKey: ['clientes'],
      queryFn: async () => {
         const response = await fetch('/api/clientes', {
            headers: { Authorization: `Bearer ${token}` },
         });
         if (!response.ok) throw new Error('Erro ao buscar clientes');
         return response.json();
      },
      enabled: !!token && isOpen,
   });

   const { data: sugestaoData, isLoading: loadingSugestao } = useQuery({
      queryKey: ['sugestao-recurso', novoChamado],
      queryFn: async () => {
         const response = await fetch(
            '/api/atribuir-chamado/sugestao-recurso',
            {
               method: 'POST',
               headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify(novoChamado),
            }
         );
         if (!response.ok) throw new Error('Erro ao buscar sugestão');
         return response.json();
      },
      enabled: showSugestao && !!token && novoChamado.prioridade > 0,
   });

   const {
      data: recursoDetalhado,
      isLoading: loadingDetalhe,
      error: errorDetalhe,
   } = useQuery({
      queryKey: ['dashboard-recurso', selectedRecurso],
      queryFn: async () => {
         try {
            const response = await fetch(
               `/api/atribuir-chamado/recurso/${selectedRecurso}`,
               {
                  headers: { Authorization: `Bearer ${token}` },
               }
            );
            if (!response.ok)
               throw new Error('Erro ao buscar detalhes do recurso');
            return response.json();
         } catch (error) {
            showOverlayMessage(
               'Erro ao Carregar',
               'Não foi possível carregar os detalhes do recurso selecionado.',
               'error'
            );
            throw error;
         }
      },
      enabled: !!selectedRecurso && !!token,
   });

   // ================================================================================
   // FUNÇÕES DE VALIDAÇÃO
   // ================================================================================
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

   // ================================================================================
   // FUNÇÕES DE HANDLERS
   // ================================================================================
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
      setShowSugestao(false);
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

   const handleLimparFormulario = () => {
      setFormData({
         cliente: chamado?.COD_CLIENTE?.toString() || '',
         enviarEmailCliente: false,
         enviarEmailRecurso: false,
      });
      setErrors({});
      setSelectedRecurso(null);
   };

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

   // ================================================================================
   // RENDERIZAÇÃO CONDICIONAL
   // ================================================================================
   if (!isOpen || !chamado) return null;

   // ================================================================================
   // RENDERIZAÇÃO PRINCIPAL
   // ================================================================================
   return (
      <AnimatePresence>
         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 backdrop-blur-xl"
            onClick={e => e.target === e.currentTarget && onClose()}
         >
            <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-400 bg-slate-800"
            >
               {/* ===== HEADER ===== */}
               <header className="flex flex-col gap-6 border-b-4 border-slate-500 bg-black p-6">
                  {/* ===== CABEÇALHO ===== */}
                  <div className="flex items-center justify-between">
                     <div className="flex items-center justify-between gap-6">
                        <div className="rounded-md border-none bg-blue-600 p-3 shadow-md shadow-white">
                           <ImTarget size={28} className="text-white" />
                        </div>
                        <div>
                           <h2 className="text-2xl font-extrabold tracking-wider text-white select-none">
                              Atribuir Chamado
                           </h2>
                           <div className="rounded-full bg-cyan-300 px-6 py-1">
                              <p className="text-center text-base font-extrabold tracking-widest text-black italic select-none">
                                 Chamado #{chamado.COD_CHAMADO}
                              </p>
                           </div>
                        </div>
                     </div>
                     <button
                        onClick={onClose}
                        className="cursor-pointer rounded-full bg-red-800 p-3 text-white transition-all hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95"
                     >
                        <IoClose size={24} />
                     </button>
                  </div>

                  {/* ===== INFORMAÇÕES DO CHAMADO ===== */}
                  <div className="grid grid-cols-4 gap-4">
                     <div className="rounded-md bg-white/20 px-4 py-2 shadow-sm shadow-white">
                        <div className="flex items-center gap-3">
                           <FaFlag className="text-white" size={18} />
                           <span className="text-sm font-semibold tracking-wider text-white italic select-none">
                              Prioridade
                           </span>
                        </div>
                        <div className="mt-1 ml-6">
                           <PrioridadeTag prioridade={chamado.PRIOR_CHAMADO} />
                        </div>
                     </div>

                     <div className="rounded-md bg-white/20 px-4 py-2 shadow-sm shadow-white">
                        <div className="flex items-center gap-3">
                           <FaUser className="text-white" size={16} />
                           <span className="text-sm font-semibold tracking-wider text-white italic select-none">
                              Cliente
                           </span>
                        </div>
                        <p className="mt-1 ml-6 text-base font-semibold tracking-wider text-white select-none">
                           {chamado.NOME_CLIENTE}
                        </p>
                     </div>

                     <div className="rounded-md bg-white/20 px-4 py-2 shadow-sm shadow-white">
                        <div className="flex items-center gap-3">
                           <FaCalendarAlt className="text-white" size={16} />
                           <span className="text-sm font-semibold tracking-wider text-white italic select-none">
                              Data
                           </span>
                        </div>
                        <p className="mt-1 ml-6 text-base font-semibold tracking-wider text-white select-none">
                           {new Date(chamado.DATA_CHAMADO).toLocaleDateString(
                              'pt-BR'
                           )}
                        </p>
                     </div>

                     <div className="rounded-md bg-white/20 px-4 py-2 shadow-sm shadow-white">
                        <div className="flex items-center gap-3">
                           <MdMessage className="text-white" size={16} />
                           <span className="text-sm font-semibold tracking-wider text-white italic select-none">
                              Status
                           </span>
                        </div>
                        <p className="mt-1 ml-6 text-base font-semibold tracking-wider text-white select-none">
                           {chamado.STATUS_CHAMADO}
                        </p>
                     </div>
                  </div>

                  {/* ===== ASSUNTO E CARDS ===== */}
                  <div className="flex items-center justify-between gap-4">
                     <div className="w-[700px] rounded-md bg-white/20 px-4 py-2 shadow-sm shadow-white">
                        <div className="mb-2 flex items-center space-x-2">
                           <FaMessage6 className="text-white" size={16} />
                           <span className="text-sm font-semibold tracking-wider text-white italic select-none">
                              Assunto
                           </span>
                        </div>
                        <p className="mt-1 ml-6 text-base font-semibold tracking-wider text-white select-none">
                           {corrigirTextoCorrompido(chamado.ASSUNTO_CHAMADO)}
                        </p>
                     </div>

                     {/* ===== CARDS DE ESTATÍSTICAS ===== */}
                     {recursosData?.resumoGeral && (
                        <div className="grid flex-1 grid-cols-4 gap-4">
                           {[
                              {
                                 title: 'Chamados Ativos',
                                 value: recursosData.resumoGeral
                                    .totalChamadosAtivos,
                                 icon: FiActivity,
                                 bgGradient: 'blue-600',
                              },
                              {
                                 title: 'Chamados Críticos',
                                 value: recursosData.resumoGeral
                                    .totalChamadosCriticos,
                                 icon: IoAlertCircle,
                                 bgGradient: 'red-600',
                              },
                              {
                                 title: 'Recursos Disponíveis',
                                 value: recursosData.resumoGeral
                                    .recursosDisponiveis,
                                 icon: FaCheckCircle,
                                 bgGradient: 'green-600',
                              },
                              {
                                 title: 'Sobrecarregados',
                                 value: recursosData.resumoGeral
                                    .recursosSobrecarregados,
                                 icon: HiTrendingUp,
                                 bgGradient: 'orange-600',
                              },
                           ].map((stat, index) => (
                              <div
                                 key={index}
                                 className={`relative overflow-hidden rounded-md bg-${stat.bgGradient} px-4 py-2`}
                              >
                                 <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                       <p className="text-sm font-semibold tracking-wider text-white select-none">
                                          {stat.title}
                                       </p>
                                       <p className="text-xl font-extrabold tracking-wider text-white select-none">
                                          {stat.value}
                                       </p>
                                    </div>
                                    <div className="rounded-md bg-white/20 p-2 shadow-md shadow-black">
                                       <stat.icon
                                          size={24}
                                          className="text-white"
                                       />
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </header>
               {/* ==================== */}

               {/* ===== COLUNAS PRINCIPAIS ===== */}
               <div className="flex h-full flex-1 gap-6 overflow-hidden p-6">
                  {/* ===== COLUNA RECURSOS ===== */}
                  <section className="flex-[0_0_40%] overflow-hidden rounded-t-xl border border-slate-500 bg-black">
                     {/* Cabeçalho e filtros */}
                     <div className="flex flex-col gap-6 border-b-4 border-slate-500 p-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="rounded-sm bg-blue-600 p-2 shadow-sm shadow-white">
                                 <FaUsers className="text-white" size={24} />
                              </div>
                              <h2 className="text-xl font-extrabold tracking-wider text-white select-none">
                                 Recursos do Sistema
                              </h2>
                           </div>

                           <Tooltip>
                              <TooltipTrigger asChild>
                                 <button
                                    onClick={() =>
                                       setShowSugestao(!showSugestao)
                                    }
                                    className="cursor-pointer rounded-md bg-green-600 p-2 shadow-sm shadow-white transition-all hover:-translate-y-1 hover:scale-102 hover:bg-green-900 hover:shadow-md hover:shadow-white active:scale-95"
                                 >
                                    <ImTarget
                                       size={24}
                                       className="text-white"
                                    />
                                 </button>
                              </TooltipTrigger>
                              <TooltipContent
                                 side="top"
                                 align="center"
                                 sideOffset={8}
                                 className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black shadow-lg shadow-black select-none"
                              >
                                 Sugerir Recurso
                              </TooltipContent>
                           </Tooltip>
                        </div>

                        {/* Filtros */}
                        <div className="flex items-center gap-4">
                           <div className="group relative flex-1 transition-all hover:-translate-y-1 hover:scale-102">
                              <FaSearch
                                 className="absolute top-1/2 left-4 -translate-y-1/2 text-white"
                                 size={20}
                              />
                              <input
                                 type="text"
                                 placeholder={
                                    searchTerm === '' &&
                                    !document.activeElement?.matches(
                                       '.input-busca-recurso'
                                    )
                                       ? 'Buscar recurso...'
                                       : ''
                                 }
                                 value={searchTerm}
                                 onChange={e => setSearchTerm(e.target.value)}
                                 onFocus={e => (e.target.placeholder = '')}
                                 onBlur={e => {
                                    if (e.target.value === '')
                                       e.target.placeholder =
                                          'Buscar recurso...';
                                 }}
                                 className="input-busca-recurso w-full rounded-md border-none bg-white/20 py-2 pl-12 text-base font-semibold tracking-wider text-white placeholder-white shadow-sm shadow-white select-none focus:ring-2 focus:ring-pink-500 focus:outline-none"
                              />
                           </div>

                           <div className="group relative transition-all hover:-translate-y-1 hover:scale-102">
                              <FaFilter
                                 className="absolute top-1/2 left-4 -translate-y-1/2 text-white"
                                 size={16}
                              />
                              <select
                                 value={filtroRecomendacao}
                                 onChange={e =>
                                    setFiltroRecomendacao(e.target.value)
                                 }
                                 className="cursor-pointer rounded-md border-none bg-white/20 py-2 pl-12 text-base font-semibold tracking-wider text-white shadow-sm shadow-white transition-all select-none focus:ring-2 focus:ring-pink-500 focus:outline-none"
                              >
                                 <option
                                    className="cursor-pointer text-base font-semibold tracking-wider text-black italic select-none"
                                    value="TODOS"
                                 >
                                    Todos
                                 </option>
                                 <option
                                    className="cursor-pointer text-base font-semibold tracking-wider text-black italic select-none"
                                    value="DISPONÍVEL"
                                 >
                                    Disponível
                                 </option>
                                 <option
                                    className="cursor-pointer text-base font-semibold tracking-wider text-black italic select-none"
                                    value="MODERADO"
                                 >
                                    Moderado
                                 </option>
                                 <option
                                    className="cursor-pointer text-base font-semibold tracking-wider text-black italic select-none"
                                    value="SOBRECARREGADO"
                                 >
                                    Sobrecarregado
                                 </option>
                                 <option
                                    className="cursor-pointer text-base font-semibold tracking-wider text-black italic select-none"
                                    value="CRÍTICO"
                                 >
                                    Crítico
                                 </option>
                              </select>
                           </div>
                        </div>
                     </div>

                     {/* Lista de recursos */}
                     <div className="flex h-[calc(100vh-548px)] flex-col gap-6 overflow-y-auto p-6">
                        {recursosFiltrados.map((recurso: RecursoStats) => (
                           <Tooltip key={recurso.COD_RECURSO}>
                              <TooltipTrigger asChild>
                                 <div
                                    className="flex cursor-pointer flex-col gap-4 rounded-md bg-slate-900 p-4 shadow-sm shadow-white transition-all outline-none hover:-translate-y-1 hover:scale-102 active:scale-95"
                                    onClick={() =>
                                       handleSelectRecurso(recurso.COD_RECURSO)
                                    }
                                 >
                                    <div className="flex items-center gap-3">
                                       <FaUser
                                          size={24}
                                          className="text-white"
                                       />
                                       <div className="flex w-full items-center justify-between">
                                          <h3 className="text-lg font-bold text-white">
                                             {corrigirTextoCorrompido(
                                                recurso.NOME_RECURSO
                                             )}
                                          </h3>
                                          <div
                                             className={`inline-flex items-center gap-2 rounded-full ${getRecomendacaoColor(recurso.RECOMENDACAO)} px-4 py-1 text-sm font-semibold tracking-wider text-black italic shadow-sm shadow-white select-none`}
                                          >
                                             <RecomendacaoIcon
                                                recomendacao={
                                                   recurso.RECOMENDACAO
                                                }
                                             />
                                             <span>{recurso.RECOMENDACAO}</span>
                                          </div>
                                       </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                       {[
                                          {
                                             label: 'Ativos',
                                             value: recurso.TOTAL_CHAMADOS_ATIVOS,
                                             color: 'text-cyan-500',
                                          },
                                          {
                                             label: 'Alta Prioridade',
                                             value: recurso.CHAMADOS_ALTA_PRIORIDADE,
                                             color: 'text-yellow-500',
                                          },
                                          {
                                             label: 'Críticos',
                                             value: recurso.CHAMADOS_CRITICOS,
                                             color: 'text-red-500',
                                          },
                                       ].map((metric, idx) => (
                                          <div
                                             key={idx}
                                             className="rounded-md border border-slate-700 bg-white/20 p-2 text-center"
                                          >
                                             <p className="text-sm font-semibold tracking-wider text-white italic select-none">
                                                {metric.label}
                                             </p>
                                             <p
                                                className={`text-xl font-extrabold tracking-wider select-none ${metric.color}`}
                                             >
                                                {metric.value}
                                             </p>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              </TooltipTrigger>
                              <TooltipContent
                                 side="top"
                                 align="center"
                                 sideOffset={8}
                                 className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black shadow-lg shadow-black select-none"
                              >
                                 Clique para ver os detalhes do{' '}
                                 {corrigirTextoCorrompido(recurso.NOME_RECURSO)}
                              </TooltipContent>
                           </Tooltip>
                        ))}
                     </div>
                  </section>
                  {/* ==================== */}

                  {/* ===== COLUNA DETALHES/SUGESTÃO ===== */}
                  <section className="flex-[0_0_25%] overflow-y-auto rounded-t-xl border border-slate-500 bg-black p-6">
                     {showSugestao ? (
                        // ===== SUGESTÕES DE RECURSO =====
                        <div className="flex flex-col gap-8">
                           {/* Seleção de cliente para sugestão */}
                           <div className="flex flex-col gap-6">
                              <div className="flex items-center gap-4">
                                 <div className="rounded-md bg-blue-600 p-2 shadow-sm shadow-white">
                                    <ImTarget
                                       className="text-white"
                                       size={24}
                                    />
                                 </div>
                                 <h3 className="text-xl font-extrabold tracking-wider text-white select-none">
                                    Sugestão de Recurso
                                 </h3>
                              </div>

                              <div className="flex flex-col gap-1">
                                 <label className="text-sm font-semibold tracking-wider text-white select-none">
                                    Cliente
                                 </label>
                                 <select
                                    value={novoChamado.codCliente}
                                    onChange={e =>
                                       setNovoChamado(prev => ({
                                          ...prev,
                                          codCliente: e.target.value,
                                       }))
                                    }
                                    className="w-full cursor-pointer rounded-md bg-white/20 px-4 py-2 text-base font-semibold tracking-wider text-white shadow-sm shadow-white transition-all select-none hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                 >
                                    <option
                                       value=""
                                       className="cursor-pointer font-semibold tracking-wider text-black italic select-none"
                                    >
                                       Selecione um cliente
                                    </option>
                                    {clientes.map(
                                       (cliente: {
                                          cod_cliente: number;
                                          nome_cliente: string;
                                       }) => (
                                          <option
                                             key={cliente.cod_cliente}
                                             value={cliente.cod_cliente}
                                             className="cursor-pointer font-semibold tracking-wider text-black italic select-none"
                                          >
                                             {corrigirTextoCorrompido(
                                                cliente.nome_cliente
                                             )}
                                          </option>
                                       )
                                    )}
                                 </select>
                              </div>
                           </div>

                           {/* Loading sugestão */}
                           {loadingSugestao && (
                              <LoadingSpinner text="Buscando melhor recurso..." />
                           )}

                           {/* Resultado da sugestão */}
                           {sugestaoData?.sugestao?.recursoRecomendado && (
                              <div className="flex flex-col gap-4 rounded-md border border-green-600/50 bg-green-600/30 p-4">
                                 <div className="flex items-center gap-4">
                                    <div className="rounded-xl bg-green-600 p-2 shadow-sm shadow-white">
                                       <BsAwardFill
                                          className="text-white"
                                          size={24}
                                       />
                                    </div>
                                    <h4 className="text-xl font-extrabold tracking-wider text-white select-none">
                                       Melhor Opção
                                    </h4>
                                 </div>

                                 <div className="flex flex-col gap-6">
                                    <div className="flex flex-col items-center gap-3">
                                       <p className="text-center text-lg font-bold tracking-wider text-white select-none">
                                          {
                                             sugestaoData.sugestao
                                                .recursoRecomendado.NOME_RECURSO
                                          }
                                       </p>
                                    </div>

                                    <div className="rounded-md bg-white/20 p-2 shadow-sm shadow-white">
                                       <p className="text-center text-base font-semibold tracking-wider text-white uppercase italic select-none">
                                          {
                                             sugestaoData.sugestao
                                                .recursoRecomendado.RECOMENDACAO
                                          }
                                       </p>
                                    </div>

                                    {sugestaoData.sugestao.recursoRecomendado
                                       .VANTAGENS?.length > 0 && (
                                       <div className="flex flex-col gap-2">
                                          <p className="text-base font-bold tracking-wider text-white select-none">
                                             Vantagens:
                                          </p>
                                          <div className="flex flex-col gap-2">
                                             {sugestaoData.sugestao.recursoRecomendado.VANTAGENS.map(
                                                (
                                                   vantagem: string,
                                                   index: number
                                                ) => (
                                                   <div
                                                      key={index}
                                                      className="flex items-center gap-2"
                                                   >
                                                      <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white"></div>
                                                      <p className="text-sm font-semibold tracking-wider text-white italic select-none">
                                                         {vantagem}
                                                      </p>
                                                   </div>
                                                )
                                             )}
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           )}

                           {/* Recomendações gerais */}
                           {sugestaoData?.recomendacoesGerais?.length > 0 && (
                              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6 backdrop-blur-xl">
                                 <div className="mb-3 flex items-center space-x-3">
                                    <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2">
                                       <BiSolidZap
                                          className="text-white"
                                          size={16}
                                       />
                                    </div>
                                    <h4 className="font-bold text-amber-200">
                                       Recomendações Gerais
                                    </h4>
                                 </div>
                                 <div className="space-y-2">
                                    {sugestaoData.recomendacoesGerais.map(
                                       (rec: string, index: number) => (
                                          <div
                                             key={index}
                                             className="flex items-start space-x-2"
                                          >
                                             <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400"></div>
                                             <p className="text-sm text-amber-100">
                                                {rec}
                                             </p>
                                          </div>
                                       )
                                    )}
                                 </div>
                              </div>
                           )}
                        </div>
                     ) : selectedRecurso ? (
                        // ===== DETALHES DO RECURSO =====
                        <div className="flex flex-col gap-4">
                           <div className="flex items-center gap-4">
                              <div className="rounded-md bg-blue-600 p-2 shadow-sm shadow-white">
                                 <FaUser className="text-white" size={24} />
                              </div>
                              <h3 className="text-xl font-extrabold tracking-wider text-white select-none">
                                 Detalhes do Recurso
                              </h3>
                           </div>

                           {loadingDetalhe ? (
                              <LoadingSpinner text="Carregando detalhes..." />
                           ) : errorDetalhe ? (
                              <ErrorDisplay onRetry={() => refetchRecursos()} />
                           ) : recursoDetalhado ? (
                              <div className="space-y-6">
                                 {/* Nome e email do recurso */}
                                 <div className="flex flex-col">
                                    <h4 className="text-xl font-bold tracking-wider text-white italic select-none">
                                       {corrigirTextoCorrompido(
                                          recursoDetalhado.recurso.NOME_RECURSO
                                       )}
                                    </h4>
                                    <p className="text-sm font-semibold tracking-wider text-slate-300 italic select-none">
                                       {recursoDetalhado.recurso.EMAIL_RECURSO}
                                    </p>
                                 </div>

                                 {/* Resumo da carga */}
                                 <div className="space-y-4 rounded-md bg-slate-900 p-4 shadow-sm shadow-white">
                                    <div className="flex items-center gap-3">
                                       <IoBarChart
                                          className="text-white"
                                          size={24}
                                       />
                                       <h5 className="text-lg font-bold tracking-wider text-white select-none">
                                          Resumo da Carga
                                       </h5>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                       {[
                                          {
                                             label: 'Chamados Ativos',
                                             value: recursoDetalhado.resumo
                                                .totalChamadosAtivos,
                                             color: 'text-cyan-500',
                                          },
                                          {
                                             label: 'Críticos',
                                             value: recursoDetalhado.resumo
                                                .chamadosCriticos,
                                             color: 'text-red-500',
                                          },
                                          {
                                             label: 'Atrasados',
                                             value: recursoDetalhado.resumo
                                                .chamadosAtrasados,
                                             color: 'text-yellow-500',
                                          },
                                          {
                                             label: 'Status',
                                             value: recursoDetalhado.resumo
                                                .statusCarga,
                                             color:
                                                recursoDetalhado.resumo
                                                   .statusCarga === 'LEVE'
                                                   ? 'text-green-500'
                                                   : recursoDetalhado.resumo
                                                          .statusCarga ===
                                                       'MODERADA'
                                                     ? 'text-yellow-500'
                                                     : recursoDetalhado.resumo
                                                            .statusCarga ===
                                                         'PESADA'
                                                       ? 'text-orange-500'
                                                       : 'text-red-500',
                                          },
                                       ].map((metric, idx) => (
                                          <div
                                             key={idx}
                                             className="rounded-md border border-slate-700 bg-white/20 p-2 text-center"
                                          >
                                             <p className="text-sm font-semibold tracking-wider text-white italic select-none">
                                                {metric.label}
                                             </p>
                                             <p
                                                className={`text-xl font-bold tracking-wider select-none ${metric.color}`}
                                             >
                                                {metric.value}
                                             </p>
                                          </div>
                                       ))}
                                    </div>
                                 </div>

                                 {/* Recomendação */}
                                 <div className="flex flex-col gap-3 rounded-md bg-blue-600/50 p-4 shadow-sm shadow-white">
                                    <div className="flex items-center gap-4">
                                       <FaShield
                                          className="text-white"
                                          size={18}
                                       />
                                       <h5 className="text-base font-bold tracking-wider text-white select-none">
                                          Recomendação
                                       </h5>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white"></div>
                                       <p className="text-sm font-semibold tracking-wider text-white italic select-none">
                                          {recursoDetalhado.resumo.recomendacao}
                                       </p>
                                    </div>
                                 </div>

                                 {/* Alertas */}
                                 {recursoDetalhado.alertas?.length > 0 && (
                                    <div className="flex flex-col gap-3 rounded-md bg-red-600/50 p-4 shadow-sm shadow-white">
                                       <div className="flex items-center gap-3">
                                          <FaExclamationTriangle
                                             className="text-white"
                                             size={18}
                                          />
                                          <h5 className="text-base font-bold tracking-wider text-white select-none">
                                             Alertas
                                          </h5>
                                       </div>
                                       <div className="flex flex-col gap-3">
                                          {recursoDetalhado.alertas.map(
                                             (
                                                alerta: string,
                                                index: number
                                             ) => (
                                                <div
                                                   key={index}
                                                   className="flex items-center gap-2"
                                                >
                                                   <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white"></div>
                                                   <p className="text-sm font-semibold tracking-wider text-white italic select-none">
                                                      {alerta}
                                                   </p>
                                                </div>
                                             )
                                          )}
                                       </div>
                                    </div>
                                 )}
                              </div>
                           ) : null}
                        </div>
                     ) : (
                        // ===== MENSAGEM PADRÃO =====
                        <div className="p-6">
                           <div className="flex flex-col items-center justify-center gap-6">
                              <ImUsers size={80} className="text-white" />
                              <div className="flex flex-col items-center gap-4">
                                 <p className="text-xl font-extrabold tracking-wider text-white select-none">
                                    Selecione um recurso
                                 </p>
                                 <p className="text-center text-sm font-semibold tracking-wider text-slate-300 italic select-none">
                                    Clique em um recurso para ver os detalhes
                                 </p>
                              </div>
                           </div>
                        </div>
                     )}
                  </section>
                  {/* ==================== */}

                  {/* ===== COLUNA FORMULÁRIO ===== */}
                  <section className="flex-[0_0_32.5%] overflow-y-auto rounded-t-xl border border-slate-500 bg-black p-6">
                     <div className="flex flex-col gap-6">
                        {/* Cabeçalho formulário */}
                        <div className="flex items-center gap-4">
                           <div className="rounded-md bg-blue-600 p-2 shadow-sm shadow-white">
                              <BsFillSendFill
                                 className="text-white"
                                 size={24}
                              />
                           </div>
                           <p className="text-xl font-extrabold tracking-wider text-white select-none">
                              Formulário de Atribuição
                           </p>
                        </div>

                        {/* Alerta sucesso formulário */}
                        {success && (
                           <div className="mb-4 rounded-lg border border-green-600 bg-green-900 p-4">
                              <div className="flex items-center gap-3">
                                 <FaCheckCircle
                                    className="text-green-400"
                                    size={20}
                                 />
                                 <p className="text-green-200">
                                    Chamado atribuído com sucesso!
                                 </p>
                              </div>
                           </div>
                        )}
                        {/* Alerta erro formulário */}
                        {errors.root && (
                           <div className="mb-4 rounded-lg border border-red-600 bg-red-900 p-4">
                              <div className="flex items-center gap-3">
                                 <FaExclamationTriangle
                                    className="text-red-400"
                                    size={20}
                                 />
                                 <p className="text-red-200">{errors.root}</p>
                              </div>
                           </div>
                        )}

                        {/* Formulário */}
                        <div className="flex flex-col gap-6">
                           {/* Recurso selecionado */}
                           <div className="flex flex-col gap-3 rounded-md bg-white/20 p-4 shadow-sm shadow-white">
                              <label className="text-lg font-extrabold tracking-wider text-white select-none">
                                 Recurso Selecionado
                              </label>
                              {selectedRecurso ? (
                                 <div className="flex items-center gap-3">
                                    <FaUser
                                       size={16}
                                       className="text-cyan-300"
                                    />
                                    <span className="text-lg font-bold tracking-wider text-cyan-300 italic select-none">
                                       {corrigirTextoCorrompido(
                                          recursosFiltrados.find(
                                             (r: RecursoStats) =>
                                                r.COD_RECURSO ===
                                                selectedRecurso
                                          )?.NOME_RECURSO ||
                                             'Recurso selecionado'
                                       )}
                                    </span>
                                 </div>
                              ) : (
                                 <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white"></div>
                                    <p className="text-sm font-semibold tracking-wider text-white italic select-none">
                                       Selecione um recurso na lista à esquerda.
                                    </p>
                                 </div>
                              )}
                           </div>

                           {/* Select cliente formulário */}
                           <div className="flex flex-col gap-1">
                              <label className="text-sm font-semibold tracking-wider text-white select-none">
                                 Cliente
                              </label>
                              <select
                                 value={formData.cliente}
                                 onChange={e =>
                                    handleInputChange('cliente', e.target.value)
                                 }
                                 className="w-full cursor-pointer rounded-md bg-white/20 px-4 py-2 text-base font-semibold tracking-wider text-white shadow-sm shadow-white transition-all select-none hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                              >
                                 <option
                                    value=""
                                    className="cursor-pointer font-semibold tracking-wider text-black italic select-none"
                                 >
                                    Selecione um cliente
                                 </option>
                                 {clientes.map(
                                    (cliente: {
                                       cod_cliente: number;
                                       nome_cliente: string;
                                    }) => (
                                       <option
                                          key={cliente.cod_cliente}
                                          value={cliente.cod_cliente}
                                          className="cursor-pointer font-semibold tracking-wider text-black italic select-none"
                                       >
                                          {corrigirTextoCorrompido(
                                             cliente.nome_cliente
                                          )}
                                       </option>
                                    )
                                 )}
                              </select>
                           </div>

                           {/* Notificações por email */}
                           <div className="flex flex-col gap-4 rounded-md bg-white/20 p-4 shadow-sm shadow-white">
                              <div className="flex items-center gap-3">
                                 <MdEmail className="text-white" size={24} />
                                 <h4 className="text-lg font-bold tracking-wider text-white select-none">
                                    Notificações por Email
                                 </h4>
                              </div>
                              <div className="flex flex-col gap-2 px-6">
                                 <label className="flex items-start gap-3">
                                    <input
                                       type="checkbox"
                                       checked={formData.enviarEmailCliente}
                                       onChange={e =>
                                          handleInputChange(
                                             'enviarEmailCliente',
                                             e.target.checked
                                          )
                                       }
                                       className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-700 bg-white text-blue-600"
                                    />
                                    <div>
                                       <span className="cursor-pointer text-base font-semibold tracking-wider text-white select-none">
                                          Enviar email para o cliente
                                       </span>
                                       <p className="text-sm font-semibold tracking-wider text-slate-300 italic select-none">
                                          O cliente receberá uma notificação
                                          sobre a atribuição.
                                       </p>
                                    </div>
                                 </label>

                                 <label className="flex cursor-pointer items-start space-x-3">
                                    <input
                                       type="checkbox"
                                       checked={formData.enviarEmailRecurso}
                                       onChange={e =>
                                          handleInputChange(
                                             'enviarEmailRecurso',
                                             e.target.checked
                                          )
                                       }
                                       className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-700 bg-white text-blue-600"
                                    />
                                    <div>
                                       <span className="cursor-pointer text-base font-semibold tracking-wider text-white select-none">
                                          Enviar email para o recurso
                                       </span>
                                       <p className="text-sm font-semibold tracking-wider text-slate-300 italic select-none">
                                          O recurso receberá uma notificação
                                          sobre o chamado.
                                       </p>
                                    </div>
                                 </label>
                              </div>
                              {errors.root && (
                                 <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400"></div>
                                    <p className="text-sm font-semibold tracking-wider text-red-400 italic select-none">
                                       {errors.root}
                                    </p>
                                 </div>
                              )}
                           </div>

                           {/* Botões formulário */}
                           <div className="flex items-center justify-end gap-6 border-t-4 border-slate-500 pt-6">
                              <button
                                 onClick={handleLimparFormulario}
                                 disabled={atribuirMutation.isPending}
                                 className="cursor-pointer rounded-xl border-none bg-red-600 px-6 py-2 text-lg font-bold tracking-wider text-white transition-all select-none hover:scale-105 hover:bg-red-900 hover:shadow-md hover:shadow-white active:scale-95"
                              >
                                 Limpar
                              </button>

                              <button
                                 onClick={handleAtribuir}
                                 disabled={
                                    !isFormValid() || atribuirMutation.isPending
                                 }
                                 className="flex cursor-pointer items-center gap-2 rounded-xl border-none bg-blue-600 px-6 py-2 text-lg font-bold tracking-wider text-white transition-all select-none hover:scale-105 hover:bg-blue-900 hover:shadow-md hover:shadow-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                 {atribuirMutation.isPending && (
                                    <Loader2
                                       className="animate-spin"
                                       size={16}
                                    />
                                 )}
                                 <span>
                                    {atribuirMutation.isPending
                                       ? 'Atribuindo...'
                                       : 'Atribuir'}
                                 </span>
                              </button>
                           </div>

                           {/* Informações importantes */}
                           <div className="flex flex-col gap-3 rounded-md bg-yellow-600/30 p-4 shadow-sm shadow-white">
                              <h5 className="text-lg font-semibold tracking-wider text-yellow-500 select-none">
                                 Informações importantes:
                              </h5>
                              <ul className="pl-4 text-sm font-semibold tracking-wider text-yellow-200 italic select-none">
                                 <li className="flex items-start gap-2">
                                    <span className="text-yellow-200">•</span>
                                    Selecione um recurso da lista para continuar
                                 </li>
                                 <li className="flex items-start gap-2">
                                    <span className="text-yellow-200">•</span>
                                    Pelo menos uma opção de email deve ser
                                    selecionada
                                 </li>
                              </ul>
                           </div>
                        </div>
                     </div>
                  </section>
               </div>
            </motion.div>
         </motion.div>
      </AnimatePresence>
   );
};

export default ModalAtribuicaoInteligente;
