'use client';
// TYPES
import { TabelaOSProps } from '../../../../../types/types';

// HELPERS
import { corrigirTextoCorrompido } from '../../../../../lib/corrigirTextoCorrompido';

// FORMATTERS
import {
   formatarCodNumber,
   formatarCodString,
   formatarDataParaBR,
   formatarHora,
   formatarHorasTotaisHorasDecimais,
   formatarMoeda,
} from '../../../../../utils/formatters';

// COMPONENTS
import { TooltipCondicionalTabelaOS } from '../Tooltip_Condicional._Tabela_OS';

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
         <span className="rounded-full bg-blue-600 px-6 py-1 text-sm font-bold tracking-widest text-white italic select-none">
            SIM
         </span>
      ) : (
         <span className="rounded-full bg-red-600 px-6 py-1 text-sm font-bold tracking-widest text-white italic select-none">
            NÃO
         </span>
      );
   };

   // Função para obter estilo do status
   const getStatusStyle = (status: number) => {
      switch (status) {
         case 0:
            return 'bg-yellow-600 text-white';
         case 1:
            return 'bg-green-600 text-black';
         case 2:
            return 'bg-blue-600 text-white';
         default:
            return 'bg-gray-600 text-white';
      }
   };

   const getStatusText = (status: number) => {
      switch (status) {
         case 0:
            return 'Pendente';
         case 1:
            return 'Concluída';
         case 2:
            return 'Em Andamento';
         default:
            return 'Desconhecido';
      }
   };

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center p-4 duration-300">
         {/* ===== OVERLAY ===== */}
         <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
         {/* ========== */}

         <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-[80vw] overflow-hidden rounded-2xl border-0 bg-white/70 shadow-lg shadow-black transition-all duration-500 ease-out">
            {/* ===== HEADER ===== */}
            <header className="relative flex items-center justify-between bg-gradient-to-r from-teal-600 to-teal-700 p-6 shadow-sm shadow-black">
               <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center justify-center rounded-lg bg-white/30 p-4 shadow-md shadow-black">
                     <GrServices className="text-black" size={28} />
                  </div>
                  {/* ===== */}
                  <div className="flex flex-col">
                     <h1 className="text-3xl font-extrabold tracking-widest text-black uppercase select-none">
                        Ordem de Serviço
                     </h1>
                     <p className="text-xl font-extrabold tracking-widest text-black italic select-none">
                        Código #{formatarCodNumber(os.COD_OS)}
                     </p>
                  </div>
               </div>
               {/* ========== */}

               <button
                  onClick={handleCloseModalVisualizarOS}
                  className="group cursor-pointer rounded-full bg-red-500/50 p-3 text-white transition-all hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  <IoClose size={24} />
               </button>
            </header>
            {/* ==================== */}

            {/* ===== CONTEÚDO ===== */}
            <main className="overflow-y-auto bg-gray-50 p-6">
               <div className="grid grid-cols-3 gap-6">
                  {/* ===== COLUNA ESQUERDA ===== */}
                  <div className="space-y-6">
                     {/* ===== CARD: INFORMAÇÕES GERAIS ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 shadow-sm shadow-black">
                           <FaInfo className="text-white" size={24} />
                           <h2 className="text-lg font-bold tracking-widest text-white select-none">
                              Informações Gerais
                           </h2>
                        </div>
                        <div className="space-y-3 p-4">
                           {/* COD_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 OS
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {formatarCodNumber(os.COD_OS)}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* TAREFA_COMPLETA */}
                           <div className="flex items-center justify-between gap-10 border-b border-slate-200 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Tarefa
                              </span>
                              <TooltipCondicionalTabelaOS
                                 content={os.TAREFA_COMPLETA || ''}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black select-none">
                                    {os.TAREFA_COMPLETA}
                                 </span>
                              </TooltipCondicionalTabelaOS>
                           </div>
                           {/* ===== */}

                           {/* PROJETO_COMPLETO */}
                           <div className="flex items-center justify-between gap-10 border-b border-slate-200 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Projeto
                              </span>
                              <TooltipCondicionalTabelaOS
                                 content={os.PROJETO_COMPLETO || ''}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black select-none">
                                    {os.PROJETO_COMPLETO}
                                 </span>
                              </TooltipCondicionalTabelaOS>
                           </div>
                           {/* ===== */}

                           {/* NUM_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Número OS
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {os.NUM_OS || 'n/a'}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* CHAMADO_OS */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Chamado
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {formatarCodString(os.CHAMADO_OS) ?? 'n/a'}
                              </span>
                           </div>
                        </div>
                     </div>
                     {/* ========== */}

                     {/* ===== CARD: DADOS TEMPORAIS ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 shadow-sm shadow-black">
                           <FaClock className="text-white" size={24} />
                           <h2 className="text-lg font-bold tracking-widest text-white select-none">
                              Dados Temporais
                           </h2>
                        </div>
                        <div className="space-y-3 p-4">
                           {/* DTINI_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Data Início
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {formatarDataParaBR(os.DTINI_OS)}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* HRINI_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Hora Início
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {formatarHora(os.HRINI_OS)}h
                              </span>
                           </div>
                           {/* ===== */}

                           {/* HRFIM_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Hora Fim
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {formatarHora(os.HRFIM_OS)}h
                              </span>
                           </div>
                           {/* ===== */}

                           {/* QTD_HR_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Total Horas
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {formatarHorasTotaisHorasDecimais(
                                    os.QTD_HR_OS?.toString()
                                 )}
                                 h
                              </span>
                           </div>
                           {/* ===== */}

                           {/* DTINC_OS */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Data Inclusão
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
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
                        <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 shadow-sm shadow-black">
                           <FaCheck className="text-white" size={24} />
                           <h2 className="text-lg font-bold tracking-widest text-white select-none">
                              Indicadores
                           </h2>
                        </div>
                        <div className="space-y-3 p-4">
                           {/* PRODUTIVO_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Produtivo
                              </span>
                              {formatarSimNao(os.PRODUTIVO_OS)}
                           </div>
                           {/* ===== */}

                           {/* PRODUTIVO2_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Produtivo 2
                              </span>
                              {formatarSimNao(os.PRODUTIVO2_OS)}
                           </div>
                           {/* ===== */}

                           {/* REMDES_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Remuneração
                              </span>
                              {formatarSimNao(os.REMDES_OS)}
                           </div>
                           {/* ===== */}

                           {/* ABONO_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Abono
                              </span>
                              {formatarSimNao(os.ABONO_OS)}
                           </div>
                           {/* ===== */}

                           {/* FATURADO_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Cliente Paga
                              </span>
                              {formatarSimNao(os.FATURADO_OS)}
                           </div>
                           {/* ===== */}

                           {/* VALID_OS */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Consultor Recebe
                              </span>
                              {formatarSimNao(os.VALID_OS)}
                           </div>
                        </div>
                     </div>
                     {/* ========== */}

                     {/* ===== CARD: FINANCEIRO ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 shadow-sm shadow-black">
                           <FaDollarSign className="text-white" size={24} />
                           <h2 className="text-lg font-bold tracking-widest text-white select-none">
                              Informações Financeiras
                           </h2>
                        </div>
                        <div className="space-y-3 p-4">
                           {/* VRHR_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Valor Hora
                              </span>
                              <span className="text-lg font-bold tracking-widest text-black italic select-none">
                                 {formatarMoeda(os.VRHR_OS)}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* PERC_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Percentual
                              </span>
                              <span className="text-lg font-bold tracking-widest text-black italic select-none">
                                 {os.PERC_OS}%
                              </span>
                           </div>
                           {/* ===== */}

                           {/* COD_FATURAMENTO */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Código Faturamento
                              </span>
                              <span className="text-lg font-bold tracking-widest text-black italic select-none">
                                 {os.COD_FATURAMENTO || 'n/a'}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
                  {/* ==================== */}

                  {/* ===== COLUNA DIREITA ===== */}
                  <div className="space-y-6">
                     {/* ===== CARD: RECURSOS E RESPONSÁVEIS ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 shadow-sm shadow-black">
                           <FaUser className="text-white" size={24} />
                           <h2 className="text-lg font-bold tracking-widest text-white select-none">
                              Consultor, Cliente e Responsável
                           </h2>
                        </div>
                        <div className="space-y-3 p-4">
                           {/* NOME_RECURSO */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Nome Consultor
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {os.NOME_RECURSO.trim()
                                    .split(/\s+/)
                                    .slice(0, 2)
                                    .join(' ')}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* NOME_CLIENTE */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Nome Cliente
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {os.NOME_CLIENTE?.trim()
                                    .split(/\s+/)
                                    .slice(0, 2)
                                    .join(' ') || 'n/a'}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* RESPCLI_OS */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Responsável Cliente
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {corrigirTextoCorrompido(os.RESPCLI_OS)}
                              </span>
                           </div>
                        </div>
                     </div>
                     {/* ========== */}

                     {/* ===== CARD: OBSERVAÇÕES E OUTROS ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 shadow-sm shadow-black">
                           <MdDescription className="text-white" size={24} />
                           <h2 className="text-lg font-bold tracking-widest text-white select-none">
                              Observações e Outros
                           </h2>
                        </div>
                        <div className="space-y-3 p-4">
                           {/* OBS_OS */}
                           <div className="flex items-center justify-between gap-10 border-b border-slate-200 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Observações
                              </span>
                              <TooltipCondicionalTabelaOS
                                 content={corrigirTextoCorrompido(
                                    os.OBS_OS || 'n/a'
                                 )}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black select-none">
                                    {corrigirTextoCorrompido(
                                       os.OBS_OS || 'n/a'
                                    )}
                                 </span>
                              </TooltipCondicionalTabelaOS>
                           </div>
                           {/* ===== */}

                           {/* DESLOC_OS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Deslocamento
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {corrigirTextoCorrompido(
                                    os.DESLOC_OS || 'n/a'
                                 )}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* OBS */}
                           <div className="flex items-center justify-between gap-10 border-b border-slate-200 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Outras Observações
                              </span>
                              <TooltipCondicionalTabelaOS
                                 content={corrigirTextoCorrompido(
                                    os.OBS || 'n/a'
                                 )}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black select-none">
                                    {corrigirTextoCorrompido(os.OBS || 'n/a')}
                                 </span>
                              </TooltipCondicionalTabelaOS>
                           </div>
                           {/* ===== */}

                           {/* COMP_OS */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Competência
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {os.COMP_OS || 'n/a'}
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
