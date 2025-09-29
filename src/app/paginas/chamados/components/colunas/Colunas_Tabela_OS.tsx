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
   formatarDecimalParaTempo,
   formatarHora,
} from '../../../../../utils/formatters';
import { corrigirTextoCorrompido } from '../../../../../lib/corrigirTextoCorrompido';

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
   // Chamado
   {
      accessorKey: 'CHAMADO_OS',
      header: () => <div className="text-center">Chamado</div>,
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
   // =====

   // Código da OS
   {
      accessorKey: 'COD_OS',
      header: () => <div className="text-center">OS</div>,
      cell: ({ getValue }) => (
         <div className="rounded-md border border-black bg-white/30 p-2 text-center font-bold text-black">
            {getValue() as string}
         </div>
      ),
   },
   // =====

   // Data Início
   {
      accessorKey: 'DTINI_OS',
      header: () => <div className="text-center">Data Início</div>,
      cell: ({ getValue }) => {
         const dateString = getValue() as string;
         const dataFormatada = formatarDataParaBR(dateString);

         return (
            <div className="flex items-center justify-center rounded-md border border-black bg-white/30 p-2 text-center font-bold text-black">
               {dataFormatada}
            </div>
         );
      },
   },

   // Hora Início
   {
      accessorKey: 'HRINI_OS',
      header: () => <div className="text-center">Hora Início</div>,
      cell: ({ getValue }) => {
         const hora = getValue() as string;
         return (
            <div className="flex items-center justify-center rounded-md border border-black bg-white/30 p-2 text-center font-bold text-black">
               {hora ? formatarHora(hora) : '--:--'}
            </div>
         );
      },
   },

   // Hora Fim
   {
      accessorKey: 'HRFIM_OS',
      header: () => <div className="text-center">Hora Fim</div>,
      cell: ({ getValue }) => {
         const hora = getValue() as string;
         return (
            <div className="flex items-center justify-center rounded-md border border-black bg-white/30 p-2 text-center font-bold text-black">
               {hora ? formatarHora(hora) : '--:--'}
            </div>
         );
      },
   },

   // Quantidade de horas gastas na OS
   {
      accessorKey: 'QTD_HR_OS',
      header: () => <div className="text-center">Total HR's</div>,
      cell: ({ getValue }) => {
         const value = getValue() as number;
         const tempoFormatado = formatarDecimalParaTempo(value);

         return (
            <div className="flex items-center justify-center rounded-md border border-black bg-white/30 p-2 text-center font-bold text-black">
               {tempoFormatado}
            </div>
         );
      },
   },
   // =====

   // Data Inclusão
   {
      accessorKey: 'DTINC_OS',
      header: () => <div className="text-center">Data Apontam.</div>,
      cell: ({ getValue }) => {
         const dateString = getValue() as string;
         const dataFormatada = formatarDataParaBR(dateString);

         return (
            <div className="flex items-center justify-center rounded-md border border-black bg-white/30 p-2 text-center font-bold text-black">
               {dataFormatada}
            </div>
         );
      },
   },

   // Faturado
   {
      accessorKey: 'FATURADO_OS',
      header: () => <div className="text-center">Cliente Paga</div>,
      cell: ({ getValue }) => {
         const value = (getValue() as string)?.toUpperCase();
         let bgColor = 'bg-gray-400';
         if (value === 'SIM') bgColor = 'bg-blue-600 text-white';
         else if (value === 'NAO') bgColor = 'bg-red-600 text-white';
         return (
            <div
               className={`flex items-center justify-center rounded-md border border-black ${bgColor} p-2 text-center font-bold`}
            >
               {value}
            </div>
         );
      },
   },

   // Válido
   {
      accessorKey: 'VALID_OS',
      header: () => <div className="text-center">Consultor Recebe</div>,
      cell: ({ getValue }) => {
         const value = (getValue() as string)?.toUpperCase();
         let bgColor = 'bg-gray-400';
         if (value === 'SIM') bgColor = 'bg-blue-600 text-white';
         else if (value === 'NAO') bgColor = 'bg-red-600 text-white';
         return (
            <div
               className={`flex items-center justify-center rounded-md border border-black ${bgColor} p-2 text-center font-bold`}
            >
               {value}
            </div>
         );
      },
   },

   // Complemento
   {
      accessorKey: 'COMP_OS',
      header: () => <div className="text-center">Compet.</div>,
      cell: ({ getValue }) => (
         <div className="flex items-center justify-center rounded-md border border-black bg-white/30 p-2 text-center font-bold text-black">
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
                     <div className="flex items-center justify-center rounded-md border border-black bg-white/30 p-2 text-center font-bold text-black">
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

   // Nome do Cliente
   {
      accessorKey: 'NOME_CLIENTE',
      header: () => <div className="text-center">Cliente</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         const textoCorrigido = corrigirTextoCorrompido(value);
         return (
            <div className="flex items-center justify-center rounded-md border border-black bg-white/30 p-2 text-center font-bold text-black">
               {textoCorrigido || '-'}
            </div>
         );
      },
   },

   // Código do projeto
   {
      accessorKey: 'PROJETO_COMPLETO',
      header: () => <div className="text-center">Projeto</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         return (
            <div className="flex items-center justify-center rounded-md border border-black bg-white/30 p-2 text-center font-bold text-black">
               {value || '-'}
            </div>
         );
      },
   },
   // =====
   // Código da tarefa
   {
      accessorKey: 'TAREFA_COMPLETA',
      header: () => <div className="text-center">Tarefa</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         return (
            <div className="flex items-center justify-center rounded-md border border-black bg-white/30 p-2 text-center font-bold text-black">
               {value || '-'}
            </div>
         );
      },
   },
   // =====
];
