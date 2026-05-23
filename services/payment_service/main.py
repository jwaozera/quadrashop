import random
import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="Payment Service Component - E-Commerce", version="1.0.0")

class PaymentRequest(BaseModel):
    order_id: str
    amount: float
    method: Optional[str] = "card"
    credit_card_token: Optional[str] = None

@app.post("/process")
@app.post("/process_payment")
async def process_payment(payment: PaymentRequest):
    """
    Simula a comunicação com uma API externa de gateway de pagamento (ex: Stripe, Cielo).
    Implementa um delay de 2 segundos para simular a rede bancária e possui
    80% de chance de aprovar a transação (para facilitar os testes de erro e sucesso).
    """
    # Simula o tempo de processamento da operadora de cartão
    await asyncio.sleep(2) 
    
    # Gera um número aleatório entre 0 e 1. Se for menor que 0.8, aprova.
    is_approved = random.random() < 0.8 
    
    if is_approved:
        return {
            "order_id": payment.order_id,
            "status": "approved",
            "transaction_id": f"TXN-{random.randint(100000, 999999)}"
        }
    else:
        # Retorna o código HTTP 402 (Payment Required)
        raise HTTPException(status_code=402, detail="Pagamento Recusado pela Operadora do Cartão.")

if __name__ == "__main__":
    import uvicorn
    # Inicia o servidor do Payment Service na porta 8004
    uvicorn.run(app, host="0.0.0.0", port=8004)