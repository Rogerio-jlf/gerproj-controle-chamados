import { Mail, MailWarning } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../components/ui/tooltip';
import { MdOutlineMailOutline } from 'react-icons/md';
import { MdOutlineMarkEmailUnread } from 'react-icons/md';

interface Props {
  filter: 'all' | 'unread';
  setFilter: (value: 'all' | 'unread') => void;
  total: number;
  unread: number;
}

export default function Filtros({ filter, setFilter, total, unread }: Props) {
  // ----------------------------------------------------------------------------------------------------

  return (
    // ===== div - container principal =====
    <div className="flex gap-6">
      {/* botão - todas as mensagens */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setFilter('all')}
              className={`flex items-center gap-3 rounded-xl p-4 text-base font-bold tracking-wider shadow-md shadow-black transition-all hover:shadow-lg ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              <MdOutlineMailOutline size={24} />
              Todas ({total})
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom" // (top, bottom, left, right) - aqui aparece acima
            align="start" // start = esquerda, center = padrão, end = direita
            sideOffset={0} // distância entre o trigger e o tooltip
            className="border border-slate-300 bg-slate-900 text-base font-semibold tracking-wider text-white italic"
          >
            Exibir todas as mensagens, lidas e não lidas
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* botão - mensagens não lidas */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setFilter('unread')}
              className={`flex items-center gap-3 rounded-xl p-4 text-base font-bold tracking-wider shadow-md shadow-black transition-all hover:shadow-lg ${
                filter === 'unread'
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              <MdOutlineMarkEmailUnread size={24} />
              Não lidas ({unread})
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom" // (top, bottom, left, right) - aqui aparece acima
            align="start" // start = esquerda, center = padrão, end = direita
            sideOffset={0} // distância entre o trigger e o tooltip
            className="border border-slate-300 bg-slate-900 text-base font-semibold tracking-wider text-white italic"
          >
            Exibir todas as mensagens, lidas e não lidas
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
