import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '../components/ui/tooltip';
// ================================================================================
import LogoutButton from './Button_Logout';
// ================================================================================
import { LuRefreshCw } from 'react-icons/lu';

// ================================================================================
// INTERFACES E TIPOS
// ================================================================================
interface HeaderProps {
   titulo: string;
   subtitulo?: string;
   icon?: React.ReactNode;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export default function Header({ titulo, subtitulo, icon }: HeaderProps) {
   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <header>
         <div className="flex items-center justify-between bg-teal-900 px-16 py-10">
            {/* ===== ITENS DA ESQUERDA ===== */}
            <div className="flex items-center gap-6">
               <div
                  className="w-fit bg-gradient-to-br from-purple-950 via-blue-500 to-purple-950 p-4 text-2xl text-white shadow-md shadow-black"
                  style={{
                     borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                     animation: 'blob 4s ease-in-out infinite',
                  }}
               >
                  {icon}
               </div>
               {/* ===== */}

               <div className="flex flex-col">
                  <h1 className="text-5xl font-extrabold tracking-widest text-white uppercase select-none">
                     {titulo}
                  </h1>
                  {/* ===== */}
                  {subtitulo && (
                     <h2 className="text-lg font-bold tracking-widest text-white italic select-none">
                        {subtitulo}
                     </h2>
                  )}
               </div>
            </div>
            {/* ========== */}

            {/* ===== ITENS DA DIREITA ===== */}
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-4">
                  <div className="text-right">
                     <h2 className="text-sm font-bold tracking-widest text-white italic select-none">
                        Última atualização
                     </h2>
                     {/* ===== */}

                     <p className="text-base font-extrabold tracking-wider text-white italic select-none">
                        {new Date().toLocaleString('pt-BR')}
                     </p>
                  </div>
                  {/* ========== */}

                  {/* Botão atualizar página */}
                  <Tooltip>
                     <TooltipTrigger asChild>
                        <button onClick={() => window.location.reload()}>
                           <LuRefreshCw
                              className="cursor-pointer text-red-500 transition-all hover:scale-125 hover:rotate-180 hover:text-blue-500 active:scale-95"
                              size={40}
                           />
                        </button>
                     </TooltipTrigger>
                     <TooltipContent
                        side="bottom"
                        align="center"
                        sideOffset={2}
                        className="border-b-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black shadow-lg shadow-black select-none"
                     >
                        Atualizar dados
                     </TooltipContent>
                  </Tooltip>
               </div>
               {/* ========== */}

               {/* Barra separadora */}
               <div className="mx-4 h-10 w-1 bg-red-500" />
               {/* ========== */}

               {/* Botão logout */}
               <LogoutButton />
            </div>
         </div>
      </header>
   );
}
