// IMPORTS
import React, { useMemo } from 'react';

// FORMATTERS
import {
   formatarHora,
   formatarCodNumber,
   formatarHorasTotaisHorasDecimais,
   formatarCodString,
   formatarDataParaBR,
} from '../../../../../../utils/formatters';

// HELPERS
import { corrigirTextoCorrompido } from '../../../../../../lib/corrigirTextoCorrompido';

// ================================================================================
// CONSTANTES
// ================================================================================
const EMPTY_VALUE = '----------';

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
   const formatted = useMemo(() => formatarCodNumber(value), [value]);

   return (
      <td className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none group-hover:font-extrabold group-hover:text-black">
         {formatted}
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
 * Célula de chamado formatado
 */
const CellChamado = ({ value }: { value: string }) => {
   const formatted = useMemo(() => formatarCodString(value), [value]);

   return (
      <td className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none group-hover:font-extrabold group-hover:text-black">
         {formatted || 'n/a'}
      </td>
   );
};

/**
 * Célula de hora formatada
 */
const CellHora = ({ value }: { value: string }) => {
   const formatted = useMemo(() => formatarHora(value), [value]);

   const suffix = useMemo(() => {
      const n = parseFloat(String(value).replace(',', '.'));
      return isNaN(n) ? 'hs' : n > 1 ? 'hs' : 'h';
   }, [value]);

   return (
      <td className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none group-hover:font-extrabold group-hover:text-black">
         {formatted}
         {suffix}
      </td>
   );
};

/**
 * Célula de total de horas formatada
 */
const CellTotalHoras = ({ value }: { value: number }) => {
   const formatted = useMemo(
      () => formatarHorasTotaisHorasDecimais(value),
      [value]
   );

   const suffix = useMemo(() => {
      const n = parseFloat(String(value).replace(',', '.'));
      return isNaN(n) ? 'hs' : n > 1 ? 'hs' : 'h';
   }, [value]);

   return (
      <td className="p-3 text-center text-sm font-extrabold tracking-widest text-amber-500 select-none group-hover:font-extrabold group-hover:text-black">
         {formatted}
         {suffix}
      </td>
   );
};

/**
 * Célula de cliente formatada
 */
const CellCliente = ({ value }: { value?: string }) => {
   const formatted = useMemo(
      () => (value ? corrigirTextoCorrompido(value) : EMPTY_VALUE),
      [value]
   );

   return (
      <td className="p-3 text-left text-sm font-semibold tracking-widest text-white select-none group-hover:font-extrabold group-hover:text-black">
         {formatted}
      </td>
   );
};

/**
 * Célula de recurso formatada
 */
const CellRecurso = ({ value }: { value?: string }) => {
   const formatted = useMemo(
      () => (value ? corrigirTextoCorrompido(value) : EMPTY_VALUE),
      [value]
   );

   return (
      <td className="p-3 text-left text-sm font-semibold tracking-widest text-white select-none group-hover:font-extrabold group-hover:text-black">
         {formatted}
      </td>
   );
};

/**
 * Célula de texto formatada (para projeto e tarefa)
 */
const CellText = ({ value }: { value?: string }) => {
   const formatted = useMemo(
      () => (value ? corrigirTextoCorrompido(value) : EMPTY_VALUE),
      [value]
   );

   return (
      <td className="p-3 text-left text-sm font-semibold tracking-widest text-white select-none group-hover:font-extrabold group-hover:text-black">
         {formatted}
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
   {
      id: 'data',
      header: 'Data',
      accessor: 'data',
      align: 'center',
      render: (value: string) => <CellDate value={value} />,
   },
   {
      id: 'chamado',
      header: 'Chamado',
      accessor: 'chamado',
      align: 'center',
      render: (value: string) => <CellChamado value={value} />,
   },
   // {
   //    id: 'cliente',
   //    header: 'Cliente',
   //    accessor: 'cliente',
   //    align: 'left',
   //    showWhen: (agruparPor: string) => agruparPor !== 'cliente',
   //    render: (value: string) => <CellCliente value={value} />,
   // },
   {
      id: 'recurso',
      header: 'Recurso',
      accessor: 'recurso',
      align: 'left',
      showWhen: (agruparPor: string) => agruparPor !== 'recurso',
      render: (value: string) => <CellRecurso value={value} />,
   },
   // {
   //    id: 'codProjeto',
   //    header: 'Cód. Projeto',
   //    accessor: 'codProjeto',
   //    align: 'center',
   //    showWhen: (agruparPor: string) => agruparPor !== 'projeto',
   //    render: (value?: number) => <CellNumber value={value || 0} />,
   // },
   {
      id: 'projeto',
      header: 'Projeto',
      accessor: 'projeto',
      align: 'left',
      showWhen: (agruparPor: string) => agruparPor !== 'projeto',
      render: (value: string) => <CellText value={value} />,
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
   {
      id: 'horas',
      header: 'Total Horas',
      accessor: 'horas',
      align: 'center',
      render: (value: number) => <CellTotalHoras value={value} />,
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
