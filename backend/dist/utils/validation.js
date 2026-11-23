"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireString = requireString;
exports.optionalString = optionalString;
exports.requireNumber = requireNumber;
exports.optionalNumber = optionalNumber;
exports.optionalBoolean = optionalBoolean;
exports.requireEnum = requireEnum;
exports.requireArray = requireArray;
const errors_1 = require("../errors");
function requireString(value, field, options = {}) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new errors_1.UnprocessableEntityError(`O campo "${field}" é obrigatório.`);
    }
    const trimmed = value.trim();
    if (options.min !== undefined && trimmed.length < options.min) {
        throw new errors_1.UnprocessableEntityError(`O campo "${field}" deve ter no mínimo ${options.min} caracteres.`);
    }
    if (options.max !== undefined && trimmed.length > options.max) {
        throw new errors_1.UnprocessableEntityError(`O campo "${field}" deve ter no máximo ${options.max} caracteres.`);
    }
    if (options.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        throw new errors_1.UnprocessableEntityError(`O campo "${field}" deve ser um e-mail válido.`);
    }
    return trimmed;
}
function optionalString(value, field) {
    if (value === undefined || value === null)
        return undefined;
    if (typeof value !== 'string') {
        throw new errors_1.UnprocessableEntityError(`O campo "${field}" deve ser um texto.`);
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}
function requireNumber(value, field, options = {}) {
    const num = typeof value === 'number'
        ? value
        : typeof value === 'string' && value.trim() !== ''
            ? Number(value)
            : NaN;
    if (!Number.isFinite(num)) {
        throw new errors_1.UnprocessableEntityError(`O campo "${field}" deve ser um número válido.`);
    }
    if (options.integer && !Number.isInteger(num)) {
        throw new errors_1.UnprocessableEntityError(`O campo "${field}" deve ser um número inteiro.`);
    }
    if (options.min !== undefined && num < options.min) {
        throw new errors_1.UnprocessableEntityError(`O campo "${field}" deve ser maior ou igual a ${options.min}.`);
    }
    if (options.max !== undefined && num > options.max) {
        throw new errors_1.UnprocessableEntityError(`O campo "${field}" deve ser menor ou igual a ${options.max}.`);
    }
    return num;
}
function optionalNumber(value, field, options = {}) {
    if (value === undefined || value === null || value === '')
        return undefined;
    return requireNumber(value, field, options);
}
function optionalBoolean(value, field) {
    if (value === undefined || value === null)
        return undefined;
    if (typeof value !== 'boolean') {
        throw new errors_1.UnprocessableEntityError(`O campo "${field}" deve ser booleano.`);
    }
    return value;
}
function requireEnum(value, field, allowed) {
    if (typeof value !== 'string' || !allowed.includes(value)) {
        throw new errors_1.UnprocessableEntityError(`O campo "${field}" deve ser um dos valores: ${allowed.join(', ')}.`);
    }
    return value;
}
function requireArray(value, field) {
    if (!Array.isArray(value)) {
        throw new errors_1.UnprocessableEntityError(`O campo "${field}" deve ser uma lista.`);
    }
    return value;
}
