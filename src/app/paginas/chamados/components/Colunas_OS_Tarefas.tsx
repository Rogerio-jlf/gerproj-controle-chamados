import { ColumnDef } from '@tanstack/react-table';
import { OSTarefaProps } from './ModalOSTarefa';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
// ================================================================================
// ================================================================================

export const colunasOSTarefa = (): ColumnDef<OSTarefaProps>[] => [
  // Código da OS
  {
    accessorKey: 'COD_OS',
    header: () => <div className="text-center">CÓD. OS</div>,
    cell: ({ getValue }) => (
      <div className="rounded-md bg-pink-600 p-2 text-center text-white ring-1 ring-white">
        {getValue() as string}
      </div>
    ),
  },

  // Nome do Cliente
  {
    accessorKey: 'NOME_CLIENTE',
    header: () => <div className="text-center">Cliente</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      const textoCorrigido = corrigirTextoCorrompido(value);
      return <div className="truncate px-2 py-1">{textoCorrigido || '-'}</div>;
    },
  },

  // Número do Chamado
  {
    accessorKey: 'CHAMADO_OS',
    header: () => <div className="text-center">Tarefa</div>,
    cell: ({ getValue }) => (
      <div className="rounded-md bg-blue-600 p-2 text-center text-white ring-1 ring-white">
        {getValue() as string}
      </div>
    ),
  },

  // Observações da OS
  {
    accessorKey: 'OBS_OS',
    header: () => <div className="text-center">Observações</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      const textoCorrigido = corrigirTextoCorrompido(value);
      return (
        <div className="max-w-xs truncate px-2 py-1" title={textoCorrigido}>
          {textoCorrigido || '-'}
        </div>
      );
    },
  },

  // Data de Início
  {
    accessorKey: 'DTINI_OS',
    header: () => <div className="text-center">DT. Início</div>,
    cell: ({ getValue }) => {
      const dateString = getValue() as string;

      if (!dateString) {
        return <div className="text-center">-</div>;
      }

      try {
        // Se já está no formato dd/mm/yyyy
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
          return <div className="text-center">{dateString}</div>;
        }

        // Converte do formato ISO para dd/mm/yyyy
        const [year, month, day] = dateString.split('T')[0].split('-');
        const formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        return <div className="text-center">{formattedDate}</div>;
      } catch {
        return <div className="text-center">{dateString}</div>;
      }
    },
  },

  // Hora de Início
  {
    accessorKey: 'HRINI_OS',
    header: () => <div className="text-center">HR. Início</div>,
    cell: ({ getValue }) => {
      const timeString = getValue() as string;

      if (!timeString) {
        return <div className="text-center">-</div>;
      }

      try {
        // Se já está no formato HH:MM
        if (/^\d{2}:\d{2}$/.test(timeString)) {
          return <div className="text-center">{timeString}</div>;
        }

        // Converte do formato HHMM para HH:MM
        if (/^\d{4}$/.test(timeString.trim())) {
          const cleanTime = timeString.trim().padStart(4, '0');
          const hours = cleanTime.substring(0, 2);
          const minutes = cleanTime.substring(2, 4);
          return (
            <div className="text-center">
              {hours}:{minutes}
            </div>
          );
        }

        return <div className="text-center">{timeString}</div>;
      } catch {
        return <div className="text-center">{timeString}</div>;
      }
    },
  },

  // Hora de Fim
  {
    accessorKey: 'HRFIM_OS',
    header: () => <div className="text-center">HR. Fim</div>,
    cell: ({ getValue }) => {
      const timeString = getValue() as string;

      if (!timeString) {
        return <div className="text-center">-</div>;
      }

      try {
        // Se já está no formato HH:MM
        if (/^\d{2}:\d{2}$/.test(timeString)) {
          return <div className="text-center">{timeString}</div>;
        }

        // Converte do formato HHMM para HH:MM
        if (/^\d{4}$/.test(timeString.trim())) {
          const cleanTime = timeString.trim().padStart(4, '0');
          const hours = cleanTime.substring(0, 2);
          const minutes = cleanTime.substring(2, 4);
          return (
            <div className="text-center">
              {hours}:{minutes}
            </div>
          );
        }

        return <div className="text-center">{timeString}</div>;
      } catch {
        return <div className="text-center">{timeString}</div>;
      }
    },
  },

  // Quantidade de Horas
  {
    accessorKey: 'QTD_HR_OS',
    header: () => <div className="text-center">QTD. Horas</div>,
    cell: ({ getValue }) => {
      const value = getValue() as number;

      return (
        <div className="rounded-md bg-purple-600 p-2 text-center text-white ring-1 ring-white">
          {value !== null && value !== undefined ? value.toFixed(2) : '-'}
        </div>
      );
    },
  },
];
