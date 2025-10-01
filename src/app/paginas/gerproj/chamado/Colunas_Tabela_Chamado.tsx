import Link from 'next/link';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { motion, AnimatePresence } from 'framer-motion';
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '../../../../components/ui/tooltip';
// ================================================================================
import { TabelaChamadoProps } from '../../../../types/types';
// ================================================================================
import {
   formatarDataParaBR,
   formatCodChamado,
} from '../../../../utils/formatters';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
import StatusApontamentoChamado from './Modal_Atualizar_Status_Apontar_Os_Chamado';
// ================================================================================
import { IoCall } from 'react-icons/io5';
import { GrServices } from 'react-icons/gr';
import { HiMiniSquaresPlus } from 'react-icons/hi2';
import { RiDeleteBin5Fill } from 'react-icons/ri';
import { FaDownload, FaTasks, FaBrain } from 'react-icons/fa';

// ================================================================================
// INTERFACES
// ================================================================================
interface AcoesTabelaChamadosProps {
   onVisualizarChamado: (codChamado: number) => void;
   onVisualizarOSChamado: (codChamado: number) => void;
   onVisualizarOS: () => void;
   onVisualizarTarefas: () => void;
   onAtribuicaoInteligente: (chamado: TabelaChamadoProps) => void;
   onUpdateStatus?: (
      codChamado: number,
      newStatus: string,
      codClassificacao?: number,
      codTarefa?: number
   ) => Promise<void>;
   onOpenApontamentos?: (codChamado: number, newStatus: string) => void;
   onExcluirChamado: (codChamado: number) => void;
   userType?: string;
}

interface BotaoCircularMenuProps {
   chamado: TabelaChamadoProps;
   acoes: AcoesTabelaChamadosProps;
}

// ================================================================================
// BOTÃO DELETE SEPARADO
// ================================================================================
const BotaoDelete = ({ chamado, acoes }: BotaoCircularMenuProps) => {
   const handleDeleteClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      acoes.onExcluirChamado(chamado.COD_CHAMADO);
   };

   return (
      <div className="relative flex items-center justify-center rounded-lg bg-red-600 p-2 text-center text-white">
         <button
            onClick={handleDeleteClick}
            className="cursor-pointer transition-all hover:scale-150 focus:outline-none active:scale-95"
         >
            <RiDeleteBin5Fill size={24} className="text-white" />
         </button>
      </div>
   );
};

// ==============================

// ================================================================================
// BOTÃO MENU CIRCULAR
// ================================================================================
const BotaoMenuCircular = ({ chamado, acoes }: BotaoCircularMenuProps) => {
   const [isOpen, setIsOpen] = useState(false);
   const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
   const [hoveredButton, setHoveredButton] = useState<number | null>(null);

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

   // Configuração melhorada dos botões com cores e estilos únicos
   const allActionButtons = [
      {
         icon: IoCall,
         onClick: () => {
            acoes.onVisualizarChamado(chamado.COD_CHAMADO);
            setIsOpen(false);
         },
         tooltip: 'Visualizar Chamado',
         bgGradient: 'from-blue-500 to-blue-600',
         hoverGradient: 'from-blue-600 to-blue-700',
         iconColor: 'text-white',
         shadowColor: 'shadow-blue-300/50',
         hoverShadow: 'hover:shadow-blue-400/60',
         ringColor: 'hover:ring-blue-300/40',
      },
      {
         icon: GrServices,
         onClick: () => {
            acoes.onVisualizarOSChamado(chamado.COD_CHAMADO);
            setIsOpen(false);
         },
         tooltip: "Visualizar OS's",
         bgGradient: 'from-emerald-500 to-emerald-600',
         hoverGradient: 'from-emerald-600 to-emerald-700',
         iconColor: 'text-white',
         shadowColor: 'shadow-emerald-300/50',
         hoverShadow: 'hover:shadow-emerald-400/60',
         ringColor: 'hover:ring-emerald-300/40',
      },
      {
         icon: FaTasks,
         onClick: () => {
            acoes.onVisualizarTarefas();
            setIsOpen(false);
         },
         tooltip: 'Visualizar Tarefas',
         bgGradient: 'from-orange-500 to-orange-600',
         hoverGradient: 'from-orange-600 to-orange-700',
         iconColor: 'text-white',
         shadowColor: 'shadow-orange-300/50',
         hoverShadow: 'hover:shadow-orange-400/60',
         ringColor: 'hover:ring-orange-300/40',
      },
      {
         icon: FaDownload,
         onClick: handleDownload,
         tooltip: "Download Arquivo's",
         bgGradient: 'from-purple-500 to-purple-600',
         hoverGradient: 'from-purple-600 to-purple-700',
         iconColor: 'text-white',
         shadowColor: 'shadow-purple-300/50',
         hoverShadow: 'hover:shadow-purple-400/60',
         ringColor: 'hover:ring-purple-300/40',
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
                 bgGradient: 'from-pink-500 to-pink-600',
                 hoverGradient: 'from-pink-600 to-pink-700',
                 iconColor: 'text-white',
                 shadowColor: 'shadow-pink-300/50',
                 hoverShadow: 'hover:shadow-pink-400/60',
                 ringColor: 'hover:ring-pink-300/40',
              },
           ]
         : []),
   ];

   const actionButtons = allActionButtons;
   const totalButtons = actionButtons.length;

   // Recalcular posições dos botões
   const radius = 140;
   const angleStart = 140;
   const angleEnd = 240;
   const buttonPositions = Array.from({ length: totalButtons }).map((_, i) => {
      const angle =
         angleStart + ((angleEnd - angleStart) / (totalButtons - 1)) * i;
      const rad = (angle * Math.PI) / 180;
      return {
         x: Math.cos(rad) * radius,
         y: Math.sin(rad) * radius,
         delay: 0.1 * i,
      };
   });

   return (
      <>
         {/* Botão Principal Melhorado */}
         <div className="relative flex items-center justify-center rounded-lg bg-slate-900 p-2 text-center text-white">
            <button
               onClick={handleToggle}
               className="cursor-pointer transition-all hover:scale-150 focus:outline-none active:scale-95"
            >
               {isOpen ? (
                  <span className="text-xl font-bold">×</span>
               ) : (
                  <HiMiniSquaresPlus size={24} />
               )}
            </button>
         </div>

         {/* Portal para os botões de ação */}
         <AnimatePresence>
            {isOpen && (
               <>
                  {/* Overlay de fundo */}
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="fixed inset-0 z-40 bg-black/60"
                     onClick={() => setIsOpen(false)}
                  />

                  {/* Container dos botões de ação */}
                  <div
                     className="pointer-events-none fixed z-50"
                     style={{
                        left: buttonPosition.x,
                        top: buttonPosition.y,
                        transform: 'translate(-50%, -50%)',
                     }}
                  >
                     {actionButtons.map((button, index) => {
                        const isHovered = hoveredButton === index;

                        return (
                           <div key={index} className="relative">
                              {/* Tooltip melhorado */}
                              <motion.div
                                 className={`pointer-events-none absolute -top-14 left-1/2 z-60 -translate-x-1/2 transform rounded-md border-t-4 border-cyan-500 bg-black px-6 py-2 text-sm font-semibold tracking-wider whitespace-nowrap text-white shadow-sm shadow-white`}
                                 initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                 animate={{
                                    opacity: isHovered ? 1 : 0,
                                    scale: isHovered ? 1 : 0.8,
                                    y: isHovered ? 0 : 10,
                                 }}
                                 transition={{ duration: 0.2 }}
                              >
                                 {button.tooltip}
                                 <div className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-t-4 border-r-4 border-l-4 border-transparent border-t-slate-900" />
                              </motion.div>

                              {/* Botão de ação melhorado */}
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
                                    duration: 0.4,
                                    delay: buttonPositions[index].delay,
                                    type: 'spring',
                                    stiffness: 260,
                                    damping: 20,
                                 }}
                                 whileHover={{
                                    scale: 1.1,
                                    transition: { duration: 0.2 },
                                 }}
                                 whileTap={{ scale: 0.95 }}
                                 onClick={button.onClick}
                                 onHoverStart={() => setHoveredButton(index)}
                                 onHoverEnd={() => setHoveredButton(null)}
                                 className={`pointer-events-auto absolute h-14 w-14 rounded-full bg-gradient-to-br ${isHovered ? button.hoverGradient : button.bgGradient} ${button.iconColor} shadow-lg ${button.shadowColor} ${button.hoverShadow} border-2 border-white/20 ${button.ringColor} flex items-center justify-center backdrop-blur-sm transition-all duration-300 ease-out ${isHovered ? 'ring-4' : 'ring-0'} -translate-x-1/2 -translate-y-1/2 transform`}
                              >
                                 <button.icon size={20} />
                              </motion.button>

                              {/* Efeito de pulso animado no hover */}
                              <AnimatePresence>
                                 {isHovered && (
                                    <motion.div
                                       className={`absolute h-14 w-14 rounded-full bg-gradient-to-br ${button.bgGradient} pointer-events-none -translate-x-1/2 -translate-y-1/2 transform opacity-30`}
                                       style={{
                                          x: buttonPositions[index].x,
                                          y: buttonPositions[index].y,
                                       }}
                                       initial={{ scale: 1, opacity: 0.3 }}
                                       animate={{
                                          scale: [1, 1.3, 1],
                                          opacity: [0.3, 0, 0.3],
                                       }}
                                       exit={{ opacity: 0 }}
                                       transition={{
                                          duration: 1.5,
                                          repeat: Infinity,
                                          ease: 'easeInOut',
                                       }}
                                    />
                                 )}
                              </AnimatePresence>
                           </div>
                        );
                     })}
                  </div>
               </>
            )}
         </AnimatePresence>
      </>
   );
};
// ==============================

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export const colunasTabelaChamados = (
   acoes: AcoesTabelaChamadosProps,
   userType?: string
): ColumnDef<TabelaChamadoProps>[] => {
   // Array base de colunas (sem a coluna de recurso)
   const baseColumns: ColumnDef<TabelaChamadoProps>[] = [
      // Chamado
      {
         accessorKey: 'COD_CHAMADO',
         header: () => <div className="text-center">Chamado</div>,
         cell: ({ getValue }) => {
            const value = getValue() as number;
            return (
               <div className="flex items-center justify-center rounded-sm border border-white/40 bg-slate-950 py-2 text-center font-bold text-white">
                  {formatCodChamado(value) || '-----'}
               </div>
            );
         },
      },
      // ==========

      // Data chamado
      {
         accessorKey: 'DATA_CHAMADO',
         header: () => <div className="text-center">DT. Chamado</div>,
         cell: ({ getValue }) => {
            const value = getValue() as string;
            const dataFormatada = formatarDataParaBR(value);

            return (
               <div className="flex items-center justify-center rounded-sm border border-white/40 bg-slate-950 py-2 text-center font-bold text-white">
                  {dataFormatada || '----------'}
               </div>
            );
         },
      },
      // ==========

      // Assunto
      {
         accessorKey: 'ASSUNTO_CHAMADO',
         header: () => <div className="text-center">Assunto</div>,
         cell: ({ getValue }) => {
            const value = getValue() as string;
            const isEmpty = !value;
            return (
               <div
                  className={`flex items-center rounded-sm border border-white/40 bg-slate-950 py-2 font-bold text-white ${isEmpty ? 'justify-center text-center' : 'justify-start pl-6 text-left'}`}
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

      // Status (clicável)
      {
         accessorKey: 'STATUS_CHAMADO',
         header: () => <div className="text-center">Status</div>,
         cell: ({ row }) => (
            <StatusApontamentoChamado
               status={row.original.STATUS_CHAMADO}
               codChamado={row.original.COD_CHAMADO}
               nomeCliente={row.original.NOME_CLIENTE ?? '-'}
               onUpdateSuccess={() => {}}
            />
         ),
      },
      // ==========

      // Data Atribuição
      {
         accessorKey: 'DTENVIO_CHAMADO',
         header: () => <div className="text-center">DT. Atribuição</div>,
         cell: ({ getValue }) => {
            const value = getValue() as string;
            const dataFormatada = formatarDataParaBR(value);

            if (
               dataFormatada !== null &&
               dataFormatada !== undefined &&
               dataFormatada !== '-'
            ) {
               return (
                  <div className="flex items-center justify-center rounded-sm border border-white/40 bg-slate-900 py-2 text-center font-bold text-white">
                     {dataFormatada}
                  </div>
               );
            }
            return (
               <div className="flex items-center justify-center rounded-sm border border-slate-900 bg-yellow-500 py-2 text-center font-bold text-black uppercase">
                  Não atribuído
               </div>
            );
         },
      },
   ];
   // ==========

   // Coluna
   const recursoColumn: ColumnDef<TabelaChamadoProps> = {
      accessorKey: 'NOME_RECURSO',
      header: () => <div className="text-center">Consultor</div>,
      cell: ({ row }) => {
         const recurso = row.original.NOME_RECURSO;
         const codRecurso = row.original.COD_RECURSO;

         if (codRecurso !== null && codRecurso !== undefined && recurso) {
            return (
               <div className="flex items-center rounded-sm border border-white/40 bg-slate-900 py-2 pl-6 text-left font-bold text-white">
                  {corrigirTextoCorrompido(
                     recurso.split(' ').slice(0, 2).join(' ')
                  )}
               </div>
            );
         }

         return (
            <div className="flex items-center justify-center rounded-sm border border-slate-900 bg-yellow-500 py-2 text-center font-bold text-black uppercase">
               Não atribuído
            </div>
         );
      },
   };

   // Colunas finais
   const finalColumns: ColumnDef<TabelaChamadoProps>[] = [
      // Email
      {
         accessorKey: 'EMAIL_CHAMADO',
         header: () => <div className="text-center">Email</div>,
         cell: ({ getValue }) => {
            const value = getValue() as string;
            const isEmpty = !value;

            return (
               <Link
                  href={`mailto:${value}`}
                  className={`flex items-center rounded-sm border border-white/40 bg-slate-900 py-2 font-bold text-white ${isEmpty ? 'justify-center text-center' : 'justify-start pl-6 text-left'}`}
               >
                  {isEmpty ? (
                     '------------------------------'
                  ) : (
                     <span className="block w-full truncate">{value}</span>
                  )}
               </Link>
            );
         },
      },
      // ==========

      // Ações - MODIFICADO PARA INCLUIR BOTÃO DELETE (APENAS PARA ADM)
      {
         id: 'actions',
         header: () => <div className="text-center">Ações</div>,
         cell: ({ row }) => {
            const chamado = row.original;
            return (
               <div className="flex items-center justify-center gap-3">
                  {/* Botão Delete - Apenas para ADM */}
                  {(userType === 'ADM' || acoes.userType === 'ADM') && (
                     <BotaoDelete chamado={chamado} acoes={acoes} />
                  )}

                  {/* Menu Circular */}
                  <BotaoMenuCircular chamado={chamado} acoes={acoes} />
               </div>
            );
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
