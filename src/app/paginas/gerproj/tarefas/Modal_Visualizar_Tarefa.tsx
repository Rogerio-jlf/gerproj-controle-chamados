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
   formatarMoeda,
   obterSufixoHoras,
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
// CONSTANTES
// ================================================================================
const EMPTY_VALUE = 'n/a' as const;

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

         <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-[80vw] overflow-hidden rounded-2xl border-0 bg-white transition-all duration-500 ease-out">
            {/* ===== HEADER ===== */}
            <header className="relative flex items-center justify-between bg-gradient-to-r from-teal-600 to-teal-700 p-6 shadow-sm shadow-black">
               <div className="flex items-center justify-center gap-6">
                  <FaTasks className="text-black" size={72} />
                  <div className="flex flex-col">
                     <h1 className="text-4xl font-extrabold tracking-widest text-black select-none">
                        DETALHES DA TAREFA
                     </h1>
                     <p className="text-xl font-extrabold tracking-widest text-black italic select-none">
                        CÓDIGO {formatarCodNumber(tarefa.COD_TAREFA)}
                     </p>
                  </div>
               </div>
               {/* ========== */}

               <button
                  onClick={handleCloseModalVisualizarTarefa}
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
                           {/* TAREFA_COMPLETA */}
                           <div className="flex items-center justify-between gap-10 border-b border-slate-200 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Tarefa
                              </span>
                              <TooltipCondicionalTabelaTarefa
                                 content={corrigirTextoCorrompido(
                                    tarefa.TAREFA_COMPLETA || ''
                                 )}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black italic select-none">
                                    {corrigirTextoCorrompido(
                                       tarefa.TAREFA_COMPLETA
                                    )}
                                 </span>
                              </TooltipCondicionalTabelaTarefa>
                           </div>
                           {/* ===== */}

                           {/* PROJETO_COMPLETO */}
                           <div className="flex items-center justify-between gap-10 border-b border-slate-200 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Projeto
                              </span>
                              <TooltipCondicionalTabelaTarefa
                                 content={corrigirTextoCorrompido(
                                    tarefa.PROJETO_COMPLETO || ''
                                 )}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black italic select-none">
                                    {corrigirTextoCorrompido(
                                       tarefa.PROJETO_COMPLETO
                                    )}
                                 </span>
                              </TooltipCondicionalTabelaTarefa>
                           </div>
                           {/* ===== */}

                           {/* ORDEM_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Ordem
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {formatarCodNumber(tarefa.ORDEM_TAREFA)}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* COD_AREA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Área
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {formatarCodNumber(tarefa.COD_AREA)}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* COD_TIPOTRF */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Tipo
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {tarefa.TIPO_TAREFA_COMPLETO}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* COD_FASE */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Fase
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {formatarCodNumber(tarefa.COD_FASE)}
                              </span>
                           </div>
                           {/* ===== */}
                        </div>
                     </div>
                     {/* ========== */}

                     {/* ===== CARD DATAS ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 shadow-sm shadow-black">
                           {/* HEADER */}
                           <FaClock className="text-white" size={24} />
                           <h2 className="text-lg font-extrabold tracking-widest text-white select-none">
                              DATAS
                           </h2>
                        </div>
                        {/* ===== */}
                        <div className="space-y-3 p-4">
                           {/* DTSOL_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Solicitação
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
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
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Aprovação
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
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
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Previsão
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
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
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Inclusão
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {formatarDataParaBR(
                                    tarefa.DTINC_TAREFA.toString()
                                 )}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* VALINI_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Validade Início
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {formatarDataParaBR(
                                    tarefa.VALINI_TAREFA.toString()
                                 )}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* VALFIM_TAREFA */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Validade Fim
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {formatarDataParaBR(
                                    tarefa.VALFIM_TAREFA.toString()
                                 )}
                              </span>
                           </div>
                           {/* ===== */}
                        </div>
                     </div>
                  </div>
                  {/* ==================== */}

                  {/* ===== COLUNA DO MEIO ===== */}
                  <div className="space-y-6">
                     {/* ===== CARD HORAS ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 shadow-sm shadow-black">
                           <FaClock className="text-white" size={24} />
                           <h2 className="text-lg font-extrabold tracking-widest text-white select-none">
                              HORAS
                           </h2>
                        </div>
                        {/* ===== */}
                        <div className="space-y-3 p-4">
                           {/* HREST_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Estimada
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {tarefa.HREST_TAREFA
                                    ? `${formatarHorasTotaisHorasDecimais(tarefa.HREST_TAREFA.toString())} ${obterSufixoHoras(tarefa.HREST_TAREFA)}`
                                    : EMPTY_VALUE}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* HRATESC_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Há Verificar
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {tarefa.HRATESC_TAREFA
                                    ? `${formatarHorasTotaisHorasDecimais(tarefa.HRATESC_TAREFA.toString())} ${obterSufixoHoras(tarefa.HRATESC_TAREFA)}`
                                    : EMPTY_VALUE}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* HRREAL_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Real
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {tarefa.HRREAL_TAREFA
                                    ? `${formatarHorasTotaisHorasDecimais(tarefa.HRREAL_TAREFA.toString())} ${obterSufixoHoras(tarefa.HRREAL_TAREFA)}`
                                    : 'n/a'}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* QTD_HRS_GASTAS */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Utilizadas
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {formatarHorasTotaisHorasDecimais(
                                    tarefa.QTD_HRS_GASTAS.toString()
                                 )}{' '}
                                 {obterSufixoHoras(
                                    tarefa.QTD_HRS_GASTAS.toString()
                                 )}
                              </span>
                           </div>
                           {/* ===== */}
                        </div>
                     </div>
                     {/* ========== */}

                     {/* ===== CARD INDICADORES ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 shadow-sm shadow-black">
                           {/* HEADER */}
                           <FaCheck className="text-white" size={24} />
                           <h2 className="text-lg font-extrabold tracking-widest text-white select-none">
                              INDICADORES
                           </h2>
                        </div>
                        {/* ===== */}
                        <div className="space-y-3 p-4">
                           {/* MARGEM_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Margem
                              </span>
                              {formatarSimNao(tarefa.MARGEM_TAREFA)}
                           </div>
                           {/* ===== */}

                           {/* ESTIMADO_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Estimado
                              </span>
                              {formatarSimNao(tarefa.ESTIMADO_TAREFA)}
                           </div>
                           {/* ===== */}

                           {/* FATEST_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Fatura Estimativa
                              </span>
                              {formatarSimNao(tarefa.FATEST_TAREFA)}
                           </div>
                           {/* ===== */}

                           {/* PERIMP_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Permite Importação
                              </span>
                              {formatarSimNao(tarefa.PERIMP_TAREFA)}
                           </div>
                           {/* ===== */}

                           {/* FATURA_TAREFA */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Fatura
                              </span>
                              {formatarSimNao(tarefa.FATURA_TAREFA)}
                           </div>
                           {/* ===== */}
                        </div>
                     </div>
                     {/* ========== */}
                  </div>
                  {/* ==================== */}

                  {/* ===== COLUNA DA DIREITA ===== */}
                  <div className="space-y-6">
                     {/* ===== CARD FINANCEIRO ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 shadow-sm shadow-black">
                           {/* HEADER */}
                           <FaDollarSign className="text-white" size={24} />
                           <h2 className="text-lg font-extrabold tracking-widest text-white select-none">
                              INFORMAÇÕES FINANCEIRAS
                           </h2>
                        </div>
                        {/* ===== */}
                        <div className="space-y-3 p-4">
                           {/* VRHR_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Valor Hora
                              </span>
                              <span className="text-lg font-bold tracking-widest text-black italic select-none">
                                 {formatarMoeda(tarefa.VRHR_TAREFA)}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* PERC_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Percentual
                              </span>
                              <span className="text-lg font-bold tracking-widest text-black italic select-none">
                                 {tarefa.PERC_TAREFA} %
                              </span>
                           </div>
                           {/* ===== */}

                           {/* LIMMES_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Limite Mensal
                              </span>
                              <span className="text-lg font-bold tracking-widest text-black italic select-none">
                                 {tarefa.LIMMES_TAREFA ?? EMPTY_VALUE}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* VALIDA_TAREFA */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Validação
                              </span>
                              <span className="text-lg font-bold tracking-widest text-black italic select-none">
                                 {tarefa.VALIDA_TAREFA}
                              </span>
                           </div>
                           {/* ===== */}
                        </div>
                     </div>
                     {/* ========== */}

                     {/* ===== CARD RECURSO, CLIENTE E RESPONSÁVEL ===== */}
                     <div className="overflow-hidden rounded-xl bg-white shadow-md shadow-black">
                        {/* HEADER */}
                        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-3 shadow-sm shadow-black">
                           <FaUser className="text-white" size={24} />
                           <h2 className="text-lg font-extrabold tracking-widest text-white select-none">
                              CONSULTOR, CLIENTE E RESPONSÁVEL
                           </h2>
                        </div>
                        {/* ===== */}
                        <div className="space-y-3 p-4">
                           {/* NOME_RECURSO */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Consultor
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {tarefa.NOME_RECURSO.trim()
                                    .split(/\s+/)
                                    .slice(0, 2)
                                    .join(' ')}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* CODRECRESP_TAREFA */}
                           <div className="flex items-center justify-between border-b border-slate-200 py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Consultor Responsável
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {tarefa.NOME_RECURSO_RESPONSAVEL.trim()
                                    .split(/\s+/)
                                    .slice(0, 2)
                                    .join(' ')}
                              </span>
                           </div>
                           {/* ===== */}

                           {/* NOME_CLIENTE */}
                           <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Cliente
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
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
                        {/* HEADER */}
                        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-3 shadow-sm shadow-black">
                           <MdDescription className="text-white" size={24} />
                           <h2 className="text-lg font-extrabold tracking-widest text-white select-none">
                              OBSERVAÇÕES E OUTROS
                           </h2>
                        </div>
                        {/* ===== */}
                        <div className="space-y-3 p-4">
                           {/* OBS_TAREFA */}
                           <div className="flex items-center justify-between gap-10 py-2">
                              <span className="w-60 flex-shrink-0 text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Observação
                              </span>
                              <TooltipCondicionalTabelaTarefa
                                 content={corrigirTextoCorrompido(
                                    tarefa.OBS_TAREFA || EMPTY_VALUE
                                 )}
                              >
                                 <span className="flex-1 truncate text-right text-base font-bold tracking-widest text-black italic select-none">
                                    {corrigirTextoCorrompido(
                                       tarefa.OBS_TAREFA || EMPTY_VALUE
                                    )}
                                 </span>
                              </TooltipCondicionalTabelaTarefa>
                           </div>

                           {/* EXIBECHAM_TAREFA */}
                           <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                              <span className="text-sm font-semibold tracking-widest text-slate-600 select-none">
                                 Exibe Chamado
                              </span>
                              <span className="text-base font-bold tracking-widest text-black italic select-none">
                                 {tarefa.EXIBECHAM_TAREFA ?? EMPTY_VALUE}
                              </span>
                           </div>
                           {/* ===== */}
                        </div>
                     </div>
                     {/* ========== */}
                     {/* ==================== */}
                  </div>
               </div>
            </main>
         </div>
      </div>
   );
}
