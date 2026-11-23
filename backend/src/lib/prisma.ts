import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Garante que as variáveis de ambiente estejam carregadas antes de criar o client.
dotenv.config({ quiet: true });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

// Evita múltiplas instâncias durante o hot-reload em desenvolvimento.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
