import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from fastapi.responses import Response, JSONResponse

app = FastAPI(title="API Gateway - E-Commerce", version="1.1.0")

frontend_origins = os.getenv(
    "FRONTEND_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

# 1. Configuração do CORS (Permite que o React na porta 3000 converse com o Gateway)
app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SERVICES = {
    "auth": "http://localhost:8001",
    "catalog": "http://localhost:8002",
    "orders": "http://localhost:8003",
    "payment": "http://localhost:8004",
    "recommendation": "http://localhost:8005"
}

# Rotas que não precisam de login (Qualquer um pode acessar)
PUBLIC_ROUTES = [
    ("/auth/register", "POST"),
    ("/auth/login", "POST"),
    ("/catalog/products", "GET")
]

def is_public(service: str, path: str, method: str):
    route = (f"/{service}/{path}", method)
    # Verifica se a rota exata ou a rota base do catálogo (para buscar por ID) é pública
    if route in PUBLIC_ROUTES or (service == "catalog" and method == "GET"):
        return True
    return False

async def proxy_request(service: str, path: str, request: Request):
    """
    Roteador Central: Valida segurança e repassa requisições.
    """
    if service not in SERVICES:
        raise HTTPException(status_code=404, detail="Microsserviço não encontrado.")

    # 2. Verifica Autenticação para rotas protegidas (ex: Criar Pedido)
    if not is_public(service, path, request.method):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Token de autenticação ausente ou inválido. Faça login.")
        # Opcional: Aqui poderíamos bater no Auth Service para validar o token matematicamente.

    target_url = f"{SERVICES[service]}/{path}"

    async with httpx.AsyncClient() as client:
        try:
            body = await request.body()
            headers = dict(request.headers)
            headers.pop("host", None)

            response = await client.request(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body
            )
            content_type = response.headers.get("content-type", "")
            if "application/json" in content_type:
                try:
                    payload = response.json()
                except ValueError:
                    payload = None

                if payload is not None:
                    return JSONResponse(content=payload, status_code=response.status_code)

            return Response(
                content=response.content,
                status_code=response.status_code,
                media_type=content_type or None,
            )
        
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail=f"Serviço '{service}' indisponível no momento.")


@app.api_route("/{service}", methods=["GET", "POST", "PUT", "DELETE"])
async def gateway_root_route(service: str, request: Request):
    return await proxy_request(service, "", request)


@app.api_route("/{service}/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def gateway_route(service: str, path: str, request: Request):
    return await proxy_request(service, path, request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)