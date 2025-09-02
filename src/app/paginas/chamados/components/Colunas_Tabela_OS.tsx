import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
// ================================================================================
import { ColumnDef } from '@tanstack/react-table';
// ================================================================================
import { OSProps } from './Tabela_OS';
// ================================================================================
import { MdEditDocument } from 'react-icons/md';
import { RiDeleteBin5Fill } from 'react-icons/ri';
// ================================================================================
// ================================================================================

export interface AcoesOSProps {
  onEditarOS: (codOS: string) => void;
  onExcluirOS: (codOS: string) => void;
}
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

// Definição das colunas da tabela de OS
export const colunasTabelaOS = (acoes: AcoesOSProps): ColumnDef<OSProps>[] => [
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
  // =====

  // Nome do cliente
  {
    accessorKey: 'NOME_CLIENTE',
    header: () => <div className="text-center">Cliente</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <div className="text-left">{value || '-'}</div>;
    },
  },
  // =====

  // Código da tarefa
  {
    accessorKey: 'CODTRF_OS',
    header: () => <div className="text-center">CÓD. Tarefa</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <div className="text-center">{value || '-'}</div>;
    },
  },
  // =====

  // Observação da OS
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
  // =====

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
  // =====

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
  // =====

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
  // =====

  // Quantidade de horas gastas na OS
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
  // =====

  // Botões de ação
  {
    id: 'actions',
    header: () => <div className="text-center">Ações</div>,
    cell: ({ row }) => {
      const os = row.original;

      return (
        <div className="flex items-center justify-center gap-6">
          {/* Botão editar OS */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => acoes.onEditarOS(os.COD_OS)}
                className="cursor-pointer transition-all hover:scale-110"
              >
                <MdEditDocument size={32} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              align="end"
              sideOffset={8}
              className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
            >
              Editar OS
            </TooltipContent>
          </Tooltip>
          {/* ===== */}

          {/* Botão Excluir OS */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => acoes.onExcluirOS(os.COD_OS)}
                className="cursor-pointer transition-all hover:scale-110"
              >
                <RiDeleteBin5Fill size={32} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="end"
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
