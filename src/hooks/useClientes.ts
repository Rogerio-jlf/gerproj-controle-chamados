import { useQuery } from '@tanstack/react-query';

export function useClientes() {
   return useQuery({
      queryKey: ['clientes'],
      queryFn: async () => {
         const res = await fetch('/api/cliente');
         if (!res.ok) throw new Error('Erro ao buscar clientes');
         return res.json();
      },
   });
}
