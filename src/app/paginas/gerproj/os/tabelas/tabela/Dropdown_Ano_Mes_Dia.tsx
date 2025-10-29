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
   diasDisponiveis: number[];
   disabled?: boolean;
   mostrarTodos?: boolean;
}

// ================================================================================
// DROPDONW ANO
// ================================================================================
export function DropdownAno({ value, onChange }: SelectProps) {
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

   const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(currentYear);
      setIsOpen(false);
   };

   // Mostrar X sempre que houver um valor selecionado
   const showClearButton = finalValue !== undefined && finalValue !== null;

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
               className="flex w-full cursor-pointer items-center justify-between rounded-md bg-white px-4 py-2.5 text-base font-extrabold tracking-widest italic shadow-md shadow-black transition-all hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none"
            >
               <span className="text-black">{selectedOption?.name}</span>
               {/* ===== */}
               <div className="flex items-center gap-2">
                  {showClearButton && (
                     <span
                        onClick={handleClear}
                        className="cursor-pointer text-black transition-all hover:scale-150 hover:text-red-500 active:scale-95"
                        title="Limpar Filtro"
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
                  {anosOptions.map(option => (
                     <button
                        key={option.code}
                        onClick={() => handleSelect(option.code)}
                        className={`w-full px-4 py-3 text-left font-bold tracking-widest italic transition-all ${
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
// ================================================================================

// ================================================================================
// DROPDONW MES
// ================================================================================
export function DropdownMes({ value, onChange }: SelectProps) {
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
               className="flex w-full cursor-pointer items-center justify-between rounded-md bg-white px-4 py-2.5 text-base font-extrabold tracking-widest italic shadow-md shadow-black transition-all hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none"
            >
               <span className="text-black">{selectedOption?.name}</span>
               {/* ===== */}
               <div className="flex items-center gap-2">
                  {showClearButton && (
                     <span
                        onClick={handleClear}
                        className="cursor-pointer text-black transition-all hover:scale-150 hover:text-red-500 active:scale-95"
                        title="Limpar Filtro"
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
                        className={`w-full px-4 py-3 text-left font-bold tracking-widest italic transition-all ${
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
// ================================================================================

// ================================================================================
// DROPDONW DIA
// ================================================================================
export function DropdownDia({
   value,
   onChange,
   diasDisponiveis,
   mostrarTodos = true,
}: SelectProps) {
   const currentDay = new Date().getDate();
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

   const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation(); // Impede a propagação do evento para o botão pai
      if (mostrarTodos) {
         onChange(currentDay);
         setIsOpen(false);
      }
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
            Dia
         </label>

         <div ref={dropdownRef} className="relative w-full">
            {/* Input */}
            <button
               onClick={() => setIsOpen(!isOpen)}
               className="flex w-full cursor-pointer items-center justify-between rounded-md bg-white px-4 py-2.5 text-base font-extrabold tracking-widest italic shadow-md shadow-black transition-all hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none"
            >
               <span className="text-black">{selectedOption?.name}</span>
               {/* ===== */}
               <div className="flex items-center gap-2">
                  {showClearButton && (
                     <span
                        onClick={handleClear}
                        className="cursor-pointer text-black transition-all hover:scale-150 hover:text-red-500 active:scale-95"
                        title="Limpar Filtro"
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
               <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-192 overflow-y-auto rounded-md bg-white shadow-md shadow-black">
                  {diasOptions.map(option => (
                     <button
                        key={option.code}
                        onClick={() => handleSelect(option.code)}
                        className={`w-full px-4 py-3 text-left font-bold tracking-widest italic transition-all ${
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
