'use client';

import Filtros from '@/app/paginas/dashboard/components/Filtros';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/contexts/Auth_Context';
import { useFiltersDashboard } from '@/contexts/postgre/Filters_Dashboard_Context';
import { useCallback, useState } from 'react';
import CardHorasContratadasHorasExecutadas from './cards/Card_Horas_Contratadas_vs_Horas_Executadas';
import CardMediaHorasChamado from './cards/Card_Media_Horas_Chamado';
import CardTotalChamados from './cards/Card_Total_Chamados';
import CardsHorasApontadas from './graficos/horas-apontadas/Cards_Horas_Apontadas';
import GraficoHorasApontadas from './graficos/horas-apontadas/grafico_Horas_Apontadas';
import CardsHorasRecurso from './graficos/horas-recurso/Cards_Horas_Recurso';
import GraficoHorasRecurso from './graficos/horas-recurso/grafico_Horas_Recurso';
import ProtecaoRotas from '../../../../components/ProtecaoRotas';
import Footer from './Footer';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '../../../../components/ui/card';
import HeaderCardsChartsDashboard from './Header';
import Header from '../../../../components/Header';
import { MdDashboard } from 'react-icons/md';

export default function LayoutDashboard() {
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
      <div className="flex h-screen w-screen overflow-hidden">
        {/* SIDEBAR */}
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
          <Header
            titulo="Dashboard"
            icon={
              <MdDashboard className="h-10 w-10 transition-all duration-300 hover:rotate-90" />
            }
          />

          {/* FILTROS */}
          <div className="max-w-full">
            <Filtros onFiltersChange={handleFiltersChange} />
          </div>

          <div className="space-y-6">
            {/* MÉTRICAS PRINCIPAIS */}
            <div className="grid grid-cols-3 gap-6">
              <CardTotalChamados filters={filters} />
              <CardHorasContratadasHorasExecutadas filters={filters} />
              <CardMediaHorasChamado filters={filters} />
            </div>
            {/* ---------- */}

            <div className="grid grid-cols-2 gap-6 space-y-6">
              {/* CARDS RECURSOS / GRÁFICO RECURSOS */}
              <div className="group relative w-full">
                <Card className="relative rounded-lg border border-gray-300 bg-white p-6 shadow-md shadow-black">
                  {/* HEADER */}
                  <CardHeader className="p-0">
                    <HeaderCardsChartsDashboard
                      titulo="Horas Recurso"
                      subtitulo="Distribuição das horas por recurso ao longo do mês"
                    />
                  </CardHeader>

                  {/* CARDS E GRÁFICO */}
                  <CardContent className="space-y-6 p-0">
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
                  </CardContent>

                  {/* FOOTER */}
                  <CardFooter className="p-0 pt-4">
                    <Footer />
                  </CardFooter>
                </Card>
              </div>
              {/* ---------- */}

              {/* CARDS HORAS APONTADAS / GRÁFICO HORAS APONTADAS */}
              <div className="group relative w-full">
                <Card className="relative rounded-lg border border-gray-300 bg-white p-6 shadow-md shadow-black">
                  {/* HEADER */}
                  <CardHeader className="p-0">
                    <HeaderCardsChartsDashboard
                      titulo="Horas Apontadas"
                      subtitulo="Distribuição das horas apontadas ao longo do ano"
                    />
                  </CardHeader>

                  {/* CARDS E GRÁFICO */}
                  <CardContent className="space-y-6 p-0">
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
                  </CardContent>

                  {/* FOOTER */}
                  <CardFooter className="p-0 pt-4">
                    <Footer />
                  </CardFooter>
                </Card>
              </div>
              {/* ---------- */}
              {/* ---------- */}
            </div>
            {/* ---------- */}
          </div>
        </main>
      </div>
    </ProtecaoRotas>
  );
}
