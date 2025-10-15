import { ColumnDef } from '@tanstack/react-table';
// ================================================================================
import { TabelaOSProps } from '../../../../types/types';
import { ModalEditarCellFaturadoOSValidOS } from './Modal_Editar_Cell_FaturadoOS_ValidOS';
// ================================================================================
import {
   formatarDataParaBR,
   formatarDataHoraParaBR,
   formatarDecimalParaTempo,
   formatarHora,
   formatCodChamado,
   formatarCodNumber,
   formatarHorasTotaisHorasDecimais,
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
               <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
                  {formatarCodNumber(value) || '-----'}
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
               <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
                  {formatarCodNumber(value) || '-----'}
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
               <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
                  {dataFormatada || '-----'}
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
            const value = getValue() as string;
            return (
               <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
                  {value ? formatarHora(value) : '-----'}
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
            const value = getValue() as string;
            return (
               <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
                  {value ? formatarHora(value) : '-----'}
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
            const tempoFormatado = formatarHorasTotaisHorasDecimais(value);

            return (
               <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
                  {tempoFormatado || '-----'}
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
               <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
                  {dataFormatada || '-----'}
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
               <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
                  {value || '-----'}
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
                  className={`flex items-center rounded-md bg-black p-2 text-center text-white ${isEmpty ? 'justify-center text-center' : 'justify-start text-left'}`}
               >
                  {textoCorrigido
                     ? textoCorrigido.split(' ').slice(0, 2).join(' ')
                     : '-----'}
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
               if (valueUpper === 'SIM') bgColor = 'bg-blue-600 text-white';
               else if (valueUpper === 'NAO') bgColor = 'bg-red-600 text-white';

               return (
                  <div
                     className={`flex items-center ${bgColor} justify-center text-center`}
                  >
                     {valueUpper || '-----'}
                  </div>
               );
            }

            // Se tem função de update, renderiza o editor
            return (
               <ModalEditarCellFaturadoOSValidOS
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
                     className={`flex items-center rounded-md bg-black p-2 text-center text-white ${isEmpty ? 'justify-center text-center' : 'justify-start text-left'}`}
                  >
                     {recurso
                        ? corrigirTextoCorrompido(recurso)
                             .split(' ')
                             .slice(0, 2)
                             .join(' ')
                        : '-----'}
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
               if (valueUpper === 'SIM') bgColor = 'bg-blue-600 text-white';
               else if (valueUpper === 'NAO') bgColor = 'bg-red-600 text-white';

               return (
                  <div
                     className={`flex items-center ${bgColor} justify-center text-center`}
                  >
                     {valueUpper || '-----'}
                  </div>
               );
            }

            // Se tem função de update, renderiza o editor
            return (
               <ModalEditarCellFaturadoOSValidOS
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
                  className={`flex items-center rounded-md bg-black p-2 text-center text-white ${isEmpty ? 'justify-center text-center' : 'justify-start text-left'}`}
               >
                  {isEmpty ? (
                     '-----'
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
                  className={`flex items-center rounded-md bg-black p-2 text-center text-white ${isEmpty ? 'justify-center text-center' : 'justify-start text-left'}`}
               >
                  {isEmpty ? (
                     '-----'
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
