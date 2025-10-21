import { useState, useRef, useEffect } from 'react';
import { FaFilter } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { IoIosArrowDown } from 'react-icons/io';

// ================================================================================
// INTERFACES
// ================================================================================
interface SelectProps {
   value: number | 'todos';
   onChange: (value: number | 'todos') => void;
   diasDisponiveis: number[];
   disabled?: boolean;
   mostrarTodos?: boolean;
}

// ================================================================================
// COMPONENTE
// ================================================================================
export function SelectDiaTabelaOS({
   value,
   onChange,
   diasDisponiveis,
   disabled = false,
   mostrarTodos = true,
}: SelectProps) {
   const [isOpen, setIsOpen] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);

   // Efeito para garantir que o valor seja sempre válido
   useEffect(() => {
      // Se não mostra opção "todos" mas o valor atual é "todos", muda para o primeiro dia disponível
      if (!mostrarTodos && value === 'todos' && diasDisponiveis.length > 0) {
         onChange(diasDisponiveis[0]);
      }

      // Se o valor é um número mas não está na lista de dias disponíveis, muda para o primeiro dia disponível
      if (
         value !== 'todos' &&
         !diasDisponiveis.includes(value) &&
         diasDisponiveis.length > 0
      ) {
         onChange(diasDisponiveis[0]);
      }
   }, [value, mostrarTodos, diasDisponiveis, onChange]);

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

   // Determina o valor atual a ser mostrado
   const valorAtual = (() => {
      // Se não mostra "todos" e o valor é "todos", retorna o primeiro dia disponível
      if (!mostrarTodos && value === 'todos') {
         return diasDisponiveis[0] || 1;
      }

      // Se o valor é um número mas não está disponível, retorna o primeiro dia disponível
      if (value !== 'todos' && !diasDisponiveis.includes(value)) {
         return diasDisponiveis[0] || 1;
      }

      return value;
   })();

   // Criar array de opções
   const diasOptions = [
      ...(mostrarTodos
         ? [{ name: 'Todos os dias', code: 'todos' as const }]
         : []),
      ...diasDisponiveis.map(dia => ({
         name: dia.toString().padStart(2, '0'),
         code: dia,
      })),
   ];

   const selectedOption = diasOptions.find(opt => opt.code === valorAtual);

   const handleSelect = (code: string | number) => {
      // Só permite selecionar "todos" se mostrarTodos for true
      if (code === 'todos' && mostrarTodos) {
         onChange('todos');
      } else {
         onChange(Number(code));
      }
      setIsOpen(false);
   };

   const handleClear = () => {
      if (mostrarTodos) {
         onChange('todos');
         setIsOpen(false);
      }
   };

   const isDisabled = disabled || diasDisponiveis.length === 0;

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <div className="flex w-full flex-col gap-1">
         <label className="flex items-center gap-2 text-base font-extrabold tracking-widest text-black uppercase select-none">
            <FaFilter className="text-black" size={16} />
            Dia
         </label>

         <div ref={dropdownRef} className="relative w-full">
            {/* Input */}
            <button
               onClick={() => !isDisabled && setIsOpen(!isOpen)}
               disabled={isDisabled}
               className={`active: flex w-full cursor-pointer items-center justify-between rounded-md px-4 py-3 font-bold tracking-widest italic shadow-lg shadow-black transition-all ${
                  isDisabled
                     ? 'cursor-not-allowed bg-slate-200 text-slate-500 opacity-60'
                     : 'bg-white text-black focus:ring-2 focus:ring-pink-600 focus:outline-none'
               }`}
            >
               <span className="text-black">{selectedOption?.name}</span>
               {/* ===== */}
               <div className="flex items-center gap-2">
                  {valorAtual !== 'todos' && !isDisabled && mostrarTodos && (
                     <span
                        onClick={e => {
                           e.stopPropagation();
                           handleClear();
                        }}
                        className="cursor-pointer text-black transition-transform hover:scale-150 hover:text-red-500 active:scale-95"
                     >
                        <IoClose size={24} />
                     </span>
                  )}
                  <span
                     className={`transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                     } ${isDisabled ? 'text-gray-500' : 'text-black'}`}
                  >
                     <IoIosArrowDown size={24} />
                  </span>
               </div>
            </button>
            {/* ========== */}

            {/* Dropdown Panel */}
            {isOpen && !isDisabled && (
               <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-md bg-white shadow-md shadow-black">
                  {diasOptions.map(option => (
                     <button
                        key={option.code}
                        onClick={() => handleSelect(option.code)}
                        className={`w-full px-4 py-3 text-left font-bold tracking-widest italic transition-all duration-200 ${
                           valorAtual === option.code
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
