import { Router } from 'express';
import { ShareService, SharePermission } from '../services/shareService';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { requireString, requireEnum } from '../utils/validation';

const router = Router();
const shareService = new ShareService();

router.use(authMiddleware);

router.post('/', async (req: AuthRequest, res) => {
  const listId = requireString(req.body?.listId, 'listId');
  const sharedWithUserId = requireString(req.body?.sharedWithUserId, 'sharedWithUserId');
  const permissions = requireEnum<SharePermission>(
    req.body?.permissions,
    'permissions',
    ['view', 'edit']
  );

  const sharedList = await shareService.shareList(
    listId,
    req.userId!,
    sharedWithUserId,
    permissions
  );

  res.status(201).json(sharedList);
});

router.get('/', async (req: AuthRequest, res) => {
  const sharedLists = await shareService.getSharedLists(req.userId!);
  res.json(sharedLists);
});

router.delete('/:listId/:sharedWithUserId', async (req: AuthRequest, res) => {
  await shareService.removeShare(
    req.params.listId,
    req.userId!,
    req.params.sharedWithUserId
  );
  res.sendStatus(204);
});

export default router;
