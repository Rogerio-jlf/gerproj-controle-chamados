'use client';

import Filtros from '@/app/tabela-chamados/components/Filtros';
import Tabela_Chamados from '@/app/tabela-chamados/components/Tabela';
import ProtecaoRotas from '@/components/ProtecaoRotas';
import Sidebar from '@/components/Sidebar';
import { useFiltersDashboard } from '@/contexts/Filters_Dashboard_Context';
import { useCallback, useState } from 'react';
import { useAuth } from '../../../contexts/Auth_Context';

export default function LayoutPage() {
  const { isAdmin, codCliente } = useAuth();
  const { filters, setFilters } = useFiltersDashboard();
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
      <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
        {/* Sidebar */}
        <Sidebar
          collapsed={collapsed}
          onToggle={handleToggleSidebar}
          onLogout={handleLogout}
        />

        {/* Conteúdo principal */}
        <main
          className={`flex flex-1 flex-col overflow-auto transition-all duration-300 ${
            collapsed ? 'ml-20' : 'ml-80'
          } p-4`}
        >
          <div className="max-w-full">
            <Filtros onFiltersChange={handleFiltersChange} />
          </div>

          <div className="mt-4 max-w-full overflow-auto">
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
