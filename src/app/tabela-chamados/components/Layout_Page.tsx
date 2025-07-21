'use client';

import Filtros from '@/app/tabela-chamados/components/Filtros';
import Tabela_Chamados from '@/app/tabela-chamados/components/Tabela';
import ProtecaoRotas from '@/components/ProtecaoRotas';
import Sidebar from '@/components/Sidebar';
import { useState } from 'react';

export default function LayoutPage() {
  const [collapsed, setCollapsed] = useState(false);

  // Pega ano e mês atuais
  const hoje = new Date();
  const anoAtual = hoje.getFullYear().toString();
  const mesAtual = (hoje.getMonth() + 1).toString(); // Mês é zero-based

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
              ano={anoAtual}
              mes={mesAtual}
              cliente=""
              recurso=""
              status=""
            />
          </div>
        </main>
      </div>
    </ProtecaoRotas>
  );
}
