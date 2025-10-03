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
exports.ListItemService = void 0;
const client_1 = require("@prisma/client");
const shoppingListService_1 = require("./shoppingListService");
const prisma = new client_1.PrismaClient();
const shoppingListService = new shoppingListService_1.ShoppingListService();
class ListItemService {
    getItems(listId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.listItem.findMany({
                where: { listId },
            });
        });
    }
    createItem(listId_1, productName_1, quantity_1) {
        return __awaiter(this, arguments, void 0, function* (listId, productName, quantity, unitPrice = 0, barcode) {
            const totalPrice = quantity * unitPrice;
            const item = yield prisma.listItem.create({
                data: {
                    listId,
                    product_name: productName,
                    quantity,
                    unit_price: unitPrice,
                    total_price: totalPrice,
                    barcode: barcode || null,
                },
            });
            yield shoppingListService.calculateTotalValue(listId);
            return item;
        });
    }
    updateItem(id_1, productName_1, quantity_1) {
        return __awaiter(this, arguments, void 0, function* (id, productName, quantity, unitPrice = 0, checked) {
            const totalPrice = quantity * unitPrice;
            const item = yield prisma.listItem.update({
                where: { id },
                data: {
                    product_name: productName,
                    quantity,
                    unit_price: unitPrice,
                    total_price: totalPrice,
                    checked,
                },
            });
            yield shoppingListService.calculateTotalValue(item.listId);
            return item;
        });
    }
    deleteItem(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield prisma.listItem.delete({
                where: { id },
            });
            yield shoppingListService.calculateTotalValue(item.listId);
            return item;
        });
    }
}
exports.ListItemService = ListItemService;
