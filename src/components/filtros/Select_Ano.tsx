import { Filter } from 'lucide-react';

interface SelectAnoProps {
  value: number;
  onChange: (value: number) => void;
}

export default function SelectAno({ value, onChange }: SelectAnoProps) {
  const arrayAnos = [2024, 2025];

  return (
    <div className="group w-full">
      <label className="mb-1 flex items-center gap-2 text-xl font-semibold tracking-wider text-slate-800">
        <Filter size={20} />
        Ano
      </label>

      <select
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full cursor-pointer rounded-md bg-white p-3 text-lg font-semibold tracking-wider text-slate-800 italic shadow-md shadow-black hover:shadow-lg hover:shadow-black focus:outline-none"
      >
        {arrayAnos.map(ano => (
          <option
            key={ano}
            value={ano}
            className="cursor-pointer rounded-lg p-4 text-lg font-semibold tracking-wider text-slate-800 italic"
          >
            {ano}
          </option>
        ))}
      </select>
    </div>
  );
}
