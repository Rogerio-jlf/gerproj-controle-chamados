import cron, { ScheduledTask } from 'node-cron';
import { atualizarCacheRecursos, getCacheStatus } from './recursos-cache';

// Variável para controlar se o cron está ativo
let cronAtivo = false;
let cronTask: ScheduledTask | null = null;

// 🔒 PROTEÇÃO GLOBAL contra múltiplas instâncias
let instanciaUnica: string | null = null;

function gerarIdInstancia(): string {
  return `cron-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function iniciarCronRecursos() {
  // 🔒 Verificar se já existe uma instância ativa
  if (cronAtivo) {
    console.log('⏰ Cron job já está ativo');
    return;
  }

  // 🔒 Gerar ID único para esta instância
  const meuId = gerarIdInstancia();
  instanciaUnica = meuId;

  console.log(`⏰ Iniciando cron job para recursos... (ID: ${meuId})`);

  // 🔒 Verificar se ainda somos a instância ativa antes de executar
  setTimeout(() => {
    if (instanciaUnica !== meuId) {
      console.log(`❌ Instância ${meuId} cancelada - outra instância assumiu`);
      return;
    }

    // Executar imediatamente ao iniciar
    console.log(`🔄 Executando primeira atualização... (ID: ${meuId})`);
    atualizarCacheRecursos()
      .then(sucesso => {
        if (instanciaUnica !== meuId) return; // Verificar novamente
        console.log(
          sucesso
            ? '✅ Primeira atualização concluída'
            : '❌ Falha na primeira atualização'
        );

        // DEBUG: Verificar se o cache foi realmente criado
        const status = getCacheStatus();
        console.log('🔍 Status após primeira atualização:', {
          cacheExiste: !!status.cache,
          contador: status.contadorAtualizacoes,
          instancia: meuId,
        });
      })
      .catch(error => {
        if (instanciaUnica !== meuId) return;
        console.error('❌ Erro na primeira atualização:', error);
      });
  }, 1000); // Delay para evitar conflitos de inicialização

  // Agendar execução a cada 5 minutos
  cronTask = cron.schedule(
    '*/5 * * * *',
    async () => {
      // 🔒 Verificar se ainda somos a instância ativa
      if (instanciaUnica !== meuId) {
        console.log(
          `❌ Execução cancelada - instância ${meuId} não é mais ativa`
        );
        return;
      }

      const agora = new Date().toISOString();
      console.log(
        `⏰ [${agora}] Executando atualização automática... (ID: ${meuId})`
      );

      try {
        const sucesso = await atualizarCacheRecursos();

        // 🔒 Verificar novamente após a execução
        if (instanciaUnica !== meuId) return;

        console.log(
          sucesso
            ? '✅ Atualização automática concluída'
            : '❌ Falha na atualização automática'
        );

        // DEBUG: Verificar status após cada atualização
        const status = getCacheStatus();
        console.log('🔍 Status após atualização automática:', {
          cacheExiste: !!status.cache,
          contador: status.contadorAtualizacoes,
          instancia: meuId,
        });
      } catch (error) {
        if (instanciaUnica !== meuId) return;
        console.error('❌ Erro no cron job de recursos:', error);
      }
    },
    {
      // 🔒 Configurações adicionais para evitar sobreposição
      timezone: 'America/Sao_Paulo',
    }
  );

  cronAtivo = true;
  console.log(
    `✅ Cron job iniciado - atualização a cada 5 minutos (ID: ${meuId})`
  );
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
}

// Função para parar o cron
export function pararCronRecursos() {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
  }
  cronAtivo = false;
  instanciaUnica = null; // 🔒 Limpar instância
  console.log('⏹️ Cron job parado');
}

// Função para verificar status do cron
export function getStatusCron() {
  return {
    ativo: cronAtivo,
    ambiente: process.env.NODE_ENV || 'development',
    proximaExecucao: cronTask ? 'A cada 5 minutos' : null,
    taskExiste: !!cronTask,
    instanciaId: instanciaUnica,
  };
}

// 🔒 VERIFICAR SE JÁ FOI INICIALIZADO (prevenir hot reload)
if (typeof global !== 'undefined') {
  if (!(global as any).__cronRecursosInicializado) {
    console.log('🚀 Iniciando cron job de recursos automaticamente...');
    iniciarCronRecursos();
    (global as any).__cronRecursosInicializado = true;
  } else {
    console.log(
      '⚠️ Cron já foi inicializado anteriormente (hot reload detectado)'
    );
  }
} else {
  // Fallback para ambientes sem global
  console.log('🚀 Iniciando cron job de recursos automaticamente...');
  iniciarCronRecursos();
}

// 🚫 REMOVER ATUALIZAÇÃO FORÇADA - estava causando execuções duplas
// setTimeout com atualizarCacheRecursos foi removido
