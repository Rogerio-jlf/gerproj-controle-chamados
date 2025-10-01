import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// ================================================================================
import { GrServices } from 'react-icons/gr';
import { FaTasks, FaChartBar } from 'react-icons/fa';
import { MdArrowDropDown } from 'react-icons/md';

// ================================================================================
// INTERFACES
// ================================================================================
interface DropdownOption {
   id: string;
   label: string;
   icon: React.ComponentType<{ size?: number; className?: string }>;
   description: string;
   action: () => void;
   bg: string;
   iconColor: string;
}

interface DropdownHeaderProps {
   onOpenTabelaOS: () => void;
   onOpenTabelaTarefas: () => void;
   onOpenRelatorios?: () => void;
   onOpenConfiguracoes?: () => void;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export default function DropdownHeader({
   onOpenTabelaOS,
   onOpenTabelaTarefas,
}: DropdownHeaderProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [hoveredOption, setHoveredOption] = useState<string | null>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);

   // Fecha dropdown ao clicar fora
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
         ) {
            setIsOpen(false);
         }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () =>
         document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   // Opções do dropdown
   const dropdownOptions: DropdownOption[] = [
      {
         id: 'tabela-os',
         label: 'Tabela OS',
         icon: GrServices,
         description: "Gerenciamento de OS's e Chamados",
         action: () => {
            onOpenTabelaOS();
            setIsOpen(false);
         },
         bg: 'green-600',
         iconColor: 'text-white',
      },
      // ==========
      {
         id: 'tabela-tarefas',
         label: 'Tabela Tarefas',
         icon: FaTasks,
         description: 'Gerenciamento de Tarefas',
         action: () => {
            onOpenTabelaTarefas();
            setIsOpen(false);
         },
         bg: 'orange-600',
         iconColor: 'text-white',
      },
   ];

   return (
      <div className="relative" ref={dropdownRef}>
         {/* Botão Principal do Dropdown */}
         <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex cursor-pointer items-center justify-center gap-4 rounded-md border-none bg-teal-700 px-10 py-4 text-lg font-extrabold tracking-wider text-white italic shadow-sm shadow-black transition-all select-none hover:-translate-y-1 hover:scale-102 hover:bg-teal-900 active:scale-95"
         >
            <FaChartBar className="text-white" size={24} />
            <span className="text-lg font-extrabold tracking-wider text-white uppercase select-none">
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
                  {/* Backdrop */}
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="fixed inset-0 z-40 bg-black/50"
                     onClick={() => setIsOpen(false)}
                  />

                  {/* Menu Container */}
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: -10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: -10 }}
                     transition={{ duration: 0.2, ease: 'easeOut' }}
                     className="absolute top-full right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border-none bg-white shadow-2xl shadow-black"
                  >
                     {/* Header do Menu */}
                     <div className="bg-teal-700 p-6 text-center shadow-sm shadow-black">
                        <h3 className="text-lg font-bold tracking-wider text-white uppercase select-none">
                           Módulos do Sistema
                        </h3>
                     </div>

                     {/* Lista de Opções */}
                     <div className="max-h-80 overflow-y-auto">
                        {dropdownOptions.map((option, index) => {
                           const isHovered = hoveredOption === option.id;

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
                              >
                                 <button
                                    onClick={option.action}
                                    onMouseEnter={() =>
                                       setHoveredOption(option.id)
                                    }
                                    onMouseLeave={() => setHoveredOption(null)}
                                    className="group w-full p-6 text-left transition-all hover:bg-teal-100 focus:bg-teal-100 focus:outline-none active:scale-95"
                                 >
                                    <div className="flex items-center gap-4">
                                       {/* Ícone */}
                                       <motion.div
                                          className={`flex h-14 w-14 items-center justify-center rounded-full group-hover:scale-105 bg-${option.bg} transition-all`}
                                       >
                                          <option.icon
                                             size={24}
                                             className={option.iconColor}
                                          />
                                       </motion.div>

                                       {/* Conteúdo */}
                                       <div className="flex-1">
                                          <h4 className="text-lg font-bold tracking-wider text-black italic select-none">
                                             {option.label}
                                          </h4>
                                          <p className="text-sm font-semibold tracking-wider text-slate-500 italic select-none group-hover:text-black">
                                             {option.description}
                                          </p>
                                       </div>

                                       {/* Indicador de seta */}
                                       <motion.div
                                          className="text-slate-400 group-hover:text-black"
                                          animate={{ x: isHovered ? 5 : 0 }}
                                          transition={{ duration: 0.2 }}
                                       >
                                          <MdArrowDropDown
                                             size={28}
                                             className="rotate-[-90deg]"
                                          />
                                       </motion.div>
                                    </div>
                                 </button>
                                 {/* ========== */}

                                 {/* Divisor */}
                                 {index < dropdownOptions.length - 1 && (
                                    <div className="mx-6 border-b-2 border-slate-400" />
                                 )}
                              </motion.div>
                           );
                        })}
                     </div>

                     {/* Footer do Menu */}
                     <div className="bg-teal-700 p-2"></div>
                  </motion.div>
               </>
            )}
         </AnimatePresence>
      </div>
   );
}
