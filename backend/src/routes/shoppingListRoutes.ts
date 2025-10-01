import { Router } from 'express';
import { ShoppingListService } from '../services/shoppingListService';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const shoppingListService = new ShoppingListService();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const lists = await shoppingListService.getLists(req.userId!);
    res.json(lists);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const list = await shoppingListService.getListById(req.params.id, req.userId!);
    res.json(list);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { title, items } = req.body;
    const list = await shoppingListService.createList(title, req.userId!, items);
    res.status(201).json(list);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { title } = req.body;
    await shoppingListService.updateList(req.params.id, title, req.userId!);
    res.sendStatus(204);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await shoppingListService.deleteList(req.params.id, req.userId!);
    res.sendStatus(204);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
