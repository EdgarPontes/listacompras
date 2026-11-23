import { NextFunction, Request, Response } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Rate limiter simples em memória (suficiente para uma instância única).
 * Para múltiplas instâncias em produção, use um store compartilhado.
 */
export function rateLimit({ windowMs, max, message, keyGenerator }: RateLimitOptions) {
  const buckets = new Map<string, Bucket>();

  // Limpeza periódica para evitar crescimento indefinido do Map.
  const cleaner = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, windowMs);
  cleaner.unref?.();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator
      ? keyGenerator(req)
      : (req.ip ?? req.socket.remoteAddress ?? 'unknown');
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (bucket.count >= max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({
        error: message ?? 'Muitas requisições. Tente novamente mais tarde.',
      });
    }

    bucket.count += 1;
    return next();
  };
}
