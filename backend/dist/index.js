"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const shoppingListRoutes_1 = __importDefault(require("./routes/shoppingListRoutes"));
const listItemRoutes_1 = __importDefault(require("./routes/listItemRoutes"));
const shareRoutes_1 = __importDefault(require("./routes/shareRoutes"));
const nfceRoutes_1 = __importDefault(require("./routes/nfceRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const cors_1 = require("./middleware/cors");
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config({ quiet: true });
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
const app = (0, express_1.default)();
// Necessário para o rate limit usar o IP real quando atrás de proxy.
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express_1.default.json({ limit: '1mb' }));
const allowedOrigins = ((_a = process.env.CORS_ORIGINS) !== null && _a !== void 0 ? _a : 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
app.use((0, cors_1.corsMiddleware)(allowedOrigins));
app.get('/', (_req, res) => {
    res.json({ status: 'ok', service: 'lista-compras-api' });
});
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.use('/api/auth', authRoutes_1.default);
// Monta as rotas de itens antes das rotas de listas para evitar
// passar o authMiddleware duas vezes em /api/lists/:listId/items.
app.use('/api/lists/:listId/items', listItemRoutes_1.default);
app.use('/api/lists', shoppingListRoutes_1.default);
app.use('/api/share', shareRoutes_1.default);
app.use('/api/nfce', nfceRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});
