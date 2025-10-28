// IMPORTS
import { useState, useRef, useEffect } from 'react';

// ICONS
import { IoClose } from 'react-icons/io5';
import { FaFilter, FaSpinner } from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';

// ================================================================================
// INTERFACES
// ================================================================================
interface Recurso {
   cod_recurso: number;
   nome_recurso: string;
   hrdia_decimal?: number;
   hrdia_formatado?: string;
   custo_recurso?: number;
   receita_recurso?: number;
   tpcusto_recurso?: number;
}

interface SelectRecursoTabelaOSProps {
   value: number | 'todos';
   onChange: (value: number | 'todos') => void;
   recursos: Recurso[];
   placeholder?: string;
   isLoading?: boolean;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export function DropdownRecursos({
   value,
   onChange,
   recursos,
   placeholder = 'Selecione um recurso',
   isLoading = false,
}: SelectRecursoTabelaOSProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
   const dropdownRef = useRef<HTMLDivElement>(null);
   const searchInputRef = useRef<HTMLInputElement>(null);

   const selectedRecurso = recursos.find(r => r.cod_recurso === value);

   // Fechar dropdown ao clicar fora
   useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
         ) {
            setIsOpen(false);
            setSearchTerm('');
         }
      }

      document.addEventListener('mousedown', handleClickOutside);
      return () =>
         document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   // Focar no input de busca quando abrir
   useEffect(() => {
      if (isOpen && searchInputRef.current) {
         searchInputRef.current.focus();
      }
   }, [isOpen]);

   const handleSelect = (codRecurso: number | 'todos') => {
      onChange(codRecurso);
      setIsOpen(false);
      setSearchTerm('');
   };

   const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange('todos');
      setIsOpen(false);
      setSearchTerm('');
   };

   // Filtrar recursos baseado na busca
   const recursosFiltrados = recursos.filter(recurso =>
      recurso.nome_recurso.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const showClearButton = value !== 'todos';

   return (
      <div className="flex w-full flex-col gap-1">
         <label className="flex items-center gap-2 text-base font-extrabold tracking-widest text-black uppercase select-none">
            <FaFilter className="text-black" size={16} />
            Recurso
         </label>

         <div ref={dropdownRef} className="relative w-full">
            <button
               onClick={() => !isLoading && setIsOpen(!isOpen)}
               disabled={isLoading}
               className="relative flex w-full cursor-pointer items-center justify-between rounded-md border-t border-black/10 bg-white py-3 pr-4 pl-10 text-base font-semibold tracking-widest text-black italic shadow-md shadow-black transition-all hover:bg-slate-200 focus:ring-2 focus:ring-pink-600 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
               <span
                  className={`tracking-widest ${!selectedRecurso || value === 'todos' ? 'text-slate-500' : 'text-black'}`}
               >
                  {isLoading
                     ? 'Carregando recursos...'
                     : selectedRecurso
                       ? selectedRecurso.nome_recurso
                       : placeholder}
               </span>
               <div className="flex items-center gap-2">
                  {isLoading && (
                     <FaSpinner
                        className="animate-spin text-gray-500"
                        size={20}
                     />
                  )}
                  {showClearButton && !isLoading && (
                     <span
                        onClick={handleClear}
                        className="cursor-pointer text-black transition-all hover:scale-150 hover:text-red-500"
                     >
                        <IoClose size={20} />
                     </span>
                  )}
                  <span
                     className={`text-black transition-all ${isOpen ? 'rotate-180' : ''}`}
                  >
                     <IoIosArrowDown size={20} />
                  </span>
               </div>
            </button>

            {isOpen && !isLoading && (
               <div className="absolute top-full right-0 left-0 z-50 mt-3 max-h-[330px] overflow-hidden rounded-md bg-white shadow-sm shadow-black">
                  {/* Campo de busca */}
                  <div className="sticky top-0 bg-teal-900 p-4 shadow-sm shadow-black">
                     <input
                        ref={searchInputRef}
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar recurso..."
                        className="w-full rounded-md bg-white p-4 text-sm font-semibold tracking-widest text-black italic select-none placeholder:tracking-widest placeholder:text-slate-500 placeholder:italic focus:ring-2 focus:ring-pink-600 focus:outline-none"
                        onClick={e => e.stopPropagation()}
                     />
                  </div>

                  {/* Lista de recursos */}
                  <div className="max-h-[250px] overflow-y-auto">
                     {/* Opção "Todos" */}
                     <button
                        onClick={() => handleSelect('todos')}
                        className={`w-full p-4 text-left font-semibold tracking-widest italic transition-all select-none ${
                           value === 'todos'
                              ? 'bg-blue-500 text-white'
                              : 'text-black hover:bg-black hover:text-white'
                        }`}
                     >
                        Todos os Recursos
                     </button>

                     {recursosFiltrados.length > 0 ? (
                        recursosFiltrados.map(recurso => (
                           <button
                              key={recurso.cod_recurso}
                              onClick={() => handleSelect(recurso.cod_recurso)}
                              className={`w-full p-4 text-left font-semibold tracking-widest italic transition-all select-none ${
                                 value === recurso.cod_recurso
                                    ? 'bg-blue-500 text-white'
                                    : 'text-black hover:bg-black hover:text-white'
                              }`}
                           >
                              {recurso.nome_recurso}
                           </button>
                        ))
                     ) : (
                        <div className="p-4 text-center text-sm font-semibold tracking-widest text-slate-500 italic select-none">
                           Nenhum recurso encontrado
                        </div>
                     )}
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
