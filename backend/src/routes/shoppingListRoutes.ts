import { Router } from 'express';
import { ShoppingListService, CreateListItemInput } from '../services/shoppingListService';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import {
  requireString,
  optionalString,
  requireNumber,
  requireArray,
} from '../utils/validation';

const router = Router();
const shoppingListService = new ShoppingListService();

router.use(authMiddleware);

function parseItems(raw: unknown): CreateListItemInput[] {
  if (raw === undefined || raw === null) return [];

  return requireArray(raw, 'items').map((entry, index) => {
    const item = (entry ?? {}) as Record<string, unknown>;

    return {
      productName: requireString(item.productName, `items[${index}].productName`, { max: 200 }),
      barcode: optionalString(item.barcode, `items[${index}].barcode`) ?? null,
      quantity: requireNumber(item.quantity ?? 1, `items[${index}].quantity`, {
        min: 1,
        integer: true,
      }),
      unitPrice: requireNumber(item.unitPrice ?? 0, `items[${index}].unitPrice`, { min: 0 }),
    };
  });
}

router.get('/', async (req: AuthRequest, res) => {
  const lists = await shoppingListService.getLists(req.userId!);
  res.json(lists);
});

router.get('/:id', async (req: AuthRequest, res) => {
  const list = await shoppingListService.getListById(req.params.id, req.userId!);
  res.json(list);
});

router.post('/', async (req: AuthRequest, res) => {
  const title = requireString(req.body?.title, 'title', { min: 1, max: 120 });
  const items = parseItems(req.body?.items);

  const list = await shoppingListService.createList(title, req.userId!, items);
  res.status(201).json(list);
});

router.put('/:id', async (req: AuthRequest, res) => {
  const title = requireString(req.body?.title, 'title', { min: 1, max: 120 });
  const list = await shoppingListService.updateList(req.params.id, title, req.userId!);
  res.json(list);
});

router.delete('/:id', async (req: AuthRequest, res) => {
  await shoppingListService.deleteList(req.params.id, req.userId!);
  res.sendStatus(204);
});

export default router;
