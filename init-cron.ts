const { iniciarCronRecursos } = require('../lib/firebird/cron');

// Script para iniciar o cron job manualmente se necessário
console.log('Iniciando cron job de recursos...');
iniciarCronRecursos();

// Manter o processo vivo
setInterval(() => {
  // Apenas manter vivo
}, 60000);
