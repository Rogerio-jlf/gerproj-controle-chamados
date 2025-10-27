// IMPORTS
import { useState, useRef, useEffect } from 'react';

// ICONS
import { FaCalendarAlt } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { IoIosArrowDown } from 'react-icons/io';

// ================================================================================
// INTERFACES
// ================================================================================
interface SelectDataProps {
   value: Date | null;
   onChange: (value: Date | null) => void;
   datasDisponiveis: Date[];
   placeholder?: string;
   disabled?: boolean;
   mostrarLimpar?: boolean;
   label: string;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export function SelectData({
   value,
   onChange,
   datasDisponiveis,
   placeholder = 'Selecione uma data',
   mostrarLimpar = true,
   label,
}: SelectDataProps) {
   const [isOpen, setIsOpen] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);

   // Formatar data para exibição
   const formatarData = (data: Date): string => {
      return data.toLocaleDateString('pt-BR', {
         day: '2-digit',
         month: '2-digit',
         year: 'numeric',
      });
   };

   // Formatar data para comparação
   const formatarDataParaComparacao = (data: Date): string => {
      return data.toISOString().split('T')[0];
   };

   // Efeito para fechar dropdown ao clicar fora
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

   // Criar array de opções ordenadas (mais recente primeiro)
   const opcoesOrdenadas = [...datasDisponiveis].sort(
      (a, b) => b.getTime() - a.getTime()
   );

   const opcoes = opcoesOrdenadas.map(data => ({
      label: formatarData(data),
      value: data,
      key: formatarDataParaComparacao(data),
   }));

   const handleSelect = (data: Date) => {
      onChange(data);
      setIsOpen(false);
   };

   const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
      setIsOpen(false);
   };

   const textoExibido = value ? formatarData(value) : placeholder;

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <div className="flex w-full flex-col gap-1">
         <label className="flex items-center gap-2 text-base font-extrabold tracking-widest text-black uppercase select-none">
            <FaCalendarAlt className="text-black" size={16} />
            {label}
         </label>

         <div ref={dropdownRef} className="relative w-full">
            {/* Input */}
            <button
               onClick={() => setIsOpen(!isOpen)}
               className="flex w-full cursor-pointer items-center justify-between rounded-md bg-white px-4 py-3 font-bold tracking-widest text-black italic shadow-md shadow-black transition-all hover:bg-white/50 focus:ring-2 focus:ring-pink-600 focus:outline-none active:scale-95"
            >
               <span className={`${!value ? 'text-gray-500' : 'text-black'}`}>
                  {textoExibido}
               </span>

               <div className="flex items-center gap-2">
                  {mostrarLimpar && value && (
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

            {/* Dropdown Panel */}
            {isOpen && (
               <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-md bg-white shadow-md shadow-black">
                  {opcoes.length > 0 ? (
                     opcoes.map(option => (
                        <button
                           key={option.key}
                           onClick={() => handleSelect(option.value)}
                           className={`w-full px-4 py-3 text-left font-bold tracking-widest italic transition-all ${
                              value &&
                              formatarDataParaComparacao(value) === option.key
                                 ? 'bg-blue-500 text-white'
                                 : 'text-black hover:bg-black hover:text-white'
                           }`}
                        >
                           {option.label}
                        </button>
                     ))
                  ) : (
                     <div className="px-4 py-3 text-center text-gray-500 italic">
                        Nenhuma data disponível
                     </div>
                  )}
               </div>
            )}
         </div>
      </div>
   );
}

interface SelectDataInicioProps {
   value: Date | null;
   onChange: (value: Date | null) => void;
   datasDisponiveis: Date[];
   disabled?: boolean;
}

export function SelectDataInicio({
   value,
   onChange,
   datasDisponiveis,
   disabled = false,
}: SelectDataInicioProps) {
   return (
      <SelectData
         value={value}
         onChange={onChange}
         datasDisponiveis={datasDisponiveis}
         placeholder="Data início"
         label="Data Início"
         mostrarLimpar={true}
         disabled={disabled}
      />
   );
}

interface SelectDataFimProps {
   value: Date | null;
   onChange: (value: Date | null) => void;
   datasDisponiveis: Date[];
   disabled?: boolean;
}

export function SelectDataFim({
   value,
   onChange,
   datasDisponiveis,
   disabled = false,
}: SelectDataFimProps) {
   return (
      <SelectData
         value={value}
         onChange={onChange}
         datasDisponiveis={datasDisponiveis}
         placeholder="Data fim"
         label="Data Fim"
         mostrarLimpar={true}
         disabled={disabled}
      />
   );
}
