import { ColumnDef } from '@tanstack/react-table';
import { useRef, useState, useEffect, memo } from 'react';
import * as TooltipRadix from '@radix-ui/react-tooltip';

import { TabelaOSProps } from '../../../../../../types/types';
import {
   formatarDataParaBR,
   formatarDataHoraParaBR,
   formatarHora,
   formatarCodNumber,
   formatarHorasTotaisHorasDecimais,
   obterSufixoHoras,
} from '../../../../../../utils/formatters';
import { corrigirTextoCorrompido } from '../../../../../../lib/corrigirTextoCorrompido';
import { ModalEditarCellFaturadoOSValidOS } from '../modais/Modal_Editar_Cell_FaturadoOS_ValidOS';
import { FaEye } from 'react-icons/fa';

// ================================================================================
// CONSTANTES
// ================================================================================
const EMPTY_VALUE = 'n/a' as const;

// ================================================================================
// INTERFACES
// ================================================================================
interface ColunasProps {
   handleUpdateField?: (
      codOs: number,
      field: string,
      value: any
   ) => Promise<void>;
   onVisualizarOS?: (codOs: number) => void;
}

interface CellTextProps {
   value: string | null | undefined;
   maxWords?: number;
   align?: 'left' | 'center';
   applyCorrection?: boolean;
}

interface CellNumberProps {
   value: number | null | undefined;
}

interface CellDateProps {
   value: string | null | undefined;
   includeTime?: boolean;
}

interface CellTimeProps {
   value: string | null | undefined;
}

interface CellTotalHoursProps {
   value: number | null | undefined;
}

interface CellFaturadoReadOnlyProps {
   value: string | null | undefined;
}

interface CellValidReadOnlyProps {
   value: string | null | undefined;
}

interface CellEditableProps {
   value: string | null | undefined;
   fieldName: 'FATURADO_OS' | 'VALID_OS';
   codOs: number;
   onUpdate: (codOs: number, field: string, value: any) => Promise<void>;
}

interface CellAcoesProps {
   codOs: number;
   onVisualizarOS?: (codOs: number) => void;
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
            : 'justify-start pl-4 text-left';

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

const CellNumber = memo(({ value }: CellNumberProps) => {
   const formattedNumber =
      value !== null && value !== undefined ? formatarCodNumber(value) : null;

   return (
      <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
         {formattedNumber || EMPTY_VALUE}
      </div>
   );
});
CellNumber.displayName = 'CellNumber';
//====================

const CellDate = memo(({ value, includeTime = false }: CellDateProps) => {
   const formattedDate = value
      ? includeTime
         ? formatarDataHoraParaBR(value)
         : formatarDataParaBR(value)
      : null;

   return (
      <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
         {formattedDate || EMPTY_VALUE}
      </div>
   );
});
CellDate.displayName = 'CellDate';
//====================

const CellTime = memo(({ value }: CellTimeProps) => {
   const formattedTime = value ? formatarHora(value) : null;
   const suffix = obterSufixoHoras(formattedTime ?? EMPTY_VALUE);

   return (
      <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
         {formattedTime ? `${formattedTime}${suffix}` : EMPTY_VALUE}
      </div>
   );
});
CellTime.displayName = 'CellTime';
//====================

const CellTotalHours = memo(({ value }: CellTotalHoursProps) => {
   const formattedHours =
      value !== null && value !== undefined
         ? formatarHorasTotaisHorasDecimais(value)
         : null;
   const suffix = obterSufixoHoras(formattedHours ?? EMPTY_VALUE);

   return (
      <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
         {formattedHours ? `${formattedHours}${suffix}` : EMPTY_VALUE}
      </div>
   );
});
CellTotalHours.displayName = 'CellTotalHours';
//====================

const CellFaturadoReadOnly = memo(({ value }: CellFaturadoReadOnlyProps) => {
   const valueUpper = value?.toUpperCase().trim();

   return (
      <div
         className="flex items-center justify-center p-2 text-center font-bold"
         title={valueUpper || EMPTY_VALUE}
      >
         {valueUpper || EMPTY_VALUE}
      </div>
   );
});
CellFaturadoReadOnly.displayName = 'CellFaturadoReadOnly';
//====================

const CellValidReadOnly = memo(({ value }: CellValidReadOnlyProps) => {
   const valueUpper = value?.toUpperCase().trim();

   return (
      <div
         className="flex items-center justify-center p-2 text-center font-bold"
         title={valueUpper || EMPTY_VALUE}
      >
         {valueUpper || EMPTY_VALUE}
      </div>
   );
});
CellValidReadOnly.displayName = 'CellValidReadOnly';
//====================

const CellEditable = memo(
   ({ value, fieldName, codOs, onUpdate }: CellEditableProps) => {
      return (
         <ModalEditarCellFaturadoOSValidOS
            value={value?.toUpperCase() as 'SIM' | 'NAO' | null}
            fieldName={fieldName}
            codOs={codOs}
            onUpdate={onUpdate}
            disabled={false}
         />
      );
   }
);
CellEditable.displayName = 'CellEditable';
//====================

const CellAcoes = memo(({ codOs, onVisualizarOS }: CellAcoesProps) => {
   if (!onVisualizarOS) return null;

   return (
      <div className="flex items-center justify-center">
         <button
            onClick={() => onVisualizarOS(codOs)}
            title="Visualizar detalhes da OS"
            className="inline-flex cursor-pointer items-center justify-center text-white transition-all hover:scale-150"
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
export const colunasTabelaOS = (
   props?: ColunasProps
): ColumnDef<TabelaOSProps>[] => [
   {
      accessorKey: 'COD_OS',
      header: () => <HeaderCenter>OS</HeaderCenter>,
      cell: ({ getValue }) => <CellNumber value={getValue() as number} />,
   },
   {
      accessorKey: 'TAREFA_COMPLETA',
      header: () => <HeaderCenter>TAREFA</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellText value={getValue() as string} applyCorrection />
      ),
   },
   {
      accessorKey: 'CHAMADO_OS',
      header: () => <HeaderCenter>CHAMADO</HeaderCenter>,
      cell: ({ getValue }) => <CellNumber value={getValue() as number} />,
   },
   {
      accessorKey: 'DTINI_OS',
      header: () => <HeaderCenter>DT. INÍCIO</HeaderCenter>,
      cell: ({ getValue }) => <CellDate value={getValue() as string} />,
   },
   {
      accessorKey: 'HRINI_OS',
      header: () => <HeaderCenter>HR. INÍCIO</HeaderCenter>,
      cell: ({ getValue }) => <CellTime value={getValue() as string} />,
   },
   {
      accessorKey: 'HRFIM_OS',
      header: () => <HeaderCenter>HR. TÉRMINO</HeaderCenter>,
      cell: ({ getValue }) => <CellTime value={getValue() as string} />,
   },
   {
      accessorKey: 'QTD_HR_OS',
      header: () => <HeaderCenter>HR's GASTAS</HeaderCenter>,
      cell: ({ getValue }) => <CellTotalHours value={getValue() as number} />,
   },
   {
      accessorKey: 'DTINC_OS',
      header: () => <HeaderCenter>DT. APONTAMENTO</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellDate value={getValue() as string} includeTime />
      ),
   },
   {
      accessorKey: 'NOME_RECURSO',
      header: () => <HeaderCenter>CONSULTOR</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellText value={getValue() as string} maxWords={2} applyCorrection />
      ),
   },
   {
      accessorKey: 'VALID_OS',
      header: () => <HeaderCenter>CONSULTOR RECEBE</HeaderCenter>,
      cell: ({ row, getValue }) => {
         const value = getValue() as string;

         if (!props?.handleUpdateField) {
            return <CellValidReadOnly value={value} />;
         }

         return (
            <CellEditable
               value={value}
               fieldName="VALID_OS"
               codOs={row.original.COD_OS}
               onUpdate={props.handleUpdateField}
            />
         );
      },
   },
   {
      accessorKey: 'FATURADO_OS',
      header: () => <HeaderCenter>CLIENTE PAGA</HeaderCenter>,
      cell: ({ row, getValue }) => {
         const value = getValue() as string;

         if (!props?.handleUpdateField) {
            return <CellFaturadoReadOnly value={value} />;
         }

         return (
            <CellEditable
               value={value}
               fieldName="FATURADO_OS"
               codOs={row.original.COD_OS}
               onUpdate={props.handleUpdateField}
            />
         );
      },
   },
   {
      id: 'acoes',
      header: () => <HeaderCenter>AÇÕES</HeaderCenter>,
      cell: ({ row }) => (
         <CellAcoes
            codOs={row.original.COD_OS}
            onVisualizarOS={props?.onVisualizarOS}
         />
      ),
   },
];

// ================================================================================
// EXPORTS
// ================================================================================
export { EMPTY_VALUE };
