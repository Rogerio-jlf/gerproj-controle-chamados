import { ColumnDef } from '@tanstack/react-table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type TableRowProps = {
  chamado_os: string;
  dtini_os: string;
  nome_cliente: string;
  status_chamado: string;
  nome_recurso: string;
  hrini_os: string;
  hrfim_os: string;
  total_horas: string;
  obs: string;
};

export const colunasTabela: ColumnDef<TableRowProps>[] = [
  {
    accessorKey: 'chamado_os',
    header: () => <div className="text-center">Chamado</div>,
    cell: ({ getValue }) => (
      <div className="rounded-lg bg-green-800/50 p-2 text-center text-green-400 ring-1 ring-green-400">
        {getValue() as string}
      </div>
    ),
  },
  // ------------------------------
  {
    accessorKey: 'dtini_os',
    header: () => <div className="text-center">Data</div>,
    cell: ({ getValue }) => {
      const dateString = getValue() as string;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return <div className="text-center">{dateString}</div>;
      }
      try {
        const [year, month, day] = dateString.split('T')[0].split('-');
        return (
          <div className="text-center">
            {`${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`}
          </div>
        );
      } catch {
        console.warn('Formato de data não reconhecido:', dateString);
        return <div className="text-center">{dateString}</div>;
      }
    },
  },
  // ------------------------------
  {
    accessorKey: 'nome_cliente',
    header: () => <div className="text-center">Cliente</div>,
    cell: ({ getValue }) => (
      <div className="truncate text-left" title={getValue() as string}>
        {getValue() as string}
      </div>
    ),
  },
  // ------------------------------
  {
    accessorKey: 'status_chamado',
    header: () => <div className="text-center">Status</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;
      const getStatusStyle = (status: string | undefined) => {
        switch (status?.toLowerCase()) {
          case 'standby':
            return 'bg-yellow-800/50 text-yellow-400 ring-1 ring-yellow-400';
          case 'em atendimento':
            return 'bg-blue-800/50 text-blue-400 ring-1 ring-blue-400';
          case 'finalizado':
            return 'bg-green-800/50 text-green-400 ring-1 ring-green-400';
          case 'atribuido':
            return 'bg-pink-800/50 text-pink-400 ring-1 ring-pink-400';
          case 'aguardando validacao':
            return 'bg-purple-800/50 text-purple-400 ring-1 ring-purple-400';
          default:
            return 'bg-gray-800/50 text-gray-400 ring-1 ring-gray-400';
        }
      };
      return (
        <div className="text-center">
          <span
            className={`block w-full rounded-lg p-2 ${getStatusStyle(value)}`}
          >
            {value ?? 'Sem status'}
          </span>
        </div>
      );
    },
  },
  // ------------------------------
  {
    accessorKey: 'nome_recurso',
    header: () => <div className="text-center">Recurso</div>,
    cell: ({ getValue }) => (
      <div className="truncate text-left" title={getValue() as string}>
        {getValue() as string}
      </div>
    ),
  },
  // ------------------------------
  {
    accessorKey: 'hrini_os',
    header: () => <div className="text-center">HR Início</div>,
    cell: ({ getValue }) => {
      const raw = getValue();
      if (!raw) return <div className="text-center">–</div>;
      const hora = raw.toString().padStart(3, '0');
      const hh = hora.slice(0, 2);
      const mm = hora.slice(2, 5);
      return <div className="text-center">{`${hh}${mm}`}</div>;
    },
  },
  // ------------------------------
  {
    accessorKey: 'hrfim_os',
    header: () => <div className="text-center">HR Fim</div>,
    cell: ({ getValue }) => {
      const raw = getValue();
      if (!raw) return <div className="text-center">–</div>;
      const hora = raw.toString().padStart(3, '0');
      const hh = hora.slice(0, 2);
      const mm = hora.slice(2, 5);
      return <div className="text-center">{`${hh}${mm}`}</div>;
    },
  },
  // ------------------------------
  {
    accessorKey: 'total_horas',
    header: () => <div className="text-center">Total HR's</div>,
    cell: ({ getValue }) => (
      <div className="rounded-lg bg-blue-800/50 p-2 text-center text-blue-400 ring-1 ring-blue-400">
        {getValue() as string}
      </div>
    ),
  },
  // ------------------------------
  {
    accessorKey: 'obs',
    header: () => <div className="text-center">Observação</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;

      return (
        <TooltipProvider>
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
        </TooltipProvider>
      );
    },
  },
];
