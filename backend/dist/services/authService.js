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
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
class AuthService {
    register(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const user = yield prisma.user.create({
                data: {
                    email,
                    password_hash: hashedPassword,
                },
            });
            return user;
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                throw new Error('User not found');
            }
            const passwordMatch = yield bcrypt_1.default.compare(password, user.password_hash);
            if (!passwordMatch) {
                throw new Error('Invalid password');
            }
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });
            return { user, token };
        });
    }
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.user.findUnique({
                where: { email },
            });
        });
    }
}
exports.AuthService = AuthService;
