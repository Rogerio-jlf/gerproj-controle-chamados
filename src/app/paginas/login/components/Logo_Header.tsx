"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function LogoHeader() {
  return (
    <motion.div 
      className="relative mb-8"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: 'spring',
        stiffness: 260,
        damping: 20,
        duration: 0.6 
      }}
      whileHover={{ scale: 1.05 }}
    >
      {/* Efeito de brilho animado */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-30 blur-lg"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut'
        }}
      />
      
      {/* Container do logo */}
      <motion.div 
        className="relative inline-block rounded-full border border-white/30 bg-white/10 p-3 backdrop-blur-sm shadow-lg"
        whileTap={{ scale: 0.95 }}
      >
        <Image
          src="/logo-solutii.png"
          alt="Logo Solutii"
          width={90}
          height={90}
          className="mx-auto rounded-full"
          priority
        />
        
        {/* Anel decorativo */}
        <motion.div 
          className="absolute -inset-1 rounded-full border border-white/20"
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut'
          }}
        />
      </motion.div>
    </motion.div>
  );
}
