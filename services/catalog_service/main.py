import sqlite3
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Catalog Service - E-Commerce", version="1.0.0")

DB_PATH = os.getenv("DB_PATH", "catalog.db")

# Inicialização do Banco de Dados SQLite
def init_db():
    """
    Cria a tabela de produtos e insere dados iniciais (mock) 
    para facilitar os testes da vitrine do E-commerce.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            stock INTEGER NOT NULL
        )
    """)
    
    # Verifica se o banco está vazio para inserir os produtos de teste
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] == 0:
        sample_products = [
            ("Notebook Gamer", "Notebook de alta performance 16GB RAM", 4500.00, 10),
            ("Smartphone X", "Celular com câmera 108MP e tela OLED", 2500.00, 25),
            ("Fone Bluetooth", "Cancelamento de ruído ativo", 300.00, 50),
            ("Monitor 27''", "Monitor UltraWide 144Hz", 1200.00, 15)
        ]
        cursor.executemany(
            "INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)", 
            sample_products
        )
    conn.commit()
    conn.close()

init_db()

# Modelos de Dados (Pydantic)
class Product(BaseModel):
    name: str
    description: str
    price: float
    stock: int

@app.get("/products")
def get_all_products():
    """
    Retorna a lista de todos os produtos disponíveis no catálogo.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products")
    products = cursor.fetchall()
    conn.close()
    
    # Formata a resposta para uma lista de dicionários JSON
    result = []
    for p in products:
        result.append({
            "id": p[0], "name": p[1], "description": p[2], 
            "price": p[3], "stock": p[4]
        })
    return result

@app.get("/products/{product_id}")
def get_product_by_id(product_id: int):
    """
    Busca os detalhes de um produto específico pelo seu ID.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    p = cursor.fetchone()
    conn.close()
    
    if not p:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
        
    return {
        "id": p[0], "name": p[1], "description": p[2], 
        "price": p[3], "stock": p[4]
    }

@app.put("/products/{product_id}/reduce_stock")
def reduce_stock(product_id: int, quantity: int):
    """
    Reduz o estoque de um produto. Será chamado pelo Order Service 
    quando uma compra for finalizada.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT stock FROM products WHERE id = ?", (product_id,))
    p = cursor.fetchone()
    
    if not p:
        conn.close()
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
        
    current_stock = p[0]
    if current_stock < quantity:
        conn.close()
        raise HTTPException(status_code=400, detail="Estoque insuficiente.")
        
    cursor.execute(
        "UPDATE products SET stock = stock - ? WHERE id = ?", 
        (quantity, product_id)
    )
    conn.commit()
    conn.close()
    
    return {"message": "Estoque atualizado com sucesso."}

if __name__ == "__main__":
    import uvicorn
    # Inicia o servidor do Catalog Service na porta 8002
    uvicorn.run(app, host="0.0.0.0", port=8002)