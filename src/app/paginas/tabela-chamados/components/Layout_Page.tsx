'use client';

import Filtros from '@/app/paginas/tabela-chamados/components/Filtros';
import Tabela_Chamados from '@/app/paginas/tabela-chamados/components/Tabela';
import ProtecaoRotas from '@/components/ProtecaoRotas';
import Sidebar from '@/components/Sidebar';
import { useFiltersTabelaChamados } from '@/contexts/postgre/Filters_Tabela_Chamados_Context';
import { useCallback, useState } from 'react';
import { useAuth } from '../../../../contexts/Auth_Context';
import Header from '../../../../components/Header';
import { HiDocumentCheck } from 'react-icons/hi2';

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
          className={`flex flex-1 flex-col transition-all duration-300 ${
            collapsed ? 'ml-20' : 'ml-80'
          }`}
        >
          {/* CONTEÚDO FIXO NO TOPO */}
          <div className="flex flex-col space-y-6 p-4">
            {/* HEADER */}
            <Header
              titulo="Chamados"
              icon={
                <HiDocumentCheck className="h-10 w-10 transition-all duration-300 hover:rotate-90" />
              }
            />

            {/* FILTROS */}
            <div className="max-w-full">
              <Filtros onFiltersChange={handleFiltersChange} />
            </div>
          </div>

          {/* TABELA */}
          <div className="flex-1 p-4">
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
