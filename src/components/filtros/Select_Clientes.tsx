'use client';

import { Filter } from 'lucide-react';

interface SelectClienteProps {
  value: string;
  onChange: (value: string) => void;
  clientes: string[];
  disabled?: boolean;
}

export default function SelectCliente({
  value,
  onChange,
  clientes,
  disabled = false,
}: SelectClienteProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    if (selectedValue === 'all') {
      onChange('');
    } else {
      onChange(selectedValue);
    }
  };

  return (
    <div className="group w-full">
      <label className="mb-1 flex items-center gap-2 text-xl font-semibold tracking-wider text-slate-800">
        <Filter size={20} />
        Clientes
      </label>

      <select
        value={value || 'all'}
        onChange={handleChange}
        disabled={disabled || !clientes.length}
        className="w-full cursor-pointer rounded-md bg-white p-3 text-lg font-semibold tracking-wider text-slate-800 italic shadow-md shadow-black hover:shadow-lg hover:shadow-black focus:outline-none"
      >
        <option value="all">Todos clientes</option>

        {clientes.map(nomeCliente => (
          <option
            key={nomeCliente}
            value={nomeCliente}
            className="cursor-pointer rounded-lg p-4 text-lg font-semibold tracking-wider text-slate-800 italic"
          >
            {nomeCliente}
          </option>
        ))}
      </select>
    </div>
  );
}
