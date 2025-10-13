import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GrServices } from 'react-icons/gr';
import { FaTasks, FaChartBar } from 'react-icons/fa';
import { MdArrowDropDown } from 'react-icons/md';
import { BiSolidReport } from 'react-icons/bi';
import {
   AiOutlineBarChart,
   AiOutlinePieChart,
   AiOutlineTable,
} from 'react-icons/ai';

// ================================================================================
// INTERFACES
// ================================================================================
interface SubOption {
   id: string;
   label: string;
   icon: React.ComponentType<{ size?: number; className?: string }>;
   action: () => void;
}

interface DropdownOption {
   id: string;
   label: string;
   icon: React.ComponentType<{ size?: number; className?: string }>;
   description: string;
   action?: () => void;
   bg: string;
   iconColor: string;
   subOptions?: SubOption[];
}

interface DropdownHeaderProps {
   onOpenTabelaOS: () => void;
   onOpenTabelaTarefa: () => void;
   onOpenRelatorioOS: () => void;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export function DropdownTabelaChamado({
   onOpenTabelaOS,
   onOpenTabelaTarefa,
   onOpenRelatorioOS,
}: DropdownHeaderProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [hoveredOption, setHoveredOption] = useState<string | null>(null);
   const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);

   // Fecha dropdown ao clicar fora
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
         ) {
            setIsOpen(false);
            setActiveSubMenu(null);
         }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () =>
         document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   // Opções de relatório (sub-menu)
   const relatorioSubOptions: SubOption[] = [
      {
         id: 'relatorio-os',
         label: "Relatório OS's",
         icon: BiSolidReport,
         action: () => {
            onOpenRelatorioOS();
            setIsOpen(false);
            setActiveSubMenu(null);
         },
      },
      {
         id: 'relatorio-grafico',
         label: 'Relatório Gráfico',
         icon: AiOutlineBarChart,
         action: () => {
            console.log('Relatório Gráfico');
            setIsOpen(false);
            setActiveSubMenu(null);
         },
      },
      {
         id: 'relatorio-estatistico',
         label: 'Relatório Estatístico',
         icon: AiOutlinePieChart,
         action: () => {
            console.log('Relatório Estatístico');
            setIsOpen(false);
            setActiveSubMenu(null);
         },
      },
      {
         id: 'relatorio-tabular',
         label: 'Relatório Tabular',
         icon: AiOutlineTable,
         action: () => {
            console.log('Relatório Tabular');
            setIsOpen(false);
            setActiveSubMenu(null);
         },
      },
   ];

   // Opções do dropdown
   const dropdownOptions: DropdownOption[] = [
      {
         id: 'tabela-os',
         label: "OS's",
         icon: GrServices,
         description: "Gerenciamento de OS's",
         action: () => {
            onOpenTabelaOS();
            setIsOpen(false);
            setActiveSubMenu(null);
         },
         bg: 'green-600',
         iconColor: 'text-white',
      },
      {
         id: 'tabela-tarefas',
         label: 'Tarefas',
         icon: FaTasks,
         description: 'Gerenciamento de Tarefas',
         action: () => {
            onOpenTabelaTarefa();
            setIsOpen(false);
            setActiveSubMenu(null);
         },
         bg: 'orange-600',
         iconColor: 'text-white',
      },
      {
         id: 'relatorios',
         label: 'Relatórios',
         icon: BiSolidReport,
         description: 'Relatórios do Sistema',
         bg: 'blue-600',
         iconColor: 'text-white',
         subOptions: relatorioSubOptions,
      },
   ];

   const handleOptionClick = (option: DropdownOption, e: React.MouseEvent) => {
      e.stopPropagation();
      if (option.subOptions && option.subOptions.length > 0) {
         setActiveSubMenu(activeSubMenu === option.id ? null : option.id);
      } else if (option.action) {
         option.action();
      }
   };

   return (
      <div className="relative" ref={dropdownRef}>
         {/* Botão Principal do Dropdown */}
         <motion.button
            onClick={() => {
               setIsOpen(!isOpen);
               if (!isOpen) setActiveSubMenu(null);
            }}
            className="flex cursor-pointer items-center justify-center gap-4 rounded-md border-none bg-teal-800 px-10 py-4 text-white shadow-md shadow-black transition-all hover:scale-105 hover:bg-teal-900 active:scale-95"
         >
            <FaChartBar className="text-white" size={24} />
            <span className="text-lg font-extrabold tracking-widest text-white uppercase">
               Módulos
            </span>
            <motion.div
               animate={{ rotate: isOpen ? 180 : 0 }}
               transition={{ duration: 0.3, ease: 'easeOut' }}
            >
               <MdArrowDropDown size={28} />
            </motion.div>
         </motion.button>

         {/* Dropdown Menu */}
         <AnimatePresence>
            {isOpen && (
               <>
                  {/* Overlay */}
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="fixed inset-0 z-40 bg-black/70"
                     onClick={() => {
                        setIsOpen(false);
                        setActiveSubMenu(null);
                     }}
                  />

                  {/* Container Geral */}
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: -10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: -10 }}
                     transition={{ duration: 0.2, ease: 'easeOut' }}
                     className="absolute top-full right-0 z-50 mt-6 w-100 overflow-visible border-none bg-white"
                  >
                     {/* Header do Menu */}
                     <div className="bg-teal-800 p-6 text-center shadow-md shadow-black">
                        <h3 className="text-lg font-extrabold tracking-widest text-white uppercase select-none">
                           Módulos do Sistema
                        </h3>
                     </div>

                     {/* Lista de Opções */}
                     <div>
                        {dropdownOptions.map((option, index) => {
                           const isHovered = hoveredOption === option.id;
                           const hasSubMenu =
                              option.subOptions && option.subOptions.length > 0;
                           const isSubMenuOpen = activeSubMenu === option.id;

                           return (
                              <motion.div
                                 key={option.id}
                                 initial={{ opacity: 0, x: -20 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 transition={{
                                    duration: 0.3,
                                    delay: index * 0.1,
                                    ease: 'easeOut',
                                 }}
                                 className="relative"
                              >
                                 <button
                                    onClick={e => handleOptionClick(option, e)}
                                    onMouseEnter={() =>
                                       setHoveredOption(option.id)
                                    }
                                    onMouseLeave={() => setHoveredOption(null)}
                                    className="group w-full p-6 text-left transition-all hover:bg-teal-100 focus:bg-teal-100 focus:outline-none active:scale-95"
                                 >
                                    <div className="flex items-center gap-4">
                                       {/* Ícone */}
                                       <motion.div
                                          className={`flex h-14 w-14 items-center justify-center rounded-full transition-all group-hover:scale-110 ${
                                             option.bg === 'green-600'
                                                ? 'bg-green-600'
                                                : option.bg === 'orange-600'
                                                  ? 'bg-orange-600'
                                                  : option.bg === 'blue-600'
                                                    ? 'bg-blue-600'
                                                    : ''
                                          }`}
                                       >
                                          <option.icon
                                             size={24}
                                             className={option.iconColor}
                                          />
                                       </motion.div>

                                       {/* Conteúdo */}
                                       <div className="flex-1">
                                          <h4 className="text-lg font-bold tracking-widest text-black select-none">
                                             {option.label}
                                          </h4>
                                          <p className="text-sm font-semibold tracking-widest text-slate-500 italic select-none group-hover:text-black">
                                             {option.description}
                                          </p>
                                       </div>

                                       {/* Indicador de seta */}
                                       <motion.div
                                          className="text-black transition-all group-hover:scale-110"
                                          animate={{
                                             x: isHovered ? 5 : 0,
                                             rotate:
                                                hasSubMenu && isSubMenuOpen
                                                   ? 0
                                                   : -90,
                                          }}
                                          transition={{ duration: 0.2 }}
                                       >
                                          <MdArrowDropDown size={28} />
                                       </motion.div>
                                    </div>
                                 </button>

                                 {/* Sub-menu de Relatórios */}
                                 <AnimatePresence>
                                    {hasSubMenu && isSubMenuOpen && (
                                       <motion.div
                                          initial={{ opacity: 0, x: 20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          exit={{ opacity: 0, x: 20 }}
                                          transition={{ duration: 0.2 }}
                                          className="absolute top-0 left-[-420px] z-[60] w-100 border-none bg-white"
                                          onClick={e => e.stopPropagation()}
                                       >
                                          {/* Header do Sub-menu */}
                                          <div className="bg-blue-800 p-4 text-center shadow-md shadow-black">
                                             <h4 className="text-base font-extrabold tracking-widest text-white uppercase select-none">
                                                Tipos de Relatório
                                             </h4>
                                          </div>

                                          {/* Lista de Sub-opções */}
                                          <div>
                                             {option.subOptions?.map(
                                                (subOption, subIndex) => (
                                                   <motion.div
                                                      key={subOption.id}
                                                      initial={{
                                                         opacity: 0,
                                                         x: 20,
                                                      }}
                                                      animate={{
                                                         opacity: 1,
                                                         x: 0,
                                                      }}
                                                      transition={{
                                                         duration: 0.2,
                                                         delay: subIndex * 0.05,
                                                      }}
                                                   >
                                                      <button
                                                         onClick={e => {
                                                            e.stopPropagation();
                                                            subOption.action();
                                                         }}
                                                         className="group w-full p-6 text-left transition-all hover:bg-blue-100 focus:bg-blue-100 focus:outline-none active:scale-95"
                                                      >
                                                         <div className="flex items-center gap-4">
                                                            {/* Ícone do sub-item */}
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 transition-all group-hover:scale-110">
                                                               <subOption.icon
                                                                  size={20}
                                                                  className="text-white"
                                                               />
                                                            </div>

                                                            {/* Label */}
                                                            <span className="flex-1 text-base font-bold tracking-widest text-black select-none">
                                                               {subOption.label}
                                                            </span>
                                                         </div>
                                                      </button>

                                                      {/* Divisor */}
                                                      {subIndex <
                                                         (option.subOptions
                                                            ?.length || 0) -
                                                            1 && (
                                                         <div className="mx-5 border-b border-slate-300" />
                                                      )}
                                                   </motion.div>
                                                )
                                             )}
                                          </div>
                                       </motion.div>
                                    )}
                                 </AnimatePresence>

                                 {/* Divisor */}
                                 {index < dropdownOptions.length - 1 && (
                                    <div className="mx-6 border-b-2 border-slate-400" />
                                 )}
                              </motion.div>
                           );
                        })}
                     </div>
                  </motion.div>
               </>
            )}
         </AnimatePresence>
      </div>
   );
}
