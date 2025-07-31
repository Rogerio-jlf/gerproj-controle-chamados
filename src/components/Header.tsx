import { RefreshCw } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HeaderProps {
  titulo: string;
  icon?: React.ReactNode;
}

export default function Header({ titulo, icon }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b-2 border-red-500 bg-white p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4">
          <div>{icon}</div>
          {/* título */}
          <h1 className="text-4xl font-extrabold tracking-wider text-slate-800 italic select-none">
            {titulo}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          {/* subtítulo */}
          <p className="text-sm font-semibold tracking-wider text-slate-800 select-none">
            Última atualização
          </p>

          {/* data atual */}
          <p className="text-base font-bold tracking-wider text-slate-800 italic select-none">
            {new Date().toLocaleString('pt-BR')}
          </p>
        </div>

        {/* botão - atualizar página */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-red-500 transition-all duration-300 hover:scale-110 hover:rotate-180 hover:text-blue-500"
            >
              <RefreshCw className="h-10 w-10" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top" // (top, bottom, left, right) - aqui aparece acima
            align="end" // start = esquerda, center = padrão, end = direita
            sideOffset={12} // distância entre o trigger e o tooltip
            className="border border-white/30 bg-slate-900 text-base font-semibold tracking-wider text-white"
          >
            Atualizar dados
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
