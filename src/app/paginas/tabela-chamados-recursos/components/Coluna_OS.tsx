import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ColumnDef } from '@tanstack/react-table';
import { FaClock } from 'react-icons/fa';
import { corrigirTextoCorrompido } from '@/lib/corrigirTextoCorrompido';
import { OSProps } from './Modal_OS'; // Importar a interface do modal

export interface AcoesOSProps {
  onVisualizarApontamentos: (codOS: string) => void;
}

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

export const colunasOS = (acoes: AcoesOSProps): ColumnDef<OSProps>[] => [
  // Código da OS
  {
    accessorKey: 'COD_OS',
    header: () => <div className="text-center">Código OS</div>,
    cell: ({ getValue }) => (
      <div className="rounded-md bg-cyan-800 p-2 text-center text-white ring-1 ring-cyan-300">
        #{getValue() as string}
      </div>
    ),
  },

  // Número da OS
  {
    accessorKey: 'NUM_OS',
    header: () => <div className="text-center">Número OS</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <div className="text-center font-semibold">{value || '-'}</div>;
    },
  },

  // Status da OS
  {
    accessorKey: 'STATUS_OS',
    header: () => <div className="text-center">Status</div>,
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <div className="flex justify-center">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStylesStatusOS(status)}`}
          >
            {status || '-'}
          </span>
        </div>
      );
    },
  },

  // Data de Início
  {
    accessorKey: 'DTINI_OS',
    header: () => <div className="text-center">Data Início</div>,
    cell: ({ getValue }) => {
      const dateString = getValue() as string;

      if (!dateString) return <div className="text-center">-</div>;

      try {
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString('pt-BR');
        return <div className="text-center">{formattedDate}</div>;
      } catch {
        return <div className="text-center">{dateString}</div>;
      }
    },
  },

  // Hora de Início
  {
    accessorKey: 'HRINI_OS',
    header: () => <div className="text-center">Hora Início</div>,
    cell: ({ getValue }) => {
      const timeStr = getValue() as string;

      if (!timeStr) return <div className="text-center">-</div>;

      const hora = timeStr.toString().padStart(4, '0');
      const hh = hora.slice(0, 2);
      const mm = hora.slice(2, 4);

      return <div className="text-center">{`${hh}:${mm}`}</div>;
    },
  },

  // Valor Hora
  {
    accessorKey: 'VRHR_OS',
    header: () => <div className="text-center">Valor/Hora</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;

      if (!value || isNaN(parseFloat(value))) {
        return <div className="text-center">-</div>;
      }

      const formatted = `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`;
      return (
        <div className="text-center font-semibold text-green-600">
          {formatted}
        </div>
      );
    },
  },

  // Faturado
  {
    accessorKey: 'FATURADO_OS',
    header: () => <div className="text-center">Faturado</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      const isFaturado =
        value?.toUpperCase() === 'S' || value?.toUpperCase() === 'SIM';

      return (
        <div className="flex justify-center">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              isFaturado
                ? 'bg-green-700 text-white ring-1 ring-green-300'
                : 'bg-red-700 text-white ring-1 ring-red-300'
            }`}
          >
            {isFaturado ? 'SIM' : 'NÃO'}
          </span>
        </div>
      );
    },
  },

  // Produtivo
  {
    accessorKey: 'PRODUTIVO_OS',
    header: () => <div className="text-center">Produtivo</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <div className="text-center">{value || '-'}</div>;
    },
  },

  // Responsável Cliente
  {
    accessorKey: 'RESPCLI_OS',
    header: () => <div className="text-center">Responsável Cliente</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="truncate text-center">{value || '-'}</div>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="center"
            sideOffset={8}
            className="bg-white text-sm font-semibold tracking-wider text-gray-900 select-none"
          >
            {value || 'Não informado'}
          </TooltipContent>
        </Tooltip>
      );
    },
  },

  // Código Tarefa
  {
    accessorKey: 'CODTRF_OS',
    header: () => <div className="text-center">Cód. Tarefa</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <div className="text-center">{value || '-'}</div>;
    },
  },

  // Observações OS
  {
    accessorKey: 'OBS_OS',
    header: () => <div className="text-center">Observações</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      const obs = corrigirTextoCorrompido(value) || '-';

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="max-w-[200px] truncate">
              {obs.length > 50 ? `${obs.substring(0, 50)}...` : obs}
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="center"
            sideOffset={8}
            className="max-w-xs bg-white text-sm font-semibold tracking-wider text-gray-900 select-none"
          >
            {obs}
          </TooltipContent>
        </Tooltip>
      );
    },
  },

  // Ações
  {
    id: 'actions',
    header: () => <div className="text-center">Ações</div>,
    cell: ({ row }) => {
      const os = row.original;

      return (
        <div className="flex items-center justify-center gap-3">
          {/* Botão fazer apontamento */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => acoes.onVisualizarApontamentos(os.COD_OS)}
                className="inline-flex items-center justify-center rounded-2xl bg-blue-800 p-2 text-white ring-1 ring-blue-300 transition-colors hover:bg-blue-900"
              >
                <FaClock size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="center"
              sideOffset={8}
              className="bg-white text-sm font-semibold tracking-wider text-gray-900 select-none"
            >
              Fazer Apontamento
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
];
