import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ColumnDef } from '@tanstack/react-table';
import { OSProps } from './Modal_OS';
// ================================================================================
import { FaHandPointUp } from 'react-icons/fa';
import { MdEditDocument } from 'react-icons/md';
import { MdDelete } from 'react-icons/md'; // Novo ícone para exclusão
// ================================================================================
// ================================================================================

export interface AcoesOSProps {
  onVisualizarApontamentos: (codOS: string) => void;
  onExcluirOS: (codOS: string) => void; // Nova função para exclusão
}
// ================================================================================

export const getStylesStatusOS = (status: string | undefined | null) => {
  if (!status || typeof status !== 'string') {
    return 'bg-gray-700 text-white ring-1 ring-gray-300';
  }

  switch (status.toUpperCase()) {
    case 'ABERTO':
      return 'bg-blue-700 text-white ring-1 ring-blue-300';
    case 'EM ANDAMENTO':
      return 'bg-yellow-700 text-white ring-1 ring-yellow-300';
    case 'FINALIZADO':
      return 'bg-green-700 text-white ring-1 ring-green-300';
    case 'CANCELADO':
      return 'bg-red-700 text-white ring-1 ring-red-300';
    case 'PAUSADO':
      return 'bg-orange-700 text-white ring-1 ring-orange-300';
    default:
      return 'bg-gray-700 text-white ring-1 ring-gray-300';
  }
};
// ================================================================================

// Função para converter horas de HHMM, decimais para HH:MM
const formatDecimalToTime = (decimalHours: number): string => {
  if (!decimalHours && decimalHours !== 0) return '-';

  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);

  // Formatação com zero à esquerda
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}`;
};
// ================================================================================

export const colunasOS = (acoes: AcoesOSProps): ColumnDef<OSProps>[] => [
  // Código da OS
  {
    accessorKey: 'COD_OS',
    header: () => <div className="text-center">CÓD. OS</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <div className="rounded-md bg-pink-600 p-2 text-center text-white ring-1 ring-white">
          {value}
        </div>
      );
    },
  },

  // Nome do cliente
  {
    accessorKey: 'NOME_CLIENTE',
    header: () => <div className="text-center">Cliente</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <div className="text-left">{value || '-'}</div>;
    },
  },

  // Código da tarefa
  {
    accessorKey: 'CODTRF_OS',
    header: () => <div className="text-center">CÓD. Tarefa</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <div className="text-center">{value || '-'}</div>;
    },
  },

  // obeservação da OS
  {
    accessorKey: 'OBS_OS',
    header: () => <div className="text-center">OBS. OS</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-left">{value || '-'}</div>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            align="end"
            sideOffset={8}
            className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
          >
            {value || '-'}
          </TooltipContent>
        </Tooltip>
      );
    },
  },

  // Data da OS
  {
    accessorKey: 'DTINI_OS',
    header: () => <div className="text-center">Data OS</div>,
    cell: ({ getValue }) => {
      const dateString = getValue() as string;

      if (!dateString) return <div className="text-center">-</div>;

      try {
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString('pt-BR');
        return (
          <div className="rounded-md bg-blue-600 p-2 text-center text-white ring-1 ring-white">
            {formattedDate}
          </div>
        );
      } catch {
        return (
          <div className="rounded-md bg-blue-600 p-2 text-center text-white ring-1 ring-white">
            {dateString}
          </div>
        );
      }
    },
  },

  // Hora de início da OS
  {
    accessorKey: 'HRINI_OS',
    header: () => <div className="text-center">HR. Início</div>,
    cell: ({ getValue }) => {
      const timeStr = getValue() as string;

      if (!timeStr) return <div className="text-center">-</div>;

      const hora = timeStr.toString().padStart(4, '0');
      const hh = hora.slice(0, 2);
      const mm = hora.slice(2, 4);

      return (
        <div className="rounded-md bg-orange-600 p-2 text-center text-white ring-1 ring-white">{`${hh}:${mm}`}</div>
      );
    },
  },

  // Hora do fim da OS
  {
    accessorKey: 'HRFIM_OS',
    header: () => <div className="text-center">HR. Fim</div>,
    cell: ({ getValue }) => {
      const timeStr = getValue() as string;

      if (!timeStr) return <div className="text-center">-</div>;

      const hora = timeStr.toString().padStart(4, '0');
      const hh = hora.slice(0, 2);
      const mm = hora.slice(2, 4);

      return (
        <div className="rounded-md bg-orange-600 p-2 text-center text-white ring-1 ring-white">{`${hh}:${mm}`}</div>
      );
    },
  },

  // Quantidade de horas gastas para a OS
  {
    accessorKey: 'QTD_HR_OS',
    header: () => <div className="text-center">QTD. Horas</div>,
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <div className="rounded-md bg-green-600 p-2 text-center text-white ring-1 ring-white">
          {formatDecimalToTime(value)}
        </div>
      );
    },
  },

  // Botão para excluir OS
  {
    id: 'actions',
    header: () => <div className="text-center">Ações</div>,
    cell: ({ row }) => {
      const os = row.original;

      return (
        <div className="flex items-center justify-center gap-2">
          {/* Botão Realizar Apontamento */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => acoes.onVisualizarApontamentos(os.COD_OS)}
                className="cursor-pointer transition-all hover:scale-110"
              >
                <MdEditDocument size={32} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              align="center"
              sideOffset={8}
              className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
            >
              Realizar Apontamento
            </TooltipContent>
          </Tooltip>

          {/* Botão Excluir */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => acoes.onExcluirOS(os.COD_OS)}
                className="cursor-pointer text-red-600 transition-all hover:scale-110 hover:text-red-800"
              >
                <MdDelete size={32} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              align="center"
              sideOffset={8}
              className="border-t-4 border-red-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
            >
              Excluir OS
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
];
