'use client';
// IMPORTS
import { useState, useCallback, useMemo } from 'react';

// COMPONENTS
import ExcelButtonRelatorioOS from '../../../../../components/Button_Excel';
import PDFButtonRelatorioOS from '../../../../../components/Button_PDF';
import { SelectSimNaoTabelaOS } from '../filtros/Select_Sim_Nao_Tabela_OS';

// ICONS
import { HiDocumentReport } from 'react-icons/hi';
import { IoClose } from 'react-icons/io5';
import { FaFilterCircleXmark } from 'react-icons/fa6';

// FORMATTERS
import {
   formatarHora,
   formatarCodNumber,
   formatarHorasTotaisHorasDecimais,
   formatarCodString,
   formatarDataParaBR,
   normalizeDate,
} from '../../../../../utils/formatters';

// UTILS
import { corrigirTextoCorrompido } from '../../../../../lib/corrigirTextoCorrompido';

// ================================================================================
// CONSTANTES
// ================================================================================
const ANIMATION_DURATION = 100;

// ================================================================================
// INTERFACES
// ================================================================================
interface DetalheOS {
   codOs: number;
   data: string;
   chamado: string;
   horaInicio: string;
   horaFim: string;
   horas: number;
   faturado: string;
   validado: string;
   competencia: string;
   cliente?: string;
   codCliente?: number;
   recurso?: string;
   codRecurso?: number;
   projeto?: string;
   codProjeto?: number;
   tarefa?: string;
   codTarefa?: number;
}

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
// COMPONENTE FILTRO MODAL
// ================================================================================
const FiltroModalDetalhes = ({
   value,
   onChange,
   placeholder,
}: {
   value: string;
   onChange: (value: string) => void;
   placeholder: string;
}) => {
   return (
      <div className="relative w-full">
         <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-md border border-teal-950 bg-teal-900 px-4 py-2 pr-10 text-base text-white transition-all select-none hover:bg-teal-950 focus:ring-2 focus:ring-pink-500 focus:outline-none"
         />
         {value && (
            <button
               onClick={() => onChange('')}
               className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-white transition-all hover:scale-150 hover:text-red-500 active:scale-95"
               type="button"
            >
               <IoClose size={20} />
            </button>
         )}
      </div>
   );
};

// ================================================================================
// COMPONENTE MODAL DE DETALHES
// ================================================================================
export const ModalDetalhesOS = ({
   grupo,
   agruparPor,
   filtrosAplicados,
   onClose,
}: ModalDetalhesProps) => {
   const [isClosing, setIsClosing] = useState(false);

   // Estados dos filtros do modal
   const [filtroOS, setFiltroOS] = useState('');
   const [filtroData, setFiltroData] = useState('');
   const [filtroChamado, setFiltroChamado] = useState('');
   const [filtroCliente, setFiltroCliente] = useState('');
   const [filtroRecurso, setFiltroRecurso] = useState('');
   const [filtroFaturado, setFiltroFaturado] = useState('');
   const [filtroValidado, setFiltroValidado] = useState('');

   const handleClose = useCallback(() => {
      setIsClosing(true);
      setTimeout(() => {
         onClose();
      }, ANIMATION_DURATION);
   }, [onClose]);

   // Função para limpar todos os filtros
   const limparFiltros = useCallback(() => {
      setFiltroOS('');
      setFiltroData('');
      setFiltroChamado('');
      setFiltroCliente('');
      setFiltroRecurso('');
      setFiltroFaturado('');
      setFiltroValidado('');
   }, []);

   // Contar filtros ativos
   const filtrosAtivos = useMemo(() => {
      return [
         filtroOS,
         filtroData,
         filtroChamado,
         filtroCliente,
         filtroRecurso,
         filtroFaturado,
         filtroValidado,
      ].filter(f => f.trim()).length;
   }, [
      filtroOS,
      filtroData,
      filtroChamado,
      filtroCliente,
      filtroRecurso,
      filtroFaturado,
      filtroValidado,
   ]);

   // Filtrar detalhes baseado nos filtros
   const detalhesFiltrados = useMemo(() => {
      return grupo.detalhes.filter(detalhe => {
         // Filtro OS
         if (filtroOS && !String(detalhe.codOs).includes(filtroOS)) {
            return false;
         }

         // Filtro Data
         if (filtroData) {
            const dateFormats = normalizeDate(detalhe.data);
            const match = dateFormats.some(dateFormat =>
               dateFormat.toLowerCase().includes(filtroData.toLowerCase())
            );
            if (!match) return false;
         }

         // Filtro Chamado
         if (
            filtroChamado &&
            !String(detalhe.chamado).includes(filtroChamado)
         ) {
            return false;
         }

         // Filtro Cliente
         if (
            filtroCliente &&
            !detalhe.cliente
               ?.toLowerCase()
               .includes(filtroCliente.toLowerCase())
         ) {
            return false;
         }

         // Filtro Recurso
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

         // Filtro Faturado
         if (filtroFaturado && filtroFaturado !== 'todos') {
            if (filtroFaturado === 'sim' && detalhe.faturado !== 'SIM')
               return false;
            if (filtroFaturado === 'nao' && detalhe.faturado !== 'NAO')
               return false;
         }

         // Filtro Validado
         if (filtroValidado && filtroValidado !== 'todos') {
            if (filtroValidado === 'sim' && detalhe.validado !== 'SIM')
               return false;
            if (filtroValidado === 'nao' && detalhe.validado !== 'NAO')
               return false;
         }

         return true;
      });
   }, [
      grupo.detalhes,
      filtroOS,
      filtroData,
      filtroChamado,
      filtroCliente,
      filtroRecurso,
      filtroFaturado,
      filtroValidado,
   ]);

   return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
         {/* OVERLAY */}
         <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
         />

         {/* MODAL CONTAINER */}
         <div
            className={`animate-in slide-in-from-bottom-4 z-10 h-[90vh] w-[95vw] overflow-hidden rounded-2xl shadow-xl shadow-black transition-all duration-500 ease-out ${
               isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            }`}
         >
            {/* HEADER DO MODAL */}
            <header className="flex flex-col gap-6 bg-white/50 p-6">
               <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center justify-center gap-6">
                     <div className="flex items-center justify-center rounded-lg bg-white/30 p-4 shadow-md shadow-black">
                        <HiDocumentReport className="text-black" size={28} />
                     </div>
                     <h2 className="text-2xl font-extrabold tracking-widest text-black uppercase select-none">
                        {grupo.nome}
                     </h2>
                  </div>

                  {/* Informações do grupo */}
                  <div className="flex h-full items-center justify-center gap-6">
                     <div className="flex w-[300px] flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-teal-600 bg-gradient-to-br from-teal-500 to-teal-600 px-6 py-2 shadow-md shadow-black">
                        <div className="text-sm font-extrabold tracking-widest text-white uppercase italic select-none">
                           Total de Horas
                        </div>
                        <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                           {formatarHorasTotaisHorasDecimais(grupo.totalHoras)}h
                        </div>
                     </div>

                     <div className="flex w-[300px] flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-purple-600 bg-gradient-to-br from-purple-500 to-purple-600 px-6 py-2 shadow-md shadow-black">
                        <div className="text-sm font-extrabold tracking-widest text-white italic select-none">
                           TOTAL DE OS's
                        </div>
                        <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                           {formatarCodNumber(grupo.quantidadeOS)}
                        </div>
                     </div>

                     <div className="flex w-[300px] flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-blue-600 bg-gradient-to-br from-blue-500 to-blue-600 px-6 py-2 shadow-md shadow-black">
                        <div className="text-sm font-extrabold tracking-widest text-white italic select-none">
                           TOTAL DE OS's FATURADAS
                        </div>
                        <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                           {formatarCodNumber(grupo.osFaturadas)}
                        </div>
                     </div>

                     <div className="flex w-[300px] flex-col gap-1 rounded-tl-4xl rounded-br-4xl border border-green-600 bg-gradient-to-br from-green-500 to-green-600 px-6 py-2 shadow-md shadow-black">
                        <div className="text-sm font-extrabold tracking-widest text-white italic select-none">
                           TOTAL DE OS's VALIDADAS
                        </div>
                        <div className="pl-4 text-3xl font-extrabold tracking-widest text-white italic select-none">
                           {formatarCodNumber(grupo.osValidadas)}
                        </div>
                     </div>

                     {/* Botões de Exportação */}
                     <div className="flex items-center gap-4">
                        <ExcelButtonRelatorioOS
                           grupo={grupo}
                           tipoAgrupamento={agruparPor}
                           filtros={filtrosAplicados}
                        />
                        <PDFButtonRelatorioOS
                           grupo={grupo}
                           tipoAgrupamento={agruparPor}
                           filtros={filtrosAplicados}
                        />
                     </div>

                     <button
                        onClick={handleClose}
                        aria-label="Fechar relatório de OS"
                        className={`group cursor-pointer rounded-full bg-red-500/50 p-3 text-white transition-all hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95 ${
                           isClosing ? 'animate-spin' : ''
                        }`}
                     >
                        <IoClose size={24} />
                     </button>
                  </div>
               </div>
            </header>

            {/* SEÇÃO DE FILTROS DO MODAL */}
            <div className="flex flex-col gap-4 bg-white/50 p-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     {filtrosAtivos > 0 && (
                        <span className="rounded-full bg-pink-600 px-3 py-1 text-sm font-bold text-white">
                           {filtrosAtivos}
                        </span>
                     )}
                  </div>
                  {filtrosAtivos > 0 && (
                     <button
                        onClick={limparFiltros}
                        className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-extrabold tracking-widest text-white transition-all hover:bg-red-800 active:scale-95"
                     >
                        Limpar Filtros
                     </button>
                  )}
               </div>

               <div className="grid grid-cols-7 gap-4">
                  <div className="flex flex-col gap-1">
                     <label className="text-sm font-semibold tracking-widest text-black select-none">
                        OS:
                     </label>
                     <FiltroModalDetalhes
                        value={filtroOS}
                        onChange={setFiltroOS}
                        placeholder="Filtrar por OS"
                     />
                  </div>

                  <div className="flex flex-col gap-1">
                     <label className="text-sm font-semibold tracking-widest text-black select-none">
                        Data:
                     </label>
                     <FiltroModalDetalhes
                        value={filtroData}
                        onChange={setFiltroData}
                        placeholder="Filtrar por Data"
                     />
                  </div>

                  <div className="flex flex-col gap-1">
                     <label className="text-sm font-semibold tracking-widest text-black select-none">
                        Chamado:
                     </label>
                     <FiltroModalDetalhes
                        value={filtroChamado}
                        onChange={setFiltroChamado}
                        placeholder="Filtrar por Chamado"
                     />
                  </div>

                  {agruparPor !== 'cliente' && (
                     <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold tracking-widest text-black select-none">
                           Cliente:
                        </label>
                        <FiltroModalDetalhes
                           value={filtroCliente}
                           onChange={setFiltroCliente}
                           placeholder="Filtrar por Cliente"
                        />
                     </div>
                  )}

                  {agruparPor !== 'recurso' && (
                     <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold tracking-widest text-black select-none">
                           Recurso:
                        </label>
                        <FiltroModalDetalhes
                           value={filtroRecurso}
                           onChange={setFiltroRecurso}
                           placeholder="Filtrar por Recurso"
                        />
                     </div>
                  )}

                  <div className="flex flex-col gap-1">
                     <label className="text-sm font-semibold tracking-widest text-black select-none">
                        Faturado:
                     </label>
                     <SelectSimNaoTabelaOS
                        value={filtroFaturado}
                        onChange={setFiltroFaturado}
                     />
                  </div>

                  <div className="flex flex-col gap-1">
                     <label className="text-sm font-semibold tracking-widest text-black select-none">
                        Validado:
                     </label>
                     <SelectSimNaoTabelaOS
                        value={filtroValidado}
                        onChange={setFiltroValidado}
                     />
                  </div>
               </div>
            </div>

            <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
               {detalhesFiltrados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-4 bg-slate-900 py-32 text-center">
                     <FaFilterCircleXmark className="text-red-600" size={80} />
                     <h3 className="text-2xl font-extrabold tracking-wider text-white italic select-none">
                        Nenhum registro encontrado para os filtros aplicados
                     </h3>
                  </div>
               ) : (
                  <table className="w-full">
                     <thead className="sticky top-0 z-10 bg-teal-800">
                        <tr className="bg-teal-800 py-6 font-extrabold tracking-wider text-white select-none">
                           <th className="p-3 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                              OS
                           </th>
                           <th className="p-3 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                              Data
                           </th>
                           <th className="p-3 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                              Chamado
                           </th>
                           <th className="p-3 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                              Hora Início
                           </th>
                           <th className="p-3 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                              Hora Fim
                           </th>
                           <th className="p-3 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                              Horas
                           </th>
                           {agruparPor !== 'cliente' && (
                              <th className="p-3 text-left text-base font-bold tracking-widest text-white uppercase italic select-none">
                                 Cliente
                              </th>
                           )}
                           {agruparPor !== 'recurso' && (
                              <th className="p-3 text-left text-base font-bold tracking-widest text-white uppercase italic select-none">
                                 Recurso
                              </th>
                           )}
                           <th className="p-3 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                              Faturado
                           </th>
                           <th className="p-3 text-center text-base font-bold tracking-widest text-white uppercase italic select-none">
                              Validado
                           </th>
                        </tr>
                     </thead>
                     <tbody>
                        {detalhesFiltrados.map((detalhe, idx) => (
                           <tr
                              key={idx}
                              className="border-b border-white/10 transition-all hover:bg-white/10"
                           >
                              <td className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none">
                                 {formatarCodNumber(detalhe.codOs)}
                              </td>
                              <td className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none">
                                 {formatarDataParaBR(detalhe.data)}
                              </td>
                              <td className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none">
                                 {formatarCodString(detalhe.chamado)}
                              </td>
                              <td className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none">
                                 {formatarHora(detalhe.horaInicio)}
                              </td>
                              <td className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none">
                                 {formatarHora(detalhe.horaFim)}
                              </td>
                              <td className="p-3 text-center text-sm font-extrabold tracking-widest text-amber-500 select-none">
                                 {formatarHorasTotaisHorasDecimais(
                                    detalhe.horas
                                 )}
                              </td>
                              {agruparPor !== 'cliente' && (
                                 <td className="p-3 text-sm font-semibold tracking-widest text-white select-none">
                                    {detalhe.cliente || '----------'}
                                 </td>
                              )}
                              {agruparPor !== 'recurso' && (
                                 <td className="p-3 text-sm font-semibold tracking-widest text-white select-none">
                                    {corrigirTextoCorrompido(
                                       detalhe.recurso ?? ''
                                    ) || '----------'}
                                 </td>
                              )}
                              <td className="p-3 text-center">
                                 <span
                                    className={`inline-block rounded px-3 py-1.5 text-sm font-extrabold tracking-widest select-none ${
                                       detalhe.faturado === 'SIM'
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-red-600 text-white'
                                    }`}
                                 >
                                    {detalhe.faturado}
                                 </span>
                              </td>
                              <td className="p-3 text-center">
                                 <span
                                    className={`inline-block rounded px-3 py-1.5 text-sm font-extrabold tracking-widest select-none ${
                                       detalhe.validado === 'SIM'
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-red-600 text-white'
                                    }`}
                                 >
                                    {detalhe.validado}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               )}
            </div>
         </div>
      </div>
   );
};
