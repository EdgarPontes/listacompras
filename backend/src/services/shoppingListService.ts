import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ListItem {
  productName: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
}

export class ShoppingListService {
  async getLists(userId: string) {
    return prisma.shoppingList.findMany({
      where: { userId },
    });
  }

  async getListById(id: string, userId: string) {
    return prisma.shoppingList.findFirst({
      where: { id, userId },
      include: { items: true },
    });
  }

  async createList(title: string, userId: string, items?: ListItem[]) {
    const newList = await prisma.shoppingList.create({
      data: {
        title,
        userId,
        items: {
          create: items?.map(item => ({
            product_name: item.productName,
            barcode: item.barcode,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.quantity * item.unitPrice,
          })) || [],
        },
      },
      include: { items: true },
    });

    await this.calculateTotalValue(newList.id);
    return newList;
  }

  async updateList(id: string, title: string, userId: string) {
    return prisma.shoppingList.updateMany({
      where: { id, userId },
      data: { title },
    });
  }

  async deleteList(id: string, userId: string) {
    return prisma.shoppingList.deleteMany({
      where: { id, userId },
    });
  }

  async calculateTotalValue(listId: string) {
    const list = await prisma.shoppingList.findUnique({
      where: { id: listId },
      include: { items: true },
    });

    if (!list) {
      throw new Error('Shopping list not found');
    }

    const totalValue = list.items.reduce((acc, item) => acc + item.total_price, 0);

    return prisma.shoppingList.update({
      where: { id: listId },
      data: { total_value: totalValue },
    });
  }
}
