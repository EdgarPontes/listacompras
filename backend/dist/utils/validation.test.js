"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = require("./validation");
describe('validation', () => {
    it('rejeita string vazia', () => {
        expect(() => (0, validation_1.requireString)('', 'nome')).toThrow();
        expect(() => (0, validation_1.requireString)('   ', 'nome')).toThrow();
    });
    it('valida e-mail', () => {
        expect((0, validation_1.requireString)('a@b.com', 'email', { email: true })).toBe('a@b.com');
        expect(() => (0, validation_1.requireString)('invalido', 'email', { email: true })).toThrow();
    });
    it('converte números e respeita limites', () => {
        expect((0, validation_1.requireNumber)('2.5', 'quantidade')).toBe(2.5);
        expect((0, validation_1.requireNumber)(3, 'quantidade')).toBe(3);
        expect(() => (0, validation_1.requireNumber)('0', 'quantidade', { min: 1 })).toThrow();
        expect(() => (0, validation_1.requireNumber)('1.5', 'quantidade', { integer: true })).toThrow();
        expect(() => (0, validation_1.requireNumber)('abc', 'quantidade')).toThrow();
    });
    it('valida enums', () => {
        expect((0, validation_1.requireEnum)('edit', 'permissions', ['view', 'edit'])).toBe('edit');
        expect(() => (0, validation_1.requireEnum)('admin', 'permissions', ['view', 'edit'])).toThrow();
    });
    it('trata campos opcionais', () => {
        expect((0, validation_1.optionalString)('   ', 'barcode')).toBeUndefined();
        expect((0, validation_1.optionalString)(' abc ', 'barcode')).toBe('abc');
        expect((0, validation_1.optionalBoolean)(true, 'checked')).toBe(true);
        expect(() => (0, validation_1.optionalBoolean)('true', 'checked')).toThrow();
    });
});
