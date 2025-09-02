'use client';

import { useFiltersTabelaChamados } from '../../../../contexts/Filters_Context';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import SelectAno from '../../../../components/Select_Ano';
import SelectMes from '../../../../components/Select_Mes';
// ================================================================================

interface Props {
  onFiltersChange: (filters: {
    ano: number | 'todos';
    mes: number | 'todos';
    cliente: string;
    recurso: string;
    status: string;
  }) => void;
}
// ================================================================================

export default function Filtros({ onFiltersChange }: Props) {
  const hoje = new Date();
  const { filters, setFilters } = useFiltersTabelaChamados();

  // Estados locais - agora suportam 'todos'
  const [ano, setAno] = useState<number | 'todos'>(
    filters.ano || hoje.getFullYear()
  );
  const [mes, setMes] = useState<number | 'todos'>(
    filters.mes || hoje.getMonth() + 1
  );

  // Debounces
  const [debouncedAno] = useDebounce(ano, 300);
  const [debouncedMes] = useDebounce(mes, 300);

  // Atualiza contexto quando os valores com debounce mudarem
  useEffect(() => {
    const newFilters = {
      ano: debouncedAno,
      mes: debouncedMes,
      cliente: filters.cliente,
      recurso: filters.recurso,
      status: filters.status,
    };

    setFilters(newFilters);

    // Chama o callback externo se fornecido
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  }, [
    debouncedAno,
    debouncedMes,
    filters.cliente,
    filters.recurso,
    filters.status,
    setFilters,
    onFiltersChange,
  ]);

  return (
    <div className="flex w-full gap-6">
      <div className="flex-1">
        <SelectAno value={ano} onChange={setAno} />
      </div>

      <div className="flex-1">
        <SelectMes value={mes} onChange={setMes} />
      </div>
    </div>
  );
}
