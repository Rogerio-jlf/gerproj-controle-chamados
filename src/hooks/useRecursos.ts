import { useQuery } from '@tanstack/react-query';

export function useRecursos() {
  return useQuery({
    queryKey: ['recursos'],
    queryFn: async () => {
      const res = await fetch('/api/firebird/chamados-abertos/recurso');
      if (!res.ok) throw new Error('Erro ao buscar recursos');
      return res.json();
    },
  });
}
