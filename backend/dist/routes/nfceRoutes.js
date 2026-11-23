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
const errors_1 = require("../errors");
const validation_1 = require("../utils/validation");
const router = (0, express_1.Router)();
const parser = new nfceParserService_1.NfceParserService();
const MAX_HTML_BYTES = 5000000;
function assertAllowedCouponUrl(raw) {
    let parsed;
    try {
        parsed = new URL(raw);
    }
    catch (_a) {
        throw new errors_1.BadRequestError('URL do cupom inválida.');
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new errors_1.BadRequestError('A URL do cupom deve usar http ou https.');
    }
    const host = parsed.hostname.toLowerCase();
    const isPrivateHost = host === 'localhost' ||
        host === '::1' ||
        host === '0.0.0.0' ||
        /^127\./.test(host) ||
        /^10\./.test(host) ||
        /^192\.168\./.test(host) ||
        /^169\.254\./.test(host) ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(host);
    if (isPrivateHost) {
        throw new errors_1.BadRequestError('Host não permitido.');
    }
    return parsed.toString();
}
// POST /api/nfce/parse-nfce
// Body: { html?: string, url?: string }
router.post('/parse-nfce', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const html = (0, validation_1.optionalString)((_a = req.body) === null || _a === void 0 ? void 0 : _a.html, 'html');
    const url = (0, validation_1.optionalString)((_b = req.body) === null || _b === void 0 ? void 0 : _b.url, 'url');
    if (!html && !url) {
        throw new errors_1.BadRequestError('Envie "html" ou "url" no corpo da requisição.');
    }
    if (html && Buffer.byteLength(html, 'utf8') > MAX_HTML_BYTES) {
        throw new errors_1.BadRequestError('HTML muito grande (limite de 5 MB).');
    }
    const result = html
        ? yield parser.parseFromHtml(html)
        : yield parser.parseFromUrl(assertAllowedCouponUrl(url));
    // Validação básica de aceite dos campos numéricos.
    const numericOk = Array.isArray(result.produtos) &&
        result.produtos.every(produto => (produto.quantidade == null || typeof produto.quantidade === 'number') &&
            (produto.valor_unitario == null || typeof produto.valor_unitario === 'number') &&
            (produto.valor_total == null || typeof produto.valor_total === 'number'));
    if (!numericOk) {
        return res.status(422).json({
            error: 'Falha na conversão numérica de um ou mais produtos.',
            result,
        });
    }
    return res.json(result);
}));
exports.default = router;
