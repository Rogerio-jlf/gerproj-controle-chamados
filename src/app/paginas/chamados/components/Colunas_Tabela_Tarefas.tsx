import { ColumnDef } from '@tanstack/react-table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
// ================================================================================
import { FaDownload, FaEye, FaPhoneAlt } from 'react-icons/fa';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
// ================================================================================
// ================================================================================

export interface TarefasProps {
  COD_TAREFA: number;
  NOME_TAREFA: string;
  CODREC_TAREFA: number;
  DTSOL_TAREFA: string;
  HREST_TAREFA: number;
}

// Interface para as props das colunas
interface ColunasProps {
  visualizarOSTarefa?: (codTarefa: number) => void;
  visualizarChamadosTarefa?: (codTarefa: number) => void;
}
// ================================================================================

export const colunasTabela = (
  props?: ColunasProps
): ColumnDef<TarefasProps>[] => [
  // código da tarefa
  {
    accessorKey: 'COD_TAREFA',
    header: () => <div className="text-center">CÓD. Tarefa</div>,
    cell: ({ getValue }) => (
      <div className="rounded-md bg-pink-600 p-2 text-center text-white ring-1 ring-white">
        {getValue() as string}
      </div>
    ),
  },

  // nome da tarefa
  {
    accessorKey: 'NOME_TAREFA',
    header: () => <div className="text-center">Tarefa</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      const textoCorrigido = corrigirTextoCorrompido(value);

      return <div className="truncate px-2 py-1">{textoCorrigido || '-'}</div>;
    },
  },

  // data de solicitação
  {
    accessorKey: 'DTSOL_TAREFA',
    header: () => <div className="text-center">DT. Solicitação</div>,
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
    header: () => <div className="text-center">QTD. HR's Estipuladas</div>,
    cell: ({ getValue }) => {
      const value = getValue() as number;

      return (
        <div className="rounded-md bg-blue-600 p-2 text-center text-white ring-1 ring-white">
          {value !== null && value !== undefined ? value.toFixed(2) : '-'}
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

      const handleVisualizarOS = () => {
        if (props?.visualizarOSTarefa) {
          props.visualizarOSTarefa(tarefa.COD_TAREFA);
        }
      };

      // NOVA FUNÇÃO PARA ABRIR CHAMADOS
      const handleAbrirChamados = () => {
        if (props?.visualizarChamadosTarefa) {
          props.visualizarChamadosTarefa(tarefa.COD_TAREFA);
        }
      };

      return (
        <div className="flex items-center justify-center gap-4">
          {/* Botão Download */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleDownload}
                className="cursor-pointer transition-all hover:scale-110"
              >
                <FaDownload size={24} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              align="end"
              sideOffset={8}
              className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
            >
              Download
            </TooltipContent>
          </Tooltip>

          {/* Botão Visualizar OS */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleVisualizarOS}
                className="cursor-pointer transition-all hover:scale-110"
              >
                <FaEye size={24} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="center"
              sideOffset={8}
              className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
            >
              Visualizar OS
            </TooltipContent>
          </Tooltip>

          {/* Botão visualizar chamados */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleAbrirChamados}
                className="cursor-pointer text-orange-600 transition-all hover:scale-110 hover:text-orange-700"
              >
                <FaPhoneAlt size={24} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="end"
              sideOffset={8}
              className="border-t-4 border-orange-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
            >
              Ver Chamados
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
];
