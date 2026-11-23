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
const validation_1 = require("../utils/validation");
const router = (0, express_1.Router)({ mergeParams: true });
const listItemService = new listItemService_1.ListItemService();
router.use(authMiddleware_1.authMiddleware);
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const items = yield listItemService.getItems(req.params.listId, req.userId);
    res.json(items);
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const productName = (0, validation_1.requireString)((_a = req.body) === null || _a === void 0 ? void 0 : _a.productName, 'productName', { max: 200 });
    const quantity = (0, validation_1.requireNumber)((_c = (_b = req.body) === null || _b === void 0 ? void 0 : _b.quantity) !== null && _c !== void 0 ? _c : 1, 'quantity', {
        min: 1,
        integer: true,
    });
    const unitPrice = (0, validation_1.requireNumber)((_e = (_d = req.body) === null || _d === void 0 ? void 0 : _d.unitPrice) !== null && _e !== void 0 ? _e : 0, 'unitPrice', { min: 0 });
    const barcode = (_g = (0, validation_1.optionalString)((_f = req.body) === null || _f === void 0 ? void 0 : _f.barcode, 'barcode')) !== null && _g !== void 0 ? _g : null;
    const item = yield listItemService.createItem(req.params.listId, req.userId, {
        productName,
        quantity,
        unitPrice,
        barcode,
    });
    res.status(201).json(item);
}));
router.put('/:itemId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const input = {
        productName: (0, validation_1.optionalString)((_a = req.body) === null || _a === void 0 ? void 0 : _a.productName, 'productName'),
        quantity: (0, validation_1.optionalNumber)((_b = req.body) === null || _b === void 0 ? void 0 : _b.quantity, 'quantity', { min: 1, integer: true }),
        unitPrice: (0, validation_1.optionalNumber)((_c = req.body) === null || _c === void 0 ? void 0 : _c.unitPrice, 'unitPrice', { min: 0 }),
        checked: (0, validation_1.optionalBoolean)((_d = req.body) === null || _d === void 0 ? void 0 : _d.checked, 'checked'),
    };
    // Permite limpar o código de barras enviando `barcode: ""` ou `null`.
    if (((_e = req.body) === null || _e === void 0 ? void 0 : _e.barcode) === null || ((_f = req.body) === null || _f === void 0 ? void 0 : _f.barcode) === '') {
        input.barcode = null;
    }
    else {
        const barcode = (0, validation_1.optionalString)((_g = req.body) === null || _g === void 0 ? void 0 : _g.barcode, 'barcode');
        if (barcode !== undefined)
            input.barcode = barcode;
    }
    const item = yield listItemService.updateItem(req.params.itemId, req.userId, input);
    res.json(item);
}));
router.delete('/:itemId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield listItemService.deleteItem(req.params.itemId, req.userId);
    res.sendStatus(204);
}));
exports.default = router;
