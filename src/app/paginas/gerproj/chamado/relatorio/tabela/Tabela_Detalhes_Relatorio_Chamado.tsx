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
   type DetalhesChamadoColunas,
} from '../tabela/Colunas_Tabela_Relatorio_Chamado';

// FORMATTERS
import { formatarCodNumber } from '../../../../../../utils/formatters';

// HELPERS
import { corrigirTextoCorrompido } from '../../../../../../lib/corrigirTextoCorrompido';

// ICONS
import { IoClose } from 'react-icons/io5';
import { HiDocumentReport } from 'react-icons/hi';
import { FaEraser } from 'react-icons/fa';
import { RiFilterOffFill } from 'react-icons/ri';

// ================================================================================
// CONSTANTES
// ================================================================================
const ANIMATION_DURATION = 100;

// Mapeamento de larguras das colunas
const COLUMN_WIDTHS: Record<string, string> = {
   codChamado: '7%',
   dataChamado: '10%',
   horaChamado: '6%',
   assuntoChamado: '20%',
   emailChamado: '8%',
   nomeRecurso: '8%',
   dtEnvioChamado: '10%',
   quantidadeHorasGastasChamado: '8%',
   statusChamado: '10%',
   conclusaoChamado: '12%',
   nomeClassificacao: '12%',
};

// Títulos das colunas
const COLUMN_TITLES: Record<string, string> = {
   codChamado: 'CHAMADO',
   dataChamado: 'DATA',
   horaChamado: 'HORA',
   assuntoChamado: 'ASSUNTO',
   emailChamado: 'EMAIL',
   nomeRecurso: 'CONSULTOR',
   dtEnvioChamado: 'DT. ENVIO',
   quantidadeHorasGastasChamado: 'HRS. GASTAS',
   statusChamado: 'STATUS',
   conclusaoChamado: 'DT. CONCLUSÃO',
   nomeClassificacao: 'CLASSIFICAÇÃO',
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
interface GrupoRelatorioTabela {
   chave: string;
   nome: string;
   quantidadeChamados: number;
   quantidadeChamadosAbertos: number;
   quantidadeChamadosFinalizados: number;
   quantidadeChamadosPendentes: number;
   quantidadeHorasGastas: number;
   detalhes: DetalhesChamadoColunas[];
}

interface ModalDetalhesProps {
   grupo: GrupoRelatorioTabela;
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
   const [filtroCodChamado, setFiltroCodChamado] = useState('');
   const [filtroDataChamado, setFiltroDataChamado] = useState('');
   const [filtroNomeRecurso, setFiltroNomeRecurso] = useState('');
   const [filtroDtEnvioChamado, setFiltroDtEnvioChamado] = useState('');
   const [filtroStatusChamado, setFiltroStatusChamado] = useState('');
   const [filtroConclusaoChamado, setFiltroConclusaoChamado] = useState('');
   const [filtroNomeClassificacao, setFiltroNomeClassificacao] = useState('');

   // Função para fechar o modal com animação
   const handleCloseTabelaRelatorioChamados = useCallback(() => {
      setIsClosing(true);
      setTimeout(() => {
         setIsClosing(false);
         onClose();
      }, ANIMATION_DURATION);
   }, [onClose]);

   const limparFiltros = useCallback(() => {
      setFiltroCodChamado('');
      setFiltroDataChamado('');
      setFiltroNomeRecurso('');
      setFiltroDtEnvioChamado('');
      setFiltroStatusChamado('');
      setFiltroConclusaoChamado('');
      setFiltroNomeClassificacao('');
   }, []);

   const filtrosAtivos = useMemo(() => {
      return [
         filtroCodChamado,
         filtroDataChamado,
         filtroNomeRecurso,
         filtroDtEnvioChamado,
         filtroStatusChamado,
         filtroConclusaoChamado,
         filtroNomeClassificacao,
      ].filter(f => f.trim()).length;
   }, [
      filtroCodChamado,
      filtroDataChamado,
      filtroNomeRecurso,
      filtroDtEnvioChamado,
      filtroStatusChamado,
      filtroConclusaoChamado,
      filtroNomeClassificacao,
   ]);

   const detalhesFiltrados = useMemo(() => {
      return grupo.detalhes.filter(detalhe => {
         // Filtro de Chamado
         if (
            filtroCodChamado &&
            !String(detalhe.codChamado).includes(filtroCodChamado)
         ) {
            return false;
         }

         // Filtro de Data
         if (filtroDataChamado) {
            const dataFiltroNormalizada =
               normalizeDateForComparison(filtroDataChamado);
            const dataDetalheNormalizada = normalizeDateForComparison(
               detalhe.dataChamado || ''
            );

            if (!dataDetalheNormalizada.includes(dataFiltroNormalizada)) {
               return false;
            }
         }

         // Filtro de Recurso
         if (filtroNomeRecurso) {
            const recursoNormalizado = corrigirTextoCorrompido(
               detalhe.nomeRecurso ?? ''
            );
            if (
               !recursoNormalizado
                  .toLowerCase()
                  .includes(filtroNomeRecurso.toLowerCase())
            ) {
               return false;
            }
         }

         // Filtro de Data Envio
         if (filtroDtEnvioChamado) {
            const dataFiltroNormalizada =
               normalizeDateForComparison(filtroDtEnvioChamado);
            const dataDetalheNormalizada = normalizeDateForComparison(
               detalhe.dtEnvioChamado || ''
            );

            if (!dataDetalheNormalizada.includes(dataFiltroNormalizada)) {
               return false;
            }
         }

         // Filtro de Status
         if (filtroStatusChamado) {
            if (!detalhe.statusChamado) return false;
            if (
               !detalhe.statusChamado
                  .toUpperCase()
                  .includes(filtroStatusChamado.toUpperCase())
            ) {
               return false;
            }
         }

         // Filtro de Conclusão
         if (filtroConclusaoChamado) {
            if (!detalhe.conclusaoChamado) return false;
            if (
               !detalhe.conclusaoChamado
                  .toUpperCase()
                  .includes(filtroConclusaoChamado.toUpperCase())
            ) {
               return false;
            }
         }

         // Filtro de Classificação
         if (filtroNomeClassificacao) {
            const classificacaoNormalizada = corrigirTextoCorrompido(
               detalhe.nomeClassificacao ?? ''
            );
            if (
               !classificacaoNormalizada
                  .toLowerCase()
                  .includes(filtroNomeClassificacao.toLowerCase())
            ) {
               return false;
            }
         }

         return true;
      });
   }, [
      grupo.detalhes,
      filtroCodChamado,
      filtroDataChamado,
      filtroNomeRecurso,
      filtroDtEnvioChamado,
      filtroStatusChamado,
      filtroConclusaoChamado,
      filtroNomeClassificacao,
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
      codChamado: { state: filtroCodChamado, setter: setFiltroCodChamado },
      dataChamado: { state: filtroDataChamado, setter: setFiltroDataChamado },
      nomeRecurso: { state: filtroNomeRecurso, setter: setFiltroNomeRecurso },
      dtEnvioChamado: {
         state: filtroDtEnvioChamado,
         setter: setFiltroDtEnvioChamado,
      },
      statusChamado: {
         state: filtroStatusChamado,
         setter: setFiltroStatusChamado,
      },
      conclusaoChamado: {
         state: filtroConclusaoChamado,
         setter: setFiltroConclusaoChamado,
      },
      nomeClassificacao: {
         state: filtroNomeClassificacao,
         setter: setFiltroNomeClassificacao,
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
                     {/* CARDS TOTALIZADORES */}
                     <div className="flex h-full items-center justify-center gap-6">
                        <div className="flex w-[300px] flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-purple-600 bg-gradient-to-br from-purple-600 to-purple-700 px-6 py-2 shadow-md shadow-black">
                           <div className="text-sm font-extrabold tracking-widest text-white select-none">
                              CHAMADOS
                           </div>
                           <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                              {formatarCodNumber(grupo.quantidadeChamados)}
                           </div>
                        </div>

                        <div className="flex w-[300px] flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-green-600 bg-gradient-to-br from-green-600 to-green-700 px-6 py-2 shadow-md shadow-black">
                           <div className="text-sm font-extrabold tracking-widest text-white select-none">
                              CHAMADOS FINALIZADOS
                           </div>
                           <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                              {formatarCodNumber(
                                 grupo.quantidadeChamadosFinalizados
                              )}
                           </div>
                        </div>

                        <div className="flex w-[300px] flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-blue-600 bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-2 shadow-md shadow-black">
                           <div className="text-sm font-extrabold tracking-widest text-white uppercase select-none">
                              CHAMADOS ABERTOS
                           </div>
                           <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                              {formatarCodNumber(
                                 grupo.quantidadeChamadosAbertos
                              )}
                           </div>
                        </div>

                        <div className="flex w-[300px] flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-yellow-600 bg-gradient-to-br from-yellow-600 to-yellow-700 px-6 py-2 shadow-md shadow-black">
                           <div className="text-sm font-extrabold tracking-widest text-white select-none">
                              CHAMADOS PENDENTES
                           </div>
                           <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                              {formatarCodNumber(
                                 grupo.quantidadeChamadosPendentes
                              )}
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
                           className="cursor-pointer rounded-full bg-white/70 p-3 transition-all hover:scale-110 hover:rotate-180 hover:bg-red-500 active:scale-95"
                        >
                           <IoClose
                              className="text-black group-hover:scale-125 group-hover:text-white"
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
                     <div className="flex flex-col items-center justify-center gap-6 bg-black py-72 text-center">
                        <RiFilterOffFill
                           className="mx-auto text-white"
                           size={80}
                        />
                        <h3 className="mb-12 text-2xl font-extrabold tracking-widest text-white italic select-none">
                           Nenhum registro encontrado para os filtros aplicados
                        </h3>
                        <button
                           onClick={limparFiltros}
                           title="Limpar Filtros"
                           className="w-[200px] cursor-pointer rounded-md border-none bg-gradient-to-r from-red-600 to-red-700 px-6 py-2 text-lg font-extrabold tracking-widest text-white transition-all hover:scale-110 active:scale-95"
                        >
                           Limpar Filtros
                        </button>
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
