"use client";

import { IoEye, IoEyeOff, IoLockClosed } from 'react-icons/io5';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../../../components/ui/tooltip';

interface Props {
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  toggleShowPassword: () => void;
}

export default function PasswordInput({
  value,
  onChange,
  showPassword,
  toggleShowPassword,
}: Props) {
  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <motion.label
        htmlFor="password"
        className="block text-sm font-medium tracking-wider text-white/90 select-none"
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        Senha
      </motion.label>

      <div className="group relative">
        <motion.div 
          className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <IoLockClosed className="h-5 w-5 text-white/70 transition-colors duration-300 group-focus-within:text-purple-400" />
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Digite sua senha"
            required
            className="block w-full rounded-lg border border-white/20 bg-white/10 py-4 pr-12 pl-11 text-sm tracking-wider text-white placeholder-white/60 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/20 focus:border-transparent focus:ring-2 focus:ring-purple-500/70 focus:outline-none"
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                type="button"
                onClick={toggleShowPassword}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 z-10 flex touch-manipulation items-center pr-4 transition-all duration-300 focus:outline-none"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? (
                  <IoEyeOff className="h-5 w-5 text-white/80 hover:text-white" />
                ) : (
                  <IoEye className="h-5 w-5 text-white/80 hover:text-white" />
                )}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-md -translate-x-10 border border-slate-700/50 bg-slate-900/90 backdrop-blur-md tracking-wider break-words text-white transition-all duration-300"
            >
              <p className="text-xs font-medium">
                {showPassword ? 'Ocultar senha' : 'Exibir senha'}
              </p>
            </TooltipContent>
          </Tooltip>
          
          {/* Efeito de foco */}
          <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 blur-sm transition-opacity duration-300 group-focus-within:opacity-100"></div>
          
          {/* Efeito de brilho */}
          <div className="absolute inset-0 -z-20 rounded-lg bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-purple-600/10 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"></div>
        </motion.div>
      </div>
    </motion.div>
  );
}
