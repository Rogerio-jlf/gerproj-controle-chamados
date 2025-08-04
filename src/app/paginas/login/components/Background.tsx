"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Background() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        animate={{
          x: mousePosition.x * -20,
          y: mousePosition.y * -20,
        }}
        transition={{ type: 'spring', damping: 50, stiffness: 100 }}
      >
        <Image
          src="/imagem-fundo-login.webp"
          alt="Imagem de fundo da tela de login"
          fill
          priority
          className="object-cover opacity-70 scale-110"
          style={{ filter: 'brightness(0.7) saturate(1.2)' }}
        />
      </motion.div>
      
      {/* Overlay gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-purple-950/40 to-pink-900/40 backdrop-filter backdrop-blur-[2px]"></div>
    </div>
  );
}
