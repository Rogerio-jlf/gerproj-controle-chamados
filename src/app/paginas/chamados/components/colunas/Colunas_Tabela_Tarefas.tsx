import { ColumnDef } from '@tanstack/react-table';
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '../../../../../components/ui/tooltip';
// ================================================================================
import { TabelaTarefaProps } from '../../../../../types/types';
// ================================================================================
import { corrigirTextoCorrompido } from '../../../../../lib/corrigirTextoCorrompido';
import {
   formatarDataParaBR,
   formatarDecimalParaTempo,
} from '../../../../../utils/formatters';
// ================================================================================
import { GrServices } from 'react-icons/gr';
import { FaDownload, FaPhoneAlt, FaHandPointUp } from 'react-icons/fa';

// ================================================================================
// INTERFACES
// ================================================================================
interface BotoesAcaoProps {
   visualizarOSTarefa?: (codTarefa: number) => void;
   visualizarChamadosTarefa?: (codTarefa: number) => void;
   apontamentoTarefa?: (tarefa: TabelaTarefaProps) => void;
}
// ==============================

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export const colunasTabelaTarefas = (
   props?: BotoesAcaoProps
): ColumnDef<TabelaTarefaProps>[] => [
   // Código da tarefa
   {
      accessorKey: 'COD_TAREFA',
      header: () => <div className="text-center">Código</div>,
      cell: ({ getValue }) => (
         <div className="rounded-md bg-slate-900 p-2 text-center text-white">
            {getValue() as string}
         </div>
      ),
   },

   // Nome da tarefa
   {
      accessorKey: 'NOME_TAREFA',
      header: () => <div className="text-center">Tarefa</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;
         const textoCorrigido = corrigirTextoCorrompido(value);

         return (
            <div className="truncate px-2 py-1">
               {corrigirTextoCorrompido(textoCorrigido || '-')}
            </div>
         );
      },
   },

   // Data de solicitação da tarefa
   {
      accessorKey: 'DTSOL_TAREFA',
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

   // Horas estipuladas para a tarefa
   {
      accessorKey: 'HREST_TAREFA',
      header: () => <div className="text-center">HR's Estipuladas</div>,
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

   // Botões de ação
   {
      id: 'actions',
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
         const tarefa = row.original;

         const handleDownload = () => {
            const blob = new Blob([JSON.stringify(tarefa, null, 2)], {
               type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tarefa_${tarefa.COD_TAREFA}.json`;
            a.click();
            URL.revokeObjectURL(url);
         };
         // =====

         const handleOpenTabelaOSTarefa = () => {
            if (props?.visualizarOSTarefa) {
               props.visualizarOSTarefa(tarefa.COD_TAREFA);
            }
         };
         // =====

         const handleOpenChamadosTarefa = () => {
            if (props?.visualizarChamadosTarefa) {
               props.visualizarChamadosTarefa(tarefa.COD_TAREFA);
            }
         };
         // =====

         const handleApontamentoTarefa = () => {
            if (props?.apontamentoTarefa) {
               props.apontamentoTarefa(tarefa);
            }
         };
         // =====

         return (
            <div className="flex items-center justify-center gap-4">
               {/* Botão download */}
               <Tooltip>
                  <TooltipTrigger asChild>
                     <button
                        onClick={handleDownload}
                        className="cursor-pointer transition-all hover:scale-125 active:scale-95"
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
               {/* ========== */}

               {/* Botão visualizar OS */}
               <Tooltip>
                  <TooltipTrigger asChild>
                     <button
                        onClick={handleOpenTabelaOSTarefa}
                        className="cursor-pointer transition-all hover:scale-125 active:scale-95"
                     >
                        <GrServices size={24} />
                     </button>
                  </TooltipTrigger>
                  <TooltipContent
                     side="left"
                     align="center"
                     sideOffset={8}
                     className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black shadow-lg shadow-black select-none"
                  >
                     Visualizar OS's
                  </TooltipContent>
               </Tooltip>
               {/* ========== */}

               {/* Botão visualizar chamados */}
               <Tooltip>
                  <TooltipTrigger asChild>
                     <button
                        onClick={handleOpenChamadosTarefa}
                        className="cursor-pointer transition-all hover:scale-125 active:scale-95"
                     >
                        <FaPhoneAlt size={24} />
                     </button>
                  </TooltipTrigger>
                  <TooltipContent
                     side="left"
                     align="end"
                     sideOffset={8}
                     className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black shadow-lg shadow-black select-none"
                  >
                     Visualizar Chamados
                  </TooltipContent>
               </Tooltip>
               {/* ========== */}

               {/* Botão apontamento */}
               <Tooltip>
                  <TooltipTrigger asChild>
                     <button
                        onClick={handleApontamentoTarefa}
                        className="cursor-pointer transition-all hover:scale-125 active:scale-95"
                     >
                        <FaHandPointUp size={24} />
                     </button>
                  </TooltipTrigger>
                  <TooltipContent
                     side="left"
                     align="end"
                     sideOffset={8}
                     className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black shadow-lg shadow-black select-none"
                  >
                     Efetuar Apontamento
                  </TooltipContent>
               </Tooltip>
               {/* ========== */}
            </div>
         );
      },
   },
];
