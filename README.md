# AuMeow

Projeto com frontend estatico, backend em Node.js/Express, MySQL e integracao com Ollama.

## Requisitos

- Node.js 18 ou superior
- npm
- Docker Desktop com Docker Compose
- Ollama instalado localmente

## Clonar e instalar

Instale as dependencias na raiz, no backend e no demo do Supabase:

```powershell
npm install
cd beckend
npm install
cd ..\supabase-demo
npm install
cd ..
```

## Configurar variaveis de ambiente

Crie o arquivo `beckend/.env` a partir do exemplo:

```powershell
Copy-Item beckend\.env.example beckend\.env
```

Valores esperados no `beckend/.env`:

```env
PORT=3000
DB_HOST=localhost
OLLAMA_HOST=http://localhost:11435
DB_USER=root
DB_PASSWORD=
DB_NAME=aumeow
JWT_SECRET=troque_esta_chave_por_uma_chave_segura
```

## Subir o banco com Docker

O projeto inclui um `docker-compose.yml` que sobe o MySQL e aplica automaticamente o schema em `docker/mysql/init/01-schema.sql`.

```powershell
docker compose up -d
```

Configuracao atual do banco:

- host: `localhost`
- porta: `3306`
- banco: `aumeow`
- usuario: `root`
- senha: vazia

## Usuario demo

O schema cria um usuario inicial com o email `demo@aumeow.local`.

A senha em texto puro nao esta documentada no repositorio. Se voce precisar testar o login em outra maquina, o caminho mais seguro e atualizar esse usuario direto no banco ou inserir um novo usuario com uma senha conhecida.

## Executar o backend

```powershell
cd beckend
npm start
```

Backend disponivel em `http://localhost:3000`.

Principais rotas:

- `GET /`
- `POST /api/ia/chat`
- `GET /api/pets`
- `POST /api/pets/add`
- `GET /api/lembretes`

## Executar o frontend

O frontend esta em `frontend/`. Como ele e estatico, pode ser aberto por um servidor simples. Exemplo com VS Code Live Server ou outro servidor HTTP local.

Se o frontend estiver configurado para consumir a API local, mantenha o backend rodando em `http://localhost:3000`.

## Ollama

O backend usa Ollama. Garanta que o servico esteja ativo na maquina e acessivel pela URL definida em `OLLAMA_HOST`.

## Observacoes

- O arquivo real `beckend/.env` nao deve ser enviado ao GitHub.
- A pasta `uploads/pets` e criada automaticamente quando houver upload de imagem.
- Existe tambem um `index.js` na raiz com uma rota simples de chat, mas a aplicacao principal roda por `beckend/server.js`.
