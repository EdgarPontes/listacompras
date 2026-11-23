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
const prisma_1 = require("../lib/prisma");
const errors_1 = require("../errors");
const shoppingListService_1 = require("./shoppingListService");
const shoppingListService = new shoppingListService_1.ShoppingListService();
function round(value) {
    return Math.round(value * 100) / 100;
}
class ListItemService {
    getItemWithAccess(itemId, userId, requireEdit) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield prisma_1.prisma.listItem.findUnique({ where: { id: itemId } });
            if (!item) {
                throw new errors_1.NotFoundError('Item não encontrado.');
            }
            yield shoppingListService.assertListAccess(item.listId, userId, requireEdit);
            return item;
        });
    }
    getItems(listId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield shoppingListService.assertListAccess(listId, userId, false);
            return prisma_1.prisma.listItem.findMany({ where: { listId } });
        });
    }
    createItem(listId, userId, input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield shoppingListService.assertListAccess(listId, userId, true);
            const item = yield prisma_1.prisma.listItem.create({
                data: {
                    listId,
                    product_name: input.productName,
                    quantity: input.quantity,
                    unit_price: input.unitPrice,
                    total_price: round(input.quantity * input.unitPrice),
                    barcode: (_a = input.barcode) !== null && _a !== void 0 ? _a : null,
                },
            });
            yield shoppingListService.calculateTotalValue(listId);
            return item;
        });
    }
    updateItem(itemId, userId, input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const current = yield this.getItemWithAccess(itemId, userId, true);
            const quantity = (_a = input.quantity) !== null && _a !== void 0 ? _a : current.quantity;
            const unitPrice = (_b = input.unitPrice) !== null && _b !== void 0 ? _b : current.unit_price;
            const item = yield prisma_1.prisma.listItem.update({
                where: { id: itemId },
                data: {
                    product_name: (_c = input.productName) !== null && _c !== void 0 ? _c : current.product_name,
                    quantity,
                    unit_price: unitPrice,
                    total_price: round(quantity * unitPrice),
                    checked: (_d = input.checked) !== null && _d !== void 0 ? _d : current.checked,
                    barcode: input.barcode !== undefined ? input.barcode : current.barcode,
                },
            });
            yield shoppingListService.calculateTotalValue(item.listId);
            return item;
        });
    }
    deleteItem(itemId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield this.getItemWithAccess(itemId, userId, true);
            yield prisma_1.prisma.listItem.delete({ where: { id: itemId } });
            yield shoppingListService.calculateTotalValue(item.listId);
            return item;
        });
    }
}
exports.ListItemService = ListItemService;
