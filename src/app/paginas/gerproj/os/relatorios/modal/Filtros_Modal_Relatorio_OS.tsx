// ============= ARQUIVO: FiltrosRelatorioOS =============

'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { useFiltersPeriodo } from '../../../../../../contexts/Filters_Context_Ano_Mes_Dia_Inicio_Dia_Fim.';
import { DropdownAno } from './Dropdown_Ana_Mes_Dia_Inicio_Dia_Fim';
import { DropdownMes } from './Dropdown_Ana_Mes_Dia_Inicio_Dia_Fim';
import { DropdownDiaInicio } from './Dropdown_Ana_Mes_Dia_Inicio_Dia_Fim';
import { DropdownDiaFim } from './Dropdown_Ana_Mes_Dia_Inicio_Dia_Fim';

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
   // ADICIONE ESTAS PROPS:
   initialAno?: number | 'todos';
   initialMes?: number | 'todos';
   initialDiaInicio?: number | 'todos';
   initialDiaFim?: number | 'todos';
}

export function FiltrosModalRelatorioOS({
   onFiltersChange,
   initialAno,
   initialMes,
   initialDiaInicio,
   initialDiaFim,
}: FiltrosProps) {
   const hoje = useMemo(() => new Date(), []);
   const { filters, setFilters, getDiasDoMes } = useFiltersPeriodo();

   // Estados locais com valores iniciais das props
   const [ano, setAno] = useState<number | 'todos'>(
      initialAno ?? filters.ano ?? hoje.getFullYear()
   );
   const [mes, setMes] = useState<number | 'todos'>(
      initialMes ?? filters.mes ?? hoje.getMonth() + 1
   );
   const [diaInicio, setDiaInicio] = useState<number | 'todos'>(
      initialDiaInicio ?? filters.diaInicio ?? 1
   );
   const [diaFim, setDiaFim] = useState<number | 'todos'>(
      initialDiaFim ?? filters.diaFim ?? hoje.getDate()
   );

   // ADICIONE ESTE useEffect para sincronizar com as props:
   useEffect(() => {
      if (initialAno !== undefined) setAno(initialAno);
      if (initialMes !== undefined) setMes(initialMes);
      if (initialDiaInicio !== undefined) setDiaInicio(initialDiaInicio);
      if (initialDiaFim !== undefined) setDiaFim(initialDiaFim);
   }, [initialAno, initialMes, initialDiaInicio, initialDiaFim]);

   // ... resto do código permanece igual

   // Debounces
   const [debouncedAno] = useDebounce(ano, 300);
   const [debouncedMes] = useDebounce(mes, 300);
   const [debouncedDiaInicio] = useDebounce(diaInicio, 300);
   const [debouncedDiaFim] = useDebounce(diaFim, 300);

   // Obter dias disponíveis do mês/ano selecionado
   const getDiasDisponiveis = useCallback(() => {
      if (ano === 'todos' && mes !== 'todos') {
         return getDiasDoMes(hoje.getFullYear(), mes);
      }
      if (ano !== 'todos' && mes !== 'todos') {
         return getDiasDoMes(ano, mes);
      }
      return [];
   }, [ano, mes, getDiasDoMes, hoje]);

   const diasDisponiveis = getDiasDisponiveis();

   // VALIDAÇÃO: Garantir que diaFim seja sempre >= diaInicio
   useEffect(() => {
      if (diaInicio !== 'todos' && diaFim !== 'todos' && diaFim < diaInicio) {
         setDiaFim(diaInicio);
      }
   }, [diaInicio, diaFim]);

   // VALIDAÇÃO: Garantir que os dias sejam válidos quando ano/mês mudam
   useEffect(() => {
      if (diasDisponiveis.length === 0) return;

      if (diaInicio !== 'todos' && !diasDisponiveis.includes(diaInicio)) {
         setDiaInicio(diasDisponiveis[0]);
      }

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

   const handleDiaInicioChange = useCallback(
      (novoDiaInicio: number | 'todos') => {
         setDiaInicio(novoDiaInicio);

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

   const handleDiaFimChange = useCallback(
      (novoDiaFim: number | 'todos') => {
         if (
            diaInicio !== 'todos' &&
            novoDiaFim !== 'todos' &&
            novoDiaFim < diaInicio
         ) {
            return;
         }
         setDiaFim(novoDiaFim);
      },
      [diaInicio]
   );

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
      <div className="grid grid-cols-4 gap-6">
         <div className="w-[350px]">
            <DropdownAno value={ano} onChange={setAno} />
         </div>

         <div className="w-[350px]">
            <DropdownMes value={mes} onChange={setMes} />
         </div>

         <div className="w-[350px]">
            <DropdownDiaInicio
               value={diaInicio}
               onChange={handleDiaInicioChange}
               ano={ano}
               mes={mes}
               dataInicio={diaInicio}
            />
         </div>

         <div className="w-[350px]">
            <DropdownDiaFim
               value={diaFim}
               onChange={handleDiaFimChange}
               ano={ano}
               mes={mes}
               dataFim={diaFim}
            />
         </div>
      </div>
   );
}
