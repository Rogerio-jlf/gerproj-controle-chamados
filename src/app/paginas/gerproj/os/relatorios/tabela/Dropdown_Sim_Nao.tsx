// IMPORTS
import { useState, useRef, useEffect } from 'react';

// ICONS
import { IoClose } from 'react-icons/io5';
import { IoIosArrowDown } from 'react-icons/io';

// ================================================================================
// INTERFACES
// ================================================================================
interface SelectSimNaoProps {
   value: string;
   onChange: (value: string) => void;
}

// ================================================================================
// COMPONENTE
// ================================================================================
export function DropdownSimNao({ value, onChange }: SelectSimNaoProps) {
   const [isOpen, setIsOpen] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);

   const options = [
      { name: 'SIM', code: 'SIM' },
      { name: 'NÃO', code: 'NAO' },
   ];

   const selectedOption = options.find(opt => opt.code === value);

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

   const handleSelect = (code: string) => {
      onChange(code);
      setIsOpen(false);
   };

   const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange('');
      setIsOpen(false);
   };

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <div ref={dropdownRef} className="relative w-full">
         {/* Button */}
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex w-full cursor-pointer items-center justify-between rounded-md bg-gradient-to-br from-teal-600 to-teal-700 px-4 py-2.5 text-base font-extrabold tracking-widest italic shadow-md shadow-black transition-all hover:scale-108 focus:ring-2 focus:ring-pink-500 focus:outline-none"
         >
            <span className={value ? 'text-white' : 'text-slate-400'}>
               {selectedOption?.name}
            </span>

            <div className="flex items-center gap-2">
               {value && (
                  <span
                     onClick={handleClear}
                     className="cursor-pointer text-white transition-all hover:scale-150 hover:text-red-500 active:scale-95"
                     title="Limpar"
                  >
                     <IoClose size={24} />
                  </span>
               )}
               <span
                  className={`text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
               >
                  <IoIosArrowDown size={24} />
               </span>
            </div>
         </button>

         {/* Dropdown Panel */}
         {isOpen && (
            <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-md bg-white shadow-md shadow-black">
               {options.map(option => (
                  <button
                     key={option.code}
                     onClick={() => handleSelect(option.code)}
                     className={`w-full px-4 py-2.5 text-left text-base font-semibold tracking-widest italic transition-all ${
                        value === option.code
                           ? 'bg-blue-600 text-white'
                           : 'text-black hover:bg-black hover:text-white'
                     }`}
                  >
                     {option.name}
                  </button>
               ))}
            </div>
         )}
      </div>
   );
}
