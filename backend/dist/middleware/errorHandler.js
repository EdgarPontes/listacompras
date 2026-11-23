"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const errors_1 = require("../errors");
function mapPrismaError(code) {
    switch (code) {
        case 'P2002':
            return { status: 409, message: 'Já existe um registro com estes dados.' };
        case 'P2003':
            return { status: 409, message: 'A operação viola uma restrição de integridade.' };
        case 'P2025':
            return { status: 404, message: 'Registro não encontrado.' };
        default:
            return null;
    }
}
function notFoundHandler(req, res) {
    res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
}
function errorHandler(err, _req, res, next) {
    var _a;
    if (res.headersSent) {
        return next(err);
    }
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json({ error: err.message });
    }
    const prismaError = mapPrismaError((_a = err === null || err === void 0 ? void 0 : err.code) !== null && _a !== void 0 ? _a : '');
    if (prismaError) {
        return res.status(prismaError.status).json({ error: prismaError.message });
    }
    // Erros de JSON malformado no body (express.json)
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ error: 'Corpo da requisição não é um JSON válido.' });
    }
    console.error('Erro inesperado:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
}
