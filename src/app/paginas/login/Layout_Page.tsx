'use client';

import Background from './components/Background';
import LoginForm from './components/Form';
import LogoHeader from './components/Logo_Header';
import Info from './components/Info';
import { motion } from 'framer-motion';

export default function LayoutPage() {
  return (
    <div className="kodchasan relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-900">
      {/* Background com efeito parallax */}
      <div className="absolute inset-0 z-0">
        <Background />
      </div>

      {/* Partículas animadas */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="particles-container">
          {Array.from({ length: 20 }).map((_, index) => (
            <motion.div
              key={index}
              className="particle"
              initial={{
                x: Math.random() * 100 + '%',
                y: Math.random() * 100 + '%',
                opacity: Math.random() * 0.5 + 0.3,
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                y: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                x: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                opacity: [Math.random() * 0.5 + 0.3, Math.random() * 0.5 + 0.3],
              }}
              transition={{
                duration: Math.random() * 20 + 15,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                width: Math.random() * 6 + 2 + 'px',
                height: Math.random() * 6 + 2 + 'px',
                borderRadius: '50%',
                background:
                  'linear-gradient(to right, rgba(168, 85, 247, 0.4), rgba(236, 72, 153, 0.4))',
                boxShadow: '0 0 10px rgba(168, 85, 247, 0.6)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Grid Principal com animação */}
      <motion.div
        className="relative z-10 grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Esquerda - Informações */}
        <motion.div
          className="hidden lg:flex lg:flex-col lg:items-start lg:justify-center lg:pl-8 xl:pl-12"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Info />
        </motion.div>

        {/* Direita - Formulário */}
        <motion.div
          className="mx-auto w-full max-w-md lg:mr-8 lg:ml-auto xl:mr-12"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div
            className="w-full overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl shadow-black/40 backdrop-blur-xl"
            whileHover={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>

            <motion.div
              className="relative px-8 pt-10 pb-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <LogoHeader />
              <h1 className="mb-3 text-3xl leading-tight font-bold tracking-wide text-white select-none">
                Bem-vindo de volta!
              </h1>
              <p className="px-2 text-sm font-medium tracking-wide text-white/90 select-none">
                Entre com suas credenciais para acessar o sistema
              </p>
            </motion.div>

            <motion.div
              className="px-8 pb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <LoginForm />
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-6 px-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <p className="text-xs font-semibold tracking-wider text-white/80 select-none">
              © 2025 Solutii. Todos os direitos reservados.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
