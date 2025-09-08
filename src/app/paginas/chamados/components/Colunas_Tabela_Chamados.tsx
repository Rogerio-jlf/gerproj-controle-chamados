import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
// ====================
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '@/components/ui/tooltip';
// ====================
import StatusCellClicavel from './Cell_Status';
import AssuntoCellEditavel from './Cell_Assunto';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
import { formatarDataParaBR } from '../../../../utils/formatters';
// ====================
import { FaDownload, FaTasks } from 'react-icons/fa';
import { IoCall } from 'react-icons/io5';
import { GrServicePlay } from 'react-icons/gr';
import { HiMiniSquaresPlus } from 'react-icons/hi2';

// 1. Importações adicionais
import { BotaoAtribuicaoCircular } from '../../../../components/Button_Atribuicao_Inteligente';
import { AlertTriangle, Brain, User } from 'lucide-react';
// ================================================================================

export interface ChamadosProps {
   COD_CHAMADO: number;
   DATA_CHAMADO: string;
   HORA_CHAMADO: string;
   CONCLUSAO_CHAMADO: string | null;
   STATUS_CHAMADO: string;
   DTENVIO_CHAMADO: string | null;
   COD_RECURSO: number;
   CODTRF_CHAMADO: string | null;
   COD_CLIENTE: number;
   ASSUNTO_CHAMADO: string;
   EMAIL_CHAMADO: string;
   PRIOR_CHAMADO: string;
   COD_CLASSIFICACAO: number;
   NOME_CLIENTE: string;
   NOME_RECURSO: string;
}
// ====================

// 2. Atualizar a interface AcoesProps para incluir atribuição
export interface AcoesProps {
   onVisualizarChamado: (codChamado: number) => void;
   onVisualizarOS: (codChamado: number) => void;
   onVisualizarTarefas: () => void;
   onUpdateAssunto?: (codChamado: number, novoAssunto: string) => Promise<void>;
   onAtribuicaoInteligente?: (chamado: ChamadosProps) => void; // Nova função
}
// ====================

interface CircularActionsMenuProps {
   chamado: ChamadosProps;
   acoes: AcoesProps;
}
// ================================================================================

export const getStylesStatus = (status: string | undefined) => {
   switch (status?.toUpperCase()) {
      case 'NAO FINALIZADO':
         return 'bg-yellow-600 text-white ring-1 ring-white';

      case 'EM ATENDIMENTO':
         return 'bg-blue-600 text-white ring-1 ring-white';

      case 'FINALIZADO':
         return 'bg-green-600 text-white ring-1 ring-white';

      case 'NAO INICIADO':
         return 'bg-red-600 text-white ring-1 ring-white';

      case 'STANDBY':
         return 'bg-orange-600 text-white ring-1 ring-white';

      case 'ATRIBUIDO':
         return 'bg-blue-600 text-white ring-1 ring-white';

      case 'AGUARDANDO VALIDACAO':
         return 'bg-purple-600 text-white ring-1 ring-white';

      default:
         return 'bg-gray-600 text-white ring-1 ring-white';
   }
};
// ================================================================================

// ===== MENU CIRCULAR AÇÕES =====
const CircularActionsMenu = ({ chamado, acoes }: CircularActionsMenuProps) => {
   // ===== ESTADOS =====
   const [isOpen, setIsOpen] = useState(false);
   const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });

   const handleDownload = () => {
      const blob = new Blob([JSON.stringify(chamado, null, 2)], {
         type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chamado_${chamado.COD_CHAMADO}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setIsOpen(false);
   };
   // ====================

   const handleToggle = (e: React.MouseEvent) => {
      if (!isOpen) {
         const rect = e.currentTarget.getBoundingClientRect();
         setButtonPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
         });
      }
      setIsOpen(!isOpen);
   };
   // ====================

   // Atualizar as posições dos botões para acomodar o novo botão
   const buttonPositions = [
      { x: -80, y: -70, delay: 0.0 }, // Visualizar Chamado
      { x: -90, y: -10, delay: 0.1 }, // Visualizar OS
      { x: -80, y: 50, delay: 0.15 }, // Visualizar Tarefas
      { x: -40, y: 95, delay: 0.2 }, // Download
      { x: 20, y: 95, delay: 0.25 }, // Atribuição IA (novo)
   ];
   // ====================

   // Atualizar o array de botões de ação
   const actionButtons = [
      {
         icon: IoCall,
         onClick: () => {
            acoes.onVisualizarChamado(chamado.COD_CHAMADO);
            setIsOpen(false);
         },
         tooltip: 'Visualizar Chamado',
         bgColor: 'bg-white',
         textColor: 'text-black',
         hoverRing: 'hover:ring-cyan-500',
      },
      {
         icon: GrServicePlay,
         onClick: () => {
            acoes.onVisualizarOS(chamado.COD_CHAMADO);
            setIsOpen(false);
         },
         tooltip: 'Visualizar OS',
         bgColor: 'bg-white',
         textColor: 'text-black',
         hoverRing: 'hover:ring-cyan-500',
      },
      {
         icon: FaTasks,
         onClick: () => {
            acoes.onVisualizarTarefas();
            setIsOpen(false);
         },
         tooltip: 'Visualizar Tarefa',
         bgColor: 'bg-white',
         textColor: 'text-black',
         hoverRing: 'hover:ring-cyan-500',
      },
      {
         icon: FaDownload,
         onClick: handleDownload,
         tooltip: 'Download Arquivos',
         bgColor: 'bg-white',
         textColor: 'text-black',
         hoverRing: 'hover:ring-cyan-500',
      },
      {
         icon: Brain,
         onClick: () => {
            acoes.onAtribuicaoInteligente?.(chamado);
            setIsOpen(false);
         },
         tooltip: 'Atribuição Inteligente',
         bgColor: 'bg-gradient-to-r from-purple-600 to-blue-600',
         textColor: 'text-white',
         hoverRing: 'hover:ring-purple-500',
      },
   ];
   // ====================

   return (
      <>
         {/* Botão Principal */}
         <div className="relative flex items-center justify-center">
            <motion.button
               onClick={handleToggle}
               className="relative z-10 inline-flex cursor-pointer items-center justify-center transition-all hover:scale-125 active:scale-95"
            >
               <motion.div animate={{ rotate: isOpen ? 135 : 0 }}>
                  {isOpen ? (
                     <HiMiniSquaresPlus size={32} />
                  ) : (
                     <HiMiniSquaresPlus size={32} />
                  )}
               </motion.div>
            </motion.button>
         </div>
         {/* ===== */}

         {/* Portal para os botões de ação - renderiza fora da célula */}
         <AnimatePresence>
            {isOpen && (
               <>
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="fixed inset-0 z-40"
                     onClick={() => setIsOpen(false)}
                  />

                  <div
                     className="pointer-events-none fixed z-50"
                     style={{
                        left: buttonPosition.x,
                        top: buttonPosition.y,
                        transform: 'translate(-50%, -50%)',
                     }}
                  >
                     {actionButtons.map((button, index) => (
                        <Tooltip key={index}>
                           <TooltipTrigger asChild>
                              <motion.button
                                 initial={{
                                    opacity: 0,
                                    scale: 0,
                                    x: 0,
                                    y: 0,
                                 }}
                                 animate={{
                                    opacity: 1,
                                    scale: 1,
                                    x: buttonPositions[index].x,
                                    y: buttonPositions[index].y,
                                 }}
                                 exit={{
                                    opacity: 0,
                                    scale: 0,
                                    x: 0,
                                    y: 0,
                                 }}
                                 transition={{
                                    duration: 0.3,
                                    delay: buttonPositions[index].delay,
                                    type: 'spring',
                                    stiffness: 200,
                                    damping: 20,
                                 }}
                                 onClick={button.onClick}
                                 className={`pointer-events-auto absolute inline-flex cursor-pointer items-center justify-center rounded-full p-4 ring-1 transition-all hover:scale-110 hover:ring-4 active:scale-95 ${button.bgColor} ${button.textColor} ${button.hoverRing}`}
                              >
                                 <button.icon size={18} />
                              </motion.button>
                           </TooltipTrigger>
                           <TooltipContent
                              side="left"
                              align="center"
                              sideOffset={8}
                              className="z-50 border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
                           >
                              {button.tooltip}
                           </TooltipContent>
                        </Tooltip>
                     ))}
                  </div>
               </>
            )}
         </AnimatePresence>
      </>
   );
};
// ================================================================================

// ===== COMPONENTE COLUNAS TABELA =====
export const colunasTabela = (
   acoes: AcoesProps
): ColumnDef<ChamadosProps>[] => [
   // Código chamado
   {
      accessorKey: 'COD_CHAMADO',
      header: () => <div className="text-center">Chamado</div>,
      cell: ({ getValue }) => (
         <div className="rounded-md bg-pink-600 p-2 text-center text-white ring-1 ring-white">
            {getValue() as string}
         </div>
      ),
   },
   // =====

   // Data chamado
   {
      accessorKey: 'DATA_CHAMADO',
      header: () => <div className="text-center">Data</div>,
      cell: ({ getValue }) => {
         const dateString = getValue() as string;
         const dataFormatada = formatarDataParaBR(dateString);

         return (
            <div className="rounded-md bg-blue-600 p-2 text-center text-white ring-1 ring-white">
               {dataFormatada}
            </div>
         );
      },
   },
   // =====

   // Assunto chamado (editável)
   {
      accessorKey: 'ASSUNTO_CHAMADO',
      header: () => <div className="text-center">Assunto</div>,
      cell: ({ row }) => (
         <AssuntoCellEditavel
            assunto={corrigirTextoCorrompido(row.original.ASSUNTO_CHAMADO)}
            codChamado={row.original.COD_CHAMADO}
            onUpdateAssunto={async (codChamado, novoAssunto) => {
               try {
                  const response = await fetch(
                     `/api/atualizar-assunto-chamado/${codChamado}`,
                     {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                           assuntoChamado: novoAssunto,
                           codChamado: codChamado.toString(),
                        }),
                     }
                  );

                  if (!response.ok) {
                     const errorData = await response.json();
                     throw new Error(
                        errorData.error || 'Erro ao atualizar Assunto'
                     );
                  }

                  row.original.ASSUNTO_CHAMADO = novoAssunto;
               } catch (err) {
                  console.error('Erro ao atualizar Assunto:', err);
                  throw err;
               }
            }}
            onClose={() => {}}
         />
      ),
   },
   // =====

   // Status chamado (clicável)
   {
      accessorKey: 'STATUS_CHAMADO',
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
         <StatusCellClicavel
            status={row.original.STATUS_CHAMADO}
            codChamado={row.original.COD_CHAMADO}
            onUpdateStatus={async (codChamado, newStatus) => {
               try {
                  const response = await fetch(
                     `/api/atualizar-status-chamado/${codChamado}`,
                     {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                           statusChamado: newStatus,
                           codChamado: codChamado.toString(),
                        }),
                     }
                  );

                  if (!response.ok) {
                     const errorData = await response.json();
                     throw new Error(
                        errorData.error || 'Erro ao atualizar Status'
                     );
                  }

                  row.original.STATUS_CHAMADO = newStatus;
               } catch (err) {
                  console.error('Erro ao atualizar Status:', err);
                  throw err;
               }
            }}
         />
      ),
   },

   // Adicionar após a coluna de status:
   {
      accessorKey: 'NOME_RECURSO',
      header: () => <div className="text-center">Recurso</div>,
      cell: ({ row }) => {
         const recurso = row.original.NOME_RECURSO;
         const codRecurso = row.original.COD_RECURSO;

         if (codRecurso && recurso) {
            return (
               <div className="flex items-center justify-center">
                  <div className="rounded-md bg-green-600 px-2 py-1 text-center text-white ring-1 ring-white">
                     <div className="flex items-center gap-2">
                        <User size={14} />
                        <span className="text-xs">{recurso}</span>
                     </div>
                  </div>
               </div>
            );
         }

         return (
            <div className="flex items-center justify-center">
               <div className="rounded-md bg-gray-600 px-2 py-1 text-center text-white ring-1 ring-white">
                  <div className="flex items-center gap-2">
                     <AlertTriangle size={14} />
                     <span className="text-xs">Não Atribuído</span>
                  </div>
               </div>
            </div>
         );
      },
   },

   // Email chamado
   {
      accessorKey: 'EMAIL_CHAMADO',
      header: () => <div className="text-center">Email</div>,
      cell: ({ getValue }) => {
         const value = getValue() as string;

         return (
            <div>
               {value ? (
                  <Link href={`mailto:${value}`} className="hover:underline">
                     <div className="">{value}</div>
                  </Link>
               ) : (
                  <div className="text-center">-</div>
               )}
            </div>
         );
      },
   },
   // =====

   // Ações
   {
      id: 'actions',
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
         const chamado = row.original;

         return <CircularActionsMenu chamado={chamado} acoes={acoes} />;
      },
   },
];
