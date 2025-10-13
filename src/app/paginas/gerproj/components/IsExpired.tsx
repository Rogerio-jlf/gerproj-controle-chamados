import { Loader2 } from 'lucide-react';
import { FaExclamationTriangle } from 'react-icons/fa';

interface SessionExpiredProps {
   isTokenExpired: boolean;
}

export function SessionExpired({ isTokenExpired }: SessionExpiredProps) {
   if (!isTokenExpired) return null;

   return (
      <div className="animate-in fade-in fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm duration-300">
         <div className="flex flex-col items-center justify-center gap-6">
            <div className="relative flex items-center justify-center">
               <Loader2 className="animate-spin text-red-600" size={160} />

               <div className="absolute inset-0 flex items-center justify-center">
                  <FaExclamationTriangle className="text-white" size={60} />
               </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-4">
               <h3 className="text-3xl font-extrabold tracking-wider text-white select-none">
                  Sessão Expirada!
               </h3>

               <p className="text-2xl font-semibold tracking-wider text-white italic select-none">
                  Sua sessão expirou. Você precisa fazer login novamente.
               </p>

               <p className="text-xl font-semibold tracking-wider text-white italic select-none">
                  Por medida de segurança, você será redirecionado para a página
                  de login.
               </p>

               <div className="flex items-center justify-center gap-1">
                  <span className="text-lg font-semibold tracking-wider text-white italic select-none">
                     Aguarde
                  </span>

                  <div className="flex gap-1">
                     <div className="h-2 w-2 animate-bounce rounded-full bg-white"></div>
                     <div
                        className="h-2 w-2 animate-bounce rounded-full bg-white"
                        style={{ animationDelay: '0.2s' }}
                     ></div>
                     <div
                        className="h-2 w-2 animate-bounce rounded-full bg-white"
                        style={{ animationDelay: '0.3s' }}
                     ></div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
