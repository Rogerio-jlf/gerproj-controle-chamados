'use client';
// IMPORTS
import { debounce } from 'lodash';
import { useState, useCallback, useMemo, useEffect } from 'react';

// COMPONENTS
import { PDFRelatorioOS } from '../../../../../../components/Button_PDF';
import { ExcelRelatorioOS } from '../../../../../../components/Button_Excel';
import { DropdownSimNao } from './Dropdown_Sim_Nao';
import {
   TableHeader,
   TableRow,
   EmptyRow,
   useVisibleColumns,
   type DetalheOS,
} from './Colunas_Modal_Detalhes_Relatorio_OS';

// FORMATTERS
import {
   formatarCodNumber,
   formatarHorasTotaisHorasDecimais,
   normalizeDate,
} from '../../../../../../utils/formatters';

// HELPERS
import { corrigirTextoCorrompido } from '../../../../../../lib/corrigirTextoCorrompido';

// ICONS
import { IoClose } from 'react-icons/io5';
import { HiDocumentReport } from 'react-icons/hi';
import { FaFilter, FaEraser, FaExclamationTriangle } from 'react-icons/fa';

// ================================================================================
// CONSTANTES
// ================================================================================
const ANIMATION_DURATION = 100;
const MODAL_MAX_HEIGHT = 'calc(100vh - 452px)';

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
// COMPONENTE FILTRO MODAL
// ================================================================================
const FiltroModalDetalhes = ({
   value,
   onChange,
   maxLength,
   allowedChars,
}: {
   value: string;
   onChange: (value: string) => void;
   placeholder: string;
   maxLength?: number;
   allowedChars?: 'numbers' | 'date' | 'all';
}) => {
   const [localValue, setLocalValue] = useState(value);

   useEffect(() => {
      setLocalValue(value);
   }, [value]);

   const debouncedOnChange = useMemo(
      () => debounce((val: string) => onChange(val), 500),
      [onChange]
   );

   useEffect(() => {
      return () => {
         debouncedOnChange.cancel();
      };
   }, [debouncedOnChange]);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;

      if (allowedChars === 'numbers') {
         newValue = newValue.replace(/[^0-9]/g, '');
      } else if (allowedChars === 'date') {
         newValue = newValue.replace(/[^0-9/]/g, '');
      }

      if (maxLength && newValue.length > maxLength) {
         newValue = newValue.slice(0, maxLength);
      }

      setLocalValue(newValue);
      debouncedOnChange(newValue);
   };

   const handleClear = () => {
      setLocalValue('');
      debouncedOnChange.cancel();
      onChange('');
   };

   return (
      <div className="relative w-full">
         <input
            type="text"
            value={localValue}
            onChange={handleChange}
            className="w-[300px] rounded-md bg-white px-4 py-2.5 text-base font-extrabold tracking-widest text-black italic shadow-md shadow-black transition-all select-none hover:scale-105 focus:ring-2 focus:ring-pink-500 focus:outline-none"
         />
         {localValue && (
            <button
               onClick={handleClear}
               className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-black transition-all hover:scale-150 hover:text-red-500 active:scale-95"
               type="button"
            >
               <IoClose size={24} />
            </button>
         )}
      </div>
   );
};

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

   const limparFiltros = useCallback(() => {
      setFiltroOS('');
      setFiltroData('');
      setFiltroChamado('');
      setFiltroCliente('');
      setFiltroRecurso('');
      setFiltroFaturado('');
      setFiltroValidado('');
   }, []);

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

   const detalhesFiltrados = useMemo(() => {
      return grupo.detalhes.filter(detalhe => {
         if (filtroOS && !String(detalhe.codOs).includes(filtroOS)) {
            return false;
         }

         if (filtroData) {
            const dateFormats = normalizeDate(detalhe.data);
            const match = dateFormats.some(dateFormat =>
               dateFormat.toLowerCase().includes(filtroData.toLowerCase())
            );
            if (!match) return false;
         }

         if (
            filtroChamado &&
            !String(detalhe.chamado).includes(filtroChamado)
         ) {
            return false;
         }

         if (
            filtroCliente &&
            !detalhe.cliente
               ?.toLowerCase()
               .includes(filtroCliente.toLowerCase())
         ) {
            return false;
         }

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

         if (filtroFaturado && filtroFaturado !== 'todos') {
            if (filtroFaturado === 'SIM' && detalhe.faturado !== 'SIM')
               return false;
            if (filtroFaturado === 'NAO' && detalhe.faturado !== 'NAO')
               return false;
         }

         if (filtroValidado && filtroValidado !== 'todos') {
            if (filtroValidado === 'SIM' && detalhe.validado !== 'SIM')
               return false;
            if (filtroValidado === 'NAO' && detalhe.validado !== 'NAO')
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

   const totalLinhasOriginais = grupo.detalhes.length;
   const linhasVazias = Math.max(
      0,
      totalLinhasOriginais - detalhesFiltrados.length
   );

   const visibleColumns = useVisibleColumns(agruparPor);
   const numeroColunas = visibleColumns.length;

   return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
         {/* OVERLAY */}
         <div className="absolute inset-0 bg-teal-900" />

         {/* MODAL CONTAINER */}
         <div
            className="animate-in slide-in-from-bottom-4 z-10 h-[90vh] w-[95vw] overflow-hidden rounded-2xl transition-all duration-500 ease-out"
            style={{
               animationDuration: `${ANIMATION_DURATION}ms`,
            }}
         >
            {/* HEADER DO MODAL */}
            <header className="flex flex-col gap-20 bg-white/50 p-6">
               <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center justify-center gap-6">
                     <HiDocumentReport className="text-black" size={72} />
                     <div className="flex flex-col">
                        <h1 className="text-4xl font-extrabold tracking-widest text-black uppercase select-none">
                           {grupo.nome}
                        </h1>
                        <p className="text-lg font-extrabold tracking-widest text-black italic select-none">
                           Relatório de OS's
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

                     <div className="group flex items-center justify-center">
                        <button
                           onClick={handleClose}
                           aria-label="Fechar relatório de OS"
                           className={`group cursor-pointer rounded-full bg-red-500/50 p-3 transition-all hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95 ${
                              isClosing ? 'animate-spin' : ''
                           }`}
                        >
                           <IoClose
                              className="text-white group-hover:scale-125"
                              size={24}
                           />
                        </button>
                     </div>
                  </div>
               </div>

               {/* SEÇÃO DE FILTROS DO MODAL */}
               <div className="flex w-full items-center justify-center">
                  <div className="flex items-center justify-center gap-8">
                     <div className="grid grid-cols-6 items-center justify-center gap-8">
                        <div className="flex flex-col gap-1">
                           <label className="flex items-center gap-2 text-base font-extrabold tracking-widest text-black uppercase select-none">
                              <FaFilter className="text-black" size={14} />
                              OS
                           </label>
                           <FiltroModalDetalhes
                              value={filtroOS}
                              onChange={setFiltroOS}
                              placeholder="Filtrar por OS"
                              maxLength={5}
                              allowedChars="numbers"
                           />
                        </div>

                        <div className="flex flex-col gap-1">
                           <label className="flex items-center gap-2 text-base font-extrabold tracking-widest text-black uppercase select-none">
                              <FaFilter className="text-black" size={14} />
                              Data
                           </label>
                           <FiltroModalDetalhes
                              value={filtroData}
                              onChange={setFiltroData}
                              placeholder="Filtrar por Data"
                              maxLength={10}
                              allowedChars="date"
                           />
                        </div>

                        <div className="flex flex-col gap-1">
                           <label className="flex items-center gap-2 text-base font-extrabold tracking-widest text-black uppercase select-none">
                              <FaFilter className="text-black" size={14} />
                              Chamado
                           </label>
                           <FiltroModalDetalhes
                              value={filtroChamado}
                              onChange={setFiltroChamado}
                              placeholder="Filtrar por Chamado"
                              maxLength={5}
                              allowedChars="numbers"
                           />
                        </div>

                        {agruparPor !== 'recurso' && (
                           <div className="flex flex-col gap-1">
                              <label className="flex items-center gap-2 text-base font-extrabold tracking-widest text-black uppercase select-none">
                                 <FaFilter className="text-black" size={14} />
                                 Consultor
                              </label>
                              <FiltroModalDetalhes
                                 value={filtroRecurso}
                                 onChange={setFiltroRecurso}
                                 placeholder="Filtrar por Recurso"
                              />
                           </div>
                        )}

                        <div className="flex flex-col gap-1">
                           <label className="flex items-center gap-2 text-base font-extrabold tracking-widest text-black uppercase select-none">
                              <FaFilter className="text-black" size={14} />
                              Cliente Paga
                           </label>
                           <DropdownSimNao
                              value={filtroFaturado}
                              onChange={setFiltroFaturado}
                           />
                        </div>

                        <div className="flex flex-col gap-1">
                           <label className="flex items-center gap-2 text-base font-extrabold tracking-widest text-black uppercase select-none">
                              <FaFilter className="text-black" size={14} />
                              Consultor Recebe
                           </label>
                           <DropdownSimNao
                              value={filtroValidado}
                              onChange={setFiltroValidado}
                           />
                        </div>
                     </div>

                     {/* BOTÃO LIMPAR FILTROS */}
                     <div className="group flex items-center justify-center">
                        <button
                           onClick={limparFiltros}
                           title="Limpar Filtros"
                           className="mt-7 cursor-pointer rounded-full border-none bg-gradient-to-br from-red-600 to-red-700 px-6 py-2.5 text-lg font-extrabold tracking-widest text-white shadow-md shadow-black transition-all hover:scale-110 active:scale-95"
                        >
                           <FaEraser
                              size={20}
                              className="text-white group-hover:scale-110"
                           />
                        </button>
                     </div>
                  </div>
               </div>
            </header>

            <div
               className="h-full overflow-y-auto"
               style={{ maxHeight: MODAL_MAX_HEIGHT }}
            >
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
                  <table className="w-full">
                     <TableHeader agruparPor={agruparPor} />
                     <tbody>
                        {detalhesFiltrados.map((detalhe, idx) => (
                           <TableRow
                              key={`data-${idx}`}
                              detalhe={detalhe}
                              agruparPor={agruparPor}
                              index={idx}
                           />
                        ))}

                        {Array.from({ length: linhasVazias }).map((_, idx) => (
                           <EmptyRow
                              key={`empty-${idx}`}
                              index={idx}
                              columnCount={numeroColunas}
                           />
                        ))}
                     </tbody>
                  </table>
               )}
            </div>
         </div>
      </div>
   );
};
