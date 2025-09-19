import { FaFilter } from 'react-icons/fa6';

// ================================================================================
// INTERFACES E TIPOS
// ================================================================================
interface SelectProps {
   value: number | 'todos';
   onChange: (value: number | 'todos') => void;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export default function SelectAno({ value, onChange }: SelectProps) {
   const arrayAnos = [2024, 2025, 2026];

   // ================================================================================
   // RENDERIZAÇÃO PRINCIPAL
   // ================================================================================
   return (
      <div className="group flex w-full flex-col gap-1">
         <label className="flex items-center gap-2 text-base font-extrabold tracking-widest text-black select-none">
            <FaFilter className="text-black" size={16} />
            Ano
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
            className="w-full cursor-pointer rounded-md border-none bg-white px-4 py-2 text-lg font-extrabold tracking-wider text-black italic shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:ring-amber-500 focus:outline-none"
         >
            <option
               value="todos"
               className="bg-white text-base font-semibold tracking-widest text-black italic select-none"
            >
               Todos os anos
            </option>
            {arrayAnos.map(ano => (
               <option
                  key={ano}
                  value={ano}
                  className="p-4 text-lg font-semibold tracking-wider text-black italic select-none"
               >
                  {ano}
               </option>
            ))}
         </select>
      </div>
   );
}
