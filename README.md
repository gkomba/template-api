# Template API - NestJS

Uma API template robusta construída com NestJS, Prisma, PostgreSQL e autenticação JWT, pronta para ser usada como base para seus projetos.

## Funcionalidades

- **Autenticação e Autorização**: Sistema completo de auth com JWT
- **Banco de Dados**: Integração com PostgreSQL usando Prisma ORM
- **Documentação**: Swagger/OpenAPI integrado
- **Validação**: Validação de dados com class-validator
- **Segurança**: Helmet para segurança HTTP, CORS habilitado
- **Rate Limiting**: Throttling configurado
- **Containerização**: Docker Compose para desenvolvimento
- **Queue System**: Integração com Upstash QStash

## Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- npm ou yarn

## Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositório>
cd template-api
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Configure o banco de dados**
```bash
# Inicia o banco PostgreSQL com Docker e configura o Prisma
npm run initdb
```

## Como Usar

### Desenvolvimento

```bash
# Inicia o servidor em modo de desenvolvimento
npm run dev

# Ou usando o comando padrão do NestJS
npm run start:dev
```

A API estará disponível em `http://localhost:3000`

### Documentação
Acesse a documentação Swagger em: `http://localhost:3000/docs`

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                    # Inicia em modo desenvolvimento
npm run start:debug          # Inicia em modo debug

# Banco de Dados
npm run initdb                # Configura banco completo (Docker + Prisma)
npm run prisma:dev:push      # Aplica mudanças do schema no banco
npm run db:dev:restart       # Reinicia o banco de dados
npm run db:dev:rm            # Remove o container do banco
npm run db:dev:up            # Inicia apenas o container do banco

# Build e Produção
npm run build                 # Compila o projeto
npm run start:prod          # Inicia em modo produção
npm run vercel-build         # Build otimizado para Vercel

# Qualidade de Código
npm run lint                  # Executa ESLint
npm run format              # Formata código com Prettier

# Testes
npm run test                 # Testes unitários
npm run test:watch          # Testes em modo watch
npm run test:cov            # Testes com cobertura
npm run test:e2e            # Testes end-to-end
```

## Estrutura do Projeto

```
src/
├── auth/                    # Módulo de autenticação
│   ├── decorators/         # Decorators personalizados
│   ├── dto/               # Data Transfer Objects
│   ├── guards/            # Guards de autenticação
│   └── pipes/             # Pipes personalizados
├── users/                  # Módulo de usuários
├── prisma/                # Configuração do Prisma
├── upstash/               # Integração com Upstash
├── app.module.ts          # Módulo principal
└── main.ts                # Bootstrap da aplicação
```

## Autenticação

A API utiliza JWT para autenticação. Endpoints disponíveis:

- `POST /auth/login` - Login do usuário
- `POST /auth/register` - Registro de novo usuário
- `POST /auth/refresh` - Renovação do token
- `POST /auth/verify-code` - Verificação de código
- `POST /auth/resend-code` - Reenvio de código

### Exemplo de uso:

```bash
# Registrar usuário
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"senha123"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"senha123"}'
```

## Banco de Dados

O projeto usa PostgreSQL com Prisma ORM. O banco roda em Docker na porta 5434.

### Comandos Prisma:

```bash
# Gerar o cliente Prisma
npx prisma generate

# Aplicar mudanças no banco
npx prisma db push

# Ver o banco de dados
npx prisma studio
```

## Configuração de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5434/nome_db"
POSTGRES_USER=usuario
POSTGRES_PASSWORD=senha
POSTGRES_DB=nome_db

# JWT
JWT_SECRET=seu_jwt_secret_aqui
JWT_EXPIRES_IN=7d

# Upstash (opcional)
QSTASH_TOKEN=seu_token_qstash
UPSTASH_REDIS_REST_URL=sua_url_redis
UPSTASH_REDIS_REST_TOKEN=seu_token_redis

# Outros
NODE_ENV=development
PORT=3000
```

## Docker

O projeto inclui configuração Docker para o banco de dados:

```bash
# Subir apenas o banco
docker compose up dev-db -d

# Parar o banco
docker compose down

# Ver logs
docker compose logs dev-db
```

## Monitoramento e Logs

- **Rate Limiting**: Configurado com @nestjs/throttler
- **Validação Global**: Pipes de validação em todas as rotas
- **Error Handling**: Filtros de exceção customizados
- **Security**: Helmet para headers de segurança

## Testes

```bash
# Executar todos os testes
npm test

# Testes com watch mode
npm run test:watch

# Testes de integração
npm run test:e2e

# Coverage
npm run test:cov
```

## Deploy

### Vercel
```bash
npm run vercel-build
```

### Docker
```bash
# Build da imagem
docker build -t template-api .

# Executar container
docker run -p 3000:3000 template-api
```
