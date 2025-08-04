import { ArrowLeft, MessageSquare, RefreshCw } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../../../components/ui/tooltip';
import { MdMessage } from 'react-icons/md';
import { FaArrowLeft } from 'react-icons/fa';

interface HeaderProps {
  onBack: () => void;
  unreadCount: number;
}

export default function Header({ onBack }: HeaderProps) {
  // ----------------------------------------------------------------------------------------------------

  return (
    <div className="flex items-center justify-between">
      {/* ===== lado esquerdo: botão voltar + título ===== */}
      <div className="flex items-center gap-8">
        {/* botão - voltar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onBack}
              className="flex items-center justify-center rounded-full bg-black p-4 shadow-md shadow-black transition-all hover:bg-black/50 hover:shadow-lg"
            >
              <FaArrowLeft className="text-white" size={28} />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            align="start"
            sideOffset={0}
            className="border border-slate-300 bg-slate-900 text-base font-semibold tracking-wider text-white italic"
          >
            Voltar para a página anterior
          </TooltipContent>
        </Tooltip>

        {/* ícone + título */}
        <div className="flex items-center gap-6">
          {/* ícone */}
          <div
            className="w-fit rounded-xl bg-gradient-to-br from-red-500 to-orange-500 p-4 shadow-md shadow-black"
            style={{
              borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
              animation: 'blob 4s ease-in-out infinite',
            }}
          >
            <MdMessage className="text-white" size={28} />
          </div>

          {/* título */}
          <h1 className="text-3xl font-extrabold tracking-wider text-slate-800 select-none">
            Mensagens de Reprovação
          </h1>
        </div>
      </div>

      {/* ===== lado direito: atualização ===== */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold tracking-wider text-slate-800 select-none">
            Última atualização
          </p>
          <p className="text-base font-bold tracking-wider text-slate-800 italic select-none">
            {new Date().toLocaleString('pt-BR')}
          </p>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={() => window.location.reload()}>
              <RefreshCw
                className="text-red-500 transition-all hover:scale-125 hover:rotate-180 hover:text-blue-500"
                size={40}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="end"
            sideOffset={12}
            className="border border-white/30 bg-slate-900 text-base font-semibold tracking-wider text-white"
          >
            Atualizar dados
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
