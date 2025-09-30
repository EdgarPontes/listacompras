import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import shoppingListRoutes from './routes/shoppingListRoutes';
import listItemRoutes from './routes/listItemRoutes';
import shareRoutes from './routes/shareRoutes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/lists', shoppingListRoutes);
app.use('/api/lists/:listId/items', listItemRoutes);
app.use('/api/share', shareRoutes);

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
