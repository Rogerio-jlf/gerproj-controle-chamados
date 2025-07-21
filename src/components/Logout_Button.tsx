'use client';

import { useFilters } from '@/contexts/FiltersContext';
import { useRouter } from 'next/navigation';
import { IoLogOut } from 'react-icons/io5'; // Ícone de logout
import { useAuth } from '../contexts/AuthContext'; // Contexto de autenticação

// Interface para as props do componente
interface LogoutButtonProps {
  isCollapsed?: boolean;
}

// Componente funcional para o botão de logout
export default function LogoutButton({
  isCollapsed = false,
}: LogoutButtonProps) {
  const { logout } = useAuth(); // Obtém a função de logout do contexto de autenticação
  const { clearFilters } = useFilters(); // Obtém a função para limpar filtros do contexto de filtros

  const router = useRouter(); // Inicializa o hook de navegação para redirecionamento

  // Função chamada ao clicar no botão de logout
  const handleLogout = () => {
    logout(); // Realiza o logout do usuário
    clearFilters(); // Limpa os filtros aplicados
    router.push('/login'); // Redireciona o usuário para a página de login
  };

  // Renderiza o botão de logout com estilos aprimorados
  return (
    <button
      onClick={handleLogout}
      className={`group relative flex w-full items-center rounded-xl bg-white/10 text-white transition-all duration-300 hover:scale-105 hover:bg-red-500/20 hover:shadow-lg hover:shadow-red-500/20 active:scale-95 active:bg-red-500/30 ${
        isCollapsed ? 'justify-center p-3' : 'justify-center gap-3 px-4 py-3'
      }`}
    >
      {/* Ícone de logout */}
      <IoLogOut
        className={`transition-all duration-300 group-hover:drop-shadow-lg group-hover:filter group-active:scale-90 ${
          isCollapsed ? 'h-7 w-7' : 'h-5 w-5'
        }`}
      />

      {/* Texto do botão - só aparece quando expandida */}
      {!isCollapsed && (
        <span className="font-semibold transition-all duration-300 group-hover:drop-shadow-sm">
          Logout
        </span>
      )}

      {/* Efeito de brilho ao hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

      {/* Tooltip - só aparece quando recolhida */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 hidden rounded-lg bg-black/80 px-2 py-1 text-sm whitespace-nowrap text-white opacity-0 transition-opacity duration-300 group-hover:block group-hover:opacity-100">
          Sair da aplicação
        </div>
      )}

      {/* Tooltip quando expandida - aparece acima */}
      {!isCollapsed && (
        <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded-lg bg-black/80 px-2 py-1 text-sm whitespace-nowrap text-white opacity-0 transition-opacity duration-300 group-hover:block group-hover:opacity-100">
          Sair da aplicação
        </div>
      )}
    </button>
  );
}
