import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';
import { Label } from '../ui/label';

interface SelectAnoProps {
  value: number;
  onChange: (value: number) => void;
}

export default function SelectAno({ value, onChange }: SelectAnoProps) {
  const arrayAnos = [2024, 2025];

  return (
    <div className="group w-full">
      <Label className="mb-1 flex items-center gap-2 text-xl font-semibold tracking-wider text-black italic">
        <Filter className="h-7 w-7" />
        Ano
      </Label>

      <Select
        value={value.toString()}
        onValueChange={val => onChange(Number(val))}
      >
        <SelectTrigger className="w-full cursor-pointer rounded-lg bg-white p-4 text-lg font-semibold tracking-wider text-black shadow-md shadow-black hover:shadow-lg hover:shadow-black">
          <SelectValue placeholder="Selecione o ano" />
        </SelectTrigger>

        <SelectContent className="z-50 rounded-lg bg-white p-2 shadow-md shadow-black">
          {arrayAnos.map(ano => (
            <SelectItem
              key={ano}
              value={ano.toString()}
              className="cursor-pointer rounded-lg p-4 text-lg font-semibold tracking-wider text-black transition-colors duration-300 hover:bg-gray-100 focus:bg-purple-500 focus:text-white data-[highlighted]:bg-purple-500 data-[highlighted]:text-white"
            >
              {ano}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
