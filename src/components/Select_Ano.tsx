import { FaFilter } from 'react-icons/fa6';
// ================================================================================
// ================================================================================

interface Props {
  value: number | 'todos';
  onChange: (value: number | 'todos') => void;
}
// ================================================================================

export default function SelectAno({ value, onChange }: Props) {
  const arrayAnos = [2024, 2025, 2026];

  return (
    <div className="group flex w-full flex-col">
      <label className="flex items-center gap-2 text-base font-bold tracking-widest text-gray-900 select-none">
        <FaFilter className="text-gray-900" size={16} />
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
        className="w-full cursor-pointer rounded-md border-none bg-white px-4 py-2 text-base font-semibold tracking-wider text-gray-900 italic shadow-md shadow-black transition-all hover:scale-105 hover:shadow-lg hover:shadow-black focus:outline-none active:scale-95"
      >
        <option
          value="todos"
          className="p-4 text-lg font-semibold tracking-wider text-gray-900 italic select-none"
        >
          Todos os anos
        </option>
        {arrayAnos.map(ano => (
          <option
            key={ano}
            value={ano}
            className="p-4 text-lg font-semibold tracking-wider text-gray-900 italic select-none"
          >
            {ano}
          </option>
        ))}
      </select>
    </div>
  );
}
