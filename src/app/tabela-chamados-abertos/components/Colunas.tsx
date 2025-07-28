import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, FileText } from 'lucide-react';
import Link from 'next/link';

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
  CLIENTE?: {
    NOME_CLIENTE: string;
  } | null;
  RECURSO?: {
    NOME_RECURSO: string;
  } | null;
}

// Tipos para as funções de callback dos botões
export interface AcoesProps {
  onVisualizarChamado: (codChamado: number) => void;
  onVisualizarOS: (codChamado: number) => void;
}

export const colunasTabela = (
  acoes: AcoesProps
): ColumnDef<ChamadosProps>[] => [
  {
    accessorKey: 'PRIOR_CHAMADO',
    header: () => <div className="text-center">Prior.</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <div
          className={`rounded-lg p-2 text-center ${
            value === 'Alta'
              ? 'bg-red-800/50 text-red-400 ring-1 ring-red-400'
              : 'bg-green-800/50 text-green-400 ring-1 ring-green-400'
          }`}
        >
          {value}
        </div>
      );
    },
  },
  // --------------------
  {
    accessorKey: 'COD_CHAMADO',
    header: () => <div className="text-center">Chamado</div>,
    cell: ({ getValue }) => (
      <div className="rounded-lg bg-blue-800/50 p-2 text-center text-blue-400 ring-1 ring-blue-400">
        {getValue() as string}
      </div>
    ),
  },
  // --------------------
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
  // --------------------
  {
    accessorKey: 'HORA_CHAMADO',
    header: () => <div className="w-full text-center">Hora</div>,

    cell: ({ getValue }) => {
      const raw = getValue();

      if (!raw) return <div className="text-center">-</div>;
      const hora = raw.toString().padStart(4, '0');
      const hh = hora.slice(0, 2);
      const mm = hora.slice(2, 4);

      return <div className="text-center">{`${hh}:${mm}`}</div>;
    },
  },
  // --------------------
  {
    accessorKey: 'ASSUNTO_CHAMADO',
    header: () => <div className="text-center">Assunto</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help truncate text-left">{value}</div>
          </TooltipTrigger>

          <TooltipContent
            side="top" // (top, bottom, left, right) - aqui aparece acima
            align="start" // start = esquerda, center = padrão, end = direita
            sideOffset={16} // distância entre o trigger e o tooltip
            className="max-w-md -translate-x-10 border border-slate-700 bg-white text-sm tracking-wider break-words text-black"
          >
            {value}
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  // --------------------
  {
    accessorKey: 'STATUS_CHAMADO',
    header: () => <div className="text-center">Status</div>,

    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;

      const getStatusStyle = (status: string | undefined) => {
        switch (status?.toUpperCase()) {
          case 'NAO FINALIZADO':
            return 'bg-yellow-800/50 text-yellow-400 ring-1 ring-yellow-400';

          case 'EM ATENDIMENTO':
            return 'bg-blue-800/50 text-blue-400 ring-1 ring-blue-400';

          case 'FINALIZADO':
            return 'bg-green-800/50 text-green-400 ring-1 ring-green-400';

          case 'NAO INICIADO':
            return 'bg-gray-800/50 text-gray-400 ring-1 ring-gray-400';

          case 'STANDBY':
            return 'bg-orange-800/50 text-orange-400 ring-1 ring-orange-400';

          case 'ATRIBUIDO':
            return 'bg-sky-800/50 text-sky-400 ring-1 ring-sky-400';

          case 'AGUARDANDO VALIDACAO':
            return 'bg-purple-800/50 text-purple-400 ring-1 ring-purple-400';

          default:
            return 'bg-gray-800/50 text-gray-400 ring-1 ring-gray-400';
        }
      };

      return (
        <div className="text-center">
          <div className={`block rounded-lg p-2 ${getStatusStyle(value)}`}>
            {value ?? 'Sem status'}
          </div>
        </div>
      );
    },
  },
  // --------------------
  {
    accessorKey: 'COD_CLASSIFICACAO',
    header: () => <div className="text-center">Classif.</div>,
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <div className="text-center">
          {value ? (
            <div className="rounded-lg bg-purple-800/50 p-2 text-purple-400 ring-1 ring-purple-400">
              {value}
            </div>
          ) : (
            <div>Não informado</div>
          )}
        </div>
      );
    },
  },
  // --------------------
  {
    accessorKey: 'RECURSO.NOME_RECURSO',
    header: () => <div className="text-center">Consultor</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help text-left">
              {value ? (
                <div>{value}</div>
              ) : (
                <div className="text-center">Não informado</div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="top" // (top, bottom, left, right) - aqui aparece acima
            align="start" // start = esquerda, center = padrão, end = direita
            sideOffset={16} // distância entre o trigger e o tooltip
            className="max-w-md -translate-x-10 border border-slate-700 bg-white text-sm tracking-wider break-words text-black"
          >
            <p className="text-black">{value ?? 'Não informado'}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  // --------------------
  {
    accessorKey: 'CLIENTE.NOME_CLIENTE',
    header: () => <div className="text-center">Cliente</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help text-left">
              {value ? (
                <div>{value}</div>
              ) : (
                <div className="text-center">Não informado</div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="top" // (top, bottom, left, right) - aqui aparece acima
            align="start" // start = esquerda, center = padrão, end = direita
            sideOffset={16} // distância entre o trigger e o tooltip
            className="max-w-md -translate-x-10 border border-slate-700 bg-white text-sm tracking-wider break-words text-black"
          >
            <p className="text-black">{value ?? 'Não informado'}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  // --------------------
  {
    accessorKey: 'CODTRF_CHAMADO',
    header: () => <div className="text-center">Tarefa</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return (
        <div className="text-center">
          {value ? (
            <div className="rounded-lg bg-indigo-800/50 p-2 text-indigo-400 ring-1 ring-indigo-400">
              {value}
            </div>
          ) : (
            <div>Não informada</div>
          )}
        </div>
      );
    },
  },
  // --------------------
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
                <div className="text-center">Não informado</div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="top" // (top, bottom, left, right) - aqui aparece acima
            align="start" // start = esquerda, center = padrão, end = direita
            sideOffset={16} // distância entre o trigger e o tooltip
            className="max-w-md -translate-x-10 border border-slate-700 bg-white text-sm tracking-wider break-words text-black"
          >
            <p className="text-center text-black">{value ?? 'Não informado'}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  // --------------------
  {
    accessorKey: 'CONCLUSAO_CHAMADO',
    header: () => <div className="text-center">Finalização</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string | null;

      const formatarData = (dataISO: string) => {
        const data = new Date(dataISO);
        if (isNaN(data.getTime())) return 'Data inválida';
        return data.toLocaleDateString('pt-BR');
      };

      return (
        <div className="text-center">
          {value ? (
            <div className="rounded-lg bg-green-800/50 p-2 text-green-400 ring-1 ring-green-400">
              {formatarData(value)}
            </div>
          ) : (
            <div className="rounded-lg bg-yellow-800/50 p-2 text-yellow-400 uppercase ring-1 ring-yellow-400">
              Em andamento
            </div>
          )}
        </div>
      );
    },
  },
  // --------------------
  // NOVA COLUNA DE AÇÕES
  {
    id: 'actions',
    header: () => <div className="text-center">Ações</div>,
    cell: ({ row }) => {
      const chamado = row.original;

      return (
        <div className="flex items-center justify-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => acoes.onVisualizarChamado(chamado.COD_CHAMADO)}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600/20 p-2 text-blue-400 ring-1 ring-blue-400 transition-colors hover:bg-blue-600/30 hover:ring-blue-300"
              >
                <Eye size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="center"
              sideOffset={8}
              className="border border-slate-700 bg-white text-sm text-black"
            >
              Visualizar Chamado
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => acoes.onVisualizarOS(chamado.COD_CHAMADO)}
                className="inline-flex items-center justify-center rounded-lg bg-green-600/20 p-2 text-green-400 ring-1 ring-green-400 transition-colors hover:bg-green-600/30 hover:ring-green-300"
              >
                <FileText size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="center"
              sideOffset={8}
              className="border border-slate-700 bg-white text-sm text-black"
            >
              Visualizar OS
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
];
