// IMPORTS
import { ColumnDef } from '@tanstack/react-table';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as TooltipRadix from '@radix-ui/react-tooltip';

// COMPONENTS
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from '../../../../components/ui/tooltip';

// TYPES
import { TabelaProjetoProps } from '../../../../types/types';

// FORMATTERS
import { formatarHorasTotaisHorasDecimais } from '../../../../utils/formatters';

// HELPERS
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';

// ICONS
import { FaEye } from 'react-icons/fa';

// ================================================================================
// CONSTANTES
// ================================================================================
const STATUS_PROJETO_CONFIG = {
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

const EMPTY_VALUE = 'n/a';

// ================================================================================
// INTERFACES
// ================================================================================
interface ColunasProps {
   onVisualizarProjeto?: (codProjeto: number) => void;
}

// ================================================================================
// COMPONENTES AUXILIARES REUTILIZÁVEIS
// ================================================================================

/**
 * Componente genérico para células de texto
 */
interface CellTextProps {
   value: string | null | undefined;
   maxWords?: number;
   align?: 'left' | 'center';
   applyCorrection?: boolean;
}

const CellText = ({
   value,
   maxWords,
   align = 'left',
   applyCorrection = false,
}: CellTextProps) => {
   const isEmpty = !value || value.trim() === '';
   const textRef = useRef<HTMLSpanElement>(null);
   const [showTooltip, setShowTooltip] = useState(false);

   const processedValue = useMemo(() => {
      if (isEmpty) return null;

      let processed = value;

      if (maxWords && maxWords > 0) {
         return value.split(' ').slice(0, maxWords).join(' ');
      }

      // Aplica correção de texto se necessário
      if (applyCorrection) {
         processed = corrigirTextoCorrompido(processed);
      }

      return processed;
   }, [value, maxWords, applyCorrection, isEmpty]);

   const alignClass =
      align === 'center'
         ? 'justify-center text-center'
         : 'justify-start pl-2 text-left';

   useEffect(() => {
      const checkOverflow = () => {
         if (textRef.current && value) {
            const isOverflowing =
               textRef.current.scrollWidth > textRef.current.clientWidth ||
               textRef.current.scrollHeight > textRef.current.clientHeight;
            setShowTooltip(isOverflowing);
         }
      };

      // Pequeno delay para garantir que o DOM foi renderizado
      const timeoutId = setTimeout(checkOverflow, 100);

      window.addEventListener('resize', checkOverflow);

      return () => {
         clearTimeout(timeoutId);
         window.removeEventListener('resize', checkOverflow);
      };
   }, [value, processedValue]);

   if (isEmpty) {
      return (
         <div
            className={`flex items-center rounded-md bg-black p-2 text-white ${alignClass}`}
         >
            {EMPTY_VALUE}
         </div>
      );
   }

   // Se não há overflow, renderiza sem tooltip
   if (!showTooltip) {
      return (
         <div
            className={`flex items-center rounded-md bg-black p-2 text-white ${alignClass}`}
         >
            <span ref={textRef} className="block w-full truncate">
               {corrigirTextoCorrompido(processedValue ?? '')}
            </span>
         </div>
      );
   }

   // Se há overflow, renderiza com tooltip
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
                     {corrigirTextoCorrompido(processedValue ?? '')}
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
                        {corrigirTextoCorrompido(value)}
                     </div>
                     <TooltipRadix.Arrow className="fill-black" />
                  </TooltipRadix.Content>
               </TooltipRadix.Portal>
            </TooltipRadix.Root>
         </TooltipRadix.Provider>
      </div>
   );
};

/**
 * Componente para célula de status com badge colorido
 */
interface CellStatusProjetoProps {
   value: string | null | undefined;
}

const CellStatusProjeto = ({ value }: CellStatusProjetoProps) => {
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
};

/**
 * Componente para célula de horas
 */
interface CellHoursProps {
   value: number | string | null | undefined;
}

const CellHours = ({ value }: CellHoursProps) => {
   const formattedHours = useMemo(() => {
      if (!value) return null;
      return formatarHorasTotaisHorasDecimais(value);
   }, [value]);

   return (
      <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
         {formattedHours ? `${formattedHours}h` : EMPTY_VALUE}
      </div>
   );
};

/**
 * Componente para célula de ações
 * NOVO COMPONENTE
 */
interface CellAcoesProps {
   codProjeto: number;
   onVisualizarProjeto?: (codProjeto: number) => void;
}

const CellAcoes = ({ codProjeto, onVisualizarProjeto }: CellAcoesProps) => {
   return (
      <div className="flex items-center justify-center">
         {onVisualizarProjeto && (
            <TooltipProvider>
               <Tooltip>
                  <TooltipTrigger asChild>
                     <button
                        onClick={() => onVisualizarProjeto(codProjeto)}
                        className="inline-flex cursor-pointer items-center justify-center text-white transition-all hover:scale-150 active:scale-95"
                     >
                        <FaEye className="text-white" size={32} />
                     </button>
                  </TooltipTrigger>
                  <TooltipContent
                     side="right"
                     align="start"
                     sideOffset={8}
                     className="border-t-8 border-cyan-500 bg-white text-sm font-extrabold tracking-widest text-black italic shadow-sm shadow-black select-none"
                  >
                     Visualizar Projeto
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         )}
      </div>
   );
};

/**
 * Componente para cabeçalho centralizado
 */
const HeaderCenter = ({ children }: { children: React.ReactNode }) => (
   <div className="text-center">{children}</div>
);

// ================================================================================
// DEFINIÇÃO DAS COLUNAS
// ================================================================================
export const colunasTabelaProjeto = (
   props?: ColunasProps
): ColumnDef<TabelaProjetoProps>[] => [
   // PROJETO_COMPLETO
   {
      accessorKey: 'PROJETO_COMPLETO',
      header: () => <HeaderCenter>PROJETO</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellText value={getValue() as string} applyCorrection={true} />
      ),
   },

   // NOME_CLIENTE
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

   // RESPONSÁVEL PELO PROJETO
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

   // NOME_RECURSO
   {
      accessorKey: 'NOME_RECURSO',
      header: () => <HeaderCenter>CONSULTOR</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellText value={getValue() as string} maxWords={2} applyCorrection />
      ),
   },

   // QTDHORAS_PROJETO
   {
      accessorKey: 'QTDHORAS_PROJETO',
      header: () => <HeaderCenter>QTD. HR's ESTIMADAS</HeaderCenter>,
      cell: ({ getValue }) => <CellHours value={getValue() as string} />,
   },

   // QTD_HRS_GASTAS
   {
      accessorKey: 'QTD_HRS_GASTAS',
      header: () => <HeaderCenter>QTD. HR's GASTAS</HeaderCenter>,
      cell: ({ getValue }) => <CellHours value={getValue() as string} />,
   },

   // STATUS_PROJETO
   {
      accessorKey: 'STATUS_PROJETO',
      header: () => <HeaderCenter>STATUS</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellStatusProjeto value={getValue() as string} />
      ),
   },

   // AÇÕES
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
// EXPORT DE TIPOS ÚTEIS
// ================================================================================
export type StatusType = keyof typeof STATUS_PROJETO_CONFIG;
export { STATUS_PROJETO_CONFIG, EMPTY_VALUE };
