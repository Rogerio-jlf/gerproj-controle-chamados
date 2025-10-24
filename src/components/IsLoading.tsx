import { Loader2 } from 'lucide-react';
import { FaDatabase } from 'react-icons/fa';

interface LoadingOverlayProps {
   isLoading: boolean;
   title?: string;
   icon?: React.ReactNode;
}

export function IsLoading({
   isLoading,
   title = 'Carregando...',
}: LoadingOverlayProps) {
   if (!isLoading) return null;

   return (
      <div className="animate-in fade-in fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm duration-300">
         <div className="flex flex-col items-center justify-center gap-6">
            <div className="relative">
               <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-200 via-blue-400 to-blue-600 opacity-20 blur-xl"></div>

               <div className="relative flex items-center justify-center">
                  <Loader2 className="animate-spin text-blue-600" size={160} />

                  <div className="absolute inset-0 flex items-center justify-center">
                     <FaDatabase className="text-blue-600" size={60} />
                  </div>
               </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-4">
               <h3 className="text-3xl font-extrabold tracking-wider text-white select-none">
                  {title}
               </h3>

               <div className="flex items-center justify-center gap-1">
                  <span className="text-lg font-semibold tracking-wider text-white italic select-none">
                     Carregando
                  </span>

                  <div className="flex gap-1">
                     <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400"></div>
                     <div
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400"
                        style={{ animationDelay: '0.1s' }}
                     ></div>
                     <div
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400"
                        style={{ animationDelay: '0.2s' }}
                     ></div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
