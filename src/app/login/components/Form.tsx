'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import EmailField from './Email';
import PasswordField from './Password';
import RememberChecked from './Remember';
import SubmitButton from './Submit';

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
          await router.push('/dashboard');
        } else if (userData.codCliente) {
          console.log('Redirecionando para dashboard (cliente)');
          await router.push('/dashboard');
        } else if (userData.codRecurso) {
          console.log('Redirecionando para tabela chamados (recurso)');
          await router.push('/testes/tabela-chamados-abertos');
        } else {
          console.log('Nenhuma permissão encontrada:', userData);
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
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
      <EmailField value={email} onChange={setEmail} />
      <PasswordField
        value={password}
        onChange={setPassword}
        showPassword={showPassword}
        toggleShowPassword={() => setShowPassword(!showPassword)}
      />
      <RememberChecked
        rememberMe={rememberMe}
        onToggle={() => setRememberMe(!rememberMe)}
      />
      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-500/20 p-3 backdrop-blur-sm">
          <p className="text-center text-xs font-medium text-red-200 sm:text-sm">
            {error}
          </p>
        </div>
      )}
      <SubmitButton isLoading={isLoading} />
    </form>
  );
}
