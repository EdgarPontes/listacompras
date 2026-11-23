import { NextFunction, Request, Response } from 'express';

/**
 * CORS restrito aos origins configurados em CORS_ORIGINS.
 * Ex.: CORS_ORIGINS="http://localhost:3000,https://meuapp.com"
 */
export function corsMiddleware(allowedOrigins: string[]) {
  const allowAll = allowedOrigins.includes('*');

  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;

    if (origin && (allowAll || allowedOrigins.includes(origin))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    return next();
  };
}
