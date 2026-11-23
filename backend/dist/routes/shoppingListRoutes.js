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
const validation_1 = require("../utils/validation");
const router = (0, express_1.Router)();
const shoppingListService = new shoppingListService_1.ShoppingListService();
router.use(authMiddleware_1.authMiddleware);
function parseItems(raw) {
    if (raw === undefined || raw === null)
        return [];
    return (0, validation_1.requireArray)(raw, 'items').map((entry, index) => {
        var _a, _b, _c;
        const item = (entry !== null && entry !== void 0 ? entry : {});
        return {
            productName: (0, validation_1.requireString)(item.productName, `items[${index}].productName`, { max: 200 }),
            barcode: (_a = (0, validation_1.optionalString)(item.barcode, `items[${index}].barcode`)) !== null && _a !== void 0 ? _a : null,
            quantity: (0, validation_1.requireNumber)((_b = item.quantity) !== null && _b !== void 0 ? _b : 1, `items[${index}].quantity`, {
                min: 1,
                integer: true,
            }),
            unitPrice: (0, validation_1.requireNumber)((_c = item.unitPrice) !== null && _c !== void 0 ? _c : 0, `items[${index}].unitPrice`, { min: 0 }),
        };
    });
}
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const lists = yield shoppingListService.getLists(req.userId);
    res.json(lists);
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const list = yield shoppingListService.getListById(req.params.id, req.userId);
    res.json(list);
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const title = (0, validation_1.requireString)((_a = req.body) === null || _a === void 0 ? void 0 : _a.title, 'title', { min: 1, max: 120 });
    const items = parseItems((_b = req.body) === null || _b === void 0 ? void 0 : _b.items);
    const list = yield shoppingListService.createList(title, req.userId, items);
    res.status(201).json(list);
}));
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const title = (0, validation_1.requireString)((_a = req.body) === null || _a === void 0 ? void 0 : _a.title, 'title', { min: 1, max: 120 });
    const list = yield shoppingListService.updateList(req.params.id, title, req.userId);
    res.json(list);
}));
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield shoppingListService.deleteList(req.params.id, req.userId);
    res.sendStatus(204);
}));
exports.default = router;
