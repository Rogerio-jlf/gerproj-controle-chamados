module.exports = {
   apps: [
      {
         name: 'dashboard',
         script: 'npm',
         args: 'start',
         cwd: 'C:/GERPROJ/GGC/gerproj-controle-chamados', // caminho do projeto
         interpreter: 'cmd.exe',
         windowsHide: true, // desabilita o modo interativo
         instances: 1, // Next.js não funciona bem em cluster mode nativo
         autorestart: true,
         watch: false,
         env: {
            NODE_ENV: 'production',
            PORT: 3002,
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
