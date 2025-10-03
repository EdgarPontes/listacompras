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
const nfceParserService_1 = require("../services/nfceParserService");
const router = (0, express_1.Router)();
const parser = new nfceParserService_1.NfceParserService();
// POST /api/nfce/parse-nfce
// Body: { html?: string, url?: string }
router.post('/parse-nfce', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { html, url } = req.body || {};
        if (!html && !url) {
            return res.status(400).json({ error: 'Send either "html" or "url" in the request body.' });
        }
        const result = html
            ? yield parser.parseFromHtml(html)
            : yield parser.parseFromUrl(url);
        // Basic acceptance validations
        const numericOk = Array.isArray(result.produtos)
            && result.produtos.every(p => ((p.quantidade == null || typeof p.quantidade === 'number') &&
                (p.valor_unitario == null || typeof p.valor_unitario === 'number') &&
                (p.valor_total == null || typeof p.valor_total === 'number')));
        if (!numericOk) {
            return res.status(422).json({ error: 'Numeric conversion failed for one or more products', result });
        }
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
