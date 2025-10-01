import { PrismaClient } from '@prisma/client';
import { ShoppingListService } from './shoppingListService';

const prisma = new PrismaClient();
const shoppingListService = new ShoppingListService();

export class ListItemService {
  async getItems(listId: string) {
    return prisma.listItem.findMany({
      where: { listId },
    });
  }

  async createItem(listId: string, productName: string, quantity: number, unitPrice: number = 0, barcode?: string) {
    const totalPrice = quantity * unitPrice;
    const item = await prisma.listItem.create({
      data: {
        listId,
        product_name: productName,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        barcode: barcode || null,
      },
    });
    await shoppingListService.calculateTotalValue(listId);
    return item;
  }

  async updateItem(id: string, productName: string, quantity: number, unitPrice: number = 0, checked: boolean) {
    const totalPrice = quantity * unitPrice;
    const item = await prisma.listItem.update({
      where: { id },
      data: {
        product_name: productName,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        checked,
      },
    });
    await shoppingListService.calculateTotalValue(item.listId);
    return item;
  }

  async deleteItem(id: string) {
    const item = await prisma.listItem.delete({
      where: { id },
    });
    await shoppingListService.calculateTotalValue(item.listId);
    return item;
  }
}
