'use client';
// IMPORTS
import { useState, useRef, useEffect } from 'react';

// ICONS
import { IoClose } from 'react-icons/io5';
import { IoIosArrowDown } from 'react-icons/io';

// ================================================================================
// INTERFACES
// ================================================================================
interface DropdownProps {
   value: string;
   onChange: (value: string) => void;
}

// ================================================================================
// COMPONENTE DROPDOWN STATUS
// ================================================================================
export function DropdownStatus({ value, onChange }: DropdownProps) {
   const [isOpen, setIsOpen] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);

   const options = [
      { name: 'ATRIBUIDO', code: 'ATRIBUIDO' },
      { name: 'AGUARDANDO VALIDACAO', code: 'AGUARDANDO VALIDACAO' },
      { name: 'EM ATENDIMENTO', code: 'EM ATENDIMENTO' },
      { name: 'FINALIZADO', code: 'FINALIZADO' },
      { name: 'NAO FINALIZADO', code: 'NAO FINALIZADO' },
      { name: 'NAO INICIADO', code: 'NAO INICIADO' },
      { name: 'STANDBY', code: 'STANDBY' },
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
            className={`group relative flex w-full cursor-pointer items-center justify-between rounded-md py-2.5 pr-4 pl-4 tracking-widest italic shadow-sm shadow-black transition-all hover:shadow-lg hover:shadow-black focus:ring-2 focus:ring-pink-500 focus:outline-none active:scale-95 ${
               value
                  ? 'bg-white text-black ring-2 ring-pink-500 focus:outline-none'
                  : 'border border-teal-950 bg-teal-900 text-white hover:shadow-lg hover:shadow-black'
            }`}
         >
            <span>{selectedOption?.name}</span>

            <div className="flex items-center gap-2">
               {value && (
                  <span
                     onClick={handleClear}
                     className="cursor-pointer text-black transition-all hover:scale-150 hover:rotate-180 hover:text-red-500"
                     title="Limpar"
                  >
                     <IoClose size={24} />
                  </span>
               )}
               <span
                  className={`transition-all ${isOpen ? 'rotate-180' : ''} ${
                     value ? 'text-black' : 'text-white'
                  }`}
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

// ====================================================================================================

// ================================================================================
// COMPONENTE DROPDOWN CLASSIFICACAO
// ================================================================================
export function DropdownClassificacao({ value, onChange }: DropdownProps) {
   const [isOpen, setIsOpen] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);

   const options = [
      { name: '0 - SEM CLASSIFICACAO', code: '0' },
      { name: '1 - SUPORTE AO USUARIO', code: '1' },
      { name: '2 - ERRO DO PROTHEUS', code: '2' },
      { name: '3 - MELHORIA', code: '3' },
      { name: '4 - ERRO DA SOLUTII', code: '4' },
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
            className={`group relative flex w-full cursor-pointer items-center justify-between rounded-md py-2.5 pr-4 pl-4 tracking-widest italic shadow-sm shadow-black transition-all hover:shadow-lg hover:shadow-black focus:ring-2 focus:ring-pink-500 focus:outline-none active:scale-95 ${
               value
                  ? 'bg-white text-black ring-2 ring-pink-500 focus:outline-none'
                  : 'border border-teal-950 bg-teal-900 text-white hover:shadow-lg hover:shadow-black'
            }`}
         >
            <span>{selectedOption?.name}</span>

            <div className="flex items-center gap-2">
               {value && (
                  <span
                     onClick={handleClear}
                     className="cursor-pointer text-black transition-all hover:scale-150 hover:rotate-180 hover:text-red-500"
                     title="Limpar"
                  >
                     <IoClose size={24} />
                  </span>
               )}
               <span
                  className={`transition-all ${isOpen ? 'rotate-180' : ''} ${
                     value ? 'text-black' : 'text-white'
                  }`}
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
