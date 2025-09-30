import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// ================================================================================
import { GrServices } from 'react-icons/gr';
import { FaTasks, FaChartBar, FaCog } from 'react-icons/fa';
import { MdArrowDropDown } from 'react-icons/md';
import { HiOutlineDocumentReport } from 'react-icons/hi';

// ================================================================================
// INTERFACES
// ================================================================================
interface DropdownOption {
   id: string;
   label: string;
   icon: React.ComponentType<{ size?: number; className?: string }>;
   description: string;
   action: () => void;
   bgGradient: string;
   hoverGradient: string;
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
   onOpenRelatorios,
   onOpenConfiguracoes,
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
         label: 'Tabela de OS',
         icon: GrServices,
         description: 'Visualizar Ordens de Serviço',
         action: () => {
            onOpenTabelaOS();
            setIsOpen(false);
         },
         bgGradient: 'from-emerald-500 to-emerald-600',
         hoverGradient: 'from-emerald-600 to-emerald-700',
         iconColor: 'text-white',
      },
      {
         id: 'tabela-tarefas',
         label: 'Tabela de Tarefas',
         icon: FaTasks,
         description: 'Gerenciar Tarefas do Sistema',
         action: () => {
            onOpenTabelaTarefas();
            setIsOpen(false);
         },
         bgGradient: 'from-orange-500 to-orange-600',
         hoverGradient: 'from-orange-600 to-orange-700',
         iconColor: 'text-white',
      },
      ...(onOpenRelatorios
         ? [
              {
                 id: 'relatorios',
                 label: 'Relatórios',
                 icon: HiOutlineDocumentReport,
                 description: 'Visualizar Relatórios e Análises',
                 action: () => {
                    onOpenRelatorios();
                    setIsOpen(false);
                 },
                 bgGradient: 'from-blue-500 to-blue-600',
                 hoverGradient: 'from-blue-600 to-blue-700',
                 iconColor: 'text-white',
              },
           ]
         : []),
      ...(onOpenConfiguracoes
         ? [
              {
                 id: 'configuracoes',
                 label: 'Configurações',
                 icon: FaCog,
                 description: 'Ajustes do Sistema',
                 action: () => {
                    onOpenConfiguracoes();
                    setIsOpen(false);
                 },
                 bgGradient: 'from-purple-500 to-purple-600',
                 hoverGradient: 'from-purple-600 to-purple-700',
                 iconColor: 'text-white',
              },
           ]
         : []),
   ];

   return (
      <div className="relative" ref={dropdownRef}>
         {/* Botão Principal do Dropdown */}
         <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-3 text-white shadow-lg shadow-black/30 transition-all duration-300 hover:from-teal-700 hover:to-teal-800 hover:shadow-xl hover:shadow-black/40 focus:ring-4 focus:ring-teal-300/50 focus:outline-none"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
         >
            <FaChartBar className="text-white" size={20} />
            <span className="text-lg font-bold tracking-wider uppercase">
               Módulos
            </span>
            <motion.div
               animate={{ rotate: isOpen ? 180 : 0 }}
               transition={{ duration: 0.3, ease: 'easeOut' }}
            >
               <MdArrowDropDown size={24} />
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
                     className="fixed inset-0 z-40 bg-black/10"
                     onClick={() => setIsOpen(false)}
                  />

                  {/* Menu Container */}
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: -10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: -10 }}
                     transition={{ duration: 0.2, ease: 'easeOut' }}
                     className="absolute top-full right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl shadow-black/20"
                  >
                     {/* Header do Menu */}
                     <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4">
                        <h3 className="text-lg font-bold tracking-wider text-white uppercase">
                           Módulos do Sistema
                        </h3>
                        <p className="text-sm text-teal-100">
                           Selecione um módulo para acessar
                        </p>
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
                                    className="group w-full px-6 py-4 text-left transition-all duration-300 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                                 >
                                    <div className="flex items-center gap-4">
                                       {/* Ícone */}
                                       <motion.div
                                          className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${isHovered ? option.hoverGradient : option.bgGradient} shadow-lg transition-all duration-300`}
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.95 }}
                                       >
                                          <option.icon
                                             size={20}
                                             className={option.iconColor}
                                          />
                                       </motion.div>

                                       {/* Conteúdo */}
                                       <div className="flex-1">
                                          <h4 className="text-lg font-bold tracking-wider text-gray-800 group-hover:text-gray-900">
                                             {option.label}
                                          </h4>
                                          <p className="text-sm text-gray-600 group-hover:text-gray-700">
                                             {option.description}
                                          </p>
                                       </div>

                                       {/* Indicador de seta */}
                                       <motion.div
                                          className="text-gray-400 group-hover:text-gray-600"
                                          animate={{ x: isHovered ? 5 : 0 }}
                                          transition={{ duration: 0.2 }}
                                       >
                                          <MdArrowDropDown
                                             size={20}
                                             className="rotate-[-90deg]"
                                          />
                                       </motion.div>
                                    </div>
                                 </button>

                                 {/* Divisor */}
                                 {index < dropdownOptions.length - 1 && (
                                    <div className="mx-6 border-b border-gray-200" />
                                 )}
                              </motion.div>
                           );
                        })}
                     </div>

                     {/* Footer do Menu */}
                     <div className="bg-gray-50 px-6 py-3 text-center">
                        <p className="text-xs text-gray-500 italic">
                           {dropdownOptions.length} módulo
                           {dropdownOptions.length !== 1 ? 's' : ''} disponível
                           {dropdownOptions.length !== 1 ? 'is' : ''}
                        </p>
                     </div>
                  </motion.div>
               </>
            )}
         </AnimatePresence>
      </div>
   );
}
