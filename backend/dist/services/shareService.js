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
exports.ShareService = void 0;
const prisma_1 = require("../lib/prisma");
const errors_1 = require("../errors");
class ShareService {
    shareList(listId, requesterId, sharedWithUserId, permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield prisma_1.prisma.shoppingList.findUnique({
                where: { id: listId },
                select: { userId: true },
            });
            if (!list) {
                throw new errors_1.NotFoundError('Lista não encontrada.');
            }
            if (list.userId !== requesterId) {
                throw new errors_1.ForbiddenError('Apenas o proprietário pode compartilhar esta lista.');
            }
            if (sharedWithUserId === requesterId) {
                throw new errors_1.BadRequestError('Você não pode compartilhar uma lista com você mesmo.');
            }
            const target = yield prisma_1.prisma.user.findUnique({
                where: { id: sharedWithUserId },
                select: { id: true },
            });
            if (!target) {
                throw new errors_1.NotFoundError('Usuário de destino não encontrado.');
            }
            const existing = yield prisma_1.prisma.sharedList.findFirst({
                where: { listId, sharedWithUserId },
            });
            if (existing) {
                return prisma_1.prisma.sharedList.update({
                    where: { id: existing.id },
                    data: { permissions },
                });
            }
            return prisma_1.prisma.sharedList.create({
                data: { listId, sharedWithUserId, permissions },
            });
        });
    }
    getSharedLists(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.sharedList.findMany({
                where: { sharedWithUserId: userId },
                include: { list: { include: { items: true } } },
            });
        });
    }
    removeShare(listId, requesterId, sharedWithUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield prisma_1.prisma.shoppingList.findUnique({
                where: { id: listId },
                select: { userId: true },
            });
            if (!list) {
                throw new errors_1.NotFoundError('Lista não encontrada.');
            }
            if (list.userId !== requesterId) {
                throw new errors_1.ForbiddenError('Apenas o proprietário pode remover o compartilhamento.');
            }
            return prisma_1.prisma.sharedList.deleteMany({ where: { listId, sharedWithUserId } });
        });
    }
}
exports.ShareService = ShareService;
