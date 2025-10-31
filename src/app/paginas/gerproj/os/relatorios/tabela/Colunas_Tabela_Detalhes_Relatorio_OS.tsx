// IMPORTS
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as TooltipRadix from '@radix-ui/react-tooltip';
// FORMATTERS
import {
   formatarHora,
   formatarCodNumber,
   formatarHorasTotaisHorasDecimais,
   formatarCodString,
   formatarDataParaBR,
   formatarDataHoraParaBR,
   obterSufixoHoras,
} from '../../../../../../utils/formatters';

// HELPERS
import { corrigirTextoCorrompido } from '../../../../../../lib/corrigirTextoCorrompido';

// ================================================================================
// CONSTANTES
// ================================================================================
const EMPTY_VALUE = 'n/a';

const STATUS_CONFIG = {
   SIM: {
      bg: 'bg-gradient-to-br from-blue-600 to-blue-700',
      text: 'text-white',
   },
   NAO: {
      bg: 'bg-gradient-to-br from-red-600 to-red-700',
      text: 'text-white',
   },
} as const;

// ================================================================================
// INTERFACES
// ================================================================================
interface DetalheOS {
   codOs: number;
   codTarefa?: number;
   tarefa?: string;
   codProjeto?: number;
   projeto?: string;
   horaInicio: string;
   horaFim: string;
   horas: number;
   data: string;
   dataInclusao: string;
   chamado: string;
   faturado: string;
   validado: string;
   competencia: string;
   cliente?: string;
   codCliente?: number;
   recurso?: string;
   codRecurso?: number;
}

interface ColunaDefinition {
   id: string;
   header: string;
   accessor: keyof DetalheOS;
   render: (value: any, row: DetalheOS) => React.ReactNode;
   showWhen?: (agruparPor: string) => boolean;
   align?: 'left' | 'center' | 'right';
}

// ================================================================================
// COMPONENTES AUXILIARES DE CÉLULAS
// ================================================================================

/**
 * Célula de número formatado
 */
const CellNumber = ({ value }: { value: number }) => {
   const ValueFormatted = useMemo(() => formatarCodNumber(value), [value]);

   return (
      <td className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none group-hover:font-extrabold group-hover:text-black">
         {ValueFormatted}
      </td>
   );
};

/**
 * Célula de data formatada
 */
const CellDate = ({ value }: { value: string }) => {
   const formatted = useMemo(() => formatarDataParaBR(value), [value]);

   return (
      <td className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none group-hover:font-extrabold group-hover:text-black">
         {formatted}
      </td>
   );
};

/**
 * Célula de data formatada
 */
const CellDateTime = ({
   value,
   includeTime = true,
}: {
   value: string;
   includeTime?: boolean;
}) => {
   const ValueFormatted = useMemo(() => {
      if (!value) return null;
      return includeTime
         ? formatarDataHoraParaBR(value)
         : formatarDataParaBR(value);
   }, [value, includeTime]);

   return (
      <td className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none group-hover:font-extrabold group-hover:text-black">
         {ValueFormatted}
      </td>
   );
};

/**
 * Célula de chamado formatado
 */
const CellChamado = ({ value }: { value: string }) => {
   const ValueFormatted = useMemo(() => formatarCodString(value), [value]);

   return (
      <td className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none group-hover:font-extrabold group-hover:text-black">
         {ValueFormatted || 'n/a'}
      </td>
   );
};

/**
 * Célula de hora formatada
 */
const CellHora = ({ value }: { value: string }) => {
   const ValueFormatted = useMemo(() => formatarHora(value), [value]);

   return (
      <td className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none group-hover:font-extrabold group-hover:text-black">
         {ValueFormatted}
         {obterSufixoHoras(value)}
      </td>
   );
};

/**
 * Célula de total de horas formatada
 */
const CellTotalHoras = ({ value }: { value: number }) => {
   const ValueFormatted = useMemo(
      () => formatarHorasTotaisHorasDecimais(value),
      [value]
   );

   return (
      <td className="p-3 text-center text-sm font-extrabold tracking-widest text-amber-500 select-none group-hover:font-extrabold group-hover:text-black">
         {ValueFormatted}
         {obterSufixoHoras(value)}
      </td>
   );
};

/**
 * Célula de recurso formatada
 */
const CellRecurso = ({ value }: { value?: string }) => {
   const ValueFormatted = useMemo(
      () => (value ? corrigirTextoCorrompido(value) : EMPTY_VALUE),
      [value]
   );

   return (
      <td className="p-3 text-left text-sm font-semibold tracking-widest text-white select-none group-hover:font-extrabold group-hover:text-black">
         {corrigirTextoCorrompido(
            ValueFormatted.split(' ').slice(0, 2).join(' ')
         )}
      </td>
   );
};

/**
 * Célula de texto formatada (para projeto e tarefa)
 */
const CellText = ({ value }: { value?: string }) => {
   const textRef = useRef<HTMLSpanElement>(null);
   const [showTooltip, setShowTooltip] = useState(false);

   const ValueFormatted = useMemo(
      () => (value ? corrigirTextoCorrompido(value) : EMPTY_VALUE),
      [value]
   );

   useEffect(() => {
      const checkOverflow = () => {
         if (textRef.current && value) {
            const isOverflowing =
               textRef.current.scrollWidth > textRef.current.clientWidth ||
               textRef.current.scrollHeight > textRef.current.clientHeight;
            setShowTooltip(isOverflowing);
         }
      };

      const timeoutId = setTimeout(checkOverflow, 100);
      window.addEventListener('resize', checkOverflow);

      return () => {
         clearTimeout(timeoutId);
         window.removeEventListener('resize', checkOverflow);
      };
   }, [value, ValueFormatted]);

   return (
      <td className="p-3 text-left text-sm font-semibold tracking-widest text-white select-none group-hover:font-extrabold group-hover:text-black">
         <TooltipRadix.Provider delayDuration={200}>
            <TooltipRadix.Root>
               <TooltipRadix.Trigger asChild>
                  <span
                     ref={textRef}
                     className="block w-full cursor-help truncate"
                  >
                     {ValueFormatted}
                  </span>
               </TooltipRadix.Trigger>
               <TooltipRadix.Portal>
                  <TooltipRadix.Content
                     side="top"
                     align="start"
                     className="animate-in fade-in-0 zoom-in-95 z-[70] max-w-[800px] rounded-lg border border-pink-500 bg-white px-6 py-2 text-sm font-semibold tracking-widest text-black italic shadow-sm shadow-black select-none"
                     sideOffset={10}
                  >
                     <div className="break-words">
                        {corrigirTextoCorrompido(ValueFormatted)}
                     </div>
                     <TooltipRadix.Arrow className="fill-black" />
                  </TooltipRadix.Content>
               </TooltipRadix.Portal>
            </TooltipRadix.Root>
         </TooltipRadix.Provider>
      </td>
   );
};

/**
 * Célula de status (Faturado/Validado)
 */
const CellStatus = ({ value }: { value: string }) => {
   const config = useMemo(() => {
      const valueUpper = value
         ?.toUpperCase()
         .trim() as keyof typeof STATUS_CONFIG;
      return STATUS_CONFIG[valueUpper] || STATUS_CONFIG.NAO;
   }, [value]);

   return (
      <td className="p-3 text-center">
         <span
            className={`inline-block rounded px-6 py-1.5 text-sm font-extrabold tracking-widest select-none group-hover:font-extrabold ${config.bg} ${config.text}`}
         >
            {value}
         </span>
      </td>
   );
};

/**
 * Cabeçalho de coluna
 */
const HeaderCell = ({ children }: { children: React.ReactNode }) => (
   <th className="p-6 text-center text-base font-bold tracking-widest text-white uppercase select-none">
      {children}
   </th>
);

const HeaderCellLeft = ({ children }: { children: React.ReactNode }) => (
   <th className="p-6 text-left text-base font-bold tracking-widest text-white uppercase select-none">
      {children}
   </th>
);

// ================================================================================
// DEFINIÇÃO DAS COLUNAS
// ================================================================================
export const colunasTabelaDetalhesRelatorioOS: ColunaDefinition[] = [
   {
      id: 'codOs',
      header: 'OS',
      accessor: 'codOs',
      align: 'center',
      render: (value: number) => <CellNumber value={value} />,
   },

   // {
   //    id: 'codTarefa',
   //    header: 'Cód. Tarefa',
   //    accessor: 'codTarefa',
   //    align: 'center',
   //    showWhen: (agruparPor: string) => agruparPor !== 'tarefa',
   //    render: (value?: number) => <CellNumber value={value || 0} />,
   // },

   {
      id: 'tarefa',
      header: 'Tarefa',
      accessor: 'tarefa',
      align: 'left',
      showWhen: (agruparPor: string) => agruparPor !== 'tarefa',
      render: (value: string) => <CellText value={value} />,
   },

   // {
   //    id: 'codProjeto',
   //    header: 'Cód. Projeto',
   //    accessor: 'codProjeto',
   //    align: 'center',
   //    showWhen: (agruparPor: string) => agruparPor !== 'projeto',
   //    render: (value?: number) => <CellNumber value={value || 0} />,
   // },

   // {
   //    id: 'projeto',
   //    header: 'Projeto',
   //    accessor: 'projeto',
   //    align: 'left',
   //    showWhen: (agruparPor: string) => agruparPor !== 'projeto',
   //    render: (value: string) => <CellText value={value} />,
   // },

   {
      id: 'data',
      header: 'Data',
      accessor: 'data',
      align: 'center',
      render: (value: string) => <CellDate value={value} />,
   },

   {
      id: 'horaInicio',
      header: 'Hora Início',
      accessor: 'horaInicio',
      align: 'left',
      showWhen: (agruparPor: string) => agruparPor !== 'horaInicio',
      render: (value: string) => <CellHora value={value} />,
   },

   {
      id: 'horaFim',
      header: 'Hora Fim',
      accessor: 'horaFim',
      align: 'left',
      showWhen: (agruparPor: string) => agruparPor !== 'horaFim',
      render: (value: string) => <CellHora value={value} />,
   },

   {
      id: 'horas',
      header: 'Total Horas',
      accessor: 'horas',
      align: 'center',
      render: (value: number) => <CellTotalHoras value={value} />,
   },

   {
      id: 'dataInclusao',
      header: 'Data de Inclusão',
      accessor: 'dataInclusao',
      align: 'center',
      render: (value: string) => <CellDateTime value={value} />,
   },

   {
      id: 'recurso',
      header: 'Recurso',
      accessor: 'recurso',
      align: 'left',
      showWhen: (agruparPor: string) => agruparPor !== 'recurso',
      render: (value: string) => <CellRecurso value={value} />,
   },

   {
      id: 'faturado',
      header: 'Cliente Paga',
      accessor: 'faturado',
      align: 'center',
      render: (value: string) => <CellStatus value={value} />,
   },

   {
      id: 'validado',
      header: 'Consultor Recebe',
      accessor: 'validado',
      align: 'center',
      render: (value: string) => <CellStatus value={value} />,
   },

   {
      id: 'chamado',
      header: 'Chamado',
      accessor: 'chamado',
      align: 'center',
      render: (value: string) => <CellChamado value={value} />,
   },
];

// ================================================================================
// HOOK PARA FILTRAR COLUNAS VISÍVEIS
// ================================================================================
export const useVisibleColumns = (agruparPor: string) => {
   return useMemo(() => {
      return colunasTabelaDetalhesRelatorioOS.filter(
         col => !col.showWhen || col.showWhen(agruparPor)
      );
   }, [agruparPor]);
};

// ================================================================================
// COMPONENTE DE CABEÇALHO DA TABELA
// ================================================================================
interface TableHeaderProps {
   agruparPor: string;
}

export const TableHeader = ({ agruparPor }: TableHeaderProps) => {
   const visibleColumns = useVisibleColumns(agruparPor);

   return (
      <thead className="sticky top-0 z-10">
         <tr className="bg-gradient-to-br from-teal-800 to-teal-900 py-20 font-extrabold tracking-wider text-white shadow-sm shadow-white select-none">
            {visibleColumns.map(col => {
               const HeaderComponent =
                  col.align === 'left' ? HeaderCellLeft : HeaderCell;
               return (
                  <HeaderComponent key={col.id}>{col.header}</HeaderComponent>
               );
            })}
         </tr>
      </thead>
   );
};

// ================================================================================
// COMPONENTE DE LINHA DA TABELA
// ================================================================================
interface TableRowProps {
   detalhe: DetalheOS;
   agruparPor: string;
   index: number;
}

export const TableRow = ({ detalhe, agruparPor, index }: TableRowProps) => {
   const visibleColumns = useVisibleColumns(agruparPor);

   return (
      <tr className="group border-b border-slate-600 bg-black transition-all hover:bg-teal-500">
         {visibleColumns.map(col => {
            const value = detalhe[col.accessor];
            const rendered = col.render(value, detalhe);

            // If the renderer returned a valid React element, clone it to attach the key
            if (React.isValidElement(rendered)) {
               return React.cloneElement(rendered, { key: col.id });
            }

            // For primitives or null/undefined, wrap the content in a td so table structure remains valid
            return (
               <td
                  key={col.id}
                  className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none group-hover:font-extrabold group-hover:text-black"
               >
                  {rendered ?? EMPTY_VALUE}
               </td>
            );
         })}
      </tr>
   );
};

// ================================================================================
// COMPONENTE DE LINHA VAZIA
// ================================================================================
interface EmptyRowProps {
   index: number;
   columnCount: number;
}

export const EmptyRow = ({ index, columnCount }: EmptyRowProps) => {
   return (
      <tr
         key={`empty-${index}`}
         className="border-b border-slate-600 bg-black/50"
      >
         {Array.from({ length: columnCount }).map((_, colIdx) => (
            <td key={colIdx} className="p-3 text-center">
               <span className="text-transparent select-none">-</span>
            </td>
         ))}
      </tr>
   );
};

// ================================================================================
// EXPORT DE TIPOS ÚTEIS
// ================================================================================
export type { DetalheOS, ColunaDefinition };
export { EMPTY_VALUE, STATUS_CONFIG };
