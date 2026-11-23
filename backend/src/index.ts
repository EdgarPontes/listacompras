import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import shoppingListRoutes from './routes/shoppingListRoutes';
import listItemRoutes from './routes/listItemRoutes';
import shareRoutes from './routes/shareRoutes';
import nfceRoutes from './routes/nfceRoutes';
import productRoutes from './routes/productRoutes';
import { corsMiddleware } from './middleware/cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config({ quiet: true });

// Validação das variáveis de ambiente obrigatórias
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Variáveis de ambiente obrigatórias não configuradas:');
  missingEnvVars.forEach((envVar) => console.error(`   - ${envVar}`));
  console.error('\n📖 Consulte a documentação em ENVIRONMENT_VARIABLES.md');
  process.exit(1);
}

// Validação específica do JWT_SECRET
if (process.env.JWT_SECRET === 'your_jwt_secret_key_here') {
  console.error('❌ JWT_SECRET deve ser substituído por uma chave única e segura');
  console.error('💡 Gere uma nova chave: openssl rand -hex 32');
  process.exit(1);
}

console.log('✅ Variáveis de ambiente validadas com sucesso');

const app = express();

// Necessário para o rate limit usar o IP real quando atrás de proxy.
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(express.json({ limit: '1mb' }));

const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(corsMiddleware(allowedOrigins));

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'lista-compras-api' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
// Monta as rotas de itens antes das rotas de listas para evitar
// passar o authMiddleware duas vezes em /api/lists/:listId/items.
app.use('/api/lists/:listId/items', listItemRoutes);
app.use('/api/lists', shoppingListRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/nfce', nfceRoutes);
app.use('/api/products', productRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT) || 3001;

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
