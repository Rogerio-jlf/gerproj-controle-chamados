// imports
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from '../../../../components/ui/tooltip';
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';

// Components
import { TabelaOSProps } from '../../../../types/types';
import { ModalEditarCellFaturadoOSValidOS } from './modais/Modal_Editar_Cell_FaturadoOS_ValidOS';

// Formatters
import {
   formatarDataParaBR,
   formatarDataHoraParaBR,
   formatarHora,
   formatarCodNumber,
   formatarHorasTotaisHorasDecimais,
} from '../../../../utils/formatters';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';

// Icons
import { FaEye } from 'react-icons/fa';

// ================================================================================
// CONSTANTES
// ================================================================================
const FATURADO_OS_CONFIG = {
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

const VALID_OS_CONFIG = {
   SIM: {
      label: 'SIM',
      bgColor: 'bg-blue-600',
      hoverBg: 'bg-blue-700',
      textColor: 'text-white',
   },
   NAO: {
      label: 'NÃO',
      bgColor: 'bg-red-600',
      hoverBg: 'bg-red-700',
      textColor: 'text-white',
   },
   DEFAULT: {
      label: 'N/A',
      bgColor: 'bg-white/50',
      hoverBg: 'bg-gray-200',
      textColor: 'text-black',
   },
} as const;

const EMPTY_VALUE = '-----';

// ================================================================================
// INTERFACES
// ================================================================================
interface ColunasProps {
   handleUpdateField?: (
      codOs: number,
      field: string,
      value: any
   ) => Promise<void>;
   onVisualizarOS?: (codOs: number) => void; // NOVA PROP
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
   correctText?: boolean;
}

const CellText = ({
   value,
   maxWords,
   align = 'left',
   correctText = false,
}: CellTextProps) => {
   const isEmpty = !value || value.trim() === '';

   const processedValue = useMemo(() => {
      if (isEmpty) return null;

      let processedText = correctText ? corrigirTextoCorrompido(value) : value;

      // Limita a quantidade de palavras se especificado
      if (maxWords && maxWords > 0) {
         return processedText.split(' ').slice(0, maxWords).join(' ');
      }

      return processedText;
   }, [value, maxWords, isEmpty, correctText]);

   const alignClass =
      align === 'center'
         ? 'justify-center text-center'
         : 'justify-start pl-2 text-left';

   return (
      <div
         className={`flex items-center rounded-md bg-black p-2 text-white ${alignClass}`}
      >
         {isEmpty ? (
            EMPTY_VALUE
         ) : (
            <span className="block w-full truncate" title={value}>
               {processedValue}
            </span>
         )}
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
   includeTime?: boolean;
}

const CellDate = ({ value, includeTime = false }: CellDateProps) => {
   const formattedDate = useMemo(() => {
      if (!value) return null;
      return includeTime
         ? formatarDataHoraParaBR(value)
         : formatarDataParaBR(value);
   }, [value, includeTime]);

   return (
      <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
         {formattedDate || EMPTY_VALUE}
      </div>
   );
};

/**
 * Componente para célula de hora
 */
interface CellTimeProps {
   value: string | null | undefined;
}

const CellTime = ({ value }: CellTimeProps) => {
   const formattedTime = useMemo(() => {
      if (!value) return null;
      return formatarHora(value);
   }, [value]);

   return (
      <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
         {formattedTime || EMPTY_VALUE}h
      </div>
   );
};

/**
 * Componente para célula de horas totais
 */
interface CellTotalHoursProps {
   value: number | null | undefined;
}

const CellTotalHours = ({ value }: CellTotalHoursProps) => {
   const formattedHours = useMemo(() => {
      if (!value && value !== 0) return null;
      return formatarHorasTotaisHorasDecimais(value);
   }, [value]);

   return (
      <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
         {formattedHours || EMPTY_VALUE}h
      </div>
   );
};

/**
 * Componente para célula de Faturado (somente leitura)
 */
interface CellFaturadoReadOnlyProps {
   value: string | null | undefined;
}

const CellFaturadoReadOnly = ({ value }: CellFaturadoReadOnlyProps) => {
   const valueUpper = value
      ?.toUpperCase()
      .trim() as keyof typeof FATURADO_OS_CONFIG;
   const config = FATURADO_OS_CONFIG[valueUpper] || FATURADO_OS_CONFIG.DEFAULT;

   return (
      <div
         className={`flex items-center justify-center p-2 text-center font-bold ${config.bgColor} ${config.textColor}`}
         title={config.label}
      >
         {valueUpper || EMPTY_VALUE}
      </div>
   );
};

/**
 * Componente para célula de Valid (somente leitura)
 */
interface CellValidReadOnlyProps {
   value: string | null | undefined;
}

const CellValidReadOnly = ({ value }: CellValidReadOnlyProps) => {
   const valueUpper = value
      ?.toUpperCase()
      .trim() as keyof typeof VALID_OS_CONFIG;
   const config = VALID_OS_CONFIG[valueUpper] || VALID_OS_CONFIG.DEFAULT;

   return (
      <div
         className={`flex items-center justify-center p-2 text-center font-bold ${config.bgColor} ${config.textColor}`}
         title={config.label}
      >
         {valueUpper || EMPTY_VALUE}
      </div>
   );
};

/**
 * Componente para célula editável de Faturado/Valid
 */
interface CellEditableProps {
   value: string | null | undefined;
   fieldName: 'FATURADO_OS' | 'VALID_OS';
   codOs: number;
   onUpdate: (codOs: number, field: string, value: any) => Promise<void>;
}

const CellEditable = ({
   value,
   fieldName,
   codOs,
   onUpdate,
}: CellEditableProps) => {
   return (
      <ModalEditarCellFaturadoOSValidOS
         value={value?.toUpperCase() as 'SIM' | 'NAO' | null}
         fieldName={fieldName}
         codOs={codOs}
         onUpdate={onUpdate}
         disabled={false}
      />
   );
};

/**
 * Componente para célula de ações
 * NOVO COMPONENTE
 */
interface CellAcoesProps {
   codOs: number;
   onVisualizarOS?: (codOs: number) => void;
}

const CellAcoes = ({ codOs, onVisualizarOS }: CellAcoesProps) => {
   return (
      <div className="flex items-center justify-center">
         {onVisualizarOS && (
            <TooltipProvider>
               <Tooltip>
                  <TooltipTrigger asChild>
                     <button
                        onClick={() => onVisualizarOS(codOs)}
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
                     Visualizar OS
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
export const colunasTabelaOS = (
   props?: ColunasProps
): ColumnDef<TabelaOSProps>[] => {
   const handleUpdateField = props?.handleUpdateField;

   return [
      // OS
      {
         accessorKey: 'COD_OS',
         header: () => <HeaderCenter>os</HeaderCenter>,
         cell: ({ getValue }) => <CellNumber value={getValue() as number} />,
      },

      // Tarefa completa
      {
         accessorKey: 'CODTRF_OS',
         header: () => <HeaderCenter>tarefa</HeaderCenter>,
         cell: ({ getValue }) => <CellNumber value={getValue() as number} />,
      },

      // Chamado
      {
         accessorKey: 'CHAMADO_OS',
         header: () => <HeaderCenter>chamado</HeaderCenter>,
         cell: ({ getValue }) => <CellNumber value={getValue() as number} />,
      },

      // Data Início
      {
         accessorKey: 'DTINI_OS',
         header: () => <HeaderCenter>dt. início</HeaderCenter>,
         cell: ({ getValue }) => <CellDate value={getValue() as string} />,
      },

      // Hora Início
      {
         accessorKey: 'HRINI_OS',
         header: () => <HeaderCenter>hr. início</HeaderCenter>,
         cell: ({ getValue }) => <CellTime value={getValue() as string} />,
      },

      // Hora Fim
      {
         accessorKey: 'HRFIM_OS',
         header: () => <HeaderCenter>hr. final</HeaderCenter>,
         cell: ({ getValue }) => <CellTime value={getValue() as string} />,
      },

      // Total Horas
      {
         accessorKey: 'QTD_HR_OS',
         header: () => <HeaderCenter>total hr's</HeaderCenter>,
         cell: ({ getValue }) => (
            <CellTotalHours value={getValue() as number} />
         ),
      },

      // Data Apontamento
      {
         accessorKey: 'DTINC_OS',
         header: () => <HeaderCenter>dt. apontamento</HeaderCenter>,
         cell: ({ getValue }) => (
            <CellDate value={getValue() as string} includeTime />
         ),
      },

      // Consultor
      {
         accessorKey: 'NOME_RECURSO',
         header: () => <HeaderCenter>consultor</HeaderCenter>,
         cell: ({ getValue }) => {
            const value = getValue() as string;
            if (!value) return null;

            return <CellText value={value} maxWords={2} correctText />;
         },
      },

      // Consultor Recebe (Valid)
      {
         accessorKey: 'VALID_OS',
         header: () => <HeaderCenter>consultor recebe</HeaderCenter>,
         cell: ({ row, getValue }) => {
            const value = getValue() as string;

            // Se não tem função de update, renderiza somente leitura
            if (!handleUpdateField) {
               return <CellValidReadOnly value={value} />;
            }

            // Se tem função de update, renderiza editável
            return (
               <CellEditable
                  value={value}
                  fieldName="VALID_OS"
                  codOs={row.original.COD_OS}
                  onUpdate={handleUpdateField}
               />
            );
         },
      },

      // Cliente Paga (Faturado)
      {
         accessorKey: 'FATURADO_OS',
         header: () => <HeaderCenter>cliente paga</HeaderCenter>,
         cell: ({ row, getValue }) => {
            const value = getValue() as string;

            // Se não tem função de update, renderiza somente leitura
            if (!handleUpdateField) {
               return <CellFaturadoReadOnly value={value} />;
            }

            // Se tem função de update, renderiza editável
            return (
               <CellEditable
                  value={value}
                  fieldName="FATURADO_OS"
                  codOs={row.original.COD_OS}
                  onUpdate={handleUpdateField}
               />
            );
         },
      },

      // AÇÕES - NOVA COLUNA
      {
         id: 'acoes',
         header: () => <HeaderCenter>ações</HeaderCenter>,
         cell: ({ row }) => (
            <CellAcoes
               codOs={row.original.COD_OS}
               onVisualizarOS={props?.onVisualizarOS}
            />
         ),
      },
   ];
};

// ================================================================================
// EXPORT DE TIPOS ÚTEIS
// ================================================================================
export type FaturadoType = keyof typeof FATURADO_OS_CONFIG;
export type ValidType = keyof typeof VALID_OS_CONFIG;
export { FATURADO_OS_CONFIG, VALID_OS_CONFIG, EMPTY_VALUE };
