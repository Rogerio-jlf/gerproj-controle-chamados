import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ColumnDef } from '@tanstack/react-table';
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

export const colunasTabela: ColumnDef<ChamadosProps>[] = [
  {
    accessorKey: 'PRIOR_CHAMADO',
    header: () => <div className="w-full text-center">Prioridade</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <div className="flex items-center justify-center">
          <span
            className={`w-full rounded-lg p-1 text-center tracking-wider ${
              value === 'Alta'
                ? 'bg-red-100 text-red-800 ring-1 ring-red-600/20'
                : 'bg-green-800/50 text-green-400 ring-1 ring-green-400'
            }`}
          >
            {value}
          </span>
        </div>
      );
    },
  },
  // --------------------
  {
    accessorKey: 'COD_CHAMADO',
    header: () => <div className="w-full text-center">Número</div>,
    cell: ({ getValue }) => (
      <div className="flex items-center justify-center">
        <span className="w-full rounded-lg bg-blue-800/50 p-1 text-center tracking-wider text-blue-400 ring-1 ring-blue-400">
          {getValue() as string}
        </span>
      </div>
    ),
  },
  // --------------------
  {
    accessorKey: 'DATA_CHAMADO',
    header: () => <div className="w-full text-center">Data</div>,
    cell: ({ getValue }) => {
      const dateString = getValue() as string;

      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return (
          <div className="flex items-center justify-center">
            <span className="w-full text-center tracking-wider text-white">
              {dateString}
            </span>
          </div>
        );
      }

      try {
        const [year, month, day] = dateString.split('T')[0].split('-');
        const formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        return (
          <div className="flex items-center justify-center">
            <span className="w-full text-left tracking-wider text-white">
              {formattedDate}
            </span>
          </div>
        );
      } catch {
        console.warn('Formato de data não reconhecido:', dateString);
        return (
          <div className="flex items-center justify-center">
            <span className="w-full text-left tracking-wider text-red-500">
              {dateString}
            </span>
          </div>
        );
      }
    },
  },
  // --------------------
  {
    accessorKey: 'HORA_CHAMADO',
    header: () => <div className="w-full text-center">Hora</div>,
    cell: ({ getValue }) => {
      const raw = getValue();

      if (!raw) {
        return (
          <div className="flex items-center justify-center">
            <span className="text-muted-foreground tracking-wider">–</span>
          </div>
        );
      }

      const hora = raw.toString().padStart(4, '0');
      const hh = hora.slice(0, 2);
      const mm = hora.slice(2, 4);

      return (
        <div className="flex items-center justify-center">
          <span className="w-full text-center tracking-wider text-white">{`${hh}:${mm}`}</span>
        </div>
      );
    },
  },
  // --------------------
  {
    accessorKey: 'ASSUNTO_CHAMADO',
    header: () => <div className="w-full text-center">Assunto email</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="group cursor-pointer">
              <span className="block w-full text-left tracking-wider text-white">
                {value}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="z-50 w-full border border-slate-500 bg-slate-950 p-4 text-left tracking-wider text-white"
          >
            <p className="w-full text-left text-sm tracking-wider text-white">
              {value}
            </p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  // --------------------
  {
    accessorKey: 'STATUS_CHAMADO',
    header: () => <div className="w-full text-center">Status</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;

      const getStatusStyle = (status: string | undefined) => {
        const statusUpper = status?.toUpperCase() ?? '';

        switch (statusUpper) {
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
        <span
          className={`flex w-full items-center justify-center rounded-lg p-1 text-center tracking-wider ${getStatusStyle(
            value
          )}`}
        >
          {value ?? 'Sem status'}
        </span>
      );
    },
  },
  // --------------------
  {
    accessorKey: 'COD_CLASSIFICACAO',
    header: () => <div className="w-full text-center">Classificação</div>,
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <div className="flex items-center justify-center">
          {value ? (
            <span className="w-full rounded-lg bg-purple-800/50 p-1 text-center tracking-wider text-purple-400 ring-1 ring-purple-400">
              {value}
            </span>
          ) : (
            <span className="w-full text-center tracking-wider text-gray-400">
              Não informado
            </span>
          )}
        </div>
      );
    },
  },
  // --------------------
  {
    accessorKey: 'RECURSO.NOME_RECURSO',
    header: () => (
      <div className="w-full text-center">Consultor responsável</div>
    ),
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center">
              {value ? (
                <span className="w-full text-left tracking-wider text-white">
                  {value}
                </span>
              ) : (
                <span className="w-full text-center tracking-wider text-gray-400">
                  Não informado
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="z-50 w-full border border-slate-500 bg-slate-950 p-4 text-left tracking-wider text-white"
          >
            <p className="w-full text-left text-sm tracking-wider text-white">
              {value ?? 'Não informado'}
            </p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  // --------------------
  {
    accessorKey: 'CLIENTE.NOME_CLIENTE',
    header: () => <div className="w-full text-center">Cliente</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center">
              {value ? (
                <span className="w-full text-left tracking-wider text-white">
                  {value}
                </span>
              ) : (
                <span className="w-full text-center tracking-wider text-gray-400">
                  Não informado
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="z-50 w-full border border-slate-500 bg-slate-950 p-4 text-left tracking-wider text-white"
          >
            <p className="w-full text-left text-sm tracking-wider text-white">
              {value ?? 'Não informado'}
            </p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  // --------------------
  {
    accessorKey: 'CODTRF_CHAMADO',
    header: () => <div className="w-full text-center">Tarefa</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return (
        <div className="flex items-center justify-center">
          {value ? (
            <span className="w-full rounded-lg bg-indigo-800/50 p-1 text-center tracking-wider text-indigo-400 ring-1 ring-indigo-400">
              {value}
            </span>
          ) : (
            <span className="w-full text-center tracking-wider text-gray-400">
              Não informada
            </span>
          )}
        </div>
      );
    },
  },
  // --------------------
  {
    accessorKey: 'EMAIL_CHAMADO',
    header: () => <div className="w-full text-center">Email</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <div className="flex items-center justify-center">
          {value ? (
            <Link
              href={`mailto:${value}`}
              className="w-full text-left text-blue-500 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              <span className="w-full text-left">{value}</span>
            </Link>
          ) : (
            <span className="w-full text-left tracking-wider text-gray-400">
              Não informado
            </span>
          )}
        </div>
      );
    },
  },
  // --------------------
  {
    accessorKey: 'CONCLUSAO_CHAMADO',
    header: () => <div className="w-full text-center">Finalização</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return (
        <div className="flex items-center justify-center">
          {value ? (
            <span className="w-full rounded-lg bg-green-800/50 p-1 text-center tracking-wider text-green-400 ring-1 ring-green-400">
              {value}
            </span>
          ) : (
            <span className="w-full rounded-lg bg-orange-800/50 p-1 text-center tracking-wider text-orange-400 ring-1 ring-orange-400">
              Em andamento
            </span>
          )}
        </div>
      );
    },
  },
];
