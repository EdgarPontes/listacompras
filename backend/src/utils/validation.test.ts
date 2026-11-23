import {
  requireString,
  requireNumber,
  requireEnum,
  optionalString,
  optionalBoolean,
} from './validation';

describe('validation', () => {
  it('rejeita string vazia', () => {
    expect(() => requireString('', 'nome')).toThrow();
    expect(() => requireString('   ', 'nome')).toThrow();
  });

  it('valida e-mail', () => {
    expect(requireString('a@b.com', 'email', { email: true })).toBe('a@b.com');
    expect(() => requireString('invalido', 'email', { email: true })).toThrow();
  });

  it('converte números e respeita limites', () => {
    expect(requireNumber('2.5', 'quantidade')).toBe(2.5);
    expect(requireNumber(3, 'quantidade')).toBe(3);
    expect(() => requireNumber('0', 'quantidade', { min: 1 })).toThrow();
    expect(() => requireNumber('1.5', 'quantidade', { integer: true })).toThrow();
    expect(() => requireNumber('abc', 'quantidade')).toThrow();
  });

  it('valida enums', () => {
    expect(requireEnum('edit', 'permissions', ['view', 'edit'] as const)).toBe('edit');
    expect(() => requireEnum('admin', 'permissions', ['view', 'edit'] as const)).toThrow();
  });

  it('trata campos opcionais', () => {
    expect(optionalString('   ', 'barcode')).toBeUndefined();
    expect(optionalString(' abc ', 'barcode')).toBe('abc');
    expect(optionalBoolean(true, 'checked')).toBe(true);
    expect(() => optionalBoolean('true', 'checked')).toThrow();
  });
});
