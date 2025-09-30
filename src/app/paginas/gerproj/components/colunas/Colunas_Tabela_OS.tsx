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
   formatarDataHoraParaBR,
   formatarDecimalParaTempo,
   formatarHora,
   formatCodChamado,
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
      header: () => <div className="text-center">Cham.</div>,
      cell: ({ getValue }) => {
         const value = getValue() as number;
         return (
            <div className="flex items-center justify-center rounded-sm border border-white/20 bg-teal-600 py-2 text-center font-bold text-white">
               {formatCodChamado(value) || '-----'}
            </div>
         );
      },
   },
   // ==========

   // OS
   {
      accessorKey: 'COD_OS',
      header: () => <div className="text-center">OS</div>,
      cell: ({ getValue }) => {
         const value = getValue() as number;

         return (
            <div className="flex items-center justify-center rounded-sm border border-white/20 bg-purple-600 py-2 text-center font-bold text-white">
               {formatCodChamado(value) || '-----'}
            </div>
         );
      },
   },
   // ==========

   // Data Início
   {
      accessorKey: 'DTINI_OS',
      header: () => <div className="text-center">Dt. Início</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         const dataFormatada = formatarDataParaBR(value);

         return (
            <div className="flex items-center justify-center rounded-sm border border-white/20 bg-white/50 py-2 text-center font-bold text-black">
               {dataFormatada || '----------'}
            </div>
         );
      },
   },
   // ==========

   // Hora Início
   {
      accessorKey: 'HRINI_OS',
      header: () => <div className="text-center">Hora Início</div>,
      cell: ({ getValue }) => {
         const hora = getValue() as string;
         return (
            <div className="flex items-center justify-center rounded-sm border border-white/20 bg-white/50 py-2 text-center font-bold text-black">
               {hora ? formatarHora(hora) : '--:--'}
            </div>
         );
      },
   },
   // ==========

   // Hora Fim
   {
      accessorKey: 'HRFIM_OS',
      header: () => <div className="text-center">Hora final</div>,
      cell: ({ getValue }) => {
         const hora = getValue() as string;
         return (
            <div className="flex items-center justify-center rounded-sm border border-white/20 bg-white/50 py-2 text-center font-bold text-black">
               {hora ? formatarHora(hora) : '--:--'}
            </div>
         );
      },
   },
   // ==========

   // Total Horas
   {
      accessorKey: 'QTD_HR_OS',
      header: () => <div className="text-center">Tempo total</div>,
      cell: ({ getValue }) => {
         const value = getValue() as number;
         const tempoFormatado = formatarDecimalParaTempo(value);

         return (
            <div className="flex items-center justify-center rounded-sm border border-white/20 bg-white/50 py-2 text-center font-bold text-black">
               {tempoFormatado || '--:--'}
            </div>
         );
      },
   },
   // ==========

   // Data Apontamento
   {
      accessorKey: 'DTINC_OS',
      header: () => <div className="text-center">Dt. Apontam.</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         const dataFormatada = formatarDataHoraParaBR(value);

         return (
            <div className="flex items-center justify-center rounded-sm border border-white/20 bg-white/50 py-2 text-center font-bold text-black">
               {dataFormatada || '----------'}
            </div>
         );
      },
   },
   // ==========

   // Competência
   {
      accessorKey: 'COMP_OS',
      header: () => <div className="text-center">Compet.</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;

         return (
            <div className="flex items-center justify-center rounded-sm border border-white/20 bg-white/50 py-2 text-center font-bold text-black">
               {value || '-------'}
            </div>
         );
      },
   },
   // ==========

   // Cliente
   {
      accessorKey: 'NOME_CLIENTE',
      header: () => <div className="text-center">Cliente</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         const textoCorrigido = corrigirTextoCorrompido(value);
         const isEmpty = !textoCorrigido;

         return (
            <div
               className={`flex items-center rounded-sm border border-white/20 bg-white/50 py-2 font-bold text-black ${isEmpty ? 'justify-center text-center' : 'justify-start pl-4 text-left'}`}
            >
               {textoCorrigido
                  ? textoCorrigido.split(' ').slice(0, 2).join(' ')
                  : '---------------'}
            </div>
         );
      },
   },
   // ==========

   // Cliente Paga
   {
      accessorKey: 'FATURADO_OS',
      header: () => <div className="text-center">Clien. Paga</div>,
      cell: ({ getValue }) => {
         const value = (getValue() as string)?.toUpperCase();
         let bgColor = 'bg-gray-400';
         if (value === 'SIM') bgColor = 'bg-blue-600 text-white';
         else if (value === 'NAO') bgColor = 'bg-red-600 text-white';
         return (
            <div
               className={`flex items-center rounded-sm border border-white/20 ${bgColor} justify-center py-2 text-center font-bold text-black`}
            >
               {value || '---'}
            </div>
         );
      },
   },
   // ==========

   // Consultor
   {
      accessorKey: 'NOME_RECURSO',
      header: () => <div className="text-center">Consultor</div>,
      cell: ({ getValue }) => {
         const recurso = getValue() as string;
         const isEmpty = !recurso;

         if (recurso) {
            return (
               <Tooltip>
                  <TooltipTrigger asChild>
                     <div
                        className={`flex items-center rounded-sm border border-white/20 bg-white/50 py-2 font-bold text-black ${isEmpty ? 'justify-center text-center' : 'justify-start pl-4 text-left'}`}
                     >
                        {recurso
                           ? recurso.split(' ').slice(0, 2).join(' ')
                           : '---------------'}
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
      },
   },
   // ==========

   // Consultor Recebe
   {
      accessorKey: 'VALID_OS',
      header: () => <div className="text-center">Cons. Recebe</div>,
      cell: ({ getValue }) => {
         const value = (getValue() as string)?.toUpperCase();
         let bgColor = 'bg-white/50';
         if (value === 'SIM') bgColor = 'bg-blue-600 text-white';
         else if (value === 'NAO') bgColor = 'bg-red-600 text-white';
         return (
            <div
               className={`flex items-center rounded-sm border border-white/20 ${bgColor} justify-center py-2 text-center font-bold text-black`}
            >
               {value || '---'}
            </div>
         );
      },
   },
   // ==========

   // Tarefa completa
   {
      accessorKey: 'TAREFA_COMPLETA',
      header: () => <div className="text-center">Tarefa</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         const isEmpty = !value;
         return (
            <div
               className={`flex items-center rounded-sm border border-white/20 bg-white/50 py-2 font-bold text-black ${isEmpty ? 'justify-center text-center' : 'justify-start pl-4 text-left'}`}
            >
               {isEmpty ? (
                  '------------------------------'
               ) : (
                  <span className="block w-full truncate">{value}</span>
               )}
            </div>
         );
      },
   },
   // ==========

   // Projeto completo
   {
      accessorKey: 'PROJETO_COMPLETO',
      header: () => <div className="text-center">Projeto</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         const isEmpty = !value;
         return (
            <div
               className={`flex items-center rounded-sm border border-white/20 bg-white/50 py-2 font-bold text-black ${isEmpty ? 'justify-center text-center' : 'justify-start pl-4 text-left'}`}
            >
               {isEmpty ? (
                  '------------------------------'
               ) : (
                  <span className="block w-full truncate">{value}</span>
               )}
            </div>
         );
      },
   },
   // ==========
];
