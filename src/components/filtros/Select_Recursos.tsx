import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Loader2 } from 'lucide-react';
import { Label } from '../ui/label';

interface SelectRecursoProps {
  value: string;
  onChange: (value: string) => void;
  recursos: string[];
  isLoading: boolean;
  disabled?: boolean;
}

// Componente para os pontos animados
const LoadingDots = () => (
  <span className="inline-flex">
    <span
      className="animate-bounce text-[6px]"
      style={{ animationDelay: '0ms' }}
    >
      ●
    </span>
    <span
      className="animate-bounce text-[6px]"
      style={{ animationDelay: '150ms' }}
    >
      ●
    </span>
    <span
      className="animate-bounce text-[6px]"
      style={{ animationDelay: '300ms' }}
    >
      ●
    </span>
  </span>
);

export default function SelectRecurso({
  value,
  onChange,
  recursos,
  isLoading,
  disabled = false,
}: SelectRecursoProps) {
  const handleChange = (val: string) => {
    if (val === 'all') {
      onChange('');
    } else {
      onChange(val);
    }
  };

  return (
    <div className="group w-full">
      <Label className="mb-1 flex items-center gap-2 text-xl font-semibold tracking-wider text-black italic">
        <Filter className="h-7 w-7" />
        Recursos
      </Label>

      <Select
        value={value || 'all'}
        onValueChange={handleChange}
        disabled={disabled || !recursos.length || isLoading}
      >
        <SelectTrigger className="w-full cursor-pointer rounded-lg bg-white p-4 text-lg font-semibold tracking-wider text-black shadow-md shadow-black hover:shadow-lg hover:shadow-black">
          <SelectValue
            placeholder={
              isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    Carregando <LoadingDots />
                  </span>
                </div>
              ) : (
                'Todos recursos'
              )
            }
          />
        </SelectTrigger>

        <SelectContent className="z-50 rounded-lg bg-white p-2 shadow-md shadow-black">
          <SelectItem
            value="all"
            className="cursor-pointer rounded-lg p-4 text-lg font-semibold tracking-wider text-black transition-colors duration-300 hover:bg-gray-100 focus:bg-purple-500 focus:text-white data-[highlighted]:bg-purple-500 data-[highlighted]:text-white"
          >
            Todos recursos
          </SelectItem>

          {recursos.map(NomeRecurso => (
            <SelectItem
              key={NomeRecurso}
              value={NomeRecurso}
              className="cursor-pointer rounded-lg p-4 text-lg font-semibold tracking-wider text-black transition-colors duration-300 hover:bg-gray-100 focus:bg-purple-500 focus:text-white data-[highlighted]:bg-purple-500 data-[highlighted]:text-white"
            >
              {NomeRecurso}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
