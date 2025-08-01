'use client';

import { useAuth } from '@/contexts/Auth_Context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Email_Input from './Email_Input';
import Password_Input from './Password_Input';
import Remember_Check from './Remember_Check';
import Button_Submit from './Button_Submit';

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
    <form onSubmit={handleSubmit} className="space-y-5">
      <Email_Input value={email} onChange={setEmail} />
      <Password_Input
        value={password}
        onChange={setPassword}
        showPassword={showPassword}
        toggleShowPassword={() => setShowPassword(!showPassword)}
      />
      <Remember_Check
        rememberMe={rememberMe}
        onToggle={() => setRememberMe(!rememberMe)}
      />
      {error && (
        <div className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 backdrop-blur-sm">
          <p className="text-center text-sm font-semibold text-red-200">
            {error}
          </p>
        </div>
      )}
      <Button_Submit isLoading={isLoading} />
    </form>
  );
}
