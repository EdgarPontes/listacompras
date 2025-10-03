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
const router = (0, express_1.Router)();
const shareService = new shareService_1.ShareService();
router.use(authMiddleware_1.authMiddleware);
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { listId, sharedWithUserId, permissions } = req.body;
        const sharedList = yield shareService.shareList(listId, sharedWithUserId, permissions);
        res.status(201).json(sharedList);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sharedLists = yield shareService.getSharedLists(req.userId);
        res.json(sharedLists);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
exports.default = router;
