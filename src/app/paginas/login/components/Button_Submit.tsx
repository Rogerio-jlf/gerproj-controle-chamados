"use client";

import { ImSpinner2 } from 'react-icons/im';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import { motion } from 'framer-motion';

type ButtonSubmitProps = {
  isLoading: boolean;
};

export default function ButtonSubmit({ isLoading }: ButtonSubmitProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="relative mt-2"
    >
      {/* Efeito de brilho animado */}
      <motion.div 
        className="absolute -inset-1 rounded-xl bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-purple-600/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
        animate={{ 
          opacity: [0, 0.5, 0],
          scale: [0.95, 1.05, 0.95] 
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut'
        }}
      />
      
      <motion.button
        type="submit"
        disabled={isLoading}
        className={`group relative flex w-full transform cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-purple-800 via-pink-800 to-purple-800 p-4 shadow-lg transition-all duration-300 ${
          isLoading
            ? 'cursor-not-allowed opacity-80'
            : 'hover:shadow-xl hover:shadow-purple-900/20'
        }`}
        whileHover={isLoading ? {} : { scale: 1.02, y: -4 }}
        whileTap={isLoading ? {} : { scale: 0.95 }}
      >
        {/* Efeito de brilho no hover */}
        <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Efeito de partículas */}
        {!isLoading && (
          <>
            <span className="absolute top-0 left-[40%] h-[2px] w-[20px] animate-particle-top bg-white/40 blur-[1px]" />
            <span className="absolute top-0 left-[60%] h-[2px] w-[30px] animate-particle-top bg-white/40 blur-[1px] delay-150" />
            <span className="absolute bottom-0 left-[30%] h-[2px] w-[25px] animate-particle-bottom bg-white/40 blur-[1px]" />
            <span className="absolute bottom-0 left-[70%] h-[2px] w-[15px] animate-particle-bottom bg-white/40 blur-[1px] delay-300" />
          </>
        )}
        
        {isLoading ? (
          <motion.span 
            className="relative z-10 flex items-center gap-2 font-semibold tracking-wider text-white"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ImSpinner2 className="h-5 w-5 animate-spin" />
            Entrando...
          </motion.span>
        ) : (
          <>
            <span className="relative z-10 mr-2 text-lg font-bold tracking-wider text-white">
              Entrar
            </span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                repeatType: 'reverse',
                ease: 'easeInOut'
              }}
            >
              <MdOutlineKeyboardArrowRight className="relative z-10 h-6 w-6 text-white transition-transform duration-300 group-hover:translate-x-2" />
            </motion.div>
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
