'use client';
// COMPONENTS
import { TooltipCondicionalTabelaTarefa } from '../tarefas/Tooltip_Condicional_Tabela_Tarefa';

// TYPES
import { TabelaTarefaProps } from '../../../../types/types';

// HELPERS
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';

// FORMATTERS
import {
   formatarCodNumber,
   formatarDataParaBR,
   formatarHorasTotaisHorasDecimais,
} from '../../../../utils/formatters';

// ICONS
import {
   FaUser,
   FaClock,
   FaDollarSign,
   FaCheck,
   FaInfo,
   FaTasks,
} from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { MdDescription } from 'react-icons/md';

// ================================================================================
// INTERFACES
// ================================================================================
interface ModalVisualizarTarefaProps {
   isOpen: boolean;
   onClose: () => void;
   tarefa: TabelaTarefaProps | null;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export function ModalVisualizarTarefa({
   isOpen,
   onClose,
   tarefa,
}: ModalVisualizarTarefaProps) {
   // ==========

   // Função para fechar o modal
   const handleCloseModalVisualizarTarefa = () => {
      onClose();
   };
   // ==========

   // Se o modal não estiver aberto ou a tarefa for nula, não renderiza nada
   if (!isOpen || !tarefa) return null;

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
                     <FaTasks className="text-black" size={28} />
                  </div>
                  {/* ===== */}
                  <div className="flex flex-col">
                     <h1 className="text-3xl font-extrabold tracking-wider text-black uppercase select-none">
                        Tarefa
                     </h1>
                     <p className="text-xl font-extrabold tracking-widest text-black italic select-none">
                        Código #{formatarCodNumber(tarefa.COD_TAREFA)}
                     </p>
                  </div>
               </div>
               {/* ========== */}

               <button
                  onClick={handleCloseModalVisualizarTarefa}
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
                           {/* TAREFA_COMPLETA */}
                           <div className="flex items-center justify-between gap-10 border-b border-slate-200 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Tarefa
                              </span>
                              <TooltipCondicionalTabelaTarefa
                                 content={tarefa.TAREFA_COMPLETA || ''}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black select-none">
                                    {tarefa.TAREFA_COMPLETA}
                                 </span>
                              </TooltipCondicionalTabelaTarefa>
                           </div>
                           {/* ===== */}

                           {/* PROJETO_COMPLETO */}
                           <div className="flex items-center justify-between gap-10 border-b border-slate-200 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Projeto
                              </span>
                              <TooltipCondicionalTabelaTarefa
                                 content={tarefa.PROJETO_COMPLETO || ''}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black select-none">
                                    {tarefa.PROJETO_COMPLETO}
                                 </span>
                              </TooltipCondicionalTabelaTarefa>
                           </div>
                           {/* ===== */}

                           {/* ORDEM_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Ordem
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {formatarCodNumber(tarefa.ORDEM_TAREFA)}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* COD_AREA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Área
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {formatarCodNumber(tarefa.COD_AREA)}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* COD_TIPOTRF */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Tipo
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {tarefa.TIPO_TAREFA_COMPLETO}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* COD_FASE */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Fase
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {formatarCodNumber(tarefa.COD_FASE)}
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
                           {/* DTSOL_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Data Solicitação
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {tarefa.DTSOL_TAREFA
                                    ? formatarDataParaBR(
                                         tarefa.DTSOL_TAREFA.toString()
                                      )
                                    : 'n/a'}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* DTAPROV_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Data Aprovação
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {tarefa.DTAPROV_TAREFA
                                    ? formatarDataParaBR(
                                         tarefa.DTAPROV_TAREFA.toString()
                                      )
                                    : 'n/a'}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* DTPREVENT_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Data Previsão
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {tarefa.DTPREVENT_TAREFA
                                    ? formatarDataParaBR(
                                         tarefa.DTPREVENT_TAREFA.toString()
                                      )
                                    : 'n/a'}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* DTINC_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Data Inclusão
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {formatarDataParaBR(
                                    tarefa.DTINC_TAREFA.toString()
                                 )}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* VALINI_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Validade Início
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {formatarDataParaBR(
                                    tarefa.VALINI_TAREFA.toString()
                                 )}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* VALFIM_TAREFA */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Validade Fim
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {formatarDataParaBR(
                                    tarefa.VALFIM_TAREFA.toString()
                                 )}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
                  {/* ==================== */}

                  {/* ===== COLUNA MEIO ===== */}
                  <div className="space-y-6">
                     {/* ===== CARD: HORAS ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 shadow-sm shadow-black">
                           <FaClock className="text-white" size={24} />
                           <h2 className="text-lg font-bold tracking-widest text-white select-none">
                              Horas
                           </h2>
                        </div>
                        <div className="space-y-3 p-4">
                           {/* HREST_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 QTD. Horas Estimadas
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {tarefa.HREST_TAREFA
                                    ? formatarHorasTotaisHorasDecimais(
                                         tarefa.HREST_TAREFA.toString()
                                      )
                                    : 'n/a'}
                                 h
                              </span>
                           </div>
                           {/* ===== */}

                           {/* HRATESC_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Horas Até Estimar
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {tarefa.HRATESC_TAREFA
                                    ? formatarHorasTotaisHorasDecimais(
                                         tarefa.HRATESC_TAREFA.toString()
                                      )
                                    : 'n/a'}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* HRREAL_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 QTD. Horas Reais
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {tarefa.HRREAL_TAREFA
                                    ? formatarHorasTotaisHorasDecimais(
                                         tarefa.HRREAL_TAREFA.toString()
                                      )
                                    : 'n/a'}
                                 h
                              </span>
                           </div>
                           {/* ===== */}

                           {/* QTD_HRS_GASTAS */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 QTD. Horas Gastas
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {formatarHorasTotaisHorasDecimais(
                                    tarefa.QTD_HRS_GASTAS.toString()
                                 )}
                                 h
                              </span>
                           </div>
                        </div>
                     </div>
                     {/* ========== */}

                     {/* ===== CARD: INDICADORES ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 shadow-sm shadow-black">
                           <FaCheck className="text-white" size={24} />
                           <h2 className="text-lg font-bold tracking-widest text-white select-none">
                              Indicadores
                           </h2>
                        </div>
                        <div className="space-y-3 p-4">
                           {/* MARGEM_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Margem
                              </span>
                              {formatarSimNao(tarefa.MARGEM_TAREFA)}
                           </div>
                           {/* ===== */}

                           {/* ESTIMADO_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Estimado
                              </span>
                              {formatarSimNao(tarefa.ESTIMADO_TAREFA)}
                           </div>
                           {/* ===== */}

                           {/* FATEST_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Faturar Estimativa
                              </span>
                              {formatarSimNao(tarefa.FATEST_TAREFA)}
                           </div>
                           {/* ===== */}

                           {/* PERIMP_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Permitir Importação
                              </span>
                              {formatarSimNao(tarefa.PERIMP_TAREFA)}
                           </div>
                           {/* ===== */}

                           {/* FATURA_TAREFA */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Faturar
                              </span>
                              {formatarSimNao(tarefa.FATURA_TAREFA)}
                           </div>
                        </div>
                     </div>
                     {/* ========== */}
                  </div>
                  {/* ==================== */}

                  {/* ===== COLUNA DIREITA ===== */}
                  <div className="space-y-6">
                     {/* ===== CARD: FINANCEIRO ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 shadow-sm shadow-black">
                           <FaDollarSign className="text-white" size={24} />
                           <h2 className="text-lg font-bold tracking-widest text-white select-none">
                              Financeiro
                           </h2>
                        </div>
                        <div className="space-y-3 p-4">
                           {/* VRHR_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Valor Hora
                              </span>
                              <span className="text-lg font-bold tracking-widest text-black italic select-none">
                                 R$ {tarefa.VRHR_TAREFA.toFixed(2)}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* PERC_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Percentual
                              </span>
                              <span className="text-lg font-bold tracking-widest text-black italic select-none">
                                 {tarefa.PERC_TAREFA}%
                              </span>
                           </div>
                           {/* ===== */}

                           {/* LIMMES_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Limite Mensal
                              </span>
                              <span className="text-lg font-bold tracking-widest text-black italic select-none">
                                 {tarefa.LIMMES_TAREFA ?? 'n/a'}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* VALIDA_TAREFA */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Validação
                              </span>
                              <span className="text-lg font-bold tracking-widest text-black italic select-none">
                                 {tarefa.VALIDA_TAREFA}
                              </span>
                           </div>
                        </div>
                     </div>
                     {/* ========== */}

                     {/* ===== CARD: RECURSO, CLIENTE E RESPONSÁVEL ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 shadow-sm shadow-black">
                           <FaUser className="text-white" size={24} />
                           <h2 className="text-lg font-bold tracking-widest text-white select-none">
                              Recurso, Cliente e Responsável
                           </h2>
                        </div>
                        <div className="space-y-3 p-4">
                           {/* NOME_RECURSO */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Consultor Tarefa
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {tarefa.NOME_RECURSO.trim()
                                    .split(/\s+/)
                                    .slice(0, 2)
                                    .join(' ')}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* CODRECRESP_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Consultor Responsável
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {tarefa.NOME_RECURSO_RESPONSAVEL.trim()
                                    .split(/\s+/)
                                    .slice(0, 2)
                                    .join(' ')}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* NOME_CLIENTE */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Cliente
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {tarefa.NOME_CLIENTE.trim()
                                    .split(/\s+/)
                                    .slice(0, 2)
                                    .join(' ')}
                              </span>
                           </div>
                           {/* ===== */}
                        </div>
                     </div>
                     {/* ========== */}

                     {/* ===== CARD OBSERVAÇÕES ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 shadow-sm shadow-black">
                           <MdDescription className="text-white" size={24} />
                           <h2 className="text-lg font-bold tracking-widest text-white select-none">
                              Observações e Outros
                           </h2>
                        </div>
                        <div className="space-y-3 p-4">
                           {/* OBS_TAREFA */}
                           <div className="flex items-center justify-between gap-10 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Observações
                              </span>
                              <TooltipCondicionalTabelaTarefa
                                 content={corrigirTextoCorrompido(
                                    tarefa.OBS_TAREFA || 'n/a'
                                 )}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black select-none">
                                    {corrigirTextoCorrompido(
                                       tarefa.OBS_TAREFA || 'n/a'
                                    )}
                                 </span>
                              </TooltipCondicionalTabelaTarefa>
                           </div>

                           {/* EXIBECHAM_TAREFA */}
                           <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Exibir Chamado
                              </span>
                              <span className="text-base font-bold tracking-widest text-black select-none">
                                 {tarefa.EXIBECHAM_TAREFA ?? 'n/a'}
                              </span>
                           </div>
                        </div>
                     </div>
                     {/* ==================== */}
                  </div>
               </div>
            </main>
         </div>
      </div>
   );
}
