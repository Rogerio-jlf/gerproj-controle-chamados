'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { useFiltersTabelaTarefa } from '../../../../../contexts/Filters_Context_Tabela_Tarefa';
import { SelectMesTabelaTarefa } from './Select_Mes_Tabela_Tarefa';
import { SelectDiaTabelaTarefa } from './Select_Dia_Tabela_Tarefa';
import { SelectAnoTabelaTarefa } from './Select_Ano_Tabela_Tarefa';

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

export function FiltrosTabelaTarefa({ onFiltersChange }: FiltrosProps) {
   const hoje = useMemo(() => new Date(), []);
   const { filters, setFilters, getDiasDoMes } = useFiltersTabelaTarefa();

   // Estados locais - agora inicializa sempre com 'todos'
   const [ano, setAno] = useState<number | 'todos'>(filters.ano || 'todos');
   const [mes, setMes] = useState<number | 'todos'>(filters.mes || 'todos');
   const [dia, setDia] = useState<number | 'todos'>(filters.dia || 'todos');

   // Debounces
   const [debouncedAno] = useDebounce(ano, 300);
   const [debouncedMes] = useDebounce(mes, 300);
   const [debouncedDia] = useDebounce(dia, 300);

   // LÓGICA PARA OBTER DIAS DISPONÍVEIS
   const getDiasDisponiveis = useCallback(() => {
      // Se ano é 'todos' e mes é específico, usa o ano atual para calcular os dias do mês
      if (ano === 'todos' && mes !== 'todos') {
         return getDiasDoMes(hoje.getFullYear(), mes);
      }
      // Para outros casos, usa a função normalmente
      return getDiasDoMes(ano, mes);
   }, [ano, mes, getDiasDoMes, hoje]);

   const diasDisponiveis = getDiasDisponiveis();

   const getMostrarTodos = useCallback(() => {
      // Sempre mostra opção "todos" agora, permitindo ver tarefas sem data
      return true;
   }, []);

   // EFEITO AJUSTADO - Apenas valida se o dia selecionado existe nos dias disponíveis
   useEffect(() => {
      // Se um mês específico foi selecionado e o dia atual não está disponível
      if (
         mes !== 'todos' &&
         dia !== 'todos' &&
         diasDisponiveis.length > 0 &&
         !diasDisponiveis.includes(dia)
      ) {
         // Muda para "todos" ao invés do primeiro dia
         setDia('todos');
      }
   }, [ano, mes, dia, diasDisponiveis]);

   // Handler para mudança de dia - simplificado
   const handleDiaChange = useCallback((novoDia: number | 'todos') => {
      setDia(novoDia);
   }, []);

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

   return (
      <div className="flex w-full gap-6">
         <div className="w-[250px]">
            <SelectAnoTabelaTarefa value={ano} onChange={setAno} />
         </div>

         <div className="w-[250px]">
            <SelectMesTabelaTarefa value={mes} onChange={setMes} />
         </div>

         <div className="w-[250px]">
            <SelectDiaTabelaTarefa
               value={dia}
               onChange={handleDiaChange}
               diasDisponiveis={diasDisponiveis}
               mostrarTodos={getMostrarTodos()}
            />
         </div>
      </div>
   );
}
