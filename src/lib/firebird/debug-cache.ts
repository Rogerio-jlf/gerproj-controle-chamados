// /lib/firebird/debug-cache.ts
// Arquivo temporário para debug

import { getCacheStatus } from './recursos-cache';
import { getStatusCron } from './cron';

export function debugCompleto() {
  console.log('🔍 === DEBUG CACHE ===');

  const statusCache = getCacheStatus();
  console.log('📦 Status Cache:', {
    cacheExiste: !!statusCache.cache,
    isLoading: statusCache.isLoading,
    contador: statusCache.contadorAtualizacoes,
    ultimoErro: statusCache.lastError,
  });

  const statusCron = getStatusCron();
  console.log('⏰ Status Cron:', statusCron);

  console.log('🔍 === FIM DEBUG ===');

  return {
    cache: statusCache,
    cron: statusCron,
  };
}
