// IMPORTS
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as TooltipRadix from '@radix-ui/react-tooltip';
import Link from 'next/link';

// FORMATTERS
import {
   formatarCodNumber,
   formatarDataParaBR,
   formatarDataHoraParaBR,
   formatarHora,
   obterSufixoHoras,
   formatarHorasTotaisHorasDecimais,
} from '../../../../../../utils/formatters';

// HELPERS
import { corrigirTextoCorrompido } from '../../../../../../lib/corrigirTextoCorrompido';

// ================================================================================
// INTERFACES
// ================================================================================
export interface DetalhesChamadoColunas {
   codChamado: number;
   dataChamado: string;
   horaChamado: string;
   assuntoChamado: string | null;
   emailChamado: string | null;
   nomeRecurso: string | null;
   dtEnvioChamado: string | null;
   quantidadeHorasGastasChamado: number | null;
   statusChamado: string;
   conclusaoChamado: string | null;
   nomeClassificacao: string | null;
}

interface ColunaDefinition {
   id: string;
   header: string;
   accessor: keyof DetalhesChamadoColunas;
   render: (value: any, row: DetalhesChamadoColunas) => React.ReactNode;
   showWhen?: (agruparPor: string) => boolean;
   align?: 'left' | 'center' | 'right';
}

// ================================================================================
// CONSTANTES
// ================================================================================
const EMPTY_VALUE = 'n/a';

// ================================================================================
// HOOKS CUSTOMIZADOS
// ================================================================================
function useTextOverflow(
   value: string | null | undefined,
   processedValue: string | null
) {
   const textRef = useRef<HTMLSpanElement>(null);
   const [showTooltip, setShowTooltip] = useState(false);

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
   }, [value, processedValue]);

   return { textRef, showTooltip };
}

// ================================================================================
// COMPONENTES AUXILIARES
// ================================================================================
const TooltipContentCustom = ({ content }: { content: string }) => (
   <TooltipRadix.Content
      side="top"
      align="start"
      className="animate-in fade-in-0 zoom-in-95 z-[70] max-w-[800px] rounded-lg border border-pink-500 bg-white px-6 py-2 text-sm font-semibold tracking-widest text-black italic shadow-sm shadow-black select-none"
      sideOffset={10}
   >
      <div className="break-words">{corrigirTextoCorrompido(content)}</div>
      <TooltipRadix.Arrow className="fill-black" />
   </TooltipRadix.Content>
);

// ================================================================================
// COMPONENTES AUXILIARES DE CÉLULAS
// ================================================================================
const getStylesStatus = (status: string | undefined) => {
   switch (status?.toUpperCase()) {
      case 'NAO FINALIZADO':
         return 'bg-red-500 text-black italic';

      case 'EM ATENDIMENTO':
         return 'bg-blue-500 text-white italic';

      case 'FINALIZADO':
         return 'bg-green-500 text-black italic';

      case 'NAO INICIADO':
         return 'bg-yellow-500 text-black italic';

      case 'STANDBY':
         return 'bg-orange-500 text-black';

      case 'ATRIBUIDO':
         return 'bg-teal-500 text-black italic';

      case 'AGUARDANDO VALIDACAO':
         return 'bg-purple-500 text-white italic';

      default:
         return 'bg-gray-500 text-black italic';
   }
};
// ====================

/**
 * Célula de número formatado
 */
const CellNumber = ({ value }: { value: number | null }) => {
   const ValueFormatted = useMemo(
      () => (value !== null ? formatarCodNumber(value) : EMPTY_VALUE),
      [value]
   );

   return (
      <td className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none group-hover:font-extrabold group-hover:text-black">
         {ValueFormatted}
      </td>
   );
};
// ====================

/**
 * Célula de data formatada
 */
const CellDate = ({ value }: { value: string | null }) => {
   const formatted = useMemo(
      () => (value ? formatarDataParaBR(value) : EMPTY_VALUE),
      [value]
   );

   return (
      <td className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none group-hover:font-extrabold group-hover:text-black">
         {formatted}
      </td>
   );
};
// ====================

/**
 * Célula de hora simples
 */
const CellHora = ({ value }: { value: string | null }) => {
   return (
      <td className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none group-hover:font-extrabold group-hover:text-black">
         {formatarHora(value || EMPTY_VALUE)}{' '}
         {obterSufixoHoras(value || EMPTY_VALUE)}
      </td>
   );
};
// ====================

/**
 * Célula de texto formatada (para assunto, classificacao, etc)
 * ✅ Refatorado seguindo padrão do CellEmail
 */
const CellText = ({ value }: { value?: string | null }) => {
   const isEmpty = !value || value.trim() === '';
   const ValueFormatted = useMemo(
      () => (isEmpty ? EMPTY_VALUE : corrigirTextoCorrompido(value)),
      [value, isEmpty]
   );

   const { textRef, showTooltip } = useTextOverflow(value, ValueFormatted);

   // Sem tooltip - renderização simples
   if (!showTooltip) {
      return (
         <td className="p-3 text-left text-sm font-semibold tracking-widest text-white select-none group-hover:font-extrabold group-hover:text-black">
            {isEmpty ? (
               EMPTY_VALUE
            ) : (
               <span ref={textRef} className="block w-full truncate">
                  {ValueFormatted}
               </span>
            )}
         </td>
      );
   }

   // Com tooltip - texto com overflow
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
                  <TooltipContentCustom content={value!} />
               </TooltipRadix.Portal>
            </TooltipRadix.Root>
         </TooltipRadix.Provider>
      </td>
   );
};
// ====================

/**
 * Célula de e-mail formatada com link mailto
 * ✅ Refatorado seguindo padrão do CellEmail do exemplo
 */
const CellEmail = ({ value }: { value?: string | null }) => {
   const isEmpty = !value || value.trim() === '';
   const ValueFormatted = useMemo(
      () => (isEmpty ? EMPTY_VALUE : corrigirTextoCorrompido(value)),
      [value, isEmpty]
   );

   const { textRef, showTooltip } = useTextOverflow(value, ValueFormatted);

   // Sem tooltip - renderização simples
   if (!showTooltip) {
      return (
         <td className="p-3 text-left text-sm font-semibold tracking-widest text-white select-none group-hover:font-extrabold group-hover:text-black">
            <Link
               href={isEmpty ? '#' : `mailto:${value}`}
               className="block w-full"
               onClick={isEmpty ? e => e.preventDefault() : undefined}
            >
               {isEmpty ? (
                  EMPTY_VALUE
               ) : (
                  <span ref={textRef} className="block w-full truncate">
                     {ValueFormatted}
                  </span>
               )}
            </Link>
         </td>
      );
   }

   // Com tooltip - email com overflow
   return (
      <td className="p-3 text-left text-sm font-semibold tracking-widest text-white select-none group-hover:font-extrabold group-hover:text-black">
         <Link href={`mailto:${value}`} className="block w-full">
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
                     <TooltipContentCustom content={value!} />
                  </TooltipRadix.Portal>
               </TooltipRadix.Root>
            </TooltipRadix.Provider>
         </Link>
      </td>
   );
};
// ====================

/**
 * Célula de recurso/cliente formatada
 */
const CellRecurso = ({ value }: { value?: string | null }) => {
   const isEmpty = !value || value.trim() === '';
   const ValueFormatted = useMemo(() => {
      if (isEmpty) return EMPTY_VALUE;
      const corrected = corrigirTextoCorrompido(value);
      return corrected.split(' ').slice(0, 2).join(' ');
   }, [value, isEmpty]);

   return (
      <td className="p-3 text-left text-sm font-semibold tracking-widest text-white select-none group-hover:font-extrabold group-hover:text-black">
         {ValueFormatted}
      </td>
   );
};
// ====================

/**
 * Célula de data e hora formatada
 */
const CellDateTime = ({ value }: { value: string | null }) => {
   const ValueFormatted = useMemo(() => {
      if (!value) return EMPTY_VALUE;

      try {
         const formatted = formatarDataHoraParaBR(value);
         return formatted;
      } catch (error) {
         console.error('❌ Erro ao formatar data:', error, value);
         return EMPTY_VALUE;
      }
   }, [value]);

   return (
      <td className="p-3 text-center text-sm font-semibold tracking-widest text-white select-none group-hover:font-extrabold group-hover:text-black">
         {ValueFormatted}
      </td>
   );
};
// ====================

/**
 * Célula de total de horas formatada
 */
const CellTotalHours = ({ value }: { value: number | null }) => {
   const ValueFormatted = useMemo(() => {
      if (value === null || isNaN(value)) return EMPTY_VALUE;
      return formatarHorasTotaisHorasDecimais(value); // ✅ CORREÇÃO: Passa o number
   }, [value]);

   return (
      <td className="p-3 text-center text-sm font-semibold tracking-widest text-amber-500 select-none group-hover:font-extrabold group-hover:text-black">
         {ValueFormatted} {obterSufixoHoras(value ?? EMPTY_VALUE)}
      </td>
   );
};
// ====================

/**
 * Célula de status com badge colorido
 */
const CellStatus = ({ value }: { value: string | null }) => {
   const statusStyles = getStylesStatus(value || undefined);

   const ValueFormatted = useMemo(
      () => (value ? corrigirTextoCorrompido(value) : EMPTY_VALUE),
      [value]
   );

   return (
      <td className="p-3 text-center text-sm font-semibold tracking-widest select-none group-hover:font-extrabold group-hover:text-black">
         <span
            className={`inline-block rounded px-6 py-1.5 text-sm font-extrabold tracking-widest select-none group-hover:font-extrabold ${statusStyles}`}
         >
            {ValueFormatted.toUpperCase()}
         </span>
      </td>
   );
};
// ====================

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
export const colunasTabelaDetalhesRelatorioChamados: ColunaDefinition[] = [
   {
      id: 'codChamado',
      header: 'Chamado',
      accessor: 'codChamado',
      align: 'center',
      render: (value: number) => <CellNumber value={value} />,
   },
   // ====================

   {
      id: 'dataChamado',
      header: 'Data',
      accessor: 'dataChamado',
      align: 'center',
      render: (value: string | null) => <CellDate value={value} />,
   },
   // ====================

   {
      id: 'horaChamado',
      header: 'Hora',
      accessor: 'horaChamado',
      align: 'center',
      render: (value: string | null) => <CellHora value={value} />,
   },
   // ====================

   {
      id: 'assuntoChamado',
      header: 'Assunto',
      accessor: 'assuntoChamado',
      align: 'left',
      render: (value: string | null) => <CellText value={value} />,
   },
   // ====================

   {
      id: 'emailChamado',
      header: 'E-mail',
      accessor: 'emailChamado',
      align: 'left',
      render: (value: string | null) => <CellEmail value={value} />,
   },
   // ====================

   {
      id: 'nomeRecurso',
      header: 'Consultor',
      accessor: 'nomeRecurso',
      align: 'left',
      showWhen: (agruparPor: string) => agruparPor !== 'recurso',
      render: (value: string | null) => <CellRecurso value={value} />,
   },
   // ====================

   {
      id: 'dtEnvioChamado',
      header: 'Data de Envio',
      accessor: 'dtEnvioChamado',
      align: 'center',
      render: (value: string | null) => <CellDateTime value={value} />,
   },
   // ====================

   {
      id: 'quantidadeHorasGastasChamado',
      header: 'Horas Gastas',
      accessor: 'quantidadeHorasGastasChamado',
      align: 'center',
      render: (value: number | null) => <CellTotalHours value={value} />,
   },
   // ====================

   {
      id: 'statusChamado',
      header: 'Status',
      accessor: 'statusChamado',
      align: 'center',
      showWhen: (agruparPor: string) => agruparPor !== 'status',
      render: (value: string | null) => <CellStatus value={value} />,
   },
   // ====================

   {
      id: 'conclusaoChamado',
      header: 'Conclusão',
      accessor: 'conclusaoChamado',
      align: 'center',
      render: (value: string | null) => <CellDateTime value={value} />,
   },
   // ====================

   {
      id: 'nomeClassificacao',
      header: 'Classificação',
      accessor: 'nomeClassificacao',
      align: 'left',
      showWhen: (agruparPor: string) => agruparPor !== 'classificacao',
      render: (value: string | null) => <CellText value={value} />,
   },
];

// ================================================================================
// HOOK PARA FILTRAR COLUNAS VISÍVEIS
// ================================================================================
export const useVisibleColumns = (agruparPor: string) => {
   return useMemo(() => {
      return colunasTabelaDetalhesRelatorioChamados.filter(
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
   detalhe: DetalhesChamadoColunas;
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

            // Se o render retornou um elemento React válido, clona com a key
            if (React.isValidElement(rendered)) {
               return React.cloneElement(rendered, { key: col.id });
            }

            // Para primitivos ou null/undefined, envolve em td
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
export type { ColunaDefinition };
export { EMPTY_VALUE };
