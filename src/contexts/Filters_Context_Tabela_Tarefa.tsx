'use client';

import { createContext, useContext, useState } from 'react';

// Define a interface para o estado dos filtros de chamados abertos
export interface FiltersProps {
   ano: number | 'todos'; // Permite "todos" para ano
   mes: number | 'todos'; // Permite "todos" para mês
   dia: number | 'todos'; // Permite "todos" para dia
   cliente: string;
   recurso: string;
   status: string;
   codChamado?: string;
}

// Define a interface para o contexto dos filtros de chamados abertos
interface FiltersContextProps {
   filters: FiltersProps;
   setFilters: React.Dispatch<React.SetStateAction<FiltersProps>>;
   clearFilters: () => void;
   getDiasDoMes: (ano: number | 'todos', mes: number | 'todos') => number[];
}

// Cria o contexto dos filtros de chamados abertos, inicialmente indefinido
const FiltersTabelaTarefaContext = createContext<
   FiltersContextProps | undefined
>(undefined);

// Função auxiliar para obter o estado inicial dos filtros (ano, mês e dia atuais)
const getInitialFilters = (): FiltersProps => {
   const hoje = new Date();
   return {
      ano: hoje.getFullYear(),
      mes: hoje.getMonth() + 1,
      dia: hoje.getDate(),
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

// Componente provedor do contexto dos filtros de chamados abertos
export function FiltersTabelaTarefaProvider({
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
      <FiltersTabelaTarefaContext.Provider
         value={{
            filters,
            setFilters,
            clearFilters,
            getDiasDoMes,
         }}
      >
         {children}
      </FiltersTabelaTarefaContext.Provider>
   );
}

// Hook customizado para acessar o contexto dos filtros de chamados abertos
export function useFiltersTabelaTarefa() {
   const context = useContext(FiltersTabelaTarefaContext);
   if (context === undefined) {
      throw new Error(
         'useFiltersTabelaTarefa deve ser chamado dentro de um FiltersTabelaTarefaProvider'
      );
   }
   return context;
}
