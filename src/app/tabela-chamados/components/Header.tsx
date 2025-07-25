import { RefreshCw } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b-2 border-red-500 bg-white p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-5 w-5 animate-pulse rounded-full bg-green-500"></div>
          {/* TÍTULO */}
          <h2 className="text-4xl font-extrabold tracking-wider text-black italic select-none">
            Chamados
          </h2>
        </div>
      </div>
      {/* ---------- */}

      <div className="flex items-center gap-4">
        <div className="text-right">
          {/* SUBTÍTULO */}
          <p className="text-sm font-semibold tracking-wider text-black italic select-none">
            Última atualização
          </p>
          {/* DATA ATUAL */}
          <p className="text-base font-bold tracking-wider text-black italic select-none">
            {new Date().toLocaleString('pt-BR')}
          </p>
        </div>

        {/* BOTÃO DE ATUALIZAÇÃO */}
        <Tooltip>
          <TooltipTrigger>
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-red-500 transition-all duration-200 hover:scale-110 hover:rotate-90 active:scale-90"
            >
              <RefreshCw className="h-10 w-10" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-md -translate-x-10 border border-slate-700 bg-slate-900 tracking-wider break-words text-white"
          >
            <p className="text-xs">Atualizar dados</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
