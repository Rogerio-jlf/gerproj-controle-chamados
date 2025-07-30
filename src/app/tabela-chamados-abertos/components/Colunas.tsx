import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { FaEye } from 'react-icons/fa';

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
        <div className="rounded-lg bg-cyan-800 p-2 text-center text-white ring-1 ring-cyan-300">
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
      <div className="rounded-lg bg-cyan-800 p-2 text-center text-white ring-1 ring-cyan-300">
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
            align="end" // start = esquerda, center = padrão, end = direita
            sideOffset={12} // distância entre o trigger e o tooltip
            className="border border-white/30 bg-slate-900 text-base font-semibold tracking-wider text-white"
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
            <div className="rounded-lg bg-cyan-800 p-2 text-white ring-1 ring-cyan-300">
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
    accessorKey: 'NOME_RECURSO',
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
            align="end" // start = esquerda, center = padrão, end = direita
            sideOffset={12} // distância entre o trigger e o tooltip
            className="border border-white/30 bg-slate-900 text-base font-semibold tracking-wider text-white"
          >
            <p className="font-semibold tracking-wider text-white">
              {value ?? 'Não informado'}
            </p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  // --------------------
  {
    accessorKey: 'NOME_CLIENTE',
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
            align="end" // start = esquerda, center = padrão, end = direita
            sideOffset={12} // distância entre o trigger e o tooltip
            className="border border-white/30 bg-slate-900 text-base font-semibold tracking-wider text-white"
          >
            <p className="font-semibold tracking-wider text-white">
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
    header: () => <div className="text-center">Tarefa</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return (
        <div className="text-center">
          {value ? (
            <div className="rounded-lg bg-cyan-800 p-2 text-white ring-1 ring-cyan-300">
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
            align="end" // start = esquerda, center = padrão, end = direita
            sideOffset={12} // distância entre o trigger e o tooltip
            className="border border-white/30 bg-slate-900 text-base font-semibold tracking-wider text-white"
          >
            <p className="text-center font-semibold tracking-wider text-white">
              {value ?? 'Não informado'}
            </p>
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
            <div className="rounded-lg bg-green-700 p-2 text-white ring-1 ring-green-300">
              {formatarData(value)}
            </div>
          ) : (
            <div className="rounded-lg bg-yellow-700 p-2 text-white uppercase ring-1 ring-yellow-300">
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
        <div className="flex items-center justify-center gap-3">
          {/* Botão visualizar Chamado */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => acoes.onVisualizarChamado(chamado.COD_CHAMADO)}
                className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-cyan-800 p-2 text-white ring-1 ring-cyan-300"
              >
                <FaEye className="h-6 w-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top" // (top, bottom, left, right) - aqui aparece acima
              align="end" // start = esquerda, center = padrão, end = direita
              sideOffset={12} // distância entre o trigger e o tooltip
              className="border border-white/30 bg-slate-900 text-base font-semibold tracking-wider text-white"
            >
              Visualizar chamado
            </TooltipContent>
          </Tooltip>

          {/* Botão visualizar OS */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => acoes.onVisualizarOS(chamado.COD_CHAMADO)}
                className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-green-800 p-2 text-white ring-1 ring-green-300"
              >
                <FaEye className="h-6 w-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top" // (top, bottom, left, right) - aqui aparece acima
              align="end" // start = esquerda, center = padrão, end = direita
              sideOffset={12} // distância entre o trigger e o tooltip
              className="border border-white/30 bg-slate-900 text-base font-semibold tracking-wider text-white"
            >
              Visualizar OS
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
];
