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
import {
   formatarDataParaBR,
   formatarHora,
} from '../../../../../utils/formatters';

// ================================================================================
// INTERFACES
// ================================================================================
interface BotoesAcaoProps {
   userType?: string;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export const colunasTabelaOS = (): ColumnDef<TabelaOSProps>[] => [
   // Código da OS
   {
      accessorKey: 'COD_OS',
      header: () => <div className="text-center">CÓD. OS</div>,
      cell: ({ getValue }) => (
         <div className="rounded-md border border-black bg-white/30 p-2 text-center font-bold text-black">
            {getValue() as string}
         </div>
      ),
   },

   // Data Início
   {
      accessorKey: 'DTINI_OS',
      header: () => <div className="text-center">DT. Início</div>,
      cell: ({ getValue }) => {
         const dateString = getValue() as string;
         const dataFormatada = formatarDataParaBR(dateString);

         return (
            <div className="rounded-md border border-black bg-white/30 p-2 text-center font-bold text-black">
               {dataFormatada}
            </div>
         );
      },
   },

   // Hora Início
   {
      accessorKey: 'HRINI_OS',
      header: () => <div className="text-center">HR. Início</div>,
      cell: ({ getValue }) => {
         const hora = getValue() as string;
         return (
            <div className="flex items-center justify-center gap-1">
               <span className="font-mono text-white">
                  {hora ? formatarHora(hora) : '--:--'}
               </span>
            </div>
         );
      },
   },

   // Hora Fim
   {
      accessorKey: 'HRFIM_OS',
      header: () => <div className="text-center">HR. Fim</div>,
      cell: ({ getValue }) => {
         const hora = getValue() as string;
         return (
            <div className="flex items-center justify-center gap-1">
               <span className="font-mono text-white">
                  {hora ? formatarHora(hora) : '--:--'}
               </span>
            </div>
         );
      },
   },

   // Data Inclusão
   {
      accessorKey: 'DTINC_OS',
      header: () => <div className="text-center">DT. Inclusão</div>,
      cell: ({ getValue }) => {
         const dateString = getValue() as string;
         const dataFormatada = formatarDataParaBR(dateString);

         return (
            <div className="rounded-md border border-black bg-white/30 p-2 text-center font-bold text-black">
               {dataFormatada}
            </div>
         );
      },
   },

   // Faturado
   {
      accessorKey: 'FATURADO_OS',
      header: () => <div className="text-center">Fatura OS</div>,
      cell: ({ getValue }) => (
         <div className="rounded-md border border-black bg-white/30 p-2 text-center font-bold text-black">
            {getValue() as string}
         </div>
      ),
   },

   // Complemento
   {
      accessorKey: 'COMP_OS',
      header: () => <div className="text-center">Competência</div>,
      cell: ({ getValue }) => (
         <div className="rounded-md border border-black bg-white/30 p-2 text-center font-bold text-black">
            {getValue() as string}
         </div>
      ),
   },

   // Válido
   {
      accessorKey: 'VALID_OS',
      header: () => <div className="text-center">Válida OS</div>,
      cell: ({ getValue }) => (
         <div className="rounded-md border border-black bg-white/30 p-2 text-center font-bold text-black">
            {getValue() as string}
         </div>
      ),
   },

   {
      accessorKey: 'NOME_RECURSO',
      header: () => <div className="text-center">Recurso</div>,
      cell: ({ getValue }) => {
         const recurso = getValue() as string;

         if (recurso) {
            return (
               <Tooltip>
                  <TooltipTrigger asChild>
                     <div className="truncate px-2 text-white">
                        {recurso.split(' ').slice(0, 2).join(' ')}
                     </div>
                  </TooltipTrigger>
                  <TooltipContent
                     side="left"
                     align="end"
                     sideOffset={8}
                     className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black shadow-lg shadow-black select-none"
                  >
                     <div className="max-w-xs break-words">{recurso}</div>
                  </TooltipContent>
               </Tooltip>
            );
         }

         return (
            <div className="rounded-md bg-yellow-500 p-2 text-center text-black">
               <span className="text-xs uppercase">Não atribuído</span>
            </div>
         );
      },
   },

   // Chamado
   {
      accessorKey: 'CHAMADO_OS',
      header: () => <div className="text-center">CÓD. Chamado</div>,
      cell: ({ getValue }) => {
         const chamado = getValue() as number;
         return chamado ? (
            <div className="rounded-md bg-teal-700 p-2 text-center font-bold text-white">
               {chamado}
            </div>
         ) : (
            <div className="rounded-md bg-gray-600 p-2 text-center text-white">
               --
            </div>
         );
      },
   },
];
