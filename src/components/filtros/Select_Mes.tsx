import { Filter } from 'lucide-react';

interface SelectMesProps {
  value: number;
  onChange: (value: number) => void;
}

export default function SelectMes({ value, onChange }: SelectMesProps) {
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

  return (
    <div className="group w-full">
      <label className="mb-1 flex items-center gap-2 text-xl font-semibold tracking-wider text-slate-800">
        <Filter size={20} />
        Mês
      </label>

      <select
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full cursor-pointer rounded-md bg-white p-3 text-lg font-semibold tracking-wider text-slate-800 italic shadow-md shadow-black hover:shadow-lg hover:shadow-black focus:outline-none"
      >
        {arrayMeses.map((mes, i) => (
          <option
            key={i}
            value={i + 1}
            className="cursor-pointer rounded-lg p-4 text-lg font-semibold tracking-wider text-slate-800 italic"
          >
            {mes}
          </option>
        ))}
      </select>
    </div>
  );
}
