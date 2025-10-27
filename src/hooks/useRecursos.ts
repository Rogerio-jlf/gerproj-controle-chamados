import { useQuery } from '@tanstack/react-query';

// ================================================================================
// INTERFACES
// ================================================================================
interface Recurso {
   codRecurso: number;
   nomeRecurso: string;
   ativo?: boolean;
   email?: string;
   funcao?: string;
   departamento?: string;
}

interface RecursosResponse {
   recursos: Recurso[];
   total?: number;
}

// ================================================================================
// CONSTANTES
// ================================================================================
const CACHE_TIME = 1000 * 60 * 10; // 10 minutos
const STALE_TIME = 1000 * 60 * 5; // 5 minutos

// ================================================================================
// FETCH RECURSOS
// ================================================================================
async function fetchRecursos(token: string): Promise<Recurso[]> {
   const res = await fetch('/api/recurso', {
      method: 'GET',
      headers: {
         Authorization: `Bearer ${token}`,
         'Content-Type': 'application/json',
      },
   });

   if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
         errorData.error ||
            errorData.message ||
            `Erro ao buscar recursos: ${res.status}`
      );
   }

   const data: RecursosResponse = await res.json();

   // Retornar apenas recursos ativos, ordenados por nome
   const recursosAtivos = (data.recursos || [])
      .filter(recurso => recurso.ativo !== false)
      .sort((a, b) =>
         a.nomeRecurso.localeCompare(b.nomeRecurso, 'pt-BR', {
            sensitivity: 'base',
         })
      );

   return recursosAtivos;
}

// ================================================================================
// HOOK useRecursos
// ================================================================================
export function useRecursos() {
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   return useQuery({
      queryKey: ['recursos', token],
      queryFn: () => {
         if (!token) {
            throw new Error('Token de autenticação não encontrado');
         }
         return fetchRecursos(token);
      },
      enabled: !!token,
      staleTime: STALE_TIME,
      gcTime: CACHE_TIME,
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: true,
   });
}

// ================================================================================
// HOOK ALTERNATIVO: useRecursosComFiltro
// ================================================================================
interface UseRecursosComFiltroOptions {
   apenasAtivos?: boolean;
   busca?: string;
   departamento?: string;
}

export function useRecursosComFiltro(
   options: UseRecursosComFiltroOptions = {}
) {
   const { apenasAtivos = true, busca = '', departamento } = options;
   const { data, isLoading, isError, error } = useRecursos();

   // Aplicar filtros adicionais
   const recursosFiltrados = data?.filter(recurso => {
      if (apenasAtivos && recurso.ativo === false) return false;
      if (
         busca &&
         !recurso.nomeRecurso.toLowerCase().includes(busca.toLowerCase())
      ) {
         return false;
      }
      if (departamento && recurso.departamento !== departamento) {
         return false;
      }
      return true;
   });

   return {
      data: recursosFiltrados,
      isLoading,
      isError,
      error,
      total: recursosFiltrados?.length || 0,
   };
}

// ================================================================================
// HOOK PARA BUSCAR UM RECURSO ESPECÍFICO
// ================================================================================
export function useRecurso(codRecurso: number | 'todos') {
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   return useQuery({
      queryKey: ['recurso', codRecurso, token],
      queryFn: async () => {
         if (!token) {
            throw new Error('Token de autenticação não encontrado');
         }

         const res = await fetch(`/api/recurso/${codRecurso}`, {
            method: 'GET',
            headers: {
               Authorization: `Bearer ${token}`,
               'Content-Type': 'application/json',
            },
         });

         if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(
               errorData.error ||
                  errorData.message ||
                  `Erro ao buscar recurso: ${res.status}`
            );
         }

         return await res.json();
      },
      enabled: !!token && codRecurso !== 'todos' && !!codRecurso,
      staleTime: STALE_TIME,
      gcTime: CACHE_TIME,
      retry: 1,
   });
}
