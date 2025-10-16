import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
// ================================================================================
import { TabelaTarefaProps } from '../../../../types/types';
// ================================================================================
import {
   formatarDataParaBR,
   formatarHorasTotaisHorasDecimais,
} from '../../../../utils/formatters';

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
   DEFAULT: {
      label: 'N/A',
      bgColor: 'bg-gray-400',
      textColor: 'text-white',
   },
} as const;

const FATURA_CONFIG = {
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
}

const CellText = ({ value, maxWords, align = 'left' }: CellTextProps) => {
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
   const valueUpper = value?.toUpperCase().trim() as keyof typeof FATURA_CONFIG;
   const config = FATURA_CONFIG[valueUpper] || FATURA_CONFIG.DEFAULT;

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
 * Componente para cabeçalho centralizado
 */
const HeaderCenter = ({ children }: { children: React.ReactNode }) => (
   <div className="text-center">{children}</div>
);

// ================================================================================
// DEFINIÇÃO DAS COLUNAS
// ================================================================================
export const colunasTabelaTarefa = (): ColumnDef<TabelaTarefaProps>[] => [
   // Tarefa completa
   {
      accessorKey: 'TAREFA_COMPLETA',
      header: () => <HeaderCenter>Tarefa</HeaderCenter>,
      cell: ({ getValue }) => <CellText value={getValue() as string} />,
   },

   // Projeto completo
   {
      accessorKey: 'PROJETO_COMPLETO',
      header: () => <HeaderCenter>Projeto</HeaderCenter>,
      cell: ({ getValue }) => <CellText value={getValue() as string} />,
   },

   // Nome do recurso (Consultor)
   {
      accessorKey: 'NOME_RECURSO',
      header: () => <HeaderCenter>Consultor</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellText value={getValue() as string} maxWords={2} />
      ),
   },

   // Nome do cliente
   {
      accessorKey: 'NOME_CLIENTE',
      header: () => <HeaderCenter>Cliente</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellText value={getValue() as string} maxWords={2} />
      ),
   },

   // Data de solicitação
   {
      accessorKey: 'DTSOL_TAREFA',
      header: () => <HeaderCenter>Data Solicitação</HeaderCenter>,
      cell: ({ getValue }) => <CellDate value={getValue() as string} />,
   },

   // Data de aprovação
   {
      accessorKey: 'DTAPROV_TAREFA',
      header: () => <HeaderCenter>Data Aprovação</HeaderCenter>,
      cell: ({ getValue }) => <CellDate value={getValue() as string} />,
   },

   // Data de prevenção
   {
      accessorKey: 'DTPREVENT_TAREFA',
      header: () => <HeaderCenter>Data Prevenção</HeaderCenter>,
      cell: ({ getValue }) => <CellDate value={getValue() as string} />,
   },

   // Horas estipuladas
   {
      accessorKey: 'HREST_TAREFA',
      header: () => <HeaderCenter>Hora Estipulada</HeaderCenter>,
      cell: ({ getValue }) => <CellHours value={getValue() as number} />,
   },

   // Status da tarefa
   {
      accessorKey: 'STATUS_TAREFA',
      header: () => <HeaderCenter>Status</HeaderCenter>,
      cell: ({ getValue }) => <CellStatusTarefa value={getValue() as number} />,
   },

   // Data de inclusão
   {
      accessorKey: 'DTINC_TAREFA',
      header: () => <HeaderCenter>Data Inclusão</HeaderCenter>,
      cell: ({ getValue }) => <CellDate value={getValue() as string} />,
   },

   // Fatura tarefa
   {
      accessorKey: 'FATURA_TAREFA',
      header: () => <HeaderCenter>Fatura</HeaderCenter>,
      cell: ({ getValue }) => <CellFatura value={getValue() as string} />,
   },
];

// ================================================================================
// EXPORT DE TIPOS ÚTEIS
// ================================================================================
export type StatusTarefaType = keyof typeof STATUS_TAREFA_CONFIG;
export type FaturaType = keyof typeof FATURA_CONFIG;
export { STATUS_TAREFA_CONFIG, FATURA_CONFIG, EMPTY_VALUE };
