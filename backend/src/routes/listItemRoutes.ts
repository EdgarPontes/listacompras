import { Router } from 'express';
import { ListItemService, UpdateItemInput } from '../services/listItemService';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import {
  requireString,
  optionalString,
  requireNumber,
  optionalNumber,
  optionalBoolean,
} from '../utils/validation';

const router = Router({ mergeParams: true });
const listItemService = new ListItemService();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  const items = await listItemService.getItems(req.params.listId, req.userId!);
  res.json(items);
});

router.post('/', async (req: AuthRequest, res) => {
  const productName = requireString(req.body?.productName, 'productName', { max: 200 });
  const quantity = requireNumber(req.body?.quantity ?? 1, 'quantity', {
    min: 1,
    integer: true,
  });
  const unitPrice = requireNumber(req.body?.unitPrice ?? 0, 'unitPrice', { min: 0 });
  const barcode = optionalString(req.body?.barcode, 'barcode') ?? null;

  const item = await listItemService.createItem(req.params.listId, req.userId!, {
    productName,
    quantity,
    unitPrice,
    barcode,
  });

  res.status(201).json(item);
});

router.put('/:itemId', async (req: AuthRequest, res) => {
  const input: UpdateItemInput = {
    productName: optionalString(req.body?.productName, 'productName'),
    quantity: optionalNumber(req.body?.quantity, 'quantity', { min: 1, integer: true }),
    unitPrice: optionalNumber(req.body?.unitPrice, 'unitPrice', { min: 0 }),
    checked: optionalBoolean(req.body?.checked, 'checked'),
  };

  // Permite limpar o código de barras enviando `barcode: ""` ou `null`.
  if (req.body?.barcode === null || req.body?.barcode === '') {
    input.barcode = null;
  } else {
    const barcode = optionalString(req.body?.barcode, 'barcode');
    if (barcode !== undefined) input.barcode = barcode;
  }

  const item = await listItemService.updateItem(req.params.itemId, req.userId!, input);
  res.json(item);
});

router.delete('/:itemId', async (req: AuthRequest, res) => {
  await listItemService.deleteItem(req.params.itemId, req.userId!);
  res.sendStatus(204);
});

export default router;
