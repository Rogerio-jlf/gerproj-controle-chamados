import { ColumnDef } from '@tanstack/react-table';
import { FaDownload } from 'react-icons/fa';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Interface para as tarefas
export interface TarefasProps {
  COD_TAREFA: number;
  NOME_TAREFA: string;
  CODREC_TAREFA: number;
  DTSOL_TAREFA: string;
  HREST_TAREFA: number;
}

export const colunasTabela = (): ColumnDef<TarefasProps>[] => [
  // código da tarefa
  {
    accessorKey: 'COD_TAREFA',
    header: () => <div className="text-center">Código</div>,
    cell: ({ getValue }) => (
      <div className="rounded-md bg-cyan-800 p-2 text-center text-white ring-1 ring-cyan-300">
        {getValue() as string}
      </div>
    ),
  },

  // nome da tarefa
  {
    accessorKey: 'NOME_TAREFA',
    header: () => <div className="text-center">Nome da Tarefa</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="truncate px-2 py-1">{value?.trim() || '-'}</div>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="center"
            sideOffset={8}
            className="max-w-xs bg-white text-sm font-semibold tracking-wider text-gray-900 select-none"
          >
            {value?.trim() || 'Sem nome'}
          </TooltipContent>
        </Tooltip>
      );
    },
  },

  // data de solicitação
  {
    accessorKey: 'DTSOL_TAREFA',
    header: () => <div className="text-center">Data Solicitação</div>,
    cell: ({ getValue }) => {
      const dateString = getValue() as string;

      if (!dateString) {
        return <div className="text-center">-</div>;
      }

      // Se já está no formato dd/mm/yyyy
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return <div className="text-center">{dateString}</div>;
      }

      try {
        const [year, month, day] = dateString.split('T')[0].split('-');
        const formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        return <div className="text-center">{formattedDate}</div>;
      } catch {
        return <div className="text-center">{dateString}</div>;
      }
    },
  },

  // horas restantes
  {
    accessorKey: 'HREST_TAREFA',
    header: () => <div className="text-center">Horas Restantes</div>,
    cell: ({ getValue }) => {
      const value = getValue() as number;

      if (value === null || value === undefined) {
        return <div className="text-center">-</div>;
      }

      const getStyleByHours = (hours: number) => {
        if (hours <= 0) return 'bg-red-700 text-white ring-1 ring-red-300';
        if (hours <= 8)
          return 'bg-yellow-700 text-white ring-1 ring-yellow-300';
        if (hours <= 16) return 'bg-blue-700 text-white ring-1 ring-blue-300';
        return 'bg-green-700 text-white ring-1 ring-green-300';
      };

      return (
        <div className={`rounded-md p-2 text-center ${getStyleByHours(value)}`}>
          {value.toFixed(1)}h
        </div>
      );
    },
  },

  // ações
  {
    id: 'actions',
    header: () => <div className="text-center">Ações</div>,
    cell: ({ row }) => {
      const tarefa = row.original;

      const handleDownload = () => {
        const blob = new Blob([JSON.stringify(tarefa, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tarefa_${tarefa.COD_TAREFA}.json`;
        a.click();
        URL.revokeObjectURL(url);
      };

      return (
        <div className="flex items-center justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center rounded-2xl bg-amber-800 p-2 text-white ring-1 ring-amber-300"
              >
                <FaDownload size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="center"
              sideOffset={8}
              className="bg-white text-sm font-semibold tracking-wider text-gray-900 select-none"
            >
              Download
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
];
