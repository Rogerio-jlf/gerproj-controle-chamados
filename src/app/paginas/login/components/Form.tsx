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
import jwtDecode from 'jwt-decode';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface UserToken {
  id: number;
  nome: string;
  exp: number;
}

export default function Form() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkExistingAuth = () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const decoded = jwtDecode<UserToken>(token);

          if (decoded.exp * 1000 > Date.now()) {
            router.push('/paginas/chamados');
            return;
          } else {
            localStorage.removeItem('token');
          }
        } catch {
          localStorage.removeItem('token');
        }
      }

      const rememberedEmail = localStorage.getItem('rememberedEmail');
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberMe(true);
      }
    };

    checkExistingAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email.trim()) {
      setError('Por favor, digite seu email ou usuário.');
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Por favor, digite sua senha.');
      setIsLoading(false);
      return;
    }

    try {
      const userData = await login(email, password);

      if (!userData) {
        setError('Usuário não cadastrado ou senha inválida.');
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Erro ao salvar dados de autenticação.');
        setIsLoading(false);
        return;
      }

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      await sleep(500);

      router.push('/paginas/chamados');
    } catch (err) {
      console.error('Erro no login:', err);
      setError(
        'Erro ao tentar fazer login. Verifique sua conexão e tente novamente.'
      );
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) setError('');
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) setError('');
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
        <Email_Input value={email} onChange={handleEmailChange} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Password_Input
          value={password}
          onChange={handlePasswordChange}
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
            className="relative overflow-hidden rounded-lg border border-red-400/30 bg-red-400/10 p-4 shadow-lg backdrop-blur-sm"
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-600/5 opacity-50" />
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-red-500 to-red-600" />
            <div className="flex items-center gap-3">
              <FiAlertCircle className="h-5 w-5 animate-pulse text-red-400" />
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
