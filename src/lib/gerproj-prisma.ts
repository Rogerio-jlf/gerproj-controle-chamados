import { PrismaClient } from '../../generated/gerproj';

const globalForGerproj = globalThis as unknown as {
  gerprojPrisma?: PrismaClient;
};

export const gerprojPrisma =
  globalForGerproj.gerprojPrisma ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForGerproj.gerprojPrisma = gerprojPrisma;
}
