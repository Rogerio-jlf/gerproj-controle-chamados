import { Filter } from 'lucide-react';

interface SelectStatusProps {
  value: string;
  onChange: (value: string) => void;
  statusList: string[];
  disabled?: boolean;
}

export default function SelectStatus({
  value,
  onChange,
  statusList,
  disabled = false,
}: SelectStatusProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onChange(val === 'all' ? '' : val);
  };

  return (
    <div className="group w-full">
      <label className="mb-1 flex items-center gap-2 text-xl font-semibold tracking-wider text-black italic">
        <Filter className="h-7 w-7" />
        Status
      </label>

      <select
        value={value || 'all'}
        onChange={handleChange}
        disabled={disabled || !statusList.length}
        className="w-full cursor-pointer rounded-lg bg-white p-3 text-lg font-semibold tracking-wider text-black shadow-md shadow-black hover:shadow-lg hover:shadow-black focus:outline-none"
      >
        <option value="all">Todos status</option>
        {statusList.map(status => (
          <option
            key={status}
            value={status}
            className="cursor-pointer rounded-lg p-4 text-lg font-semibold tracking-wider text-black"
          >
            {status}
          </option>
        ))}
      </select>
    </div>
  );
}
