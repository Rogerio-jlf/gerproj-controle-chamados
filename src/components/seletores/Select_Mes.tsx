import { FaFilter } from 'react-icons/fa6';
import { Dropdown } from 'primereact/dropdown';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// ================================================================================
// INTERFACES
// ================================================================================
interface SelectProps {
   value: number | 'todos';
   onChange: (value: number | 'todos') => void;
}

// ================================================================================
// COMPONENTE
// ================================================================================
export default function SelectMes({ value, onChange }: SelectProps) {
   const mesesOptions = [
      { name: 'Todos os meses', code: 'todos' },
      { name: 'Janeiro', code: 1 },
      { name: 'Fevereiro', code: 2 },
      { name: 'Março', code: 3 },
      { name: 'Abril', code: 4 },
      { name: 'Maio', code: 5 },
      { name: 'Junho', code: 6 },
      { name: 'Julho', code: 7 },
      { name: 'Agosto', code: 8 },
      { name: 'Setembro', code: 9 },
      { name: 'Outubro', code: 10 },
      { name: 'Novembro', code: 11 },
      { name: 'Dezembro', code: 12 },
   ];

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <div className="group flex w-full flex-col gap-1">
         <label className="flex items-center gap-2 text-base font-extrabold tracking-widest text-black uppercase select-none">
            <FaFilter className="text-black" size={16} />
            Mês
         </label>
         {/* ===== */}

         <Dropdown
            value={value}
            options={mesesOptions}
            optionLabel="name"
            optionValue="code"
            onChange={e => onChange(e.value)}
            showClear
            appendTo="self"
            className="shadow-md shadow-black"
         />
      </div>
   );
}
