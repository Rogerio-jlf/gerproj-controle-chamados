'use client';
// ================================================================================
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
// ================================================================================
import { useFiltersTabelaChamados } from '../../../../../contexts/Filters_Context_Tabela_Chamado';
import { SelectAnoTabelaChamado } from './Select_Ano_Tabela_Chamado';
import { SelectMesTabelaChamado } from './Select_Mes_Tabela_Chamado';

// ================================================================================
//  INTERFACES
// ================================================================================
interface FiltrosProps {
   onFiltersChange: (filters: {
      ano: number | 'todos';
      mes: number | 'todos';
      cliente: string;
      recurso: string;
      status: string;
   }) => void;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export function FiltrosTabelaChamado({ onFiltersChange }: FiltrosProps) {
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

   // ================================================================================
   // RENDERIZAÇÃO PRINCIPAL
   // ================================================================================
   return (
      <div className="flex w-full gap-6">
         <div className="flex-1">
            <SelectAnoTabelaChamado value={ano} onChange={setAno} />
         </div>

         <div className="flex-1">
            <SelectMesTabelaChamado value={mes} onChange={setMes} />
         </div>
      </div>
   );
}
