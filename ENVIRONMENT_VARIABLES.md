# Variáveis de Ambiente

Este documento descreve as variáveis de ambiente usadas no projeto e como configurá-las.

## Arquivos de ambiente

| Arquivo | Uso |
| --- | --- |
| `backend/.env` | Configuração do backend |
| `frontend/.env.local` | Configuração do frontend |
| `.env.example` | Template com todas as variáveis |

Os arquivos `.env` e `.env.local` são ignorados pelo Git. Nunca versione credenciais reais.

## Backend (`backend/.env`)

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | Sim | String de conexão do PostgreSQL |
| `JWT_SECRET` | Sim | Chave usada para assinar os tokens JWT |
| `PORT` | Não | Porta do servidor (padrão `3001`) |
| `CORS_ORIGINS` | Não | Origens permitidas para CORS, separadas por vírgula (padrão `http://localhost:3000`) |

### `DATABASE_URL`

- Desenvolvimento: `postgresql://user:password@localhost:5432/smart_shopping_list?schema=public`
- Produção: use credenciais seguras e conexão SSL, ex.:
  `postgresql://user:pass@host:5432/db?sslmode=require`

### `JWT_SECRET`

Use uma string aleatória e longa (mínimo 32 caracteres). Gere com:

```bash
openssl rand -hex 32
# ou
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> O backend encerra a inicialização se `JWT_SECRET` estiver ausente ou ainda for o valor de exemplo.

### `CORS_ORIGINS`

Lista de origens autorizadas a chamar a API diretamente. O frontend normalmente
usa o proxy interno do Next.js (`/api/forward`), então em desenvolvimento o padrão
já funciona.

Em produção, inclua o domínio do frontend:

```env
CORS_ORIGINS=https://app.seudominio.com
```

## Frontend (`frontend/.env.local`)

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `NEXT_PUBLIC_BACKEND_URL` | Sim | URL base do backend |

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

> O código de servidor também aceita `BACKEND_URL`. A precedência é
> `BACKEND_URL` → `NEXT_PUBLIC_BACKEND_URL` → `http://localhost:3001`.

## Configuração automatizada

```bash
npm run setup
```

O script `scripts/setup-env.js`:

- orienta a configuração passo a passo;
- gera automaticamente um `JWT_SECRET` seguro;
- configura permissões restritas no arquivo do backend;
- cria `frontend/.env.local`.

## Configuração manual

```bash
cp .env.example backend/.env
# edite backend/.env com seus dados

cat > frontend/.env.local <<'EOF'
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
EOF
```

## Deploy

- Configure as variáveis no painel do serviço de hospedagem (Railway, Render, Vercel, etc.).
- Nunca faça commit de arquivos `.env` com dados reais.
- Use `JWT_SECRET` diferente por ambiente.
- Use conexão SSL no banco de produção.
- Defina `CORS_ORIGINS` com os domínios de produção.

## Troubleshooting

| Problema | Verificação |
| --- | --- |
| `Connection refused` | `NEXT_PUBLIC_BACKEND_URL` correto e backend rodando |
| `Authentication failed` | `JWT_SECRET` consistente; token não expirado |
| `Database connection failed` | `DATABASE_URL` válida e banco acessível |
| `CORS` bloqueando | Origem incluída em `CORS_ORIGINS` |
