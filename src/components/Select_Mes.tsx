import { FiFilter } from 'react-icons/fi';

interface Props {
  value: number;
  onChange: (value: number) => void;
}

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

  return (
    <div className="group flex w-full flex-col">
      <label className="flex items-center gap-2 text-base font-bold tracking-widest text-gray-900 select-none">
        <FiFilter className="text-gray-900" size={14} />
        Mês
      </label>

      <select
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full cursor-pointer rounded-md border-none bg-white px-4 py-2 text-base font-semibold tracking-wider text-gray-900 italic shadow-sm shadow-black transition-all hover:scale-105 hover:shadow-lg hover:shadow-black focus:outline-none"
      >
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
