'use client';
// IMPORTS
import { useState, useCallback, useMemo } from 'react';

// COMPONENTS
import { PDFRelatorioOS } from '../../../../../../components/Button_PDF';
import { ExcelRelatorioOS } from '../../../../../../components/Button_Excel';
import {
   normalizeDateForComparison,
   FiltrosHeaderTabelaRelatorioChamados,
} from '../tabela/Filtros_Header_Tabela_Relatorio_Chamado';
import {
   TableRow,
   EmptyRow,
   useVisibleColumns,
   type DetalheChamado,
} from '../tabela/Colunas_Tabela_Relatorio_Chamado';

// FORMATTERS
import { formatarCodNumber } from '../../../../../../utils/formatters';

// HELPERS
import { corrigirTextoCorrompido } from '../../../../../../lib/corrigirTextoCorrompido';

// ICONS
import { IoClose } from 'react-icons/io5';
import { HiDocumentReport } from 'react-icons/hi';
import { FaEraser, FaExclamationTriangle } from 'react-icons/fa';

// ================================================================================
// CONSTANTES
// ================================================================================
const ANIMATION_DURATION = 100;

// Mapeamento de larguras das colunas
const COLUMN_WIDTHS: Record<string, string> = {
   codChamado: '6%',
   data: '8%',
   hora: '6%',
   assunto: '20%',
   status: '8%',
   prioridade: '8%',
   dataEnvio: '10%',
   diasEmAberto: '8%',
   tempoAtendimentoDias: '10%',
   cliente: '12%',
   recurso: '12%',
   projeto: '12%',
   tarefa: '12%',
   classificacao: '12%',
};

// Títulos das colunas
const COLUMN_TITLES: Record<string, string> = {
   codChamado: 'CHAMADO',
   data: 'DATA',
   hora: 'HORA',
   assunto: 'ASSUNTO',
   status: 'STATUS',
   prioridade: 'PRIORIDADE',
   dataEnvio: 'DT. ENVIO',
   diasEmAberto: 'DIAS EM ABERTO',
   tempoAtendimentoDias: 'TEMPO ATENDIMENTO',
   cliente: 'CLIENTE',
   recurso: 'CONSULTOR',
   projeto: 'PROJETO',
   tarefa: 'TAREFA',
   classificacao: 'CLASSIFICAÇÃO',
};

function getColumnWidth(columnId: string): string {
   return COLUMN_WIDTHS[columnId] || 'auto';
}

function getColumnTitle(columnId: string): string {
   return COLUMN_TITLES[columnId] || columnId.toUpperCase();
}

// ================================================================================
// INTERFACES
// ================================================================================
interface GrupoRelatorio {
   chave: string;
   nome: string;
   quantidadeChamados: number;
   chamadosAbertos: number;
   chamadosFechados: number;
   chamadosPendentes: number;
   mediaTempoAtendimento: number | null;
   detalhes: DetalheChamado[];
   codCliente?: number;
   codRecurso?: number;
   codProjeto?: number;
   codClassificacao?: number;
   status?: string;
}

interface ModalDetalhesProps {
   grupo: GrupoRelatorio;
   agruparPor: string;
   filtrosAplicados: any;
   onClose: () => void;
}

// ================================================================================
// COMPONENTE MODAL DE DETALHES
// ================================================================================
export const TabelaDetalhesRelatorioChamados = ({
   grupo,
   agruparPor,
   filtrosAplicados,
   onClose,
}: ModalDetalhesProps) => {
   const [isClosing, setIsClosing] = useState(false);

   // Estados dos filtros do modal (header da tabela)
   const [filtroChamado, setFiltroChamado] = useState('');
   const [filtroData, setFiltroData] = useState('');
   const [filtroHora, setFiltroHora] = useState('');
   const [filtroAssunto, setFiltroAssunto] = useState('');
   const [filtroStatus, setFiltroStatus] = useState('');
   const [filtroPrioridade, setFiltroPrioridade] = useState('');
   const [filtroDataEnvio, setFiltroDataEnvio] = useState('');
   const [filtroDiasEmAberto, setFiltroDiasEmAberto] = useState('');
   const [filtroTempoAtendimento, setFiltroTempoAtendimento] = useState('');
   const [filtroCliente, setFiltroCliente] = useState('');
   const [filtroRecurso, setFiltroRecurso] = useState('');
   const [filtroProjeto, setFiltroProjeto] = useState('');
   const [filtroTarefa, setFiltroTarefa] = useState('');
   const [filtroClassificacao, setFiltroClassificacao] = useState('');

   // Função para fechar o modal com animação
   const handleCloseTabelaRelatorioChamados = useCallback(() => {
      setIsClosing(true);
      setTimeout(() => {
         setIsClosing(false);
         onClose();
      }, ANIMATION_DURATION);
   }, [onClose]);

   const limparFiltros = useCallback(() => {
      setFiltroChamado('');
      setFiltroData('');
      setFiltroHora('');
      setFiltroAssunto('');
      setFiltroStatus('');
      setFiltroPrioridade('');
      setFiltroDataEnvio('');
      setFiltroDiasEmAberto('');
      setFiltroTempoAtendimento('');
      setFiltroCliente('');
      setFiltroRecurso('');
      setFiltroProjeto('');
      setFiltroTarefa('');
      setFiltroClassificacao('');
   }, []);

   const filtrosAtivos = useMemo(() => {
      return [
         filtroChamado,
         filtroData,
         filtroHora,
         filtroAssunto,
         filtroStatus,
         filtroPrioridade,
         filtroDataEnvio,
         filtroDiasEmAberto,
         filtroTempoAtendimento,
         filtroCliente,
         filtroRecurso,
         filtroProjeto,
         filtroTarefa,
         filtroClassificacao,
      ].filter(f => f.trim()).length;
   }, [
      filtroChamado,
      filtroData,
      filtroHora,
      filtroAssunto,
      filtroStatus,
      filtroPrioridade,
      filtroDataEnvio,
      filtroDiasEmAberto,
      filtroTempoAtendimento,
      filtroCliente,
      filtroRecurso,
      filtroProjeto,
      filtroTarefa,
      filtroClassificacao,
   ]);

   const detalhesFiltrados = useMemo(() => {
      return grupo.detalhes.filter(detalhe => {
         // Filtro de Chamado
         if (
            filtroChamado &&
            !String(detalhe.codChamado).includes(filtroChamado)
         ) {
            return false;
         }

         // Filtro de Data
         if (filtroData) {
            const dataFiltroNormalizada =
               normalizeDateForComparison(filtroData);
            const dataDetalheNormalizada = normalizeDateForComparison(
               detalhe.data || ''
            );

            if (!dataDetalheNormalizada.includes(dataFiltroNormalizada)) {
               return false;
            }
         }

         // Filtro de Hora
         if (
            filtroHora &&
            !String(detalhe.hora || '')
               .toLowerCase()
               .includes(filtroHora.toLowerCase())
         ) {
            return false;
         }

         // Filtro de Assunto
         if (
            filtroAssunto &&
            !String(detalhe.assunto || '')
               .toLowerCase()
               .includes(filtroAssunto.toLowerCase())
         ) {
            return false;
         }

         // Filtro de Status
         if (filtroStatus) {
            if (!detalhe.status) return false;
            if (
               !detalhe.status
                  .toUpperCase()
                  .includes(filtroStatus.toUpperCase())
            ) {
               return false;
            }
         }

         // Filtro de Prioridade
         if (filtroPrioridade) {
            if (String(detalhe.prioridade) !== filtroPrioridade) {
               return false;
            }
         }

         // Filtro de Data Envio
         if (filtroDataEnvio) {
            const dataFiltroNormalizada =
               normalizeDateForComparison(filtroDataEnvio);
            const dataDetalheNormalizada = normalizeDateForComparison(
               detalhe.dataEnvio || ''
            );

            if (!dataDetalheNormalizada.includes(dataFiltroNormalizada)) {
               return false;
            }
         }

         // Filtro de Dias em Aberto
         if (
            filtroDiasEmAberto &&
            String(detalhe.diasEmAberto || '') !== filtroDiasEmAberto
         ) {
            return false;
         }

         // Filtro de Tempo de Atendimento
         if (
            filtroTempoAtendimento &&
            String(detalhe.tempoAtendimentoDias || '') !==
               filtroTempoAtendimento
         ) {
            return false;
         }

         // Filtro de Cliente
         if (filtroCliente) {
            const clienteNormalizado = corrigirTextoCorrompido(
               detalhe.cliente ?? ''
            );
            if (
               !clienteNormalizado
                  .toLowerCase()
                  .includes(filtroCliente.toLowerCase())
            ) {
               return false;
            }
         }

         // Filtro de Recurso
         if (filtroRecurso) {
            const recursoNormalizado = corrigirTextoCorrompido(
               detalhe.recurso ?? ''
            );
            if (
               !recursoNormalizado
                  .toLowerCase()
                  .includes(filtroRecurso.toLowerCase())
            ) {
               return false;
            }
         }

         // Filtro de Projeto
         if (filtroProjeto) {
            const projetoNormalizado = corrigirTextoCorrompido(
               detalhe.projeto ?? ''
            );
            if (
               !projetoNormalizado
                  .toLowerCase()
                  .includes(filtroProjeto.toLowerCase())
            ) {
               return false;
            }
         }

         // Filtro de Tarefa
         if (filtroTarefa) {
            const tarefaNormalizada = corrigirTextoCorrompido(
               detalhe.tarefa ?? ''
            );
            if (
               !tarefaNormalizada
                  .toLowerCase()
                  .includes(filtroTarefa.toLowerCase())
            ) {
               return false;
            }
         }

         // Filtro de Classificação
         if (filtroClassificacao) {
            const classificacaoNormalizada = corrigirTextoCorrompido(
               detalhe.classificacao ?? ''
            );
            if (
               !classificacaoNormalizada
                  .toLowerCase()
                  .includes(filtroClassificacao.toLowerCase())
            ) {
               return false;
            }
         }

         return true;
      });
   }, [
      grupo.detalhes,
      filtroChamado,
      filtroData,
      filtroHora,
      filtroAssunto,
      filtroStatus,
      filtroPrioridade,
      filtroDataEnvio,
      filtroDiasEmAberto,
      filtroTempoAtendimento,
      filtroCliente,
      filtroRecurso,
      filtroProjeto,
      filtroTarefa,
      filtroClassificacao,
   ]);

   const totalLinhasOriginais = grupo.detalhes.length;
   const linhasVazias = Math.max(
      0,
      totalLinhasOriginais - detalhesFiltrados.length
   );

   const visibleColumns = useVisibleColumns(agruparPor);
   const numeroColunas = visibleColumns.length;

   // Mapeamento de filtros por coluna
   const FILTER_MAP: Record<
      string,
      { state: string; setter: (value: string) => void }
   > = {
      codChamado: { state: filtroChamado, setter: setFiltroChamado },
      data: { state: filtroData, setter: setFiltroData },
      hora: { state: filtroHora, setter: setFiltroHora },
      assunto: { state: filtroAssunto, setter: setFiltroAssunto },
      status: { state: filtroStatus, setter: setFiltroStatus },
      prioridade: { state: filtroPrioridade, setter: setFiltroPrioridade },
      dataEnvio: { state: filtroDataEnvio, setter: setFiltroDataEnvio },
      diasEmAberto: {
         state: filtroDiasEmAberto,
         setter: setFiltroDiasEmAberto,
      },
      tempoAtendimentoDias: {
         state: filtroTempoAtendimento,
         setter: setFiltroTempoAtendimento,
      },
      cliente: { state: filtroCliente, setter: setFiltroCliente },
      recurso: { state: filtroRecurso, setter: setFiltroRecurso },
      projeto: { state: filtroProjeto, setter: setFiltroProjeto },
      tarefa: { state: filtroTarefa, setter: setFiltroTarefa },
      classificacao: {
         state: filtroClassificacao,
         setter: setFiltroClassificacao,
      },
   };

   return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
         {/* OVERLAY */}
         <div className="absolute inset-0 bg-teal-900" />

         {/* MODAL CONTAINER */}
         <div
            className={`animate-in slide-in-from-bottom-4 z-10 flex max-h-[90vh] w-full max-w-[95vw] flex-col overflow-hidden rounded-2xl transition-all duration-500 ease-out ${
               isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            }`}
            style={{
               animationDuration: `${ANIMATION_DURATION}ms`,
            }}
         >
            {/* HEADER DO MODAL */}
            <header className="flex flex-shrink-0 flex-col gap-20 bg-white/50 p-6 pb-24">
               <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center justify-center gap-6">
                     <HiDocumentReport className="text-black" size={100} />
                     <div className="flex flex-col">
                        <h1 className="text-4xl font-extrabold tracking-widest text-black uppercase select-none">
                           {grupo.nome}
                        </h1>
                        <p className="text-xl font-extrabold tracking-widest text-black italic select-none">
                           Relatório de Chamados
                        </p>
                        <p className="text-lg font-extrabold tracking-widest text-black italic select-none">
                           {(() => {
                              const { dataInicio, dataFim, ano, mes } =
                                 filtrosAplicados || {};

                              const now = new Date();
                              const mesAtual = String(
                                 now.getMonth() + 1
                              ).padStart(2, '0');
                              const anoAtual = now.getFullYear();

                              if (dataInicio && dataFim) {
                                 const [anoInicio, mesInicio, diaInicio] =
                                    dataInicio.split('-');
                                 const [anoFim, mesFim, diaFim] =
                                    dataFim.split('-');

                                 const dataInicioFormatada = `${diaInicio}/${mesInicio}/${anoInicio}`;
                                 const dataFimFormatada = `${diaFim}/${mesFim}/${anoFim}`;

                                 return (
                                    <>
                                       Período de {dataInicioFormatada} até{' '}
                                       {dataFimFormatada}
                                    </>
                                 );
                              }

                              if (ano && mes) {
                                 return (
                                    <>
                                       {mes}/{ano}
                                    </>
                                 );
                              }

                              if (mes && !ano) {
                                 return (
                                    <>
                                       {mes}/{anoAtual}
                                    </>
                                 );
                              }

                              if (ano && !mes) {
                                 return (
                                    <>
                                       {mesAtual}/{ano}
                                    </>
                                 );
                              }

                              return (
                                 <>
                                    {mesAtual}/{anoAtual}
                                 </>
                              );
                           })()}
                        </p>
                     </div>
                  </div>

                  <div className="flex items-center justify-between gap-20">
                     {/* Informações do grupo */}
                     <div className="flex h-full items-center justify-center gap-6">
                        <div className="flex w-[300px] flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-purple-600 bg-gradient-to-br from-purple-600 to-purple-700 px-6 py-2 shadow-md shadow-black">
                           <div className="text-sm font-extrabold tracking-widest text-white select-none">
                              TOTAL DE CHAMADOS
                           </div>
                           <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                              {formatarCodNumber(grupo.quantidadeChamados)}
                           </div>
                        </div>

                        <div className="flex w-[300px] flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-green-600 bg-gradient-to-br from-green-600 to-green-700 px-6 py-2 shadow-md shadow-black">
                           <div className="text-sm font-extrabold tracking-widest text-white select-none">
                              CHAMADOS FECHADOS
                           </div>
                           <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                              {formatarCodNumber(grupo.chamadosFechados)}
                           </div>
                        </div>

                        <div className="flex w-[300px] flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-blue-600 bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-2 shadow-md shadow-black">
                           <div className="text-sm font-extrabold tracking-widest text-white uppercase select-none">
                              CHAMADOS ABERTOS
                           </div>
                           <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                              {formatarCodNumber(grupo.chamadosAbertos)}
                           </div>
                        </div>

                        <div className="flex w-[300px] flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-yellow-600 bg-gradient-to-br from-yellow-600 to-yellow-700 px-6 py-2 shadow-md shadow-black">
                           <div className="text-sm font-extrabold tracking-widest text-white select-none">
                              CHAMADOS PENDENTES
                           </div>
                           <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                              {formatarCodNumber(grupo.chamadosPendentes)}
                           </div>
                        </div>
                     </div>

                     {/* Botões de Exportação */}
                     {/* <div className="flex items-center gap-6">
                        <ExcelRelatorioChamados
                           grupo={grupo}
                           tipoAgrupamento={agruparPor}
                           filtros={filtrosAplicados}
                        />
                        <PDFRelatorioChamados
                           grupo={grupo}
                           tipoAgrupamento={agruparPor}
                           filtros={filtrosAplicados}
                        />
                     </div> */}

                     {/* BOTÃO FECHAR MODAL */}
                     <div className="group flex items-center justify-center">
                        <button
                           onClick={handleCloseTabelaRelatorioChamados}
                           className="group cursor-pointer rounded-full bg-red-500/50 p-3 transition-all hover:scale-110 hover:rotate-180 hover:bg-red-500 active:scale-95"
                        >
                           <IoClose
                              className="text-white group-hover:scale-125"
                              size={24}
                           />
                        </button>
                     </div>
                  </div>
               </div>
            </header>

            {/* TABELA */}
            <main className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-black">
               <div className="h-full overflow-x-hidden overflow-y-auto">
                  {detalhesFiltrados.length === 0 ? (
                     <div className="flex flex-col items-center justify-center bg-black py-72 text-center">
                        <FaExclamationTriangle
                           className="mx-auto mb-6 text-yellow-500"
                           size={80}
                        />
                        <h3 className="text-2xl font-extrabold tracking-widest text-white italic select-none">
                           Nenhum registro encontrado para os filtros aplicados
                        </h3>
                     </div>
                  ) : (
                     <table className="w-full table-fixed border-collapse">
                        {/* CABEÇALHO DA TABELA */}
                        <thead
                           style={{
                              position: 'sticky',
                              top: 0,
                              zIndex: 30,
                              backgroundColor: '#0f766e',
                           }}
                        >
                           {/* LINHA DE TÍTULOS */}
                           <tr className="bg-teal-800">
                              {visibleColumns.map((column, idx) => {
                                 const columnId =
                                    typeof column === 'string'
                                       ? column
                                       : String(column?.id || column);
                                 return (
                                    <th
                                       key={`header-${idx}-${columnId}`}
                                       className="bg-teal-800 py-6 text-base font-extrabold tracking-wider text-white uppercase select-none"
                                       style={{
                                          width: getColumnWidth(columnId),
                                       }}
                                    >
                                       {getColumnTitle(columnId)}
                                    </th>
                                 );
                              })}
                           </tr>

                           {/* LINHA DE FILTROS */}
                           <tr className="bg-teal-800">
                              {visibleColumns.map((column, idx) => {
                                 const columnId =
                                    typeof column === 'string'
                                       ? column
                                       : String(column?.id || column);
                                 return (
                                    <th
                                       key={`filter-${idx}-${columnId}`}
                                       className="bg-teal-800 px-3 pb-6"
                                       style={{
                                          width: getColumnWidth(columnId),
                                       }}
                                    >
                                       {/* BOTÃO LIMPAR FILTROS na coluna hora */}
                                       {columnId === 'hora' &&
                                       filtrosAtivos > 0 ? (
                                          <button
                                             onClick={limparFiltros}
                                             title="Limpar Filtros"
                                             className="group cursor-pointer rounded-full border-none bg-gradient-to-br from-red-600 to-red-700 px-6 py-2.5 text-lg font-extrabold tracking-widest text-white shadow-md shadow-black transition-all hover:scale-110 active:scale-95"
                                          >
                                             <FaEraser
                                                size={20}
                                                className="text-white group-hover:scale-110"
                                             />
                                          </button>
                                       ) : FILTER_MAP[columnId] ? (
                                          <FiltrosHeaderTabelaRelatorioChamados
                                             value={FILTER_MAP[columnId].state}
                                             onChange={
                                                FILTER_MAP[columnId].setter
                                             }
                                             columnId={columnId}
                                          />
                                       ) : null}
                                    </th>
                                 );
                              })}
                           </tr>
                        </thead>

                        {/* CORPO DA TABELA */}
                        <tbody>
                           {detalhesFiltrados.map((detalhe, idx) => (
                              <TableRow
                                 key={`data-${idx}`}
                                 detalhe={detalhe}
                                 agruparPor={agruparPor}
                                 index={idx}
                              />
                           ))}

                           {Array.from({ length: linhasVazias }).map(
                              (_, idx) => (
                                 <EmptyRow
                                    key={`empty-${idx}`}
                                    index={idx + detalhesFiltrados.length}
                                    columnCount={numeroColunas}
                                 />
                              )
                           )}
                        </tbody>
                     </table>
                  )}
               </div>
            </main>
         </div>
      </div>
   );
};
