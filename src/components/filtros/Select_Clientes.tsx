import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, User } from 'lucide-react';

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
  return (
    <div className="group w-full">
      <label className="mb-2 flex items-center space-x-2 text-base font-bold text-black">
        <User className="h-5 w-5" />
        <span>Cliente</span>
      </label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled || !clientes.length}
      >
        <SelectTrigger className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white p-2 text-base font-semibold text-black shadow-md shadow-black transition-all duration-200 hover:border-purple-500 hover:shadow-lg hover:shadow-black focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none active:scale-90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300 disabled:hover:shadow-md disabled:active:scale-100 data-[state=open]:border-purple-500 data-[state=open]:ring-1 data-[state=open]:ring-purple-500">
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
        <SelectContent className="z-50 rounded-lg border border-gray-300 bg-white p-1 shadow-lg shadow-black/20">
          <SelectItem
            value="all"
            className="cursor-pointer rounded-md px-3 py-2 text-base font-semibold text-black transition-colors duration-150 hover:bg-gray-100 focus:bg-purple-500 focus:text-white data-[highlighted]:bg-purple-500 data-[highlighted]:text-white"
          >
            Todos clientes
          </SelectItem>
          {clientes.map(nomeCliente => (
            <SelectItem
              key={nomeCliente}
              value={nomeCliente}
              className="cursor-pointer rounded-md px-3 py-2 text-base font-semibold text-black transition-colors duration-150 hover:bg-gray-100 focus:bg-purple-500 focus:text-white data-[highlighted]:bg-purple-500 data-[highlighted]:text-white"
            >
              {nomeCliente}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
