from fastapi import FastAPI

app = FastAPI(title="Recommendation Service - E-Commerce", version="1.0.0")

DEFAULT_RECOMMENDATIONS = [
    {"id": 3, "name": "Mouse Gamer", "price": 150.00, "category": "Eletronicos", "reason": "Comprado junto com Notebook"},
    {"id": 5, "name": "Capa Anti-Impacto", "price": 50.00, "category": "Eletronicos", "reason": "Proteja seu Smartphone novo"},
    {"id": 6, "name": "Suporte para Fone", "price": 80.00, "category": "Eletronicos", "reason": "Organize seu setup"},
]

# Banco de dados (Mock) de regras de recomendação
# Lógica: Se o usuário vê o Produto X (Chave), sugerimos o Produto Y (Valores)
RECOMMENDATION_RULES = {
    1: [{"id": 3, "name": "Mouse Gamer", "price": 150.00, "category": "Eletronicos", "reason": "Comprado junto com Notebook"}],
    2: [{"id": 5, "name": "Capa Anti-Impacto", "price": 50.00, "category": "Eletronicos", "reason": "Proteja seu Smartphone novo"}],
    3: [{"id": 6, "name": "Suporte para Fone", "price": 80.00, "category": "Eletronicos", "reason": "Organize seu setup"}],
    4: [{"id": 7, "name": "Suporte Articulado", "price": 250.00, "category": "Casa", "reason": "Ergonomia para seu Monitor"}]
}
@app.get("/")
@app.get("/recommendations")
def get_recommendations():
    return DEFAULT_RECOMMENDATIONS

@app.get("/{product_id}")
@app.get("/recommendations/{product_id}")
def get_recommendations_for_product(product_id: int):

    if product_id in RECOMMENDATION_RULES:
        return RECOMMENDATION_RULES[product_id]

    return [
        {"id": 99, "name": "Garantia Estendida de 12 Meses", "price": 120.00, "category": "Acessorios", "reason": "Mais segurança para sua compra"},
        {"id": 100, "name": "Frete Expresso", "price": 35.00, "category": "Acessorios", "reason": "Receba amanhã na sua casa"}
    ]

if __name__ == "__main__":
    import uvicorn
    # Inicia o servidor do Recommendation Service na porta 8005
    uvicorn.run(app, host="0.0.0.0", port=8005)