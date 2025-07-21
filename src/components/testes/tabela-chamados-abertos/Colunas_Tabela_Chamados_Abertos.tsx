import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ColumnDef } from '@tanstack/react-table';

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

export const colunasTabelaChamadosAbertos: ColumnDef<ChamadosProps>[] = [
  {
    accessorKey: 'PRIOR_CHAMADO',
    header: () => <div className="w-full text-center">Prioridade</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <div className="flex justify-center text-center">
          <span
            className={`flex w-full items-center justify-center rounded-lg p-2 text-xs font-medium ${
              value === 'Alta'
                ? 'bg-red-100 text-red-800 ring-1 ring-red-600/20 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-400/20'
                : 'bg-green-100 text-green-800 ring-1 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-400/20'
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
      <div className="flex justify-center text-center">
        <span className="flex w-full items-center justify-center rounded-lg bg-blue-50 p-2 text-xs font-medium text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-400/20">
          #{getValue() as string}
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
            <span className="font-mono text-sm">{dateString}</span>
          </div>
        );
      }

      try {
        const [year, month, day] = dateString.split('T')[0].split('-');
        const formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        return (
          <div className="flex items-center justify-center">
            <span className="font-mono text-sm">{formattedDate}</span>
          </div>
        );
      } catch {
        console.warn('Formato de data não reconhecido:', dateString);
        return (
          <div className="flex items-center justify-center">
            <span className="font-mono text-sm text-red-500">{dateString}</span>
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
            <span className="text-sm text-muted-foreground">–</span>
          </div>
        );
      }

      const hora = raw.toString().padStart(4, '0');
      const hh = hora.slice(0, 2);
      const mm = hora.slice(2, 4);

      return (
        <div className="flex items-center justify-center">
          <span className="font-mono text-sm">{`${hh}:${mm}`}</span>
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
            <div className="group cursor-help">
              <span className="block truncate text-left text-sm leading-5 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {value}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="z-50 max-w-sm border border-gray-600 bg-gray-800 p-3 text-white shadow-lg"
          >
            <p className="text-sm leading-relaxed">{value}</p>
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
            return 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-600/20 dark:bg-yellow-900/20 dark:text-yellow-400 dark:ring-yellow-400/20';

          case 'EM ATENDIMENTO':
            return 'bg-blue-100 text-blue-800 ring-1 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-400/20';

          case 'FINALIZADO':
            return 'bg-green-100 text-green-800 ring-1 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-400/20';

          case 'NAO INICIADO':
            return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20 dark:bg-gray-900/20 dark:text-gray-400 dark:ring-gray-400/20';

          case 'STANDBY':
            return 'bg-orange-100 text-orange-800 ring-1 ring-orange-600/20 dark:bg-orange-900/20 dark:text-orange-400 dark:ring-orange-400/20';

          case 'ATRIBUIDO':
            return 'bg-sky-100 text-sky-800 ring-1 ring-sky-600/20 dark:bg-sky-900/20 dark:text-sky-400 dark:ring-sky-400/20';

          case 'AGUARDANDO VALIDACAO':
            return 'bg-purple-100 text-purple-800 ring-1 ring-purple-600/20 dark:bg-purple-900/20 dark:text-purple-400 dark:ring-purple-400/20';

          default:
            return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20 dark:bg-gray-900/20 dark:text-gray-400 dark:ring-gray-400/20';
        }
      };

      return (
        <span
          className={`flex w-full items-center justify-center rounded-lg p-2 text-xs font-medium ${getStatusStyle(
            value,
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
        <div className="text-left">
          {value ? (
            <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-purple-600/20 dark:bg-purple-900/20 dark:text-purple-400 dark:ring-purple-400/20">
              Classificação {value}
            </span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">
              Não informada
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
      const value = getValue() as string | undefined;
      return (
        <div className="text-left">
          {value ? (
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span className="truncate font-medium">{value}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-gray-300"></div>
              <span className="text-gray-400 dark:text-gray-500">
                Não informado
              </span>
            </div>
          )}
        </div>
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
        <div className="text-left">
          {value ? (
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-blue-400"></div>
              <span className="truncate font-medium">{value}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-gray-300"></div>
              <span className="text-gray-400 dark:text-gray-500">
                Não informado
              </span>
            </div>
          )}
        </div>
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
        <div className="text-left">
          {value ? (
            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-600/20 dark:bg-indigo-900/20 dark:text-indigo-400 dark:ring-indigo-400/20">
              {value}
            </span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">
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
        <div className="text-left">
          {value ? (
            <a
              href={`mailto:${value}`}
              className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              <span className="truncate">{value}</span>
            </a>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">
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
        <div className="text-left">
          {value ? (
            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-400/20">
              {value}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-orange-600/20 dark:bg-orange-900/20 dark:text-orange-400 dark:ring-orange-400/20">
              Em andamento
            </span>
          )}
        </div>
      );
    },
  },
];
