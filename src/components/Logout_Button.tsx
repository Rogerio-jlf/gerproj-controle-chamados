'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiLogOut } from 'react-icons/fi';

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Remove token
    localStorage.removeItem('token');
    localStorage.removeItem('rememberedEmail');

    // Redireciona para login
    router.push('/');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleLogout}
      className={`flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 font-semibold text-white shadow transition hover:bg-red-600 ${className}`}
    >
      <FiLogOut className="h-5 w-5" />
      Logout
    </motion.button>
  );
}
