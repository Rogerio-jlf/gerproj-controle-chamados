import { NextResponse } from 'next/server';
import {
  atualizarCacheRecursos,
  getCacheStatus,
} from '../../../../lib/firebird/recursos-cache';
import { getStatusCron } from '../../../../lib/firebird/cron';

export async function GET() {
  try {
    // Forçar debug completo
    console.log('🔍 === DEBUG API CACHE ===');

    const statusCache = getCacheStatus();
    const statusCron = getStatusCron();

    console.log('📦 Status Cache detalhado:', statusCache);
    console.log('⏰ Status Cron detalhado:', statusCron);
    console.log('🔍 === FIM DEBUG ===');

    return NextResponse.json({
      // Status básico
      cacheDisponivel: !!statusCache.cache,
      ultimaAtualizacao: statusCache.cache?.timestamp.toISOString() || null,
      mes: statusCache.cache?.mes || null,
      ano: statusCache.cache?.ano || null,
      valido: statusCache.isCacheValido,
      carregando: statusCache.isLoading,
      ultimoErro: statusCache.lastError,

      // Informações extras úteis
      contadorAtualizacoes: statusCache.contadorAtualizacoes || 0,
      tempoDecorridoSegundos: statusCache.tempoDecorridoSegundos,
      proximaAtualizacao: statusCache.cache
        ? new Date(
            statusCache.cache.timestamp.getTime() + 5 * 60 * 1000
          ).toISOString()
        : null,

      // DEBUG - Status do Cron
      statusCron: statusCron,

      // Metadata
      timestamp: Date.now(),
      timestampISO: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erro na API de cache:', error);
    return NextResponse.json(
      {
        error: 'Erro ao verificar cache',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json();

    if (action === 'update') {
      console.log('🔄 Atualização manual solicitada via API');

      // Verificar status ANTES da atualização
      const statusAntes = getCacheStatus();
      console.log('📦 Status ANTES da atualização:', {
        cacheExiste: !!statusAntes.cache,
        contador: statusAntes.contadorAtualizacoes,
      });

      const sucesso = await atualizarCacheRecursos();

      // Verificar status APÓS a atualização
      const statusDepois = getCacheStatus();
      console.log('📦 Status APÓS a atualização:', {
        cacheExiste: !!statusDepois.cache,
        contador: statusDepois.contadorAtualizacoes,
        sucesso,
      });

      return NextResponse.json({
        success: sucesso,
        message: sucesso
          ? 'Cache atualizado com sucesso'
          : 'Falha na atualização',
        timestamp: new Date().toISOString(),
        statusAntes: {
          cacheExistia: !!statusAntes.cache,
          contador: statusAntes.contadorAtualizacoes,
        },
        statusDepois: {
          cacheExiste: !!statusDepois.cache,
          contador: statusDepois.contadorAtualizacoes,
        },
      });
    }

    if (action === 'status') {
      const status = getCacheStatus();
      const statusCron = getStatusCron();
      return NextResponse.json({
        ...status,
        statusCron,
        timestamp: new Date().toISOString(),
      });
    }

    // Nova ação para debug completo
    if (action === 'debug') {
      const statusCache = getCacheStatus();
      const statusCron = getStatusCron();

      console.log('🔍 DEBUG COMPLETO SOLICITADO');
      console.log('Cache:', statusCache);
      console.log('Cron:', statusCron);

      return NextResponse.json({
        cache: statusCache,
        cron: statusCron,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        error: 'Ação inválida',
        acoesDisponiveis: ['update', 'status', 'debug'],
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ Erro na execução da ação:', error);
    return NextResponse.json(
      {
        error: 'Erro ao executar ação',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
