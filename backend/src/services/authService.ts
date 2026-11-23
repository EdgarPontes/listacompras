import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AppError, ConflictError, UnauthorizedError } from '../errors';

// Nunca expor password_hash nas respostas.
const SAFE_USER_SELECT = {
  id: true,
  email: true,
  created_at: true,
} as const;

export class AuthService {
  async register(email: string, password: string) {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictError('Já existe uma conta com este e-mail.');
    }

    const password_hash = await bcrypt.hash(password, 10);

    return prisma.user.create({
      data: { email, password_hash },
      select: SAFE_USER_SELECT,
    });
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Mensagem genérica para não revelar se o e-mail existe.
    if (!user) {
      throw new UnauthorizedError('E-mail ou senha inválidos.');
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      throw new UnauthorizedError('E-mail ou senha inválidos.');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError('Configuração de autenticação ausente.', 500);
    }

    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });

    return {
      user: { id: user.id, email: user.email, created_at: user.created_at },
      token,
    };
  }

  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });
  }
}
