import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import shoppingListRoutes from './routes/shoppingListRoutes';
import listItemRoutes from './routes/listItemRoutes';
import shareRoutes from './routes/shareRoutes';
import nfceRoutes from './routes/nfceRoutes';

dotenv.config();

// Validação das variáveis de ambiente obrigatórias
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Variáveis de ambiente obrigatórias não configuradas:');
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
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
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/lists', shoppingListRoutes);
app.use('/api/lists/:listId/items', listItemRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/nfce', nfceRoutes);

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
