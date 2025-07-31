import { Filter } from 'lucide-react';

interface SelectRecursoProps {
  value: string;
  onChange: (value: string) => void;
  recursos: string[];
  disabled?: boolean;
}

export default function SelectRecurso({
  value,
  onChange,
  recursos,
  disabled = false,
}: SelectRecursoProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onChange(val === 'all' ? '' : val);
  };

  return (
    <div className="group w-full">
      <label className="mb-1 flex items-center gap-2 text-xl font-semibold tracking-wider text-black italic">
        <Filter className="h-7 w-7" />
        Recursos
      </label>

      <select
        value={value || 'all'}
        onChange={handleChange}
        disabled={disabled || !recursos.length}
        className="w-full cursor-pointer rounded-lg bg-white p-3 text-lg font-semibold tracking-wider text-black shadow-md shadow-black hover:shadow-lg hover:shadow-black focus:outline-none"
      >
        <option value="all" className="text-black">
          Todos recursos
        </option>

        {recursos.map(NomeRecurso => (
          <option
            key={NomeRecurso}
            value={NomeRecurso}
            className="cursor-pointer rounded-lg p-4 text-lg font-semibold tracking-wider text-black"
          >
            {NomeRecurso}
          </option>
        ))}
      </select>
    </div>
  );
}
