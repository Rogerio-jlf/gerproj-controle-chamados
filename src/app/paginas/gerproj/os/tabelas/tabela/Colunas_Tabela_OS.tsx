// IMPORTS
import { ColumnDef } from '@tanstack/react-table';
import { useMemo, useRef, useState, useEffect } from 'react';

// COMPONENTS
import { ModalEditarCellFaturadoOSValidOS } from '../modais/Modal_Editar_Cell_FaturadoOS_ValidOS';

// TYPES
import { TabelaOSProps } from '../../../../../../types/types';

// FORMATTERS
import {
   formatarDataParaBR,
   formatarDataHoraParaBR,
   formatarHora,
   formatarCodNumber,
   formatarHorasTotaisHorasDecimais,
} from '../../../../../../utils/formatters';

// HELPERS
import { corrigirTextoCorrompido } from '../../../../../../lib/corrigirTextoCorrompido';

// ICONS
import { FaEye } from 'react-icons/fa';

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
         : 'justify-start pl-4 text-left';

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
            {'n/a'}
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
         {formattedNumber || 'n/a'}
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
         {formattedDate || 'n/a'}
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
         {formattedTime || 'n/a'}
         {(() => {
            const n = parseFloat(String(formattedTime).replace(',', '.'));
            return isNaN(n) ? 'hs' : n > 1 ? 'hs' : 'h';
         })()}
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
         {formattedHours || 'n/a'}
         {(() => {
            const n = parseFloat(String(formattedHours).replace(',', '.'));
            return isNaN(n) ? 'hs' : n > 1 ? 'hs' : 'h';
         })()}
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
   const valueUpper = value?.toUpperCase().trim();

   return (
      <div
         className="flex items-center justify-center p-2 text-center font-bold"
         title={valueUpper || 'n/a'}
      >
         {valueUpper || 'n/a'}
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
   const valueUpper = value?.toUpperCase().trim();

   return (
      <div
         className="flex items-center justify-center p-2 text-center font-bold"
         title={valueUpper || 'n/a'}
      >
         {valueUpper || 'n/a'}
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
            <button
               onClick={() => onVisualizarOS(codOs)}
               title="Visualizar detalhes da OS"
               className="inline-flex cursor-pointer items-center justify-center text-white transition-all hover:scale-150 active:scale-95"
            >
               <FaEye className="text-white" size={32} />
            </button>
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
         header: () => <HeaderCenter>OS</HeaderCenter>,
         cell: ({ getValue }) => <CellNumber value={getValue() as number} />,
      },

      // Tarefa completa
      {
         accessorKey: 'CODTRF_OS',
         header: () => <HeaderCenter>TAREFA</HeaderCenter>,
         cell: ({ getValue }) => <CellNumber value={getValue() as number} />,
      },

      // Chamado
      {
         accessorKey: 'CHAMADO_OS',
         header: () => <HeaderCenter>CHAMADO</HeaderCenter>,
         cell: ({ getValue }) => <CellNumber value={getValue() as number} />,
      },

      // Data Início
      {
         accessorKey: 'DTINI_OS',
         header: () => <HeaderCenter>DT. INÍCIO</HeaderCenter>,
         cell: ({ getValue }) => <CellDate value={getValue() as string} />,
      },

      // Hora Início
      {
         accessorKey: 'HRINI_OS',
         header: () => <HeaderCenter>HR. INÍCIO</HeaderCenter>,
         cell: ({ getValue }) => <CellTime value={getValue() as string} />,
      },

      // Hora Fim
      {
         accessorKey: 'HRFIM_OS',
         header: () => <HeaderCenter>HR. FINAL</HeaderCenter>,
         cell: ({ getValue }) => <CellTime value={getValue() as string} />,
      },

      // Total Horas
      {
         accessorKey: 'QTD_HR_OS',
         header: () => <HeaderCenter>TOTAL HR's</HeaderCenter>,
         cell: ({ getValue }) => (
            <CellTotalHours value={getValue() as number} />
         ),
      },

      // Data Apontamento
      {
         accessorKey: 'DTINC_OS',
         header: () => <HeaderCenter>DT. APONTAMENTO</HeaderCenter>,
         cell: ({ getValue }) => (
            <CellDate value={getValue() as string} includeTime />
         ),
      },

      // Consultor
      {
         accessorKey: 'NOME_RECURSO',
         header: () => <HeaderCenter>CONSULTOR</HeaderCenter>,
         cell: ({ getValue }) => {
            const value = getValue() as string;
            if (!value) return null;

            return <CellText value={value} maxWords={2} applyCorrection />;
         },
      },

      // Consultor Recebe (Valid)
      {
         accessorKey: 'VALID_OS',
         header: () => <HeaderCenter>CONSULTOR RECEBE</HeaderCenter>,
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
         header: () => <HeaderCenter>CLIENTE PAGA</HeaderCenter>,
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
         header: () => <HeaderCenter>AÇÕES</HeaderCenter>,
         cell: ({ row }) => (
            <CellAcoes
               codOs={row.original.COD_OS}
               onVisualizarOS={props?.onVisualizarOS}
            />
         ),
      },
   ];
};
