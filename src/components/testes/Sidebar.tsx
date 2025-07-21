import { useAuth } from '@/context/AuthContext';
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface SidebarButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label?: string;
  isActive: boolean;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  collapsed?: boolean;
}

function SidebarButton({
  icon: IconComponent,
  label,
  isActive,
  onClick,
  variant = 'primary',
  collapsed = false,
}: SidebarButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  const primaryStyles = isActive
    ? `relative bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white shadow-2xl shadow-blue-500/25 border border-blue-400/30 backdrop-blur-sm`
    : `relative text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-cyan-400/20 hover:via-blue-500/20 hover:to-indigo-600/20 hover:border-blue-400/30 border border-transparent backdrop-blur-sm`;

  const secondaryStyles = isActive
    ? `relative bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 text-white shadow-2xl shadow-emerald-500/25 border border-emerald-400/30 backdrop-blur-sm`
    : `relative text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-400/20 hover:via-teal-500/20 hover:to-cyan-600/20 hover:border-emerald-400/30 border border-transparent backdrop-blur-sm`;

  const dangerStyles = `relative text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-red-500/20 hover:via-rose-500/20 hover:to-pink-600/20 hover:border-red-400/30 border border-transparent backdrop-blur-sm`;

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
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group mb-3 flex w-full transform items-center gap-4 overflow-hidden rounded-2xl p-4 transition-all duration-300 ease-out select-none hover:scale-105 focus:outline-none active:scale-95 ${getVariantStyles()} ${collapsed ? 'justify-center px-3' : ''}`}
      type="button"
      title={collapsed ? label : undefined}
    >
      {/* Efeito de brilho deslizante */}
      <div className="absolute inset-0 -translate-x-full rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />

      {/* Ondulação ao clicar */}
      {isPressed && (
        <div className="absolute inset-0 animate-ping rounded-2xl bg-current opacity-30" />
      )}

      {/* Badge especial para mensagens colapsadas */}
      {label === 'Mensagens' && collapsed ? (
        <div className="relative z-10 flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/25">
          <span className="text-xs font-bold text-white">99</span>
        </div>
      ) : (
        <>
          {/* Ícone com efeitos */}
          <div className="relative z-10 flex-shrink-0">
            <div
              className={`rounded-xl p-2 transition-all duration-300 ${isActive ? 'bg-white/20 shadow-lg' : 'group-hover:bg-white/10'}`}
            >
              <IconComponent
                className={`h-5 w-5 transition-all duration-300 ${
                  isActive ? 'scale-110 drop-shadow-lg' : ''
                } ${isHovered ? 'scale-110 rotate-12' : ''}`}
              />
            </div>
          </div>

          {/* Label com efeito de digitação */}
          {!collapsed && (
            <div className="relative z-10 flex-1 items-start text-left">
              <span className="block text-sm font-semibold tracking-wide transition-all duration-300 group-hover:translate-x-1">
                {label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-gradient-to-r from-white via-blue-200 to-transparent" />
              )}
            </div>
          )}

          {/* Badge de mensagens expandido */}
          {label === 'Mensagens' && !collapsed && (
            <div className="relative z-10">
              <div className="flex h-7 w-7 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/25">
                <span className="text-xs font-bold text-white">99</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Efeito de borda neon */}
      {isActive && (
        <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-indigo-600/20 blur-xl" />
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

  const getInitials = (nome: string | null) => {
    if (!nome) return '??';
    const words = nome.trim().split(' ');
    const initials = words
      .map((word) => word[0])
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
      path: '/testes',
    },
    {
      id: 'called',
      label: 'Chamados',
      icon: BarChart3,
      variant: 'primary' as const,
      path: '/testes/tabela-chamados',
    },
    {
      id: 'called-abertos',
      label: 'Chamados Abertos',
      icon: BarChart3,
      variant: 'primary' as const,
      path: '/testes/tabela-chamados-abertos',
    },
    {
      id: 'users',
      label: 'Usuários',
      icon: Users,
      variant: 'primary' as const,
      path: '/usuarios',
    },
    {
      id: 'messages',
      label: 'Mensagens',
      icon: MessageSquare,
      variant: 'primary' as const,
      path: '/mensagens',
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      variant: 'secondary' as const,
      path: '/configuracoes',
    },
  ];

  return (
    <div
      className={`fixed top-0 left-0 z-50 h-full overflow-hidden transition-all duration-500 ease-out ${
        collapsed ? 'w-20' : 'w-80'
      }`}
    >
      {/* Fundo com efeito glassmorphism */}
      <div className="absolute inset-0 border-r border-gray-700/50 bg-gradient-to-br from-slate-900/95 via-gray-900/95 to-slate-800/95 shadow-2xl backdrop-blur-xl" />

      <div className="relative flex h-full flex-col overflow-hidden">
        {/* Header com efeitos */}
        <div className="border-b border-gray-700/50 p-6 backdrop-blur-sm">
          <div
            className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}
          >
            {!collapsed && (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/25">
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
                  <h1 className="bg-gradient-to-r from-white via-blue-200 to-cyan-400 bg-clip-text text-2xl font-black text-transparent">
                    Dashboard
                  </h1>
                  <p className="mt-1 text-xs text-gray-400">
                    Sistema de Gestão
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={onToggle}
              className="group relative rounded-2xl border border-gray-600/50 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 p-3 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25 active:scale-90"
            >
              <Menu
                className={`h-5 w-5 text-gray-300 transition-all duration-300 group-hover:text-white ${
                  !collapsed ? 'rotate-90' : ''
                }`}
              />
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-indigo-600/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
            </button>
          </div>
        </div>

        {/* Navegação principal */}
        <nav className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <SidebarButton
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={pathname === item.path}
                onClick={() => router.push(item.path)}
                variant={item.variant}
                collapsed={collapsed}
              />
            ))}
          </div>
        </nav>

        {/* Footer com perfil do usuário */}
        <div className="border-t border-gray-700/50 backdrop-blur-sm">
          {!collapsed ? (
            <div className="space-y-4 p-6">
              {/* Perfil do usuário */}
              <div className="flex items-center gap-4 rounded-2xl border border-gray-600/30 bg-gradient-to-r from-gray-800/50 via-gray-700/50 to-gray-800/50 p-4 backdrop-blur-sm">
                <div className="relative">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/25">
                    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gray-900">
                      <span className="font-bold text-white">{initials}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">
                    {isAdmin ? 'Administrador' : (nomeRecurso ?? 'Usuário')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isAdmin ? '' : 'Consultor'}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                    <span className="text-xs text-green-400">Online</span>
                  </div>
                </div>
              </div>

              {/* Botão de logout */}
              <SidebarButton
                icon={LogOut}
                label="Sair"
                isActive={false}
                onClick={onLogout}
                variant="danger"
                collapsed={false}
              />
            </div>
          ) : (
            // Versão colapsada aqui...
            <div className="space-y-4 p-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/25">
                    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gray-900">
                      <span className="font-bold text-white">{initials}</span>
                    </div>
                  </div>
                  <div className="absolute -right-1 -bottom-1 h-4 w-4 animate-pulse rounded-full border-2 border-gray-900 bg-green-400" />
                </div>
              </div>

              <SidebarButton
                icon={LogOut}
                label="Sair"
                isActive={false}
                onClick={onLogout}
                variant="danger"
                collapsed={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
