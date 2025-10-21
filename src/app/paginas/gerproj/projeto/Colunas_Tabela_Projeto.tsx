import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
// ================================================================================
import { TabelaProjetoProps } from '../../../../types/types';
// ================================================================================
import {
   formatarDataParaBR,
   formatarHorasTotaisHorasDecimais,
} from '../../../../utils/formatters';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';

// ================================================================================
// CONSTANTES
// ================================================================================
const STATUS_CONFIG = {
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

const EMPTY_VALUE = '-----';

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

   const processedValue = useMemo(() => {
      if (isEmpty) return null;

      let processed = value;

      // Limita a quantidade de palavras se especificado
      if (maxWords && maxWords > 0) {
         processed = processed.split(' ').slice(0, maxWords).join(' ');
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
 * Componente para célula de status com badge colorido
 */
interface CellStatusProps {
   value: string | null | undefined;
}

const CellStatus = ({ value }: CellStatusProps) => {
   const status = value?.toUpperCase().trim() as keyof typeof STATUS_CONFIG;
   const config = STATUS_CONFIG[status] || STATUS_CONFIG.DEFAULT;

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
   value: string | number | null | undefined;
}

const CellHours = ({ value }: CellHoursProps) => {
   const formattedValue = useMemo(() => {
      if (!value) return null;
      const dataFormatada = formatarDataParaBR(String(value));
      return formatarHorasTotaisHorasDecimais(dataFormatada);
   }, [value]);

   return (
      <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
         {formattedValue ? `${formattedValue}h` : EMPTY_VALUE}
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
export const colunasTabelaProjeto = (): ColumnDef<TabelaProjetoProps>[] => [
   // Projeto completo
   {
      accessorKey: 'PROJETO_COMPLETO',
      header: () => <HeaderCenter>Projeto</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellText value={getValue() as string} applyCorrection={true} />
      ),
   },

   // Cliente completo
   {
      accessorKey: 'NOME_CLIENTE',
      header: () => <HeaderCenter>Cliente</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellText
            value={getValue() as string}
            maxWords={2}
            applyCorrection={true}
         />
      ),
   },

   // Responsável pelo projeto
   {
      accessorKey: 'RESPCLI_PROJETO',
      header: () => <HeaderCenter>Responsável</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellText
            value={getValue() as string}
            maxWords={2}
            applyCorrection={true}
         />
      ),
   },

   // Consultor (Recurso)
   {
      accessorKey: 'NOME_RECURSO',
      header: () => <HeaderCenter>Consultor</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellText value={getValue() as string} maxWords={2} applyCorrection />
      ),
   },

   // Quantidade de Horas
   {
      accessorKey: 'QTDHORAS_PROJETO',
      header: () => <HeaderCenter>QTD. HORAS</HeaderCenter>,
      cell: ({ getValue }) => <CellHours value={getValue() as string} />,
   },

   // Quantidade de Horas
   {
      accessorKey: 'QTD_HRS_GASTAS',
      header: () => <HeaderCenter>QTD. HORAS GASTAS</HeaderCenter>,
      cell: ({ getValue }) => <CellHours value={getValue() as string} />,
   },

   // Status do Projeto
   {
      accessorKey: 'STATUS_PROJETO',
      header: () => <HeaderCenter>STATUS</HeaderCenter>,
      cell: ({ getValue }) => <CellStatus value={getValue() as string} />,
   },
];

// ================================================================================
// EXPORT DE TIPOS ÚTEIS
// ================================================================================
export type StatusType = keyof typeof STATUS_CONFIG;
export { STATUS_CONFIG, EMPTY_VALUE };
