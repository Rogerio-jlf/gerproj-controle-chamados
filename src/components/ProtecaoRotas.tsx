import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtecaoRotas({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Aguarda o carregamento inicial
    if (isLoading) return;

    if (!isLoggedIn) {
      console.log('Usuário não logado, redirecionando para /login');
      router.push('/login');
      return;
    }

    // Se chegou até aqui, usuário está logado
    setShouldRender(true);
  }, [isLoggedIn, isLoading, router]);

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  // Se não está logado, não renderiza nada (redirecionamento em andamento)
  if (!isLoggedIn) {
    return null;
  }

  // Só renderiza os filhos quando tiver certeza que deve renderizar
  if (!shouldRender) {
    return null;
  }

  return <>{children}</>;
}
