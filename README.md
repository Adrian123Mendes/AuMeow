# AuMeow

Projeto com frontend estático, backend em Node.js/Express, MySQL e integração com Ollama.

## Requisitos

- Node.js 18 ou superior
- npm
- Docker Desktop com Docker Compose
- Ollama instalado localmente

## Clonar e instalar

Instale as dependências na raiz, no backend e no demo do Supabase:

```powershell
npm install
cd beckend
npm install
cd ..\supabase-demo
npm install
cd ..
```

## Configurar variáveis de ambiente

Crie o arquivo `beckend/.env` a partir do exemplo:

```powershell
Copy-Item beckend\.env.example beckend\.env
```

Valores esperados no `beckend/.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3307
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=gemma3:4b
OLLAMA_TIMEOUT_MS=120000
DB_USER=root
DB_PASSWORD=root
DB_NAME=aumeow
JWT_SECRET=troque_esta_chave_por_uma_chave_segura
```

## Subir o banco com Docker

O projeto inclui um `docker-compose.yml` que sobe o MySQL e aplica automaticamente o schema em `docker/mysql/init/01-schema.sql`.

```powershell
docker compose up -d
```

Configuração atual do banco:

- host: `localhost`
- porta externa: `3307`
- porta interna do container: `3306`
- banco: `aumeow`
- usuário: `root`
- senha: `root`

Se o seu arquivo `beckend/.env` já existe, confira pelo menos estes campos:

```env
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=root
DB_NAME=aumeow
```

## Usuário demo

O schema cria um usuário inicial com o email `demo@aumeow.local`.

A senha em texto puro não está documentada no repositório. Se você precisar testar o login em outra máquina, o caminho mais seguro é atualizar esse usuário direto no banco ou inserir um novo usuário com uma senha conhecida.

## Reinicializar o banco

Se você já tinha subido o container antigo com senha vazia, recrie o volume para aplicar a nova configuração e rodar o schema novamente:

```powershell
docker compose down -v
docker compose up -d
```

## Executar o backend

```powershell
cd beckend
npm start
```

Backend disponível em `http://localhost:3000`.

Principais rotas:

- `GET /`
- `POST /api/ia/chat`
- `GET /api/pets`
- `POST /api/pets/add`
- `GET /api/lembretes`

## Executar o frontend

O frontend está em `frontend/`. Como ele é estático, pode ser aberto por um servidor simples. Exemplo com VS Code Live Server ou outro servidor HTTP local.

Se o frontend estiver configurado para consumir a API local, mantenha o backend rodando em `http://localhost:3000`.

## Ollama

O backend usa Ollama. Garanta que o serviço esteja ativo na máquina e acessível pela URL definida em `OLLAMA_HOST`.

O modelo padrão é `gemma3:4b`, porque respondeu com mais coerência nos testes locais:

```powershell
ollama pull gemma3:4b
```

Se faltar memória, feche outros programas antes de iniciar o chat ou configure outro modelo em `OLLAMA_MODEL`.

## Observações

- O arquivo real `beckend/.env` não deve ser enviado ao GitHub.
- A pasta `uploads/pets` é criada automaticamente quando houver upload de imagem.
- Existe também um `index.js` na raiz com uma rota simples de chat, mas a aplicação principal roda por `beckend/server.js`.
