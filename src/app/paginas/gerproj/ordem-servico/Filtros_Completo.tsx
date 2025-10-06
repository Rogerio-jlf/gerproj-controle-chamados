'use client';
// ================================================================================
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
// ================================================================================
import { useFiltersTabelaOs } from '../../../../contexts/Filters_Context_Dia';
import SelectAno from '../../../../components/seletores/Select_Ano';
import SelectMes from '../../../../components/seletores/Select_Mes';
import SelectDia from '../../../../components/seletores/Select_Dia';

// ================================================================================
//  INTERFACES
// ================================================================================
interface FiltrosProps {
   onFiltersChange: (filters: {
      ano: number | 'todos';
      mes: number | 'todos';
      dia: number | 'todos';
      cliente: string;
      recurso: string;
      status: string;
   }) => void;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export default function Filtros({ onFiltersChange }: FiltrosProps) {
   const hoje = new Date();
   const { filters, setFilters, getDiasDoMes } = useFiltersTabelaOs();

   // Estados locais - agora suportam 'todos'
   const [ano, setAno] = useState<number | 'todos'>(
      filters.ano || hoje.getFullYear()
   );
   const [mes, setMes] = useState<number | 'todos'>(
      filters.mes || hoje.getMonth() + 1
   );
   const [dia, setDia] = useState<number | 'todos'>(
      filters.dia || hoje.getDate()
   );

   // Debounces
   const [debouncedAno] = useDebounce(ano, 300);
   const [debouncedMes] = useDebounce(mes, 300);
   const [debouncedDia] = useDebounce(dia, 300);

   // Obtém os dias disponíveis para o mês/ano selecionado
   const diasDisponiveis = getDiasDoMes(ano, mes);

   // Effect para resetar dia quando ano ou mês mudar para "todos" ou quando mudar mês/ano
   useEffect(() => {
      if (ano === 'todos' || mes === 'todos') {
         setDia('todos');
      } else {
         // Se o dia atual não existe no novo mês (ex: 31 de fevereiro), reseta para "todos"
         const diasNoMes = getDiasDoMes(ano, mes);
         if (typeof dia === 'number' && !diasNoMes.includes(dia)) {
            setDia('todos');
         }
      }
   }, [ano, mes, dia, getDiasDoMes]);

   // Atualiza contexto quando os valores com debounce mudarem
   useEffect(() => {
      const newFilters = {
         ano: debouncedAno,
         mes: debouncedMes,
         dia: debouncedDia,
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
      debouncedDia,
      filters.cliente,
      filters.recurso,
      filters.status,
      setFilters,
      onFiltersChange,
   ]);

   // ================================================================================
   // HANDLERS
   // ================================================================================
   const handleMesChange = (novoMes: number | 'todos') => {
      setMes(novoMes);
      // Quando muda o mês, reseta o dia para "todos"
      if (novoMes === 'todos') {
         setDia('todos');
      } else {
         // Verifica se o dia atual é válido para o novo mês
         const diasNovoMes = getDiasDoMes(ano, novoMes);
         if (typeof dia === 'number' && !diasNovoMes.includes(dia)) {
            setDia('todos');
         }
      }
   };

   const handleAnoChange = (novoAno: number | 'todos') => {
      setAno(novoAno);
      // Quando muda o ano, verifica se o dia ainda é válido (para anos bissextos)
      if (novoAno === 'todos') {
         setDia('todos');
      } else if (typeof mes === 'number') {
         const diasNovoAno = getDiasDoMes(novoAno, mes);
         if (typeof dia === 'number' && !diasNovoAno.includes(dia)) {
            setDia('todos');
         }
      }
   };

   // ================================================================================
   // RENDERIZAÇÃO PRINCIPAL
   // ================================================================================
   return (
      <div className="flex w-full gap-6">
         <div className="w-[240px]">
            <SelectAno value={ano} onChange={handleAnoChange} />
         </div>

         <div className="w-[240px]">
            <SelectMes value={mes} onChange={handleMesChange} />
         </div>

         <div className="w-[240px]">
            <SelectDia
               value={dia}
               onChange={setDia}
               diasDisponiveis={diasDisponiveis}
               disabled={ano === 'todos' || mes === 'todos'}
            />
         </div>
      </div>
   );
}
