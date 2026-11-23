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
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const errors_1 = require("../errors");
// Nunca expor password_hash nas respostas.
const SAFE_USER_SELECT = {
    id: true,
    email: true,
    created_at: true,
};
class AuthService {
    register(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield prisma_1.prisma.user.findUnique({
                where: { email },
                select: { id: true },
            });
            if (existing) {
                throw new errors_1.ConflictError('Já existe uma conta com este e-mail.');
            }
            const password_hash = yield bcrypt_1.default.hash(password, 10);
            return prisma_1.prisma.user.create({
                data: { email, password_hash },
                select: SAFE_USER_SELECT,
            });
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.prisma.user.findUnique({ where: { email } });
            // Mensagem genérica para não revelar se o e-mail existe.
            if (!user) {
                throw new errors_1.UnauthorizedError('E-mail ou senha inválidos.');
            }
            const passwordMatch = yield bcrypt_1.default.compare(password, user.password_hash);
            if (!passwordMatch) {
                throw new errors_1.UnauthorizedError('E-mail ou senha inválidos.');
            }
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new errors_1.AppError('Configuração de autenticação ausente.', 500);
            }
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, secret, { expiresIn: '1h' });
            return {
                user: { id: user.id, email: user.email, created_at: user.created_at },
                token,
            };
        });
    }
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.user.findUnique({
                where: { email },
                select: { id: true, email: true },
            });
        });
    }
}
exports.AuthService = AuthService;
