import requests
import time

# Tudo passa pelo nosso API Gateway!
GATEWAY_URL = "http://localhost:8000"

def run_tests():
    print("Iniciando Testes Automatizados do E-Commerce...\n")
    
    # 1. Teste de Registro
    print("1. Testando Registro de Usuário...")
    user_data = {"email": "cliente@teste.com", "password": "senha_segura_123"}
    resp = requests.post(f"{GATEWAY_URL}/auth/register", json=user_data)
    print(f"Status: {resp.status_code} | Resposta: {resp.json()}\n")

    # 2. Teste de Login (Para pegar o Token JWT)
    print("2. Testando Login e Geração de Token JWT...")
    resp = requests.post(f"{GATEWAY_URL}/auth/login", json=user_data)
    token = resp.json().get("access_token")
    print(f"Status: {resp.status_code} | Token obtido com sucesso!\n")

    # 3. Teste de Catálogo (Rota Pública)
    print("3. Buscando Produtos no Catálogo...")
    resp = requests.get(f"{GATEWAY_URL}/catalog/products")
    produtos = resp.json()
    print(f"Status: {resp.status_code} | Produtos encontrados: {len(produtos)}")
    if produtos:
        print(f"Primeiro produto: {produtos[0]['name']} - R$ {produtos[0]['price']}\n")
    
    # 4. Teste de Compra (Requer Autenticação)
    print("4. Criando Pedido (Comunicação Gateway -> Order -> Catalog)...")
    headers = {"Authorization": f"Bearer {token}"}
    order_data = {
        "user_id": 1,
        "product_id": 1, # Comprando o primeiro produto
        "quantity": 2
    }
    resp = requests.post(f"{GATEWAY_URL}/orders/orders", json=order_data, headers=headers)
    print(f"Status: {resp.status_code} | Resposta: {resp.json()}\n")

if __name__ == "__main__":
    # Pequeno delay para garantir que os servidores do script .bat já subiram
    time.sleep(2) 
    run_tests()