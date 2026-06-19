@echo off
cd /d %~dp0src
if not exist node_modules (
    echo Instalando dependencias do backend...
    npm install
)
echo Iniciando servidor backend em http://localhost:3000
node server.js
pause
