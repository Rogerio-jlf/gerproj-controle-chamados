import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
// ================================================================================
import { TabelaChamadoProps } from '../../../../types/types';
// ================================================================================
import {
   formatarDataParaBR,
   formatCodChamado,
} from '../../../../utils/formatters';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
import { ModalAtualizarStatusApontarOsChamado } from './Modal_Atualizar_Status_Apontar_Os_Chamado';
// ================================================================================
import { HiMiniSquaresPlus } from 'react-icons/hi2';
import { IoClose } from 'react-icons/io5';
import { FaEye } from 'react-icons/fa6';
import { RiDeleteBin6Fill } from 'react-icons/ri';
import { FaUserCheck } from 'react-icons/fa';

// ================================================================================
// INTERFACES
// ================================================================================
interface AcoesTabelaChamadosProps {
   onVisualizarChamado: (codChamado: number) => void;
   onVisualizarOSChamado: (codChamado: number) => void;
   onVisualizarOS: () => void;
   onVisualizarTarefa: () => void;
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

interface DropdownMenuProps {
   chamado: TabelaChamadoProps;
   acoes: AcoesTabelaChamadosProps;
}

// ================================================================================
// BOTÃO MENU CIRCULAR - HORIZONTAL À ESQUERDA
// ================================================================================
const BotaoMenuCircular = ({ chamado, acoes }: DropdownMenuProps) => {
   const [isOpen, setIsOpen] = useState(false);
   const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
   const [hoveredButton, setHoveredButton] = useState<number | null>(null);

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

   // Configuração dos botões com cores e estilos únicos
   const allActionButtons = [
      {
         icon: FaEye,
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
      // Botão de atribuição - só incluir se for ADM
      ...(acoes.userType === 'ADM'
         ? [
              {
                 icon: FaUserCheck,
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
              {
                 icon: RiDeleteBin6Fill,
                 onClick: () => {
                    acoes.onExcluirChamado(chamado.COD_CHAMADO);
                    setIsOpen(false);
                 },
                 tooltip: 'Excluir Chamado',
                 bgGradient: 'from-red-500 to-red-600',
                 hoverGradient: 'from-red-600 to-red-700',
                 iconColor: 'text-white',
                 shadowColor: 'shadow-red-300/50',
                 hoverShadow: 'hover:shadow-red-400/60',
                 ringColor: 'hover:ring-red-300/40',
              },
           ]
         : []),
   ];

   const actionButtons = allActionButtons;
   const totalButtons = actionButtons.length;

   // Posições horizontais à esquerda - MESMA ALTURA
   const spacing = 70; // Espaçamento entre botões
   const buttonPositions = Array.from({ length: totalButtons }).map((_, i) => ({
      x: -(spacing * (i + 1)), // Negativo para ir à esquerda
      y: 30, // Alinhado no centro (mesma altura do botão principal)
      delay: 0.05 * i,
   }));

   return (
      <>
         {/* Botão Principal */}
         <div className={`relative text-center ${isOpen ? 'z-[60]' : 'z-10'}`}>
            <button
               onClick={handleToggle}
               className="cursor-pointer transition-all hover:scale-125 focus:outline-none active:scale-95"
            >
               {isOpen ? (
                  <div className="flex items-center justify-center rounded-full bg-red-600 p-1">
                     <span className="text-xl font-bold">
                        <IoClose size={32} className="text-white" />
                     </span>
                  </div>
               ) : (
                  <HiMiniSquaresPlus size={32} />
               )}
            </button>
         </div>

         {/* Overlay e botões */}
         {isOpen && (
            <>
               {/* Overlay de fundo */}
               <div
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
                     const Icon = button.icon;

                     return (
                        <div key={index} className="absolute">
                           {/* Tooltip - ACIMA DO BOTÃO */}
                           <div
                              className={`pointer-events-none absolute left-1/2 z-60 -translate-x-1/2 transform rounded-md border-t-4 border-cyan-500 bg-black px-6 py-2 text-sm font-semibold tracking-wider whitespace-nowrap text-white shadow-sm shadow-white transition-all duration-200 ${
                                 isHovered
                                    ? 'scale-100 opacity-100'
                                    : 'scale-80 opacity-0'
                              }`}
                              style={{
                                 left: buttonPositions[index].x,
                                 top: buttonPositions[index].y + 20, // ACIMA: valor negativo maior
                              }}
                           >
                              {button.tooltip}
                              {/* Seta apontando para baixo */}
                              <div className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-t-4 border-r-4 border-l-4 border-transparent border-t-slate-900" />
                           </div>

                           {/* Botão de ação */}
                           <button
                              onClick={e => {
                                 e.stopPropagation();
                                 button.onClick();
                              }}
                              onMouseEnter={() => setHoveredButton(index)}
                              onMouseLeave={() => setHoveredButton(null)}
                              className={`pointer-events-auto absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full border-2 border-white/20 bg-gradient-to-br shadow-lg backdrop-blur-sm transition-all duration-300 ease-out ${
                                 isHovered
                                    ? `${button.hoverGradient} scale-110 ring-4`
                                    : `${button.bgGradient} scale-100 ring-0`
                              } ${button.iconColor} ${button.shadowColor} ${button.hoverShadow} ${button.ringColor}`}
                              style={{
                                 left: buttonPositions[index].x,
                                 top: buttonPositions[index].y,
                                 animation: `slideIn 0.4s ease-out ${buttonPositions[index].delay}s both`,
                              }}
                           >
                              <Icon size={20} />
                           </button>

                           {/* Efeito de pulso */}
                           {isHovered && (
                              <div
                                 className={`pointer-events-none absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gradient-to-br opacity-30 ${button.bgGradient}`}
                                 style={{
                                    left: buttonPositions[index].x,
                                    top: buttonPositions[index].y,
                                    animation:
                                       'pulse 1.5s ease-in-out infinite',
                                 }}
                              />
                           )}
                        </div>
                     );
                  })}
               </div>
            </>
         )}

         <style jsx global>{`
            @keyframes slideIn {
               from {
                  opacity: 0;
                  transform: translate(-50%, -50%) translateX(0) scale(0);
               }
               to {
                  opacity: 1;
                  transform: translate(-50%, -50%) scale(1);
               }
            }

            @keyframes pulse {
               0%,
               100% {
                  transform: translate(-50%, -50%) scale(1);
                  opacity: 0.3;
               }
               50% {
                  transform: translate(-50%, -50%) scale(1.3);
                  opacity: 0;
               }
            }
         `}</style>
      </>
   );
};

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export const colunasTabelaChamados = (
   acoes: AcoesTabelaChamadosProps,
   userType?: string
): ColumnDef<TabelaChamadoProps>[] => {
   // Array base de colunas
   const baseColumns: ColumnDef<TabelaChamadoProps>[] = [
      // Chamado
      {
         accessorKey: 'COD_CHAMADO',
         header: () => <div className="text-center">Chamado</div>,
         cell: ({ getValue }) => {
            const value = getValue() as number;
            return (
               <div className="flex items-center justify-center text-center">
                  {formatCodChamado(value) || '-----'}
               </div>
            );
         },
      },

      // Data chamado
      {
         accessorKey: 'DATA_CHAMADO',
         header: () => <div className="text-center">Data</div>,
         cell: ({ getValue }) => {
            const value = getValue() as string;
            const dataFormatada = formatarDataParaBR(value);

            return (
               <div className="flex items-center justify-center text-center">
                  {dataFormatada || '----------'}
               </div>
            );
         },
      },

      // Assunto
      {
         accessorKey: 'ASSUNTO_CHAMADO',
         header: () => <div className="text-center">Assunto</div>,
         cell: ({ getValue }) => {
            const value = getValue() as string;
            const isEmpty = !value;
            return (
               <div
                  className={`flex items-center ${isEmpty ? 'justify-center text-center' : 'justify-start text-left'}`}
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

      // Status (clicável)
      {
         accessorKey: 'STATUS_CHAMADO',
         header: () => <div className="text-center">Status</div>,
         cell: ({ row }) => (
            <ModalAtualizarStatusApontarOsChamado
               status={row.original.STATUS_CHAMADO}
               codChamado={row.original.COD_CHAMADO}
               nomeCliente={row.original.NOME_CLIENTE ?? '-'}
               onUpdateSuccess={() => {}}
            />
         ),
      },

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
                  <div className="flex items-center justify-center text-center">
                     {dataFormatada}
                  </div>
               );
            }
            return (
               <div className="flex items-center justify-center rounded-sm bg-yellow-500 p-1 text-center text-black uppercase italic">
                  Não atribuído
               </div>
            );
         },
      },
   ];

   // Coluna de Recurso
   const recursoColumn: ColumnDef<TabelaChamadoProps> = {
      accessorKey: 'NOME_RECURSO',
      header: () => <div className="text-center">Consultor</div>,
      cell: ({ row }) => {
         const recurso = row.original.NOME_RECURSO;
         const codRecurso = row.original.COD_RECURSO;

         if (codRecurso !== null && codRecurso !== undefined && recurso) {
            return (
               <div className="flex items-center justify-start text-left">
                  {corrigirTextoCorrompido(
                     recurso.split(' ').slice(0, 2).join(' ')
                  )}
               </div>
            );
         }

         return (
            <div className="flex items-center justify-center rounded-sm bg-yellow-500 p-1 text-center text-black uppercase italic">
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
                  className={`flex items-center ${isEmpty ? 'justify-center text-center' : 'justify-start text-left'}`}
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

      // Ações - USANDO MENU CIRCULAR HORIZONTAL
      {
         id: 'actions',
         header: () => <div className="text-center">Ações</div>,
         cell: ({ row }) => {
            const chamado = row.original;
            return (
               <div className="flex items-center justify-center">
                  <BotaoMenuCircular chamado={chamado} acoes={acoes} />
               </div>
            );
         },
      },
   ];

   // Montar array final de colunas condicionalmente
   const allColumns = [
      ...baseColumns,
      ...(userType === 'ADM' || acoes.userType === 'ADM'
         ? [recursoColumn]
         : []),
      ...finalColumns,
   ];

   return allColumns;
};
