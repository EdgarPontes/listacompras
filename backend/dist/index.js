"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const shoppingListRoutes_1 = __importDefault(require("./routes/shoppingListRoutes"));
const listItemRoutes_1 = __importDefault(require("./routes/listItemRoutes"));
const shareRoutes_1 = __importDefault(require("./routes/shareRoutes"));
const nfceRoutes_1 = __importDefault(require("./routes/nfceRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const port = process.env.PORT || 3001;
app.use(express_1.default.json());
app.use('/api/auth', authRoutes_1.default);
app.use('/api/lists', shoppingListRoutes_1.default);
app.use('/api/lists/:listId/items', listItemRoutes_1.default);
app.use('/api/share', shareRoutes_1.default);
app.use('/api/nfce', nfceRoutes_1.default);
app.get('/', (req, res) => {
    res.send('Hello from the backend!');
});
app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});
