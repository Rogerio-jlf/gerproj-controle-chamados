import { RefreshCw } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import LogoutButton from './Logout_Button';

interface Props {
  titulo: string;
  icon?: React.ReactNode;
}

export default function Header({ titulo, icon }: Props) {
  return (
    // ===== header =====
    <header className="flex items-center justify-between border-b-2 border-red-500 bg-white p-4">
      {/* div - icon / título */}
      <div className="flex items-center gap-4">
        {/* ícone */}
        <div
          className="w-fit bg-gradient-to-br from-purple-950 via-blue-500 to-purple-950 p-4 text-2xl text-white shadow-md shadow-black"
          style={{
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            animation: 'blob 4s ease-in-out infinite',
          }}
        >
          {icon}
        </div>

        {/* título */}
        <h1 className="text-4xl font-extrabold tracking-widest text-slate-800 uppercase select-none">
          {titulo}
        </h1>
      </div>

      <div className="flex items-center gap-4">
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
              <button onClick={() => window.location.reload()}>
                <RefreshCw
                  className="cursor-pointer text-red-500 transition-all hover:scale-125 hover:rotate-180 hover:text-blue-500"
                  size={40}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom" // (top, bottom, left, right) - aqui aparece acima
              align="center" // start = esquerda, center = padrão, end = direita
              sideOffset={12}
              className="bg-gray-900 px-6 text-lg font-semibold tracking-wider text-white select-none"
            >
              Atualizar dados
            </TooltipContent>
          </Tooltip>
        </div>
        {/* Barra separadora */}
        <div className="mx-4 h-10 w-1 bg-red-500" />
        <LogoutButton />
      </div>
    </header>
  );
}
