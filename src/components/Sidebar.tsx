import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IoMdAnalytics } from 'react-icons/io';
import { IoClose, IoHome, IoMenu } from 'react-icons/io5';
import LogoutButton from './Logout_Button';

// Define as props esperadas pelo componente Sidebar
interface SidebarProps {
  setSidebarOpen: (open: boolean) => void;
}

// Componente funcional Sidebar
export default function Sidebar({ setSidebarOpen }: SidebarProps) {
  const pathname = usePathname(); // Hook para obter a rota atual
  const [isCollapsed, setIsCollapsed] = useState(false); // Estado para controlar se a sidebar está recolhida

  // Carrega o estado do localStorage quando o componente monta
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Função para alternar o estado de recolhimento
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    // Salva o estado no localStorage
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  return (
    // Container principal da sidebar com largura dinâmica
    <nav
      className={`flex h-full flex-col items-center rounded-2xl bg-gradient-to-b from-purple-800 to-purple-900 p-6 text-white shadow-xl transition-all duration-300 ${
        isCollapsed ? 'w-[80px]' : 'w-[180px]'
      }`}
      onClick={(e) => e.stopPropagation()} // Impede propagação do clique para evitar fechar a sidebar
    >
      {/* Botão para recolher/expandir a sidebar */}
      <button
        onClick={toggleCollapse}
        className="group relative mb-8 flex items-center justify-center rounded-xl p-2 text-white transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:shadow-lg hover:shadow-white/20 active:scale-95 active:bg-white/30"
      >
        {isCollapsed ? (
          <IoMenu className="h-6 w-6 transition-all duration-300 group-hover:drop-shadow-lg" />
        ) : (
          <IoClose className="h-6 w-6 transition-all duration-300 group-hover:drop-shadow-lg" />
        )}
        {/* Efeito de brilho ao hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
        {/* Tooltip */}
        <div className="absolute left-full ml-3 hidden rounded-lg bg-black/80 px-2 py-1 text-sm whitespace-nowrap text-white opacity-0 transition-opacity duration-300 group-hover:block group-hover:opacity-100">
          {isCollapsed ? 'Expandir' : 'Recolher'}
        </div>
      </button>

      {/* Logo da empresa no topo da sidebar */}
      <div
        className={`transition-all duration-300 ${isCollapsed ? 'mb-4' : 'mb-8'}`}
      >
        <Image
          src="/logo-solutii.png"
          alt="Logo"
          width={isCollapsed ? 70 : 120}
          height={isCollapsed ? 70 : 120}
          className={`rounded-full bg-white/10 backdrop-blur-sm transition-all duration-300 ${
            isCollapsed ? 'p-1' : 'p-2'
          }`}
          priority
        />
      </div>

      {/* Bloco de navegação com os links principais */}
      <div className="mt-8 space-y-6">
        {/* Link para a página inicial do dashboard */}
        <Link
          href="/dashboard"
          className={`group relative flex items-center justify-center rounded-xl p-3 text-white no-underline transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white/20 active:scale-95 ${
            pathname === '/dashboard'
              ? 'bg-white/30 shadow-lg ring-2 shadow-white/30 ring-white/50'
              : 'hover:bg-white/20 active:bg-white/30'
          }`}
          onClick={() => setSidebarOpen(false)} // Fecha a sidebar ao clicar
        >
          <IoHome
            className={`h-8 w-8 transition-all duration-300 group-hover:drop-shadow-lg group-hover:filter group-active:scale-90 ${
              pathname === '/dashboard' ? 'text-white drop-shadow-lg' : ''
            }`}
          />
          {/* Efeito de brilho ao hover */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          {/* Indicador de página ativa */}
          {pathname === '/dashboard' && (
            <div className="absolute top-1/2 -left-1 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white"></div>
          )}
          {/* Tooltip - só aparece quando recolhida */}
          {isCollapsed && (
            <div className="absolute left-full ml-3 hidden rounded-lg bg-black/80 px-2 py-1 text-sm whitespace-nowrap text-white opacity-0 transition-opacity duration-300 group-hover:block group-hover:opacity-100">
              Dashboard
            </div>
          )}
          {/* Label - só aparece quando expandida */}
          {!isCollapsed && (
            <span className="ml-3 text-sm font-medium transition-all duration-300">
              Dashboard
            </span>
          )}
        </Link>

        {/* Link para a página de chamados/tickets */}
        <Link
          href="/tabela-chamado"
          className={`group relative flex items-center justify-center rounded-xl p-3 text-white no-underline transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white/20 active:scale-95 ${
            pathname === '/tabela-chamado'
              ? 'bg-white/30 shadow-lg ring-2 shadow-white/30 ring-white/50'
              : 'hover:bg-white/20 active:bg-white/30'
          }`}
          onClick={() => setSidebarOpen(false)} // Fecha a sidebar ao clicar
        >
          <IoMdAnalytics
            className={`h-8 w-8 transition-all duration-300 group-hover:drop-shadow-lg group-hover:filter group-active:scale-90 ${
              pathname === '/tabela-chamado' ? 'text-white drop-shadow-lg' : ''
            }`}
          />
          {/* Efeito de brilho ao hover */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          {/* Indicador de página ativa */}
          {pathname === '/tabela-chamado' && (
            <div className="absolute top-1/2 -left-1 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white"></div>
          )}
          {/* Tooltip - só aparece quando recolhida */}
          {isCollapsed && (
            <div className="absolute left-full ml-3 hidden rounded-lg bg-black/80 px-2 py-1 text-sm whitespace-nowrap text-white opacity-0 transition-opacity duration-300 group-hover:block group-hover:opacity-100">
              Chamados
            </div>
          )}
          {/* Label - só aparece quando expandida */}
          {!isCollapsed && (
            <span className="ml-3 text-sm font-medium transition-all duration-300">
              Chamados
            </span>
          )}
        </Link>
      </div>

      {/* Bloco inferior com o botão de logout */}
      <div className="mt-auto flex w-full flex-col items-center">
        <LogoutButton isCollapsed={isCollapsed} />
      </div>
    </nav>
  );
}
