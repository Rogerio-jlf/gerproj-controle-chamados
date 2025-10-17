import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
// ================================================================================
import { TabelaOSProps } from '../../../../types/types';
import { ModalEditarCellFaturadoOSValidOS } from './Modal_Editar_Cell_FaturadoOS_ValidOS';
// ================================================================================
import {
   formatarDataParaBR,
   formatarDataHoraParaBR,
   formatarHora,
   formatarCodNumber,
   formatarHorasTotaisHorasDecimais,
} from '../../../../utils/formatters';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from '../../../../components/ui/tooltip';

// ================================================================================
// CONSTANTES
// ================================================================================
const FATURADO_CONFIG = {
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

const VALID_CONFIG = {
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
      bgColor: 'bg-white/50',
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
 * Componente para células de texto com Tooltip
 */
interface CellTextWithTooltipProps {
   value: string | null | undefined;
   maxWords?: number;
   align?: 'left' | 'center';
}

const CellTextWithTooltip = ({
   value,
   maxWords,
   align = 'left',
}: CellTextWithTooltipProps) => {
   const isEmpty = !value || value.trim() === '';

   const processedValue = useMemo(() => {
      if (isEmpty) return null;

      // Limita a quantidade de palavras se especificado
      if (maxWords && maxWords > 0) {
         return value.split(' ').slice(0, maxWords).join(' ');
      }

      return value;
   }, [value, maxWords, isEmpty]);

   const alignClass =
      align === 'center'
         ? 'justify-center text-center'
         : 'justify-start pl-2 text-left';

   // Se estiver vazio, retorna sem tooltip
   if (isEmpty) {
      return (
         <div
            className={`flex items-center rounded-md bg-black p-2 text-white ${alignClass}`}
         >
            {EMPTY_VALUE}
         </div>
      );
   }

   // Se o texto foi truncado ou limitado, mostra o tooltip
   const isTruncated = maxWords
      ? value.split(' ').length > maxWords
      : value.replace(/\s+/g, '').length > 27;

   return (
      <TooltipProvider delayDuration={300}>
         <Tooltip>
            <TooltipTrigger asChild>
               <div
                  className={`flex items-center rounded-md bg-black p-2 text-white ${alignClass} cursor-help`}
               >
                  <span className="block w-full truncate">
                     {processedValue}
                  </span>
               </div>
            </TooltipTrigger>
            {isTruncated && (
               <TooltipContent
                  side="top"
                  align="center"
                  className="max-w-lg border-none bg-slate-600 font-semibold tracking-wider break-words text-white italic shadow-sm shadow-black"
               >
                  <p className="text-sm">{value}</p>
               </TooltipContent>
            )}
         </Tooltip>
      </TooltipProvider>
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
      .trim() as keyof typeof FATURADO_CONFIG;
   const config = FATURADO_CONFIG[valueUpper] || FATURADO_CONFIG.DEFAULT;

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
   const valueUpper = value?.toUpperCase().trim() as keyof typeof VALID_CONFIG;
   const config = VALID_CONFIG[valueUpper] || VALID_CONFIG.DEFAULT;

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

      // Cliente
      {
         accessorKey: 'NOME_CLIENTE',
         header: () => <HeaderCenter>cliente</HeaderCenter>,
         cell: ({ getValue }) => (
            <CellText value={getValue() as string} maxWords={2} correctText />
         ),
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
   ];
};

// ================================================================================
// EXPORT DE TIPOS ÚTEIS
// ================================================================================
export type FaturadoType = keyof typeof FATURADO_CONFIG;
export type ValidType = keyof typeof VALID_CONFIG;
export { FATURADO_CONFIG, VALID_CONFIG, EMPTY_VALUE };
