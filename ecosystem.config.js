module.exports = {
  apps: [
    {
      name: 'dashboard',
      script: './dist/server.js',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // outras variáveis que quiser definir
      },
    },
  ],
};

// iniciar = pm2 start ecosystem.config.js
// parar = pm2 stop dashboard
// deletar = pm2 delete dashboard
// reiniciar = pm2 restart dashboard
// ver logs = pm2 logs dashboard
// ver status = pm2 status dashboard
// ver lista = pm2 list
// ver detalhes = pm2 describe dashboard
// ver histórico = pm2 history dashboard
