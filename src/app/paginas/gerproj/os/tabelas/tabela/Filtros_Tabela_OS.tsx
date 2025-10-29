'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { useFiltersTabelaOs } from '../../../../../../contexts/Filters_Context_Tabela_OS';
import { DropdownAnoTabelaOS } from './Dropdown_Filtros_Datas_Tabela_OS';
import { DropdownMesTabelaOS } from './Dropdown_Filtros_Datas_Tabela_OS';
import { DropdownDiaTabelaOS } from './Dropdown_Filtros_Datas_Tabela_OS';

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

export function FiltrosTabelaOS({ onFiltersChange }: FiltrosProps) {
   const hoje = useMemo(() => new Date(), []);
   const { filters, setFilters, getDiasDoMes } = useFiltersTabelaOs();

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

   // ===== HANDLER ESPECIAL PARA ANO =====
   const handleAnoChange = useCallback(
      async (novoAno: number | 'todos') => {
         if (novoAno === 'todos') {
            // 1. Primeiro reseta mês e dia para valores atuais
            setMes(hoje.getMonth() + 1);
            setDia(hoje.getDate());

            // 2. Aguarda o próximo ciclo de renderização
            await new Promise(resolve => setTimeout(resolve, 0));

            // 3. Só então atualiza o ano para "todos"
            setAno('todos');
         } else {
            // Se não é "todos", atualiza normalmente
            setAno(novoAno);
         }
      },
      [hoje]
   );

   // ===== HANDLER ESPECIAL PARA MÊS =====
   const handleMesChange = useCallback(
      async (novoMes: number | 'todos') => {
         if (novoMes === 'todos') {
            // 1. Primeiro reseta ano e dia para valores atuais
            setAno(hoje.getFullYear());
            setDia(hoje.getDate());

            // 2. Aguarda o próximo ciclo de renderização
            await new Promise(resolve => setTimeout(resolve, 0));

            // 3. Só então atualiza o mês para "todos"
            setMes('todos');
         } else {
            // Se não é "todos", atualiza normalmente
            setMes(novoMes);
         }
      },
      [hoje]
   );

   // ===== HANDLER ESPECIAL PARA DIA =====
   const handleDiaChange = useCallback(
      async (novoDia: number | 'todos') => {
         const mostrarTodosOpcao = getMostrarTodos();

         // Se não mostra opção "todos", força para número
         if (!mostrarTodosOpcao && novoDia === 'todos') {
            const diasAtuais = getDiasParaSelect();
            setDia(diasAtuais[0] || 1);
            return;
         }

         if (novoDia === 'todos') {
            // 1. Primeiro reseta ano e mês para valores atuais
            setAno(hoje.getFullYear());
            setMes(hoje.getMonth() + 1);

            // 2. Aguarda o próximo ciclo de renderização
            await new Promise(resolve => setTimeout(resolve, 0));

            // 3. Só então atualiza o dia para "todos"
            setDia('todos');
         } else {
            // Se não é "todos", atualiza normalmente
            setDia(novoDia);
         }
      },
      [getMostrarTodos, getDiasParaSelect, hoje]
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
         <div className="w-[300px]">
            <DropdownAnoTabelaOS
               value={ano}
               onChange={handleAnoChange}
               diasDisponiveis={[]}
            />
         </div>

         <div className="w-[300px]">
            <DropdownMesTabelaOS
               value={mes}
               onChange={handleMesChange}
               diasDisponiveis={[]}
            />
         </div>

         <div className="w-[300px]">
            <DropdownDiaTabelaOS
               value={dia}
               onChange={handleDiaChange}
               diasDisponiveis={getDiasParaSelect()}
               mostrarTodos={getMostrarTodos()}
            />
         </div>
      </div>
   );
}
