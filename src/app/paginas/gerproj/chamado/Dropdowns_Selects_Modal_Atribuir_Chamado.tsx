// IMPORTS
import { useState, useRef, useEffect } from 'react';

// ICONS
import { IoClose } from 'react-icons/io5';
import { FaFilter } from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';

// ================================================================================
// DROPDOWN CUSTOMIZADO PARA FILTRO TODOS
// ================================================================================
interface DropdownRecomendacaoProps {
   value: string;
   onChange: (value: string) => void;
}

export function DropdownRecomendacao({
   value,
   onChange,
}: DropdownRecomendacaoProps) {
   const [isOpen, setIsOpen] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);

   const opcoes = [
      { name: 'Todos', code: 'TODOS' },
      { name: 'Disponível', code: 'DISPONÍVEL' },
      { name: 'Moderado', code: 'MODERADO' },
      { name: 'Sobrecarregado', code: 'SOBRECARREGADO' },
      { name: 'Crítico', code: 'CRÍTICO' },
   ];

   const selectedOption = opcoes.find(opt => opt.code === value);

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
      onChange('TODOS');
      setIsOpen(false);
   };

   const showClearButton = value !== 'TODOS';

   return (
      <div ref={dropdownRef} className="relative w-[300px]">
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="group relative flex w-full cursor-pointer items-center justify-between rounded-md border-t border-black/10 bg-white py-3 pr-4 pl-10 font-bold tracking-widest text-black italic shadow-md shadow-black transition-all hover:scale-102 focus:ring-2 focus:ring-pink-600 focus:outline-none active:scale-95"
         >
            <FaFilter
               className="absolute top-1/2 left-4 -translate-y-1/2 text-black"
               size={16}
            />
            <span className="text-black">{selectedOption?.name}</span>
            <div className="flex items-center gap-2">
               {showClearButton && (
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

         {isOpen && (
            <div className="absolute top-full right-0 left-0 z-50 mt-3 rounded-md bg-white shadow-sm shadow-black">
               {opcoes.map(option => (
                  <button
                     key={option.code}
                     onClick={() => handleSelect(option.code)}
                     className={`w-full p-4 text-left font-semibold tracking-widest italic transition-all select-none ${
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
   );
}

// ================================================================================
// DROPDOWN CUSTOMIZADO PARA CLIENTE
// ================================================================================
interface DropdownClienteProps {
   value: string;
   onChange: (value: string) => void;
   clientes: Array<{ cod_cliente: number; nome_cliente: string }>;
   placeholder?: string;
   error?: string;
   corrigirTextoCorrompido: (text: string) => string;
}

export function DropdownCliente({
   value,
   onChange,
   clientes,
   placeholder = 'Selecione um cliente',
   error,
   corrigirTextoCorrompido,
}: DropdownClienteProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
   const dropdownRef = useRef<HTMLDivElement>(null);

   const selectedCliente = clientes.find(
      c => c.cod_cliente.toString() === value
   );

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

   const handleSelect = (codCliente: number) => {
      onChange(codCliente.toString());
      setIsOpen(false);
      setSearchTerm('');
   };

   const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange('');
      setIsOpen(false);
      setSearchTerm('');
   };

   // Filtrar clientes baseado na busca
   const clientesFiltrados = clientes.filter(cliente =>
      corrigirTextoCorrompido(cliente.nome_cliente)
         .toLowerCase()
         .includes(searchTerm.toLowerCase())
   );

   const showClearButton = value !== '';

   return (
      <div ref={dropdownRef} className="relative w-full">
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative flex w-full cursor-pointer items-center justify-between rounded-md border-t border-black/10 bg-white py-3 pr-4 pl-10 text-base font-semibold tracking-widest text-black italic shadow-md shadow-black transition-all hover:scale-102 focus:ring-2 focus:ring-pink-600 focus:outline-none active:scale-95"
         >
            <FaFilter
               className="absolute top-1/2 left-4 -translate-y-1/2 text-black"
               size={16}
            />
            <span
               className={`tracking-widest ${!selectedCliente ? 'text-slate-500' : 'text-black'}`}
            >
               {selectedCliente
                  ? corrigirTextoCorrompido(selectedCliente.nome_cliente)
                  : placeholder}
            </span>
            <div className="flex items-center gap-2">
               {showClearButton && (
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

         {error && (
            <p className="mt-1 text-sm font-semibold text-red-500">{error}</p>
         )}

         {isOpen && (
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
                  {clientesFiltrados.length > 0 ? (
                     clientesFiltrados.map(cliente => (
                        <button
                           key={cliente.cod_cliente}
                           onClick={() => handleSelect(cliente.cod_cliente)}
                           className={`w-full p-4 text-left font-semibold tracking-widest italic transition-all select-none ${
                              value === cliente.cod_cliente.toString()
                                 ? 'bg-blue-500 text-white'
                                 : 'text-black hover:bg-black hover:text-white'
                           }`}
                        >
                           {corrigirTextoCorrompido(cliente.nome_cliente)}
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
   );
}
