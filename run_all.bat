@echo off
echo Iniciando microsserviços em janelas separadas...

REM Garante que as janelas filhas iniciem no diretório do script
set "ROOT=%~dp0"

REM Defina origens permitidas do frontend para CORS (adicione aqui outros hosts se necessário)
set "FRONTEND_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://192.168.0.108:5173"

REM Variável usada pelo Vite (frontend) para apontar ao API Gateway
set "VITE_API_BASE_URL=http://localhost:8000"

start "Auth Service" /D "%ROOT%" cmd /k "python -m uvicorn services.auth_service.main:app --port 8001"
start "Catalog Service" /D "%ROOT%" cmd /k "python -m uvicorn services.catalog_service.main:app --port 8002"
start "Order Service" /D "%ROOT%" cmd /k "python -m uvicorn services.order_service.main:app --port 8003"
start "Payment Service" /D "%ROOT%" cmd /k "python -m uvicorn services.payment_service.main:app --port 8004"
start "Recommendation Service" /D "%ROOT%" cmd /k "python -m uvicorn services.recommendation_service.main:app --port 8005"
start "API Gateway" /D "%ROOT%" cmd /k "python -m uvicorn services.api_gateway.main:app --port 8000"

REM Inicia o frontend com a variável Vite necessária
start "Frontend" /D "%ROOT%\frontend" cmd /k "set VITE_API_BASE_URL=%VITE_API_BASE_URL% && npm install && npm run dev -- --host 0.0.0.0"

echo Janelas abertas! Mantenha elas minimizadas enquanto roda o teste.