'use client';

import { createContext, useContext, useState } from 'react';

// Define a interface para o estado dos filtros com período (dia início e dia fim)
export interface FiltersProps {
   ano: number | 'todos'; // Permite "todos" para ano
   mes: number | 'todos'; // Permite "todos" para mês
   diaInicio: number | 'todos'; // Dia de início do período
   diaFim: number | 'todos'; // Dia de fim do período
   cliente: string;
   recurso: string;
   status: string;
   codChamado?: string;
}

// Define a interface para o contexto dos filtros
interface FiltersContextProps {
   filters: FiltersProps;
   setFilters: React.Dispatch<React.SetStateAction<FiltersProps>>;
   clearFilters: () => void;
   getDiasDoMes: (ano: number | 'todos', mes: number | 'todos') => number[];
}

// Cria o contexto dos filtros, inicialmente indefinido
const FiltersPeriodoContext = createContext<FiltersContextProps | undefined>(
   undefined
);

// Função auxiliar para obter o estado inicial dos filtros
const getInitialFilters = (): FiltersProps => {
   const hoje = new Date();
   const ano = hoje.getFullYear();
   const mes = hoje.getMonth() + 1;

   // Define dia início como primeiro dia do mês e dia fim como dia atual
   return {
      ano,
      mes,
      diaInicio: 1,
      diaFim: hoje.getDate(),
      cliente: '',
      recurso: '',
      status: '',
      codChamado: '',
   };
};

// Função auxiliar para obter os dias de um determinado mês/ano
const getDiasDoMes = (
   ano: number | 'todos',
   mes: number | 'todos'
): number[] => {
   // Se ano ou mês for "todos", retorna array vazio (não é possível determinar os dias)
   if (ano === 'todos' || mes === 'todos') {
      return [];
   }

   // Obtém o número de dias do mês específico
   const diasNoMes = new Date(ano, mes, 0).getDate();

   // Retorna array com todos os dias do mês [1, 2, 3, ..., diasNoMes]
   return Array.from({ length: diasNoMes }, (_, i) => i + 1);
};

// Componente provedor do contexto dos filtros com período
export function FiltersPeriodoProvider({
   children,
}: {
   children: React.ReactNode;
}) {
   // Estado dos filtros e função para atualizá-lo
   const [filters, setFilters] = useState<FiltersProps>(getInitialFilters());

   // Função para limpar os filtros (voltar ao estado inicial)
   const clearFilters = () => setFilters(getInitialFilters());

   // Retorna o provedor do contexto, disponibilizando os valores e funções
   return (
      <FiltersPeriodoContext.Provider
         value={{
            filters,
            setFilters,
            clearFilters,
            getDiasDoMes,
         }}
      >
         {children}
      </FiltersPeriodoContext.Provider>
   );
}

// Hook customizado para acessar o contexto dos filtros com período
export function useFiltersPeriodo() {
   const context = useContext(FiltersPeriodoContext);
   if (context === undefined) {
      throw new Error(
         'useFiltersPeriodo deve ser chamado dentro de um FiltersPeriodoProvider'
      );
   }
   return context;
}
