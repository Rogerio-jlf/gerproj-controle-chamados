'use client';
// COMPONENTS
import { TooltipCondicionalTabelaProjeto } from '../projeto/Tooltip_Condicional_Tabela_Projeto';

// TYPES
import { TabelaProjetoProps } from '../../../../types/types';

// HELPERS
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';

// FORMATTERS
import {
   formatarCodNumber,
   formatarHorasTotaisHorasDecimais,
} from '../../../../utils/formatters';

// ICONS
import { LuLogs } from 'react-icons/lu';
import { IoClose } from 'react-icons/io5';
import { FaUser, FaInfo, FaProjectDiagram } from 'react-icons/fa';

// ================================================================================
// INTERFACES
// ================================================================================
interface ModalVisualizarProjetoProps {
   isOpen: boolean;
   onClose: () => void;
   projeto: TabelaProjetoProps | null;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export function ModalVisualizarProjeto({
   isOpen,
   onClose,
   projeto,
}: ModalVisualizarProjetoProps) {
   // ==========

   // Função para fechar o modal
   const handleCloseModalVisualizarProjeto = () => {
      onClose();
   };
   // ==========

   // Se o modal não estiver aberto ou o projeto for nulo, não renderiza nada
   if (!isOpen || !projeto) return null;

   // Função auxiliar para formatar status
   const formatarStatus = (status: 'ATI' | 'ENC') => {
      return status === 'ATI' ? (
         <span className="rounded-full bg-blue-600 px-6 py-1 text-sm font-bold tracking-widest text-white italic select-none">
            ATIVO
         </span>
      ) : (
         <span className="rounded-full bg-red-600 px-6 py-1 text-sm font-bold tracking-widest text-white italic select-none">
            ENCERRADO
         </span>
      );
   };

   console.log('QTD_HRS_GASTAS:', projeto.QTD_HRS_GASTAS);
   console.log('Tipo:', typeof projeto.QTD_HRS_GASTAS);
   console.log(
      'Formatado:',
      formatarHorasTotaisHorasDecimais(projeto.QTD_HRS_GASTAS?.toString())
   );

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center p-4 duration-300">
         {/* ===== OVERLAY ===== */}
         <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
         {/* ========== */}

         <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-[60vw] overflow-hidden rounded-2xl border-0 bg-white/70 shadow-lg shadow-black transition-all duration-500 ease-out">
            {/* ===== HEADER ===== */}
            <header className="relative flex items-center justify-between bg-gradient-to-r from-teal-600 to-teal-700 p-6 shadow-sm shadow-black">
               <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center justify-center rounded-lg bg-white/30 p-4 shadow-md shadow-black">
                     <FaProjectDiagram className="text-black" size={28} />
                  </div>
                  {/* ===== */}
                  <div className="flex flex-col">
                     <h1 className="text-3xl font-extrabold tracking-widest text-black uppercase select-none">
                        Projeto
                     </h1>
                     <p className="text-xl font-extrabold tracking-widest text-black italic select-none">
                        Código #{formatarCodNumber(projeto.COD_PROJETO)}
                     </p>
                  </div>
               </div>
               {/* ========== */}

               <button
                  onClick={handleCloseModalVisualizarProjeto}
                  className="group cursor-pointer rounded-full bg-red-500/50 p-3 text-white transition-all hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  <IoClose size={24} />
               </button>
            </header>
            {/* ==================== */}

            {/* ===== CONTEÚDO ===== */}
            <main className="overflow-y-auto bg-gray-50 p-6">
               <div className="grid grid-cols-2 gap-6">
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
                           {/* PROJETO_COMPLETO */}
                           <div className="flex items-center justify-between gap-10 border-b border-slate-200 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Projeto
                              </span>
                              <TooltipCondicionalTabelaProjeto
                                 content={corrigirTextoCorrompido(
                                    projeto.PROJETO_COMPLETO
                                 )}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black select-none">
                                    {corrigirTextoCorrompido(
                                       projeto.PROJETO_COMPLETO
                                    )}
                                 </span>
                              </TooltipCondicionalTabelaProjeto>
                           </div>
                           {/* ===== */}

                           {/* PROPOSTA_PROJETO */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Proposta
                              </span>
                              <TooltipCondicionalTabelaProjeto
                                 content={corrigirTextoCorrompido(
                                    projeto.PROPOSTA_PROJETO || 'n/a'
                                 )}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black select-none">
                                    {corrigirTextoCorrompido(
                                       projeto.PROPOSTA_PROJETO || 'n/a'
                                    )}
                                 </span>
                              </TooltipCondicionalTabelaProjeto>
                           </div>
                           {/* ===== */}

                           {/* PERC_PROJETO */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Percentual
                              </span>
                              <span className="text-lg font-bold tracking-widest text-black italic select-none">
                                 {projeto.PERC_PROJETO}%
                              </span>
                           </div>
                           {/* ===== */}

                           {/* QTDHORAS_PROJETO */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 QTD. Horas Previstas
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {formatarHorasTotaisHorasDecimais(
                                    projeto.QTDHORAS_PROJETO.toString()
                                 )}
                                 h
                              </span>
                           </div>
                           {/* ===== */}

                           {/* QTD_HRS_GASTAS */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 QTD. Horas Gastas
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {projeto.QTD_HRS_GASTAS
                                    ? formatarHorasTotaisHorasDecimais(
                                         projeto.QTD_HRS_GASTAS
                                      )
                                    : '0,00'}
                                 h
                              </span>
                           </div>
                           {/* ===== */}

                           {/* STATUS_PROJETO */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Status
                              </span>
                              {formatarStatus(projeto.STATUS_PROJETO)}
                           </div>
                        </div>
                     </div>
                     {/* ========== */}
                  </div>
                  {/* ==================== */}

                  {/* ===== COLUNA DIREITA ===== */}
                  <div className="space-y-6">
                     {/* ===== CARD: CONSULTOR - CLIENTE - RESPONSÁVEL ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 shadow-sm shadow-black">
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
                                 {projeto.NOME_RECURSO.trim()
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
                                 {projeto.NOME_CLIENTE.trim()
                                    .split(/\s+/)
                                    .slice(0, 2)
                                    .join(' ')}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* RESPCLI_PROJETO */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Responsável Cliente
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {projeto.RESPCLI_PROJETO}
                              </span>
                           </div>
                        </div>
                     </div>
                     {/* ========== */}

                     {/* ===== CARD: LOGS ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 shadow-sm shadow-black">
                           <LuLogs className="text-white" size={24} />
                           <h2 className="text-lg font-bold tracking-widest text-white select-none">
                              Logs
                           </h2>
                        </div>
                        <div className="space-y-3 p-4">
                           {/* LOGINC_PROJETO */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Log Inclusão
                              </span>
                              <TooltipCondicionalTabelaProjeto
                                 content={corrigirTextoCorrompido(
                                    projeto.LOGINC_PROJETO || 'N/A'
                                 )}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black select-none">
                                    {corrigirTextoCorrompido(
                                       projeto.LOGINC_PROJETO || 'N/A'
                                    )}
                                 </span>
                              </TooltipCondicionalTabelaProjeto>
                           </div>
                           {/* ===== */}

                           {/* LOGALT_PROJETO */}
                           <div className="flex items-center justify-between py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Log Alteração
                              </span>
                              <TooltipCondicionalTabelaProjeto
                                 content={corrigirTextoCorrompido(
                                    projeto.LOGALT_PROJETO || 'N/A'
                                 )}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black select-none">
                                    {corrigirTextoCorrompido(
                                       projeto.LOGALT_PROJETO || 'N/A'
                                    )}
                                 </span>
                              </TooltipCondicionalTabelaProjeto>
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
