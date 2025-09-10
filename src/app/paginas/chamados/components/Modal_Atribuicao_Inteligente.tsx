import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import {
   User,
   AlertTriangle,
   CheckCircle,
   Loader2,
   Mail,
   Send,
} from 'lucide-react';
import { SiTarget } from 'react-icons/si';
import {
   FaCheckCircle,
   FaClock,
   FaExclamationTriangle,
   FaFilter,
   FaSearch,
   FaUser,
} from 'react-icons/fa';
import { IoAlertCircle, IoBarChart, IoClose } from 'react-icons/io5';
import { FaShield } from 'react-icons/fa6';
import { ImUsers } from 'react-icons/im';
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '../../../../components/ui/tooltip';
import { FiActivity } from 'react-icons/fi';
import { BsAwardFill } from 'react-icons/bs';
import { BiSolidZap } from 'react-icons/bi';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
import { HiTrendingUp } from 'react-icons/hi';
import { ImTarget } from 'react-icons/im';
import { FaFlag } from 'react-icons/fa';
import { FaCalendarAlt } from 'react-icons/fa';
import { FaMessage } from 'react-icons/fa6';
import { MdMessage } from 'react-icons/md';

// Schema de validação com Zod para o formulário
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
      justificativa: z.string().optional(),
   })
   .refine(data => data.enviarEmailCliente || data.enviarEmailRecurso, {
      message: 'Pelo menos um método de notificação deve ser selecionado',
      path: ['root'],
   });

type FormData = z.infer<typeof formSchema>;
type FormErrors = Partial<Record<keyof FormData | 'root', string>>;

// Interfaces
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

interface SugestaoRecurso {
   COD_RECURSO: number;
   NOME_RECURSO: string;
   EMAIL_RECURSO: string;
   SCORE_ADEQUACAO: number;
   ADEQUACAO: 'EXCELENTE' | 'BOM' | 'MODERADO' | 'BAIXO' | 'INADEQUADO';
   RECOMENDACAO: string;
   VANTAGENS: string[];
   DESVANTAGENS: string[];
   CHAMADOS_ATIVOS: number;
   CHAMADOS_CRITICOS: number;
   ALTA_PRIORIDADE: number;
   HISTORICO_CLIENTE?: {
      CHAMADOS_CLIENTE: number;
      TEMPO_MEDIO_RESOLUCAO: number;
      CONCLUIDOS: number;
   };
}

interface ModalAtribuicaoInteligenteProps {
   isOpen: boolean;
   onClose: () => void;
   chamado: ChamadoProps | null;
   onAtribuicaoSuccess?: () => void;
}

const ModalAtribuicaoInteligente: React.FC<ModalAtribuicaoInteligenteProps> = ({
   isOpen,
   onClose,
   chamado,
   onAtribuicaoSuccess,
}) => {
   const [selectedRecurso, setSelectedRecurso] = useState<number | null>(null);
   const [showDetails, setShowDetails] = useState<number | null>(null);

   const [novoChamado, setNovoChamado] = useState({
      prioridade: 100,
      codCliente: '',
      assunto: '',
   });

   // Estados do formulário
   const [formData, setFormData] = useState<FormData>({
      cliente: '',
      enviarEmailCliente: false,
      enviarEmailRecurso: false,
      justificativa: '',
   });
   const [errors, setErrors] = useState<FormErrors>({});
   const [success, setSuccess] = useState(false);
   const [showSugestao, setShowSugestao] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
   const [filtroRecomendacao, setFiltroRecomendacao] =
      useState<string>('TODOS');

   const [showOverlay, setShowOverlay] = useState(false);
   const [overlayContent, setOverlayContent] = useState<{
      title: string;
      message: string;
      type: 'info' | 'warning' | 'error' | 'success';
   } | null>(null);

   const queryClient = useQueryClient();

   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   // Reset estados quando modal abre/fecha
   useEffect(() => {
      if (isOpen) {
         setSelectedRecurso(null);
         setShowDetails(null);
         setFormData({
            cliente: chamado?.COD_CLIENTE?.toString() || '',
            enviarEmailCliente: false,
            enviarEmailRecurso: false,
            justificativa: '',
         });
         setErrors({});
         setSuccess(false);
      }
   }, [isOpen, chamado]);

   const {
      data: recursosData,
      isLoading: loadingRecursos,
      refetch: refetchRecursos,
      error: errorRecursos,
   } = useQuery({
      queryKey: ['dashboard-recursos'],
      queryFn: async () => {
         try {
            const response = await fetch('/api/dashboard/recursos', {
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

   // Filtrar recursos
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

   // Função para mostrar overlay
   const showOverlayMessage = (
      title: string,
      message: string,
      type: 'info' | 'warning' | 'error' | 'success' = 'info'
   ) => {
      setOverlayContent({ title, message, type });
      setShowOverlay(true);
   };

   // Hook para buscar clientes
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
         const response = await fetch('/api/dashboard/sugestao-recurso', {
            method: 'POST',
            headers: {
               Authorization: `Bearer ${token}`,
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(novoChamado),
         });
         if (!response.ok) throw new Error('Erro ao buscar sugestão');
         return response.json();
      },
      enabled: showSugestao && !!token && novoChamado.prioridade > 0,
   });

   // Query para buscar recursos gerais

   // Query para buscar detalhes de um recurso específico
   const {
      data: recursoDetalhado,
      isLoading: loadingDetalhe,
      error: errorDetalhe,
   } = useQuery({
      queryKey: ['dashboard-recurso', selectedRecurso],
      queryFn: async () => {
         try {
            const response = await fetch(
               `/api/dashboard/recurso/${selectedRecurso}`,
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

   // Mutation para atribuir chamado com integração de email
   const atribuirMutation = useMutation({
      mutationFn: async ({
         codRecurso,
         codCliente,
         enviarEmailCliente,
         enviarEmailRecurso,
         justificativa,
      }: {
         codRecurso: number;
         codCliente: number;
         enviarEmailCliente: boolean;
         enviarEmailRecurso: boolean;
         justificativa: string;
      }) => {
         const response = await fetch(
            `/api/chamados/${chamado?.COD_CHAMADO}/atribuir-com-email`,
            {
               method: 'POST',
               headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                  codRecurso,
                  codCliente,
                  enviarEmailCliente,
                  enviarEmailRecurso,
                  justificativa,
               }),
            }
         );

         if (!response.ok) throw new Error('Erro ao atribuir chamado');
         return response.json();
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['chamadosAbertos'] });
         queryClient.invalidateQueries({ queryKey: ['dashboard-recursos'] });
         setSuccess(true);
         onAtribuicaoSuccess?.();
         setTimeout(() => {
            onClose();
         }, 2000);
      },
      onError: error => {
         console.error('Erro ao atribuir:', error);
         setErrors({ root: 'Erro ao atribuir chamado' });
      },
   });

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

   const getRecomendacaoColor = (recomendacao: string) => {
      const colors = {
         DISPONÍVEL: 'green-600',
         MODERADO: 'yellow-500',
         SOBRECARREGADO: 'orange-600',
         CRÍTICO: 'red-600',
      };
      return (
         colors[recomendacao as keyof typeof colors] ||
         'from-slate-500 to-slate-600'
      );
   };

   // Função para obter ícone da recomendação
   const getRecomendacaoIcon = (recomendacao: string) => {
      const icons = {
         DISPONÍVEL: FaCheckCircle,
         MODERADO: FaClock,
         SOBRECARREGADO: FaExclamationTriangle,
         CRÍTICO: IoAlertCircle,
      };
      const Icon = icons[recomendacao as keyof typeof icons] || FiActivity;
      return <Icon size={16} />;
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

      // Limpa erro do campo específico
      if (errors[name]) {
         setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
         });
      }

      // Validação em tempo real
      if (typeof value === 'string' && value.length > 0) {
         setTimeout(() => validateField(name, value), 300);
      } else if (typeof value === 'boolean') {
         validateField(name, value);
      }
   };

   // Função para selecionar recurso
   const handleSelectRecurso = (recursoId: number) => {
      setSelectedRecurso(recursoId);
      setShowSugestao(false);
   };

   // Função para obter prioridade visual
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

   // Verifica se o formulário é válido
   const isFormValid = () => {
      const realErrors = Object.fromEntries(
         Object.entries(errors).filter(([key, value]) => value !== undefined)
      );

      const hasNoErrors = Object.keys(realErrors).length === 0;
      const hasCliente = formData.cliente !== '';
      const hasRecursoSelected = selectedRecurso !== null;
      const hasEmailSelected =
         formData.enviarEmailCliente || formData.enviarEmailRecurso;

      return (
         hasNoErrors && hasCliente && hasRecursoSelected && hasEmailSelected
      );
   };

   const handleAtribuir = () => {
      if (!selectedRecurso || !validateForm()) return;

      atribuirMutation.mutate({
         codRecurso: selectedRecurso,
         codCliente: Number(formData.cliente),
         enviarEmailCliente: formData.enviarEmailCliente,
         enviarEmailRecurso: formData.enviarEmailRecurso,
         justificativa: formData.justificativa || '',
      });
   };

   if (!isOpen || !chamado) return null;

   const prioridadeInfo = getPrioridadeInfo(chamado.PRIOR_CHAMADO);

   // ================================================================================
   // RENDERIZAÇÃO PRINCIPAL
   // ================================================================================
   return (
      <AnimatePresence>
         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}
         >
            <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-gray-700 bg-gray-900"
            >
               {/* ===== HEADER ===== */}
               <header className="border-b border-slate-700 bg-slate-950 p-6">
                  {/* ===== CABEÇALHO ===== */}
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="rounded-md bg-blue-600 p-4 shadow-sm shadow-white">
                           <ImTarget size={28} className="text-white" />
                        </div>

                        <div>
                           <h2 className="text-2xl font-extrabold tracking-wider text-white select-none">
                              Atribuição Inteligente
                           </h2>
                           <p className="text-lg font-semibold tracking-widest text-slate-300 italic select-none">
                              Chamado #{chamado.COD_CHAMADO}
                           </p>
                        </div>
                     </div>

                     <button
                        onClick={onClose}
                        className="cursor-pointer rounded-full bg-red-800 p-3 text-white transition-all hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95"
                     >
                        <IoClose size={24} />
                     </button>
                  </div>
                  {/* ==================== */}

                  {/* ===== INFORMAÇÕES DO CHAMADO ===== */}
                  <div className="mt-4 grid grid-cols-4 gap-4">
                     <div className="rounded-md bg-white/20 px-4 py-2 shadow-sm shadow-white">
                        <div className="flex items-center gap-3">
                           <FaFlag className="text-white" size={18} />
                           <span className="text-sm font-semibold tracking-wider text-white italic select-none">
                              Prioridade
                           </span>
                        </div>
                        <div
                           className={`mt-1 inline-flex items-center rounded-md px-4 py-1 text-sm font-semibold tracking-wider select-none ${prioridadeInfo.bgColor} ${prioridadeInfo.color}`}
                        >
                           {prioridadeInfo.label} ({chamado.PRIOR_CHAMADO})
                        </div>
                     </div>
                     {/* ==================== */}

                     <div className="rounded-md bg-white/20 px-4 py-2 shadow-sm shadow-white">
                        <div className="flex items-center gap-3">
                           <FaUser className="text-white" size={16} />
                           <span className="text-sm font-semibold tracking-wider text-white italic select-none">
                              Cliente
                           </span>
                        </div>
                        <p className="mt-1 text-base font-semibold tracking-wider text-white select-none">
                           {chamado.NOME_CLIENTE}
                        </p>
                     </div>
                     {/* ==================== */}

                     <div className="rounded-md bg-white/20 px-4 py-2 shadow-sm shadow-white">
                        <div className="flex items-center gap-3">
                           <FaCalendarAlt className="text-white" size={16} />
                           <span className="text-sm font-semibold tracking-wider text-white italic select-none">
                              Data
                           </span>
                        </div>
                        <p className="mt-1 text-base font-semibold tracking-wider text-white select-none">
                           {new Date(chamado.DATA_CHAMADO).toLocaleDateString(
                              'pt-BR'
                           )}
                        </p>
                     </div>
                     {/* ==================== */}

                     <div className="rounded-md bg-white/20 px-4 py-2 shadow-sm shadow-white">
                        <div className="flex items-center gap-3">
                           <MdMessage className="text-white" size={16} />
                           <span className="text-sm font-semibold tracking-wider text-white italic select-none">
                              Status
                           </span>
                        </div>
                        <p className="mt-1 text-base font-semibold tracking-wider text-white select-none">
                           {chamado.STATUS_CHAMADO}
                        </p>
                     </div>
                  </div>
                  {/* ==================== */}

                  <div className="mt-4 flex items-center justify-between gap-4">
                     <div className="w-[700px] rounded-md bg-white/20 px-4 py-2 shadow-sm shadow-white">
                        <div className="mb-2 flex items-center space-x-2">
                           <FaMessage className="text-white" size={16} />
                           <span className="text-sm font-semibold tracking-wider text-white italic select-none">
                              Assunto
                           </span>
                        </div>
                        <p className="mt-1 text-base font-semibold tracking-wider text-white select-none">
                           {corrigirTextoCorrompido(chamado.ASSUNTO_CHAMADO)}
                        </p>
                     </div>

                     {/* ===== CARDS ===== */}
                     {recursosData?.resumoGeral && (
                        <div className="grid flex-1 grid-cols-4 gap-4">
                           {[
                              {
                                 title: 'Chamados Ativos',
                                 value: recursosData.resumoGeral
                                    .totalChamadosAtivos,
                                 icon: FiActivity,
                                 gradient: 'blue-500',
                                 bgGradient: 'blue-600',
                              },
                              {
                                 title: 'Chamados Críticos',
                                 value: recursosData.resumoGeral
                                    .totalChamadosCriticos,
                                 icon: IoAlertCircle,
                                 gradient: 'red-500',
                                 bgGradient: 'red-600',
                              },
                              {
                                 title: 'Recursos Disponíveis',
                                 value: recursosData.resumoGeral
                                    .recursosDisponiveis,
                                 icon: FaCheckCircle,
                                 gradient: 'green-500',
                                 bgGradient: 'green-600',
                              },
                              {
                                 title: 'Sobrecarregados',
                                 value: recursosData.resumoGeral
                                    .recursosSobrecarregados,
                                 icon: HiTrendingUp,
                                 gradient: 'orange-500',
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
                                    <div
                                       className={`rounded-md bg-${stat.gradient} p-2 shadow-md shadow-black`}
                                    >
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
                     {/* ==================== */}
                  </div>
               </header>
               {/* ==================== */}

               {/* ===== COLUNAS ===== */}
               <div className="flex h-full flex-1 space-x-6 overflow-hidden p-6">
                  {/* ===== RECURSOS ===== */}
                  <div className="overflow-hidden rounded-md border border-slate-600 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                     <div className="border-b border-slate-600 p-6">
                        <div className="mb-4 flex items-center justify-between">
                           <h2 className="text-2xl font-extrabold tracking-wider text-white select-none">
                              Recursos do Sistema
                           </h2>
                           <Tooltip>
                              <TooltipTrigger asChild>
                                 <button
                                    onClick={() =>
                                       setShowSugestao(!showSugestao)
                                    }
                                    className="cursor-pointer rounded-md bg-green-600 p-3 shadow-sm shadow-white transition-all hover:scale-110 hover:bg-green-800 hover:shadow-md hover:shadow-white active:scale-95"
                                 >
                                    <SiTarget
                                       size={20}
                                       className="text-white"
                                    />
                                 </button>
                              </TooltipTrigger>
                              <TooltipContent
                                 side="top"
                                 align="center"
                                 sideOffset={8}
                                 className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
                              >
                                 Sugerir Recurso
                              </TooltipContent>
                           </Tooltip>
                        </div>

                        {/* Filtros */}
                        <div className="flex flex-col gap-6 sm:flex-row">
                           <div className="group relative flex-1 transition-all hover:scale-105">
                              <FaSearch
                                 className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-300"
                                 size={20}
                              />

                              <input
                                 type="text"
                                 placeholder="Buscar recurso..."
                                 value={searchTerm}
                                 onChange={e => setSearchTerm(e.target.value)}
                                 className="w-full rounded-md border border-slate-600 bg-white/10 py-3 pr-4 pl-12 text-white placeholder-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                              />
                           </div>

                           <div className="group relative transition-all hover:scale-105">
                              <FaFilter
                                 className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-300"
                                 size={16}
                              />
                              <select
                                 value={filtroRecomendacao}
                                 onChange={e =>
                                    setFiltroRecomendacao(e.target.value)
                                 }
                                 className="cursor-pointer rounded-md border border-slate-600 bg-white/10 py-3 pr-4 pl-12 text-slate-300 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                              >
                                 <option className="text-black" value="TODOS">
                                    Todos
                                 </option>
                                 <option
                                    className="text-black"
                                    value="DISPONÍVEL"
                                 >
                                    Disponível
                                 </option>
                                 <option
                                    className="text-black"
                                    value="MODERADO"
                                 >
                                    Moderado
                                 </option>
                                 <option
                                    className="text-black"
                                    value="SOBRECARREGADO"
                                 >
                                    Sobrecarregado
                                 </option>
                                 <option className="text-black" value="CRÍTICO">
                                    Crítico
                                 </option>
                              </select>
                           </div>
                        </div>
                     </div>

                     <div className="scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 max-h-[560px] space-y-4 overflow-y-auto p-6">
                        {recursosFiltrados.map((recurso: RecursoStats) => (
                           <Tooltip key={recurso.COD_RECURSO}>
                              <TooltipTrigger asChild>
                                 <div
                                    className={`cursor-pointer rounded-md bg-gradient-to-r from-slate-700/30 to-slate-800/30 p-4 shadow-sm shadow-white transition-all hover:-translate-y-1 hover:scale-101 ${
                                       selectedRecurso === recurso.COD_RECURSO
                                          ? 'border-cyan-500 ring-2 ring-cyan-500'
                                          : 'hover:border-2 hover:border-slate-600'
                                    }`}
                                    onClick={() =>
                                       handleSelectRecurso(recurso.COD_RECURSO)
                                    }
                                 >
                                    <div className="mb-4 flex items-center gap-4">
                                       <div className="rounded-xl bg-white/10 p-3 shadow-sm shadow-white">
                                          <FaUser
                                             size={20}
                                             className="text-white"
                                          />
                                       </div>
                                       <div className="flex w-full items-center justify-between">
                                          <h3 className="text-lg font-bold text-white">
                                             {recurso.NOME_RECURSO}
                                          </h3>

                                          <div
                                             className={`inline-flex items-center space-x-2 rounded-xl bg-${getRecomendacaoColor(recurso.RECOMENDACAO)} px-3 py-1 text-sm font-semibold tracking-wider text-black italic shadow-sm shadow-white select-none`}
                                          >
                                             {getRecomendacaoIcon(
                                                recurso.RECOMENDACAO
                                             )}
                                             <span>{recurso.RECOMENDACAO}</span>
                                          </div>
                                       </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-4">
                                       {[
                                          {
                                             label: 'Ativos',
                                             value: recurso.TOTAL_CHAMADOS_ATIVOS,
                                             color: 'text-cyan-400',
                                          },
                                          {
                                             label: 'Alta Prioridade',
                                             value: recurso.CHAMADOS_ALTA_PRIORIDADE,
                                             color: 'text-amber-400',
                                          },
                                          {
                                             label: 'Críticos',
                                             value: recurso.CHAMADOS_CRITICOS,
                                             color: 'text-red-400',
                                          },
                                          {
                                             label: 'Score',
                                             value: recurso.SCORE_CARGA_TRABALHO,
                                             color: 'text-violet-400',
                                          },
                                       ].map((metric, idx) => (
                                          <div
                                             key={idx}
                                             className="rounded-md border border-slate-600 bg-white/10 p-2 text-center"
                                          >
                                             <p className="mb-1 text-sm font-semibold tracking-wider text-slate-400 italic select-none">
                                                {metric.label}
                                             </p>
                                             <p
                                                className={`text-lg font-extrabold tracking-wider select-none ${metric.color}`}
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
                                 className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
                              >
                                 Clique para ver os detalhes do{' '}
                                 {recurso.NOME_RECURSO}
                              </TooltipContent>
                           </Tooltip>
                        ))}
                     </div>
                  </div>
                  {/* ==================== */}

                  {/* ===== DETALHES ===== */}
                  <div className="overflow-y-auto rounded-md border border-slate-600 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                     {showSugestao ? (
                        <div className="p-6">
                           <div className="mb-6 flex items-center gap-3">
                              <div className="rounded-md bg-green-600 p-3 shadow-md shadow-black">
                                 <SiTarget className="text-white" size={20} />
                              </div>
                              <h3 className="text-xl font-extrabold tracking-wider text-white select-none">
                                 Sugestão de Recurso
                              </h3>
                           </div>

                           <div className="space-y-6">
                              <div>
                                 <label className="mb-2 block text-sm font-semibold tracking-wider text-slate-300 select-none">
                                    Prioridade do Chamado
                                 </label>
                                 <input
                                    type="text"
                                    min="1"
                                    max="999"
                                    value={novoChamado.prioridade}
                                    onChange={e =>
                                       setNovoChamado(prev => ({
                                          ...prev,
                                          prioridade: Number(e.target.value),
                                       }))
                                    }
                                    className="w-full rounded-md border border-slate-600 bg-slate-700/50 p-3 font-semibold tracking-wider text-white select-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                                 />
                              </div>

                              <div>
                                 <label className="mb-2 block text-sm font-semibold tracking-wider text-slate-300 select-none">
                                    Código do Cliente (opcional)
                                 </label>
                                 <input
                                    type="text"
                                    value={novoChamado.codCliente}
                                    onChange={e =>
                                       setNovoChamado(prev => ({
                                          ...prev,
                                          codCliente: e.target.value,
                                       }))
                                    }
                                    className="w-full rounded-md border border-slate-600 bg-slate-700/50 p-3 font-semibold tracking-wider text-white select-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                                 />
                              </div>
                           </div>

                           {loadingSugestao && (
                              <div className="flex items-center justify-center py-12">
                                 <div className="relative">
                                    <Loader2
                                       className="animate-spin text-white"
                                       size={40}
                                    />
                                 </div>
                              </div>
                           )}

                           {sugestaoData?.sugestao?.recursoRecomendado && (
                              <div className="mt-8 rounded-md border border-green-600/30 bg-green-600/20 p-4">
                                 <div className="mb-4 flex items-center gap-3">
                                    <div className="rounded-md bg-green-600 p-3 shadow-sm shadow-black">
                                       <BsAwardFill
                                          className="text-white"
                                          size={20}
                                       />
                                    </div>
                                    <h4 className="text-lg font-extrabold tracking-wider text-white select-none">
                                       Melhor Opção
                                    </h4>
                                 </div>

                                 <div className="space-y-4">
                                    <div>
                                       <p className="text-center text-lg font-bold tracking-wider text-white select-none">
                                          {
                                             sugestaoData.sugestao
                                                .recursoRecomendado.NOME_RECURSO
                                          }
                                       </p>
                                       <div className="mt-2 flex items-center justify-center gap-4">
                                          <span className="rounded-xl bg-green-500 px-6 py-1 text-sm font-semibold tracking-wider text-black select-none">
                                             Score:{' '}
                                             {
                                                sugestaoData.sugestao
                                                   .recursoRecomendado
                                                   .SCORE_ADEQUACAO
                                             }
                                          </span>
                                          <span className="text-base font-extrabold tracking-wider text-white italic select-none">
                                             {
                                                sugestaoData.sugestao
                                                   .recursoRecomendado.ADEQUACAO
                                             }
                                          </span>
                                       </div>
                                    </div>

                                    <div className="rounded-xl bg-white/10 p-4">
                                       <p className="text-center text-sm font-semibold tracking-wider text-white italic select-none">
                                          {
                                             sugestaoData.sugestao
                                                .recursoRecomendado.RECOMENDACAO
                                          }
                                       </p>
                                    </div>

                                    {sugestaoData.sugestao.recursoRecomendado
                                       .VANTAGENS?.length > 0 && (
                                       <div className="space-y-2">
                                          <p className="text-base font-bold tracking-wider text-white select-none">
                                             Vantagens:
                                          </p>
                                          <div className="space-y-1">
                                             {sugestaoData.sugestao.recursoRecomendado.VANTAGENS.map(
                                                (
                                                   vantagem: string,
                                                   index: number
                                                ) => (
                                                   <div
                                                      key={index}
                                                      className="flex items-start space-x-2"
                                                   >
                                                      <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white"></div>
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

                           {sugestaoData?.recomendacoesGerais?.length > 0 && (
                              <div className="mt-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6 backdrop-blur-xl">
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
                        <div className="p-4">
                           <div className="mb-6 flex items-center gap-3">
                              <div className="rounded-md bg-blue-600 p-3 shadow-sm shadow-white">
                                 <FaUser className="text-white" size={20} />
                              </div>
                              <h3 className="text-xl font-extrabold tracking-wider text-white select-none">
                                 Detalhes do Recurso
                              </h3>
                           </div>

                           {loadingDetalhe ? (
                              <div className="flex flex-col items-center justify-center space-y-4 py-16">
                                 <div className="relative">
                                    <Loader2
                                       className="animate-spin text-cyan-400"
                                       size={48}
                                    />
                                 </div>
                                 <p className="text-center font-semibold tracking-wider text-slate-400 select-none">
                                    Carregando detalhes...
                                 </p>
                              </div>
                           ) : errorDetalhe ? (
                              <div className="space-y-6 rounded-md border border-red-500/50 bg-red-500/20 p-8 text-center">
                                 <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md bg-red-600 p-4 shadow-sm shadow-white">
                                    <FaExclamationTriangle
                                       className="text-white"
                                       size={28}
                                    />
                                 </div>
                                 <div className="mb-6 space-y-2">
                                    <p className="font-semibold tracking-wider text-white select-none">
                                       Erro ao carregar detalhes
                                    </p>
                                    <p className="text-sm tracking-wider text-slate-300 select-none">
                                       Não foi possível carregar as informações
                                       do recurso
                                    </p>
                                 </div>
                                 <button
                                    onClick={() => refetchRecursos()}
                                    className="rounded-md bg-red-600 px-6 py-2 text-base font-semibold tracking-wider text-white shadow-md shadow-black transition-all select-none hover:bg-red-900 hover:shadow-lg hover:shadow-black active:scale-95"
                                 >
                                    Tentar novamente
                                 </button>
                              </div>
                           ) : recursoDetalhado ? (
                              <div className="space-y-6">
                                 <div className="flex flex-col">
                                    <h4 className="text-2xl font-bold tracking-wider text-white italic select-none">
                                       {recursoDetalhado.recurso.NOME_RECURSO}
                                    </h4>
                                    <p className="font-semibold tracking-wider text-slate-400 select-none">
                                       {recursoDetalhado.recurso.EMAIL_RECURSO}
                                    </p>
                                 </div>

                                 <div className="space-y-4 rounded-md bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 shadow-sm shadow-white">
                                    <div className="flex items-center gap-3">
                                       <div className="rounded-md bg-purple-600 p-3 shadow-sm shadow-white">
                                          <IoBarChart
                                             className="text-white"
                                             size={20}
                                          />
                                       </div>
                                       <h5 className="text-lg font-extrabold tracking-wider text-white select-none">
                                          Resumo da Carga
                                       </h5>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                       {[
                                          {
                                             label: 'Chamados Ativos',
                                             value: recursoDetalhado.resumo
                                                .totalChamadosAtivos,
                                             color: 'text-cyan-400',
                                             bg: 'white/10',
                                          },
                                          {
                                             label: 'Críticos',
                                             value: recursoDetalhado.resumo
                                                .chamadosCriticos,
                                             color: 'text-red-400',
                                             bg: 'white/10',
                                          },
                                          {
                                             label: 'Atrasados',
                                             value: recursoDetalhado.resumo
                                                .chamadosAtrasados,
                                             color: 'text-amber-400',
                                             bg: 'white/10',
                                          },
                                          {
                                             label: 'Status',
                                             value: recursoDetalhado.resumo
                                                .statusCarga,
                                             color:
                                                recursoDetalhado.resumo
                                                   .statusCarga === 'LEVE'
                                                   ? 'text-emerald-400'
                                                   : recursoDetalhado.resumo
                                                          .statusCarga ===
                                                       'MODERADA'
                                                     ? 'text-amber-400'
                                                     : recursoDetalhado.resumo
                                                            .statusCarga ===
                                                         'PESADA'
                                                       ? 'text-orange-400'
                                                       : 'text-red-400',
                                             bg: 'white/10',
                                          },
                                       ].map((metric, idx) => (
                                          <div
                                             key={idx}
                                             className={`rounded-md bg-${metric.bg} border border-slate-600 p-2 text-center`}
                                          >
                                             <p className="mb-1 text-sm font-semibold tracking-wider text-slate-300 select-none">
                                                {metric.label}
                                             </p>
                                             <p
                                                className={`text-lg font-bold tracking-wider select-none ${metric.color}`}
                                             >
                                                {metric.value}
                                             </p>
                                          </div>
                                       ))}
                                    </div>
                                 </div>

                                 <div className="rounded-md bg-blue-600/20 p-4 shadow-sm shadow-white">
                                    <div className="flex items-center gap-3">
                                       <div className="rounded-sm bg-blue-600 p-1 shadow-sm shadow-white">
                                          <FaShield
                                             className="text-white"
                                             size={16}
                                          />
                                       </div>
                                       <h5 className="text-base font-extrabold tracking-wider text-white select-none">
                                          Recomendação
                                       </h5>
                                    </div>
                                    <div className="mt-4 flex items-center gap-3">
                                       <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white"></div>

                                       <p className="text-sm font-semibold tracking-wider text-slate-300 italic select-none">
                                          {recursoDetalhado.resumo.recomendacao}
                                       </p>
                                    </div>
                                 </div>

                                 {recursoDetalhado.alertas?.length > 0 && (
                                    <div className="rounded bg-red-600/20 p-4 shadow-sm shadow-white">
                                       <div className="flex items-center gap-3">
                                          <div className="rounded-md bg-red-600 p-1 shadow-sm shadow-white">
                                             <FaExclamationTriangle
                                                className="text-white"
                                                size={16}
                                             />
                                          </div>
                                          <h5 className="text-base font-extrabold tracking-wider text-white select-none">
                                             Alertas
                                          </h5>
                                       </div>
                                       <div className="mt-4 space-y-2">
                                          {recursoDetalhado.alertas.map(
                                             (
                                                alerta: string,
                                                index: number
                                             ) => (
                                                <div
                                                   key={index}
                                                   className="flex items-start space-x-2"
                                                >
                                                   <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white"></div>
                                                   <p className="text-sm font-semibold tracking-wider text-slate-300 italic select-none">
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
                        <div className="p-6 text-center">
                           <div className="space-y-6 py-16">
                              <div className="relative mx-auto h-20 w-20">
                                 <ImUsers size={60} className="text-white" />
                              </div>
                              <div className="space-y-3">
                                 <p className="text-lg font-extrabold tracking-wider text-white select-none">
                                    Selecione um recurso
                                 </p>
                                 <p className="text-sm font-semibold tracking-wider text-slate-300 italic select-none">
                                    Clique em um recurso para ver detalhes ou no
                                    ícone de alvo para sugestões
                                 </p>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
                  {/* ==================== */}

                  {/* ===== FORMULÁRIO ===== */}
                  <div className="overflow-y-auto bg-gray-800 p-6">
                     <h3 className="mb-4 flex items-center text-lg font-semibold text-white">
                        <Send className="mr-2" size={20} />
                        Formulário de Atribuição
                     </h3>

                     {/* Alerta de sucesso */}
                     {success && (
                        <div className="mb-4 rounded-lg border border-green-600 bg-green-900 p-4">
                           <div className="flex items-center gap-3">
                              <CheckCircle
                                 className="text-green-400"
                                 size={20}
                              />
                              <p className="text-green-200">
                                 Chamado atribuído com sucesso!
                              </p>
                           </div>
                        </div>
                     )}

                     {/* Alerta de erro geral */}
                     {errors.root && (
                        <div className="mb-4 rounded-lg border border-red-600 bg-red-900 p-4">
                           <div className="flex items-center gap-3">
                              <AlertTriangle
                                 className="text-red-400"
                                 size={20}
                              />
                              <p className="text-red-200">{errors.root}</p>
                           </div>
                        </div>
                     )}

                     <div className="space-y-6">
                        {/* Recurso Selecionado */}
                        <div className="rounded-lg bg-gray-700 p-4">
                           <label className="mb-2 block text-sm font-medium text-gray-300">
                              Recurso Selecionado
                           </label>
                           <div className="flex items-center space-x-3">
                              <User size={18} className="text-gray-400" />
                              {selectedRecurso ? (
                                 <span className="font-semibold text-white">
                                    {recursosFiltrados.find(
                                       (r: RecursoStats) =>
                                          r.COD_RECURSO === selectedRecurso
                                    )?.NOME_RECURSO || 'Recurso selecionado'}
                                 </span>
                              ) : null}
                           </div>
                           {!selectedRecurso && (
                              <p className="mt-2 text-sm text-red-400">
                                 Selecione um recurso na lista à esquerda
                              </p>
                           )}
                        </div>

                        {/* Select Cliente */}
                        <div>
                           <label className="mb-2 block text-sm font-medium text-gray-300">
                              Cliente *
                           </label>
                           <select
                              value={formData.cliente}
                              onChange={e =>
                                 handleInputChange('cliente', e.target.value)
                              }
                              disabled={
                                 loadingClientes || atribuirMutation.isPending
                              }
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

                        {/* Notificações por Email */}
                        <div className="rounded-lg bg-gray-700 p-4">
                           <h4 className="mb-3 flex items-center font-medium text-white">
                              <Mail className="mr-2" size={18} />
                              Notificações por Email
                           </h4>
                           <div className="space-y-3">
                              {/* Email Cliente */}
                              <label className="flex cursor-pointer items-start space-x-3">
                                 <input
                                    type="checkbox"
                                    checked={formData.enviarEmailCliente}
                                    onChange={e =>
                                       handleInputChange(
                                          'enviarEmailCliente',
                                          e.target.checked
                                       )
                                    }
                                    className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                 />
                                 <div>
                                    <span className="font-medium text-white">
                                       Enviar email para o cliente
                                    </span>
                                    <p className="text-sm text-gray-400">
                                       O cliente receberá uma notificação sobre
                                       a atribuição
                                    </p>
                                 </div>
                              </label>

                              {/* Email Recurso */}
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
                                    className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                 />
                                 <div>
                                    <span className="font-medium text-white">
                                       Enviar email para o recurso
                                    </span>
                                    <p className="text-sm text-gray-400">
                                       O recurso receberá uma notificação sobre
                                       o chamado
                                    </p>
                                 </div>
                              </label>
                           </div>
                           {errors.root && (
                              <p className="mt-2 text-sm text-red-400">
                                 {errors.root}
                              </p>
                           )}
                        </div>

                        {/* Justificativa */}
                        <div>
                           <label className="mb-2 block text-sm font-medium text-gray-300">
                              Justificativa da Atribuição (opcional)
                           </label>
                           <textarea
                              value={formData.justificativa}
                              onChange={e =>
                                 handleInputChange(
                                    'justificativa',
                                    e.target.value
                                 )
                              }
                              placeholder="Descreva o motivo da escolha deste recurso..."
                              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                              rows={3}
                           />
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex items-center justify-between space-x-3 border-t border-gray-600 pt-4">
                           <button
                              onClick={() => {
                                 setFormData({
                                    cliente:
                                       chamado?.COD_CLIENTE?.toString() || '',
                                    enviarEmailCliente: false,
                                    enviarEmailRecurso: false,
                                    justificativa: '',
                                 });
                                 setErrors({});
                                 setSelectedRecurso(null);
                              }}
                              disabled={atribuirMutation.isPending}
                              className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              Limpar
                           </button>
                           <button
                              onClick={handleAtribuir}
                              disabled={
                                 !isFormValid() || atribuirMutation.isPending
                              }
                              className="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              {atribuirMutation.isPending && (
                                 <Loader2 className="animate-spin" size={16} />
                              )}
                              <span>
                                 {atribuirMutation.isPending
                                    ? 'Atribuindo...'
                                    : 'Atribuir Chamado'}
                              </span>
                           </button>
                        </div>

                        {/* Informações adicionais */}
                        <div className="rounded-lg border border-yellow-700 bg-yellow-900/30 p-3">
                           <h5 className="mb-2 text-sm font-medium text-yellow-200">
                              Informações importantes:
                           </h5>
                           <ul className="space-y-1 text-xs text-yellow-100">
                              <li className="flex items-start">
                                 <span className="mr-2 text-yellow-400">•</span>
                                 Selecione um recurso da lista para continuar
                              </li>
                              <li className="flex items-start">
                                 <span className="mr-2 text-yellow-400">•</span>
                                 Pelo menos uma opção de email deve ser
                                 selecionada
                              </li>
                              <li className="flex items-start">
                                 <span className="mr-2 text-yellow-400">•</span>
                                 A justificativa é opcional mas recomendada
                              </li>
                           </ul>
                        </div>
                     </div>

                     {/* Recomendações Gerais */}
                  </div>
                  {/* ==================== */}
               </div>
               {/* ================================================================================ */}
            </motion.div>
         </motion.div>
      </AnimatePresence>
   );
};

export default ModalAtribuicaoInteligente;
