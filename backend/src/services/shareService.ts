import { prisma } from '../lib/prisma';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors';

export type SharePermission = 'view' | 'edit';

export class ShareService {
  async shareList(
    listId: string,
    requesterId: string,
    sharedWithUserId: string,
    permissions: SharePermission
  ) {
    const list = await prisma.shoppingList.findUnique({
      where: { id: listId },
      select: { userId: true },
    });

    if (!list) {
      throw new NotFoundError('Lista não encontrada.');
    }

    if (list.userId !== requesterId) {
      throw new ForbiddenError('Apenas o proprietário pode compartilhar esta lista.');
    }

    if (sharedWithUserId === requesterId) {
      throw new BadRequestError('Você não pode compartilhar uma lista com você mesmo.');
    }

    const target = await prisma.user.findUnique({
      where: { id: sharedWithUserId },
      select: { id: true },
    });

    if (!target) {
      throw new NotFoundError('Usuário de destino não encontrado.');
    }

    const existing = await prisma.sharedList.findFirst({
      where: { listId, sharedWithUserId },
    });

    if (existing) {
      return prisma.sharedList.update({
        where: { id: existing.id },
        data: { permissions },
      });
    }

    return prisma.sharedList.create({
      data: { listId, sharedWithUserId, permissions },
    });
  }

  async getSharedLists(userId: string) {
    return prisma.sharedList.findMany({
      where: { sharedWithUserId: userId },
      include: { list: { include: { items: true } } },
    });
  }

  async removeShare(listId: string, requesterId: string, sharedWithUserId: string) {
    const list = await prisma.shoppingList.findUnique({
      where: { id: listId },
      select: { userId: true },
    });

    if (!list) {
      throw new NotFoundError('Lista não encontrada.');
    }

    if (list.userId !== requesterId) {
      throw new ForbiddenError('Apenas o proprietário pode remover o compartilhamento.');
    }

    return prisma.sharedList.deleteMany({ where: { listId, sharedWithUserId } });
  }
}
