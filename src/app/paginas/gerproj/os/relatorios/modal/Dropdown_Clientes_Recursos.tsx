// IMPORTS
import { useState, useRef, useEffect } from 'react';

// ICONS
import { IoClose } from 'react-icons/io5';
import { IoIosArrowDown } from 'react-icons/io';
import { FaFilter, FaSpinner } from 'react-icons/fa';

// =================================================================================
// INTERFACES
// =================================================================================
interface Cliente {
   cod_cliente: number;
   nome_cliente: string;
   email_cliente?: string;
}

interface DropdownClienteProps {
   value: number | 'todos';
   onChange: (value: number | 'todos') => void;
   clientes: Cliente[];
   placeholder?: string;
   isLoading?: boolean;
}

interface Recurso {
   cod_recurso: number;
   nome_recurso: string;
   hrdia_decimal?: number;
   hrdia_formatado?: string;
   custo_recurso?: number;
   receita_recurso?: number;
   tpcusto_recurso?: number;
}

interface DropdownRecursosProps {
   value: number | 'todos';
   onChange: (value: number | 'todos') => void;
   recursos: Recurso[];
   placeholder?: string;
   isLoading?: boolean;
}

// =================================================================================
// DROPDOWN CLIENTES
// =================================================================================
export function DropdownClientes({
   value,
   onChange,
   clientes,
   placeholder = 'Selecione um cliente',
   isLoading = false,
}: DropdownClienteProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
   const dropdownRef = useRef<HTMLDivElement>(null);

   const selectedCliente = clientes.find(c => c.cod_cliente === value);

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

   const handleSelect = (codCliente: number | 'todos') => {
      onChange(codCliente);
      setIsOpen(false);
      setSearchTerm('');
   };

   const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange('todos');
      setIsOpen(false);
      setSearchTerm('');
   };

   // Filtrar clientes baseado na busca
   const clientesFiltrados = clientes.filter(cliente =>
      cliente.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const showClearButton = value !== 'todos';

   // =================================================================================
   // RENDERIZAÇÃO
   // =================================================================================
   return (
      <div className="flex w-full flex-col gap-1">
         <label className="flex items-center gap-2 text-base font-extrabold tracking-widest text-black uppercase select-none">
            <FaFilter className="text-black" size={16} />
            Cliente
         </label>

         <div ref={dropdownRef} className="relative w-full">
            <button
               onClick={() => !isLoading && setIsOpen(!isOpen)}
               disabled={isLoading}
               className="flex w-full cursor-pointer items-center justify-between rounded-md bg-white px-4 py-2.5 text-base font-extrabold tracking-widest italic shadow-md shadow-black transition-all hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none"
            >
               <span
                  className={`tracking-widest ${!selectedCliente || value === 'todos' ? 'text-slate-500' : 'text-black'}`}
               >
                  {isLoading
                     ? 'Carregando clientes...'
                     : selectedCliente
                       ? selectedCliente.nome_cliente
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
                        className="cursor-pointer text-black transition-all hover:scale-150 hover:text-red-500 active:scale-95"
                        title="Limpar Filtro"
                     >
                        <IoClose size={24} />
                     </span>
                  )}
                  <span
                     className={`text-black transition-all ${isOpen ? 'rotate-180' : ''}`}
                  >
                     <IoIosArrowDown size={24} />
                  </span>
               </div>
            </button>

            {isOpen && !isLoading && (
               <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-192 overflow-y-auto rounded-md bg-white shadow-md shadow-black">
                  {/* Lista de clientes */}
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
                        Todos os Clientes
                     </button>

                     {clientesFiltrados.map(cliente => (
                        <button
                           key={cliente.cod_cliente}
                           onClick={() => handleSelect(cliente.cod_cliente)}
                           className={`w-full p-4 text-left font-semibold tracking-widest italic transition-all select-none ${
                              value === cliente.cod_cliente
                                 ? 'bg-blue-500 text-white'
                                 : 'text-black hover:bg-black hover:text-white'
                           }`}
                        >
                           {cliente.nome_cliente}
                        </button>
                     ))}
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}

// ==================================================================================================================================================================

// =================================================================================
// DROPDOWN RECURSOS
// =================================================================================
export function DropdownRecursos({
   value,
   onChange,
   recursos,
   placeholder = 'Selecione um recurso',
   isLoading = false,
}: DropdownRecursosProps) {
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

   // =================================================================================
   // RENDERIZAÇÃO
   // =================================================================================
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
               className="flex w-full cursor-pointer items-center justify-between rounded-md bg-white px-4 py-2.5 text-base font-extrabold tracking-widest italic shadow-md shadow-black transition-all hover:scale-102 focus:ring-2 focus:ring-pink-500 focus:outline-none"
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
                        className="cursor-pointer text-black transition-all hover:scale-150 hover:text-red-500 active:scale-95"
                        title="Limpar Filtro"
                     >
                        <IoClose size={24} />
                     </span>
                  )}
                  <span
                     className={`text-black transition-all ${isOpen ? 'rotate-180' : ''}`}
                  >
                     <IoIosArrowDown size={24} />
                  </span>
               </div>
            </button>

            {isOpen && !isLoading && (
               <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-192 overflow-y-auto rounded-md bg-white shadow-md shadow-black">
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

                     {recursosFiltrados.map(recurso => (
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
                     ))}
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
