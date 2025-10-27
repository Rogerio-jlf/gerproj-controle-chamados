import { useQuery } from '@tanstack/react-query';

// ================================================================================
// INTERFACES
// ================================================================================
interface Cliente {
   codCliente: number;
   nomeCliente: string;
   ativo?: boolean;
   email?: string;
   telefone?: string;
   endereco?: string;
}

interface ClientesResponse {
   clientes: Cliente[];
   total?: number;
}

// ================================================================================
// CONSTANTES
// ================================================================================
const CACHE_TIME = 1000 * 60 * 10; // 10 minutos
const STALE_TIME = 1000 * 60 * 5; // 5 minutos

// ================================================================================
// FETCH CLIENTES
// ================================================================================
async function fetchClientes(token: string): Promise<Cliente[]> {
   const res = await fetch('/api/cliente', {
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
            `Erro ao buscar clientes: ${res.status}`
      );
   }

   const data: ClientesResponse = await res.json();

   // Retornar apenas clientes ativos, ordenados por nome
   const clientesAtivos = (data.clientes || [])
      .filter(cliente => cliente.ativo !== false)
      .sort((a, b) =>
         a.nomeCliente.localeCompare(b.nomeCliente, 'pt-BR', {
            sensitivity: 'base',
         })
      );

   return clientesAtivos;
}

// ================================================================================
// HOOK useClientes
// ================================================================================
export function useClientes() {
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   return useQuery({
      queryKey: ['clientes', token],
      queryFn: () => {
         if (!token) {
            throw new Error('Token de autenticação não encontrado');
         }
         return fetchClientes(token);
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
// HOOK ALTERNATIVO: useClientesComFiltro
// ================================================================================
interface UseClientesComFiltroOptions {
   apenasAtivos?: boolean;
   busca?: string;
}

export function useClientesComFiltro(
   options: UseClientesComFiltroOptions = {}
) {
   const { apenasAtivos = true, busca = '' } = options;
   const { data, isLoading, isError, error } = useClientes();

   // Aplicar filtros adicionais
   const clientesFiltrados = data?.filter(cliente => {
      if (apenasAtivos && cliente.ativo === false) return false;
      if (
         busca &&
         !cliente.nomeCliente.toLowerCase().includes(busca.toLowerCase())
      ) {
         return false;
      }
      return true;
   });

   return {
      data: clientesFiltrados,
      isLoading,
      isError,
      error,
      total: clientesFiltrados?.length || 0,
   };
}

// ================================================================================
// HOOK PARA BUSCAR UM CLIENTE ESPECÍFICO
// ================================================================================
export function useCliente(codCliente: number | 'todos') {
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   return useQuery({
      queryKey: ['cliente', codCliente, token],
      queryFn: async () => {
         if (!token) {
            throw new Error('Token de autenticação não encontrado');
         }

         const res = await fetch(`/api/cliente/${codCliente}`, {
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
                  `Erro ao buscar cliente: ${res.status}`
            );
         }

         return await res.json();
      },
      enabled: !!token && codCliente !== 'todos' && !!codCliente,
      staleTime: STALE_TIME,
      gcTime: CACHE_TIME,
      retry: 1,
   });
}
