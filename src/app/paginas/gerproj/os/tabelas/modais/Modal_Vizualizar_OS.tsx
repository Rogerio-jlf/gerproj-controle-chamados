'use client';

// COMPONENTS
import { TooltipCondicional } from '../../components/Tooltip_Condicional';

// TYPES
import { TabelaOSProps } from '../../../../../../types/types';

// FORMATTERS
import {
   formatarCodNumber,
   formatarCodString,
   formatarDataParaBR,
   formatarHora,
   formatarHorasTotaisHorasDecimais,
   formatarMoeda,
   obterSufixoHoras,
} from '../../../../../../utils/formatters';

// HELPERS
import { corrigirTextoCorrompido } from '../../../../../../lib/corrigirTextoCorrompido';

// ICONS
import { IoClose } from 'react-icons/io5';
import { GrServices } from 'react-icons/gr';
import { MdDescription } from 'react-icons/md';
import { FaUser, FaClock, FaDollarSign, FaCheck, FaInfo } from 'react-icons/fa';

// ================================================================================
// INTERFACES
// ================================================================================
interface ModalVisualizarOSProps {
   isOpen: boolean;
   onClose: () => void;
   os: TabelaOSProps | null;
}

// ================================================================================
// CONSTANTES
// ================================================================================
const EMPTY_VALUE = 'n/a' as const;

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export function ModalVisualizarOS({
   isOpen,
   onClose,
   os,
}: ModalVisualizarOSProps) {
   // ==========

   // Função para fechar o modal
   const handleCloseModalVisualizarOS = () => {
      onClose();
   };
   // ==========

   // Se o modal não estiver aberto ou a OS for nula, não renderiza nada
   if (!isOpen || !os) return null;

   // Função auxiliar para formatar valores SIM/NAO
   const formatarSimNao = (value: 'SIM' | 'NAO') => {
      return value === 'SIM' ? (
         <span className="rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-1 text-sm font-extrabold tracking-widest text-white italic shadow-md shadow-black select-none">
            SIM
         </span>
      ) : (
         <span className="rounded-full bg-gradient-to-r from-red-600 to-red-700 px-6 py-1 text-sm font-extrabold tracking-widest text-white italic shadow-md shadow-black select-none">
            NÃO
         </span>
      );
   };

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center p-4 duration-300">
         {/* ===== OVERLAY ===== */}
         <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
         {/* ========== */}

         <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-[80vw] overflow-hidden rounded-2xl border-0 bg-white/70 transition-all duration-500 ease-out">
            {/* ===== HEADER ===== */}
            <header className="relative flex items-center justify-between bg-gradient-to-r from-teal-600 to-teal-700 p-6 shadow-sm shadow-black">
               <div className="flex items-center justify-center gap-6">
                  <GrServices className="text-black" size={72} />
                  <div className="flex flex-col">
                     <h1 className="text-4xl font-extrabold tracking-widest text-black select-none">
                        DETALHES DA OS
                     </h1>
                     <p className="text-xl font-extrabold tracking-widest text-black italic select-none">
                        CÓDIGO {formatarCodNumber(os.COD_OS)}
                     </p>
                  </div>
               </div>
               {/* ========== */}

               <button
                  onClick={handleCloseModalVisualizarOS}
                  className="group cursor-pointer rounded-full bg-red-500/50 p-3 transition-all hover:scale-110 hover:rotate-180 hover:bg-red-500"
               >
                  <IoClose
                     className="text-white group-hover:scale-110"
                     size={24}
                  />
               </button>
            </header>
            {/* ==================== */}

            {/* ===== CONTEÚDO ===== */}
            <main className="overflow-y-auto bg-gray-50 p-6">
               <div className="grid grid-cols-3 gap-6">
                  {/* ===== COLUNA DA ESQUERDA ===== */}
                  <div className="space-y-6">
                     {/* ===== CARD INFORMAÇÕES GERAIS ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 shadow-sm shadow-black">
                           {/* HEADER */}
                           <FaInfo className="text-white" size={24} />
                           <h2 className="text-lg font-extrabold tracking-widest text-white select-none">
                              INFORMAÇÕES GERAIS
                           </h2>
                        </div>
                        {/* ===== */}
                        <div className="space-y-3 p-4">
                           {/* COD_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 OS
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {formatarCodNumber(os.COD_OS)}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* TAREFA_COMPLETA */}
                           <div className="flex items-center justify-between gap-10 border-b border-slate-200 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Tarefa
                              </span>
                              <TooltipCondicional
                                 content={corrigirTextoCorrompido(
                                    os.TAREFA_COMPLETA || ''
                                 )}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black italic select-none">
                                    {corrigirTextoCorrompido(
                                       os.TAREFA_COMPLETA
                                    )}
                                 </span>
                              </TooltipCondicional>
                           </div>
                           {/* ===== */}

                           {/* PROJETO_COMPLETO */}
                           <div className="flex items-center justify-between gap-10 border-b border-slate-200 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Projeto
                              </span>
                              <TooltipCondicional
                                 content={corrigirTextoCorrompido(
                                    os.PROJETO_COMPLETO || ''
                                 )}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black italic select-none">
                                    {corrigirTextoCorrompido(
                                       os.PROJETO_COMPLETO
                                    )}
                                 </span>
                              </TooltipCondicional>
                           </div>
                           {/* ===== */}

                           {/* NUM_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Número OS
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {os.NUM_OS || EMPTY_VALUE}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* CHAMADO_OS */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Chamado
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {formatarCodString(os.CHAMADO_OS) ??
                                    EMPTY_VALUE}
                              </span>
                           </div>
                        </div>
                     </div>
                     {/* ========== */}

                     {/* ===== CARD DADOS TEMPORAIS ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 shadow-sm shadow-black">
                           <FaClock className="text-white" size={24} />
                           <h2 className="text-lg font-extrabold tracking-widest text-white select-none">
                              DADOS TEMPORAIS
                           </h2>
                        </div>
                        <div className="space-y-3 p-4">
                           {/* DTINI_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Início
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {formatarDataParaBR(os.DTINI_OS)}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* HRINI_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Hora Início
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {os.HRINI_OS
                                    ? `${formatarHora(os.HRINI_OS.toString())} ${obterSufixoHoras(os.HRINI_OS)}`
                                    : EMPTY_VALUE}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* HRFIM_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Hora Fim
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {os.HRFIM_OS
                                    ? `${formatarHora(os.HRFIM_OS.toString())} ${obterSufixoHoras(os.HRFIM_OS)}`
                                    : EMPTY_VALUE}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* QTD_HR_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Horas Utilizadas
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {os.QTD_HR_OS
                                    ? `${formatarHorasTotaisHorasDecimais(os.QTD_HR_OS.toString())} ${obterSufixoHoras(os.QTD_HR_OS)}`
                                    : EMPTY_VALUE}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* DTINC_OS */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Inclusão
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {formatarDataParaBR(os.DTINC_OS)}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
                  {/* ==================== */}

                  {/* ===== COLUNA MEIO ===== */}
                  <div className="space-y-6">
                     {/* ===== CARD: INDICADORES ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 shadow-sm shadow-black">
                           <FaCheck className="text-white" size={24} />
                           <h2 className="text-lg font-extrabold tracking-widest text-white select-none">
                              INDICADORES
                           </h2>
                        </div>
                        <div className="space-y-3 p-4">
                           {/* PRODUTIVO_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Produtivo
                              </span>
                              {formatarSimNao(os.PRODUTIVO_OS)}
                           </div>
                           {/* ===== */}

                           {/* PRODUTIVO2_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Produtivo 2
                              </span>
                              {formatarSimNao(os.PRODUTIVO2_OS)}
                           </div>
                           {/* ===== */}

                           {/* REMDES_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Remuneração
                              </span>
                              {formatarSimNao(os.REMDES_OS)}
                           </div>
                           {/* ===== */}

                           {/* ABONO_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Abono
                              </span>
                              {formatarSimNao(os.ABONO_OS)}
                           </div>
                           {/* ===== */}

                           {/* FATURADO_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Cliente Paga
                              </span>
                              {formatarSimNao(os.FATURADO_OS)}
                           </div>
                           {/* ===== */}

                           {/* VALID_OS */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Consultor Recebe
                              </span>
                              {formatarSimNao(os.VALID_OS)}
                           </div>
                        </div>
                     </div>
                     {/* ========== */}

                     {/* ===== CARD FINANCEIRO ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 shadow-sm shadow-black">
                           <FaDollarSign className="text-white" size={24} />
                           <h2 className="text-lg font-extrabold tracking-widest text-white select-none">
                              INFORMAÇÕES FINANCEIROS
                           </h2>
                        </div>
                        <div className="space-y-3 p-4">
                           {/* VRHR_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Valor Hora
                              </span>
                              <span className="text-lg font-bold tracking-widest text-black italic select-none">
                                 {formatarMoeda(os.VRHR_OS)}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* PERC_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Percentual
                              </span>
                              <span className="text-lg font-bold tracking-widest text-black italic select-none">
                                 {os.PERC_OS} %
                              </span>
                           </div>
                           {/* ===== */}

                           {/* COD_FATURAMENTO */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Código Faturamento
                              </span>
                              <span className="text-lg font-bold tracking-widest text-black italic select-none">
                                 {os.COD_FATURAMENTO || EMPTY_VALUE}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
                  {/* ==================== */}

                  {/* ===== COLUNA DIREITA ===== */}
                  <div className="space-y-6">
                     {/* ===== CARD RECURSOS E RESPONSÁVEIS ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-3 shadow-sm shadow-black">
                           <FaUser className="text-white" size={24} />
                           <h2 className="text-lg font-extrabold tracking-widest text-white select-none">
                              CONSULTOR, CLIENTE E RESPONSÁVEL
                           </h2>
                        </div>
                        <div className="space-y-3 p-4">
                           {/* NOME_RECURSO */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 CONSULTOR
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {os.NOME_RECURSO.trim()
                                    .split(/\s+/)
                                    .slice(0, 2)
                                    .join(' ')}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* NOME_CLIENTE */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 CLIENTE
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {os.NOME_CLIENTE?.trim()
                                    .split(/\s+/)
                                    .slice(0, 2)
                                    .join(' ') || EMPTY_VALUE}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* RESPCLI_OS */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 CLIENTE RESPONSÁVEL
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {os.RESPCLI_OS}
                              </span>
                           </div>
                        </div>
                     </div>
                     {/* ========== */}

                     {/* ===== CARD OBSERVAÇÕES E OUTROS ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-3 shadow-sm shadow-black">
                           <MdDescription className="text-white" size={24} />
                           <h2 className="text-lg font-extrabold tracking-widest text-white select-none">
                              OBSERVAÇÕES E OUTROS
                           </h2>
                        </div>
                        <div className="space-y-3 p-4">
                           {/* OBS_OS */}
                           <div className="flex items-center justify-between gap-10 border-b border-slate-200 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Observações
                              </span>
                              <TooltipCondicional
                                 content={corrigirTextoCorrompido(
                                    os.OBS_OS || EMPTY_VALUE
                                 )}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black italic select-none">
                                    {corrigirTextoCorrompido(
                                       os.OBS_OS || EMPTY_VALUE
                                    )}
                                 </span>
                              </TooltipCondicional>
                           </div>
                           {/* ===== */}

                           {/* DESLOC_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Deslocamento
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {corrigirTextoCorrompido(
                                    os.DESLOC_OS || EMPTY_VALUE
                                 )}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* OBS */}
                           <div className="flex items-center justify-between gap-10 border-b border-slate-200 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Outras Observações
                              </span>
                              <TooltipCondicional
                                 content={corrigirTextoCorrompido(
                                    os.OBS || EMPTY_VALUE
                                 )}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black italic select-none">
                                    {corrigirTextoCorrompido(
                                       os.OBS || EMPTY_VALUE
                                    )}
                                 </span>
                              </TooltipCondicional>
                           </div>
                           {/* ===== */}

                           {/* COMP_OS */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Competência
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {os.COMP_OS || EMPTY_VALUE}
                              </span>
                           </div>
                        </div>
                     </div>
                     {/* ========== */}
                  </div>
               </div>
            </main>
         </div>
      </div>
   );
}
