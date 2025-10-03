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
const shoppingListService_1 = require("../services/shoppingListService");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const shoppingListService = new shoppingListService_1.ShoppingListService();
router.use(authMiddleware_1.authMiddleware);
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lists = yield shoppingListService.getLists(req.userId);
        res.json(lists);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const list = yield shoppingListService.getListById(req.params.id, req.userId);
        res.json(list);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, items } = req.body;
        const list = yield shoppingListService.createList(title, req.userId, items);
        res.status(201).json(list);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title } = req.body;
        yield shoppingListService.updateList(req.params.id, title, req.userId);
        res.sendStatus(204);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield shoppingListService.deleteList(req.params.id, req.userId);
        res.sendStatus(204);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
exports.default = router;
