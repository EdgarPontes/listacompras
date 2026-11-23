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
const prisma_1 = require("../lib/prisma");
const errors_1 = require("../errors");
function round(value) {
    return Math.round(value * 100) / 100;
}
class ShoppingListService {
    /**
     * Retorna as listas do usuário (próprias + compartilhadas com ele),
     * com o campo `permission` indicando o nível de acesso.
     */
    getLists(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [owned, shared] = yield Promise.all([
                prisma_1.prisma.shoppingList.findMany({ where: { userId } }),
                prisma_1.prisma.sharedList.findMany({
                    where: { sharedWithUserId: userId },
                    include: { list: true },
                }),
            ]);
            return [
                ...owned.map(list => (Object.assign(Object.assign({}, list), { permission: 'owner' }))),
                ...shared.map(share => (Object.assign(Object.assign({}, share.list), { permission: share.permissions }))),
            ];
        });
    }
    /**
     * Garante que o usuário pode acessar a lista.
     * `requireEdit` exige permissão de edição em listas compartilhadas.
     */
    assertListAccess(listId_1, userId_1) {
        return __awaiter(this, arguments, void 0, function* (listId, userId, requireEdit = false) {
            const list = yield prisma_1.prisma.shoppingList.findUnique({
                where: { id: listId },
                include: { sharedWith: true },
            });
            if (!list) {
                throw new errors_1.NotFoundError('Lista não encontrada.');
            }
            if (list.userId === userId) {
                return list;
            }
            const share = list.sharedWith.find(item => item.sharedWithUserId === userId);
            if (!share) {
                // Não revela a existência da lista para quem não tem acesso.
                throw new errors_1.NotFoundError('Lista não encontrada.');
            }
            if (requireEdit && share.permissions !== 'edit') {
                throw new errors_1.ForbiddenError('Você não tem permissão para editar esta lista.');
            }
            return list;
        });
    }
    getListById(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const access = yield this.assertListAccess(id, userId, false);
            const list = yield prisma_1.prisma.shoppingList.findUnique({
                where: { id },
                include: { items: true },
            });
            if (!list)
                return null;
            const permission = access.userId === userId
                ? 'owner'
                : (_b = (_a = access.sharedWith.find(share => share.sharedWithUserId === userId)) === null || _a === void 0 ? void 0 : _a.permissions) !== null && _b !== void 0 ? _b : 'view';
            return Object.assign(Object.assign({}, list), { permission });
        });
    }
    createList(title_1, userId_1) {
        return __awaiter(this, arguments, void 0, function* (title, userId, items = []) {
            const totalValue = round(items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0));
            return prisma_1.prisma.shoppingList.create({
                data: {
                    title,
                    userId,
                    total_value: totalValue,
                    items: {
                        create: items.map(item => {
                            var _a;
                            return ({
                                product_name: item.productName,
                                barcode: (_a = item.barcode) !== null && _a !== void 0 ? _a : null,
                                quantity: item.quantity,
                                unit_price: item.unitPrice,
                                total_price: round(item.quantity * item.unitPrice),
                            });
                        }),
                    },
                },
                include: { items: true },
            });
        });
    }
    updateList(id, title, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.assertListAccess(id, userId, true);
            return prisma_1.prisma.shoppingList.update({
                where: { id },
                data: { title },
            });
        });
    }
    deleteList(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield prisma_1.prisma.shoppingList.findUnique({
                where: { id },
                select: { userId: true },
            });
            if (!list) {
                throw new errors_1.NotFoundError('Lista não encontrada.');
            }
            if (list.userId !== userId) {
                throw new errors_1.ForbiddenError('Apenas o proprietário pode excluir esta lista.');
            }
            // Remove dependências explicitamente para funcionar mesmo em bancos
            // onde a migration de ON DELETE CASCADE ainda não foi aplicada.
            return prisma_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                yield tx.sharedList.deleteMany({ where: { listId: id } });
                yield tx.listItem.deleteMany({ where: { listId: id } });
                return tx.shoppingList.delete({ where: { id } });
            }));
        });
    }
    calculateTotalValue(listId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const aggregate = yield prisma_1.prisma.listItem.aggregate({
                where: { listId },
                _sum: { total_price: true },
            });
            return prisma_1.prisma.shoppingList.update({
                where: { id: listId },
                data: { total_value: round((_a = aggregate._sum.total_price) !== null && _a !== void 0 ? _a : 0) },
            });
        });
    }
}
exports.ShoppingListService = ShoppingListService;
