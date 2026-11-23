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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const validation_1 = require("../utils/validation");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
const EAN_PICTURES_BASES = [
    'https://www.eanpictures.com.br:9000/api/desc',
    'http://www.eanpictures.com.br:9000/api/desc',
];
// GET /api/products/barcode/:barcode
// Consulta os dados de um produto a partir do código de barras (EAN).
router.get('/barcode/:barcode', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const barcode = (0, validation_1.requireString)(req.params.barcode, 'barcode', { min: 6, max: 20 });
    for (const base of EAN_PICTURES_BASES) {
        try {
            const response = yield axios_1.default.get(`${base}/${encodeURIComponent(barcode)}`, {
                timeout: 8000,
                headers: { Accept: 'application/json' },
            });
            if (response.status === 200) {
                return res.json(response.data);
            }
        }
        catch (error) {
            // Tenta o próximo endereço (https -> http).
            console.error(`Falha ao consultar eanpictures (${base}):`, error.message);
        }
    }
    return res
        .status(502)
        .json({ error: 'Não foi possível consultar os dados do produto.' });
}));
exports.default = router;
