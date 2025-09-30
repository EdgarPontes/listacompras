import { Router } from 'express';
import { ShareService } from '../services/shareService';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const shareService = new ShareService();

router.use(authMiddleware);

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { listId, sharedWithUserId, permissions } = req.body;
    const sharedList = await shareService.shareList(listId, sharedWithUserId, permissions);
    res.status(201).json(sharedList);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get('/', async (req: AuthRequest, res) => {
  try {
    const sharedLists = await shareService.getSharedLists(req.userId!);
    res.json(sharedLists);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
