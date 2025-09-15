import { Loader2 } from 'lucide-react';
import { FaDatabase } from 'react-icons/fa';

interface IsLoadingProps {
   title: string;
}

export default function IsLoading({ title }: IsLoadingProps) {
   return (
      <div className="flex flex-col items-center justify-center gap-6 py-40">
         <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-cyan-200 via-cyan-400 to-cyan-600 opacity-20 blur-xl"></div>

            <div className="relative flex items-center justify-center">
               <Loader2 className="animate-spin text-blue-600" size={120} />

               <div className="absolute inset-0 flex items-center justify-center">
                  <FaDatabase className="text-blue-600" size={60} />
               </div>
            </div>
         </div>
         {/* ===== */}

         <div className="flex flex-col items-center justify-center gap-4">
            <h3 className="text-3xl font-extrabold tracking-wider text-blue-600 select-none">
               {title}
            </h3>

            <div className="flex items-center justify-center gap-1">
               <span className="text-lg font-semibold tracking-wider text-blue-600 italic select-none">
                  Aguarde
               </span>

               <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"></div>
                  <div
                     className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"
                     style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                     className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"
                     style={{ animationDelay: '0.2s' }}
                  ></div>
               </div>
            </div>
         </div>
      </div>
   );
}
