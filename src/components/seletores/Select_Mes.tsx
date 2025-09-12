import { FaFilter } from 'react-icons/fa6';
// ================================================================================
// ================================================================================

interface Props {
   value: number | 'todos';
   onChange: (value: number | 'todos') => void;
}
// ================================================================================

export default function SelectMes({ value, onChange }: Props) {
   const arrayMeses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
   ];
   // ================================================================================

   return (
      <div className="group flex w-full flex-col">
         <label className="flex items-center gap-2 text-base font-bold tracking-widest text-gray-900 select-none">
            <FaFilter className="text-black" size={16} />
            Mês
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
            className="w-full cursor-pointer rounded-md border-none bg-white px-4 py-2 text-lg font-bold tracking-wider text-black italic shadow-sm shadow-black transition-all hover:translate-y-1 hover:scale-102 focus:ring-2 focus:ring-lime-500 focus:outline-none"
         >
            <option
               value="todos"
               className="bg-white text-base font-semibold tracking-widest text-black italic select-none"
            >
               Todos os meses
            </option>
            {arrayMeses.map((mes, i) => (
               <option
                  key={i}
                  value={i + 1}
                  className="p-4 text-lg font-semibold tracking-wider text-gray-900 italic select-none"
               >
                  {mes}
               </option>
            ))}
         </select>
      </div>
   );
}
