import { z } from 'zod';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastCustom } from '../../../../../components/Toast_Custom';
import React, {
   useState,
   useEffect,
   useMemo,
   createContext,
   useContext,
   useCallback,
   useRef,
} from 'react';
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '../../../../../components/ui/tooltip';
// ================================================================================
import { TabelaChamadoProps } from '../../../../../types/types';
// ================================================================================
import { corrigirTextoCorrompido } from '../../../../../lib/corrigirTextoCorrompido';
import { useEmailAtribuirChamados } from '../../../../../hooks/useEmailAtribuirChamados';
// ================================================================================
import { Loader2 } from 'lucide-react';
import { IoIosSave } from 'react-icons/io';
import { FiActivity } from 'react-icons/fi';
import { BiSolidZap } from 'react-icons/bi';
import { HiTrendingUp } from 'react-icons/hi';
import { ImUsers, ImTarget } from 'react-icons/im';
import { MdMessage, MdEmail } from 'react-icons/md';
import { BsAwardFill, BsFillSendFill } from 'react-icons/bs';
import { FaShield, FaMessage as FaMessage6 } from 'react-icons/fa6';
import { IoAlertCircle, IoBarChart, IoClose } from 'react-icons/io5';
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
   FaMoon,
   FaSun,
} from 'react-icons/fa';

// ================================================================================
// INTERFACES E TIPOS (mantidas iguais)
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
// ==========

interface ModalAtribuicaoInteligenteProps {
   isOpen: boolean;
   onClose: () => void;
   chamado: TabelaChamadoProps | null;
   initialDarkMode?: boolean;
}
// ==========

interface OverlayContent {
   title: string;
   message: string;
   type: 'info' | 'warning' | 'error' | 'success';
}
// ==========

interface DarkModeProps {
   isDarkMode: boolean;
   toggleDarkMode: () => void;
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
// DARK MODE TOGGLE COMPONENT
// ================================================================================
const DarkModeContext = createContext<DarkModeProps>({
   isDarkMode: true,
   toggleDarkMode: () => {},
});

const useDarkMode = () => useContext(DarkModeContext);

const DarkModeToggle = () => {
   const { isDarkMode, toggleDarkMode } = useDarkMode();

   return (
      <Tooltip>
         <TooltipTrigger asChild>
            <button
               onClick={toggleDarkMode}
               className={`cursor-pointer rounded-full p-3 transition-all hover:scale-125 hover:rotate-180 active:scale-95 ${
                  isDarkMode
                     ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                     : 'bg-black text-white hover:bg-black/80'
               } hover:scale-110 active:scale-95`}
            >
               {isDarkMode ? <FaSun size={24} /> : <FaMoon size={24} />}
            </button>
         </TooltipTrigger>
         <TooltipContent
            side="bottom"
            align="center"
            sideOffset={8}
            className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black shadow-lg shadow-black select-none"
         >
            {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
         </TooltipContent>
      </Tooltip>
   );
};

// ================================================================================
// COMPONENTES UTILITÁRIOS ATUALIZADOS
// ================================================================================
const getThemeClasses = (isDark: boolean) => ({
   // Backgrounds
   modalBg: isDark ? 'bg-slate-800' : 'bg-white',
   headerBg: isDark ? 'bg-black' : 'bg-gray-100',
   sectionBg: isDark ? 'bg-black' : 'bg-gray-50',
   cardBg: isDark ? 'bg-slate-900' : 'bg-white',
   inputBg: isDark ? 'bg-white/20' : 'bg-black/10',
   overlayBg: isDark ? 'bg-white/20' : 'bg-black/10',

   // Borders
   border: isDark ? 'border-slate-400' : 'border-gray-300',
   sectionBorder: isDark ? 'border-slate-500' : 'border-black',
   cardBorder: isDark ? 'border-slate-700' : 'border-gray-200',
   headerBorder: isDark ? 'border-slate-500' : 'border-black',

   // Text colors
   primaryText: isDark ? 'text-white' : 'text-black',
   secondaryText: isDark ? 'text-slate-300' : 'text-gray-600',
   accentText: isDark ? 'text-cyan-300' : 'text-blue-600',
   mutedText: isDark ? 'text-slate-400' : 'text-gray-500',

   // Shadows
   shadow: isDark ? 'shadow-white' : 'shadow-gray-400',
   cardShadow: isDark ? 'shadow-sm shadow-white' : 'shadow-sm shadow-black',

   // Interactive states
   hover: isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100',
   focus: isDark ? 'focus:ring-pink-500' : 'focus:ring-blue-500',

   recomendacao: isDark ? 'bg-blue-600/50' : 'bg-blue-600',
   alerta: isDark ? 'bg-red-600/50' : 'bg-red-600',
   sugestao: isDark ? 'bg-green-600/50' : 'bg-green-600',

   // Alert backgrounds
   successBg: isDark ? 'bg-green-900' : 'bg-green-100',
   successBorder: isDark ? 'border-green-600' : 'border-green-400',
   successText: isDark ? 'text-green-200' : 'text-green-800',

   errorBg: isDark ? 'bg-red-900' : 'bg-red-100',
   errorBorder: isDark ? 'border-red-600' : 'border-red-400',
   errorText: isDark ? 'text-red-200' : 'text-red-800',

   warningBg: isDark ? 'bg-yellow-600/30' : 'bg-yellow-200',
   warningText: isDark ? 'text-yellow-200' : 'text-black',
});
// ==========

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
// ==========

const PrioridadeTag = ({ prioridade }: { prioridade: number }) => {
   const getPrioridadeInfo = (prioridade: number) => {
      if (prioridade <= 50)
         return { label: 'ALTA', color: 'text-red-800', bgColor: 'bg-red-400' };
      if (prioridade <= 100)
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
         className={`inline-flex items-center rounded-md px-4 py-0.5 text-sm font-extrabold tracking-wider shadow-sm ${prioridadeInfo.bgColor} ${prioridadeInfo.color} select-none`}
      >
         {prioridadeInfo.label} ({prioridade})
      </div>
   );
};
// ==========

const LoadingSpinner = ({ text = 'Carregando...' }: { text?: string }) => {
   const { isDarkMode } = useDarkMode();
   const theme = getThemeClasses(isDarkMode);

   return (
      <div className="flex flex-col items-center justify-center space-y-4 py-16">
         <div className="relative">
            <Loader2
               className={`animate-spin ${isDarkMode ? 'text-white' : 'text-gray-600'}`}
               size={48}
            />
         </div>
         <p
            className={`text-center text-base font-semibold tracking-wider ${theme.secondaryText} select-none`}
         >
            {text}
         </p>
      </div>
   );
};
// ==========

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
// ==========

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

export const ModalAtribuirChamado: React.FC<
   ModalAtribuicaoInteligenteProps
> = ({ isOpen, onClose, chamado, initialDarkMode = true }) => {
   // ================================================================================
   // DARK MODE STATE
   // ================================================================================
   const [isDarkMode, setIsDarkMode] = useState(initialDarkMode);

   const toggleDarkMode = () => {
      setIsDarkMode(!isDarkMode);
   };

   const theme = getThemeClasses(isDarkMode);

   // ================================================================================
   // ESTADOS - SELEÇÕES E MODAIS (mantidos iguais)
   // ================================================================================
   const [selectedRecurso, setSelectedRecurso] = useState<number | null>(null);
   const [showDetails, setShowDetails] = useState<number | null>(null);
   const [showSugestao, setShowSugestao] = useState(false);

   // ================================================================================
   // ESTADOS - FORMULÁRIOS E VALIDAÇÕES (mantidos iguais)
   // ================================================================================
   const [formData, setFormData] = useState<FormData>({
      cliente: '',
      enviarEmailCliente: false,
      enviarEmailRecurso: false,
   });
   const [errors, setErrors] = useState<FormErrors>({});
   const [success, setSuccess] = useState(false);

   // ================================================================================
   // ESTADOS - FILTROS E BUSCA (mantidos iguais)
   // ================================================================================
   const [searchTerm, setSearchTerm] = useState('');
   const [filtroRecomendacao, setFiltroRecomendacao] =
      useState<string>('TODOS');

   // ================================================================================
   // ESTADOS - OVERLAY E NOTIFICAÇÕES (mantidos iguais)
   // ================================================================================
   const [showOverlay, setShowOverlay] = useState(false);
   const [overlayContent, setOverlayContent] = useState<OverlayContent | null>(
      null
   );

   // ================================================================================
   // ESTADOS - SUGESTÃO DE RECURSO (mantidos iguais)
   // ================================================================================
   const [novoChamado, setNovoChamado] = useState({
      prioridade: 100,
      codCliente: '',
      assunto: '',
   });

   const toastShownRef = useRef(false);

   // ================================================================================
   // HOOKS E CONTEXTOS (mantidos iguais)
   // ================================================================================
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
   const atribuirMutation = useEmailAtribuirChamados();

   // ================================================================================
   // FUNÇÕES DE OVERLAY E NOTIFICAÇÕES (mantidas iguais)
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
   // QUERIES DE DADOS (mantidas iguais)
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
   // MEMOIZED VALUES (mantidos iguais)
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
   // EFEITOS E RESETS (mantidos iguais)
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

   const recursoSelecionadoNome = useMemo(() => {
      if (!selectedRecurso || !recursosFiltrados) return null;

      const recurso = recursosFiltrados.find(
         (r: RecursoStats) => r.COD_RECURSO === selectedRecurso
      );

      return recurso ? corrigirTextoCorrompido(recurso.NOME_RECURSO) : null;
   }, [selectedRecurso, recursosFiltrados]);

   const handleLimparFormulario = useCallback(() => {
      setFormData({
         cliente: chamado?.COD_CLIENTE?.toString() || '',
         enviarEmailCliente: false,
         enviarEmailRecurso: false,
      });
      setErrors({});
      setSelectedRecurso(null);
      setSearchTerm(''); // Limpa o campo de busca
      setFiltroRecomendacao('TODOS'); // Reseta o filtro para "Todos"
      setShowSugestao(false); // Fecha a sugestão se estiver aberta
      setShowDetails(null); // Limpa os detalhes se estiverem abertos
   }, [chamado]);

   // E substitua seu useEffect atual por este:
   useEffect(() => {
      if (atribuirMutation.isSuccess) {
         toast.custom(t => (
            <ToastCustom
               type="success"
               title="Operação realizada com sucesso!"
               description={`Chamado #${chamado?.COD_CHAMADO} atribuído${
                  recursoSelecionadoNome
                     ? ` para ${recursoSelecionadoNome}`
                     : ''
               } com sucesso.`}
            />
         ));

         // Limpa o formulário
         handleLimparFormulario();

         // Fecha o modal após um pequeno delay
         setTimeout(() => {
            onClose();
         }, 500);

         // Reset da mutation para evitar re-execuções
         atribuirMutation.reset();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
   // FUNÇÕES DE VALIDAÇÃO (mantidas iguais)
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
   // FUNÇÕES DE HANDLERS (mantidas iguais)
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

   // ================================================================================
   // RENDERIZAÇÃO CONDICIONAL
   // ================================================================================
   if (!isOpen || !chamado) return null;

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
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
                  className={`flex h-full w-full flex-col overflow-hidden rounded-2xl ${theme.border} ${theme.modalBg}`}
               >
                  {/* ===== HEADER ===== */}
                  <header
                     className={`flex flex-col gap-6 border-b-4 ${theme.headerBorder} ${theme.headerBg} p-6`}
                  >
                     {/* ===== CABEÇALHO ===== */}
                     <div className="flex items-center justify-between">
                        <div className="flex items-center justify-between gap-6">
                           <div
                              className={`rounded-md border-none bg-blue-600 p-3 ${theme.cardShadow}`}
                           >
                              <ImTarget size={28} className="text-white" />
                           </div>
                           <div>
                              <h2
                                 className={`text-2xl font-extrabold tracking-wider ${theme.primaryText} select-none`}
                              >
                                 Atribuir Chamado
                              </h2>
                              <div className="rounded-full bg-cyan-300 px-6 py-1">
                                 <p className="text-center text-base font-extrabold tracking-widest text-black italic select-none">
                                    Chamado #{chamado.COD_CHAMADO}
                                 </p>
                              </div>
                           </div>
                        </div>
                        {/* ===== */}

                        <div className="flex items-center gap-4">
                           {/* Botão dark mode */}
                           <DarkModeToggle />
                           {/* Botão fechar modal */}
                           <button
                              onClick={() => {
                                 handleLimparFormulario();
                                 onClose();
                              }}
                              className="cursor-pointer rounded-full bg-red-800 p-3 text-white transition-all hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95"
                           >
                              <IoClose size={24} />
                           </button>
                        </div>
                     </div>
                     {/* ========== */}

                     {/* ===== CARDS INFORMAÇÕES DOS CHAMADOS ===== */}
                     <div className="grid grid-cols-4 gap-4">
                        <div
                           className={`rounded-md ${theme.overlayBg} px-4 py-2 ${theme.cardShadow}`}
                        >
                           <div className="flex items-center gap-3">
                              <FaFlag className={theme.primaryText} size={18} />
                              <span
                                 className={`text-sm font-semibold tracking-wider ${theme.primaryText} italic select-none`}
                              >
                                 Prioridade
                              </span>
                           </div>
                           <div className="mt-1 ml-6">
                              <PrioridadeTag
                                 prioridade={chamado.PRIOR_CHAMADO}
                              />
                           </div>
                        </div>

                        <div
                           className={`rounded-md ${theme.overlayBg} px-4 py-2 ${theme.cardShadow}`}
                        >
                           <div className="flex items-center gap-3">
                              <FaUser className={theme.primaryText} size={16} />
                              <span
                                 className={`text-sm font-semibold tracking-wider ${theme.primaryText} italic select-none`}
                              >
                                 Cliente
                              </span>
                           </div>
                           <p
                              className={`mt-1 ml-6 text-base font-semibold tracking-wider ${theme.primaryText} select-none`}
                           >
                              {chamado.NOME_CLIENTE}
                           </p>
                        </div>

                        <div
                           className={`rounded-md ${theme.overlayBg} px-4 py-2 ${theme.cardShadow}`}
                        >
                           <div className="flex items-center gap-3">
                              <FaCalendarAlt
                                 className={theme.primaryText}
                                 size={16}
                              />
                              <span
                                 className={`text-sm font-semibold tracking-wider ${theme.primaryText} italic select-none`}
                              >
                                 Data
                              </span>
                           </div>
                           <p
                              className={`mt-1 ml-6 text-base font-semibold tracking-wider ${theme.primaryText} select-none`}
                           >
                              {new Date(
                                 chamado.DATA_CHAMADO
                              ).toLocaleDateString('pt-BR')}
                           </p>
                        </div>

                        <div
                           className={`rounded-md ${theme.overlayBg} px-4 py-2 ${theme.cardShadow}`}
                        >
                           <div className="flex items-center gap-3">
                              <MdMessage
                                 className={theme.primaryText}
                                 size={16}
                              />
                              <span
                                 className={`text-sm font-semibold tracking-wider ${theme.primaryText} italic select-none`}
                              >
                                 Status
                              </span>
                           </div>
                           <p
                              className={`mt-1 ml-6 text-base font-semibold tracking-wider ${theme.primaryText} select-none`}
                           >
                              {chamado.STATUS_CHAMADO}
                           </p>
                        </div>
                     </div>

                     {/* ===== ASSUNTO / CARDS DE MÉTRICAS ===== */}
                     <div className="flex items-center justify-between gap-4">
                        <div
                           className={`w-[700px] rounded-md ${theme.overlayBg} px-4 py-2 ${theme.cardShadow}`}
                        >
                           <div className="mb-2 flex items-center space-x-2">
                              <FaMessage6
                                 className={theme.primaryText}
                                 size={16}
                              />
                              <span
                                 className={`text-sm font-semibold tracking-wider ${theme.primaryText} italic select-none`}
                              >
                                 Assunto
                              </span>
                           </div>
                           <p
                              className={`mt-1 ml-6 text-base font-semibold tracking-wider ${theme.primaryText} select-none`}
                           >
                              {corrigirTextoCorrompido(
                                 chamado.ASSUNTO_CHAMADO ?? ''
                              )}
                           </p>
                        </div>

                        {/* Cards métricos */}
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
                                    className={`relative overflow-hidden rounded-md bg-${stat.bgGradient} ${theme.cardShadow} px-4 py-2`}
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

                  {/* ===== COLUNAS ===== */}
                  <div className="flex h-full flex-1 gap-6 overflow-hidden p-6">
                     {/* ===== COLUNA RECURSOS ===== */}
                     <section
                        className={`flex-[0_0_40%] overflow-hidden rounded-xl ${theme.sectionBorder} ${theme.sectionBg} ${theme.cardShadow}`}
                     >
                        {/* Cabeçalho e filtros */}
                        <div
                           className={`flex flex-col gap-6 border-b-4 ${theme.sectionBorder} p-6`}
                        >
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div
                                    className={`rounded-sm bg-blue-600 p-2 ${theme.cardShadow}`}
                                 >
                                    <FaUsers className="text-white" size={24} />
                                 </div>
                                 <h2
                                    className={`text-xl font-extrabold tracking-wider ${theme.primaryText} select-none`}
                                 >
                                    Recursos do Sistema
                                 </h2>
                              </div>
                              {/* ========== */}

                              {/* Botão sugestão */}
                              <Tooltip>
                                 <TooltipTrigger asChild>
                                    <button
                                       onClick={() =>
                                          setShowSugestao(!showSugestao)
                                       }
                                       className={`cursor-pointer rounded-md bg-green-600 p-2 ${theme.cardShadow} transition-all hover:-translate-y-1 hover:scale-102 hover:bg-green-900 hover:shadow-md hover:shadow-white active:scale-95`}
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
                                    className={`absolute top-1/2 left-4 -translate-y-1/2 ${theme.primaryText}`}
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
                                    onChange={e =>
                                       setSearchTerm(e.target.value)
                                    }
                                    onFocus={e => (e.target.placeholder = '')}
                                    onBlur={e => {
                                       if (e.target.value === '')
                                          e.target.placeholder =
                                             'Buscar recurso...';
                                    }}
                                    className={`input-busca-recurso w-full rounded-md border-none ${theme.inputBg} py-2 pl-12 text-base font-semibold tracking-wider ${theme.primaryText} ${isDarkMode ? 'placeholder-white' : 'placeholder-gray-500'} ${theme.cardShadow} select-none ${theme.focus} focus:ring-2 focus:outline-none`}
                                 />
                              </div>
                              {/* ========== */}

                              <div className="group relative transition-all hover:-translate-y-1 hover:scale-102">
                                 <FaFilter
                                    className={`absolute top-1/2 left-4 -translate-y-1/2 ${theme.primaryText}`}
                                    size={16}
                                 />
                                 <select
                                    value={filtroRecomendacao}
                                    onChange={e =>
                                       setFiltroRecomendacao(e.target.value)
                                    }
                                    className={`cursor-pointer rounded-md border-none ${theme.inputBg} py-2 pl-12 text-base font-semibold tracking-wider ${theme.primaryText} ${theme.cardShadow} transition-all select-none ${theme.focus} focus:ring-2 focus:outline-none`}
                                 >
                                    <option
                                       className="cursor-pointer bg-white text-base font-semibold tracking-wider text-black italic select-none"
                                       value="TODOS"
                                    >
                                       Todos
                                    </option>
                                    <option
                                       className="cursor-pointer bg-white text-base font-semibold tracking-wider text-black italic select-none"
                                       value="DISPONÍVEL"
                                    >
                                       Disponível
                                    </option>
                                    <option
                                       className="cursor-pointer bg-white text-base font-semibold tracking-wider text-black italic select-none"
                                       value="MODERADO"
                                    >
                                       Moderado
                                    </option>
                                    <option
                                       className="cursor-pointer bg-white text-base font-semibold tracking-wider text-black italic select-none"
                                       value="SOBRECARREGADO"
                                    >
                                       Sobrecarregado
                                    </option>
                                    <option
                                       className="cursor-pointer bg-white text-base font-semibold tracking-wider text-black italic select-none"
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
                                       className={`flex cursor-pointer flex-col gap-4 rounded-md ${theme.cardBg} p-4 ${theme.cardShadow} transition-all outline-none hover:-translate-y-1 hover:scale-102 active:scale-95`}
                                       onClick={() =>
                                          handleSelectRecurso(
                                             recurso.COD_RECURSO
                                          )
                                       }
                                    >
                                       <div className="flex items-center gap-3">
                                          <FaUser
                                             size={24}
                                             className={theme.primaryText}
                                          />
                                          <div className="flex w-full items-center justify-between">
                                             <h3
                                                className={`text-lg font-bold ${theme.primaryText}`}
                                             >
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
                                                <span>
                                                   {recurso.RECOMENDACAO}
                                                </span>
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
                                                className={`rounded-md ${theme.cardShadow} ${theme.overlayBg} p-2 text-center`}
                                             >
                                                <p
                                                   className={`text-sm font-semibold tracking-wider ${theme.primaryText} italic select-none`}
                                                >
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
                                    {corrigirTextoCorrompido(
                                       recurso.NOME_RECURSO
                                    )}
                                 </TooltipContent>
                              </Tooltip>
                           ))}
                        </div>
                     </section>
                     {/* ==================== */}

                     {/* ===== COLUNA DETALHES/SUGESTÃO ===== */}
                     <section
                        className={`flex-[0_0_25%] overflow-y-auto rounded-xl ${theme.sectionBorder} ${theme.sectionBg} ${theme.cardShadow} p-6`}
                     >
                        {showSugestao ? (
                           // ===== SUGESTÕES DE RECURSO =====
                           <div className="flex flex-col gap-8">
                              {/* Seleção de cliente para sugestão */}
                              <div className="flex flex-col gap-6">
                                 <div className="flex items-center gap-4">
                                    <div
                                       className={`rounded-md bg-blue-600 p-2 ${theme.cardShadow}`}
                                    >
                                       <ImTarget
                                          className="text-white"
                                          size={24}
                                       />
                                    </div>
                                    <h3
                                       className={`text-xl font-extrabold tracking-wider ${theme.primaryText} select-none`}
                                    >
                                       Sugestão de Recurso
                                    </h3>
                                 </div>

                                 <div className="flex flex-col gap-1">
                                    <label
                                       className={`text-sm font-semibold tracking-wider ${theme.primaryText} select-none`}
                                    >
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
                                       className={`w-full cursor-pointer rounded-md ${theme.inputBg} px-4 py-2 text-base font-semibold tracking-wider ${theme.primaryText} ${theme.cardShadow} transition-all select-none hover:-translate-y-1 hover:scale-102 ${theme.focus} focus:ring-2 focus:outline-none`}
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
                                 <div
                                    className={`flex flex-col gap-4 rounded-md p-4 ${theme.sugestao} ${theme.cardShadow}`}
                                 >
                                    <div className="flex items-center gap-4">
                                       <div
                                          className={`rounded-xl p-2 ${theme.cardShadow} ${theme.sugestao}`}
                                       >
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
                                                   .recursoRecomendado
                                                   .NOME_RECURSO
                                             }
                                          </p>
                                       </div>

                                       <div
                                          className={`rounded-md ${theme.overlayBg} p-2 ${theme.cardShadow}`}
                                       >
                                          <p className="text-center text-base font-semibold tracking-wider text-white uppercase italic select-none">
                                             {
                                                sugestaoData.sugestao
                                                   .recursoRecomendado
                                                   .RECOMENDACAO
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
                              {sugestaoData?.recomendacoesGerais?.length >
                                 0 && (
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
                                 <div
                                    className={`rounded-md bg-blue-600 p-2 ${theme.cardShadow}`}
                                 >
                                    <FaUser className="text-white" size={24} />
                                 </div>
                                 <h3
                                    className={`text-xl font-extrabold tracking-wider ${theme.primaryText} select-none`}
                                 >
                                    Detalhes do Recurso
                                 </h3>
                              </div>

                              {loadingDetalhe ? (
                                 <LoadingSpinner text="Carregando detalhes..." />
                              ) : errorDetalhe ? (
                                 <ErrorDisplay
                                    onRetry={() => refetchRecursos()}
                                 />
                              ) : recursoDetalhado ? (
                                 <div className="space-y-6">
                                    {/* Nome e email do recurso */}
                                    <div className="flex flex-col">
                                       <h4
                                          className={`text-xl font-bold tracking-wider ${theme.primaryText} italic select-none`}
                                       >
                                          {corrigirTextoCorrompido(
                                             recursoDetalhado.recurso
                                                .NOME_RECURSO
                                          )}
                                       </h4>
                                       <p
                                          className={`text-sm font-semibold tracking-wider ${theme.secondaryText} italic select-none`}
                                       >
                                          {
                                             recursoDetalhado.recurso
                                                .EMAIL_RECURSO
                                          }
                                       </p>
                                    </div>

                                    {/* Resumo da carga */}
                                    <div
                                       className={`space-y-4 rounded-md ${theme.cardBg} p-4 ${theme.cardShadow}`}
                                    >
                                       <div className="flex items-center gap-3">
                                          <IoBarChart
                                             className={theme.primaryText}
                                             size={24}
                                          />
                                          <h5
                                             className={`text-lg font-bold tracking-wider ${theme.primaryText} select-none`}
                                          >
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
                                                        : recursoDetalhado
                                                               .resumo
                                                               .statusCarga ===
                                                            'PESADA'
                                                          ? 'text-orange-500'
                                                          : 'text-red-500',
                                             },
                                          ].map((metric, idx) => (
                                             <div
                                                key={idx}
                                                className={`rounded-md ${theme.cardShadow} ${theme.overlayBg} p-2 text-center`}
                                             >
                                                <p
                                                   className={`text-sm font-semibold tracking-wider ${theme.primaryText} italic select-none`}
                                                >
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
                                    <div
                                       className={`flex flex-col gap-3 rounded-md p-4 ${theme.cardShadow} ${theme.recomendacao}`}
                                    >
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
                                             {
                                                recursoDetalhado.resumo
                                                   .recomendacao
                                             }
                                          </p>
                                       </div>
                                    </div>

                                    {/* Alertas */}
                                    {recursoDetalhado.alertas?.length > 0 && (
                                       <div
                                          className={`flex flex-col gap-3 rounded-md p-4 ${theme.cardShadow} ${theme.alerta}`}
                                       >
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
                                 <ImUsers
                                    size={80}
                                    className={theme.primaryText}
                                 />
                                 <div className="flex flex-col items-center gap-4">
                                    <p
                                       className={`text-xl font-extrabold tracking-wider ${theme.primaryText} select-none`}
                                    >
                                       Selecione um recurso
                                    </p>
                                    <p
                                       className={`text-center text-sm font-semibold tracking-wider ${theme.secondaryText} italic select-none`}
                                    >
                                       Clique em um recurso para ver os detalhes
                                    </p>
                                 </div>
                              </div>
                           </div>
                        )}
                     </section>
                     {/* ==================== */}

                     {/* ===== COLUNA FORMULÁRIO ===== */}
                     <section
                        className={`flex-[0_0_32.5%] overflow-y-auto rounded-xl ${theme.sectionBorder} ${theme.sectionBg} ${theme.cardShadow} p-6`}
                     >
                        <div className="flex flex-col gap-6">
                           {/* Cabeçalho formulário */}
                           <div className="flex items-center gap-4">
                              <div
                                 className={`rounded-md bg-blue-600 p-2 ${theme.cardShadow}`}
                              >
                                 <BsFillSendFill
                                    className="text-white"
                                    size={24}
                                 />
                              </div>
                              <p
                                 className={`text-xl font-extrabold tracking-wider ${theme.primaryText} select-none`}
                              >
                                 Formulário de Atribuição
                              </p>
                           </div>

                           {/* Alerta sucesso formulário */}
                           {success && (
                              <div
                                 className={`mb-4 rounded-lg ${theme.successBorder} ${theme.successBg} p-4`}
                              >
                                 <div className="flex items-center gap-3">
                                    <FaCheckCircle
                                       className="text-green-400"
                                       size={20}
                                    />
                                    <p className={theme.successText}>
                                       Chamado atribuído com sucesso!
                                    </p>
                                 </div>
                              </div>
                           )}
                           {/* Alerta erro formulário */}
                           {errors.root && (
                              <div
                                 className={`mb-4 rounded-lg ${theme.errorBorder} ${theme.errorBg} p-4`}
                              >
                                 <div className="flex items-center gap-3">
                                    <FaExclamationTriangle
                                       className="text-red-400"
                                       size={20}
                                    />
                                    <p className={theme.errorText}>
                                       {errors.root}
                                    </p>
                                 </div>
                              </div>
                           )}

                           {/* Formulário */}
                           <div className="flex flex-col gap-6">
                              {/* Recurso selecionado */}
                              <div
                                 className={`flex flex-col gap-3 rounded-md ${theme.overlayBg} p-4 ${theme.cardShadow}`}
                              >
                                 <label
                                    className={`text-lg font-extrabold tracking-wider ${theme.primaryText} select-none`}
                                 >
                                    Recurso Selecionado
                                 </label>
                                 {selectedRecurso ? (
                                    <div className="flex items-center gap-3">
                                       <FaUser
                                          size={16}
                                          className={theme.accentText}
                                       />
                                       <span
                                          className={`text-lg font-bold tracking-wider ${theme.accentText} italic select-none`}
                                       >
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
                                       <div
                                          className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${isDarkMode ? 'bg-white' : 'bg-gray-600'}`}
                                       ></div>
                                       <p
                                          className={`text-sm font-semibold tracking-wider ${theme.primaryText} italic select-none`}
                                       >
                                          Selecione um recurso na lista à
                                          esquerda.
                                       </p>
                                    </div>
                                 )}
                              </div>

                              {/* Select cliente formulário */}
                              <div className="flex flex-col gap-1">
                                 <label
                                    className={`text-sm font-semibold tracking-wider ${theme.primaryText} select-none`}
                                 >
                                    Cliente
                                 </label>
                                 <select
                                    value={formData.cliente}
                                    onChange={e =>
                                       handleInputChange(
                                          'cliente',
                                          e.target.value
                                       )
                                    }
                                    className={`w-full cursor-pointer rounded-md ${theme.inputBg} px-4 py-2 text-base font-semibold tracking-wider ${theme.primaryText} ${theme.cardShadow} transition-all select-none hover:-translate-y-1 hover:scale-102 ${theme.focus} focus:ring-2 focus:outline-none`}
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
                              <div
                                 className={`flex flex-col gap-4 rounded-md ${theme.overlayBg} p-4 ${theme.cardShadow}`}
                              >
                                 <div className="flex items-center gap-3">
                                    <MdEmail
                                       className={theme.primaryText}
                                       size={24}
                                    />
                                    <h4
                                       className={`text-lg font-bold tracking-wider ${theme.primaryText} select-none`}
                                    >
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
                                          <span
                                             className={`cursor-pointer text-base font-semibold tracking-wider ${theme.primaryText} select-none`}
                                          >
                                             Enviar email para o cliente
                                          </span>
                                          <p
                                             className={`text-sm font-semibold tracking-wider ${theme.secondaryText} italic select-none`}
                                          >
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
                                          <span
                                             className={`cursor-pointer text-base font-semibold tracking-wider ${theme.primaryText} select-none`}
                                          >
                                             Enviar email para o recurso
                                          </span>
                                          <p
                                             className={`text-sm font-semibold tracking-wider ${theme.secondaryText} italic select-none`}
                                          >
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
                              <div
                                 className={`flex items-center justify-end gap-6 border-t-4 ${theme.sectionBorder} pt-6`}
                              >
                                 <button
                                    onClick={handleLimparFormulario}
                                    disabled={atribuirMutation.isPending}
                                    className="cursor-pointer rounded-xl border-none bg-red-500 px-6 py-2 text-lg font-extrabold tracking-wider text-white shadow-sm shadow-black transition-all select-none hover:scale-105 hover:bg-red-900 hover:shadow-md hover:shadow-black active:scale-95"
                                 >
                                    Limpar
                                 </button>

                                 <button
                                    onClick={handleAtribuir}
                                    disabled={
                                       !isFormValid() ||
                                       atribuirMutation.isPending
                                    }
                                    className={`cursor-pointer rounded-xl border-none bg-blue-500 px-6 py-2 text-lg font-extrabold tracking-wider text-white shadow-sm shadow-black select-none ${
                                       atribuirMutation.isPending ||
                                       !isFormValid()
                                          ? 'disabled:cursor-not-allowed disabled:opacity-50'
                                          : 'transition-all hover:scale-105 hover:bg-blue-900 hover:shadow-md hover:shadow-black active:scale-95'
                                    }`}
                                 >
                                    {atribuirMutation.isPending ? (
                                       <div className="flex items-center gap-2">
                                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                          <span>Salvando...</span>
                                       </div>
                                    ) : (
                                       <div className="flex items-center gap-1">
                                          <IoIosSave
                                             className="mr-2 inline-block"
                                             size={20}
                                          />
                                          <span>Atribuir</span>
                                       </div>
                                    )}
                                 </button>
                              </div>

                              {/* Informações importantes */}
                              <div
                                 className={`flex flex-col gap-3 rounded-md ${theme.warningBg} p-4 ${theme.cardShadow}`}
                              >
                                 <h5
                                    className={`text-lg font-semibold tracking-wider ${isDarkMode ? 'text-yellow-500' : 'text-black'} select-none`}
                                 >
                                    Informações importantes:
                                 </h5>
                                 <ul
                                    className={`pl-4 text-sm font-semibold tracking-wider ${theme.warningText} italic select-none`}
                                 >
                                    <li className="flex items-start gap-2">
                                       <span className={theme.warningText}>
                                          •
                                       </span>
                                       Selecione um recurso da lista para
                                       continuar
                                    </li>
                                    <li className="flex items-start gap-2">
                                       <span className={theme.warningText}>
                                          •
                                       </span>
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
      </DarkModeContext.Provider>
   );
};
