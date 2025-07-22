import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Loader2 } from 'lucide-react';
import { Label } from '../ui/label';

interface SelectClienteProps {
  value: string;
  onChange: (value: string) => void;
  clientes: string[];
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

export default function SelectCliente({
  value,
  onChange,
  clientes,
  isLoading,
  disabled = false,
}: SelectClienteProps) {
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
        Clientes
      </Label>

      <Select
        value={value || 'all'}
        onValueChange={handleChange}
        disabled={disabled || !clientes.length || isLoading}
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
                'Todos clientes'
              )
            }
          />
        </SelectTrigger>

        <SelectContent className="z-50 rounded-lg bg-white p-2 shadow-md shadow-black">
          <SelectItem
            value="all"
            className="cursor-pointer rounded-lg p-4 text-lg font-semibold tracking-wider text-black transition-colors duration-150 hover:bg-gray-100 focus:bg-purple-500 focus:text-white data-[highlighted]:bg-purple-500 data-[highlighted]:text-white"
          >
            Todos clientes
          </SelectItem>

          {clientes.map(nomeCliente => (
            <SelectItem
              key={nomeCliente}
              value={nomeCliente}
              className="cursor-pointer rounded-lg p-4 text-lg font-semibold tracking-wider text-black transition-colors duration-150 hover:bg-gray-100 focus:bg-purple-500 focus:text-white data-[highlighted]:bg-purple-500 data-[highlighted]:text-white"
            >
              {nomeCliente}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
