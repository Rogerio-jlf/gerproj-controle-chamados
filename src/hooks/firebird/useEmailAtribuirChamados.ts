import { useMutation } from '@tanstack/react-query';

interface NotificacaoPayload {
  codChamado: number;
  codCliente: number;
  codRecurso: number;
  enviarEmailCliente: boolean;
  enviarEmailRecurso: boolean;
}

export function useEmailAtribuirCahamados() {
  return useMutation({
    mutationFn: async ({
      codChamado,
      codCliente,
      codRecurso,
      enviarEmailCliente,
      enviarEmailRecurso,
    }: NotificacaoPayload) => {
      const response = await fetch('/api/atribuir-chamado', {
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
  });
}
