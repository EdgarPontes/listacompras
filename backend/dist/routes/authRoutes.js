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
const router = (0, express_1.Router)();
const authService = new authService_1.AuthService();
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield authService.register(email, password);
        res.status(201).json(user);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const { user, token } = yield authService.login(email, password);
        res.json({ user, token });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
router.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        const user = yield authService.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
exports.default = router;
