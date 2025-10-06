# Documentação das Variáveis de Ambiente

Este documento explica a importância e configuração das variáveis de ambiente utilizadas no projeto Smart Shopping List.

## Por que usar arquivos .env?

### Segurança
- **Credenciais sensíveis**: DATABASE_URL, JWT_SECRET e outras credenciais ficam protegidas e não são expostas no código
- **Controle de acesso**: Arquivos .env podem ser configurados para diferentes ambientes (desenvolvimento, produção)
- **Prevenção de commits acidentais**: Arquivos .env são ignorados pelo Git

### Flexibilidade
- **Configuração por ambiente**: Diferentes configurações para desenvolvimento, teste e produção
- **Facilidade de manutenção**: Mudanças de configuração sem alterar o código
- **Compartilhamento seguro**: .env.example permite compartilhar estrutura sem expor dados sensíveis

### Organização
- **Separação de responsabilidades**: Código focado na lógica, configuração externa
- **Padronização**: Estrutura clara e documentada para toda a equipe

## Arquivos de Ambiente no Projeto

### Backend (.env)
Localizado em: `backend/.env`

```env
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
JWT_SECRET="your_jwt_secret_key_here"
PORT=3001
```

**Variáveis obrigatórias:**

- `DATABASE_URL`: String de conexão com PostgreSQL
  - **Produção**: Use credenciais seguras e conexão SSL
  - **Desenvolvimento**: Pode usar localhost ou serviços como Railway, Neon, Supabase
  - **Exemplo produção**: `postgresql://user:pass@host:5432/db?sslmode=require`

- `JWT_SECRET`: Chave secreta para assinatura de tokens JWT
  - **IMPORTANTE**: Use uma string aleatória e única
  - **Comprimento mínimo**: 32 caracteres recomendado
  - **Gere com**: `openssl rand -hex 32` ou `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

- `PORT`: Porta onde o servidor backend executará
  - **Padrão**: 3001
  - **Produção**: Configure conforme necessidade do hosting

### Frontend (.env.local)
Localizado em: `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

**Variáveis obrigatórias:**

- `NEXT_PUBLIC_API_URL`: URL base da API backend
  - **Desenvolvimento**: `http://localhost:3001`
  - **Produção**: URL completa do backend (ex: `https://api.seudominio.com`)
  - **Prefixo NEXT_PUBLIC**: Obrigatório para variáveis acessíveis no navegador

## Configuração Atual vs Recomendada

### Inconsistências Identificadas

1. **Variável de ambiente inconsistente**:
   - `.env` define: `NEXT_PUBLIC_BACKEND_URL=http://localhost:3001`
   - Código usa: `process.env.NEXT_PUBLIC_API_URL`
   - **Problema**: Nome da variável não corresponde

2. **Arquivo .env.example desatualizado**:
   - Não reflete as configurações reais de produção
   - Falta documentação sobre variáveis obrigatórias

### Correções Necessárias

#### 1. Padronizar nome da variável de ambiente

```typescript
// frontend/src/lib/api.ts - ATUAL
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {

// SUGERIDO - manter consistência
const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`,
```

#### 2. Atualizar .env.example

```env
# .env.example - SUGERIDO
DATABASE_URL="postgresql://user:password@localhost:5432/smart_shopping_list?schema=public"
JWT_SECRET="your_jwt_secret_key_here"
PORT=3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

## Procedimentos de Configuração

### Para Desenvolvimento

#### **Método Automatizado (Recomendado)**
```bash
npm run setup
```
Este comando executa um script interativo que:
- ✅ Orienta na configuração passo a passo
- ✅ Gera automaticamente um JWT_SECRET seguro
- ✅ Configura permissões adequadas nos arquivos
- ✅ Valida as configurações inseridas

#### **Método Manual**
1. **Backend**:
   ```bash
   cd backend
   cp .env.example .env
   # Edite .env com suas configurações locais
   ```

2. **Frontend**:
   ```bash
   cd frontend
   cp .env.example .env.local
   # Edite .env.local com suas configurações locais
   ```

### Para Produção

1. **Backend**:
   - Configure DATABASE_URL com credenciais de produção
   - Gere novo JWT_SECRET: `openssl rand -hex 32`
   - Defina PORT conforme exigência do hosting
   - Use conexão SSL no banco de dados

2. **Frontend**:
   - Configure NEXT_PUBLIC_BACKEND_URL com URL de produção
   - Certifique-se de que o domínio está autorizado (CORS)

### Para Deploy

1. **Configure as variáveis no serviço de hosting**:
   - Railway, Vercel, Heroku, etc.
   - Nunca commite arquivos .env com dados reais

2. **Variáveis sensíveis**:
   - DATABASE_URL: Configurar no painel do serviço de banco
   - JWT_SECRET: Definir como variável de ambiente no hosting

## Boas Práticas

### Segurança
- ✅ Nunca commite arquivos .env com dados reais
- ✅ Use .env.example como template
- ✅ Configure variáveis diferentes por ambiente
- ✅ Use credenciais fortes e únicas

### Desenvolvimento
- ✅ Documente todas as variáveis necessárias
- ✅ Use nomes descritivos e consistentes
- ✅ Valide variáveis obrigatórias na inicialização
- ✅ Forneça valores padrão seguros quando possível

### Produção
- ✅ Use conexão SSL para bancos de dados
- ✅ Configure timeout apropriado para conexões
- ✅ Monitore variáveis de ambiente por mudanças
- ✅ Tenha backup das configurações críticas

## Validação de Configuração

### Backend
O backend valida automaticamente as variáveis essenciais:

```typescript
// backend/src/index.ts
dotenv.config();

const port = process.env.PORT || 3001;

// Validação recomendada (adicione se necessário):
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL é obrigatória');
  process.exit(1);
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_jwt_secret_key_here') {
  console.error('JWT_SECRET deve ser configurado com valor único');
  process.exit(1);
}
```

### Frontend
O frontend depende da configuração correta da API:

```typescript
// Validação recomendada no frontend
if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
  console.error('NEXT_PUBLIC_BACKEND_URL deve estar configurada');
}
```

## Troubleshooting

### Problemas Comuns

1. **"Connection refused"**:
   - Verifique se NEXT_PUBLIC_BACKEND_URL está correto
   - Confirme se o backend está rodando na porta especificada

2. **"Authentication failed"**:
   - Verifique se JWT_SECRET é consistente entre restarts
   - Certifique-se de que o token não expirou

3. **"Database connection failed"**:
   - Valide DATABASE_URL
   - Teste conexão: `npx prisma studio` (desenvolvimento)
   - Verifique credenciais e firewall

### Debug
```bash
# Backend - verificar variáveis carregadas
cd backend && node -e "console.log(process.env)"

// Frontend - verificar variáveis públicas
cd frontend && node -e "console.log(process.env.NEXT_PUBLIC_BACKEND_URL)"
```

## Conclusão

O uso correto de arquivos .env é essencial para:
- Segurança da aplicação
- Flexibilidade entre ambientes
- Manutenibilidade do código
- Facilidade de deploy

Mantenha este documento atualizado conforme novas variáveis forem adicionadas ao projeto.
