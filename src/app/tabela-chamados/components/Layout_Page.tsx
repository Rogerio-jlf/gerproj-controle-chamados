'use client';

import Filtros from '@/app/tabela-chamados/components/Filtros';
import Tabela_Chamados from '@/app/tabela-chamados/components/Tabela';
import ProtecaoRotas from '@/components/ProtecaoRotas';
import Sidebar from '@/components/Sidebar';
import { useFiltersTabelaChamados } from '@/contexts/Filters_Tabela_Chamados_Context';
import { useCallback, useState } from 'react';
import { useAuth } from '../../../contexts/Auth_Context';

export default function LayoutPage() {
  const { isAdmin, codCliente } = useAuth();
  const { filters, setFilters } = useFiltersTabelaChamados();
  const [collapsed, setCollapsed] = useState(false);

  const handleFiltersChange = useCallback(
    (newFilters: typeof filters) => {
      const updatedFilters = !isAdmin
        ? { ...newFilters, cliente: codCliente || '' }
        : newFilters;
      setFilters(updatedFilters);
    },
    [isAdmin, codCliente, setFilters]
  );

  const handleToggleSidebar = () => setCollapsed(prev => !prev);

  const handleLogout = () => {
    window.location.href = '/login';
  };

  return (
    <ProtecaoRotas>
      <div className="flex h-screen w-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          collapsed={collapsed}
          onToggle={handleToggleSidebar}
          onLogout={handleLogout}
        />

        <main
          className={`flex flex-1 flex-col space-y-6 overflow-auto transition-all duration-300 ${
            collapsed ? 'ml-20' : 'ml-80'
          } p-4`}
        >
          {/* HEADER */}
          <header className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-5xl font-bold tracking-wider text-black italic">
              Chamados
            </h2>
          </header>

          {/* FILTROS */}
          <div className="max-w-full">
            <Filtros onFiltersChange={handleFiltersChange} />
          </div>

          {/* TABELA */}
          <div className="max-w-full overflow-auto">
            <Tabela_Chamados
              ano={filters.ano.toString()}
              mes={filters.mes.toString()}
              cliente={filters.cliente}
              recurso={filters.recurso}
              status={filters.status}
            />
          </div>
        </main>
      </div>
    </ProtecaoRotas>
  );
}
