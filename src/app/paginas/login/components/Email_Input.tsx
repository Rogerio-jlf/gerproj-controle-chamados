'use client';

import { motion } from 'framer-motion';
import { FaUser } from 'react-icons/fa';

interface Props {
   value: string;
   onChange: (value: string) => void;
}

export default function EmailInput({ value, onChange }: Props) {
   return (
      <motion.div
         className="space-y-2"
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.3 }}
      >
         <motion.label
            htmlFor="email"
            className="block text-sm font-medium tracking-wider text-white/90 select-none"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
         >
            Usuário
         </motion.label>

         <div className="group relative">
            <motion.div
               className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.3, delay: 0.2 }}
            >
               <FaUser className="h-5 w-5 text-white/70 transition-colors duration-300 group-focus-within:text-purple-400" />
            </motion.div>

            <motion.div
               className="relative"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.4, delay: 0.2 }}
               whileHover={{ scale: 1.01 }}
               whileTap={{ scale: 0.99 }}
            >
               <input
                  type="text"
                  id="email"
                  name="email"
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  placeholder="Digite seu usuário..."
                  required
                  className="block w-full rounded-lg border border-white/20 bg-white/10 py-4 pr-4 pl-11 text-sm tracking-wider text-white uppercase placeholder-white/60 backdrop-blur-sm transition-all duration-300 placeholder:normal-case hover:border-white/30 hover:bg-white/20 focus:border-transparent focus:ring-2 focus:ring-purple-500/70 focus:outline-none"
               />

               {/* Efeito de foco */}
               <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 blur-sm transition-opacity duration-300 group-focus-within:opacity-100"></div>

               {/* Efeito de brilho */}
               <div className="absolute inset-0 -z-20 rounded-lg bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-purple-600/10 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"></div>
            </motion.div>
         </div>
      </motion.div>
   );
}
