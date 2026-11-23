/**
 * Declarações mínimas dos globals do Jest para que o `tsc` e o `next build`
 * entendam os arquivos de teste sem depender de `@types/jest`.
 * Os tipos vêm do pacote `@jest/globals`, já instalado junto com o Jest 30.
 */
declare global {
  const describe: typeof import('@jest/globals').describe;
  const it: typeof import('@jest/globals').it;
  const test: typeof import('@jest/globals').test;
  const expect: typeof import('@jest/globals').expect;
  const beforeEach: typeof import('@jest/globals').beforeEach;
  const afterEach: typeof import('@jest/globals').afterEach;
  const beforeAll: typeof import('@jest/globals').beforeAll;
  const afterAll: typeof import('@jest/globals').afterAll;
  const jest: typeof import('@jest/globals').jest;
}

export {};
