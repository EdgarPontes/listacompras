"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnprocessableEntityError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.AppError = void 0;
/**
 * Erros de aplicação com status HTTP associado.
 * O middleware central de erros transforma estas classes em respostas JSON.
 */
class AppError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
    }
}
exports.AppError = AppError;
class BadRequestError extends AppError {
    constructor(message = 'Requisição inválida.') {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends AppError {
    constructor(message = 'Não autenticado.') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Acesso negado.') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message = 'Recurso não encontrado.') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = 'Recurso já existe.') {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
class UnprocessableEntityError extends AppError {
    constructor(message = 'Dados inválidos.') {
        super(message, 422);
    }
}
exports.UnprocessableEntityError = UnprocessableEntityError;
