import { ColumnDef } from '@tanstack/react-table';
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '../../../../components/ui/tooltip';
// ================================================================================
import { TabelaOSProps } from '../../../../types/types';
import { EditarCellFaturadoOSValidOS } from './Editar_Cell_FaturadoOS_ValidOS';
// ================================================================================
import {
   formatarDataParaBR,
   formatarDataHoraParaBR,
   formatarDecimalParaTempo,
   formatarHora,
   formatCodChamado,
} from '../../../../utils/formatters';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';

// ================================================================================
// INTERFACES
// ================================================================================
interface BotoesAcaoProps {
   userType?: string;
}

interface ColunasProps {
   handleUpdateField?: (
      codOs: number,
      field: string,
      value: any
   ) => Promise<void>;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export const colunasTabelaOS = (
   props?: ColunasProps
): ColumnDef<TabelaOSProps>[] => {
   const handleUpdateField = props?.handleUpdateField;

   return [
      // Chamado
      {
         accessorKey: 'CHAMADO_OS',
         header: () => <div className="text-center">Cham.</div>,
         cell: ({ getValue }) => {
            const value = getValue() as number;
            return (
               <div className="flex items-center justify-center rounded-sm border border-teal-700 bg-teal-600 py-2 text-center font-bold text-white">
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
               <div className="flex items-center justify-center rounded-sm border border-purple-700 bg-purple-600 py-2 text-center font-bold text-white">
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
               <div className="flex items-center justify-center rounded-sm border-[1px] border-slate-500 bg-slate-950 py-2 text-center font-bold text-white">
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
               <div className="flex items-center justify-center rounded-sm border-[1px] border-slate-500 bg-slate-950 py-2 text-center font-bold text-white">
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
               <div className="flex items-center justify-center rounded-sm border-[1px] border-slate-500 bg-slate-950 py-2 text-center font-bold text-white">
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
               <div className="flex items-center justify-center rounded-sm border-[1px] border-slate-500 bg-slate-950 py-2 text-center font-bold text-white">
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
               <div className="flex items-center justify-center rounded-sm border-[1px] border-slate-500 bg-slate-950 py-2 text-center font-bold text-white">
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
               <div className="flex items-center justify-center rounded-sm border-[1px] border-slate-500 bg-slate-950 py-2 text-center font-bold text-white">
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
                  className={`flex items-center justify-center rounded-sm border-[1px] border-slate-500 bg-slate-950 py-2 text-center font-bold text-white ${isEmpty ? 'justify-center text-center' : 'justify-start pl-4 text-left'}`}
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
         cell: ({ row, getValue }) => {
            const value = getValue() as string;

            // Se não tem função de update, renderiza como antes (somente leitura)
            if (!handleUpdateField) {
               const valueUpper = value?.toUpperCase();
               let bgColor = 'bg-gray-400';
               if (valueUpper === 'SIM')
                  bgColor =
                     'bg-blue-600 text-white border-blue-700 border-[1px]';
               else if (valueUpper === 'NAO')
                  bgColor = 'bg-red-600 text-white border-red-700 border-[1px]';

               return (
                  <div
                     className={`flex items-center ${bgColor} justify-center py-2 text-center font-bold text-black`}
                  >
                     {valueUpper || '---'}
                  </div>
               );
            }

            // Se tem função de update, renderiza o editor
            return (
               <EditarCellFaturadoOSValidOS
                  value={value?.toUpperCase() as 'SIM' | 'NAO' | null}
                  fieldName="FATURADO_OS"
                  codOs={row.original.COD_OS}
                  onUpdate={handleUpdateField}
                  disabled={false}
               />
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
                  <div
                     className={`flex items-center justify-center rounded-sm border-[1px] border-slate-500 bg-slate-950 py-2 text-center font-bold text-white ${isEmpty ? 'justify-center text-center' : 'justify-start pl-4 text-left'}`}
                  >
                     {recurso
                        ? recurso.split(' ').slice(0, 2).join(' ')
                        : '---------------'}
                  </div>
               );
            }
         },
      },
      // ==========

      // Consultor Recebe
      {
         accessorKey: 'VALID_OS',
         header: () => <div className="text-center">Cons. Recebe</div>,
         cell: ({ row, getValue }) => {
            const value = getValue() as string;

            // Se não tem função de update, renderiza como antes (somente leitura)
            if (!handleUpdateField) {
               const valueUpper = value?.toUpperCase();
               let bgColor = 'bg-white/50';
               if (valueUpper === 'SIM')
                  bgColor = 'bg-blue-600 text-white border-blue-700';
               else if (valueUpper === 'NAO')
                  bgColor = 'bg-red-600 text-white border-red-700';

               return (
                  <div
                     className={`flex items-center rounded-sm border ${bgColor} justify-center py-2 text-center font-bold text-black`}
                  >
                     {valueUpper || '---'}
                  </div>
               );
            }

            // Se tem função de update, renderiza o editor
            return (
               <EditarCellFaturadoOSValidOS
                  value={value?.toUpperCase() as 'SIM' | 'NAO' | null}
                  fieldName="VALID_OS"
                  codOs={row.original.COD_OS}
                  onUpdate={handleUpdateField}
                  disabled={false}
               />
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
                  className={`flex items-center justify-center rounded-sm border-[1px] border-slate-500 bg-slate-950 py-2 text-center font-bold text-white ${isEmpty ? 'justify-center text-center' : 'justify-start pl-4 text-left'}`}
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
                  className={`flex items-center justify-center rounded-sm border-[1px] border-slate-500 bg-slate-950 py-2 text-center font-bold text-white ${isEmpty ? 'justify-center text-center' : 'justify-start pl-4 text-left'}`}
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
};
