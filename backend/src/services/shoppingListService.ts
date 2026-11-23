import { prisma } from '../lib/prisma';
import { ForbiddenError, NotFoundError } from '../errors';

export interface CreateListItemInput {
  productName: string;
  barcode?: string | null;
  quantity: number;
  unitPrice: number;
}

export interface ListAccessResult {
  id: string;
  userId: string;
  sharedWith: { sharedWithUserId: string; permissions: string }[];
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export class ShoppingListService {
  /**
   * Retorna as listas do usuário (próprias + compartilhadas com ele),
   * com o campo `permission` indicando o nível de acesso.
   */
  async getLists(userId: string) {
    const [owned, shared] = await Promise.all([
      prisma.shoppingList.findMany({ where: { userId } }),
      prisma.sharedList.findMany({
        where: { sharedWithUserId: userId },
        include: { list: true },
      }),
    ]);

    return [
      ...owned.map(list => ({ ...list, permission: 'owner' as const })),
      ...shared.map(share => ({ ...share.list, permission: share.permissions })),
    ];
  }

  /**
   * Garante que o usuário pode acessar a lista.
   * `requireEdit` exige permissão de edição em listas compartilhadas.
   */
  async assertListAccess(
    listId: string,
    userId: string,
    requireEdit = false
  ): Promise<ListAccessResult> {
    const list = await prisma.shoppingList.findUnique({
      where: { id: listId },
      include: { sharedWith: true },
    });

    if (!list) {
      throw new NotFoundError('Lista não encontrada.');
    }

    if (list.userId === userId) {
      return list;
    }

    const share = list.sharedWith.find(item => item.sharedWithUserId === userId);

    if (!share) {
      // Não revela a existência da lista para quem não tem acesso.
      throw new NotFoundError('Lista não encontrada.');
    }

    if (requireEdit && share.permissions !== 'edit') {
      throw new ForbiddenError('Você não tem permissão para editar esta lista.');
    }

    return list;
  }

  async getListById(id: string, userId: string) {
    const access = await this.assertListAccess(id, userId, false);

    const list = await prisma.shoppingList.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!list) return null;

    const permission =
      access.userId === userId
        ? 'owner'
        : access.sharedWith.find(share => share.sharedWithUserId === userId)?.permissions ??
          'view';

    return { ...list, permission };
  }

  async createList(title: string, userId: string, items: CreateListItemInput[] = []) {
    const totalValue = round(
      items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0)
    );

    return prisma.shoppingList.create({
      data: {
        title,
        userId,
        total_value: totalValue,
        items: {
          create: items.map(item => ({
            product_name: item.productName,
            barcode: item.barcode ?? null,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: round(item.quantity * item.unitPrice),
          })),
        },
      },
      include: { items: true },
    });
  }

  async updateList(id: string, title: string, userId: string) {
    await this.assertListAccess(id, userId, true);

    return prisma.shoppingList.update({
      where: { id },
      data: { title },
    });
  }

  async deleteList(id: string, userId: string) {
    const list = await prisma.shoppingList.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!list) {
      throw new NotFoundError('Lista não encontrada.');
    }

    if (list.userId !== userId) {
      throw new ForbiddenError('Apenas o proprietário pode excluir esta lista.');
    }

    // Remove dependências explicitamente para funcionar mesmo em bancos
    // onde a migration de ON DELETE CASCADE ainda não foi aplicada.
    return prisma.$transaction(async tx => {
      await tx.sharedList.deleteMany({ where: { listId: id } });
      await tx.listItem.deleteMany({ where: { listId: id } });
      return tx.shoppingList.delete({ where: { id } });
    });
  }

  async calculateTotalValue(listId: string) {
    const aggregate = await prisma.listItem.aggregate({
      where: { listId },
      _sum: { total_price: true },
    });

    return prisma.shoppingList.update({
      where: { id: listId },
      data: { total_value: round(aggregate._sum.total_price ?? 0) },
    });
  }
}
