import cron from 'node-cron';
import { prisma } from './src/lib/solutii-prisma';

// Atualiza às 3h e 15h, todos os dias a view materializada "Apontamentos"
cron.schedule('0 3,15 * * *', async () => {
  try {
    console.log('[CRON] Atualizando view materializada...');
    await prisma.$executeRawUnsafe(
      'REFRESH MATERIALIZED VIEW CONCURRENTLY public."Apontamentos"',
    );
    console.log('[CRON] Atualização concluída.');
  } catch (error) {
    console.error('[CRON] Erro ao atualizar view:', error);
  }
});

// '0 * * * *'
// Campo ---------- Valor ---------- Significado
// ---------------------------------------------
// Minuto	          0	               No minuto zero
// Hora	            3,15	           Às 3h e às 15h
// Dia do mês	      *	               Todos os dias
// Mês	            *	               Todos os meses
// Dia da semana    *                Todos os dias da semana
