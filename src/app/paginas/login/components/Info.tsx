"use client";

import { motion } from 'framer-motion';

export default function Info() {
  return (
    <div className="flex flex-col items-start justify-center text-left">
      {/* Título com gradiente e animação */}
      <motion.h2 
        className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-6xl sm:text-7xl leading-tight font-extrabold tracking-tighter text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.4)] select-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        Solutii Sistemas
      </motion.h2>

      {/* Linha decorativa animada */}
      <motion.div 
        className="mt-4 h-1.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: '5rem', opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      />

      {/* Subtítulo com animação */}
      <motion.div
        className="mt-6 max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9 }}
      >
        <span className="text-2xl sm:text-3xl font-semibold tracking-wide text-white drop-shadow-[0_1px_8px_rgba(255,255,255,0.2)] select-none">
          Gerproj gestão de chamados
        </span>
      </motion.div>
      
      {/* Recursos destacados */}
      <motion.div
        className="mt-8 space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        {[
          'Acompanhamento em tempo real',
          'Gestão eficiente de recursos',
          'Relatórios detalhados',
          'Interface intuitiva'
        ].map((item, index) => (
          <motion.div 
            key={index}
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.2 + (index * 0.1) }}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 shadow-[0_0_8px_rgba(236,72,153,0.6)]"></div>
            <span className="text-sm font-medium text-white/80">{item}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
