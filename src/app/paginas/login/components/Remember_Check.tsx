"use client";

import { motion } from 'framer-motion';

interface Props {
  rememberMe: boolean;
  onToggle: () => void;
}

export default function RememberCheck({ rememberMe, onToggle }: Props) {
  return (
    <motion.div 
      className="flex items-center justify-between"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <motion.div 
        className="group flex items-center"
        whileHover={{ x: 3 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        <div className="relative">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={onToggle}
            className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-white/30 bg-white/10 transition-all duration-200 checked:border-purple-500 checked:bg-purple-500/30 hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
          <motion.svg
            className="pointer-events-none absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ scale: 0 }}
            animate={{ scale: rememberMe ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <polyline points="20 6 9 17 4 12" />
          </motion.svg>
        </div>
        
        <motion.label
          htmlFor="remember-me"
          className="ml-3 cursor-pointer text-sm font-medium tracking-wider text-white/80 select-none"
          whileTap={{ scale: 0.97 }}
        >
          Lembrar de mim
        </motion.label>
      </motion.div>
      
      <motion.a 
        href="#" 
        className="text-xs font-medium text-purple-300/80 hover:text-purple-300 transition-colors duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Esqueceu a senha?
      </motion.a>
    </motion.div>
  );
}
