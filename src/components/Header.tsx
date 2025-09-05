import { useCallback } from 'react';
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '@/components/ui/tooltip';
// ================================================================================
import LogoutButton from './Button_Logout';
import Filtros from '../app/paginas/chamados/components/Filtros';
import { useFiltersTabelaChamados } from '../contexts/Filters_Context';
// ================================================================================
import { LuRefreshCw } from 'react-icons/lu';
// ================================================================================
// ================================================================================

interface Props {
   titulo: string;
   subtitulo?: string;
   icon?: React.ReactNode;
}
// ================================================================================

export default function Header({ titulo, subtitulo, icon }: Props) {
   const { setFilters } = useFiltersTabelaChamados();

   const handleFiltersChange = useCallback(
      (newFilters: { ano: number | 'todos'; mes: number | 'todos' }) => {
         setFilters(prevFilters => ({
            ...prevFilters,
            ...newFilters,
         }));
      },
      [setFilters]
   );
   // ================================================================================

   return (
      <header>
         <div className="grid grid-cols-[30%_40%_30%] border-b-2 border-red-500 bg-gray-100 pb-6">
            {/* Itens da esquerda */}
            <section className="flex items-center gap-4">
               {/* Ícone */}
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
                  {/* Título */}
                  <h1 className="text-4xl font-extrabold tracking-widest text-gray-900 uppercase select-none">
                     {titulo}
                  </h1>
                  {subtitulo && (
                     <h2 className="text-base font-bold tracking-wider text-gray-900 italic select-none">
                        {subtitulo}
                     </h2>
                  )}
               </div>
            </section>
            {/* ===== */}

            {/* Item do meio */}
            <section>
               <Filtros onFiltersChange={handleFiltersChange} />
            </section>
            {/* ===== */}

            {/* Itens da direita */}
            <section className="flex items-center justify-end gap-4">
               <div className="flex items-center gap-4">
                  <div className="text-right">
                     {/* Título */}
                     <h2 className="text-sm font-bold tracking-widest text-gray-900 italic select-none">
                        Última atualização
                     </h2>

                     {/* Data atualizada */}
                     <p className="text-base font-extrabold tracking-wider text-gray-900 italic select-none">
                        {new Date().toLocaleString('pt-BR')}
                     </p>
                  </div>
                  {/* ===== */}

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
                        className="border-b-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
                     >
                        Atualizar dados
                     </TooltipContent>
                  </Tooltip>
               </div>
               {/* ===== */}

               {/* Barra separadora */}
               <div className="mx-4 h-10 w-1 bg-red-500" />
               {/* ===== */}

               {/* Botão logout */}
               <LogoutButton />
               {/* ===== */}
            </section>
            {/* ===== */}
         </div>
      </header>
   );
}
