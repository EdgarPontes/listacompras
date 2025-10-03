"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShoppingListService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ShoppingListService {
    getLists(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.shoppingList.findMany({
                where: { userId },
            });
        });
    }
    getListById(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.shoppingList.findFirst({
                where: { id, userId },
                include: { items: true },
            });
        });
    }
    createList(title, userId, items) {
        return __awaiter(this, void 0, void 0, function* () {
            const newList = yield prisma.shoppingList.create({
                data: {
                    title,
                    userId,
                    items: {
                        create: (items === null || items === void 0 ? void 0 : items.map(item => ({
                            product_name: item.productName,
                            barcode: item.barcode,
                            quantity: item.quantity,
                            unit_price: item.unitPrice,
                            total_price: item.quantity * item.unitPrice,
                        }))) || [],
                    },
                },
                include: { items: true },
            });
            yield this.calculateTotalValue(newList.id);
            return newList;
        });
    }
    updateList(id, title, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.shoppingList.updateMany({
                where: { id, userId },
                data: { title },
            });
        });
    }
    deleteList(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.shoppingList.deleteMany({
                where: { id, userId },
            });
        });
    }
    calculateTotalValue(listId) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield prisma.shoppingList.findUnique({
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
        });
    }
}
exports.ShoppingListService = ShoppingListService;
