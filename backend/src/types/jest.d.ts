/**
 * Declarações mínimas dos globals do Jest para o backend.
 * Evita depender de `@types/jest` no type-check do projeto.
 */
declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void | Promise<void>) => void;
declare const test: typeof it;
declare const beforeEach: (fn: () => void | Promise<void>) => void;
declare const afterEach: (fn: () => void | Promise<void>) => void;

interface JestMatchers {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
  toBeUndefined(): void;
  toBeNull(): void;
  toThrow(message?: string): void;
  toBeInstanceOf(ctor: unknown): void;
}

declare const expect: (actual: unknown) => JestMatchers;
