// IMPORTS
import { useState, useRef, useEffect } from 'react';

// ICONS
import { IoClose } from 'react-icons/io5';
import { FaFilter } from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';
import { RiFilterOffFill } from 'react-icons/ri';
import { CiFilter } from 'react-icons/ci';
import { MdFilterAlt } from 'react-icons/md';
import { BiSolidSearchAlt2 } from 'react-icons/bi';

// ================================================================================
// DROPDOWN FILTRO DE RECOMENDAÇÃO
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
            className={`group relative flex w-full cursor-pointer items-center justify-between rounded-md border bg-white py-3.5 pr-4 pl-12 tracking-widest italic shadow-sm shadow-black transition-all hover:shadow-lg hover:shadow-black focus:outline-none active:scale-95 ${
               value !== 'TODOS'
                  ? 'font-bold text-black ring-2 ring-blue-600'
                  : 'font-normal text-slate-400 focus:ring-2 focus:ring-blue-600'
            }`}
         >
            <MdFilterAlt
               className={`absolute top-1/2 left-4 -translate-y-1/2 ${
                  value === 'TODOS' ? 'text-slate-400' : 'text-black'
               }`}
               size={24}
            />
            <span>{selectedOption?.name}</span>
            <div className="flex items-center gap-2">
               {showClearButton && (
                  <span
                     onClick={handleClear}
                     className="cursor-pointer text-black transition-all hover:scale-150 hover:rotate-180 hover:text-red-500"
                  >
                     <IoClose size={24} />
                  </span>
               )}
               <span
                  className={`transition-all ${isOpen ? 'rotate-180' : ''} ${
                     value === 'TODOS' ? 'text-slate-400' : 'text-black'
                  }`}
               >
                  <IoIosArrowDown size={24} />
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
         {/* Botão do dropdown */}
         <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative flex w-full cursor-pointer items-center justify-between rounded-md border bg-white py-6 pr-4 pl-10 text-base tracking-widest text-black italic shadow-sm shadow-black transition-all select-none hover:shadow-lg hover:shadow-black focus:outline-none active:scale-95 ${
               selectedCliente
                  ? 'ring-2 ring-blue-600'
                  : 'focus:ring-2 focus:ring-blue-600'
            }`}
         >
            <div
               className={`absolute top-1/2 left-4 flex -translate-y-1/2 items-center justify-center transition-all ${
                  selectedCliente
                     ? 'rounded-md bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 shadow-md shadow-black'
                     : ''
               }`}
            >
               <MdFilterAlt
                  className={`${!selectedCliente ? 'text-slate-400' : 'text-white'}`}
                  size={24}
               />
            </div>
            <span
               className={`pl-4 ${!selectedCliente ? 'text-slate-400' : 'pl-12 font-extrabold text-black'}`}
            >
               {selectedCliente
                  ? corrigirTextoCorrompido(selectedCliente.nome_cliente)
                  : placeholder}
            </span>
            <div className="flex items-center gap-2">
               {showClearButton && (
                  <span
                     onClick={handleClear}
                     className="cursor-pointer text-black transition-all hover:scale-150 hover:rotate-180 hover:text-red-500"
                  >
                     <IoClose size={24} />
                  </span>
               )}
               <span
                  className={`transition-all ${isOpen ? 'rotate-180 text-black' : 'text-slate-400'}`}
               >
                  <IoIosArrowDown size={24} />
               </span>
            </div>
         </button>

         {error && (
            <p className="mt-1 text-sm font-semibold text-red-500">{error}</p>
         )}

         {isOpen && (
            <div className="absolute top-full right-0 left-0 z-50 mt-3 max-h-[330px] overflow-hidden rounded-md border bg-white shadow-sm shadow-black">
               {/* Campo de busca */}
               <div className="sticky top-0 bg-teal-100 p-4 shadow-sm shadow-black">
                  <div className="group relative">
                     <BiSolidSearchAlt2
                        className={`absolute top-1/2 left-4 -translate-y-1/2 transition-colors ${
                           searchTerm
                              ? 'text-black'
                              : 'text-slate-400 group-focus-within:text-black'
                        }`}
                        size={24}
                     />

                     <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar cliente..."
                        className={`w-full rounded-md border bg-white py-3.5 pl-12 text-base font-semibold tracking-widest text-black italic shadow-sm shadow-black transition-all outline-none select-none placeholder:font-normal placeholder:text-slate-400 placeholder:italic hover:shadow-lg hover:shadow-black focus:outline-none active:scale-98 disabled:opacity-50 ${
                           searchTerm
                              ? 'ring-2 ring-blue-600'
                              : 'focus:ring-2 focus:ring-blue-600'
                        }`}
                     />
                     {searchTerm && (
                        <button
                           onClick={e => {
                              e.stopPropagation();
                              setSearchTerm('');
                           }}
                           className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-black transition-all hover:scale-150 hover:rotate-180 hover:text-red-500"
                        >
                           <IoClose size={24} />
                        </button>
                     )}
                  </div>
               </div>

               {/* Lista de clientes */}
               <div className="max-h-[250px] overflow-y-auto">
                  {clientesFiltrados.length > 0 ? (
                     clientesFiltrados.map(cliente => (
                        <button
                           key={cliente.cod_cliente}
                           onClick={() => handleSelect(cliente.cod_cliente)}
                           className={`w-full p-4 text-left font-bold tracking-widest italic transition-all select-none ${
                              value === cliente.cod_cliente.toString()
                                 ? 'bg-blue-600 text-white'
                                 : 'text-black hover:bg-black hover:text-white'
                           }`}
                        >
                           {corrigirTextoCorrompido(cliente.nome_cliente)}
                        </button>
                     ))
                  ) : (
                     <div className="flex flex-col items-center gap-6 px-4 py-10 text-center text-base font-extrabold tracking-widest text-black italic select-none">
                        <RiFilterOffFill className="text-black" size={40} />
                        Nenhum Cliente encontrado
                     </div>
                  )}
               </div>
            </div>
         )}
      </div>
   );
}
