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
const authService_1 = require("../services/authService");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rateLimit_1 = require("../middleware/rateLimit");
const validation_1 = require("../utils/validation");
const router = (0, express_1.Router)();
const authService = new authService_1.AuthService();
const authLimiter = (0, rateLimit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: 'Muitas tentativas de autenticação. Aguarde alguns minutos.',
    // Limita por e-mail (protege contra força bruta por conta) e,
    // na ausência de e-mail, por IP.
    keyGenerator: req => {
        var _a, _b;
        const email = typeof ((_a = req.body) === null || _a === void 0 ? void 0 : _a.email) === 'string' ? req.body.email.trim().toLowerCase() : '';
        return email ? `email:${email}` : `ip:${(_b = req.ip) !== null && _b !== void 0 ? _b : 'unknown'}`;
    },
});
router.post('/register', authLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const email = (0, validation_1.requireString)((_a = req.body) === null || _a === void 0 ? void 0 : _a.email, 'email', { email: true, max: 254 });
    const password = (0, validation_1.requireString)((_b = req.body) === null || _b === void 0 ? void 0 : _b.password, 'password', { min: 6, max: 128 });
    const user = yield authService.register(email, password);
    res.status(201).json(user);
}));
router.post('/login', authLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const email = (0, validation_1.requireString)((_a = req.body) === null || _a === void 0 ? void 0 : _a.email, 'email', { email: true, max: 254 });
    const password = (0, validation_1.requireString)((_b = req.body) === null || _b === void 0 ? void 0 : _b.password, 'password', { min: 1, max: 128 });
    const { user, token } = yield authService.login(email, password);
    res.json({ user, token });
}));
// Busca usada pelo fluxo de compartilhamento. Requer autenticação e
// retorna apenas dados públicos do usuário (sem password_hash).
router.get('/users', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = (0, validation_1.requireString)(req.query.email, 'email', { email: true, max: 254 });
    const user = yield authService.getUserByEmail(email);
    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    return res.json(user);
}));
exports.default = router;
