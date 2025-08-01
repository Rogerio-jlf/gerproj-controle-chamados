import { useAuth } from '@/contexts/Auth_Context';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Users,
  Loader2,
  FileCheck,
  FilePlus,
} from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/postgre/Notificacao_Context';

interface SidebarButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label?: string;
  isActive: boolean;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  collapsed?: boolean;
  isLoading?: boolean;
  isNavigating?: boolean;
  badgeCount?: number; // ADICIONADO
}

function SidebarButton({
  icon: IconComponent,
  label,
  isActive,
  onClick,
  variant = 'primary',
  collapsed = false,
  isLoading = false,
  isNavigating = false,
  badgeCount, // ADICIONADO
}: SidebarButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const activeState = isActive || isNavigating;

  const primaryStyles = activeState
    ? `relative bg-gradient-to-r from-slate-800 via-blue-800 to-cyan-800 text-white shadow-2xl shadow-yellow-950 border border-blue-400/50 backdrop-blur-sm ${isNavigating ? 'animate-pulse' : ''}`
    : `relative text-white hover:text-black hover:bg-cyan-500 hover:border-blue-400/50 border border-transparent backdrop-blur-sm`;

  const secondaryStyles = activeState
    ? `relative bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 text-white shadow-2xl shadow-emerald-500/25 border border-emerald-400/30 backdrop-blur-sm ${isNavigating ? 'animate-pulse' : ''}`
    : `relative text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-400/20 hover:via-teal-500/20 hover:to-cyan-600/20 hover:border-emerald-400/30 border border-transparent backdrop-blur-sm`;

  const dangerStyles = `relative text-white hover:bg-gradient-to-r hover:from-red-500/50 hover:via-rose-500/50 hover:to-pink-500/50 hover:border-red-400/50 border border-transparent backdrop-blur-sm`;

  function getVariantStyles() {
    switch (variant) {
      case 'primary':
        return primaryStyles;
      case 'secondary':
        return secondaryStyles;
      case 'danger':
        return dangerStyles;
      default:
        return primaryStyles;
    }
  }

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      className={`group mb-3 flex w-full transform cursor-pointer items-center gap-4 overflow-hidden rounded-xl p-4 transition-all duration-300 ease-out select-none hover:scale-105 focus:outline-none active:scale-95 ${getVariantStyles()} ${collapsed ? 'justify-center px-3' : ''}`}
      type="button"
      title={collapsed ? label : undefined}
      disabled={isLoading || isNavigating}
    >
      <div className="absolute inset-0 -translate-x-full rounded-xl bg-gradient-to-r from-transparent via-black to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
      {isPressed && !isNavigating && (
        <div className="absolute inset-0 animate-ping rounded-xl bg-current opacity-30" />
      )}
      {(isLoading || isNavigating) && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-800/30 via-blue-800/30 to-cyan-800/30 backdrop-blur-sm" />
      )}

      {/* Ícone ou badge colapsado */}
      {collapsed ? (
        // MODO COLAPSADO
        label === 'Mensagens' && (badgeCount ?? 0) > 0 ? (
          <div className="relative z-10 flex h-8 w-8 items-center justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 px-1 py-6 text-base font-bold tracking-wider text-white">
              <span className="text-sm font-bold">
                {(badgeCount ?? 0) > 99 ? '99+' : badgeCount}
              </span>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex-shrink-0">
            <div
              className={`rounded-md p-2 transition-all duration-300 ${
                activeState
                  ? 'bg-white/20 shadow-md shadow-black'
                  : 'group-hover:bg-white/20 group-hover:shadow-md group-hover:shadow-black'
              }`}
            >
              {isLoading || isNavigating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <IconComponent
                  className={`h-5 w-5 transition-all duration-300 ${
                    activeState ? 'scale-110 drop-shadow-lg' : ''
                  } ${isHovered && !isNavigating ? 'scale-110 rotate-90' : ''}`}
                />
              )}
            </div>
          </div>
        )
      ) : (
        // MODO EXPANDIDO
        <>
          <div className="relative z-10 flex-shrink-0">
            <div
              className={`rounded-md p-2 transition-all duration-300 ${
                activeState
                  ? 'bg-white/20 shadow-md shadow-black'
                  : 'group-hover:bg-white/20 group-hover:shadow-md group-hover:shadow-black'
              }`}
            >
              {isLoading || isNavigating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <IconComponent
                  className={`h-5 w-5 transition-all duration-300 ${
                    activeState ? 'scale-110 drop-shadow-lg' : ''
                  } ${isHovered && !isNavigating ? 'scale-110 rotate-90' : ''}`}
                />
              )}
            </div>
          </div>

          <div className="relative z-10 flex-1 items-start text-left">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`block text-sm font-semibold tracking-wide transition-all duration-300 group-hover:translate-x-1 ${
                  isNavigating ? 'opacity-75' : ''
                }`}
              >
                {isNavigating ? 'Carregando...' : label}
              </span>

              {label === 'Mensagens' && (badgeCount ?? 0) > 0 && (
                <span className="rounded-full bg-red-500 px-6 py-1 text-base font-bold tracking-wider text-white">
                  {(badgeCount ?? 0) > 99 ? '99+' : badgeCount}
                </span>
              )}
            </div>

            {activeState && (
              <div
                className={`absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-gradient-to-r from-white to-transparent ${
                  isNavigating ? 'animate-pulse' : ''
                }`}
              />
            )}
          </div>
        </>
      )}

      {/* Dots para collapsed navegando */}
      {collapsed && isNavigating && (
        <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 space-x-1">
          <div
            className="h-1 w-1 animate-bounce rounded-full bg-cyan-400"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="h-1 w-1 animate-bounce rounded-full bg-cyan-400"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="h-1 w-1 animate-bounce rounded-full bg-cyan-400"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      )}
    </button>
  );
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

export default function Sidebar({
  collapsed,
  onToggle,
  onLogout,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, nomeRecurso } = useAuth();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { unreadCount } = useNotifications();

  // Limpar estado de navegação quando a rota mudar
  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  // Função para lidar com navegação
  const handleNavigation = async (path: string) => {
    if (navigatingTo || pathname === path) return;

    setNavigatingTo(path);

    // Simular um pequeno delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      router.push(path);
    } catch (error) {
      console.error('Erro na navegação:', error);
      setNavigatingTo(null);
    }
  };

  // Função para lidar com logout
  const handleLogoutClick = async () => {
    setIsLoggingOut(true);

    // Simular delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      onLogout();
    } catch (error) {
      console.error('Erro no logout:', error);
      setIsLoggingOut(false);
    }
  };

  const getInitials = (nome: string | null) => {
    if (!nome) return '??';
    const words = nome.trim().split(' ');
    const initials = words
      .map(word => word[0])
      .slice(0, 2)
      .join('');
    return initials.toUpperCase();
  };

  const initials = isAdmin ? 'AD' : getInitials(nomeRecurso);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      variant: 'primary' as const,
      path: '/paginas/dashboard',
    },
    {
      id: 'tabela-chamados',
      label: 'Chamados',
      icon: FileCheck,
      variant: 'primary' as const,
      path: '/paginas/tabela-chamados',
    },
    {
      id: 'tabela-chamados-abertos',
      label: 'Chamados Abertos',
      icon: FilePlus,
      variant: 'primary' as const,
      path: '/paginas/tabela-chamados-abertos',
    },
    {
      id: 'mensagens',
      label: 'Mensagens',
      icon: MessageSquare,
      variant: 'primary' as const,
      path: '/paginas/mensagens',
      badgeCount: unreadCount,
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: Settings,
      variant: 'primary' as const,
      path: '/paginas/configuracoes',
    },
  ];

  return (
    <div
      className={`fixed top-0 left-0 z-50 h-full overflow-hidden transition-all duration-300 ease-out ${collapsed ? 'w-20' : 'w-80'}`}
    >
      {/* Fundo com efeito glassmorphism */}
      <div className="absolute inset-0 border-r border-gray-700/50 bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950 shadow-2xl backdrop-blur-xl" />

      <div className="relative flex h-full flex-col overflow-hidden">
        {/* Header com efeitos */}
        <div className="border-b border-slate-600 p-6 backdrop-blur-sm">
          <div
            className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}
          >
            {!collapsed && (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 p-0.5">
                    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gray-900">
                      <Image
                        src="/logo-solutii.png"
                        alt="Logo"
                        width={48}
                        height={48}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-wider text-white select-none">
                    Solutii
                  </h1>
                  <p className="text-xs font-semibold tracking-wider text-white italic select-none">
                    Sistema de Gestão
                  </p>
                </div>
              </div>
            )}
            {/* BOTÃO MENU */}
            <button
              onClick={onToggle}
              className="group relative rounded-xl border border-slate-800 bg-gradient-to-br from-teal-600 via-slate-700 to-teal-600 p-3 shadow-md shadow-black transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Menu
                className={`h-5 w-5 text-white transition-all duration-300 group-hover:rotate-90 ${
                  !collapsed ? 'group-hover:rotate-90' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Navegação principal */}
        <nav className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <div
                key={item.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="animate-fade-in relative"
              >
                <SidebarButton
                  icon={item.icon}
                  label={item.label}
                  isActive={pathname === item.path}
                  onClick={() => handleNavigation(item.path)}
                  variant={item.variant}
                  collapsed={collapsed}
                  isNavigating={navigatingTo === item.path}
                  badgeCount={
                    item.id === 'mensagens' ? item.badgeCount : undefined
                  }
                />

                {/* Badge de notificações para mensagens */}
                {/* {item.id === 'mensagens' &&
                  item.badgeCount &&
                  item.badgeCount > 0 &&
                  collapsed && (
                    <div
                      className={`absolute ${collapsed ? '-top-1 -right-1' : 'top-2 right-2'} z-20`}
                    >
                      <div className="flex h-6 w-6 animate-pulse items-center justify-center rounded-full bg-red-500 shadow-lg">
                        <span className="text-xs font-bold text-white">
                          {item.badgeCount > 99 ? '99+' : item.badgeCount}
                        </span>
                      </div>
                    </div>
                  )} */}
              </div>
            ))}
          </div>
        </nav>

        {/* Footer com perfil do usuário */}
        <div className="border-t border-slate-600 backdrop-blur-sm">
          {!collapsed ? (
            <div className="space-y-4 p-6">
              {/* Perfil do usuário */}
              <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-white/10 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/15">
                <div className="relative">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 p-0.5">
                    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gray-900">
                      <span className="font-bold tracking-wider text-white select-none">
                        {initials}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="font-bold tracking-wider text-white select-none">
                    {isAdmin ? 'Administrador' : (nomeRecurso ?? 'Usuário')}
                  </p>
                  <p className="text-xs tracking-wider text-gray-400 select-none">
                    {isAdmin ? '' : 'Consultor'}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                    <span className="text-xs font-semibold tracking-wider text-green-500 italic select-none">
                      Online
                    </span>
                  </div>
                </div>
              </div>

              {/* Botão de logout */}
              <SidebarButton
                icon={LogOut}
                label="Sair"
                isActive={false}
                onClick={handleLogoutClick}
                variant="danger"
                collapsed={false}
                isLoading={isLoggingOut}
              />
            </div>
          ) : (
            // Versão colapsada aqui...
            <div className="space-y-4 p-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/25">
                    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gray-900">
                      <span className="font-bold text-white">{initials}</span>
                    </div>
                  </div>
                  <div className="absolute -right-1 -bottom-1 h-4 w-4 animate-pulse rounded-full border-2 border-slate-800 bg-green-500" />
                </div>
              </div>

              <SidebarButton
                icon={LogOut}
                label="Sair"
                isActive={false}
                onClick={handleLogoutClick}
                variant="danger"
                collapsed={true}
                isLoading={isLoggingOut}
              />
            </div>
          )}
        </div>
      </div>

      {/* Estilos CSS customizados */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        .scrollbar-thin {
          scrollbar-width: thin;
        }

        .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
          background-color: rgb(75, 85, 99);
          border-radius: 9999px;
        }

        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background-color: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
      `}</style>
    </div>
  );
}
