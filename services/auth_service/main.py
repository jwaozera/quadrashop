import sqlite3
import jwt
import datetime
import bcrypt  # Import direto da biblioteca nativa
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="Auth Service - E-Commerce", version="1.0.1")

SECRET_KEY = "chave_super_secreta_do_projeto_com_tamanho_seguro_32+"
ALGORITHM = "HS256"


def get_db_connection():
    conn = sqlite3.connect("users.db")
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=5000")
    return conn

# Inicialização do Banco de Dados SQLite
def init_db():
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            )
        """)
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN name TEXT")
        except sqlite3.OperationalError:
            pass
        conn.commit()

init_db()

class UserCreate(BaseModel):
    name: Optional[str] = None
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

@app.post("/register")
def register(user: UserCreate):
    """
    Registra um novo usuário com a senha codificada nativamente em bcrypt.
    """
    # Transforma a string da senha em bytes e gera o hash seguro
    password_bytes = user.password.encode('utf-8')
    hashed_password = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", 
                (user.name, user.email, hashed_password)
            )
            user_id = cursor.lastrowid
            conn.commit()
            payload = {
                "user_id": user_id,
                "email": user.email,
                "name": user.name,
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
            }
            token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
            return {
                "access_token": token,
                "token_type": "bearer",
                "user": {
                    "id": user_id,
                    "name": user.name,
                    "email": user.email,
                },
            },
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

@app.post("/login")
def login(user: UserLogin):
    """
    Valida as credenciais comparando os bytes das senhas.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, password_hash FROM users WHERE email = ?", (user.email,))
        db_user = cursor.fetchone()

    if not db_user:
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

    # Converte os formatos para checagem em bytes nativa do bcrypt
    password_bytes = user.password.encode('utf-8')
    db_password_bytes = db_user[2].encode('utf-8')

    if not bcrypt.checkpw(password_bytes, db_password_bytes):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

    # Gera o Token JWT se a senha bater
    payload = {
        "user_id": db_user[0],
        "email": user.email,
        "name": db_user[1],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": db_user[0],
            "name": db_user[1],
            "email": user.email,
        },
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)