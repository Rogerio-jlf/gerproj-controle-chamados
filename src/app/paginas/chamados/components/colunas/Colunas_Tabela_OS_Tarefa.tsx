import { ColumnDef } from '@tanstack/react-table';
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '../../../../../components/ui/tooltip';
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
export interface AcoesTabelaOSTarefaProps {
   onEditarOS: (codOS: number) => void;
   onExcluirOS: (codOS: number) => void;
}
// ==============================

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export const colunasTabelaOSTarefa = (
   acoes: AcoesTabelaOSTarefaProps
): ColumnDef<TabelaOSProps>[] => [
   // Código da OS
   {
      accessorKey: 'COD_OS',
      header: () => <div className="text-center">Código</div>,
      cell: ({ getValue }) => (
         <div className="rounded-md bg-slate-900 p-2 text-center text-white">
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
         return (
            <div className="truncate px-2 py-1">{textoCorrigido || '-'}</div>
         );
      },
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

   // Data de Início - VERSÃO REFATORADA
   {
      accessorKey: 'DTINI_OS',
      header: () => <div className="text-center">DT. Início</div>,
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

   // Hora de Início - VERSÃO REFATORADA
   {
      accessorKey: 'HRINI_OS',
      header: () => <div className="text-center">HR. Início</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         const tempoFormatado = formatarHora(value);

         return (
            <div className="rounded-md bg-green-500 p-2 text-center text-black">
               {tempoFormatado}
            </div>
         );
      },
   },

   // Hora de Fim - VERSÃO REFATORADA
   {
      accessorKey: 'HRFIM_OS',
      header: () => <div className="text-center">HR. Fim</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         const tempoFormatado = formatarHora(value);

         return (
            <div className="rounded-md bg-green-500 p-2 text-center text-black">
               {tempoFormatado}
            </div>
         );
      },
   },

   // Quantidade de Horas - VERSÃO REFATORADA
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

   // Botões de ação (sem alteração)
   {
      id: 'actions',
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
         const os = row.original;

         return (
            <div className="flex items-center justify-center gap-4">
               <Tooltip>
                  <TooltipTrigger asChild>
                     <button
                        onClick={() => acoes.onEditarOS(os.COD_OS)}
                        className="cursor-pointer transition-all hover:-translate-y-1 hover:scale-105 active:scale-95"
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

               <Tooltip>
                  <TooltipTrigger asChild>
                     <button
                        onClick={() => acoes.onExcluirOS(os.COD_OS)}
                        className="cursor-pointer transition-all hover:-translate-y-1 hover:scale-105 active:scale-95"
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
