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
   ano: number | 'todos';
   mes: number | 'todos';
   dataFim: number | 'todos';
}

// ================================================================================
// FUNÇÃO AUXILIAR - GERAR DIAS DO MÊS
// ================================================================================
function getDiasDoMes(ano: number, mes: number): number[] {
   const ultimoDia = new Date(ano, mes, 0).getDate();
   return Array.from({ length: ultimoDia }, (_, i) => i + 1);
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export function SelectDataFimTabelaOS({
   value,
   onChange,
   ano,
   mes,
   dataFim,
}: SelectProps) {
   const [isOpen, setIsOpen] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);

   // Verificar se há ano e mês válidos selecionados
   const anoValido = typeof ano === 'number';
   const mesValido = typeof mes === 'number';
   const podeSelecionar = anoValido && mesValido;

   // Gerar opções de dias (filtrar se data início estiver definida)
   const todosDias = podeSelecionar
      ? getDiasDoMes(ano as number, mes as number)
      : [];

   const diasFiltrados =
      dataFim !== 'todos' ? todosDias.filter(dia => dia >= dataFim) : todosDias;

   const diasOptions = [
      { name: 'Todas as datas', code: 'todos' as const },
      ...diasFiltrados.map(dia => ({
         name: dia.toString().padStart(2, '0'),
         code: dia,
      })),
   ];

   const selectedOption = diasOptions.find(opt => opt.code === value);

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
      if (!podeSelecionar && code !== 'todos') return;
      onChange(code as number | 'todos');
      setIsOpen(false);
   };

   const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange('todos');
      setIsOpen(false);
   };

   const showClearButton = value !== 'todos';

   const getPlaceholderText = () => {
      if (!podeSelecionar) return 'Selecione ano e mês';
      if (dataFim !== 'todos' && diasFiltrados.length === 0) {
         return 'Nenhuma data disponível';
      }
      return selectedOption?.name || 'Selecione';
   };

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <div className="flex w-full flex-col gap-1">
         <label className="flex items-center gap-2 text-base font-extrabold tracking-widest text-black uppercase select-none">
            <FaFilter className="text-black" size={16} />
            Data Fim
         </label>

         <div ref={dropdownRef} className="relative w-full">
            {/* Input */}
            <button
               onClick={() => podeSelecionar && setIsOpen(!isOpen)}
               disabled={!podeSelecionar}
               className={`flex w-full items-center justify-between rounded-md px-4 py-3 font-bold tracking-widest italic shadow-md shadow-black transition-all focus:ring-2 focus:ring-pink-600 focus:outline-none ${
                  podeSelecionar
                     ? 'cursor-pointer bg-white text-black hover:bg-white/50 active:scale-95'
                     : 'cursor-not-allowed bg-gray-300 text-gray-500'
               }`}
            >
               <span>{getPlaceholderText()}</span>
               {/* ===== */}
               <div className="flex items-center gap-2">
                  {showClearButton && podeSelecionar && (
                     <span
                        onClick={handleClear}
                        className="cursor-pointer text-black transition-transform hover:scale-150 hover:text-red-500 active:scale-95"
                     >
                        <IoClose size={24} />
                     </span>
                  )}
                  <span
                     className={`transition-transform duration-200 ${
                        podeSelecionar ? 'text-black' : 'text-gray-500'
                     } ${isOpen ? 'rotate-180' : ''}`}
                  >
                     <IoIosArrowDown size={24} />
                  </span>
               </div>
            </button>
            {/* ========== */}

            {/* Dropdown Panel */}
            {isOpen && podeSelecionar && (
               <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-md bg-white shadow-md shadow-black">
                  {diasOptions.map(option => (
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
