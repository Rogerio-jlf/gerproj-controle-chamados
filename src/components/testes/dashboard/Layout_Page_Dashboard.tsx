'use client';

import Filtros from '@/components/testes/Filtros';
import Sidebar from '@/components/testes/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useFilters } from '@/context/FiltersContext';
import { useCallback, useEffect, useState } from 'react';
import { CardsHorasApontadas } from './metricas-graficos/horas-apontadas/Cards_Horas_Apontadas';
import GraficoHorasApontadas from './metricas-graficos/horas-apontadas/Grafico_Horas_Apontadas';
import CardsHorasRecurso from './metricas-graficos/horas-recurso/Cards_Horas_Recurso';
import GraficoHorasRecurso from './metricas-graficos/horas-recurso/Grafico_Horas_Recurso';
import CardHorasContratadasHorasExecutadas from './metricas/Card_Horas_Contratadas_vs_Horas_Executadas';
import CardMediaHoraChamado from './metricas/Card_Media_Horas_Chamado';
import CardTotalChamados from './metricas/Card_Total_Chamados';

export default function LayoutPageDashboard() {
  const { isAdmin, codCliente } = useAuth();
  const { filters, setFilters } = useFilters();
  const [collapsed, setCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleFiltersChange = useCallback(
    (newFilters: typeof filters) => {
      const updatedFilters = !isAdmin
        ? { ...newFilters, cliente: codCliente || '' }
        : newFilters;
      setFilters(updatedFilters);
    },
    [isAdmin, codCliente, setFilters],
  );

  const handleToggleSidebar = () => setCollapsed((prev) => !prev);

  const handleLogout = () => {
    console.log('logout');
    // Aqui você pode chamar sua função de logout do AuthContext
  };

  // Detecta o scroll para aplicar efeitos visuais
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={handleToggleSidebar}
        onLogout={handleLogout}
      />
      {/* -------------------- */}

      {/* Conteúdo principal */}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${
          collapsed ? 'ml-20' : 'ml-80'
        }`}
      >
        {/* Filtros */}
        <div
          className={`sticky top-0 z-30 transition-all duration-300 ease-in-out ${
            isScrolled ? 'bg-white shadow-sm shadow-black' : 'bg-gray-100'
          }`}
        >
          <div
            className={`px-8 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-6'}`}
          >
            <div className="group relative w-full">
              {/* Container dos filtros com transições suaves */}
              <div
                className={`relative transition-all duration-300 ${
                  isScrolled
                    ? 'scale-[0.95] transform rounded-xl bg-white p-4'
                    : 'rounded-lg bg-white p-4 shadow-sm shadow-black'
                }`}
              >
                <Filtros onFiltersChange={handleFiltersChange} />
              </div>
            </div>
          </div>

          {/* Indicador visual de scroll ativo */}
          {isScrolled && (
            <div className="absolute bottom-0 left-1/2 h-1 w-40 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500" />
          )}
        </div>

        {/* Conteúdo com padding adequado */}
        <div className="px-8 pb-8">
          {/* Cards principais */}
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <CardTotalChamados filters={filters} />
            <CardHorasContratadasHorasExecutadas filters={filters} />
            <CardMediaHoraChamado filters={filters} />
          </div>

          {/* Gráficos */}
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="group relative w-full">
              <div className="relative min-h-70 rounded-lg border border-gray-300 bg-white p-6 shadow-md shadow-black">
                <div className="space-y-6">
                  <CardsHorasRecurso
                    filters={{
                      ...filters,
                      mes: filters.mes?.toString() ?? '',
                      ano: filters.ano?.toString() ?? '',
                    }}
                  />
                  <GraficoHorasRecurso
                    filters={{
                      ...filters,
                      mes: filters.mes?.toString() ?? '',
                      ano: filters.ano?.toString() ?? '',
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="group relative w-full">
              <div className="relative min-h-70 rounded-lg border border-gray-300 bg-white p-6 shadow-md shadow-black">
                <div className="space-y-6">
                  <CardsHorasApontadas
                    filters={{
                      ...filters,
                      mes: filters.mes?.toString() ?? '',
                      ano: filters.ano?.toString() ?? '',
                    }}
                  />
                  <GraficoHorasApontadas
                    filters={{
                      ...filters,
                      mes: filters.mes?.toString() ?? '',
                      ano: filters.ano?.toString() ?? '',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
