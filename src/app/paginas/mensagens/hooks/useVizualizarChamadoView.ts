import { useQuery } from '@tanstack/react-query';

export const useVizualizarChamadoView = (chamadoOs: string | null) => {
  // Hook que recebe o código do chamado ou null
  return useQuery({
    // Usa o React Query para buscar dados
    queryKey: ['chamado', chamadoOs], // Chave única para identificar a query no cache
    queryFn: async () => {
      // Função assíncrona que busca os dados
      if (!chamadoOs) return null; // Se não houver chamadoOs, retorna null

      const response = await fetch(
        `/api/postgre-SQL/apontamentos-view/${chamadoOs}` // Faz requisição para a API com o chamadoOs
      );
      if (!response.ok) {
        throw new Error('Erro ao buscar chamado'); // Lança erro se a resposta não for OK
      }

      return response.json(); // Retorna os dados em formato JSON
    },

    enabled: !!chamadoOs, // Só executa a query se chamadoOs não for null
    refetchOnWindowFocus: false, // Não refaz a consulta ao voltar para a aba
  });
};
