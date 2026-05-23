# Usa uma imagem oficial e leve do Python
FROM python:3.10-slim

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos do microsserviço para dentro do contêiner
COPY . /app

# Instala as dependências necessárias
RUN pip install --no-cache-dir fastapi uvicorn httpx pyjwt passlib[bcrypt] pydantic

# Comando padrão que será substituído no docker-compose
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]