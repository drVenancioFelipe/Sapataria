@echo off
echo.
echo  =====================================================
echo   RenovaCalcados - Sistema de Gestao para Sapataria
echo  =====================================================
echo.

cd /d %~dp0

if not exist backend\node_modules (
    echo [1/3] Instalando dependencias do backend...
    cd backend
    call npm install
    cd ..
)

if not exist frontend\node_modules (
    echo [2/3] Instalando dependencias do frontend...
    cd frontend
    call npm install
    cd ..
)

if not exist frontend\dist (
    echo [3/3] Compilando frontend Angular...
    cd frontend
    call npm run build
    cd ..
)

echo.
echo Iniciando servidor em http://localhost:4200 ...
echo Pressione Ctrl+C para parar.
echo.

cd backend
npm run dev
