'use client';

import Filtros from './components/Filtros';
import Tabela from './components/Tabela';
import { useFiltersTabelaChamados } from '../../../contexts/firebird/Filters_Tabela_Chamados_Context';
import { useCallback } from 'react';
import Header from '../../../components/Header';
import { HiDocumentPlus } from 'react-icons/hi2';
// ================================================================================

export default function LayoutPage() {
  const { filters, setFilters } = useFiltersTabelaChamados();

  const handleFiltersChange = useCallback(
    (newFilters: typeof filters) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
    },
    [setFilters, filters]
  );
  // ================================================================================

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
            <Filtros onFiltersChange={handleFiltersChange} />
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
