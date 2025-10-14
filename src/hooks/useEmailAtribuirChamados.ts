import { useMutation, useQueryClient } from '@tanstack/react-query';

interface NotificacaoPayload {
   codChamado: number;
   codCliente: number;
   codRecurso: number;
   enviarEmailCliente: boolean;
   enviarEmailRecurso: boolean;
}

export function useEmailAtribuirChamados() {
   // Corrigido o nome
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async ({
         codChamado,
         codCliente,
         codRecurso,
         enviarEmailCliente,
         enviarEmailRecurso,
      }: NotificacaoPayload) => {
         const response = await fetch('/api/tabelas/chamado/atribuir-chamado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               cod_chamado: codChamado,
               cod_cliente: codCliente,
               cod_recurso: codRecurso,
               enviarEmailCliente,
               enviarEmailRecurso,
            }),
         });

         if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao enviar notificações');
         }

         return response.json();
      },
      onSuccess: () => {
         // Invalida o cache dos chamados para forçar uma nova busca
         queryClient.invalidateQueries({
            queryKey: ['chamadosAbertos'],
         });

         queryClient.invalidateQueries({
            queryKey: ['dashboard-recursos'],
         });

         // Também pode invalidar queries relacionadas se necessário:
         queryClient.invalidateQueries({
            queryKey: ['clientes'],
         });
         queryClient.invalidateQueries({
            queryKey: ['recursos'],
         });

         console.log('Chamado atribuído com sucesso e cache atualizado');
      },
      onError: error => {
         console.error('Erro ao atribuir chamado:', error);
      },
   });
}
