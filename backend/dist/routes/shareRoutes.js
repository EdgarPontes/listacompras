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
const express_1 = require("express");
const shareService_1 = require("../services/shareService");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validation_1 = require("../utils/validation");
const router = (0, express_1.Router)();
const shareService = new shareService_1.ShareService();
router.use(authMiddleware_1.authMiddleware);
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const listId = (0, validation_1.requireString)((_a = req.body) === null || _a === void 0 ? void 0 : _a.listId, 'listId');
    const sharedWithUserId = (0, validation_1.requireString)((_b = req.body) === null || _b === void 0 ? void 0 : _b.sharedWithUserId, 'sharedWithUserId');
    const permissions = (0, validation_1.requireEnum)((_c = req.body) === null || _c === void 0 ? void 0 : _c.permissions, 'permissions', ['view', 'edit']);
    const sharedList = yield shareService.shareList(listId, req.userId, sharedWithUserId, permissions);
    res.status(201).json(sharedList);
}));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sharedLists = yield shareService.getSharedLists(req.userId);
    res.json(sharedLists);
}));
router.delete('/:listId/:sharedWithUserId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield shareService.removeShare(req.params.listId, req.userId, req.params.sharedWithUserId);
    res.sendStatus(204);
}));
exports.default = router;
