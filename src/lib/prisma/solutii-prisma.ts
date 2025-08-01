import { PrismaClient } from '../../../generated/solutii';

const globalForSolutii = globalThis as unknown as {
  solutiiPrisma?: PrismaClient;
};

export const solutiiPrisma =
  globalForSolutii.solutiiPrisma ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForSolutii.solutiiPrisma = solutiiPrisma;
}
