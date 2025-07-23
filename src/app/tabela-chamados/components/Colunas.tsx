import { ColumnDef } from '@tanstack/react-table';

// Define o tipo das propriedades de cada linha da tabela
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

// Define as colunas da tabela, especificando como cada campo será exibido
export const colunasTabela: ColumnDef<TableRowProps>[] = [
  // Coluna para o código do chamado
  {
    accessorKey: 'chamado_os',
    header: 'CÓD.',
    cell: ({ getValue }) => (
      <div className="text-center">{getValue() as string}</div>
    ),
  },
  // Coluna para a data, com formatação condicional
  {
    accessorKey: 'dtini_os',
    header: 'Data',
    cell: ({ getValue }) => {
      const dateString = getValue() as string;

      // Se já estiver no formato dd/MM/yyyy, retorna como está
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return dateString;
      }

      // Tenta converter de yyyy-MM-dd para dd/MM/yyyy
      try {
        const [year, month, day] = dateString.split('T')[0].split('-');
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
      } catch {
        // Se falhar, exibe o valor original e mostra um aviso no console
        console.warn('Formato de data não reconhecido:', dateString);
        return dateString;
      }
    },
  },
  // Coluna para o nome do cliente, com truncamento de texto
  {
    accessorKey: 'nome_cliente',
    header: 'Cliente',
    cell: ({ getValue }) => (
      <div className="max-w-[180px] truncate text-left">
        {getValue() as string}
      </div>
    ),
  },
  // Coluna para o status do chamado
  {
    accessorKey: 'status_chamado', // Alterado para corresponder à API
    header: 'Status',
    cell: ({ getValue }) => (
      <div className="text-left">{getValue() as string}</div>
    ),
  },
  // Coluna para o nome do recurso
  {
    accessorKey: 'nome_recurso', // Alterado para corresponder à API
    header: 'Recurso',
    cell: ({ getValue }) => (
      <div className="text-left">{getValue() as string}</div>
    ),
  },
  // Coluna para a hora de início
  {
    accessorKey: 'hrini_os',
    header: 'Hora Início',
    cell: ({ getValue }) => (
      <div className="text-left">{getValue() as string}</div>
    ),
  },
  // Coluna para a hora de fim
  {
    accessorKey: 'hrfim_os',
    header: 'Hora Fim',
    cell: ({ getValue }) => (
      <div className="text-left">{getValue() as string}</div>
    ),
  },
  // Coluna para o tempo total, com destaque na cor azul
  {
    accessorKey: 'total_horas', // Alterado para corresponder à API
    header: 'Tempo Total',
    cell: ({ getValue }) => (
      <div className="text-left">{getValue() as string}</div>
    ),
  },
  // Coluna para observações, com truncamento e tooltip
  {
    accessorKey: 'obs',
    header: 'Observação',
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <div title={value} className="max-w-[200px] truncate text-left">
          {value}
        </div>
      );
    },
  },
];
