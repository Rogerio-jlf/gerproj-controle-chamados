import { useState } from 'react';
import { FaTasks } from 'react-icons/fa';
import { FaHandPointUp } from 'react-icons/fa';
import { FaHandPointer } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '@/components/ui/tooltip';

interface BotaoVisualizarTarefasProps {
   onVisualizarTarefas: () => void;
   tabelasDisponivel?: boolean;
}

export default function TarefasButton({
   onVisualizarTarefas,
   tabelasDisponivel = true,
}: BotaoVisualizarTarefasProps) {
   const [isLoadingTarefas, setIsLoadingTarefas] = useState(false);

   const handleVisualizarTarefas = async () => {
      if (isLoadingTarefas) return;

      setIsLoadingTarefas(true);

      // Simula um pequeno delay para mostrar o loading
      setTimeout(() => {
         onVisualizarTarefas();
         setIsLoadingTarefas(false);
      }, 500);
   };

   return (
      <Tooltip>
         <TooltipTrigger asChild>
            <button
               onClick={handleVisualizarTarefas}
               disabled={!tabelasDisponivel || isLoadingTarefas}
               className={`flex cursor-pointer items-center gap-4 rounded-md px-6 py-2 text-lg font-extrabold tracking-wider italic transition-all select-none ${
                  !tabelasDisponivel || isLoadingTarefas
                     ? 'disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-gray-500'
                     : 'bg-blue-600 text-white hover:scale-105 hover:bg-blue-900 active:scale-95'
               }`}
            >
               {isLoadingTarefas ? (
                  <Loader2 size={20} className="animate-spin text-white" />
               ) : (
                  <div className="flex items-center gap-2">
                     <div className="flex items-center gap-2">
                        <FaTasks size={18} />
                        Tarefas
                     </div>
                     <div></div>
                     <div className="flex items-center gap-2">
                        <FaHandPointer size={18} />
                        Apontamentos
                     </div>
                  </div>
               )}
               {isLoadingTarefas && 'Carregando...'}
            </button>
         </TooltipTrigger>
         <TooltipContent
            side="top"
            align="center"
            sideOffset={2}
            className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
         >
            Visualizar tabela de tarefas e/ou realizar apontamentos
         </TooltipContent>
      </Tooltip>
   );
}
