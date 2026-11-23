import { prisma } from '../lib/prisma';
import { NotFoundError } from '../errors';
import { ShoppingListService } from './shoppingListService';

const shoppingListService = new ShoppingListService();

export interface CreateItemInput {
  productName: string;
  quantity: number;
  unitPrice: number;
  barcode?: string | null;
}

export interface UpdateItemInput {
  productName?: string;
  quantity?: number;
  unitPrice?: number;
  checked?: boolean;
  barcode?: string | null;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export class ListItemService {
  private async getItemWithAccess(itemId: string, userId: string, requireEdit: boolean) {
    const item = await prisma.listItem.findUnique({ where: { id: itemId } });

    if (!item) {
      throw new NotFoundError('Item não encontrado.');
    }

    await shoppingListService.assertListAccess(item.listId, userId, requireEdit);
    return item;
  }

  async getItems(listId: string, userId: string) {
    await shoppingListService.assertListAccess(listId, userId, false);

    return prisma.listItem.findMany({ where: { listId } });
  }

  async createItem(listId: string, userId: string, input: CreateItemInput) {
    await shoppingListService.assertListAccess(listId, userId, true);

    const item = await prisma.listItem.create({
      data: {
        listId,
        product_name: input.productName,
        quantity: input.quantity,
        unit_price: input.unitPrice,
        total_price: round(input.quantity * input.unitPrice),
        barcode: input.barcode ?? null,
      },
    });

    await shoppingListService.calculateTotalValue(listId);
    return item;
  }

  async updateItem(itemId: string, userId: string, input: UpdateItemInput) {
    const current = await this.getItemWithAccess(itemId, userId, true);

    const quantity = input.quantity ?? current.quantity;
    const unitPrice = input.unitPrice ?? current.unit_price;

    const item = await prisma.listItem.update({
      where: { id: itemId },
      data: {
        product_name: input.productName ?? current.product_name,
        quantity,
        unit_price: unitPrice,
        total_price: round(quantity * unitPrice),
        checked: input.checked ?? current.checked,
        barcode: input.barcode !== undefined ? input.barcode : current.barcode,
      },
    });

    await shoppingListService.calculateTotalValue(item.listId);
    return item;
  }

  async deleteItem(itemId: string, userId: string) {
    const item = await this.getItemWithAccess(itemId, userId, true);

    await prisma.listItem.delete({ where: { id: itemId } });
    await shoppingListService.calculateTotalValue(item.listId);

    return item;
  }
}
