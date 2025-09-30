import { Router } from 'express';
import { ListItemService } from '../services/listItemService';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router({ mergeParams: true });
const listItemService = new ListItemService();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const items = await listItemService.getItems(req.params.listId);
    res.json(items);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { productName, quantity, unitPrice } = req.body;
    const item = await listItemService.createItem(req.params.listId, productName, quantity, unitPrice);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put('/:itemId', async (req: AuthRequest, res) => {
  try {
    const { productName, quantity, unitPrice, checked } = req.body;
    const item = await listItemService.updateItem(req.params.itemId, productName, quantity, unitPrice, checked);
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.delete('/:itemId', async (req: AuthRequest, res) => {
  try {
    await listItemService.deleteItem(req.params.itemId);
    res.sendStatus(204);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
