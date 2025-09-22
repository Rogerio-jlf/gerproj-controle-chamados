import { ColumnDef } from '@tanstack/react-table';
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '@/components/ui/tooltip';
// ================================================================================
import { corrigirTextoCorrompido } from '../../../../../lib/corrigirTextoCorrompido';
import { formatarDataParaBR } from '../../../../../utils/formatters';
import { getStylesStatus } from '../../../../../utils/formatters';
// ================================================================================
import { FaDownload } from 'react-icons/fa';
// ================================================================================
// ================================================================================

export interface ChamadosProps {
   COD_CHAMADO: number;
   DATA_CHAMADO: string;
   STATUS_CHAMADO: string;
   CODTRF_CHAMADO: number;
   COD_CLIENTE: number;
   ASSUNTO_CHAMADO: string;
   NOME_TAREFA: string;
   NOME_CLIENTE: string;
}
// =====

interface ColunasProps {
   onCriarOS?: (chamado: ChamadosProps) => void;
}
// ================================================================================

// ===== COMPONENTE DE COLUNAS DA TABELA =====
export const colunasTabela = (): ColumnDef<ChamadosProps>[] => [
   // Código do chamado
   {
      accessorKey: 'COD_CHAMADO',
      header: () => <div className="text-center">Código</div>,
      cell: ({ getValue }) => (
         <div className="rounded-md bg-pink-600 p-2 text-center text-white">
            {getValue() as string}
         </div>
      ),
   },
   // =====

   // Data do chamado
   {
      accessorKey: 'DATA_CHAMADO',
      header: () => <div className="text-center">Data</div>,
      cell: ({ getValue }) => {
         const dateString = getValue() as string;
         const dataFormatada = formatarDataParaBR(dateString);

         return (
            <div className="rounded-md bg-pink-600 p-2 text-center text-white">
               {dataFormatada}
            </div>
         );
      },
   },
   // =====

   // Status do chamado
   {
      accessorKey: 'STATUS_CHAMADO',
      header: () => <div className="text-center">Status</div>,
      cell: ({ getValue }) => {
         const status = getValue() as string;
         const bgColor = getStylesStatus(status);

         return (
            <div className={`rounded-md ${bgColor} p-2 text-center text-black`}>
               {status || 'Desconhecido'}
            </div>
         );
      },
   },
   // =====

   // Assunto do chamado
   {
      accessorKey: 'ASSUNTO_CHAMADO',
      header: () => <div className="text-center">Assunto</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         const textoCorrigido = corrigirTextoCorrompido(value);

         return (
            <div className="truncate px-2 py-1">{textoCorrigido || '-'}</div>
         );
      },
   },
   // =====

   // Nome da tarefa
   {
      accessorKey: 'NOME_TAREFA',
      header: () => <div className="text-center">Nome Tarefa</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         const textoCorrigido = corrigirTextoCorrompido(value);

         return (
            <div className="truncate px-2 py-1">{textoCorrigido || '-'}</div>
         );
      },
   },
   // =====

   // Nome do cliente
   {
      accessorKey: 'NOME_CLIENTE',
      header: () => <div className="text-center">Cliente</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         const textoCorrigido = corrigirTextoCorrompido(value);

         return (
            <div className="truncate px-2 py-1">{textoCorrigido || '-'}</div>
         );
      },
   },
   // =====

   // Ações
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

         return (
            <div className="flex items-center justify-center gap-4">
               {/* Botão Download */}
               <Tooltip>
                  <TooltipTrigger asChild>
                     <button
                        onClick={handleDownload}
                        className="cursor-pointer transition-all hover:-translate-y-1 hover:scale-102 active:scale-95"
                     >
                        <FaDownload size={24} />
                     </button>
                  </TooltipTrigger>
                  <TooltipContent
                     side="left"
                     align="end"
                     sideOffset={8}
                     className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black shadow-lg shadow-black select-none"
                  >
                     Baixar Arquivos
                  </TooltipContent>
               </Tooltip>
            </div>
         );
      },
   },
];
