import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { FaEye, FaDownload } from 'react-icons/fa';
import StatusCellClicavel from './Status_Cell';
import AssuntoCellEditavel from './Assunto_Cell';
// ================================================================================

export interface ChamadosProps {
  COD_CHAMADO: number;
  DATA_CHAMADO: string;
  HORA_CHAMADO: string;
  CONCLUSAO_CHAMADO: string | null;
  STATUS_CHAMADO: string;
  DTENVIO_CHAMADO: string | null;
  COD_RECURSO: number;
  CODTRF_CHAMADO: string | null;
  COD_CLIENTE: number;
  ASSUNTO_CHAMADO: string;
  EMAIL_CHAMADO: string;
  PRIOR_CHAMADO: string;
  COD_CLASSIFICACAO: number;
  NOME_CLIENTE: string;
  NOME_RECURSO: string;
}

export interface AcoesProps {
  onVisualizarChamado: (codChamado: number) => void;
  onVisualizarOS: (codChamado: number) => void;
  onUpdateAssunto?: (codChamado: number, novoAssunto: string) => Promise<void>;
}
// ================================================================================

export const getStylesStatus = (status: string | undefined) => {
  switch (status?.toUpperCase()) {
    case 'NAO FINALIZADO':
      return 'bg-yellow-700 text-white ring-1 ring-yellow-300';

    case 'EM ATENDIMENTO':
      return 'bg-blue-700 text-white ring-1 ring-blue-300';

    case 'FINALIZADO':
      return 'bg-green-700 text-white ring-1 ring-green-300';

    case 'NAO INICIADO':
      return 'bg-red-700 text-white ring-1 ring-red-300';

    case 'STANDBY':
      return 'bg-orange-700 text-white ring-1 ring-orange-300';

    case 'ATRIBUIDO':
      return 'bg-blue-700 text-white ring-1 ring-blue-300';

    case 'AGUARDANDO VALIDACAO':
      return 'bg-purple-700 text-white ring-1 ring-purple-300';

    default:
      return 'bg-gray-700 text-white ring-1 ring-gray-300';
  }
};
// ================================================================================

export const colunasTabela = (
  acoes: AcoesProps
): ColumnDef<ChamadosProps>[] => [
  // número do chamado
  {
    accessorKey: 'COD_CHAMADO',
    header: () => <div className="text-center">Chamado</div>,
    cell: ({ getValue }) => (
      <div className="rounded-md bg-cyan-800 p-2 text-center text-white ring-1 ring-cyan-300">
        {getValue() as string}
      </div>
    ),
  },
  // =====

  // assunto do chamado (editável)
  {
    accessorKey: 'ASSUNTO_CHAMADO',
    header: () => <div className="text-center">Assunto</div>,
    cell: ({ getValue, row }) => {
      const value = getValue() as string;

      return (
        <AssuntoCellEditavel
          assunto={value}
          codChamado={row.original.COD_CHAMADO}
          onUpdateAssunto={async (codChamado, novoAssunto) => {
            try {
              // Chama a API para atualizar o assunto
              const response = await fetch(
                `/api/atualizar-assunto/${codChamado}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ assunto: novoAssunto }),
                }
              );

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                  errorData.message || 'Erro ao atualizar assunto'
                );
              }

              // Atualiza o valor local
              row.original.ASSUNTO_CHAMADO = novoAssunto;

              // Se você tem uma função de callback personalizada, chame ela
              if (acoes.onUpdateAssunto) {
                await acoes.onUpdateAssunto(codChamado, novoAssunto);
              }
            } catch (error) {
              console.error('Erro ao atualizar assunto:', error);
              throw error; // Re-throw para que o componente possa lidar com o erro
            }
          }}
        />
      );
    },
  },
  // =====

  // email do chamado
  {
    accessorKey: 'EMAIL_CHAMADO',
    header: () => <div className="text-center">Email</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              {value ? (
                <Link href={`mailto:${value}`} className="hover:underline">
                  <div className="">{value}</div>
                </Link>
              ) : (
                <div className="text-center">-</div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="center"
            sideOffset={8}
            className="bg-white text-sm font-semibold tracking-wider text-gray-900 select-none"
          >
            {value}
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  // =====

  // data do chamado
  {
    accessorKey: 'DATA_CHAMADO',
    header: () => <div className="text-center">Data</div>,
    cell: ({ getValue }) => {
      const dateString = getValue() as string;

      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return <div className="text-center">{dateString}</div>;
      }

      try {
        const [year, month, day] = dateString.split('T')[0].split('-');
        const formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;

        return <div className="text-center">{formattedDate}</div>;
      } catch {
        console.warn('Formato de data não reconhecido:', dateString);

        return <div className="text-center">{dateString}</div>;
      }
    },
  },
  // =====

  // status do chamado (editável)
  {
    accessorKey: 'STATUS_CHAMADO',
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => (
      <StatusCellClicavel
        status={row.original.STATUS_CHAMADO}
        codChamado={row.original.COD_CHAMADO}
        onUpdateStatus={async (codChamado, newStatus) => {
          try {
            await fetch(`/api/atualizar-status/${codChamado}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus }),
            });
            // opcional: atualizar cache do react-query ou estado local
            row.original.STATUS_CHAMADO = newStatus;
          } catch (err) {
            console.error('Erro ao atualizar status:', err);
          }
        }}
      />
    ),
  },

  // ações
  {
    id: 'actions',
    header: () => <div className="text-center">Ações</div>,
    cell: ({ row }) => {
      const chamado = row.original;

      const handleDownload = () => {
        // Exemplo: baixar em JSON
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

      return (
        <div className="flex items-center justify-center gap-3">
          {/* Botão visualizar Chamado */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => acoes.onVisualizarChamado(chamado.COD_CHAMADO)}
                className="inline-flex items-center justify-center rounded-2xl bg-cyan-800 p-2 text-white ring-1 ring-cyan-300"
              >
                <FaEye size={24} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="center"
              sideOffset={8}
              className="bg-white text-sm font-semibold tracking-wider text-gray-900 select-none"
            >
              Visualizar Chamado
            </TooltipContent>
          </Tooltip>

          {/* Botão visualizar OS */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => acoes.onVisualizarOS(chamado.COD_CHAMADO)}
                className="inline-flex items-center justify-center rounded-2xl bg-green-800 p-2 text-white ring-1 ring-green-300"
              >
                <FaEye size={24} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="center"
              sideOffset={8}
              className="bg-white text-sm font-semibold tracking-wider text-gray-900 select-none"
            >
              Visualizar OS
            </TooltipContent>
          </Tooltip>

          {/* Botão download */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center rounded-2xl bg-amber-800 p-2 text-white ring-1 ring-amber-300"
              >
                <FaDownload size={24} />
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
