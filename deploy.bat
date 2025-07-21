@echo off
setlocal enabledelayedexpansion

set PROJECT_DIR=C:\portal-cliente\gerproj-dashboard-cliente
set LOG_DIR=%PROJECT_DIR%\logs
set LOG_OUT=%LOG_DIR%\deploy_out.log
set LOG_ERR=%LOG_DIR%\deploy_err.log

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo --------------------- >> "%LOG_OUT%"
echo Deploy iniciado em %date% %time% >> "%LOG_OUT%"
echo --------------------- >> "%LOG_OUT%"

cd /d "%PROJECT_DIR%"

echo Parando app PM2 (dashboard)... >> "%LOG_OUT%"
pm2 stop dashboard >> "%LOG_OUT%" 2>> "%LOG_ERR%"
REM Se não existir, o comando abaixo evita erro
pm2 delete dashboard >> "%LOG_OUT%" 2>> "%LOG_ERR%"

echo Atualizando código...
git pull >> "%LOG_OUT%" 2>> "%LOG_ERR%"
if errorlevel 1 (
  echo [ERRO] git pull falhou, tentando rollback...
  git reset --hard HEAD@{1} >> "%LOG_OUT%" 2>> "%LOG_ERR%"
  exit /b 1
)

echo Instalando dependências...
npm install >> "%LOG_OUT%" 2>> "%LOG_ERR%"
if errorlevel 1 (
  echo [ERRO] npm install falhou.
  exit /b 1
)

echo Build Next.js...
npm run build >> "%LOG_OUT%" 2>> "%LOG_ERR%"
if errorlevel 1 (
  echo [ERRO] npm run build falhou.
  exit /b 1
)

echo Gerando cliente Prisma...
npx prisma generate >> "%LOG_OUT%" 2>> "%LOG_ERR%"
if errorlevel 1 (
  echo [ERRO] prisma generate falhou.
  exit /b 1
)

echo Compilando TypeScript...
npx tsc >> "%LOG_OUT%" 2>> "%LOG_ERR%"
if errorlevel 1 (
  echo [ERRO] Compilação TypeScript falhou.
  exit /b 1
)

echo Iniciando app PM2 (dashboard)...
pm2 start dist/server.js --name dashboard --update-env >> "%LOG_OUT%" 2>> "%LOG_ERR%"
if errorlevel 1 (
  echo [ERRO] Falha ao iniciar app com PM2.
  exit /b 1
)

echo Deploy finalizado com sucesso em %date% %time% >> "%LOG_OUT%"
echo Para ver logs do app, rode: pm2 logs dashboard

pause

:: Como usar = execute este arquivo deploy.bat diretamente ou via linha de comando.
:: Observações:
:: - Garante logs separados para saída e erros.
:: - Para e exclui o app PM2 para evitar conflito.
:: - Roda build Next.js, prisma generate e tsc antes de reiniciar o app.
