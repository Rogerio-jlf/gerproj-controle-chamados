// IMPORTS
import { useState, useRef, useEffect } from 'react';

// ICONS
import { IoClose } from 'react-icons/io5';
import { FaFilter } from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';

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

export function DropdownCliente({
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
               className="relative flex w-full cursor-pointer items-center justify-between rounded-md border-t border-black/10 bg-white py-3 pr-4 pl-10 text-base font-semibold tracking-widest text-black italic shadow-md shadow-black transition-all hover:bg-slate-200 focus:ring-2 focus:ring-pink-600 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar cliente..."
                        className="w-full rounded-md bg-white p-4 text-sm font-semibold tracking-widest text-black italic select-none placeholder:tracking-widest placeholder:text-slate-500 placeholder:italic focus:ring-2 focus:ring-pink-600 focus:outline-none"
                        onClick={e => e.stopPropagation()}
                     />
                  </div>

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

                     {clientesFiltrados.length > 0 ? (
                        clientesFiltrados.map(cliente => (
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
                        ))
                     ) : (
                        <div className="p-4 text-center text-sm font-semibold tracking-widest text-slate-500 italic select-none">
                           Nenhum cliente encontrado
                        </div>
                     )}
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
