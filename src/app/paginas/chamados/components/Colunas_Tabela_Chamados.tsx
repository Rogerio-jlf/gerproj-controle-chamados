import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
// ====================
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '../../../../components/ui/tooltip';
// ====================
import StatusCell from './Cell_Status';
import AssuntoCellEditavel from './Cell_Assunto';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
import { formatarDataParaBR } from '../../../../utils/formatters';
// ====================
import { TabelaChamadosProps } from '../../../../types/types';
// ====================
import { FaDownload, FaTasks, FaBrain } from 'react-icons/fa';
import { IoCall } from 'react-icons/io5';
import { GrServicePlay } from 'react-icons/gr';
import { HiMiniSquaresPlus } from 'react-icons/hi2';
// ================================================================================

// 2. Atualizar a interface AcoesProps para incluir atribuição
export interface AcoesProps {
   onVisualizarChamado: (codChamado: number) => void;
   onVisualizarOS: (codChamado: number) => void;
   onVisualizarTarefas: () => void;
   onAtribuicaoInteligente?: (chamado: TabelaChamadosProps) => void;
   userType?: string;
   // MOVIDO PARA CÁ: função de atualizar assunto
   onUpdateAssunto?: (codChamado: number, novoAssunto: string) => Promise<void>;
}
// ====================

interface CircularActionsMenuProps {
   chamado: TabelaChamadosProps;
   acoes: AcoesProps;
}
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

   // Atualizar o array de botões de ação
   const allActionButtons = [
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
      // Botão de atribuição - só incluir se for ADM
      ...(acoes.userType === 'ADM'
         ? [
              {
                 icon: FaBrain,
                 onClick: () => {
                    acoes.onAtribuicaoInteligente?.(chamado);
                    setIsOpen(false);
                 },
                 tooltip: 'Atribuir Chamado',
                 bgColor: 'bg-white',
                 textColor: 'text-black',
                 hoverRing: 'hover:ring-cyan-500',
              },
           ]
         : []),
   ];

   const actionButtons = allActionButtons;
   const totalButtons = actionButtons.length;

   // Recalcular posições dos botões baseado no número total de botões
   const radius = 130;
   const angleStart = 140;
   const angleEnd = 240;
   const buttonPositions = Array.from({ length: totalButtons }).map((_, i) => {
      const angle =
         angleStart + ((angleEnd - angleStart) / (totalButtons - 1)) * i;
      const rad = (angle * Math.PI) / 180;
      return {
         x: Math.cos(rad) * radius,
         y: Math.sin(rad) * radius,
         delay: 0.08 * i,
      };
   });

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
   acoes: AcoesProps,
   userType?: string // Parâmetro opcional para tipo de usuário
): ColumnDef<TabelaChamadosProps>[] => {
   // Array base de colunas (sem a coluna de recurso)
   const baseColumns: ColumnDef<TabelaChamadosProps>[] = [
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
               onUpdateAssunto={acoes.onUpdateAssunto} // USA A FUNÇÃO PASSADA PELO COMPONENTE PAI
               onClose={() => {}}
            />
         ),
      },
      // =====

      // Status chamado (clicável) - ATUALIZADO PARA INCLUIR TAREFA
      {
         accessorKey: 'STATUS_CHAMADO',
         header: () => <div className="text-center">Status</div>,
         cell: ({ row }) => (
            <StatusCell
               status={row.original.STATUS_CHAMADO}
               codChamado={row.original.COD_CHAMADO}
               onUpdateStatus={async (
                  codChamado,
                  newStatus,
                  codClassificacao,
                  codTarefa
               ) => {
                  try {
                     const body: any = {
                        statusChamado: newStatus,
                        codChamado: codChamado.toString(),
                     };

                     if (newStatus === 'EM ATENDIMENTO' && codTarefa) {
                        body.codTarefa = codTarefa;
                     } else if (
                        newStatus !== 'EM ATENDIMENTO' &&
                        codClassificacao
                     ) {
                        body.codClassificacao = codClassificacao;
                     }

                     const response = await fetch(
                        `/api/atualizar-status-chamado/${codChamado}`,
                        {
                           method: 'POST',
                           headers: { 'Content-Type': 'application/json' },
                           body: JSON.stringify(body),
                        }
                     );

                     if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(
                           errorData.error || 'Erro ao atualizar Status'
                        );
                     }

                     row.original.STATUS_CHAMADO = newStatus;
                     if (codClassificacao) {
                        row.original.COD_CLASSIFICACAO = codClassificacao;
                     }
                     if (codTarefa) {
                        row.original.CODTRF_CHAMADO = codTarefa.toString();
                     }
                  } catch (err) {
                     console.error('Erro ao atualizar Status:', err);
                     throw err;
                  }
               }}
            />
         ),
      },
   ];

   // Adicionar após a coluna de status:
   const recursoColumn: ColumnDef<TabelaChamadosProps> = {
      accessorKey: 'NOME_RECURSO',
      header: () => <div className="text-center">Recurso</div>,
      cell: ({ row }) => {
         const recurso = row.original.NOME_RECURSO;
         const codRecurso = row.original.COD_RECURSO;

         if (codRecurso !== null && codRecurso !== undefined && recurso) {
            return (
               <div className="rounded-md bg-lime-500 p-2 text-center text-black ring-1 ring-white">
                  {corrigirTextoCorrompido(
                     recurso.split(' ').slice(0, 2).join(' ')
                  )}
               </div>
            );
         }

         return (
            <div className="rounded-md bg-orange-500 p-2 text-center text-black ring-1 ring-white">
               <span className="uppercase">Não atribuído</span>
            </div>
         );
      },
   };

   // Email chamado
   const finalColumns: ColumnDef<TabelaChamadosProps>[] = [
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

   // Montar array final de colunas condicionalmente
   const allColumns = [
      ...baseColumns,
      // Inclui a coluna de recurso apenas se for ADM
      ...(userType === 'ADM' || acoes.userType === 'ADM'
         ? [recursoColumn]
         : []),
      ...finalColumns,
   ];

   return allColumns;
};
