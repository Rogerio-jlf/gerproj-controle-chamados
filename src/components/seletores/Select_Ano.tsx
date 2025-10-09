import { FaFilter } from 'react-icons/fa6';
import { Dropdown } from 'primereact/dropdown';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

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
   const anosOptions = [
      { name: 'Todos os anos', code: 'todos' },
      { name: '2024', code: '2024' },
      { name: '2025', code: '2025' },
      { name: '2026', code: '2026' },
   ];

   // ================================================================================
   // RENDERIZAÇÃO PRINCIPAL
   // ================================================================================
   return (
      <div className="group flex w-full flex-col gap-1">
         <label className="flex items-center gap-2 text-base font-extrabold tracking-widest text-black uppercase select-none">
            <FaFilter className="text-black" size={16} />
            Ano
         </label>
         {/* ===== */}

         <Dropdown
            value={value}
            options={anosOptions}
            optionLabel="name"
            optionValue="code"
            onChange={e => onChange(e.value)}
            placeholder="Selecione um ano"
            appendTo="self"
            className="shadow-md shadow-black"
         />
      </div>
   );
}
