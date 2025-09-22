import { ColumnDef } from '@tanstack/react-table';
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '@/components/ui/tooltip';
// ================================================================================
import { corrigirTextoCorrompido } from '../../../../../lib/corrigirTextoCorrompido';
import {
   formatarDataParaBR,
   formatarDecimalParaTempo,
} from '../../../../../utils/formatters';
// ================================================================================
import { FaHandPointUp } from 'react-icons/fa';
import { FaDownload, FaPhoneAlt, FaThList } from 'react-icons/fa';
// ================================================================================
// ================================================================================

export interface TarefasProps {
   COD_TAREFA: number;
   NOME_TAREFA: string;
   CODREC_TAREFA: number;
   DTSOL_TAREFA: string;
   HREST_TAREFA: number;
   codChamado?: number;
}

export interface ChamadosProps {
   COD_CHAMADO: number;
   DATA_CHAMADO: string;
   STATUS_CHAMADO: string; // ← Mudou de number para string
   CODTRF_CHAMADO: number;
   COD_CLIENTE: number;
   ASSUNTO_CHAMADO: string;
   NOME_TAREFA: string;
   NOME_CLIENTE: string;
}

// Interface para as props das colunas
interface ColunasProps {
   visualizarOSTarefa?: (codTarefa: number) => void;
   visualizarChamadosTarefa?: (codTarefa: number) => void;
   onCriarOS?: (tarefa: TarefasProps) => void; // ✅ Alterado
}
// ================================================================================

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

export const colunasTabela = (
   props?: ColunasProps
): ColumnDef<TarefasProps>[] => [
   // código da tarefa
   {
      accessorKey: 'COD_TAREFA',
      header: () => <div className="text-center">Código</div>,
      cell: ({ getValue }) => (
         <div className="rounded-md bg-slate-900 p-2 text-center text-white">
            {getValue() as string}
         </div>
      ),
   },

   // nome da tarefa
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

   // data de solicitação
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

   // horas restantes
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

   // ações
   {
      id: 'actions',
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
         const tarefa = row.original;
         const chamado = row.original;

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

         const handleVisualizarOS = () => {
            if (props?.visualizarOSTarefa) {
               props.visualizarOSTarefa(tarefa.COD_TAREFA);
            }
         };

         const handleAbrirChamados = () => {
            if (props?.visualizarChamadosTarefa) {
               props.visualizarChamadosTarefa(tarefa.COD_TAREFA);
            }
         };

         const handleCriarOS = () => {
            if (props?.onCriarOS) {
               props.onCriarOS(tarefa);
            }
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

               {/* Botão Visualizar OS */}
               <Tooltip>
                  <TooltipTrigger asChild>
                     <button
                        onClick={handleVisualizarOS}
                        className="cursor-pointer transition-all hover:-translate-y-1 hover:scale-102 active:scale-95"
                     >
                        <FaThList size={24} />
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

               {/* Botão visualizar chamados */}
               <Tooltip>
                  <TooltipTrigger asChild>
                     <button
                        onClick={handleAbrirChamados}
                        className="cursor-pointer transition-all hover:-translate-y-1 hover:scale-102 active:scale-95"
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

               {/* BOTÃO CRIAR OS */}
               <Tooltip>
                  <TooltipTrigger asChild>
                     <button
                        onClick={handleCriarOS}
                        className="cursor-pointer transition-all hover:-translate-y-1 hover:scale-102 active:scale-95"
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
            </div>
         );
      },
   },
];
