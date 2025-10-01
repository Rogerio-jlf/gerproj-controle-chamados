import { FaFilter } from 'react-icons/fa6';

// ================================================================================
// INTERFACES E TIPOS
// ================================================================================
interface SelectProps {
   value: number | 'todos';
   onChange: (value: number | 'todos') => void;
   diasDisponiveis: number[]; // Array com os dias disponíveis para o mês selecionado
   disabled?: boolean; // Para desabilitar quando ano ou mês for "todos"
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export default function SelectDia({
   value,
   onChange,
   diasDisponiveis,
   disabled = false,
}: SelectProps) {
   // ================================================================================
   // RENDERIZAÇÃO PRINCIPAL
   // ================================================================================
   return (
      <div className="group flex w-full flex-col gap-1">
         <label className="flex items-center gap-2 text-base font-extrabold tracking-widest text-black uppercase select-none">
            <FaFilter className="text-black" size={16} />
            Dia
         </label>
         {/* ===== */}

         <select
            value={value}
            onChange={e => {
               const selectedValue = e.target.value;
               if (selectedValue === 'todos') {
                  onChange('todos');
               } else {
                  onChange(Number(selectedValue));
               }
            }}
            disabled={disabled || diasDisponiveis.length === 0}
            className={`w-full cursor-pointer rounded-md border-none px-4 py-2 text-lg font-extrabold tracking-wider text-black italic shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-amber-500 focus:outline-none ${
               disabled || diasDisponiveis.length === 0
                  ? 'cursor-not-allowed bg-gray-200 opacity-60'
                  : 'bg-white'
            }`}
         >
            <option
               value="todos"
               className="bg-white text-base font-semibold tracking-widest text-black italic select-none"
            >
               Todos os dias
            </option>
            {diasDisponiveis.map(dia => (
               <option
                  key={dia}
                  value={dia}
                  className="p-4 text-lg font-semibold tracking-wider text-black italic select-none"
               >
                  {dia.toString().padStart(2, '0')}{' '}
                  {/* Formata com zero à esquerda se necessário */}
               </option>
            ))}
         </select>
      </div>
   );
}
