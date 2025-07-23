import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';
import { Label } from '../ui/label';

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
      <Label className="mb-1 flex items-center gap-2 text-xl font-semibold tracking-wider text-black italic">
        <Filter className="h-7 w-7" />
        Mês
      </Label>

      <Select
        value={value.toString()}
        onValueChange={val => onChange(Number(val))}
      >
        <SelectTrigger className="w-full cursor-pointer rounded-lg bg-white p-4 text-lg font-semibold tracking-wider text-black shadow-md shadow-black hover:shadow-lg hover:shadow-black">
          <SelectValue placeholder="Selecione o mês" />
        </SelectTrigger>

        <SelectContent className="z-50 rounded-lg bg-white p-2 shadow-md shadow-black">
          {arrayMeses.map((mes, i) => (
            <SelectItem
              key={i}
              value={(i + 1).toString()}
              className="cursor-pointer rounded-lg p-4 text-lg font-semibold tracking-wider text-black transition-colors duration-150 hover:bg-gray-100 focus:bg-purple-500 focus:text-white data-[highlighted]:bg-purple-500 data-[highlighted]:text-white"
            >
              {mes}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
