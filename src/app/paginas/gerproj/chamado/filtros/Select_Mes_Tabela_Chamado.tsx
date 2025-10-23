// IMPORTS
import { useState, useRef, useEffect } from 'react';

// ICONS
import { FaFilter } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { IoIosArrowDown } from 'react-icons/io';

// ================================================================================
// INTERFACES
// ================================================================================
interface SelectProps {
   value: number | 'todos';
   onChange: (value: number | 'todos') => void;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export function SelectMesTabelaChamado({ value, onChange }: SelectProps) {
   const currentMonth = new Date().getMonth() + 1;
   const [isOpen, setIsOpen] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);

   const mesesOptions = [
      { name: 'Todos os meses', code: 'todos' as const },
      { name: 'Janeiro', code: 1 },
      { name: 'Fevereiro', code: 2 },
      { name: 'Março', code: 3 },
      { name: 'Abril', code: 4 },
      { name: 'Maio', code: 5 },
      { name: 'Junho', code: 6 },
      { name: 'Julho', code: 7 },
      { name: 'Agosto', code: 8 },
      { name: 'Setembro', code: 9 },
      { name: 'Outubro', code: 10 },
      { name: 'Novembro', code: 11 },
      { name: 'Dezembro', code: 12 },
   ];

   const selectedOption = mesesOptions.find(opt => opt.code === value);

   // Fechar dropdown ao clicar fora
   useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
         ) {
            setIsOpen(false);
         }
      }

      document.addEventListener('mousedown', handleClickOutside);
      return () =>
         document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   const handleSelect = (code: string | number) => {
      onChange(code as number | 'todos');
      setIsOpen(false);
   };

   const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(currentMonth);
      setIsOpen(false);
   };

   // Mostrar X sempre que houver um valor selecionado
   const showClearButton = value !== undefined && value !== null;

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <div className="flex w-full flex-col gap-1">
         <label className="flex items-center gap-2 text-base font-extrabold tracking-widest text-black uppercase select-none">
            <FaFilter className="text-black" size={16} />
            Mês
         </label>

         <div ref={dropdownRef} className="relative w-full">
            {/* Input */}
            <button
               onClick={() => setIsOpen(!isOpen)}
               className="flex w-full cursor-pointer items-center justify-between rounded-md bg-white px-4 py-3 font-bold tracking-widest text-black italic shadow-lg shadow-black transition-all focus:ring-2 focus:ring-pink-600 focus:outline-none active:scale-95"
            >
               <span className="text-black">{selectedOption?.name}</span>
               {/* ===== */}
               <div className="flex items-center gap-2">
                  {showClearButton && (
                     <span
                        onClick={handleClear}
                        className="cursor-pointer text-black transition-transform hover:scale-150 hover:text-red-500 active:scale-95"
                     >
                        <IoClose size={24} />
                     </span>
                  )}
                  <span
                     className={`text-black transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  >
                     <IoIosArrowDown size={24} />
                  </span>
               </div>
            </button>
            {/* ========== */}

            {/* Dropdown Panel */}
            {isOpen && (
               <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-y-auto rounded-md bg-white shadow-md shadow-black">
                  {mesesOptions.map(option => (
                     <button
                        key={option.code}
                        onClick={() => handleSelect(option.code)}
                        className={`w-full px-4 py-3 text-left font-bold tracking-widest italic transition-all duration-200 ${
                           value === option.code
                              ? 'bg-blue-500 text-white'
                              : 'text-black hover:bg-black hover:text-white'
                        }`}
                     >
                        {option.name}
                     </button>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
