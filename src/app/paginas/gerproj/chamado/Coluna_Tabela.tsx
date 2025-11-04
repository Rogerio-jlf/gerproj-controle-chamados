import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { useRef, useState, useEffect, memo, useMemo } from 'react';
import * as TooltipRadix from '@radix-ui/react-tooltip';

import { TabelaChamadoProps } from '../../../../types/types';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
import {
   formatarCodNumber,
   formatarDataHoraParaBR,
   formatarDataParaBR,
   formatarHora,
   getStylesStatus,
   obterSufixoHoras,
} from '../../../../utils/formatters';
import { FaEye } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';
import { FaUserCheck } from 'react-icons/fa';
import { RiDeleteBin6Fill } from 'react-icons/ri';
import { HiPhoneMissedCall } from 'react-icons/hi';
import { HiMiniSquaresPlus } from 'react-icons/hi2';

// ================================================================================
// CONSTANTES
// ================================================================================
const EMPTY_VALUE = 'n/a' as const;
const EMPTY_EMAIL_VALUE = '------------------------------' as const;

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

interface CellNumberProps {
   value: number | null | undefined;
}

interface CellDateProps {
   value: string | null | undefined;
   includeTime?: boolean;
}

interface CellTimeProps {
   value: string | null | undefined;
}

interface CellTextProps {
   value: string | null | undefined;
   maxWords?: number;
   align?: 'left' | 'center';
   applyCorrection?: boolean;
}

interface CellStatusProps {
   value: string | null | undefined;
}

interface CellDateTimeProps {
   value: string | null | undefined;
}

interface CellConsultorProps {
   value: string | null | undefined;
   maxWords: number;
}

interface CellClienteProps {
   value: string | null | undefined;
   maxWords: number;
}

interface CellEmailProps {
   value: string | null | undefined;
}

// ================================================================================
// HOOKS CUSTOMIZADOS
// ================================================================================
function useTextOverflow(
   value: string | null | undefined,
   processedValue: string | null
) {
   const textRef = useRef<HTMLSpanElement>(null);
   const [showTooltip, setShowTooltip] = useState(false);

   useEffect(() => {
      const checkOverflow = () => {
         if (textRef.current && value) {
            const isOverflowing =
               textRef.current.scrollWidth > textRef.current.clientWidth ||
               textRef.current.scrollHeight > textRef.current.clientHeight;
            setShowTooltip(isOverflowing);
         }
      };

      const timeoutId = setTimeout(checkOverflow, 100);
      window.addEventListener('resize', checkOverflow);

      return () => {
         clearTimeout(timeoutId);
         window.removeEventListener('resize', checkOverflow);
      };
   }, [value, processedValue]);

   return { textRef, showTooltip };
}

// ================================================================================
// UTILITÁRIOS
// ================================================================================
function processTextValue(
   value: string | null | undefined,
   maxWords?: number,
   applyCorrection?: boolean
): string | null {
   if (!value || value.trim() === '') return null;

   let processed = value;

   if (maxWords && maxWords > 0) {
      processed = value.split(' ').slice(0, maxWords).join(' ');
   }

   if (applyCorrection) {
      processed = corrigirTextoCorrompido(processed);
   }

   return processed;
}

// ================================================================================
// COMPONENTES AUXILIARES
// ================================================================================
const HeaderCenter = memo(({ children }: { children: React.ReactNode }) => (
   <div className="text-center">{children}</div>
));
HeaderCenter.displayName = 'HeaderCenter';
//====================

const TooltipContentCustom = memo(({ content }: { content: string }) => (
   <TooltipRadix.Content
      side="top"
      align="start"
      className="animate-in fade-in-0 zoom-in-95 z-[70] max-w-[800px] rounded-lg border border-pink-500 bg-white px-6 py-2 text-sm font-semibold tracking-widest text-black italic shadow-sm shadow-black select-none"
      sideOffset={10}
   >
      <div className="break-words">{corrigirTextoCorrompido(content)}</div>
      <TooltipRadix.Arrow className="fill-black" />
   </TooltipRadix.Content>
));
TooltipContentCustom.displayName = 'TooltipContentCustom';
//====================

const CellNumber = memo(({ value }: CellNumberProps) => {
   const formattedNumber =
      value || value === 0 ? formatarCodNumber(value) : null;

   return (
      <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
         {formattedNumber || EMPTY_VALUE}
      </div>
   );
});
CellNumber.displayName = 'CellNumber';
//====================

const CellDate = memo(({ value, includeTime = false }: CellDateProps) => {
   const formattedDate = value
      ? includeTime
         ? formatarDataHoraParaBR(value)
         : formatarDataParaBR(value)
      : null;

   return (
      <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
         {formattedDate || EMPTY_VALUE}
      </div>
   );
});
CellDate.displayName = 'CellDate';
//====================

const CellTime = memo(({ value }: CellTimeProps) => {
   const formattedTime = value ? formatarHora(value) : null;
   const display =
      formattedTime && formattedTime !== EMPTY_VALUE
         ? formattedTime
         : EMPTY_VALUE;

   return (
      <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
         {display} {obterSufixoHoras(formattedTime ?? EMPTY_VALUE)}
      </div>
   );
});
CellTime.displayName = 'CellTime';
//====================

const CellText = memo(
   ({
      value,
      maxWords,
      align = 'left',
      applyCorrection = false,
   }: CellTextProps) => {
      const isEmpty = !value || value.trim() === '';
      const processedValue = processTextValue(value, maxWords, applyCorrection);
      const { textRef, showTooltip } = useTextOverflow(value, processedValue);

      const alignClass =
         align === 'center'
            ? 'justify-center text-center'
            : 'justify-start pl-2 text-left';

      if (isEmpty) {
         return (
            <div
               className={`flex items-center rounded-md bg-black p-2 text-white ${alignClass}`}
            >
               {EMPTY_VALUE}
            </div>
         );
      }

      const content = corrigirTextoCorrompido(processedValue ?? '');

      if (!showTooltip) {
         return (
            <div
               className={`flex items-center rounded-md bg-black p-2 text-white ${alignClass}`}
            >
               <span ref={textRef} className="block w-full truncate">
                  {content}
               </span>
            </div>
         );
      }

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
                        {content}
                     </span>
                  </TooltipRadix.Trigger>
                  <TooltipRadix.Portal>
                     <TooltipContentCustom content={value!} />
                  </TooltipRadix.Portal>
               </TooltipRadix.Root>
            </TooltipRadix.Provider>
         </div>
      );
   }
);
CellText.displayName = 'CellText';
//====================

const CellStatus = memo(({ value }: CellStatusProps) => {
   const styles = value ? getStylesStatus(value) : '';

   return (
      <div
         className={`flex items-center justify-center rounded-md p-2 ${styles}`}
      >
         {value || EMPTY_VALUE}
      </div>
   );
});
CellStatus.displayName = 'CellStatus';
//====================

const CellDateTime = memo(({ value }: CellDateTimeProps) => {
   const formattedDate = value ? formatarDataParaBR(value) : null;
   const isAtribuido =
      formattedDate !== null &&
      formattedDate !== undefined &&
      formattedDate !== '-';

   if (isAtribuido) {
      return (
         <div className="flex items-center justify-center rounded-md bg-black p-2 text-center text-white">
            {formattedDate} h
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
});
CellDateTime.displayName = 'CellDateTime';
//====================

const CellConsultor = memo(({ value, maxWords }: CellConsultorProps) => {
   const isEmpty = !value || value.trim() === '';

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
         ? value.split(' ').slice(0, maxWords).join(' ')
         : value;

   return (
      <div className="flex items-center justify-start rounded-md bg-black p-2 text-white">
         {display}
      </div>
   );
});
CellConsultor.displayName = 'CellConsultor';
//====================

const CellCliente = memo(({ value, maxWords }: CellClienteProps) => {
   const isEmpty = !value || value.trim() === '';

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
         ? value.split(' ').slice(0, maxWords).join(' ')
         : value;

   return (
      <div className="flex items-center justify-start rounded-md bg-black p-2 text-white">
         {display}
      </div>
   );
});
CellCliente.displayName = 'CellCliente';
//====================

const CellEmail = memo(({ value }: CellEmailProps) => {
   const isEmpty = !value || value.trim() === '';
   const { textRef, showTooltip } = useTextOverflow(value, value ?? null);

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
               EMPTY_VALUE
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
                  <TooltipContentCustom content={value!} />
               </TooltipRadix.Portal>
            </TooltipRadix.Root>
         </TooltipRadix.Provider>
      </Link>
   );
});
CellEmail.displayName = 'CellEmail';
//====================

const BotaoMenuCircular = memo(
   ({ chamado, acoes }: DropdownTabelaChamadoProps) => {
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
               bgGradient: 'from-blue-600 to-blue-700',
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
               bgGradient: 'from-pink-600 to-pink-700',
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
               bgGradient: 'from-red-600 to-red-700',
               hoverGradient: 'from-red-600 to-red-700',
               iconColor: 'text-white',
               shadowColor: 'shadow-red-300/50',
               hoverShadow: 'hover:shadow-red-400/60',
               ringColor: 'hover:ring-red-300/40',
            },
            // {
            //    icon: HiPhoneMissedCall,
            //    onClick: () => {
            //       acoes.onPermitirRetroativa(chamado.COD_CHAMADO);
            //       setIsOpen(false);
            //    },
            //    tooltip: 'Permitir OS Retroativa',
            //    bgGradient: 'from-green-500 to-green-600',
            //    hoverGradient: 'from-green-600 to-green-700',
            //    iconColor: 'text-white',
            //    shadowColor: 'shadow-green-300/50',
            //    hoverShadow: 'hover:shadow-green-400/60',
            //    ringColor: 'hover:ring-green-300/40',
            // },
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
            <div
               className={`relative text-center ${isOpen ? 'z-[60]' : 'z-10'}`}
            >
               <button
                  onClick={handleToggle}
                  title={isOpen ? 'Fechar menu' : 'Abrir menu'}
                  className="cursor-pointer transition-all hover:scale-125 focus:outline-none active:scale-95"
               >
                  {isOpen ? (
                     <div className="flex items-center justify-center rounded-full bg-red-600 p-1">
                        <span className="text-xl font-bold">
                           <IoClose size={32} className="text-white" />
                        </span>
                     </div>
                  ) : (
                     <HiMiniSquaresPlus
                        className="hover:rotate-180"
                        size={32}
                     />
                  )}
               </button>
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
                                 <Icon size={24} />
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
   }
);
BotaoMenuCircular.displayName = 'BotaoMenuCircular';

// ================================================================================
// DEFINIÇÃO DAS COLUNAS
// ================================================================================
export const colunasTabelaChamados = (
   acoes: AcoesTabelaChamadoProps
): ColumnDef<TabelaChamadoProps>[] => [
   {
      accessorKey: 'COD_CHAMADO',
      header: () => <HeaderCenter>CHAMADO</HeaderCenter>,
      cell: ({ getValue }) => <CellNumber value={getValue() as number} />,
   },
   {
      accessorKey: 'DATA_CHAMADO',
      header: () => <HeaderCenter>DATA</HeaderCenter>,
      cell: ({ getValue }) => <CellDate value={getValue() as string} />,
   },
   {
      accessorKey: 'HORA_CHAMADO',
      header: () => <HeaderCenter>HORA</HeaderCenter>,
      cell: ({ getValue }) => <CellTime value={getValue() as string} />,
   },
   {
      accessorKey: 'ASSUNTO_CHAMADO',
      header: () => <HeaderCenter>ASSUNTO</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellText value={getValue() as string} align="left" />
      ),
   },
   {
      accessorKey: 'STATUS_CHAMADO',
      header: () => <HeaderCenter>STATUS</HeaderCenter>,
      cell: ({ getValue }) => <CellStatus value={getValue() as string} />,
   },
   {
      accessorKey: 'DTENVIO_CHAMADO',
      header: () => <HeaderCenter>DT./HR. ATRIBUIÇÃO</HeaderCenter>,
      cell: ({ getValue }) => <CellDateTime value={getValue() as string} />,
   },
   {
      accessorKey: 'NOME_RECURSO',
      header: () => <HeaderCenter>CONSULTOR</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellConsultor value={getValue() as string} maxWords={2} />
      ),
   },
   {
      accessorKey: 'NOME_CLIENTE',
      header: () => <HeaderCenter>CLIENTE</HeaderCenter>,
      cell: ({ getValue }) => (
         <CellCliente value={getValue() as string} maxWords={2} />
      ),
   },
   {
      accessorKey: 'EMAIL_CHAMADO',
      header: () => <HeaderCenter>EMAIL</HeaderCenter>,
      cell: ({ getValue }) => <CellEmail value={getValue() as string} />,
   },
   {
      id: 'acoes',
      header: () => <HeaderCenter>AÇÕES</HeaderCenter>,
      cell: ({ row }) => (
         <BotaoMenuCircular chamado={row.original} acoes={acoes} />
      ),
   },
];

// ================================================================================
// EXPORTS
// ================================================================================
export { EMPTY_VALUE, EMPTY_EMAIL_VALUE, NAO_ATRIBUIDO_CONFIG };
export type { AcoesTabelaChamadoProps };
