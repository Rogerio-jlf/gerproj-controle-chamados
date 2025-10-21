import { ColumnDef } from '@tanstack/react-table';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

// COMPONENTS
import { TabelaTarefaProps } from '../../../../types/types';

// FORMATTERS
import {
   formatarCodNumber,
   formatarDataParaBR,
   formatarHorasTotaisHorasDecimais,
} from '../../../../utils/formatters';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
import { FaEye } from 'react-icons/fa';

// ================================================================================
// CONSTANTES
// ================================================================================
const STATUS_TAREFA_CONFIG = {
   0: {
      label: 'PENDENTE',
      bgColor: 'bg-yellow-500',
      textColor: 'text-black',
   },
   1: {
      label: 'EM ANDAMENTO',
      bgColor: 'bg-blue-600',
      textColor: 'text-white',
   },
   2: {
      label: 'CONCLUÍDO',
      bgColor: 'bg-green-600',
      textColor: 'text-white',
   },
   3: {
      label: 'CANCELADO',
      bgColor: 'bg-red-600',
      textColor: 'text-white',
   },
   4: {
      label: 'FINALIZADO',
      bgColor: 'bg-purple-600',
      textColor: 'text-white',
   },
   DEFAULT: {
      label: 'N/A',
      bgColor: 'bg-gray-400',
      textColor: 'text-white',
   },
} as const;

const FATURA_TAREFA_CONFIG = {
   SIM: {
      label: 'SIM',
      bgColor: 'bg-blue-600',
      textColor: 'text-white',
   },
   NAO: {
      label: 'NÃO',
      bgColor: 'bg-red-600',
      textColor: 'text-white',
   },
   DEFAULT: {
      label: 'N/A',
      bgColor: 'bg-gray-400',
      textColor: 'text-white',
   },
} as const;

const EMPTY_VALUE = '---';

// ================================================================================
// INTERFACES
// ================================================================================
interface ColunasProps {
   handleUpdateField?: (
      codTarefa: number,
      field: string,
      value: any
   ) => Promise<void>;
   onVisualizarTarefa?: (codTarefa: number) => void;
}

// ================================================================================
// COMPONENTES AUXILIARES REUTILIZÁVEIS
// ================================================================================

/**
 * Componente genérico para células de texto COM TOOLTIP CONDICIONAL
 */
interface CellTextProps {
   value: string | null | undefined;
   maxWords?: number;
   align?: 'left' | 'center';
}

const CellText = ({ value, maxWords, align = 'left' }: CellTextProps) => {
   const textRef = useRef<HTMLSpanElement>(null);
   const [showTooltip, setShowTooltip] = useState(false);
   const isEmpty = !value || value.trim() === '';

   const processedValue = useMemo(() => {
      if (isEmpty) return null;

      if (maxWords && maxWords > 0) {
         return value.split(' ').slice(0, maxWords).join(' ');
      }

      return value;
   }, [value, maxWords, isEmpty]);

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
         <Tooltip.Provider delayDuration={200}>
            <Tooltip.Root>
               <Tooltip.Trigger asChild>
                  <span
                     ref={textRef}
                     className="block w-full cursor-help truncate"
                  >
                     {corrigirTextoCorrompido(processedValue ?? '')}
                  </span>
               </Tooltip.Trigger>
               <Tooltip.Portal>
                  <Tooltip.Content
                     side="top"
                     align="start"
                     className="animate-in fade-in-0 zoom-in-95 z-[70] max-w-[800px] rounded-lg border border-pink-500 bg-white px-6 py-2 text-sm font-semibold tracking-widest text-black italic shadow-sm shadow-black select-none"
                     sideOffset={10}
                  >
                     <div className="break-words">
                        {corrigirTextoCorrompido(value)}
                     </div>
                     <Tooltip.Arrow className="fill-black" />
                  </Tooltip.Content>
               </Tooltip.Portal>
            </Tooltip.Root>
         </Tooltip.Provider>
      </div>
   );
};

/**
 * Componente para célula de número formatado
 */
interface CellNumberProps {
   value: number | null | undefined;
}

const CellNumber = ({ value }: CellNumberProps) => {
   const formattedNumber = useMemo(() => {
      if (!value && value !== 0) return null;
      return formatarCodNumber(value);
   }, [value]);

   return (
      <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
         {formattedNumber || EMPTY_VALUE}
      </div>
   );
};

/**
 * Componente para célula de data formatada
 */
interface CellDateProps {
   value: string | null | undefined;
}

const CellDate = ({ value }: CellDateProps) => {
   const formattedDate = useMemo(() => {
      if (!value) return null;
      return formatarDataParaBR(value);
   }, [value]);

   return (
      <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
         {formattedDate || EMPTY_VALUE}
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
 * Componente para célula de status da tarefa
 */
interface CellStatusTarefaProps {
   value: number | null | undefined;
}

const CellStatusTarefa = ({ value }: CellStatusTarefaProps) => {
   const status = value as keyof typeof STATUS_TAREFA_CONFIG;
   const config = STATUS_TAREFA_CONFIG[status] || STATUS_TAREFA_CONFIG.DEFAULT;

   return (
      <div
         className={`flex items-center justify-center rounded-md p-2 text-center font-bold ${config.bgColor} ${config.textColor}`}
         title={config.label}
      >
         {value !== null && value !== undefined ? value : EMPTY_VALUE}
      </div>
   );
};

/**
 * Componente para célula de fatura
 */
interface CellFaturaProps {
   value: string | null | undefined;
}

const CellFatura = ({ value }: CellFaturaProps) => {
   const valueUpper = value
      ?.toUpperCase()
      .trim() as keyof typeof FATURA_TAREFA_CONFIG;
   const config =
      FATURA_TAREFA_CONFIG[valueUpper] || FATURA_TAREFA_CONFIG.DEFAULT;

   return (
      <div
         className={`flex items-center justify-center rounded-md p-2 text-center font-bold ${config.bgColor} ${config.textColor}`}
         title={config.label}
      >
         {valueUpper || EMPTY_VALUE}
      </div>
   );
};

/**
 * Componente para célula de ações
 * NOVO COMPONENTE
 */
interface CellAcoesProps {
   codTarefa: number;
   onVisualizarTarefa?: (codTarefa: number) => void;
}

const CellAcoes = ({ codTarefa, onVisualizarTarefa }: CellAcoesProps) => {
   return (
      <div className="flex items-center justify-center">
         {onVisualizarTarefa && (
            <Tooltip.Provider>
               <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                     <button
                        onClick={() => onVisualizarTarefa(codTarefa)}
                        className="inline-flex cursor-pointer items-center justify-center text-white transition-all hover:scale-150 active:scale-95"
                     >
                        <FaEye className="text-white" size={32} />
                     </button>
                  </Tooltip.Trigger>
                  <Tooltip.Content
                     side="right"
                     align="start"
                     sideOffset={8}
                     className="border-t-8 border-cyan-500 bg-white text-sm font-extrabold tracking-widest text-black italic shadow-sm shadow-black select-none"
                  >
                     Visualizar OS
                  </Tooltip.Content>
               </Tooltip.Root>
            </Tooltip.Provider>
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
export const colunasTabelaTarefa = (
   props?: ColunasProps
): ColumnDef<TabelaTarefaProps>[] => [
   // Tarefa completa
   {
      accessorKey: 'TAREFA_COMPLETA',
      header: () => <HeaderCenter>TAREFA</HeaderCenter>,
      cell: ({ getValue }) => <CellText value={getValue() as string} />,
   },

   // Projeto completo
   {
      accessorKey: 'PROJETO_COMPLETO',
      header: () => <HeaderCenter>PROJETO</HeaderCenter>,
      cell: ({ getValue }) => <CellText value={getValue() as string} />,
   },

   // Nome do cliente
   {
      accessorKey: 'NOME_CLIENTE',
      header: () => <HeaderCenter>CLIENTE</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellText value={getValue() as string} maxWords={2} />
      ),
   },

   // Nome do recurso (Consultor)
   {
      accessorKey: 'NOME_RECURSO',
      header: () => <HeaderCenter>CONSULTOR</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellText value={getValue() as string} maxWords={2} />
      ),
   },

   // Data de solicitação
   {
      accessorKey: 'DTSOL_TAREFA',
      header: () => <HeaderCenter>SOLICITAÇÃO</HeaderCenter>,
      cell: ({ getValue }) => <CellDate value={getValue() as string} />,
   },

   // Data de aprovação
   {
      accessorKey: 'DTAPROV_TAREFA',
      header: () => <HeaderCenter>APROVAÇÃO</HeaderCenter>,
      cell: ({ getValue }) => <CellDate value={getValue() as string} />,
   },

   // Data de prevenção
   {
      accessorKey: 'DTPREVENT_TAREFA',
      header: () => <HeaderCenter>PREVISÃO ENTREGA</HeaderCenter>,
      cell: ({ getValue }) => <CellDate value={getValue() as string} />,
   },

   // Horas estimadas
   {
      accessorKey: 'HREST_TAREFA',
      header: () => <HeaderCenter>QTD. HR's. ESTIMADAS</HeaderCenter>,
      cell: ({ getValue }) => <CellHours value={getValue() as number} />,
   },

   // Horas gastas
   {
      accessorKey: 'QTD_HRS_GASTAS',
      header: () => <HeaderCenter>QTD. HR's. GASTAS</HeaderCenter>,
      cell: ({ getValue }) => <CellHours value={getValue() as number} />,
   },

   // Tipo da tarefa
   {
      accessorKey: 'TIPO_TAREFA_COMPLETO',
      header: () => <HeaderCenter>Tipo Tarefa</HeaderCenter>,
      cell: ({ getValue }) => <CellText value={getValue() as string} />,
   },

   // AÇÕES - NOVA COLUNA
   {
      id: 'acoes',
      header: () => <HeaderCenter>ações</HeaderCenter>,
      cell: ({ row }) => (
         <CellAcoes
            codTarefa={row.original.COD_TAREFA}
            onVisualizarTarefa={props?.onVisualizarTarefa}
         />
      ),
   },
];

// ================================================================================
// EXPORT DE TIPOS ÚTEIS
// ================================================================================
export type StatusTarefaType = keyof typeof STATUS_TAREFA_CONFIG;
export type FaturaType = keyof typeof FATURA_TAREFA_CONFIG;
export { STATUS_TAREFA_CONFIG, FATURA_TAREFA_CONFIG, EMPTY_VALUE };
