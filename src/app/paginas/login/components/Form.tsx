'use client';

import { useAuth } from '@/contexts/Auth_Context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Email_Input from './Email_Input';
import Password_Input from './Password_Input';
import Remember_Check from './Remember_Check';
import Button_Submit from './Button_Submit';
import { FiAlertCircle } from 'react-icons/fi';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function Form() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userData = await login(email, password);
      console.log('UserData retornado pelo login:', userData);

      if (userData) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        await sleep(1000); // opcional, só para UX

        // Agora usando os dados retornados pela função login
        console.log('Verificando redirecionamento:', {
          isAdmin: userData.isAdmin,
          codCliente: userData.codCliente,
          codRecurso: userData.codRecurso,
        });

        if (userData.isAdmin) {
          console.log('Redirecionando para dashboard (admin)');
          await router.push('/paginas/dashboard');
        } else if (userData.codCliente) {
          await router.push('/paginas/dashboard');
        } else if (userData.codRecurso) {
          await router.push('/paginas/tabela-chamados-abertos');
        } else {
          setError('Usuário autenticado, mas sem permissões definidas.');
          setIsLoading(false);
        }
      } else {
        setError('Usuário não cadastrado ou senha inválida.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Erro ao tentar fazer login. Tente novamente.');
      setIsLoading(false);
      console.error(err);
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Email_Input value={email} onChange={setEmail} />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Password_Input
          value={password}
          onChange={setPassword}
          showPassword={showPassword}
          toggleShowPassword={() => setShowPassword(!showPassword)}
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Remember_Check
          rememberMe={rememberMe}
          onToggle={() => setRememberMe(!rememberMe)}
        />
      </motion.div>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            className="relative overflow-hidden rounded-lg border border-red-400/30 bg-red-400/10 p-4 backdrop-blur-sm shadow-lg"
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-600/5 opacity-50" />
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-red-500 to-red-600" />
            
            <div className="flex items-center gap-3">
              <FiAlertCircle className="h-5 w-5 text-red-400 animate-pulse" />
              <p className="text-sm font-semibold tracking-wide text-red-200">
                {error}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Button_Submit isLoading={isLoading} />
    </motion.form>
  );
}
