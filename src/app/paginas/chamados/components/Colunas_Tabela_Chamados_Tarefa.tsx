import { ColumnDef } from '@tanstack/react-table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
// ================================================================================
import { FaDownload, FaPlus } from 'react-icons/fa';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
// ================================================================================
// ================================================================================

export interface ChamadosProps {
  COD_CHAMADO: number;
  DATA_CHAMADO: string;
  STATUS_CHAMADO: string; // ← Mudou de number para string
  CODTRF_CHAMADO: number;
  COD_CLIENTE: number;
  ASSUNTO_CHAMADO: string;
  NOME_TAREFA: string;
  NOME_CLIENTE: string;
}

// Interface para as props das colunas
interface ColunasProps {
  onCriarOS?: (chamado: ChamadosProps) => void;
}

// Mapeamento de status para texto
export const getStylesStatus = (status: string | undefined) => {
  switch (status?.toUpperCase()) {
    case 'NAO FINALIZADO':
      return 'bg-yellow-600 text-white ring-1 ring-white';

    case 'EM ATENDIMENTO':
      return 'bg-blue-600 text-white ring-1 ring-white';

    case 'FINALIZADO':
      return 'bg-green-600 text-white ring-1 ring-white';

    case 'NAO INICIADO':
      return 'bg-red-600 text-white ring-1 ring-white';

    case 'STANDBY':
      return 'bg-orange-600 text-white ring-1 ring-white';

    case 'ATRIBUIDO':
      return 'bg-blue-600 text-white ring-1 ring-white';

    case 'AGUARDANDO VALIDACAO':
      return 'bg-purple-600 text-white ring-1 ring-white';

    default:
      return 'bg-gray-600 text-white ring-1 ring-white';
  }
};
// ================================================================================

export const colunasTabela = (
  props?: ColunasProps
): ColumnDef<ChamadosProps>[] => [
  // código do chamado
  {
    accessorKey: 'COD_CHAMADO',
    header: () => <div className="text-center">Código</div>,
    cell: ({ getValue }) => (
      <div className="rounded-md bg-purple-600 p-2 text-center text-white ring-1 ring-white">
        {getValue() as string}
      </div>
    ),
  },

  // data do chamado
  {
    accessorKey: 'DATA_CHAMADO',
    header: () => <div className="text-center">Data</div>,
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

  // status do chamado
  {
    accessorKey: 'STATUS_CHAMADO',
    header: () => <div className="text-center">Status</div>,
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const bgColor = getStylesStatus(status);

      return (
        <div
          className={`rounded-md ${bgColor} p-2 text-center text-white ring-1 ring-white`}
        >
          {status || 'Desconhecido'}
        </div>
      );
    },
  },

  // assunto do chamado
  {
    accessorKey: 'ASSUNTO_CHAMADO',
    header: () => <div className="text-center">Assunto</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      const textoCorrigido = corrigirTextoCorrompido(value);

      return <div className="truncate px-2 py-1">{textoCorrigido || '-'}</div>;
    },
  },

  // nome da tarefa
  {
    accessorKey: 'NOME_TAREFA',
    header: () => <div className="text-center">Nome Tarefa</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      const textoCorrigido = corrigirTextoCorrompido(value);

      return <div className="truncate px-2 py-1">{textoCorrigido || '-'}</div>;
    },
  },

  // nome do cliente
  {
    accessorKey: 'NOME_CLIENTE',
    header: () => <div className="text-center">Cliente</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      const textoCorrigido = corrigirTextoCorrompido(value);

      return <div className="truncate px-2 py-1">{textoCorrigido || '-'}</div>;
    },
  },

  // ações
  {
    id: 'actions',
    header: () => <div className="text-center">Ações</div>,
    cell: ({ row }) => {
      const chamado = row.original;

      const handleDownload = () => {
        const blob = new Blob([JSON.stringify(chamado, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chamado_${chamado.COD_CHAMADO}.json`;
        a.click();
        URL.revokeObjectURL(url);
      };

      // FUNÇÃO PARA CRIAR OS
      const handleCriarOS = () => {
        if (props?.onCriarOS) {
          props.onCriarOS(chamado);
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

          {/* BOTÃO CRIAR OS */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleCriarOS}
                className="cursor-pointer text-emerald-600 transition-all hover:scale-110 hover:text-emerald-700"
              >
                <FaPlus size={24} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="end"
              sideOffset={8}
              className="border-t-4 border-emerald-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
            >
              Criar OS
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
];
