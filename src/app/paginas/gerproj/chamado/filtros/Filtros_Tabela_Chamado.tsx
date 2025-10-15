'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { useFiltersTabelaChamado } from '../../../../../contexts/Filters_Context_Tabela_Chamado';
import { SelectAnoTabelaChamado } from './Select_Ano_Tabela_Chamado';
import { SelectMesTabelaChamado } from './Select_Mes_Tabela_Chamado';
import { SelectDiaTabelaChamado } from './Select_Dia_Tabela_Chamado';

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

export function FiltrosTabelaChamado({ onFiltersChange }: FiltrosProps) {
   const hoje = useMemo(() => new Date(), []);
   const { filters, setFilters, getDiasDoMes } = useFiltersTabelaChamado();

   // Estados locais
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

   // LÓGICA CORRIGIDA PARA OBTER DIAS DISPONÍVEIS
   const getDiasDisponiveis = useCallback(() => {
      // Se ano é 'todos' e mes é específico, usa o ano atual para calcular os dias do mês
      if (ano === 'todos' && mes !== 'todos') {
         return getDiasDoMes(hoje.getFullYear(), mes);
      }
      // Para outros casos, usa a função normalmente
      return getDiasDoMes(ano, mes);
   }, [ano, mes, getDiasDoMes, hoje]);

   const diasDisponiveis = getDiasDisponiveis();

   // Gera array de 1 a 31 para quando precisar de dias fixos
   const diasFixos = Array.from({ length: 31 }, (_, i) => i + 1);

   // LÓGICA REFINADA PARA OS DIAS - com useCallback
   const getDiasParaSelect = useCallback(() => {
      // Caso 1: "todos os anos" E "todos os meses" → mostra 1-31
      if (ano === 'todos' && mes === 'todos') {
         return diasFixos;
      }

      // Caso 2: "todos os anos" E mês específico → mostra dias do mês selecionado
      if (ano === 'todos' && mes !== 'todos') {
         return diasDisponiveis;
      }

      // Caso 3: Ano específico E "todos os meses" → mostra 1-31
      if (ano !== 'todos' && mes === 'todos') {
         return diasFixos;
      }

      // Caso 4: Ano específico E mês específico → mostra dias do mês/ano
      return diasDisponiveis;
   }, [ano, mes, diasFixos, diasDisponiveis]);

   const getMostrarTodos = useCallback(() => {
      // Mostra "todos os dias" quando:
      // 1. Ano = todos E Mês = específico
      // 2. Ano = específico E Mês = específico
      return (
         (ano === 'todos' && mes !== 'todos') ||
         (ano !== 'todos' && mes !== 'todos')
      );
   }, [ano, mes]);

   // EFEITO PARA GARANTIR QUE O DIA SEJA SEMPRE VÁLIDO
   useEffect(() => {
      const diasAtuais = getDiasParaSelect();
      const mostrarTodosOpcao = getMostrarTodos();

      // Se não mostra opção "todos" mas o dia atual é "todos", muda para o primeiro dia disponível
      if (!mostrarTodosOpcao && dia === 'todos' && diasAtuais.length > 0) {
         setDia(diasAtuais[0]);
      }

      // Se o dia selecionado não está na lista atual de dias disponíveis, muda para o primeiro dia disponível
      if (
         dia !== 'todos' &&
         diasAtuais.length > 0 &&
         !diasAtuais.includes(dia)
      ) {
         setDia(diasAtuais[0]);
      }
   }, [ano, mes, dia, getDiasParaSelect, getMostrarTodos]);

   // Handler específico para o dia que trata a mudança de valor
   const handleDiaChange = useCallback(
      (novoDia: number | 'todos') => {
         const mostrarTodosOpcao = getMostrarTodos();

         // Se não mostra opção "todos", força para número
         if (!mostrarTodosOpcao && novoDia === 'todos') {
            const diasAtuais = getDiasParaSelect();
            setDia(diasAtuais[0] || 1);
         } else {
            setDia(novoDia);
         }
      },
      [getMostrarTodos, getDiasParaSelect]
   );

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
            <SelectAnoTabelaChamado value={ano} onChange={setAno} />
         </div>

         <div className="w-[250px]">
            <SelectMesTabelaChamado value={mes} onChange={setMes} />
         </div>

         <div className="w-[250px]">
            <SelectDiaTabelaChamado
               value={dia}
               onChange={handleDiaChange}
               diasDisponiveis={getDiasParaSelect()}
               mostrarTodos={getMostrarTodos()}
            />
         </div>
      </div>
   );
}
