import { ColumnDef } from '@tanstack/react-table';
import { useRef, useState, useEffect, memo } from 'react';
import * as TooltipRadix from '@radix-ui/react-tooltip';

import { TabelaTarefaProps } from '../../../../types/types';
import {
   formatarDataParaBR,
   formatarHorasTotaisHorasDecimais,
   obterSufixoHoras,
} from '../../../../utils/formatters';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
import { FaEye } from 'react-icons/fa';

// ================================================================================
// CONSTANTES
// ================================================================================
const EMPTY_VALUE = 'n/a' as const;

export const STATUS_TAREFA_CONFIG = {
   0: { label: 'PENDENTE', bgColor: 'bg-yellow-500', textColor: 'text-black' },
   1: {
      label: 'EM ANDAMENTO',
      bgColor: 'bg-blue-600',
      textColor: 'text-white',
   },
   2: { label: 'CONCLUÍDO', bgColor: 'bg-green-600', textColor: 'text-white' },
   3: { label: 'CANCELADO', bgColor: 'bg-red-600', textColor: 'text-white' },
   4: {
      label: 'FINALIZADO',
      bgColor: 'bg-purple-600',
      textColor: 'text-white',
   },
   DEFAULT: { label: 'N/A', bgColor: 'bg-gray-400', textColor: 'text-white' },
} as const;

// ================================================================================
// INTERFACES
// ================================================================================
interface ColunasProps {
   onVisualizarTarefa?: (codTarefa: number) => void;
}

interface CellTextProps {
   value: string | null | undefined;
   maxWords?: number;
   align?: 'left' | 'center';
   applyCorrection?: boolean;
}

interface CellDateProps {
   value: string | null | undefined;
}

interface CellHoursProps {
   value: number | string | null | undefined;
}

interface CellAcoesProps {
   codTarefa: number;
   onVisualizarTarefa?: (codTarefa: number) => void;
}

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
// UTILITÁRIOS
// ================================================================================
function processTextValue(
   value: string | null | undefined,
   maxWords?: number,
   applyCorrection?: boolean
): string | null {
   if (!value || value.trim() === '') return null;

   let processed = value;

   if (maxWords && maxWords > 0) {
      processed = value.split(' ').slice(0, maxWords).join(' ');
   }

   if (applyCorrection) {
      processed = corrigirTextoCorrompido(processed);
   }

   return processed;
}

// ================================================================================
// COMPONENTES AUXILIARES
// ================================================================================
const HeaderCenter = memo(({ children }: { children: React.ReactNode }) => (
   <div className="text-center">{children}</div>
));
HeaderCenter.displayName = 'HeaderCenter';
//====================

const TooltipContent = memo(({ content }: { content: string }) => (
   <TooltipRadix.Content
      side="top"
      align="start"
      className="animate-in fade-in-0 zoom-in-95 z-[70] max-w-[800px] rounded-lg border border-pink-500 bg-white px-6 py-2 text-sm font-semibold tracking-widest text-black italic shadow-sm shadow-black select-none"
      sideOffset={10}
   >
      <div className="break-words">{corrigirTextoCorrompido(content)}</div>
      <TooltipRadix.Arrow className="fill-black" />
   </TooltipRadix.Content>
));
TooltipContent.displayName = 'TooltipContent';
//====================

const CellText = memo(
   ({
      value,
      maxWords,
      align = 'left',
      applyCorrection = false,
   }: CellTextProps) => {
      const isEmpty = !value || value.trim() === '';
      const processedValue = processTextValue(value, maxWords, applyCorrection);
      const { textRef, showTooltip } = useTextOverflow(value, processedValue);

      const alignClass =
         align === 'center'
            ? 'justify-center text-center'
            : 'justify-start pl-2 text-left';

      if (isEmpty) {
         return (
            <div
               className={`flex items-center rounded-md bg-black p-2 text-white ${alignClass}`}
            >
               {EMPTY_VALUE}
            </div>
         );
      }

      const content = corrigirTextoCorrompido(processedValue ?? '');

      if (!showTooltip) {
         return (
            <div
               className={`flex items-center rounded-md bg-black p-2 text-white ${alignClass}`}
            >
               <span ref={textRef} className="block w-full truncate">
                  {content}
               </span>
            </div>
         );
      }

      return (
         <div
            className={`flex items-center rounded-md bg-black p-2 text-white ${alignClass}`}
         >
            <TooltipRadix.Provider delayDuration={200}>
               <TooltipRadix.Root>
                  <TooltipRadix.Trigger asChild>
                     <span
                        ref={textRef}
                        className="block w-full cursor-help truncate"
                     >
                        {content}
                     </span>
                  </TooltipRadix.Trigger>
                  <TooltipRadix.Portal>
                     <TooltipContent content={value!} />
                  </TooltipRadix.Portal>
               </TooltipRadix.Root>
            </TooltipRadix.Provider>
         </div>
      );
   }
);
CellText.displayName = 'CellText';
//====================

const CellDate = memo(({ value }: CellDateProps) => {
   const formattedDate = value ? formatarDataParaBR(value) : null;

   return (
      <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
         {formattedDate || EMPTY_VALUE}
      </div>
   );
});
CellDate.displayName = 'CellDate';
//====================

const CellHours = memo(({ value }: CellHoursProps) => {
   const formattedHours = value
      ? formatarHorasTotaisHorasDecimais(value)
      : null;
   const suffix = obterSufixoHoras(formattedHours ?? EMPTY_VALUE);

   return (
      <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
         {formattedHours ? `${formattedHours}${suffix}` : EMPTY_VALUE}
      </div>
   );
});
CellHours.displayName = 'CellHours';
//====================

const CellAcoes = memo(({ codTarefa, onVisualizarTarefa }: CellAcoesProps) => {
   if (!onVisualizarTarefa) return null;

   return (
      <div className="flex items-center justify-center">
         <button
            onClick={() => onVisualizarTarefa(codTarefa)}
            title="Visualizar Tarefa"
            className="inline-flex cursor-pointer items-center justify-center text-white transition-all hover:scale-150 active:scale-95"
         >
            <FaEye className="text-white" size={32} />
         </button>
      </div>
   );
});
CellAcoes.displayName = 'CellAcoes';

// ================================================================================
// DEFINIÇÃO DAS COLUNAS
// ================================================================================
export const colunasTabelaTarefa = (
   props?: ColunasProps
): ColumnDef<TabelaTarefaProps>[] => [
   {
      accessorKey: 'TAREFA_COMPLETA',
      header: () => <HeaderCenter>TAREFA</HeaderCenter>,
      cell: ({ getValue }) => <CellText value={getValue() as string} />,
   },
   {
      accessorKey: 'PROJETO_COMPLETO',
      header: () => <HeaderCenter>PROJETO</HeaderCenter>,
      cell: ({ getValue }) => <CellText value={getValue() as string} />,
   },
   {
      accessorKey: 'NOME_CLIENTE',
      header: () => <HeaderCenter>CLIENTE</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellText value={getValue() as string} maxWords={2} />
      ),
   },
   {
      accessorKey: 'NOME_RECURSO',
      header: () => <HeaderCenter>CONSULTOR</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellText value={getValue() as string} maxWords={2} />
      ),
   },
   {
      accessorKey: 'DTSOL_TAREFA',
      header: () => <HeaderCenter>DT. SOLICITAÇÃO</HeaderCenter>,
      cell: ({ getValue }) => <CellDate value={getValue() as string} />,
   },
   {
      accessorKey: 'HREST_TAREFA',
      header: () => <HeaderCenter>QTD. HR's. ESTIMADAS</HeaderCenter>,
      cell: ({ getValue }) => <CellHours value={getValue() as number} />,
   },
   {
      accessorKey: 'QTD_HRS_GASTAS',
      header: () => <HeaderCenter>QTD. HR's. GASTAS</HeaderCenter>,
      cell: ({ getValue }) => <CellHours value={getValue() as number} />,
   },
   {
      accessorKey: 'TIPO_TAREFA_COMPLETO',
      header: () => <HeaderCenter>TIPO TAREFA</HeaderCenter>,
      cell: ({ getValue }) => <CellText value={getValue() as string} />,
   },
   {
      id: 'acoes',
      header: () => <HeaderCenter>AÇÕES</HeaderCenter>,
      cell: ({ row }) => (
         <CellAcoes
            codTarefa={row.original.COD_TAREFA}
            onVisualizarTarefa={props?.onVisualizarTarefa}
         />
      ),
   },
];

// ================================================================================
// EXPORTS
// ================================================================================
export type StatusTarefaType = keyof typeof STATUS_TAREFA_CONFIG;
export { EMPTY_VALUE };
