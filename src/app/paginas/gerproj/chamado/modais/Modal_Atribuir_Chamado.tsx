// IMPORTS
import { z } from 'zod';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect, useMemo, useCallback } from 'react';

// COMPONENTS
import {
   DropdownRecomendacao,
   DropdownCliente,
} from '../Dropdowns_Selects_Modal_Atribuir_Chamado';
import { LoadingButton } from '../../../../../components/Loading';
import { ToastCustom } from '../../../../../components/Toast_Custom';

// HOOKS
import { useEmailAtribuirChamados } from '../../../../../hooks/useEmailAtribuirChamados';

// TYPES
import { TabelaChamadoProps } from '../../../../../types/types';

// HELPERS
import { corrigirTextoCorrompido } from '../../../../../lib/corrigirTextoCorrompido';

// FORMATTERS
import {
   formatarCodNumber,
   formatCodChamado,
} from '../../../../../utils/formatters';

// ICONS
import { Loader2 } from 'lucide-react';
import { ImUsers } from 'react-icons/im';
import { TbListDetails } from 'react-icons/tb';
import { BsFillSendFill } from 'react-icons/bs';
import { IoBarChart, IoClose } from 'react-icons/io5';
import { IoIosSave, IoIosSearch } from 'react-icons/io';
import { MdRecordVoiceOver, MdAddCall } from 'react-icons/md';
import { FaExclamationTriangle, FaUser, FaUsers } from 'react-icons/fa';

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
// ==========

interface ModalAtribuirChamadoProps {
   isOpen: boolean;
   onClose: () => void;
   chamado: TabelaChamadoProps | null;
}
// ==========

interface OverlayContent {
   title: string;
   message: string;
   type: 'info' | 'warning' | 'error' | 'success';
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
// COMPONENTES UTILITÁRIOS ATUALIZADOS
// ================================================================================
const getThemeClasses = () => ({
   // Backgrounds
   modalBg: 'bg-white',
   headerBg: 'bg-gray-100',
   sectionBg: 'bg-gray-50',
   cardBg: 'bg-white',
   inputBg: 'bg-black/10',
   overlayBg: 'bg-black/10',

   // Borders
   border: 'border-gray-300',
   sectionBorder: 'border-black',
   cardBorder: 'border-gray-200',
   headerBorder: 'border-black',

   // Text colors
   primaryText: 'text-black',
   secondaryText: 'text-gray-600',
   accentText: 'text-blue-600',
   mutedText: 'text-gray-500',

   // Shadows
   shadow: 'shadow-gray-400',
   cardShadow: 'shadow-sm shadow-black',

   // Interactive states
   hover: 'hover:bg-gray-100',
   focus: 'focus:ring-blue-500',

   recomendacao: 'bg-blue-600',
   alerta: 'bg-red-600',
   sugestao: 'bg-green-600',

   // Alert backgrounds
   successBg: 'bg-green-100',
   successBorder: 'border-green-400',
   successText: 'text-green-800',

   errorBg: 'bg-red-100',
   errorBorder: 'border-red-400',
   errorText: 'text-red-800',

   warningBg: 'bg-yellow-200',
   warningText: 'text-black',
});
// ==========

const LoadingSpinner = ({ text = 'Carregando...' }: { text?: string }) => {
   const theme = getThemeClasses();

   return (
      <div className="flex flex-col items-center justify-center space-y-4 py-16">
         <div className="relative">
            <Loader2 className="animate-spin text-gray-600" size={48} />
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
      DISPONÍVEL: 'bg-green-500 text-black',
      MODERADO: 'bg-yellow-500 text-black',
      SOBRECARREGADO: 'bg-orange-500 text-white',
      CRÍTICO: 'bg-red-500 text-white',
   };
   return colors[recomendacao as keyof typeof colors] || 'bg-slate-500';
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
            const response = await fetch(
               '/api/chamado/atribuir-chamado/recursos',
               {
                  headers: { Authorization: `Bearer ${token}` },
               }
            );
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
         const response = await fetch('/api/cliente', {
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
            '/api/chamado/atribuir-chamado/sugestao-recurso',
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
               `/api/chamado/atribuir-chamado/recurso/${selectedRecurso}`,
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

   const handleLimparFiltros = () => {
      setSearchTerm(''); // Limpa o campo de busca
      setFiltroRecomendacao('TODOS'); // Reseta o filtro para "Todos"
   };

   // E substitua seu useEffect atual por este:
   useEffect(() => {
      if (atribuirMutation.isSuccess) {
         toast.custom(t => (
            <ToastCustom
               type="success"
               title="Operação realizada com sucesso!"
               description={`Chamado #${formatCodChamado(chamado?.COD_CHAMADO)} atribuído${
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

   // ================================================================================
   // RENDERIZAÇÃO CONDICIONAL
   // ================================================================================
   if (!isOpen || !chamado) return null;

   const theme = getThemeClasses();

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center p-4 duration-300">
         {/* ===== OVERLAY ===== */}
         <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

         <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-[95vw] overflow-hidden rounded-2xl border-0 bg-white transition-all duration-500 ease-out">
            {/* ===== HEADER ===== */}
            <header className="relative flex items-center justify-between bg-gradient-to-r from-teal-600 to-teal-700 p-6 shadow-sm shadow-black">
               <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center justify-center rounded-lg bg-white/30 p-4 shadow-xs shadow-black">
                     <MdAddCall className="text-black" size={28} />
                  </div>
                  {/* ===== */}
                  <div className="flex flex-col">
                     <h1 className="text-3xl font-extrabold tracking-widest text-black uppercase select-none">
                        Atribuir Chamado
                     </h1>
                     <p className="text-xl font-extrabold tracking-widest text-black italic select-none">
                        Código #{formatarCodNumber(chamado.COD_CHAMADO)}
                     </p>
                  </div>
               </div>

               {/* Botão fechar modal */}
               <button
                  onClick={() => {
                     handleLimparFormulario();
                     onClose();
                  }}
                  className="group cursor-pointer rounded-full bg-red-500/50 p-3 text-white transition-all hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  <IoClose size={24} />
               </button>
            </header>
            {/* ==================== */}

            {/* ===== COLUNAS ===== */}
            <div className="flex h-full gap-6 overflow-hidden p-6">
               {/* ===== COLUNA DA ESQUERDA ===== */}
               <section className="flex-[0_0_40%] overflow-hidden rounded-xl border-t border-black/10 bg-white p-6 shadow-xs shadow-black">
                  <div className="flex flex-col gap-10">
                     {/* Header e Filtros */}
                     <div className="flex flex-col gap-10">
                        {/* Header */}
                        <div className="flex items-center gap-4">
                           <div className="rounded-sm bg-blue-600 p-2 shadow-xs shadow-black">
                              <FaUsers className="text-white" size={24} />
                           </div>
                           <h2 className="text-2xl font-extrabold tracking-widest text-black uppercase">
                              Consultores
                           </h2>
                        </div>
                        {/* ===== */}

                        {/* Filtros */}
                        <div className="flex items-center gap-6">
                           {/* Input busca */}
                           <div className="group relative flex-1 transition-all hover:scale-102">
                              <IoIosSearch
                                 aria-hidden="true"
                                 className="pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2 text-black transition-transform group-hover:scale-110"
                                 size={24}
                              />
                              <input
                                 type="text"
                                 value={searchTerm}
                                 onChange={e => setSearchTerm(e.target.value)}
                                 onFocus={e => (e.target.placeholder = '')}
                                 onBlur={e => {
                                    if (e.target.value === '')
                                       e.target.placeholder =
                                          'Buscar recurso...';
                                 }}
                                 placeholder="Buscar recurso..."
                                 className="input-busca-recurso w-full rounded-md border-t border-black/10 bg-white py-3 pl-12 font-bold tracking-widest text-black shadow-md shadow-black transition-all placeholder:tracking-widest placeholder:text-slate-500 placeholder:italic focus:ring-2 focus:ring-pink-600 focus:outline-none active:scale-95"
                              />
                           </div>
                           {/* ===== */}

                           {/* Select filtro */}
                           <DropdownRecomendacao
                              value={filtroRecomendacao}
                              onChange={setFiltroRecomendacao}
                           />
                        </div>
                     </div>
                     {/* ========== */}
                     {/* Lista de recursos */}
                     <div className="flex h-[calc(100vh-548px)] flex-col gap-6 overflow-y-auto p-6">
                        {recursosFiltrados.length === 0 ? (
                           <div className="flex flex-col items-center justify-center">
                              <div className="flex flex-col items-center gap-4">
                                 <p className="mt-40 text-2xl font-extrabold tracking-widest text-black select-none">
                                    Nenhum registro encontrado
                                 </p>
                                 <p className="text-center text-base font-extrabold tracking-widest text-slate-500 italic select-none">
                                    Não foi encontrado, nenhum Consultor{' '}
                                    {filtroRecomendacao !== 'TODOS' && (
                                       <>
                                          em situação:{' '}
                                          <span
                                             className={`inline-flex items-center rounded-full ${getRecomendacaoColor(filtroRecomendacao)} px-6 py-1 text-base font-semibold tracking-widest italic shadow-xs shadow-black select-none`}
                                          >
                                             {filtroRecomendacao}
                                          </span>
                                       </>
                                    )}
                                    {searchTerm && (
                                       <>
                                          {filtroRecomendacao !== 'TODOS' &&
                                             ' e '}
                                          que corresponda à busca{' '}
                                          <span className="text-2xl font-extrabold">
                                             "{searchTerm}"
                                          </span>
                                       </>
                                    )}
                                 </p>
                                 <button
                                    onClick={handleLimparFiltros}
                                    className="mt-10 cursor-pointer rounded-sm border-none bg-red-500 px-6 py-2 text-lg font-extrabold tracking-widest text-white shadow-md shadow-black transition-all hover:scale-105 hover:bg-red-800 active:scale-95"
                                 >
                                    Limpar Filtros
                                 </button>
                              </div>
                           </div>
                        ) : (
                           recursosFiltrados.map((recurso: RecursoStats) => (
                              <div
                                 key={recurso.COD_RECURSO}
                                 className="flex cursor-pointer flex-col gap-4 rounded-lg border-t border-black/10 bg-white p-4 shadow-md shadow-black transition-all outline-none hover:scale-102 active:scale-95"
                                 onClick={() =>
                                    handleSelectRecurso(recurso.COD_RECURSO)
                                 }
                              >
                                 {/* Recurso e Situação */}
                                 <div className="flex items-center gap-4">
                                    <FaUser size={24} className="text-black" />
                                    <div className="flex w-full items-center justify-between">
                                       <h3 className="text-lg font-bold tracking-widest text-black italic select-none">
                                          {corrigirTextoCorrompido(
                                             recurso.NOME_RECURSO
                                          )}
                                       </h3>
                                       <div
                                          className={`inline-flex items-center rounded-full ${getRecomendacaoColor(recurso.RECOMENDACAO)} px-6 py-1 text-sm font-semibold tracking-widest italic shadow-xs shadow-black select-none`}
                                       >
                                          <span>{recurso.RECOMENDACAO}</span>
                                       </div>
                                    </div>
                                 </div>
                                 {/* ===== */}

                                 {/* Métricas */}
                                 <div className="grid grid-cols-3 gap-4">
                                    {[
                                       {
                                          label: 'Ativos',
                                          value: recurso.TOTAL_CHAMADOS_ATIVOS,
                                          bg: 'bg-blue-500/70',
                                       },
                                       {
                                          label: 'Alta Prioridade',
                                          value: recurso.CHAMADOS_ALTA_PRIORIDADE,
                                          bg: 'bg-yellow-500/70',
                                       },
                                       {
                                          label: 'Críticos',
                                          value: recurso.CHAMADOS_CRITICOS,
                                          bg: 'bg-red-500/70',
                                       },
                                    ].map((metric, idx) => (
                                       <div
                                          key={idx}
                                          className={`rounded-md ${metric.bg} p-1.5 text-center shadow-xs shadow-black`}
                                       >
                                          <p
                                             className={`text-sm font-bold tracking-widest text-black select-none`}
                                          >
                                             {metric.label}
                                          </p>
                                          <p className="text-xl font-extrabold tracking-widest text-black italic select-none">
                                             {metric.value}
                                          </p>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           ))
                        )}
                     </div>{' '}
                  </div>
               </section>
               {/* ==================== */}

               {/* ===== COLUNA DO MEIO ===== */}
               <section className="flex-[0_0_25%] overflow-hidden rounded-xl border-t border-black/10 bg-white p-6 shadow-xs shadow-black">
                  {selectedRecurso ? (
                     <div>
                        {loadingDetalhe ? (
                           <LoadingSpinner text="Carregando detalhes do Consultor..." />
                        ) : errorDetalhe ? (
                           <ErrorDisplay onRetry={() => refetchRecursos()} />
                        ) : recursoDetalhado ? (
                           // Detalhes do recurso
                           <div className="flex flex-col gap-10">
                              {/* Header */}
                              <div className="flex items-center gap-4">
                                 <div className="rounded-sm bg-blue-600 p-2 shadow-xs shadow-black">
                                    <TbListDetails
                                       className="text-white"
                                       size={24}
                                    />
                                 </div>
                                 <h3 className="text-2xl font-extrabold tracking-widest text-black select-none">
                                    DETALHES DO CONSULTOR
                                 </h3>
                              </div>
                              {/* ========== */}

                              {/* Nome e email do recurso */}
                              <div className="rounded-lg border-t border-black/10 bg-black/10 p-4 shadow-md shadow-black">
                                 <div className="flex items-center gap-4">
                                    <div className="rounded-sm bg-black/10 p-2 shadow-xs shadow-black">
                                       <FaUser
                                          className="text-black"
                                          size={24}
                                       />
                                    </div>
                                    <div className="flex flex-col">
                                       <h5 className="text-xl font-extrabold tracking-widest text-black select-none">
                                          {corrigirTextoCorrompido(
                                             recursoDetalhado.recurso
                                                .NOME_RECURSO
                                          )}
                                       </h5>
                                       <p className="text-sm font-semibold tracking-widest italic select-none">
                                          {
                                             recursoDetalhado.recurso
                                                .EMAIL_RECURSO
                                          }
                                       </p>
                                    </div>
                                 </div>
                              </div>
                              {/* ========== */}

                              {/* Resumo da carga */}
                              <div className="flex flex-col gap-6 rounded-lg border-t border-black/10 bg-teal-600/70 p-4 shadow-md shadow-black">
                                 <div className="flex items-center gap-4">
                                    <div className="rounded-sm bg-black/10 p-2 shadow-xs shadow-black">
                                       <IoBarChart
                                          className="text-black"
                                          size={24}
                                       />
                                    </div>
                                    <h5 className="text-xl font-extrabold tracking-widest text-black select-none">
                                       Resumo da Carga
                                    </h5>
                                 </div>
                                 {/* ===== */}

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
                                          className="rounded-md bg-black/10 p-2 text-center shadow-xs shadow-black"
                                       >
                                          <p className="text-sm font-bold tracking-widest text-black select-none">
                                             {metric.label}
                                          </p>
                                          <p className="text-xl font-extrabold tracking-widest text-black italic select-none">
                                             {metric.value}
                                          </p>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                              {/* ========== */}

                              {/* Recomendação */}
                              <div className="flex flex-col gap-6 rounded-lg border-t border-black/10 bg-blue-600/70 p-4 shadow-md shadow-black">
                                 <div className="flex items-center gap-4">
                                    <div className="rounded-sm bg-black/10 p-2 shadow-xs shadow-black">
                                       <MdRecordVoiceOver
                                          className="text-black"
                                          size={24}
                                       />
                                    </div>
                                    <h5 className="text-xl font-extrabold tracking-widest text-black select-none">
                                       Recomendação
                                    </h5>
                                 </div>

                                 <div className="flex items-center gap-3 pl-5">
                                    <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-black"></div>
                                    <p className="text-sm font-bold tracking-widest text-black italic select-none">
                                       {recursoDetalhado.resumo.recomendacao}.
                                    </p>
                                 </div>
                              </div>
                              {/* ===== */}

                              {/* Alertas */}
                              {recursoDetalhado.alertas?.length > 0 && (
                                 <div className="flex flex-col gap-6 rounded-lg border-t border-black/10 bg-red-600/70 p-4 shadow-md shadow-black">
                                    <div className="flex items-center gap-4">
                                       <div className="rounded-sm bg-black/10 p-2 shadow-xs shadow-black">
                                          <FaExclamationTriangle
                                             className="text-black"
                                             size={24}
                                          />
                                       </div>
                                       <h5 className="text-xl font-extrabold tracking-widest text-black select-none">
                                          Alertas
                                       </h5>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                       {recursoDetalhado.alertas.map(
                                          (alerta: string, index: number) => (
                                             <div
                                                key={index}
                                                className="flex items-center gap-3 pl-5"
                                             >
                                                <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-black"></div>
                                                <p className="text-sm font-bold tracking-widest text-black italic select-none">
                                                   {alerta}.
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
                     <div className="mt-70 flex flex-col items-center justify-center gap-10">
                        <ImUsers size={100} className={theme.primaryText} />
                        <div className="flex flex-col items-center gap-4">
                           <p className="text-2xl font-extrabold tracking-widest text-black select-none">
                              Selecione um Consultor
                           </p>
                           <p className="text-base font-extrabold tracking-widest text-slate-500 italic select-none">
                              Clique em um Consultor para ver os detalhes
                           </p>
                        </div>
                     </div>
                  )}
               </section>
               {/* ==================== */}

               {/* ===== COLUNA DA DIREITA ===== */}
               <section className="flex-[0_0_33%] overflow-hidden rounded-xl border-t border-black/10 bg-white p-6 shadow-xs shadow-black">
                  <div className="flex flex-col gap-10">
                     {/* Header do formulário */}
                     <div className="flex items-center gap-4">
                        <div className="rounded-sm bg-blue-600 p-2 shadow-xs shadow-black">
                           <BsFillSendFill className="text-white" size={24} />
                        </div>
                        <p className="text-2xl font-extrabold tracking-widest text-black uppercase select-none">
                           Atribuição
                        </p>
                     </div>
                     {/* ===== */}

                     {/* ===== FORMULÁRIO ===== */}
                     <div className="flex flex-col gap-10">
                        {/* Recurso selecionado */}
                        <div className="flex flex-col gap-1">
                           <label className="text-lg font-extrabold tracking-widest text-black select-none">
                              Consultor Selecionado
                           </label>
                           <div className="flex flex-col rounded-lg border-t border-black/10 bg-white p-4 shadow-md shadow-black">
                              {selectedRecurso ? (
                                 <div className="flex items-center gap-3">
                                    <FaUser size={24} className="text-black" />
                                    <span className="text-xl font-extrabold tracking-widest text-black select-none">
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
                                 <div className="flex items-center gap-3">
                                    <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-500"></div>
                                    <p className="text-sm font-extrabold tracking-widest text-slate-500 italic select-none">
                                       Selecione um Consultor na lista de
                                       Consultores
                                    </p>
                                 </div>
                              )}
                           </div>
                        </div>
                        {/* ========== */}

                        {/* Select cliente formulário */}
                        <div className="flex flex-col gap-1">
                           <label className="text-lg font-extrabold tracking-widest text-black select-none">
                              Cliente
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
                        {/* ========== */}

                        {/* Notificações por email */}
                        <div className="flex flex-col gap-1">
                           <label className="text-lg font-extrabold tracking-widest text-black select-none">
                              Notificações por Email
                           </label>
                           <div className="flex flex-col gap-6 rounded-md border-t border-black/10 bg-white p-4 shadow-md shadow-black">
                              <div className="flex flex-col gap-4">
                                 {/* Input enviar email cliente */}
                                 <label className="flex items-start gap-4">
                                    <input
                                       type="checkbox"
                                       checked={formData.enviarEmailCliente}
                                       onChange={e =>
                                          handleInputChange(
                                             'enviarEmailCliente',
                                             e.target.checked
                                          )
                                       }
                                       className="mt-1 h-4 w-4 cursor-pointer bg-white text-blue-600 shadow-sm shadow-black hover:scale-125"
                                    />
                                    <div>
                                       <p className="cursor-pointer text-base font-semibold tracking-widest text-black select-none">
                                          Enviar email para o Cliente.
                                       </p>
                                       <span className="pl-3 text-sm font-semibold tracking-widest text-slate-500 italic select-none">
                                          O Cliente receberá uma notificação
                                          sobre a atribuição.
                                       </span>
                                    </div>
                                 </label>
                                 {/* ===== */}

                                 {/* Input enviar email consultor */}
                                 <label className="flex items-start gap-4">
                                    <input
                                       type="checkbox"
                                       checked={formData.enviarEmailRecurso}
                                       onChange={e =>
                                          handleInputChange(
                                             'enviarEmailRecurso',
                                             e.target.checked
                                          )
                                       }
                                       className="mt-1 h-4 w-4 cursor-pointer bg-white text-blue-600 shadow-sm shadow-black hover:scale-125"
                                    />
                                    <div>
                                       <p className="cursor-pointer text-base font-semibold tracking-widest text-black select-none">
                                          Enviar email para o Consultor.
                                       </p>
                                       <span className="pl-3 text-sm font-semibold tracking-widest text-slate-500 italic select-none">
                                          O Consultor receberá uma notificação
                                          sobre a atribuição.
                                       </span>
                                    </div>
                                 </label>
                              </div>
                           </div>
                        </div>
                        {/* ========== */}

                        {/* ===== FOOTER ===== */}
                        <footer className="flex items-center justify-end gap-8 border-t-4 border-red-600 p-6">
                           {/* Botão limpar formulário */}
                           <button
                              onClick={handleLimparFormulario}
                              disabled={atribuirMutation.isPending}
                              className="cursor-pointer rounded-sm border-none bg-red-500 px-6 py-2 text-lg font-extrabold tracking-widest text-white shadow-md shadow-black transition-all hover:scale-105 hover:bg-red-800 active:scale-95"
                           >
                              Limpar
                           </button>
                           {/* ===== */}

                           {/* Botão submit */}
                           <button
                              onClick={handleAtribuir}
                              disabled={
                                 !isFormValid() || atribuirMutation.isPending
                              }
                              className={`cursor-pointer rounded-sm border-none bg-blue-500 px-6 py-2 text-lg font-extrabold tracking-widest text-white shadow-md shadow-black transition-all ${
                                 atribuirMutation.isPending || !isFormValid()
                                    ? 'disabled:cursor-not-allowed disabled:opacity-50'
                                    : 'hover:scale-105 hover:bg-blue-800 active:scale-95'
                              }`}
                           >
                              {atribuirMutation.isPending ? (
                                 <span className="flex items-center justify-center gap-3">
                                    <LoadingButton size={20} />
                                    Salvando...
                                 </span>
                              ) : (
                                 <div className="flex items-center gap-3">
                                    <IoIosSave
                                       className="mr-2 inline-block"
                                       size={20}
                                    />
                                    <span>Atribuir</span>
                                 </div>
                              )}
                           </button>
                        </footer>
                        {/* ===== */}
                     </div>
                  </div>
               </section>
               {/* ==================== */}
            </div>
         </div>
      </div>
   );
};
