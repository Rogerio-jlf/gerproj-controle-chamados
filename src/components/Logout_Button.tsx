'use client';

import { useRouter } from 'next/navigation';
import { FiLogOut } from 'react-icons/fi';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rememberedEmail');
    router.push('/');
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="group w-fit cursor-pointer bg-gradient-to-br from-red-500 via-red-600 to-red-500 p-4 text-2xl text-white shadow-md shadow-black transition-all hover:scale-110 hover:bg-red-800 hover:shadow-lg hover:shadow-black active:scale-95"
          style={{
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            animation: 'blob 4s ease-in-out infinite',
          }}
          onClick={handleLogout} // ✅ Passa o click para a div
        >
          <button className="flex items-center transition-all group-hover:scale-110 group-hover:cursor-pointer">
            <FiLogOut size={32} />
          </button>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="center"
        sideOffset={12}
        className="bg-gray-900 px-6 text-lg font-semibold tracking-wider text-white select-none"
      >
        Sair
      </TooltipContent>
    </Tooltip>
  );
}
