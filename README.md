# Quadrashop - E-Commerce em Microsserviços

O **Quadrashop** é um sistema de e-commerce moderno construído com a arquitetura de **Microsserviços**. O projeto foi concebido para aplicar conceitos avançados de Engenharia de Software, incluindo conteinerização, isolamento de domínios (database-per-service) e roteamento centralizado.

## 🏗 Arquitetura do Sistema

A aplicação está dividida em microsserviços independentes que se comunicam através de um Gateway.

* **Frontend (React + Vite + TailwindCSS):** Interface do usuário servida de forma extremamente otimizada através de um servidor Nginx, que também atua como proxy reverso para contornar problemas de CORS em produção.
* **API Gateway (FastAPI):** Ponto único de entrada da aplicação. Roteia as requisições HTTP para os microsserviços corretos.
* **Auth Service:** Gerenciamento de usuários e emissão de tokens JWT para autenticação.
* **Catalog Service:** Vitrine de produtos e controle de estoque.
* **Order Service:** Gerenciamento do ciclo de vida dos pedidos, integração de carrinho de compras e baixa de estoque no catálogo.
* **Payment Service:** Componente responsável por processar requisições de pagamento.
* **Recommendation Service:** Motor simples para recomendação de produtos com base nas visualizações e comportamento do usuário.

## 🛠 Tecnologias Utilizadas
* **Backend:** Python 3, FastAPI, Uvicorn, SQLite, JWT (Autenticação).
* **Frontend:** React, Vite, Tailwind CSS v4.
* **Infraestrutura:** Docker, Docker Compose, Nginx.

---

## 🚀 Como Executar o Projeto

O projeto suporta a execução em contêineres Docker (Recomendado) ou nativamente no seu ambiente Windows.

### Opção 1: Rodando com Docker (Recomendado)
Garante que todo o ambiente e dependências isoladas sejam instaladas corretamente, simulando um ambiente de produção.

1. Certifique-se de que o [Docker Desktop](https://www.docker.com/products/docker-desktop/) está aberto e rodando.
2. No terminal, na raiz do projeto, execute:
   ```bash
   docker compose up --build -d
   ```
3. Acesse a loja no seu navegador em: **[http://localhost:3000](http://localhost:3000)**

*Observação: Os bancos de dados SQLite são salvos automaticamente na pasta `db_data` para garantir persistência de dados caso o servidor reinicie.*

### Opção 2: Execução Nativa (Windows)
Se preferir não usar Docker, os serviços podem subir usando a rede local.

1. Certifique-se de ter o Python e o Node.js instalados.
2. Instale as bibliotecas Python necessárias:
   ```bash
   python -m pip install -r requirements.txt
   ```
3. Execute o script de automação:
   ```cmd
   .\run_all.bat
   ```
Isso abrirá instâncias do terminal separadas para cada microsserviço e para o servidor de desenvolvimento do Frontend (Vite).

---

## 🧪 Rodando Testes da API

Um script automatizado em Python foi disponibilizado para testar todo o fluxo principal de E-Commerce, validando a integração entre múltiplos serviços (Criação de Conta -> Login (JWT) -> Consulta de Catálogo -> Criação de Pedido).

Com os servidores rodando (em Docker ou Nativo), execute na raiz do projeto:

```bash
python test_api.py
```
O console exibirá os status de sucesso na integração das compras e validação do Gateway.

---
*Projeto desenvolvido para a disciplina de Engenharia de Software.*
