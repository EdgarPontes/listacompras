import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ShareService {
  async shareList(listId: string, sharedWithUserId: string, permissions: string) {
    return prisma.sharedList.create({
      data: {
        listId,
        sharedWithUserId,
        permissions,
      },
    });
  }

  async getSharedLists(userId: string) {
    return prisma.sharedList.findMany({
      where: { sharedWithUserId: userId },
      include: { list: true },
    });
  }
}
