'use client';

import { useRouter } from 'next/navigation';
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '@/components/ui/tooltip';
// ================================================================================
import { FiLogOut } from 'react-icons/fi';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
// ================================================================================
// ================================================================================

export default function LogoutButton() {
   const router = useRouter();

   const [isLoading, setIsLoading] = useState(false);

   const handleLogout = async () => {
      setIsLoading(true);

      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.removeItem('token');
      localStorage.removeItem('rememberedEmail');
      router.push('/');
   };
   // ================================================================================

   return (
      <Tooltip>
         <TooltipTrigger asChild>
            <div
               className="group w-fit cursor-pointer bg-gradient-to-br from-red-500 via-red-600 to-red-500 p-4 text-2xl text-white shadow-md shadow-black transition-all hover:scale-110 hover:rotate-90 hover:bg-red-800 hover:shadow-lg hover:shadow-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
               style={{
                  borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                  animation: isLoading
                     ? 'none'
                     : 'blob 4s ease-in-out infinite',
               }}
               onClick={handleLogout}
            >
               <button
                  className="flex items-center transition-all group-hover:scale-110 group-hover:cursor-pointer disabled:cursor-not-allowed"
                  disabled={isLoading}
               >
                  {isLoading ? (
                     <Loader2 className="animate-spin" size={32} />
                  ) : (
                     <FiLogOut size={32} />
                  )}
               </button>
            </div>
         </TooltipTrigger>
         <TooltipContent
            side="bottom"
            align="center"
            sideOffset={2}
            className="border-b-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
         >
            {isLoading ? 'Saindo...' : 'Sair'}
         </TooltipContent>
      </Tooltip>
   );
}
