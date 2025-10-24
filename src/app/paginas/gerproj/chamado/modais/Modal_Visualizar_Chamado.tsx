'use client';

// COMPONENTS
import { TooltipCondicionalTabelaChamado } from '../Tooltip_Condicional._Tabela_Chamado';

// TYPES
import { TabelaChamadoProps } from '../../../../../types/types';

// HELPERS
import { corrigirTextoCorrompido } from '../../../../../lib/corrigirTextoCorrompido';

// FORMATTERS
import {
   formatCodChamado,
   getStylesStatus,
} from '../../../../../utils/formatters';

// ICONS
import { MdDescription } from 'react-icons/md';
import { IoClose, IoCall } from 'react-icons/io5';
import { FaUser, FaClock, FaTasks, FaInfo } from 'react-icons/fa';

// ================================================================================
// INTERFACES
// ================================================================================
interface ModalVisualizarChamadoProps {
   isOpen: boolean;
   onClose: () => void;
   chamado: TabelaChamadoProps | null;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export function ModalVisualizarChamado({
   isOpen,
   onClose,
   chamado,
}: ModalVisualizarChamadoProps) {
   // Função para fechar o modal
   const handleCloseModalVisualizarChamado = () => {
      onClose();
   };

   // Se o modal não estiver aberto ou o chamado for nulo, não renderiza nada
   if (!isOpen || !chamado) return null;

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center p-4 duration-300">
         {/* ===== OVERLAY ===== */}
         <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

         <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-[80vw] overflow-hidden rounded-2xl border-0 bg-white/70 shadow-lg shadow-black transition-all duration-500 ease-out">
            {/* ===== HEADER ===== */}
            <header className="relative flex items-center justify-between bg-gradient-to-r from-teal-600 to-teal-700 p-6 shadow-sm shadow-black">
               <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center justify-center rounded-lg bg-white/30 p-4 shadow-xs shadow-black">
                     <IoCall className="text-black" size={28} />
                  </div>
                  <div className="flex flex-col">
                     <h1 className="text-3xl font-extrabold tracking-widest text-black uppercase select-none">
                        Chamado
                     </h1>
                     <p className="text-xl font-extrabold tracking-widest text-black italic select-none">
                        Código #{formatCodChamado(chamado.COD_CHAMADO)}
                     </p>
                  </div>
               </div>

               <button
                  onClick={handleCloseModalVisualizarChamado}
                  className="group cursor-pointer rounded-full bg-red-500/50 p-3 text-white transition-all hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  <IoClose size={24} />
               </button>
            </header>

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
                           {/* COD_CHAMADO */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Chamado
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {formatCodChamado(chamado.COD_CHAMADO)}
                              </span>
                           </div>

                           {/* STATUS_CHAMADO */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Status
                              </span>
                              <span
                                 className={`rounded-full px-6 py-1 text-sm font-bold tracking-widest italic select-none ${getStylesStatus(
                                    chamado.STATUS_CHAMADO
                                 )}`}
                              >
                                 {chamado.STATUS_CHAMADO || 'n/a'}
                              </span>
                           </div>

                           {/* PRIOR_CHAMADO */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Prioridade
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {chamado.PRIOR_CHAMADO || 'n/a'}
                              </span>
                           </div>

                           {/* NOME_CLASSIFICACAO */}
                           <div className="flex items-center justify-between gap-10 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Classificação
                              </span>
                              <TooltipCondicionalTabelaChamado
                                 content={chamado.NOME_CLASSIFICACAO || 'n/a'}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black select-none">
                                    {chamado.NOME_CLASSIFICACAO || 'n/a'}
                                 </span>
                              </TooltipCondicionalTabelaChamado>
                           </div>
                        </div>
                     </div>

                     {/* ===== CARD: DADOS TEMPORAIS ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 shadow-sm shadow-black">
                           <FaClock className="text-white" size={24} />
                           <h2 className="text-lg font-bold tracking-widest text-white select-none">
                              Dados Temporais
                           </h2>
                        </div>
                        <div className="space-y-3 p-4">
                           {/* DATA_HORA_CHAMADO */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Data/Hora Abertura
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {chamado.DATA_HORA_CHAMADO || 'n/a'}
                              </span>
                           </div>

                           {/* DTENVIO_CHAMADO */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Data/Hora Atribuição
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {chamado.DTENVIO_CHAMADO || 'n/a'}
                              </span>
                           </div>

                           {/* CONCLUSAO_CHAMADO */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Data Conclusão
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {chamado.CONCLUSAO_CHAMADO || 'n/a'}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* ===== COLUNA MEIO ===== */}
                  <div className="space-y-6">
                     {/* ===== CARD: PESSOAS ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 shadow-sm shadow-black">
                           <FaUser className="text-white" size={24} />
                           <h2 className="text-lg font-bold tracking-widest text-white select-none">
                              Consultor e Cliente
                           </h2>
                        </div>
                        <div className="space-y-3 p-4">
                           {/* NOME_RECURSO */}
                           <div className="flex items-center justify-between gap-10 border-b border-slate-200 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Consultor
                              </span>
                              <TooltipCondicionalTabelaChamado
                                 content={
                                    corrigirTextoCorrompido(
                                       chamado.NOME_RECURSO || ''
                                    ) || 'n/a'
                                 }
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black select-none">
                                    {corrigirTextoCorrompido(
                                       chamado.NOME_RECURSO?.split(' ')
                                          .slice(0, 2)
                                          .join(' ') || ''
                                    ) || 'n/a'}
                                 </span>
                              </TooltipCondicionalTabelaChamado>
                           </div>

                           {/* NOME_CLIENTE */}
                           <div className="flex items-center justify-between gap-10 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Cliente
                              </span>
                              <TooltipCondicionalTabelaChamado
                                 content={chamado.NOME_CLIENTE || 'n/a'}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black select-none">
                                    {chamado.NOME_CLIENTE?.split(' ')
                                       .slice(0, 2)
                                       .join(' ') || 'n/a'}
                                 </span>
                              </TooltipCondicionalTabelaChamado>
                           </div>
                        </div>
                     </div>

                     {/* ===== CARD: RELACIONAMENTOS ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 shadow-sm shadow-black">
                           <FaTasks className="text-white" size={24} />
                           <h2 className="text-lg font-bold tracking-widest text-white select-none">
                              Tarefa e Projeto
                           </h2>
                        </div>
                        <div className="space-y-3 p-4">
                           {/* TAREFA_COMPLETA */}
                           <div className="flex items-center justify-between gap-10 border-b border-slate-200 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Tarefa
                              </span>
                              <TooltipCondicionalTabelaChamado
                                 content={chamado.TAREFA_COMPLETA || 'n/a'}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black select-none">
                                    {chamado.TAREFA_COMPLETA || 'n/a'}
                                 </span>
                              </TooltipCondicionalTabelaChamado>
                           </div>

                           {/* PROJETO_COMPLETO */}
                           <div className="flex items-center justify-between gap-10 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Projeto
                              </span>
                              <TooltipCondicionalTabelaChamado
                                 content={chamado.PROJETO_COMPLETO || 'n/a'}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black select-none">
                                    {chamado.PROJETO_COMPLETO || 'n/a'}
                                 </span>
                              </TooltipCondicionalTabelaChamado>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* ===== COLUNA DIREITA ===== */}
                  <div className="space-y-6">
                     {/* ===== CARD: DETALHES DO CHAMADO ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 shadow-sm shadow-black">
                           <MdDescription className="text-white" size={24} />
                           <h2 className="text-lg font-bold tracking-widest text-white select-none">
                              Observações e Detalhes
                           </h2>
                        </div>
                        <div className="space-y-3 p-4">
                           {/* ASSUNTO_CHAMADO */}
                           <div className="flex items-center justify-between gap-10 border-b border-slate-200 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Assunto
                              </span>
                              <TooltipCondicionalTabelaChamado
                                 content={
                                    corrigirTextoCorrompido(
                                       chamado.ASSUNTO_CHAMADO || ''
                                    ) || 'n/a'
                                 }
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black select-none">
                                    {corrigirTextoCorrompido(
                                       chamado.ASSUNTO_CHAMADO || ''
                                    ) || 'n/a'}
                                 </span>
                              </TooltipCondicionalTabelaChamado>
                           </div>

                           {/* EMAIL_CHAMADO */}
                           <div className="flex items-center justify-between gap-10 border-b border-slate-200 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Email
                              </span>
                              <TooltipCondicionalTabelaChamado
                                 content={chamado.EMAIL_CHAMADO || 'n/a'}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black select-none">
                                    {chamado.EMAIL_CHAMADO || 'n/a'}
                                 </span>
                              </TooltipCondicionalTabelaChamado>
                           </div>

                           {/* SOLICITACAO_CHAMADO */}
                           <div className="flex items-center justify-between gap-10 border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Solicitação
                              </span>
                              <TooltipCondicionalTabelaChamado
                                 content={corrigirTextoCorrompido(
                                    chamado.SOLICITACAO_CHAMADO || 'n/a'
                                 )}
                              >
                                 <span className="text-base font-bold tracking-widest text-black select-none">
                                    {corrigirTextoCorrompido(
                                       chamado.SOLICITACAO_CHAMADO || 'n/a'
                                    )}
                                 </span>
                              </TooltipCondicionalTabelaChamado>
                           </div>

                           {/* SOLICITACAO2_CHAMADO */}
                           <div className="flex items-center justify-between gap-10 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Solicitação 2
                              </span>
                              <TooltipCondicionalTabelaChamado
                                 content={corrigirTextoCorrompido(
                                    chamado.SOLICITACAO2_CHAMADO || 'n/a'
                                 )}
                              >
                                 <span className="text-base font-bold tracking-widest text-black select-none">
                                    {corrigirTextoCorrompido(
                                       chamado.SOLICITACAO2_CHAMADO || 'n/a'
                                    )}
                                 </span>
                              </TooltipCondicionalTabelaChamado>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </main>
         </div>
      </div>
   );
}
