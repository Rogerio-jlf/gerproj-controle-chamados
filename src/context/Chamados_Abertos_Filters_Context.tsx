'use client';

import { createContext, useContext, useState } from 'react';

// Define a interface para o estado dos filtros de chamados abertos
interface ChamadosAbertosFiltersState {
  ano: number;
  mes: number;
  cliente: string;
  recurso: string;
  status: string;
}

// Define a interface para o contexto dos filtros de chamados abertos
interface ChamadosAbertosFiltersContextType {
  filters: ChamadosAbertosFiltersState;
  setFilters: (filters: ChamadosAbertosFiltersState) => void;
  clearFilters: () => void;
}

// Cria o contexto dos filtros de chamados abertos, inicialmente indefinido
const ChamadosAbertosFiltersContext = createContext<
  ChamadosAbertosFiltersContextType | undefined
>(undefined);

// Função auxiliar para obter o estado inicial dos filtros (ano e mês atuais)
const getInitialFilters = (): ChamadosAbertosFiltersState => {
  const hoje = new Date();
  return {
    ano: hoje.getFullYear(),
    mes: hoje.getMonth() + 1,
    cliente: '',
    recurso: '',
    status: '',
  };
};

// Componente provedor do contexto dos filtros de chamados abertos
export function ChamadosAbertosFiltersProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Estado dos filtros e função para atualizá-lo
  const [filters, setFilters] =
    useState<ChamadosAbertosFiltersState>(getInitialFilters());

  // Função para limpar os filtros (voltar ao estado inicial)
  const clearFilters = () => setFilters(getInitialFilters());

  // Retorna o provedor do contexto, disponibilizando os valores e funções
  return (
    <ChamadosAbertosFiltersContext.Provider
      value={{ filters, setFilters, clearFilters }}
    >
      {children}
    </ChamadosAbertosFiltersContext.Provider>
  );
}

// Hook customizado para acessar o contexto dos filtros de chamados abertos
export function useChamadosAbertosFilters() {
  const context = useContext(ChamadosAbertosFiltersContext);
  if (context === undefined) {
    throw new Error(
      'useChamadosAbertosFilters must be used within a ChamadosAbertosFiltersProvider',
    );
  }
  return context;
}
