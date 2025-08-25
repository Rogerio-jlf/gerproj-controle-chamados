'use client';

import Filtros from '@/app/paginas/tabela-chamados/components/Filtros';
import Tabela from '@/app/paginas/tabela-chamados-recursos/components/Tabela';
import { useFiltersTabelaChamadosAbertos } from '@/contexts/firebird/Filters_Tabela_Chamados_Abertos_Context';
import { useCallback } from 'react';
import { useAuth } from '../../../../contexts/Auth_Context';
import Header from '../../../../components/Header';
import { HiDocumentPlus } from 'react-icons/hi2';

export default function LayoutPage() {
  // const { isAdmin, codCliente } = useAuth();
  const { filters, setFilters } = useFiltersTabelaChamadosAbertos();

  const handleFiltersChange = useCallback(
    (newFilters: typeof filters) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
    },
    [setFilters, filters]
  );

  return (
    <>
      {/* div - principal */}
      <div className="flex h-screen w-screen overflow-hidden">
        {/* sidebar */}

        <main className="flex h-screen w-screen flex-col">
          {/* div - header / filtros */}
          <div className="flex flex-col space-y-6 p-4">
            {/* header */}
            <Header
              titulo="Chamados Abertos"
              icon={<HiDocumentPlus className="text-white/95" size={40} />}
            />

            {/* filtros */}
            <div className="max-w-full">
              <Filtros onFiltersChange={handleFiltersChange} />
            </div>
          </div>

          {/* tabela */}
          <div className="flex-1 p-4">
            <Tabela />
          </div>
        </main>
      </div>
    </>
  );
}
