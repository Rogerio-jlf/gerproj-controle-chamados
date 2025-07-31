'use client';

import Filtros from '@/app/tabela-chamados-abertos/components/Filtros';
import Tabela from '@/app/tabela-chamados-abertos/components/Tabela';
import ProtecaoRotas from '@/components/ProtecaoRotas';
import Sidebar from '@/components/Sidebar';
import { useFiltersTabelaChamadosAbertos } from '@/contexts/Filters_Tabela_Chamados_Abertos_Context';
import { useCallback, useState } from 'react';
import { useAuth } from '../../../contexts/Auth_Context';
import Header from '../../../components/Header';
import { HiDocumentPlus } from 'react-icons/hi2';

export default function LayoutPage() {
  const { isAdmin, codCliente } = useAuth();
  const { filters, setFilters } = useFiltersTabelaChamadosAbertos();
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

  const handleToggleSidebar = () => {
    setCollapsed(prev => !prev);
  };

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
              titulo="Chamados Abertos"
              icon={<HiDocumentPlus size={40} />}
            />

            {/* FILTROS */}
            <div className="max-w-full">
              <Filtros onFiltersChange={handleFiltersChange} />
            </div>
          </div>

          {/* TABELA COM SCROLL */}
          <div className="flex-1 p-4">
            <Tabela />
          </div>
        </main>
      </div>
    </ProtecaoRotas>
  );
}
