'use client';

import { createContext, useContext, useState } from 'react';

// Define a interface para o estado dos filtros
interface FiltersProps {
  ano: number;
  mes: number;
  cliente: string;
  recurso: string;
  status: string;
}

// Define a interface para o contexto dos filtros
interface FiltersContextProps {
  filters: FiltersProps;
  setFilters: (filters: FiltersProps) => void;
  clearFilters: () => void;
}

// Cria o contexto dos filtros, inicialmente indefinido
const FiltersDashboardContext = createContext<FiltersContextProps | undefined>(
  undefined
);

// Função auxiliar para obter o estado inicial dos filtros (ano e mês atuais)
const getInitialFilters = (): FiltersProps => {
  const hoje = new Date();
  return {
    ano: hoje.getFullYear(),
    mes: hoje.getMonth() + 1,
    cliente: '',
    recurso: '',
    status: '',
  };
};

// Componente provedor do contexto dos filtros
export function FiltersDashboardProvider({
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
    <FiltersDashboardContext.Provider
      value={{ filters, setFilters, clearFilters }}
    >
      {' '}
      {children}
    </FiltersDashboardContext.Provider>
  );
}

// Hook customizado para acessar o contexto dos filtros
export function useFiltersDashboard() {
  const context = useContext(FiltersDashboardContext);
  if (context === undefined) {
    throw new Error(
      'useFiltersDashboard deve ser usado dentro de um FiltersDashboardProvider'
    );
  }
  return context;
}
