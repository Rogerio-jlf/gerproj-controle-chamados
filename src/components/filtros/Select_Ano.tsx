import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';

interface SelectAnoProps {
  value: number;
  onChange: (value: number) => void;
}

export default function SelectAno({ value, onChange }: SelectAnoProps) {
  const years = [2024, 2025];

  return (
    <div className="group w-full">
      <label className="mb-2 flex items-center space-x-2 text-base font-bold text-black">
        <Calendar className="h-5 w-5" />
        <span>Ano</span>
      </label>

      <Select
        value={value.toString()}
        onValueChange={val => onChange(Number(val))}
      >
        <SelectTrigger className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white p-2 text-base font-semibold text-black shadow-md shadow-black transition-all duration-200 hover:border-purple-500 hover:shadow-lg hover:shadow-black focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none active:scale-90 data-[state=open]:border-purple-500 data-[state=open]:ring-1 data-[state=open]:ring-purple-500">
          <SelectValue placeholder="Selecione o ano" />
        </SelectTrigger>
        <SelectContent className="z-50 rounded-lg border border-gray-300 bg-white p-1 shadow-lg shadow-black/20">
          {years.map(yearOption => (
            <SelectItem
              key={yearOption}
              value={yearOption.toString()}
              className="cursor-pointer rounded-md px-3 py-2 text-base font-semibold text-black transition-colors duration-150 hover:bg-gray-100 focus:bg-purple-500 focus:text-white data-[highlighted]:bg-purple-500 data-[highlighted]:text-white"
            >
              {yearOption}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
