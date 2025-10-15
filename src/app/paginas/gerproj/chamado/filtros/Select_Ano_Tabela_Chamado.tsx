import { useState, useRef, useEffect } from 'react';
import { FaFilter } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';
import { IoIosArrowDown } from 'react-icons/io';

// ================================================================================
// INTERFACES
// ================================================================================
interface SelectProps {
   value?: number | 'todos';
   onChange: (value: number | 'todos') => void;
}

// ================================================================================
// COMPONENTE
// ================================================================================
export function SelectAnoTabelaChamado({ value, onChange }: SelectProps) {
   const currentYear = new Date().getFullYear();
   const [isOpen, setIsOpen] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);

   const anosOptions = [
      { name: 'Todos os anos', code: 'todos' as const },
      { name: '2024', code: 2024 },
      { name: '2025', code: 2025 },
      { name: '2026', code: 2026 },
   ];

   // Usar ano atual como valor padrão se não for fornecido
   const finalValue = value ?? currentYear;
   const selectedOption = anosOptions.find(opt => opt.code === finalValue);

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

   const handleClear = () => {
      onChange('todos');
      setIsOpen(false);
   };

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <div className="flex w-full flex-col gap-1">
         <label className="flex items-center gap-2 text-base font-extrabold tracking-widest text-black uppercase select-none">
            <FaFilter className="text-black" size={16} />
            Ano
         </label>

         <div ref={dropdownRef} className="relative w-full">
            {/* Input */}
            <button
               onClick={() => setIsOpen(!isOpen)}
               className="flex w-full items-center justify-between rounded-md bg-white px-4 py-3 font-bold tracking-widest text-black italic shadow-md shadow-black transition-all duration-200 hover:scale-103 focus:scale-103 focus:ring-2 focus:ring-pink-600 focus:outline-none"
            >
               <span
                  className={
                     selectedOption?.code === 'todos'
                        ? 'text-gray-500'
                        : 'text-black'
                  }
               >
                  {selectedOption?.name || 'Selecione o ano'}
               </span>
               {/* ===== */}
               <div className="flex items-center gap-2">
                  {finalValue !== 'todos' && (
                     <span
                        onClick={e => {
                           e.stopPropagation();
                           handleClear();
                        }}
                        className="cursor-pointer"
                     >
                        <IoClose size={24} className="text-black" />
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
               <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-md bg-white shadow-md shadow-black">
                  {anosOptions.map(option => (
                     <button
                        key={option.code}
                        onClick={() => handleSelect(option.code)}
                        className={`w-full px-4 py-3 text-left font-bold tracking-widest italic transition-all duration-200 ${
                           finalValue === option.code
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
