const { spawn } = require('child_process');

const child = spawn('npm', ['start'], {
   cwd: __dirname, // pasta do projeto
   stdio: 'inherit', // mantém logs no console do PM2
   shell: true, // necessário para rodar npm no Windows
   windowsHide: true, // <- isso esconde a janela do cmd
});

child.on('close', code => {
   console.log(`Process exited with code ${code}`);
});
