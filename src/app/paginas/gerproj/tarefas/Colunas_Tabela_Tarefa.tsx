import { ColumnDef } from '@tanstack/react-table';
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '../../../../components/ui/tooltip';
// ================================================================================
import { TabelaTarefaProps } from '../../../../types/types';
// ================================================================================
import {
   formatarDataParaBR,
   formatarHorasTotaisHorasDecimais,
} from '../../../../utils/formatters';
// ================================================================================
import { GrServices } from 'react-icons/gr';
import { FaDownload, FaPhoneAlt, FaHandPointUp } from 'react-icons/fa';

// ================================================================================
// INTERFACES
// ================================================================================
interface BotoesAcaoProps {
   openTabelaOSTarefa?: (codTarefa: number) => void;
   openTabelaChamadosTarefa?: (codTarefa: number) => void;
   openModalApontamentoOSTarefa?: (tarefa: TabelaTarefaProps) => void;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export const colunasTabelaTarefa = (
   props?: BotoesAcaoProps
): ColumnDef<TabelaTarefaProps>[] => [
   // Tarefa completa
   {
      accessorKey: 'TAREFA_COMPLETA',
      header: () => <div className="text-center">Tarefa</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         const isEmpty = !value;
         return (
            <div
               className={`flex items-center rounded-md bg-black p-2 text-white ${isEmpty ? 'justify-center text-center' : 'justify-start pl-2 text-left'}`}
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
               className={`flex items-center rounded-md bg-black p-2 text-white ${isEmpty ? 'justify-center text-center' : 'justify-start pl-2 text-left'}`}
            >
               {isEmpty ? (
                  '-'
               ) : (
                  <span className="block w-full truncate">{value}</span>
               )}
            </div>
         );
      },
   },
   // ==========

   // Nome do recurso
   {
      accessorKey: 'NOME_RECURSO',
      header: () => <div className="text-center">Consultor</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         const isEmpty = !value;
         // Mostra apenas os dois primeiros nomes
         const nomes = value?.split(' ').slice(0, 2).join(' ');
         return (
            <div
               className={`flex items-center rounded-md bg-black p-2 text-white ${isEmpty ? 'justify-center text-center' : 'justify-start pl-2 text-left'}`}
            >
               {isEmpty ? (
                  '-'
               ) : (
                  <span className="block w-full truncate">{nomes}</span>
               )}
            </div>
         );
      },
   },
   // ==========

   // Nome do cliente
   {
      accessorKey: 'NOME_CLIENTE',
      header: () => <div className="text-center">Cliente</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         const isEmpty = !value;
         const nomes = value?.split(' ').slice(0, 2).join(' ');

         return (
            <div
               className={`flex items-center rounded-md bg-black p-2 text-white ${isEmpty ? 'justify-center text-center' : 'justify-start pl-2 text-left'}`}
            >
               {isEmpty ? (
                  '-'
               ) : (
                  <span className="block w-full truncate">{nomes}</span>
               )}
            </div>
         );
      },
   },
   // ==========

   // Data de solicitação
   {
      accessorKey: 'DTSOL_TAREFA',
      header: () => <div className="text-center">Data Solicitação</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         const dataFormatada = formatarDataParaBR(value);

         return (
            <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
               {dataFormatada || '-'}
            </div>
         );
      },
   },
   // ==========

   // Data de aprovação
   {
      accessorKey: 'DTAPROV_TAREFA',
      header: () => <div className="text-center">Data Aprovação</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         const dataFormatada = formatarDataParaBR(value);

         return (
            <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
               {dataFormatada || '-'}
            </div>
         );
      },
   },
   // ==========

   // Data de prevenção
   {
      accessorKey: 'DTPREVENT_TAREFA',
      header: () => <div className="text-center">Data Prevenção</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         const dataFormatada = formatarDataParaBR(value);

         return (
            <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
               {dataFormatada || '-'}
            </div>
         );
      },
   },
   // ==========

   // Horas estipuladas
   {
      accessorKey: 'HREST_TAREFA',
      header: () => <div className="text-center">Hora Estipulada</div>,
      cell: ({ getValue }) => {
         const value = getValue() as number;
         const tempoFormatado = formatarHorasTotaisHorasDecimais(value);

         return (
            <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
               {tempoFormatado || '-'}h
            </div>
         );
      },
   },
   // ==========

   // Status
   {
      accessorKey: 'STATUS_TAREFA',
      header: () => <div className="text-center">Status</div>,
      cell: ({ getValue }) => {
         const value = getValue() as number;

         return (
            <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
               {value || '-'}
            </div>
         );
      },
   },
   // ==========

   // Data de inclusão
   {
      accessorKey: 'DTINC_TAREFA',
      header: () => <div className="text-center">Data Inclusão</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         const dataFormatada = formatarDataParaBR(value);

         return (
            <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
               {dataFormatada || '-'}
            </div>
         );
      },
   },
   // ==========

   // Fatura tarefa
   {
      accessorKey: 'FATURA_TAREFA',
      header: () => <div className="text-center">Fatura</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;

         // Se não tem função de update, renderiza como antes (somente leitura)
         const valueUpper = value?.toUpperCase();
         let bgColor = 'bg-gray-400';
         if (valueUpper === 'SIM') bgColor = 'bg-blue-600 text-white';
         else if (valueUpper === 'NAO') bgColor = 'bg-red-600 text-white';

         return (
            <div
               className={`flex items-center ${bgColor} justify-center rounded-md p-2 text-center`}
            >
               {valueUpper || '-'}
            </div>
         );
      },
   },
   // ==========

   // Botões de ação
   // {
   //    id: 'actions',
   //    header: () => <div className="text-center">Ações</div>,
   //    cell: ({ row }) => {
   //       const tarefa = row.original;

   //       const handleDownload = () => {
   //          const blob = new Blob([JSON.stringify(tarefa, null, 2)], {
   //             type: 'application/json',
   //          });
   //          const url = URL.createObjectURL(blob);
   //          const a = document.createElement('a');
   //          a.href = url;
   //          a.download = `tarefa_${tarefa.COD_TAREFA}.json`;
   //          a.click();
   //          URL.revokeObjectURL(url);
   //       };
   //       // =====

   //       const handleOpenTabelaOSTarefa = () => {
   //          if (props?.openTabelaOSTarefa) {
   //             props.openTabelaOSTarefa(tarefa.COD_TAREFA);
   //          }
   //       };
   //       // =====

   //       const handleOpenTabelaChamadosTarefa = () => {
   //          if (props?.openTabelaChamadosTarefa) {
   //             props.openTabelaChamadosTarefa(tarefa.COD_TAREFA);
   //          }
   //       };
   //       // =====

   //       const handleOpenModalApontamentoOSTarefa = () => {
   //          if (props?.openModalApontamentoOSTarefa) {
   //             props.openModalApontamentoOSTarefa(tarefa);
   //          }
   //       };
   //       // =====

   //       // ================================================================================
   //       // RENDERIZAÇÃO
   //       // ================================================================================
   //       return (
   //          <div className="flex items-center justify-center gap-4">
   //             {/* Botão download */}
   //             <Tooltip>
   //                <TooltipTrigger asChild>
   //                   <button
   //                      onClick={handleDownload}
   //                      className="cursor-pointer transition-all hover:scale-125 active:scale-95"
   //                   >
   //                      <FaDownload size={24} />
   //                   </button>
   //                </TooltipTrigger>
   //                <TooltipContent
   //                   side="left"
   //                   align="end"
   //                   sideOffset={8}
   //                   className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black shadow-lg shadow-black select-none"
   //                >
   //                   Baixar Arquivos
   //                </TooltipContent>
   //             </Tooltip>
   //             {/* ========== */}

   //             {/* Botão visualizar OS */}
   //             <Tooltip>
   //                <TooltipTrigger asChild>
   //                   <button
   //                      onClick={handleOpenTabelaOSTarefa}
   //                      className="cursor-pointer transition-all hover:scale-125 active:scale-95"
   //                   >
   //                      <GrServices size={24} />
   //                   </button>
   //                </TooltipTrigger>
   //                <TooltipContent
   //                   side="left"
   //                   align="center"
   //                   sideOffset={8}
   //                   className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black shadow-lg shadow-black select-none"
   //                >
   //                   Visualizar OS's
   //                </TooltipContent>
   //             </Tooltip>
   //             {/* ========== */}

   //             {/* Botão visualizar chamados */}
   //             <Tooltip>
   //                <TooltipTrigger asChild>
   //                   <button
   //                      onClick={handleOpenTabelaChamadosTarefa}
   //                      className="cursor-pointer transition-all hover:scale-125 active:scale-95"
   //                   >
   //                      <FaPhoneAlt size={24} />
   //                   </button>
   //                </TooltipTrigger>
   //                <TooltipContent
   //                   side="left"
   //                   align="end"
   //                   sideOffset={8}
   //                   className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black shadow-lg shadow-black select-none"
   //                >
   //                   Visualizar Chamados
   //                </TooltipContent>
   //             </Tooltip>
   //             {/* ========== */}

   //             {/* Botão apontamento */}
   //             <Tooltip>
   //                <TooltipTrigger asChild>
   //                   <button
   //                      onClick={handleOpenModalApontamentoOSTarefa}
   //                      className="cursor-pointer transition-all hover:scale-125 active:scale-95"
   //                   >
   //                      <FaHandPointUp size={24} />
   //                   </button>
   //                </TooltipTrigger>
   //                <TooltipContent
   //                   side="left"
   //                   align="end"
   //                   sideOffset={8}
   //                   className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black shadow-lg shadow-black select-none"
   //                >
   //                   Efetuar Apontamento
   //                </TooltipContent>
   //             </Tooltip>
   //             {/* ========== */}
   //          </div>
   //       );
   //    },
   // },
];
