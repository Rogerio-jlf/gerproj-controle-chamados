'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { useFiltersPeriodo } from '../../../../../contexts/Filters_Context_Ano_Mes_Dia_Inicio_Dia_Fim.';
import { SelectAnoTabelaOS } from './Select_Ano_Tabela_OS';
import { SelectMesTabelaOS } from './Select_Mes_Tabela_OS';
import { SelectDataInicioTabelaOS } from './Select_Data_Inicio';
import { SelectDataFimTabelaOS } from './Select_Data_Fim';

interface FiltrosProps {
   onFiltersChange: (filters: {
      ano: number | 'todos';
      mes: number | 'todos';
      diaInicio: number | 'todos';
      diaFim: number | 'todos';
      cliente: string;
      recurso: string;
      status: string;
   }) => void;
}

export function FiltrosTabelaOSPeriodo({ onFiltersChange }: FiltrosProps) {
   const hoje = useMemo(() => new Date(), []);
   const { filters, setFilters, getDiasDoMes } = useFiltersPeriodo();

   // Estados locais
   const [ano, setAno] = useState<number | 'todos'>(
      filters.ano || hoje.getFullYear()
   );
   const [mes, setMes] = useState<number | 'todos'>(
      filters.mes || hoje.getMonth() + 1
   );
   const [diaInicio, setDiaInicio] = useState<number | 'todos'>(
      filters.diaInicio || 1
   );
   const [diaFim, setDiaFim] = useState<number | 'todos'>(
      filters.diaFim || hoje.getDate()
   );

   // Debounces
   const [debouncedAno] = useDebounce(ano, 300);
   const [debouncedMes] = useDebounce(mes, 300);
   const [debouncedDiaInicio] = useDebounce(diaInicio, 300);
   const [debouncedDiaFim] = useDebounce(diaFim, 300);

   // Obter dias disponíveis do mês/ano selecionado
   const getDiasDisponiveis = useCallback(() => {
      // Se ano é 'todos' e mes é específico, usa o ano atual para calcular os dias do mês
      if (ano === 'todos' && mes !== 'todos') {
         return getDiasDoMes(hoje.getFullYear(), mes);
      }
      // Se ambos são números válidos, retorna os dias do mês/ano
      if (ano !== 'todos' && mes !== 'todos') {
         return getDiasDoMes(ano, mes);
      }
      // Caso contrário, retorna array vazio
      return [];
   }, [ano, mes, getDiasDoMes, hoje]);

   const diasDisponiveis = getDiasDisponiveis();

   // VALIDAÇÃO: Garantir que diaFim seja sempre >= diaInicio
   useEffect(() => {
      // Se ambos são números e diaFim < diaInicio, ajusta diaFim
      if (diaInicio !== 'todos' && diaFim !== 'todos' && diaFim < diaInicio) {
         setDiaFim(diaInicio);
      }
   }, [diaInicio, diaFim]);

   // VALIDAÇÃO: Garantir que os dias sejam válidos quando ano/mês mudam
   useEffect(() => {
      if (diasDisponiveis.length === 0) return;

      // Se diaInicio não está disponível, ajusta para o primeiro dia disponível
      if (diaInicio !== 'todos' && !diasDisponiveis.includes(diaInicio)) {
         setDiaInicio(diasDisponiveis[0]);
      }

      // Se diaFim não está disponível, ajusta para o último dia disponível
      if (diaFim !== 'todos' && !diasDisponiveis.includes(diaFim)) {
         setDiaFim(diasDisponiveis[diasDisponiveis.length - 1]);
      }
   }, [ano, mes, diasDisponiveis, diaInicio, diaFim]);

   // VALIDAÇÃO: Se ano ou mês for 'todos', força dias para 'todos'
   useEffect(() => {
      if (ano === 'todos' || mes === 'todos') {
         if (diaInicio !== 'todos') setDiaInicio('todos');
         if (diaFim !== 'todos') setDiaFim('todos');
      }
   }, [ano, mes, diaInicio, diaFim]);

   // Handler para diaInicio que garante que diaFim seja sempre >= diaInicio
   const handleDiaInicioChange = useCallback(
      (novoDiaInicio: number | 'todos') => {
         setDiaInicio(novoDiaInicio);

         // Se mudou para um número e diaFim é menor, ajusta diaFim
         if (
            novoDiaInicio !== 'todos' &&
            diaFim !== 'todos' &&
            diaFim < novoDiaInicio
         ) {
            setDiaFim(novoDiaInicio);
         }
      },
      [diaFim]
   );

   // Handler para diaFim que garante que seja sempre >= diaInicio
   const handleDiaFimChange = useCallback(
      (novoDiaFim: number | 'todos') => {
         // Se diaInicio é número e novo diaFim é menor, não permite
         if (
            diaInicio !== 'todos' &&
            novoDiaFim !== 'todos' &&
            novoDiaFim < diaInicio
         ) {
            return; // Não permite selecionar dia fim menor que dia início
         }
         setDiaFim(novoDiaFim);
      },
      [diaInicio]
   );

   // Atualiza contexto quando os valores com debounce mudarem
   useEffect(() => {
      const newFilters = {
         ano: debouncedAno,
         mes: debouncedMes,
         diaInicio: debouncedDiaInicio,
         diaFim: debouncedDiaFim,
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
      debouncedDiaInicio,
      debouncedDiaFim,
      filters.cliente,
      filters.recurso,
      filters.status,
      setFilters,
      onFiltersChange,
   ]);

   return (
      <div className="flex w-full gap-6">
         <div className="w-[300px]">
            <SelectAnoTabelaOS value={ano} onChange={setAno} />
         </div>

         <div className="w-[300px]">
            <SelectMesTabelaOS value={mes} onChange={setMes} />
         </div>

         <div className="w-[300px]">
            <SelectDataInicioTabelaOS
               value={diaInicio}
               onChange={handleDiaInicioChange}
               ano={ano}
               mes={mes}
               dataInicio={diaInicio}
            />
         </div>

         <div className="w-[300px]">
            <SelectDataFimTabelaOS
               value={diaFim}
               onChange={handleDiaFimChange}
               ano={ano}
               mes={mes}
               dataFim={diaInicio} // Passa diaInicio para filtrar dias >= diaInicio
            />
         </div>
      </div>
   );
}
