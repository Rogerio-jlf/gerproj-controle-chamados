// IMPORTS
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as TooltipRadix from '@radix-ui/react-tooltip';

// UI
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from '../../../../components/ui/tooltip';

// TYPES
import { TabelaChamadoProps } from '../../../../types/types';

// HELPERS
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';

// FORMATTERS
import {
   formatarCodNumber,
   formatarDataHoraParaBR,
   formatarDataParaBR,
   formatarHora,
   getStylesStatus,
} from '../../../../utils/formatters';

// ICONS
import { FaEye } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';
import { FaUserCheck } from 'react-icons/fa';
import { RiDeleteBin6Fill } from 'react-icons/ri';
import { HiPhoneMissedCall } from 'react-icons/hi';
import { HiMiniSquaresPlus } from 'react-icons/hi2';

// ================================================================================
// CONSTANTES
// ================================================================================
const EMPTY_VALUE = '-----';
const EMPTY_EMAIL_VALUE = '------------------------------';

const NAO_ATRIBUIDO_CONFIG = {
   label: 'Não atribuído',
   bgColor: 'bg-yellow-500',
   textColor: 'text-black',
} as const;

// ================================================================================
// INTERFACES
// ================================================================================
interface AcoesTabelaChamadoProps {
   onVisualizarChamado: (codChamado: number) => void;
   onTabelaOS: () => void;
   onTabelaTarefa: () => void;
   onTabelaProjeto: () => void;
   onAtribuirChamado: (chamado: TabelaChamadoProps) => void;
   onExcluirChamado: (codChamado: number) => void;
   onPermitirRetroativa: (codChamado: number) => void;
}

interface DropdownTabelaChamadoProps {
   chamado: TabelaChamadoProps;
   acoes: AcoesTabelaChamadoProps;
}

// ================================================================================
// COMPONENTES AUXILIARES REUTILIZÁVEIS
// ================================================================================

/**
 * Componente para célula numérica
 */
interface CellNumberProps {
   value: number | null | undefined;
}

const CellNumber = ({ value }: CellNumberProps) => {
   const formattedNumber = useMemo(() => {
      if (!value && value !== 0) return null;
      return formatarCodNumber(value);
   }, [value]);

   return (
      <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
         {formattedNumber || 'n/a'}
      </div>
   );
};
// ==========

/**
 * Componente para célula de data
 */
interface CellDateProps {
   value: string | null | undefined;
   includeTime?: boolean;
}

const CellDate = ({ value, includeTime = false }: CellDateProps) => {
   const formattedDate = useMemo(() => {
      if (!value) return null;
      return includeTime
         ? formatarDataHoraParaBR(value)
         : formatarDataParaBR(value);
   }, [value, includeTime]);

   return (
      <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
         {formattedDate || 'n/a'}
      </div>
   );
};
// ==========

/**
 * Componente para célula de hora
 */
interface CellTimeProps {
   value: string | null | undefined;
}

const CellTime = ({ value }: CellTimeProps) => {
   const formattedTime = useMemo(() => {
      if (!value) return null;
      return formatarHora(value);
   }, [value]);

   const display =
      formattedTime && formattedTime !== 'n/a' ? `${formattedTime}h` : 'n/a';

   return (
      <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
         {display}
      </div>
   );
};
// ==========

/**
 * Componente para célula de texto com tooltip para overflow
 */
interface CellTextProps {
   value: string | null | undefined;
   maxWords?: number;
   align?: 'left' | 'center';
   applyCorrection?: boolean;
}

const CellText = ({
   value,
   maxWords,
   align = 'left',
   applyCorrection = false,
}: CellTextProps) => {
   const isEmpty = !value || value.trim() === '';
   const textRef = useRef<HTMLSpanElement>(null);
   const [showTooltip, setShowTooltip] = useState(false);

   const processedValue = useMemo(() => {
      if (isEmpty) return null;

      let processed = value;

      if (maxWords && maxWords > 0) {
         return value.split(' ').slice(0, maxWords).join(' ');
      }

      // Aplica correção de texto se necessário
      if (applyCorrection) {
         processed = corrigirTextoCorrompido(processed);
      }

      return processed;
   }, [value, maxWords, applyCorrection, isEmpty]);

   const alignClass =
      align === 'center'
         ? 'justify-center text-center'
         : 'justify-start pl-2 text-left';

   useEffect(() => {
      const checkOverflow = () => {
         if (textRef.current && value) {
            const isOverflowing =
               textRef.current.scrollWidth > textRef.current.clientWidth ||
               textRef.current.scrollHeight > textRef.current.clientHeight;
            setShowTooltip(isOverflowing);
         }
      };

      // Pequeno delay para garantir que o DOM foi renderizado
      const timeoutId = setTimeout(checkOverflow, 100);

      window.addEventListener('resize', checkOverflow);

      return () => {
         clearTimeout(timeoutId);
         window.removeEventListener('resize', checkOverflow);
      };
   }, [value, processedValue]);

   if (isEmpty) {
      return (
         <div
            className={`flex items-center rounded-md bg-black p-2 text-white ${alignClass}`}
         >
            'n/a'
         </div>
      );
   }

   // Se não há overflow, renderiza sem tooltip
   if (!showTooltip) {
      return (
         <div
            className={`flex items-center rounded-md bg-black p-2 text-white ${alignClass}`}
         >
            <span ref={textRef} className="block w-full truncate">
               {corrigirTextoCorrompido(processedValue ?? 'n/a')}
            </span>
         </div>
      );
   }

   // Se há overflow, renderiza com tooltip
   return (
      <div
         className={`flex items-center rounded-md bg-black p-2 text-white ${alignClass}`}
      >
         <TooltipRadix.Provider delayDuration={200}>
            <TooltipRadix.Root>
               <TooltipRadix.Trigger asChild>
                  <span
                     ref={textRef}
                     className="block w-full cursor-help truncate"
                  >
                     {corrigirTextoCorrompido(processedValue ?? 'n/a')}
                  </span>
               </TooltipRadix.Trigger>
               <TooltipRadix.Portal>
                  <TooltipRadix.Content
                     side="top"
                     align="start"
                     className="animate-in fade-in-0 zoom-in-95 z-[70] max-w-[800px] rounded-lg border border-pink-500 bg-white px-6 py-2 text-sm font-semibold tracking-widest text-black italic shadow-sm shadow-black select-none"
                     sideOffset={10}
                  >
                     <div className="break-words">
                        {corrigirTextoCorrompido(value)}
                     </div>
                     <TooltipRadix.Arrow className="fill-black" />
                  </TooltipRadix.Content>
               </TooltipRadix.Portal>
            </TooltipRadix.Root>
         </TooltipRadix.Provider>
      </div>
   );
};
// ==========

/**
 * Componente para célula de Status
 */
interface CellStatusProps {
   value: string | null | undefined;
}

const CellStatus = ({ value }: CellStatusProps) => {
   const styles = useMemo(() => {
      if (!value) return '';
      return getStylesStatus(value);
   }, [value]);

   return (
      <div
         className={`flex items-center justify-center rounded-md p-2 ${styles}`}
      >
         {value || 'n/a'}
      </div>
   );
};
// ==========

/**
 * Componente para célula de Data/Time
 */
interface CellDateTimeProps {
   value: string | null | undefined;
}

const CellDateTime = ({ value }: CellDateTimeProps) => {
   const formattedDate = useMemo(() => {
      if (!value) return null;
      return formatarDataParaBR(value);
   }, [value]);

   const isAtribuido =
      formattedDate !== null &&
      formattedDate !== undefined &&
      formattedDate !== '-';

   if (isAtribuido) {
      return (
         <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
            {formattedDate}
         </div>
      );
   }

   return (
      <div
         className={`flex items-center justify-center rounded-sm p-2 text-center uppercase italic ${NAO_ATRIBUIDO_CONFIG.bgColor} ${NAO_ATRIBUIDO_CONFIG.textColor}`}
      >
         {NAO_ATRIBUIDO_CONFIG.label}
      </div>
   );
};
// ==========

/**
 * Componente para célula de Consultor
 */
interface CellConsultorProps {
   value: string | null | undefined;
   maxWords: number;
}

const CellConsultor = ({ value, maxWords }: CellConsultorProps) => {
   const isEmpty = useMemo(() => {
      return !value || value.trim() === '';
   }, [value]);

   if (isEmpty) {
      return (
         <div
            className={`flex items-center justify-center rounded-sm p-2 text-center uppercase italic ${NAO_ATRIBUIDO_CONFIG.bgColor} ${NAO_ATRIBUIDO_CONFIG.textColor}`}
         >
            {NAO_ATRIBUIDO_CONFIG.label}
         </div>
      );
   }

   const display =
      maxWords && maxWords > 0
         ? (value ?? '').split(' ').slice(0, maxWords).join(' ')
         : (value ?? '');

   return <div className="pl-2 text-left text-white">{display}</div>;
};
// ==========

/**
 * Componente para célula de Cliente
 */
interface CellClienteProps {
   value: string | null | undefined;
   maxWords: number;
}

const CellCliente = ({ value, maxWords }: CellClienteProps) => {
   const isEmpty = useMemo(() => {
      return !value || value.trim() === '';
   }, [value]);

   if (isEmpty) {
      return (
         <div
            className={`flex items-center justify-center rounded-sm p-2 text-center uppercase italic ${NAO_ATRIBUIDO_CONFIG.bgColor} ${NAO_ATRIBUIDO_CONFIG.textColor}`}
         >
            {NAO_ATRIBUIDO_CONFIG.label}
         </div>
      );
   }

   const display =
      maxWords && maxWords > 0
         ? (value ?? '').split(' ').slice(0, maxWords).join(' ')
         : (value ?? '');

   return <div className="pl-2 text-left text-white">{display}</div>;
};
// ==========

/**
 * Componente para célula de Email (com link)
 */
interface CellEmailProps {
   value: string | null | undefined;
}

const CellEmail = ({ value }: CellEmailProps) => {
   const isEmpty = !value || value.trim() === '';
   const textRef = useRef<HTMLSpanElement>(null);
   const [showTooltip, setShowTooltip] = useState(false);

   useEffect(() => {
      const checkOverflow = () => {
         if (textRef.current && value) {
            const isOverflowing =
               textRef.current.scrollWidth > textRef.current.clientWidth;
            setShowTooltip(isOverflowing);
         }
      };

      const timeoutId = setTimeout(checkOverflow, 100);
      window.addEventListener('resize', checkOverflow);

      return () => {
         clearTimeout(timeoutId);
         window.removeEventListener('resize', checkOverflow);
      };
   }, [value]);

   const alignClass = isEmpty
      ? 'justify-center text-center'
      : 'justify-start pl-2 text-left';

   if (!showTooltip) {
      return (
         <Link
            href={isEmpty ? '#' : `mailto:${value}`}
            className={`flex items-center rounded-md bg-black p-2 text-white ${alignClass}`}
            onClick={isEmpty ? e => e.preventDefault() : undefined}
         >
            {isEmpty ? (
               'n/a'
            ) : (
               <span ref={textRef} className="block w-full truncate">
                  {value}
               </span>
            )}
         </Link>
      );
   }

   return (
      <Link
         href={`mailto:${value}`}
         className={`flex items-center rounded-md bg-black p-2 text-white ${alignClass}`}
      >
         <TooltipRadix.Provider delayDuration={200}>
            <TooltipRadix.Root>
               <TooltipRadix.Trigger asChild>
                  <span
                     ref={textRef}
                     className="block w-full cursor-help truncate"
                  >
                     {value}
                  </span>
               </TooltipRadix.Trigger>
               <TooltipRadix.Portal>
                  <TooltipRadix.Content
                     side="top"
                     align="start"
                     className="animate-in fade-in-0 zoom-in-95 z-[70] max-w-[800px] rounded-lg border border-pink-500 bg-white px-6 py-2 text-sm font-semibold tracking-widest text-black italic shadow-sm shadow-black select-none"
                     sideOffset={10}
                  >
                     <div className="break-words">{value}</div>
                     <TooltipRadix.Arrow className="fill-black" />
                  </TooltipRadix.Content>
               </TooltipRadix.Portal>
            </TooltipRadix.Root>
         </TooltipRadix.Provider>
      </Link>
   );
};
// ==========

/**
 * Componente para cabeçalho centralizado
 */
const HeaderCenter = ({ children }: { children: React.ReactNode }) => (
   <div className="text-center">{children}</div>
);
// ==========

// ================================================================================
// BOTÃO MENU CIRCULAR - HORIZONTAL À ESQUERDA
// ================================================================================
const BotaoMenuCircular = ({ chamado, acoes }: DropdownTabelaChamadoProps) => {
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

   const allActionButtons = useMemo(
      () => [
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
         {
            icon: FaUserCheck,
            onClick: () => {
               acoes.onAtribuirChamado?.(chamado);
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
         {
            icon: HiPhoneMissedCall,
            onClick: () => {
               acoes.onPermitirRetroativa(chamado.COD_CHAMADO);
               setIsOpen(false);
            },
            tooltip: 'Permitir OS Retroativa',
            bgGradient: 'from-green-500 to-green-600',
            hoverGradient: 'from-green-600 to-green-700',
            iconColor: 'text-white',
            shadowColor: 'shadow-green-300/50',
            hoverShadow: 'hover:shadow-green-400/60',
            ringColor: 'hover:ring-green-300/40',
         },
      ],
      [chamado, acoes]
   );

   const totalButtons = allActionButtons.length;
   const spacing = 70;

   const buttonPositions = useMemo(
      () =>
         Array.from({ length: totalButtons }).map((_, i) => ({
            x: -(spacing * (i + 1)),
            y: 30,
            delay: 0.05 * i,
         })),
      [totalButtons]
   );

   return (
      <>
         <div className={`relative text-center ${isOpen ? 'z-[60]' : 'z-10'}`}>
            <TooltipProvider>
               <Tooltip>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent
                     side="right"
                     align="start"
                     sideOffset={8}
                     className="border-t-8 border-blue-600 bg-white text-sm font-extrabold tracking-widest text-black italic shadow-sm shadow-black select-none"
                  >
                     Ações
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         </div>

         {isOpen && (
            <>
               <div
                  className="fixed inset-0 z-40 bg-black/60"
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
                  {allActionButtons.map((button, index) => {
                     const isHovered = hoveredButton === index;
                     const Icon = button.icon;

                     return (
                        <div key={index} className="absolute">
                           <div
                              className={`pointer-events-none absolute left-1/2 z-60 -translate-x-1/2 transform rounded-md border-t-8 border-blue-600 bg-white px-6 py-2 text-sm font-semibold tracking-widest whitespace-nowrap text-black shadow-sm shadow-white transition-all duration-200 ${
                                 isHovered
                                    ? 'scale-100 opacity-100'
                                    : 'scale-80 opacity-0'
                              }`}
                              style={{
                                 left: buttonPositions[index].x,
                                 top: buttonPositions[index].y + 20,
                              }}
                           >
                              {button.tooltip}
                              <div className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-t-4 border-r-4 border-l-4 border-transparent border-t-slate-900" />
                           </div>

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
// ==========

// ================================================================================
// DEFINIÇÃO DAS COLUNAS
// ================================================================================
export const colunasTabelaChamados = (
   acoes: AcoesTabelaChamadoProps
): ColumnDef<TabelaChamadoProps>[] => {
   return [
      // COD_CHAMADO
      {
         accessorKey: 'COD_CHAMADO',
         header: () => <HeaderCenter>CHAMADO</HeaderCenter>,
         cell: ({ getValue }) => <CellNumber value={getValue() as number} />,
      },

      // DATA_CHAMADO
      {
         accessorKey: 'DATA_CHAMADO',
         header: () => <HeaderCenter>DATA</HeaderCenter>,
         cell: ({ getValue }) => <CellDate value={getValue() as string} />,
      },

      // HORA_CHAMADO
      {
         accessorKey: 'HORA_CHAMADO',
         header: () => <HeaderCenter>HORA</HeaderCenter>,
         cell: ({ getValue }) => <CellTime value={getValue() as string} />,
      },

      // ASSUNTO_CHAMADO
      {
         accessorKey: 'ASSUNTO_CHAMADO',
         header: () => <HeaderCenter>ASSUNTO</HeaderCenter>,
         cell: ({ getValue }) => (
            <CellText value={getValue() as string} align="left" />
         ),
      },

      // STATUS_CHAMADO
      {
         accessorKey: 'STATUS_CHAMADO',
         header: () => <HeaderCenter>STATUS</HeaderCenter>,
         cell: ({ getValue }) => <CellStatus value={getValue() as string} />,
      },

      // DTENVIO_CHAMADO
      {
         accessorKey: 'DTENVIO_CHAMADO',
         header: () => <HeaderCenter>DT./HR. ATRIBUIÇÃO</HeaderCenter>,
         cell: ({ getValue }) => <CellDateTime value={getValue() as string} />,
      },

      // NOME_RECURSO
      {
         accessorKey: 'NOME_RECURSO',
         header: () => <HeaderCenter>CONSULTOR</HeaderCenter>,
         cell: ({ getValue }) => {
            const value = getValue() as string;
            // if (!value) return null;

            return <CellConsultor value={value} maxWords={2} />;
         },
      },

      // NOME_CLIENTE
      {
         accessorKey: 'NOME_CLIENTE',
         header: () => <HeaderCenter>CLIENTE</HeaderCenter>,
         cell: ({ getValue }) => {
            const value = getValue() as string;

            return <CellCliente value={value} maxWords={2} />;
         },
      },

      // EMAIL_CHAMADO
      {
         accessorKey: 'EMAIL_CHAMADO',
         header: () => <HeaderCenter>EMAIL</HeaderCenter>,
         cell: ({ getValue }) => {
            const value = getValue() as string;
            if (!value) return null;

            return <CellEmail value={value} />;
         },
      },

      // AÇÕES
      {
         id: 'actions',
         header: () => <HeaderCenter>AÇÕES</HeaderCenter>,
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
};

// ================================================================================
// EXPORT DE TIPOS E CONSTANTES ÚTEIS
// ================================================================================
export { EMPTY_VALUE, EMPTY_EMAIL_VALUE, NAO_ATRIBUIDO_CONFIG };
export type { AcoesTabelaChamadoProps };
