# Lista de Compras Inteligente

Aplicação full-stack para gerenciar listas de compras, com autenticação de usuários,
CRUD de listas e itens, cálculo automático de totais, leitura de código de barras,
importação de itens a partir de cupom fiscal (NFC-e) e compartilhamento de listas.

## Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, next-themes.
- **Backend**: Node.js, Express 5, TypeScript, Prisma ORM.
- **Banco de dados**: PostgreSQL.
- **Autenticação**: JWT em cookie `httpOnly`.

## Funcionalidades

- Registro e login de usuários com JWT.
- CRUD de listas e de itens (adicionar, editar, remover e marcar como comprado).
- Cálculo automático do total de cada item e do total da lista.
- Leitura de código de barras e busca automática do nome do produto.
- Importação de itens a partir de cupom fiscal (NFC-e).
- Compartilhamento de listas com permissões de leitura ou edição.
- Tema claro/escuro e interface responsiva.

## Estrutura do projeto

```
lista-compras/
├── backend/                 # API Express + Prisma
│   ├── prisma/              # schema.prisma e migrations
│   └── src/
│       ├── lib/             # Prisma client (singleton)
│       ├── middleware/      # auth, CORS, rate limit, erros
│       ├── routes/          # rotas da API
│       ├── services/        # regras de negócio
│       └── utils/           # validação de entrada
├── frontend/                # Aplicação Next.js
│   └── src/
│       ├── app/             # páginas e route handlers
│       ├── components/      # componentes de UI
│       ├── hooks/           # hooks (useApi, useToast)
│       └── lib/             # utilitários e cliente HTTP
├── scripts/                 # setup de variáveis de ambiente
└── package.json             # workspace raiz
```

## Pré-requisitos

- Node.js 18+ (recomendado 20+)
- npm 9+
- PostgreSQL

## Configuração

### 1. Instale as dependências

Na raiz do projeto (é um npm workspace):

```bash
npm install
```

### 2. Configure as variáveis de ambiente

A forma mais rápida é usar o script interativo:

```bash
npm run setup
```

Ou configure manualmente:

- `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/smart_shopping_list?schema=public"
JWT_SECRET="chave-aleatoria-gerada-com-openssl-rand-hex-32"
PORT=3001
CORS_ORIGINS=http://localhost:3000
```

- `frontend/.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### 3. Prepare o banco de dados

```bash
npx prisma generate --schema=./backend/prisma/schema.prisma
npx prisma migrate dev --schema=./backend/prisma/schema.prisma
```

### 4. Rode a aplicação

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Variáveis de ambiente

Consulte [`ENVIRONMENT_VARIABLES.md`](./ENVIRONMENT_VARIABLES.md) para a documentação completa.

Resumo:

| Variável | Onde | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | backend | String de conexão do PostgreSQL |
| `JWT_SECRET` | backend | Chave usada para assinar os JWT |
| `PORT` | backend | Porta do servidor (padrão 3001) |
| `CORS_ORIGINS` | backend | Origens permitidas, separadas por vírgula |
| `NEXT_PUBLIC_BACKEND_URL` | frontend | URL base do backend |

## Scripts

Na raiz:

```bash
npm run dev        # backend + frontend em paralelo
npm run dev:backend
npm run dev:frontend
npm run build      # build de todos os workspaces
npm run setup      # configuração interativa de ambiente
```

## Testes

```bash
npm test
```

Ou por workspace:

```bash
cd frontend && npm test
```

## Segurança

- Senhas são armazenadas com hash (bcrypt) e nunca retornadas pela API.
- O token JWT fica em cookie `httpOnly`.
- Rate limiting nas rotas de autenticação.
- Validação de entrada no backend.
- Controle de acesso por lista (própria ou compartilhada) em todas as operações.
- CORS restrito às origens configuradas.

## UI/Design

- Tailwind CSS + shadcn/ui
- Framer Motion para animações
- next-themes para tema claro/escuro
- Lucide React para ícones
