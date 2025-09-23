import { ColumnDef } from '@tanstack/react-table';
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '@/components/ui/tooltip';
// ================================================================================
import { TabelaOSProps } from '../../../../../types/types';
// ================================================================================
import { corrigirTextoCorrompido } from '../../../../../lib/corrigirTextoCorrompido';
import {
   formatarDataParaBR,
   formatarDecimalParaTempo,
   formatarHora,
} from '../../../../../utils/formatters';
// ================================================================================
import { MdEditDocument } from 'react-icons/md';
import { RiDeleteBin5Fill } from 'react-icons/ri';

// ================================================================================
// INTERFACES
// ================================================================================
export interface OSTarefaProps {
   isOpen: boolean;
   onClose: () => void;
   onSuccess?: () => void;
   codChamado?: number | null;
}
// ==========

export interface AcoesTabelaOSProps {
   onEditarOS: (codOS: number) => void;
   onExcluirOS: (codOS: number) => void;
}
// ==============================

// Função para converter horas de HHMM, decimais para HH:MM
const formatDecimalToTime = (decimalHours: number): string => {
   if (!decimalHours && decimalHours !== 0) return '-';

   const hours = Math.floor(decimalHours);
   const minutes = Math.round((decimalHours - hours) * 60);

   // Formatação com zero à esquerda
   const formattedHours = hours.toString().padStart(2, '0');
   const formattedMinutes = minutes.toString().padStart(2, '0');

   return `${formattedHours}:${formattedMinutes}`;
};
// ================================================================================

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export const colunasTabelaOS = (
   acoes: AcoesTabelaOSProps
): ColumnDef<TabelaOSProps>[] => [
   // Código da OS
   {
      accessorKey: 'COD_OS',
      header: () => <div className="text-center">Código</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         return (
            <div className="rounded-md bg-slate-900 p-2 text-center text-white">
               {value}
            </div>
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
         return <div className="text-left">{value || '-'}</div>;
      },
   },
   // =====

   // Código da tarefa
   {
      accessorKey: 'CODTRF_OS',
      header: () => <div className="text-center">Tarefa</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         return <div className="text-center">{value || '-'}</div>;
      },
   },
   // =====

   // Observação da OS
   {
      accessorKey: 'OBS_OS',
      header: () => <div className="text-center">Observação</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         return (
            <Tooltip>
               <TooltipTrigger asChild>
                  <div className="text-left">
                     {corrigirTextoCorrompido(value) || '-'}
                  </div>
               </TooltipTrigger>
               <TooltipContent
                  side="left"
                  align="end"
                  sideOffset={8}
                  className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black shadow-lg shadow-black select-none"
               >
                  {corrigirTextoCorrompido(value) || '-'}
               </TooltipContent>
            </Tooltip>
         );
      },
   },
   // =====

   // Data da OS
   {
      accessorKey: 'DTINI_OS',
      header: () => <div className="text-center">Data</div>,
      cell: ({ getValue }) => {
         const dateString = getValue() as string;
         const dataFormatada = formatarDataParaBR(dateString);

         return (
            <div className="rounded-md bg-green-500 p-2 text-center text-black">
               {dataFormatada}
            </div>
         );
      },
   },
   // =====

   // Hora de início da OS
   {
      accessorKey: 'HRINI_OS',
      header: () => <div className="text-center">HR. Início</div>,
      cell: ({ getValue }) => {
         const timeString = getValue() as string;
         const horaFormatada = formatarHora(timeString);

         return (
            <div className="rounded-md bg-green-500 p-2 text-center text-black">
               {horaFormatada}
            </div>
         );
      },
   },
   // =====

   // Hora do fim da OS
   {
      accessorKey: 'HRFIM_OS',
      header: () => <div className="text-center">HR. Fim</div>,
      cell: ({ getValue }) => {
         const timeString = getValue() as string;
         const horaFormatada = formatarHora(timeString);

         return (
            <div className="rounded-md bg-green-500 p-2 text-center text-black">
               {horaFormatada}
            </div>
         );
      },
   },
   // =====

   // Quantidade de horas gastas na OS
   {
      accessorKey: 'QTD_HR_OS',
      header: () => <div className="text-center">QTD. Horas</div>,
      cell: ({ getValue }) => {
         const value = getValue() as number;
         const tempoFormatado = formatarDecimalParaTempo(value);

         return (
            <div className="rounded-md bg-green-500 p-2 text-center text-black">
               {tempoFormatado}
            </div>
         );
      },
   },
   // =====

   // Botões de ação
   {
      id: 'actions',
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
         const os = row.original;

         return (
            <div className="flex items-center justify-center gap-4">
               {/* Botão editar OS */}
               <Tooltip>
                  <TooltipTrigger asChild>
                     <button
                        onClick={() => acoes.onEditarOS(os.COD_OS)}
                        className="cursor-pointer transition-all hover:-translate-y-1 hover:scale-102 active:scale-95"
                     >
                        <MdEditDocument size={32} />
                     </button>
                  </TooltipTrigger>
                  <TooltipContent
                     side="left"
                     align="end"
                     sideOffset={8}
                     className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black shadow-lg shadow-black select-none"
                  >
                     Editar OS
                  </TooltipContent>
               </Tooltip>
               {/* ===== */}

               {/* Botão Excluir OS */}
               <Tooltip>
                  <TooltipTrigger asChild>
                     <button
                        onClick={() => acoes.onExcluirOS(os.COD_OS)}
                        className="cursor-pointer transition-all hover:-translate-y-1 hover:scale-102 active:scale-95"
                     >
                        <RiDeleteBin5Fill size={32} />
                     </button>
                  </TooltipTrigger>
                  <TooltipContent
                     side="left"
                     align="end"
                     sideOffset={8}
                     className="border-t-4 border-red-600 bg-white text-sm font-semibold tracking-wider text-black shadow-lg shadow-black select-none"
                  >
                     Excluir OS
                  </TooltipContent>
               </Tooltip>
            </div>
         );
      },
   },
];
