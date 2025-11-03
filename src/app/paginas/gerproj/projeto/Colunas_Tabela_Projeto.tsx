import { ColumnDef } from '@tanstack/react-table';
import { useRef, useState, useEffect, memo } from 'react';
import * as TooltipRadix from '@radix-ui/react-tooltip';

import { TabelaProjetoProps } from '../../../../types/types';
import {
   formatarHorasTotaisHorasDecimais,
   obterSufixoHoras,
} from '../../../../utils/formatters';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from '../../../../components/ui/tooltip';
import { FaEye } from 'react-icons/fa';

// ================================================================================
// CONSTANTES
// ================================================================================
const EMPTY_VALUE = 'n/a' as const;

export const STATUS_PROJETO_CONFIG = {
   ATI: {
      label: 'ATIVO',
      bgColor: 'bg-blue-600',
      textColor: 'text-white',
   },
   ENC: {
      label: 'ENCERRADO',
      bgColor: 'bg-red-600',
      textColor: 'text-white',
   },
   DEFAULT: {
      label: 'N/A',
      bgColor: 'bg-gray-400',
      textColor: 'text-white',
   },
} as const;

// ================================================================================
// INTERFACES
// ================================================================================
interface ColunasProps {
   onVisualizarProjeto?: (codProjeto: number) => void;
}

interface CellTextProps {
   value: string | null | undefined;
   maxWords?: number;
   align?: 'left' | 'center';
   applyCorrection?: boolean;
}

interface CellHoursProps {
   value: number | string | null | undefined;
}

interface CellStatusProjetoProps {
   value: string | null | undefined;
}

interface CellAcoesProps {
   codProjeto: number;
   onVisualizarProjeto?: (codProjeto: number) => void;
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

const TooltipContentCustom = memo(({ content }: { content: string }) => (
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
TooltipContentCustom.displayName = 'TooltipContentCustom';
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
                     <TooltipContentCustom content={value!} />
                  </TooltipRadix.Portal>
               </TooltipRadix.Root>
            </TooltipRadix.Provider>
         </div>
      );
   }
);
CellText.displayName = 'CellText';
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

const CellStatusProjeto = memo(({ value }: CellStatusProjetoProps) => {
   const status = value
      ?.toUpperCase()
      .trim() as keyof typeof STATUS_PROJETO_CONFIG;
   const config =
      STATUS_PROJETO_CONFIG[status] || STATUS_PROJETO_CONFIG.DEFAULT;

   return (
      <div
         className={`flex items-center justify-center rounded-md p-2 text-center font-bold ${config.bgColor} ${config.textColor}`}
         title={config.label}
      >
         {status || EMPTY_VALUE}
      </div>
   );
});
CellStatusProjeto.displayName = 'CellStatusProjeto';
//====================

const CellAcoes = memo(
   ({ codProjeto, onVisualizarProjeto }: CellAcoesProps) => {
      if (!onVisualizarProjeto) return null;

      return (
         <div className="flex items-center justify-center">
            <TooltipProvider>
               <Tooltip>
                  <TooltipTrigger asChild>
                     <button
                        onClick={() => onVisualizarProjeto(codProjeto)}
                        title="Visualizar Projeto"
                        className="inline-flex cursor-pointer items-center justify-center text-white transition-all hover:scale-150"
                     >
                        <FaEye className="text-white" size={32} />
                     </button>
                  </TooltipTrigger>
                  <TooltipContent
                     side="right"
                     align="start"
                     sideOffset={8}
                     className="border-t-8 border-blue-600 bg-white text-sm font-extrabold tracking-widest text-black italic shadow-sm shadow-black select-none"
                  >
                     Visualizar Projeto
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         </div>
      );
   }
);
CellAcoes.displayName = 'CellAcoes';

// ================================================================================
// DEFINIÇÃO DAS COLUNAS
// ================================================================================
export const colunasTabelaProjeto = (
   props?: ColunasProps
): ColumnDef<TabelaProjetoProps>[] => [
   {
      accessorKey: 'PROJETO_COMPLETO',
      header: () => <HeaderCenter>PROJETO</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellText value={getValue() as string} applyCorrection={true} />
      ),
   },
   {
      accessorKey: 'NOME_CLIENTE',
      header: () => <HeaderCenter>CLIENTE</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellText
            value={getValue() as string}
            maxWords={2}
            applyCorrection={true}
         />
      ),
   },
   {
      accessorKey: 'RESPCLI_PROJETO',
      header: () => <HeaderCenter>RESPONSÁVEL</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellText
            value={getValue() as string}
            maxWords={2}
            applyCorrection={true}
         />
      ),
   },
   {
      accessorKey: 'NOME_RECURSO',
      header: () => <HeaderCenter>CONSULTOR</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellText
            value={getValue() as string}
            maxWords={2}
            applyCorrection={true}
         />
      ),
   },
   {
      accessorKey: 'QTDHORAS_PROJETO',
      header: () => <HeaderCenter>QTD. HR's ESTIMADAS</HeaderCenter>,
      cell: ({ getValue }) => <CellHours value={getValue() as string} />,
   },
   {
      accessorKey: 'QTD_HRS_GASTAS',
      header: () => <HeaderCenter>QTD. HR's GASTAS</HeaderCenter>,
      cell: ({ getValue }) => <CellHours value={getValue() as string} />,
   },
   {
      accessorKey: 'STATUS_PROJETO',
      header: () => <HeaderCenter>STATUS</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellStatusProjeto value={getValue() as string} />
      ),
   },
   {
      id: 'acoes',
      header: () => <HeaderCenter>AÇÕES</HeaderCenter>,
      cell: ({ row }) => (
         <CellAcoes
            codProjeto={row.original.COD_PROJETO}
            onVisualizarProjeto={props?.onVisualizarProjeto}
         />
      ),
   },
];

// ================================================================================
// EXPORTS
// ================================================================================
export type StatusProjetoType = keyof typeof STATUS_PROJETO_CONFIG;
export { EMPTY_VALUE };
