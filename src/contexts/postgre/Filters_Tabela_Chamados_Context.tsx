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
const FiltersTabelaChamadosContext = createContext<
  FiltersContextProps | undefined
>(undefined);

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
export function FiltersTabelaChamadosProvider({
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
    <FiltersTabelaChamadosContext.Provider
      value={{ filters, setFilters, clearFilters }}
    >
      {' '}
      {children}
    </FiltersTabelaChamadosContext.Provider>
  );
}

// Hook customizado para acessar o contexto dos filtros
export function useFiltersTabelaChamados() {
  const context = useContext(FiltersTabelaChamadosContext);
  if (context === undefined) {
    throw new Error(
      'useFiltersTabelaChamados deve ser usado dentro de um FiltersTabelaChamadosProvider'
    );
  }
  return context;
}
