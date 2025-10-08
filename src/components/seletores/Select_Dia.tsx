import { FaFilter } from 'react-icons/fa6';
import { useEffect } from 'react';

interface SelectProps {
   value: number | 'todos';
   onChange: (value: number | 'todos') => void;
   diasDisponiveis: number[];
   disabled?: boolean;
   mostrarTodos?: boolean;
}

export default function SelectDia({
   value,
   onChange,
   diasDisponiveis,
   disabled = false,
   mostrarTodos = true,
}: SelectProps) {
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

   // Função para tratar mudança no select
   const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = e.target.value;

      // Só permite selecionar "todos" se mostrarTodos for true
      if (selectedValue === 'todos' && mostrarTodos) {
         onChange('todos');
      } else {
         onChange(Number(selectedValue));
      }
   };

   // Determina o valor atual a ser mostrado no select
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

   return (
      <div className="group flex w-full flex-col gap-1">
         <label className="flex items-center gap-2 text-base font-extrabold tracking-widest text-black uppercase select-none">
            <FaFilter className="text-black" size={16} />
            Dia
         </label>

         <select
            value={valorAtual}
            onChange={handleChange}
            disabled={disabled || diasDisponiveis.length === 0}
            className={`w-full cursor-pointer rounded-md border-none px-4 py-2 text-lg font-extrabold tracking-wider text-black italic shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-amber-500 focus:outline-none ${
               disabled || diasDisponiveis.length === 0
                  ? 'cursor-not-allowed bg-gray-200 opacity-60'
                  : 'bg-white'
            }`}
         >
            {mostrarTodos && (
               <option
                  value="todos"
                  className="bg-white text-base font-semibold tracking-widest text-black italic select-none"
               >
                  Todos os dias
               </option>
            )}

            {diasDisponiveis.map(dia => (
               <option
                  key={dia}
                  value={dia}
                  className="p-4 text-lg font-semibold tracking-wider text-black italic select-none"
               >
                  {dia.toString().padStart(2, '0')}
               </option>
            ))}
         </select>
      </div>
   );
}
