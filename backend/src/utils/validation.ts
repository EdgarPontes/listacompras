import { UnprocessableEntityError } from '../errors';

export interface StringOptions {
  min?: number;
  max?: number;
  email?: boolean;
}

export interface NumberOptions {
  min?: number;
  max?: number;
  integer?: boolean;
}

export function requireString(value: unknown, field: string, options: StringOptions = {}): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new UnprocessableEntityError(`O campo "${field}" é obrigatório.`);
  }

  const trimmed = value.trim();

  if (options.min !== undefined && trimmed.length < options.min) {
    throw new UnprocessableEntityError(
      `O campo "${field}" deve ter no mínimo ${options.min} caracteres.`
    );
  }

  if (options.max !== undefined && trimmed.length > options.max) {
    throw new UnprocessableEntityError(
      `O campo "${field}" deve ter no máximo ${options.max} caracteres.`
    );
  }

  if (options.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new UnprocessableEntityError(`O campo "${field}" deve ser um e-mail válido.`);
  }

  return trimmed;
}

export function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') {
    throw new UnprocessableEntityError(`O campo "${field}" deve ser um texto.`);
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function requireNumber(value: unknown, field: string, options: NumberOptions = {}): number {
  const num =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : NaN;

  if (!Number.isFinite(num)) {
    throw new UnprocessableEntityError(`O campo "${field}" deve ser um número válido.`);
  }

  if (options.integer && !Number.isInteger(num)) {
    throw new UnprocessableEntityError(`O campo "${field}" deve ser um número inteiro.`);
  }

  if (options.min !== undefined && num < options.min) {
    throw new UnprocessableEntityError(
      `O campo "${field}" deve ser maior ou igual a ${options.min}.`
    );
  }

  if (options.max !== undefined && num > options.max) {
    throw new UnprocessableEntityError(
      `O campo "${field}" deve ser menor ou igual a ${options.max}.`
    );
  }

  return num;
}

export function optionalNumber(
  value: unknown,
  field: string,
  options: NumberOptions = {}
): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return requireNumber(value, field, options);
}

export function optionalBoolean(value: unknown, field: string): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'boolean') {
    throw new UnprocessableEntityError(`O campo "${field}" deve ser booleano.`);
  }
  return value;
}

export function requireEnum<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[]
): T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new UnprocessableEntityError(
      `O campo "${field}" deve ser um dos valores: ${allowed.join(', ')}.`
    );
  }
  return value as T;
}

export function requireArray<T = unknown>(value: unknown, field: string): T[] {
  if (!Array.isArray(value)) {
    throw new UnprocessableEntityError(`O campo "${field}" deve ser uma lista.`);
  }
  return value as T[];
}
