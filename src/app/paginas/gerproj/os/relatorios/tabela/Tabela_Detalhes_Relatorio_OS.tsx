'use client';
// IMPORTS
import { useState, useCallback, useMemo } from 'react';

// COMPONENTS
import { PDFRelatorioOS } from '../../../../../../components/Button_PDF';
import { ExcelRelatorioOS } from '../../../../../../components/Button_Excel';
import {
   normalizeDateForComparison,
   FiltrosHeaderTabelaRelatorioOS,
} from './Filtros_Header_Tabela_Relatorio_OS';
import {
   TableRow,
   EmptyRow,
   useVisibleColumns,
   type DetalheOS,
} from './Colunas_Tabela_Detalhes_Relatorio_OS';

// FORMATTERS
import {
   formatarCodNumber,
   formatarDataParaBR,
   formatarHorasTotaisHorasDecimais,
   normalizeDate,
} from '../../../../../../utils/formatters';

// HELPERS
import { corrigirTextoCorrompido } from '../../../../../../lib/corrigirTextoCorrompido';

// ICONS
import { IoClose } from 'react-icons/io5';
import { HiDocumentReport } from 'react-icons/hi';
import { FaEraser, FaExclamationTriangle, FaUserTie } from 'react-icons/fa';

// ================================================================================
// CONSTANTES
// ================================================================================
const ANIMATION_DURATION = 100;

// Mapeamento de larguras das colunas
const COLUMN_WIDTHS: Record<string, string> = {
   codOs: '6%',
   codTarefa: '6%',
   tarefa: '12%',
   codProjeto: '6%',
   projeto: '12%',
   data: '8%',
   horaInicio: '6%',
   horaFim: '6%',
   horas: '8%',
   dataInclusao: '8%',
   recurso: '15%',
   faturado: '8%',
   validado: '8%',
   chamado: '6%',
};

// Títulos das colunas
const COLUMN_TITLES: Record<string, string> = {
   codOs: 'OS',
   codTarefa: 'CÓD. TAREFA',
   tarefa: 'TAREFA',
   codProjeto: 'CÓD. PROJETO',
   projeto: 'PROJETO',
   data: 'DT. INÍCIO',
   horaInicio: 'HR. INÍCIO',
   horaFim: 'HR. FIM',
   horas: "TOTAL HR's",
   dataInclusao: 'DT. INCLUSÃO',
   recurso: 'CONSULTOR',
   faturado: 'CLIENTE PAGA',
   validado: 'CONSULTOR RECEBE',
   chamado: 'CHAMADO',
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
   totalHoras: number;
   quantidadeOS: number;
   osFaturadas: number;
   osValidadas: number;
   detalhes: DetalheOS[];
   codCliente?: number;
   codRecurso?: number;
   codProjeto?: number;
   codTarefa?: number;
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
export const TabelalDetalhesRelatorioOS = ({
   grupo,
   agruparPor,
   filtrosAplicados,
   onClose,
}: ModalDetalhesProps) => {
   const [isClosing, setIsClosing] = useState(false);

   // Estados dos filtros do modal (header da tabela)
   const [filtroOS, setFiltroOS] = useState('');
   const [filtroTarefa, setFiltroTarefa] = useState('');
   const [filtroCodTarefa, setFiltroCodTarefa] = useState('');
   const [filtroProjeto, setFiltroProjeto] = useState('');
   const [filtroCodProjeto, setFiltroCodProjeto] = useState('');
   const [filtroData, setFiltroData] = useState('');
   const [filtroDataInclusao, setFiltroDataInclusao] = useState('');
   const [filtroRecurso, setFiltroRecurso] = useState('');
   const [filtroFaturado, setFiltroFaturado] = useState('');
   const [filtroValidado, setFiltroValidado] = useState('');
   const [filtroChamado, setFiltroChamado] = useState('');

   // Função para fechar o modal com animação
   const handleCloseTabelaRelatorioOS = useCallback(() => {
      setIsClosing(true);
      setTimeout(() => {
         setIsClosing(false);
         onClose();
      }, ANIMATION_DURATION);
   }, [onClose]);

   const limparFiltros = useCallback(() => {
      setFiltroOS('');
      setFiltroCodTarefa('');
      setFiltroTarefa('');
      setFiltroCodProjeto('');
      setFiltroProjeto('');
      setFiltroData('');
      setFiltroDataInclusao('');
      setFiltroRecurso('');
      setFiltroFaturado('');
      setFiltroValidado('');
      setFiltroChamado('');
   }, []);

   const filtrosAtivos = useMemo(() => {
      return [
         filtroOS,
         filtroCodTarefa,
         filtroTarefa,
         filtroCodProjeto,
         filtroProjeto,
         filtroData,
         filtroDataInclusao,
         filtroRecurso,
         filtroFaturado,
         filtroValidado,
         filtroChamado,
      ].filter(f => f.trim()).length;
   }, [
      filtroOS,
      filtroCodTarefa,
      filtroTarefa,
      filtroCodProjeto,
      filtroProjeto,
      filtroData,
      filtroDataInclusao,
      filtroRecurso,
      filtroFaturado,
      filtroValidado,
      filtroChamado,
   ]);

   const detalhesFiltrados = useMemo(() => {
      return grupo.detalhes.filter(detalhe => {
         // Filtro de OS
         if (filtroOS && !String(detalhe.codOs).includes(filtroOS)) {
            return false;
         }

         // Filtro de Código da Tarefa
         if (
            filtroCodTarefa &&
            !String(detalhe.codTarefa || '').includes(filtroCodTarefa)
         ) {
            return false;
         }

         // Filtro de Tarefa
         if (
            filtroTarefa &&
            !detalhe.tarefa?.toLowerCase().includes(filtroTarefa.toLowerCase())
         ) {
            return false;
         }

         // Filtro de Código do Projeto
         if (
            filtroCodProjeto &&
            !String(detalhe.codProjeto || '').includes(filtroCodProjeto)
         ) {
            return false;
         }

         // Filtro de Projeto
         if (
            filtroProjeto &&
            !detalhe.projeto
               ?.toLowerCase()
               .includes(filtroProjeto.toLowerCase())
         ) {
            return false;
         }

         // ============ FILTRO DE DATA (corrigido) ============
         if (filtroData) {
            const dataFiltroNormalizada =
               normalizeDateForComparison(filtroData);
            const dataDetalheNormalizada = normalizeDateForComparison(
               detalhe.data
            );

            if (!dataDetalheNormalizada.includes(dataFiltroNormalizada)) {
               return false;
            }
         }

         // ============ FILTRO DE DATA INCLUSÃO (corrigido - ignora horas) ============
         if (filtroDataInclusao) {
            const dataFiltroNormalizada =
               normalizeDateForComparison(filtroDataInclusao);
            const dataDetalheNormalizada = normalizeDateForComparison(
               detalhe.dataInclusao
            );

            if (!dataDetalheNormalizada.includes(dataFiltroNormalizada)) {
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

         // Filtro de Faturado
         if (filtroFaturado && filtroFaturado !== 'todos') {
            if (filtroFaturado === 'SIM' && detalhe.faturado !== 'SIM')
               return false;
            if (filtroFaturado === 'NAO' && detalhe.faturado !== 'NAO')
               return false;
         }

         // Filtro de Validado
         if (filtroValidado && filtroValidado !== 'todos') {
            if (filtroValidado === 'SIM' && detalhe.validado !== 'SIM')
               return false;
            if (filtroValidado === 'NAO' && detalhe.validado !== 'NAO')
               return false;
         }

         // Filtro de Chamado
         if (
            filtroChamado &&
            !String(detalhe.chamado).includes(filtroChamado)
         ) {
            return false;
         }

         return true;
      });
   }, [
      grupo.detalhes,
      filtroOS,
      filtroCodTarefa,
      filtroTarefa,
      filtroCodProjeto,
      filtroProjeto,
      filtroData,
      filtroDataInclusao,
      filtroRecurso,
      filtroFaturado,
      filtroValidado,
      filtroChamado,
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
      codOs: { state: filtroOS, setter: setFiltroOS },
      codTarefa: { state: filtroCodTarefa, setter: setFiltroCodTarefa },
      tarefa: { state: filtroTarefa, setter: setFiltroTarefa },
      codProjeto: { state: filtroCodProjeto, setter: setFiltroCodProjeto },
      projeto: { state: filtroProjeto, setter: setFiltroProjeto },
      data: { state: filtroData, setter: setFiltroData },
      dataInclusao: {
         state: filtroDataInclusao,
         setter: setFiltroDataInclusao,
      },
      recurso: { state: filtroRecurso, setter: setFiltroRecurso },
      faturado: { state: filtroFaturado, setter: setFiltroFaturado },
      validado: { state: filtroValidado, setter: setFiltroValidado },
      chamado: { state: filtroChamado, setter: setFiltroChamado },
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
                           Relatório de OS's
                        </p>
                        <p className="text-lg font-extrabold tracking-widest text-black italic select-none">
                           {(() => {
                              // Extrai as propriedades que podem existir
                              const { dataInicio, dataFim, ano, mes } =
                                 filtrosAplicados || {};

                              const now = new Date();
                              const mesAtual = String(
                                 now.getMonth() + 1
                              ).padStart(2, '0');
                              const anoAtual = now.getFullYear();

                              // Se tem dataInicio e dataFim (formato YYYY-MM-DD)
                              if (dataInicio && dataFim) {
                                 // Converte de YYYY-MM-DD para DD/MM/YYYY
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

                              // Se tem ano e mês (mas não tem datas completas)
                              if (ano && mes) {
                                 return (
                                    <>
                                       {mes}/{ano}
                                    </>
                                 );
                              }

                              // Se só tem mês
                              if (mes && !ano) {
                                 return (
                                    <>
                                       {mes}/{anoAtual}
                                    </>
                                 );
                              }

                              // Se só tem ano
                              if (ano && !mes) {
                                 return (
                                    <>
                                       {mesAtual}/{ano}
                                    </>
                                 );
                              }

                              // Se não tem nenhum filtro de data
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
                              TOTAL DE OS's
                           </div>
                           <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                              {formatarCodNumber(grupo.quantidadeOS)}
                           </div>
                        </div>

                        <div className="flex w-[300px] flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-teal-600 bg-gradient-to-br from-teal-600 to-teal-700 px-6 py-2 shadow-md shadow-black">
                           <div className="text-sm font-extrabold tracking-widest text-white uppercase select-none">
                              Total de Horas
                           </div>
                           <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                              {formatarHorasTotaisHorasDecimais(
                                 grupo.totalHoras
                              )}
                              {(() => {
                                 const n = parseFloat(
                                    String(grupo.totalHoras).replace(',', '.')
                                 );
                                 return isNaN(n) ? 'hs' : n > 1 ? 'hs' : 'h';
                              })()}
                           </div>
                        </div>

                        <div className="flex w-[300px] flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-blue-600 bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-2 shadow-md shadow-black">
                           <div className="text-sm font-extrabold tracking-widest text-white select-none">
                              TOTAL DE OS's FATURADAS
                           </div>
                           <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                              {formatarCodNumber(grupo.osFaturadas)}
                           </div>
                        </div>

                        <div className="flex w-[300px] flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-green-600 bg-gradient-to-br from-green-600 to-green-700 px-6 py-2 shadow-md shadow-black">
                           <div className="text-sm font-extrabold tracking-widest text-white select-none">
                              TOTAL DE OS's VALIDADAS
                           </div>
                           <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                              {formatarCodNumber(grupo.osValidadas)}
                           </div>
                        </div>
                     </div>

                     {/* Botões de Exportação */}
                     <div className="flex items-center gap-6">
                        <ExcelRelatorioOS
                           grupo={grupo}
                           tipoAgrupamento={agruparPor}
                           filtros={filtrosAplicados}
                        />
                        <PDFRelatorioOS
                           grupo={grupo}
                           tipoAgrupamento={agruparPor}
                           filtros={filtrosAplicados}
                        />
                     </div>

                     {/* BOTÃO FECHAR MODAL */}
                     <div className="group flex items-center justify-center">
                        <button
                           onClick={handleCloseTabelaRelatorioOS}
                           aria-label="Fechar relatório de OS"
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
                                       {/* BOTÃO LIMPAR FILTROS na coluna horaFim */}
                                       {columnId === 'horaFim' &&
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
                                       ) : columnId !== 'horas' &&
                                         FILTER_MAP[columnId] ? (
                                          <FiltrosHeaderTabelaRelatorioOS
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
