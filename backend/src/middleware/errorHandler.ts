import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors';

interface PrismaLikeError {
  code?: string;
  message?: string;
}

function mapPrismaError(code: string): { status: number; message: string } | null {
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

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  const prismaError = mapPrismaError((err as PrismaLikeError)?.code ?? '');
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
