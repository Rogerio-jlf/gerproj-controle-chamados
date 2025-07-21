'use client';

import ProtecaoRotas from '@/components/ProtecaoRotas';
import Sidebar from '@/components/testes/Sidebar';
import Filtros from '@/components/testes/tabela-chamados-abertos/Filtros_Tabela_Chamados_Abertos';
import TabelaChamadosAbertos from '@/components/testes/tabela-chamados-abertos/Tabela_Chamados_Abertos';
import { ChamadosAbertosFiltersProvider } from '@/context/Chamados_Abertos_Filters_Context';
import { useState } from 'react';

export default function LayoutPageTabelaChamadosAbertos() {
  const [collapsed, setCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  const handleLogout = () => {
    window.location.href = '/login';
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
              <Filtros />
            </div>

            <div className="mt-4 flex-1 overflow-hidden">
              <div className="h-full w-full overflow-x-auto">
                <TabelaChamadosAbertos />
              </div>
            </div>
          </main>
        </div>
      </ChamadosAbertosFiltersProvider>
    </ProtecaoRotas>
  );
}
