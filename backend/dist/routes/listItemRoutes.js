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
const listItemService_1 = require("../services/listItemService");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)({ mergeParams: true });
const listItemService = new listItemService_1.ListItemService();
router.use(authMiddleware_1.authMiddleware);
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield listItemService.getItems(req.params.listId);
        res.json(items);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productName, quantity, unitPrice, barcode } = req.body;
        const item = yield listItemService.createItem(req.params.listId, productName, quantity, unitPrice, barcode);
        res.status(201).json(item);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
router.put('/:itemId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productName, quantity, unitPrice, checked } = req.body;
        const item = yield listItemService.updateItem(req.params.itemId, productName, quantity, unitPrice, checked);
        res.json(item);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
router.delete('/:itemId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield listItemService.deleteItem(req.params.itemId);
        res.sendStatus(204);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
exports.default = router;
