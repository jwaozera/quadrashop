import sqlite3
import httpx
import json
import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Order Service - E-Commerce", version="1.0.0")

# URL do Catalog Service para comunicação interna
CATALOG_SERVICE_URL = "http://localhost:8002"

DB_PATH = "orders_v2.db"

# Inicialização do Banco de Dados SQLite do Serviço de Pedidos
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            order_id TEXT PRIMARY KEY,
            user_id INTEGER,
            total_price REAL NOT NULL,
            status TEXT NOT NULL,
            payment_method TEXT,
            address_json TEXT,
            created_at TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            product_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            category TEXT,
            quantity INTEGER NOT NULL,
            FOREIGN KEY(order_id) REFERENCES orders(order_id)
        )
    """)
    conn.commit()
    conn.close()

init_db()

class LegacyOrderCreate(BaseModel):
    user_id: int
    product_id: int
    quantity: int


class OrderItem(BaseModel):
    product_id: int
    name: str
    price: float
    category: Optional[str] = None
    quantity: int = 1


class CheckoutRequest(BaseModel):
    user_id: Optional[int] = None
    items: List[OrderItem]
    total: Optional[float] = None
    payment_method: Optional[str] = "card"
    address: Optional[dict] = None


def serialize_order(order_row, items_rows):
    address = {}
    if order_row[5]:
        try:
            address = json.loads(order_row[5])
        except json.JSONDecodeError:
            address = {}

    return {
        "id": order_row[0],
        "user_id": order_row[1],
        "total": order_row[2],
        "status": order_row[3],
        "payment_method": order_row[4],
        "address": address,
        "created_at": order_row[6],
        "items": [
            {
                "product_id": item[0],
                "name": item[1],
                "price": item[2],
                "category": item[3],
                "quantity": item[4],
            }
            for item in items_rows
        ],
    }


def save_order(order_id, user_id, total_price, status, payment_method, address, items):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO orders (order_id, user_id, total_price, status, payment_method, address_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (
            order_id,
            user_id,
            total_price,
            status,
            payment_method,
            json.dumps(address or {}, ensure_ascii=False),
            datetime.datetime.utcnow().isoformat(),
        ),
    )

    for item in items:
        cursor.execute(
            "INSERT INTO order_items (order_id, product_id, name, price, category, quantity) VALUES (?, ?, ?, ?, ?, ?)",
            (
                order_id,
                item.product_id,
                item.name,
                item.price,
                item.category,
                item.quantity,
            ),
        )

    conn.commit()
    conn.close()


def fetch_order(order_id: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT order_id, user_id, total_price, status, payment_method, address_json, created_at FROM orders WHERE order_id = ?", (order_id,))
    order_row = cursor.fetchone()
    if not order_row:
        conn.close()
        return None

    cursor.execute("SELECT product_id, name, price, category, quantity FROM order_items WHERE order_id = ?", (order_id,))
    items_rows = cursor.fetchall()
    conn.close()
    return serialize_order(order_row, items_rows)


@app.get("/")
@app.get("/orders")
def list_orders():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT order_id, user_id, total_price, status, payment_method, address_json, created_at FROM orders ORDER BY created_at DESC")
    orders_rows = cursor.fetchall()
    orders = []

    for order_row in orders_rows:
        cursor.execute("SELECT product_id, name, price, category, quantity FROM order_items WHERE order_id = ?", (order_row[0],))
        items_rows = cursor.fetchall()
        orders.append(serialize_order(order_row, items_rows))

    conn.close()
    return orders


@app.get("/{order_id}")
@app.get("/orders/{order_id}")
def get_order(order_id: str):
    order = fetch_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado.")
    return order


@app.post("/checkout")
async def checkout(order: CheckoutRequest):
    """
    Cria um pedido a partir dos itens do carrinho local do frontend.
    """
    if not order.items:
        raise HTTPException(status_code=400, detail="O carrinho está vazio.")

    total_price = order.total if order.total is not None else sum(item.price * item.quantity for item in order.items)
    order_id = f"ORD-{int(datetime.datetime.utcnow().timestamp() * 1000)}"
    save_order(
        order_id=order_id,
        user_id=order.user_id,
        total_price=total_price,
        status="processing",
        payment_method=order.payment_method,
        address=order.address,
        items=order.items,
    )

    return {
        "message": "Pedido criado com sucesso!",
        "order_id": order_id,
        "total_price": total_price,
        "status": "processing",
    }


@app.post("/orders")
async def create_order(order: LegacyOrderCreate):
    """
    Mantém compatibilidade com o teste legado que cria pedido com um único item.
    """
    async with httpx.AsyncClient() as client:
        # 1. Busca os detalhes do produto no Catalog Service
        try:
            response = await client.get(f"{CATALOG_SERVICE_URL}/products/{order.product_id}")
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="Produto não encontrado no catálogo.")

            product = response.json()
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Serviço de Catálogo indisponível.")

        # 2. Verifica se há estoque suficiente
        if product["stock"] < order.quantity:
            raise HTTPException(status_code=400, detail="Estoque insuficiente para esta compra.")

        # 3. Calcula o valor total do pedido
        total_price = product["price"] * order.quantity

        # 4. Solicita a baixa do estoque no Catalog Service
        try:
            update_stock_resp = await client.put(
                f"{CATALOG_SERVICE_URL}/products/{order.product_id}/reduce_stock?quantity={order.quantity}"
            )
            if update_stock_resp.status_code != 200:
                raise HTTPException(status_code=400, detail="Erro ao atualizar o estoque.")
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Erro de comunicação ao atualizar estoque.")

    order_id = f"ORD-{int(datetime.datetime.utcnow().timestamp() * 1000)}"
    save_order(
        order_id=order_id,
        user_id=order.user_id,
        total_price=total_price,
        status="processing",
        payment_method="card",
        address={},
        items=[
            OrderItem(
                product_id=order.product_id,
                name=product["name"],
                price=product["price"],
                category=product.get("category"),
                quantity=order.quantity,
            )
        ],
    )

    return {
        "message": "Pedido criado com sucesso!",
        "order_id": order_id,
        "total_price": total_price,
        "status": "processing",
    }

if __name__ == "__main__":
    import uvicorn
    # Inicia o servidor do Order Service na porta 8003
    uvicorn.run(app, host="0.0.0.0", port=8003)