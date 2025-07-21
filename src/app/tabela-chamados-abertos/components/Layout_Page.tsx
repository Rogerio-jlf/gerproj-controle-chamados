'use client';

import Filtros from '@/app/tabela-chamados-abertos/components/Filtros';
import Tabela from '@/app/tabela-chamados-abertos/components/Tabela';
import ProtecaoRotas from '@/components/ProtecaoRotas';
import Sidebar from '@/components/Sidebar';
import { ChamadosAbertosFiltersProvider } from '@/contexts/Chamados_Abertos_Filters_Context';
import { useState } from 'react';

export default function LayoutPage() {
  const [collapsed, setCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setCollapsed(prev => !prev);
  };

  const handleLogout = () => {
    window.location.href = '/login';
  };

  const handleFiltersChange = (filters: {
    ano: number;
    mes: number;
    cliente: string;
    recurso: string;
    status: string;
  }) => {
    console.log('Filtros atualizados:', filters);
  };

  return (
    <ProtecaoRotas>
      <ChamadosAbertosFiltersProvider>
        <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
          <Sidebar
            collapsed={collapsed}
            onToggle={handleToggleSidebar}
            onLogout={handleLogout}
          />

          <main
            className={`flex flex-1 flex-col overflow-auto transition-all duration-300 ${
              collapsed ? 'ml-20' : 'ml-80'
            } p-4`}
          >
            <div className="max-w-full">
              <Filtros onFiltersChange={handleFiltersChange} />
            </div>

            <div className="mt-4 flex-1 overflow-hidden">
              <div className="h-full w-full overflow-x-auto">
                <Tabela />
              </div>
            </div>
          </main>
        </div>
      </ChamadosAbertosFiltersProvider>
    </ProtecaoRotas>
  );
}
